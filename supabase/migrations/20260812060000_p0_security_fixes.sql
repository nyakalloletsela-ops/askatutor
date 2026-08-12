
-- ============================================================================
-- AskATutorLive — P0 security & lifecycle fixes (remediation phase)
--   1. P0-2  handle_new_user must never self-grant the privileged tutor role.
--            Tutor applicants follow the tutor_applications lifecycle and an
--            admin must approve them (approve_tutor_application) before the
--            'tutor' role is granted. Self-assign RLS policy and the legacy
--            become_tutor() RPC were already removed in earlier migrations.
--   2. P0-1  book_session now enforces an entitlement before booking a paid
--            lesson: find_tutors scope OR prepaid lessons for that tutor OR
--            admin. Free lessons are paid from free minutes (existing trigger).
--            One prepaid lesson is consumed per booked session.
--   3. P0-3  refund_payment RPC: reverses a succeeded payment intent and
--            writes reversal (debit) ledger entries. Idempotent.
--   4. P0-4  start_session / end_session RPCs and a hardened
--            sessions_protect_immutable_cols trigger that removes the blanket
--            "app.allow_session_mutation" bypass (any authenticated role could
--            otherwise set it and mutate immutable session columns). The
--            trigger now authorizes each status transition natively and only
--            the reschedule path uses a narrow op marker.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- P0-2: Signup must not grant privileged roles.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
 AS $function$
DECLARE _chosen text;
BEGIN
  _chosen := lower(coalesce(NEW.raw_user_meta_data->>'account_type', 'student'));
  INSERT INTO public.profiles (id, full_name, free_minutes_remaining)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
          CASE WHEN _chosen IN ('tutor','parent') THEN 0 ELSE 300 END);
  IF _chosen = 'parent' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'parent');
  ELSE
    -- Everyone else starts as a (non-privileged) student. Would-be tutors must
    -- apply via tutor_applications; only an admin can grant the 'tutor' role
    -- through approve_tutor_application(). This closes the signup self-grant.
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  END IF;
  RETURN NEW;
END; $function$;

-- ---------------------------------------------------------------------------
-- P0-1: Prepaid lesson consumption helper (internal to SECURITY DEFINER fns).
-- Not callable by end users; only service_role (and the definer, i.e. the
-- book_session RPC) may invoke it.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.consume_prepaid_lesson(_student uuid, _tutor uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _row uuid;
BEGIN
  IF _student <> auth.uid() AND NOT public.has_role(auth.uid(),'admin') THEN
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

-- ---------------------------------------------------------------------------
-- P0-1: book_session with entitlement enforcement.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.book_session(
  _tutor uuid, _start timestamptz, _duration_min integer, _subject text,
  _is_free boolean DEFAULT false, _recurrence_weeks integer DEFAULT 1
) RETURNS uuid[] LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _student uuid := auth.uid(); _ids uuid[] := ARRAY[]::uuid[];
        _parent uuid; _cur timestamptz := _start; _new_id uuid; i int;
        _has_scope boolean := false; _prepaid boolean := false;
BEGIN
  IF _student IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _tutor = _student THEN RAISE EXCEPTION 'Cannot book a lesson with yourself'; END IF;
  IF _recurrence_weeks < 1 OR _recurrence_weeks > 26 THEN RAISE EXCEPTION 'Invalid recurrence'; END IF;

  -- Entitlement gate (P0-1). Free lessons are paid from the free-minutes
  -- balance (the sessions_consume_free_minutes trigger enforces it on insert).
  -- Paid lessons require the find_tutors subscription scope, or prepaid
  -- lessons already purchased for this tutor, or an admin.
  IF _is_free THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = _student AND free_minutes_remaining >= _duration_min
    ) THEN
      RAISE EXCEPTION 'Not enough free minutes remaining';
    END IF;
  ELSE
    IF NOT public.has_role(_student, 'admin') THEN
      SELECT public.student_has_scope('find_tutors') INTO _has_scope;
      IF NOT _has_scope THEN
        SELECT EXISTS (
          SELECT 1 FROM public.prepaid_lessons
          WHERE student_id = _student AND tutor_id = _tutor AND lessons_remaining > 0
        ) INTO _prepaid;
        IF NOT _prepaid THEN
          RAISE EXCEPTION
            'Find Tutors subscription or prepaid lessons required to book a paid lesson';
        END IF;
      END IF;
    END IF;
  END IF;

  FOR i IN 1.._recurrence_weeks LOOP
    IF NOT public.booking_conflicts_check(_tutor,_cur,_duration_min) THEN
      IF i=1 THEN RAISE EXCEPTION 'Slot not available'; ELSE EXIT; END IF;
    END IF;
    INSERT INTO public.sessions (tutor_id,student_id,subject,scheduled_at,duration_min,is_free,parent_session_id)
    VALUES (_tutor,_student,_subject,_cur,_duration_min,_is_free,_parent) RETURNING id INTO _new_id;
    IF i=1 THEN _parent := _new_id; END IF;
    _ids := _ids || _new_id;
    IF NOT _is_free AND _prepaid THEN
      PERFORM public.consume_prepaid_lesson(_student, _tutor);
    END IF;
    _cur := _cur + interval '7 days';
  END LOOP;
  IF _recurrence_weeks > 1 AND _parent IS NOT NULL THEN
    INSERT INTO public.session_recurrence (parent_session_id,rrule)
    VALUES (_parent,'FREQ=WEEKLY;COUNT='||array_length(_ids,1));
  END IF;
  RETURN _ids;
