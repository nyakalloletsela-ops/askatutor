
-- 1. whiteboards: one per session
CREATE TABLE public.whiteboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES public.sessions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whiteboards TO authenticated;
GRANT ALL ON public.whiteboards TO service_role;
ALTER TABLE public.whiteboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read whiteboards"
  ON public.whiteboards FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = whiteboards.session_id
      AND public.can_access_classroom_room(s.room_id)
  ));
CREATE POLICY "Members can upsert whiteboards"
  ON public.whiteboards FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = whiteboards.session_id
      AND public.can_access_classroom_room(s.room_id)
  ));
CREATE POLICY "Members can update whiteboards"
  ON public.whiteboards FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.sessions s
    WHERE s.id = whiteboards.session_id
      AND public.can_access_classroom_room(s.room_id)
  ));

CREATE TRIGGER whiteboards_touch BEFORE UPDATE ON public.whiteboards
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2. whiteboard_mutations: realtime stream
CREATE TABLE public.whiteboard_mutations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whiteboard_id uuid NOT NULL REFERENCES public.whiteboards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  mutation_type text NOT NULL,
  mutation_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX whiteboard_mutations_wb_created_idx
  ON public.whiteboard_mutations(whiteboard_id, created_at);
GRANT SELECT, INSERT ON public.whiteboard_mutations TO authenticated;
GRANT ALL ON public.whiteboard_mutations TO service_role;
ALTER TABLE public.whiteboard_mutations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read mutations"
  ON public.whiteboard_mutations FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.whiteboards wb
    JOIN public.sessions s ON s.id = wb.session_id
    WHERE wb.id = whiteboard_mutations.whiteboard_id
      AND public.can_access_classroom_room(s.room_id)
  ));
CREATE POLICY "Members can insert own mutations"
  ON public.whiteboard_mutations FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.whiteboards wb
      JOIN public.sessions s ON s.id = wb.session_id
      WHERE wb.id = whiteboard_mutations.whiteboard_id
        AND public.can_access_classroom_room(s.room_id)
    )
  );

-- 3. whiteboard_snapshots
CREATE TABLE public.whiteboard_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whiteboard_id uuid NOT NULL REFERENCES public.whiteboards(id) ON DELETE CASCADE,
  snapshot_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX whiteboard_snapshots_wb_created_idx
  ON public.whiteboard_snapshots(whiteboard_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.whiteboard_snapshots TO authenticated;
GRANT ALL ON public.whiteboard_snapshots TO service_role;
ALTER TABLE public.whiteboard_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read snapshots"
  ON public.whiteboard_snapshots FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.whiteboards wb
    JOIN public.sessions s ON s.id = wb.session_id
    WHERE wb.id = whiteboard_snapshots.whiteboard_id
      AND public.can_access_classroom_room(s.room_id)
  ));
CREATE POLICY "Members can insert snapshots"
  ON public.whiteboard_snapshots FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.whiteboards wb
    JOIN public.sessions s ON s.id = wb.session_id
    WHERE wb.id = whiteboard_snapshots.whiteboard_id
      AND public.can_access_classroom_room(s.room_id)
  ));

-- 4. classroom_chat
CREATE TABLE public.classroom_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL,
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX classroom_chat_room_created_idx
  ON public.classroom_chat(room_id, created_at);
GRANT SELECT, INSERT ON public.classroom_chat TO authenticated;
GRANT ALL ON public.classroom_chat TO service_role;
ALTER TABLE public.classroom_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read chat"
  ON public.classroom_chat FOR SELECT TO authenticated
  USING (public.can_access_classroom_room(room_id));
CREATE POLICY "Members can post chat"
  ON public.classroom_chat FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.can_access_classroom_room(room_id));

-- 5. ensure_whiteboard RPC: creates or returns the whiteboard for a room
CREATE OR REPLACE FUNCTION public.ensure_whiteboard(_room_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _session_id uuid;
  _wb_id uuid;
BEGIN
  IF NOT public.can_access_classroom_room(_room_id) THEN
    RAISE EXCEPTION 'Not authorized for room %', _room_id;
  END IF;

  SELECT id INTO _session_id FROM public.sessions WHERE room_id = _room_id ORDER BY created_at DESC LIMIT 1;
  IF _session_id IS NULL THEN
    RAISE EXCEPTION 'No session for room %', _room_id;
  END IF;

  SELECT id INTO _wb_id FROM public.whiteboards WHERE session_id = _session_id;
  IF _wb_id IS NULL THEN
    INSERT INTO public.whiteboards (session_id) VALUES (_session_id) RETURNING id INTO _wb_id;
  END IF;
  RETURN _wb_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.ensure_whiteboard(text) TO authenticated;

-- 6. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.whiteboard_mutations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_chat;
