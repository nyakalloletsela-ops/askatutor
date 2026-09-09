
-- Restore whiteboard + classroom chat objects that existed in the previous
-- project's database (created ad-hoc via the SQL editor, never captured in
-- migrations) and are required by the current app code:
--   - src/components/whiteboard/canvas/Whiteboard.tsx   -> ensure_whiteboard(),
--     whiteboards, whiteboard_snapshots
--   - src/components/classroom/ClassroomChat.tsx        -> classroom_chat
-- whiteboard_mutations is kept for schema parity with the typed Database model
-- (src/integrations/supabase/types.ts); current app code does not use it.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE public.whiteboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES public.sessions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.whiteboard_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whiteboard_id uuid NOT NULL REFERENCES public.whiteboards(id) ON DELETE CASCADE,
  snapshot_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.whiteboard_mutations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whiteboard_id uuid NOT NULL REFERENCES public.whiteboards(id) ON DELETE CASCADE,
  mutation_type text NOT NULL,
  mutation_payload jsonb,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.classroom_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL,
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_whiteboard_snapshots_board_created ON public.whiteboard_snapshots (whiteboard_id, created_at DESC);
CREATE INDEX idx_whiteboard_mutations_board_created ON public.whiteboard_mutations (whiteboard_id, created_at);
CREATE INDEX idx_classroom_chat_room_created ON public.classroom_chat (room_id, created_at);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.whiteboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_mutations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_chat ENABLE ROW LEVEL SECURITY;

-- whiteboards: access is room-scoped through the owning session.
CREATE POLICY "participants read whiteboards"
  ON public.whiteboards FOR SELECT TO authenticated
  USING (public.can_access_classroom_room((SELECT s.room_id FROM public.sessions s WHERE s.id = whiteboards.session_id)));

CREATE POLICY "participants create whiteboards"
  ON public.whiteboards FOR INSERT TO authenticated
  WITH CHECK (public.can_access_classroom_room((SELECT s.room_id FROM public.sessions s WHERE s.id = whiteboards.session_id)));

-- whiteboard_snapshots
CREATE POLICY "participants read whiteboard snapshots"
  ON public.whiteboard_snapshots FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.whiteboards w JOIN public.sessions s ON s.id = w.session_id
    WHERE w.id = whiteboard_snapshots.whiteboard_id
      AND public.can_access_classroom_room(s.room_id)
  ));

CREATE POLICY "participants save whiteboard snapshots"
  ON public.whiteboard_snapshots FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.whiteboards w JOIN public.sessions s ON s.id = w.session_id
    WHERE w.id = whiteboard_snapshots.whiteboard_id
      AND public.can_access_classroom_room(s.room_id)
  ));

-- whiteboard_mutations (parity; unused by current app)
CREATE POLICY "participants read whiteboard mutations"
  ON public.whiteboard_mutations FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.whiteboards w JOIN public.sessions s ON s.id = w.session_id
    WHERE w.id = whiteboard_mutations.whiteboard_id
      AND public.can_access_classroom_room(s.room_id)
  ));

CREATE POLICY "participants record whiteboard mutations"
  ON public.whiteboard_mutations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.whiteboards w JOIN public.sessions s ON s.id = w.session_id
    WHERE w.id = whiteboard_mutations.whiteboard_id
      AND public.can_access_classroom_room(s.room_id)
  ));

-- classroom_chat
CREATE POLICY "classroom members read chat"
  ON public.classroom_chat FOR SELECT TO authenticated
  USING (public.can_access_classroom_room(room_id));

CREATE POLICY "classroom members send chat"
  ON public.classroom_chat FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.can_access_classroom_room(room_id));

-- Live classroom chat uses postgres_changes -> must be in the realtime publication.
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_chat;

-- ---------------------------------------------------------------------------
-- ensure_whiteboard RPC (called by Whiteboard.tsx with { _room_id })
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_whiteboard(_room_id text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _session_id uuid;
  _board_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT s.id INTO _session_id FROM public.sessions s WHERE s.room_id = _room_id;
  IF _session_id IS NULL THEN
    RAISE EXCEPTION 'Room not found';
  END IF;

  IF NOT public.can_access_classroom_room(_room_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT w.id INTO _board_id FROM public.whiteboards w WHERE w.session_id = _session_id;
  IF _board_id IS NULL THEN
    INSERT INTO public.whiteboards (session_id) VALUES (_session_id) RETURNING id INTO _board_id;
  END IF;

  RETURN _board_id;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_whiteboard(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_whiteboard(text) TO authenticated;