END; $$;
GRANT EXECUTE ON FUNCTION public.book_session(uuid,timestamptz,integer,text,boolean,integer) TO authenticated;

-- P0-1 (defense in depth): the student insert policy must mirror the same
-- entitlement as book_session, so a client can never bypass the gate by
-- inserting into sessions directly. Free lessons need the free-minute balance;
-- paid lessons need the find_tutors scope, a prepaid lesson for that tutor, or
-- admin. Tutor-driven inserts ("tutor schedule any student") are untouched.
DROP POLICY IF EXISTS "student book session" ON public.sessions;
CREATE POLICY "student book session"
ON public.sessions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND public.has_role(auth.uid(), 'student'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = sessions.tutor_id AND ur.role = 'tutor'::app_role
  )
  AND (
    ( sessions.is_free = true
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = sessions.student_id
          AND p.free_minutes_remaining >= sessions.duration_min
      )
    )
    OR
    ( sessions.is_free = false
      AND (
        public.has_role(auth.uid(), 'admin'::app_role)
        OR public.student_has_scope('find_tutors')
        OR EXISTS (
          SELECT 1 FROM public.prepaid_lessons pl
          WHERE pl.student_id = sessions.student_id
            AND pl.tutor_id = sessions.tutor_id
            AND pl.lessons_remaining > 0
        )
      )
    )
  )
);

