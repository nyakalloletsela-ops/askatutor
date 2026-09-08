
-- ---------------------------------------------------------------------------
-- Harden RPC grants + fix NULL-unsafe authorization guards.
--
-- Supabase grants EXECUTE to anon/authenticated on every function at CREATE
-- time. This migration:
--   1. Revokes EXECUTE from anon AND authenticated on service-role-only /
--      trigger functions (payment settlement, email queue, prepaid helpers).
--   2. Revokes EXECUTE from anon only on functions the browser legitimately
--      calls as an authenticated user.
--   3. Closes NULL-bypass guards (auth.uid() is NULL for anon, so
--      `_uid <> x` evaluates to NULL and the guard is skipped) in the session
--      lifecycle RPCs and the sessions immutable-columns trigger, and in
--      consume_prepaid_lesson (defense in depth).
--
-- Functions that MUST keep anon/authenticated EXECUTE (used by RLS policies
-- or by anonymous public pages and are NULL-safe) are left untouched:
--   can_access_classroom_room, has_role, student_has_scope, list_public_tutors.
-- ---------------------------------------------------------------------------

-- 1) Service-role / trigger only: no anon, no authenticated.
REVOKE EXECUTE ON FUNCTION public.consume_prepaid_lesson(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.finalize_payment_succeeded(uuid, text, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_payment_failed(uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_payment_attempt(uuid, text, text, text, integer, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refund_payment(uuid, text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sessions_consume_free_minutes() FROM anon, authenticated;

-- 2) Authenticated only (browser calls these after login; remove anon surface).
REVOKE EXECUTE ON FUNCTION public.approve_tutor_application(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.reject_tutor_application(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_tutor_decision(text, uuid[], text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.book_session(uuid, timestamptz, integer, text, boolean, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.cancel_session(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.complete_session(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.end_session(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.reschedule_session(uuid, timestamptz) FROM anon;
REVOKE EXECUTE ON FUNCTION public.start_session(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.booking_conflicts_check(uuid, timestamptz, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_bulk_lesson_intent(uuid, integer, integer, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.confirm_bulk_lesson_intent(uuid, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_scopes() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_session_participant_names() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_tutor_pricing(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_tutor_availability_public(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_tutor_holidays_public(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_tutor_busy_slots(uuid, timestamptz, timestamptz) FROM anon;
REVOKE EXECUTE ON FUNCTION public.match_simulations(vector, integer, double precision) FROM anon;

-- 3) NULL-safe guards. auth.uid() is NULL for anon; the previous
--    `_uid <> x` comparisons became NULL and skipped the authorization check.
CREATE OR REPLACE FUNCTION public.consume_prepaid_lesson(_student uuid, _tutor uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _row uuid;
BEGIN
  IF auth.uid() IS NULL OR (_student <> auth.uid() AND NOT public.has_role(auth.uid(),'admin')) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT id INTO _row FROM public.prepaid_lessons
    WHERE student_id = _student AND tutor_id = _tutor AND lessons_remaining > 0
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE;
  IF _row IS NULL THEN RETURN false; END IF;
  UPDATE public.prepaid_lessons SET lessons_remaining = lessons_remaining - 1
    WHERE id = _row;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_prepaid_lesson(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_prepaid_lesson(uuid, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.start_session(_session uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _s record; _uid uuid := auth.uid();
BEGIN
  SELECT * INTO _s FROM public.sessions WHERE id = _session FOR UPDATE;
  IF _s.id IS NULL THEN RAISE EXCEPTION 'Session not found'; END IF;
  IF _uid IS NULL OR (_uid <> _s.tutor_id AND _uid <> _s.student_id AND NOT public.has_role(_uid,'admin')) THEN
    RAISE EXCEPTION 'Only session participants can start this lesson';
  END IF;
  IF _s.status <> 'scheduled' THEN RAISE EXCEPTION 'Session is not in a startable state'; END IF;
  IF now() < _s.scheduled_at - interval '15 minutes' THEN
    RAISE EXCEPTION 'Session starts at % — too early to start', _s.scheduled_at;
  END IF;
  UPDATE public.sessions SET status = 'live' WHERE id = _session;
END; $$;
GRANT EXECUTE ON FUNCTION public.start_session(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.end_session(_session uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _s record; _uid uuid := auth.uid();
BEGIN
  SELECT * INTO _s FROM public.sessions WHERE id = _session FOR UPDATE;
  IF _s.id IS NULL THEN RAISE EXCEPTION 'Session not found'; END IF;
  IF _uid IS NULL OR (_uid <> _s.tutor_id AND NOT public.has_role(_uid,'admin')) THEN
    RAISE EXCEPTION 'Only the tutor can end this lesson';
  END IF;
  IF _s.status <> 'live' THEN RAISE EXCEPTION 'Session is not in progress'; END IF;
  UPDATE public.sessions SET status = 'completed' WHERE id = _session;
END; $$;
GRANT EXECUTE ON FUNCTION public.end_session(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.reschedule_session(_session uuid, _new_start timestamptz)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _s record; _uid uuid := auth.uid();
BEGIN
  SELECT * INTO _s FROM public.sessions WHERE id=_session FOR UPDATE;
  IF _s.id IS NULL THEN RAISE EXCEPTION 'Session not found'; END IF;
  IF _uid IS NULL OR (_uid <> _s.tutor_id AND _uid <> _s.student_id AND NOT public.has_role(_uid,'admin')) THEN
    RAISE EXCEPTION 'Not authorized'; END IF;
  IF _s.status <> 'scheduled' THEN RAISE EXCEPTION 'Session not reschedulable'; END IF;
  IF NOT public.booking_conflicts_check(_s.tutor_id,_new_start,_s.duration_min) THEN
    RAISE EXCEPTION 'New slot not available'; END IF;
  PERFORM set_config('app.session_mutation_op','reschedule',true);
  UPDATE public.sessions SET scheduled_at=_new_start, rescheduled_from=id WHERE id=_session;
END; $$;
GRANT EXECUTE ON FUNCTION public.reschedule_session(uuid,timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.cancel_session(_session uuid, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _s record; _uid uuid := auth.uid();
BEGIN
  SELECT * INTO _s FROM public.sessions WHERE id=_session FOR UPDATE;
  IF _s.id IS NULL THEN RAISE EXCEPTION 'Session not found'; END IF;
  IF _uid IS NULL OR (_uid <> _s.tutor_id AND _uid <> _s.student_id AND NOT public.has_role(_uid,'admin')) THEN
    RAISE EXCEPTION 'Not authorized'; END IF;
  IF _s.status <> 'scheduled' THEN RAISE EXCEPTION 'Already finalized'; END IF;
  UPDATE public.sessions SET status='cancelled', cancelled_at=now(), cancelled_by=_uid, cancel_reason=_reason WHERE id=_session;
END; $$;
GRANT EXECUTE ON FUNCTION public.cancel_session(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_session(_session uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _s record; _uid uuid := auth.uid();
BEGIN
  SELECT * INTO _s FROM public.sessions WHERE id = _session FOR UPDATE;
  IF _s.id IS NULL THEN RAISE EXCEPTION 'Session not found'; END IF;
  IF _uid IS NULL OR (_uid <> _s.tutor_id AND NOT public.has_role(_uid,'admin')) THEN
    RAISE EXCEPTION 'Only the tutor can complete this lesson';
  END IF;
  IF _s.status <> 'scheduled' THEN
    RAISE EXCEPTION 'Session is not in a completable state';
  END IF;
  IF now() < _s.scheduled_at THEN
    RAISE EXCEPTION 'Lesson has not started yet';
  END IF;
  UPDATE public.sessions SET status = 'completed' WHERE id = _session;
END; $$;
GRANT EXECUTE ON FUNCTION public.complete_session(uuid) TO authenticated;

-- Immutable-columns trigger: same NULL-safe hardening on every authorization
-- check. (Anon has no sessions UPDATE via RLS, but this is defense in depth.)
CREATE OR REPLACE FUNCTION public.sessions_protect_immutable_cols()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE _op text := coalesce(current_setting('app.session_mutation_op', true), '');
BEGIN
  IF NEW.tutor_id IS DISTINCT FROM OLD.tutor_id THEN RAISE EXCEPTION 'tutor_id is immutable'; END IF;
  IF NEW.student_id IS DISTINCT FROM OLD.student_id THEN RAISE EXCEPTION 'student_id is immutable'; END IF;
  IF NEW.room_id IS DISTINCT FROM OLD.room_id THEN RAISE EXCEPTION 'room_id is immutable'; END IF;
  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN RAISE EXCEPTION 'created_at is immutable'; END IF;
  IF NEW.is_free IS DISTINCT FROM OLD.is_free THEN RAISE EXCEPTION 'is_free is immutable'; END IF;

  IF _op = 'reschedule' THEN
    IF NEW.scheduled_at IS DISTINCT FROM OLD.scheduled_at THEN
      IF auth.uid() IS NULL OR (auth.uid() <> OLD.tutor_id AND auth.uid() <> OLD.student_id AND NOT public.has_role(auth.uid(),'admin')) THEN
        RAISE EXCEPTION 'Not authorized to reschedule';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.scheduled_at IS DISTINCT FROM OLD.scheduled_at THEN
    RAISE EXCEPTION 'scheduled_at can only be changed via reschedule_session';
  END IF;
  IF NEW.subject IS DISTINCT FROM OLD.subject THEN RAISE EXCEPTION 'subject can only be changed by an admin'; END IF;
  IF NEW.duration_min IS DISTINCT FROM OLD.duration_min THEN RAISE EXCEPTION 'duration_min can only be changed by an admin'; END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF OLD.status = 'scheduled' AND NEW.status = 'cancelled' THEN
      IF auth.uid() IS NULL OR (auth.uid() <> OLD.tutor_id AND auth.uid() <> OLD.student_id AND NOT public.has_role(auth.uid(),'admin')) THEN
        RAISE EXCEPTION 'only session participants can cancel';
      END IF;
    ELSIF OLD.status = 'scheduled' AND NEW.status = 'live' THEN
      IF auth.uid() IS NULL OR (auth.uid() <> OLD.tutor_id AND auth.uid() <> OLD.student_id AND NOT public.has_role(auth.uid(),'admin')) THEN
        RAISE EXCEPTION 'only session participants can start a session';
      END IF;
    ELSIF OLD.status = 'live' AND NEW.status = 'completed' THEN
      IF auth.uid() IS NULL OR (auth.uid() <> OLD.tutor_id AND NOT public.has_role(auth.uid(),'admin')) THEN
        RAISE EXCEPTION 'only the tutor can complete a session';
      END IF;
    ELSIF OLD.status = 'scheduled' AND NEW.status = 'completed' THEN
      IF auth.uid() IS NULL OR (auth.uid() <> OLD.tutor_id AND NOT public.has_role(auth.uid(),'admin')) THEN
        RAISE EXCEPTION 'only the tutor can complete a session';
      END IF;
    ELSE
      RAISE EXCEPTION 'invalid status transition';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
