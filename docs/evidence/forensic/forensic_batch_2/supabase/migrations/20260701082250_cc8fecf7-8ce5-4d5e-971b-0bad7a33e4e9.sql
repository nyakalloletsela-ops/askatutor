ALTER TABLE public.platform_config
  ADD COLUMN IF NOT EXISTS ai_provider text NOT NULL DEFAULT 'lovable'
    CHECK (ai_provider IN ('lovable','groq','gemini','ollama'));

CREATE OR REPLACE FUNCTION public.complete_session(_session uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _s record; _uid uuid := auth.uid();
BEGIN
  SELECT * INTO _s FROM public.sessions WHERE id = _session FOR UPDATE;
  IF _s.id IS NULL THEN RAISE EXCEPTION 'Session not found'; END IF;
  IF _uid <> _s.tutor_id AND NOT public.has_role(_uid,'admin') THEN
    RAISE EXCEPTION 'Only the tutor can complete this lesson';
  END IF;
  IF _s.status <> 'scheduled' THEN
    RAISE EXCEPTION 'Session is not in a completable state';
  END IF;
  IF now() < _s.scheduled_at THEN
    RAISE EXCEPTION 'Lesson has not started yet';
  END IF;
  PERFORM set_config('app.allow_session_mutation','on',true);
  UPDATE public.sessions SET status = 'completed' WHERE id = _session;
END; $$;
GRANT EXECUTE ON FUNCTION public.complete_session(uuid) TO authenticated;