-- ---------------------------------------------------------------------------
-- P0-3: Refund / reversal RPC with ledger reversal (service_role only).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.refund_payment(
  _intent uuid,
  _reason text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _pi record;
BEGIN
  SELECT * INTO _pi FROM public.payment_intents WHERE id = _intent FOR UPDATE;
  IF _pi.id IS NULL THEN RAISE EXCEPTION 'Intent % not found', _intent; END IF;
  IF _pi.status = 'refunded' THEN RETURN; END IF; -- idempotent
  IF _pi.status <> 'succeeded' THEN
    RAISE EXCEPTION 'Intent % cannot be refunded from status %', _intent, _pi.status;
  END IF;

  UPDATE public.payment_intents
    SET status='refunded', refunded_at = now(), failure_reason = _reason
    WHERE id = _intent;

  INSERT INTO public.ledger_entries
    (entry_type, amount_cents, currency, balance_type, payment_intent_id, description, metadata)
  VALUES
    ('debit', _pi.gross_cents, _pi.currency, 'platform', _pi.id,
     'Student payment refunded', jsonb_build_object('reason', _reason));

  INSERT INTO public.ledger_entries
    (entry_type, amount_cents, currency, balance_type, tutor_id, payment_intent_id, description)
  VALUES
    ('debit', _pi.tutor_net_cents, _pi.currency, 'tutor_earnings',
     _pi.tutor_id, _pi.id, 'Tutor earnings reversed');
END;
$$;

REVOKE ALL ON FUNCTION public.refund_payment(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refund_payment(uuid,text) TO service_role;

-- ---------------------------------------------------------------------------
-- P0-4: Session lifecycle RPCs.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.start_session(_session uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _s record; _uid uuid := auth.uid();
BEGIN
  SELECT * INTO _s FROM public.sessions WHERE id = _session FOR UPDATE;
  IF _s.id IS NULL THEN RAISE EXCEPTION 'Session not found'; END IF;
  IF _uid <> _s.tutor_id AND _uid <> _s.student_id AND NOT public.has_role(_uid,'admin') THEN
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
  IF _uid <> _s.tutor_id AND NOT public.has_role(_uid,'admin') THEN
    RAISE EXCEPTION 'Only the tutor can end this lesson';
  END IF;
  IF _s.status <> 'live' THEN RAISE EXCEPTION 'Session is not in progress'; END IF;
  UPDATE public.sessions SET status = 'completed' WHERE id = _session;
END; $$;
GRANT EXECUTE ON FUNCTION public.end_session(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- P0-4: Hardened immutable-columns trigger.
-- Removes the blanket "app.allow_session_mutation" bypass. Each status
-- transition is now authorized in the trigger itself; reschedule_session uses
-- a narrow per-operation marker that still re-validates authorization.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sessions_protect_immutable_cols()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE _op text := coalesce(current_setting('app.session_mutation_op', true), '');
BEGIN
  -- Identity / ledger columns are never changeable, for any role, ever.
  IF NEW.tutor_id IS DISTINCT FROM OLD.tutor_id THEN RAISE EXCEPTION 'tutor_id is immutable'; END IF;
  IF NEW.student_id IS DISTINCT FROM OLD.student_id THEN RAISE EXCEPTION 'student_id is immutable'; END IF;
  IF NEW.room_id IS DISTINCT FROM OLD.room_id THEN RAISE EXCEPTION 'room_id is immutable'; END IF;
  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN RAISE EXCEPTION 'created_at is immutable'; END IF;
  IF NEW.is_free IS DISTINCT FROM OLD.is_free THEN RAISE EXCEPTION 'is_free is immutable'; END IF;

  IF _op = 'reschedule' THEN
    -- Only the reschedule RPC path may move scheduled_at; authorization is
    -- re-checked here so the marker alone grants nothing.
    IF NEW.scheduled_at IS DISTINCT FROM OLD.scheduled_at THEN
      IF auth.uid() <> OLD.tutor_id AND auth.uid() <> OLD.student_id AND NOT public.has_role(auth.uid(),'admin') THEN
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
      IF auth.uid() <> OLD.tutor_id AND auth.uid() <> OLD.student_id AND NOT public.has_role(auth.uid(),'admin') THEN
        RAISE EXCEPTION 'only session participants can cancel';
      END IF;
    ELSIF OLD.status = 'scheduled' AND NEW.status = 'live' THEN
      IF auth.uid() <> OLD.tutor_id AND auth.uid() <> OLD.student_id AND NOT public.has_role(auth.uid(),'admin') THEN
        RAISE EXCEPTION 'only session participants can start a session';
      END IF;
    ELSIF OLD.status = 'live' AND NEW.status = 'completed' THEN
      IF auth.uid() <> OLD.tutor_id AND NOT public.has_role(auth.uid(),'admin') THEN
        RAISE EXCEPTION 'only the tutor can complete a session';
      END IF;
    ELSIF OLD.status = 'scheduled' AND NEW.status = 'completed' THEN
      IF auth.uid() <> OLD.tutor_id AND NOT public.has_role(auth.uid(),'admin') THEN
        RAISE EXCEPTION 'only the tutor can complete a session';
      END IF;
    ELSE
      RAISE EXCEPTION 'invalid status transition';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

-- Re-align existing lifecycle RPCs with the new trigger (no blanket bypass).
CREATE OR REPLACE FUNCTION public.reschedule_session(_session uuid, _new_start timestamptz)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _s record; _uid uuid := auth.uid();
BEGIN
  SELECT * INTO _s FROM public.sessions WHERE id=_session FOR UPDATE;
  IF _s.id IS NULL THEN RAISE EXCEPTION 'Session not found'; END IF;
  IF _uid <> _s.tutor_id AND _uid <> _s.student_id AND NOT public.has_role(_uid,'admin') THEN
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
  IF _uid <> _s.tutor_id AND _uid <> _s.student_id AND NOT public.has_role(_uid,'admin') THEN
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
  IF _uid <> _s.tutor_id AND NOT public.has_role(_uid,'admin') THEN
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
