
-- ============================================================================
-- AskATutorLive — Align the DB booking entitlement gate with the app's
-- "open mode" semantics.
--
--   src/lib/ai-entitlement.ts (server) and src/hooks/use-entitlements.ts
--   (client) both treat platform_config.is_subscriptions_enabled = false as
--   "all gated features are open to everyone". The DB gates did not: a paid
--   book_session / direct paid insert was rejected unless the caller had the
--   find_tutors scope, a prepaid lesson, or admin — even in open mode.
--
-- This migration makes book_session and the "student book session" INSERT
-- policy respect the flag:
--   - subscriptions enabled  -> entitlement gate enforced (P0-1 unchanged).
--   - subscriptions disabled -> paid bookings allowed (open mode).
-- Secure default: if the platform_config row is missing the gate stays on.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) book_session: skip the paid entitlement gate in open mode.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.book_session(_tutor uuid, _start timestamp with time zone, _duration_min integer, _subject text, _is_free boolean DEFAULT false, _recurrence_weeks integer DEFAULT 1)
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _student uuid := auth.uid(); _ids uuid[] := ARRAY[]::uuid[];
        _parent uuid; _cur timestamptz := _start; _new_id uuid; i int;
        _has_scope boolean := false; _prepaid boolean := false;
        _subs_enabled boolean := true;
BEGIN
  IF _student IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _tutor = _student THEN RAISE EXCEPTION 'Cannot book a lesson with yourself'; END IF;
  IF _recurrence_weeks < 1 OR _recurrence_weeks > 26 THEN RAISE EXCEPTION 'Invalid recurrence'; END IF;

  -- Open mode: subscriptions disabled platform-wide -> all features open.
  SELECT COALESCE(is_subscriptions_enabled, true) INTO _subs_enabled
  FROM public.platform_config WHERE id = 1;

  -- Entitlement gate (P0-1). Free lessons are paid from the free-minutes
  -- balance (the sessions_consume_free_minutes trigger enforces it on insert).
  -- Paid lessons require the find_tutors subscription scope, or prepaid
  -- lessons already purchased for this tutor, or an admin — unless
  -- subscriptions are disabled platform-wide (open mode).
  IF _is_free THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = _student AND free_minutes_remaining >= _duration_min
    ) THEN
      RAISE EXCEPTION 'Not enough free minutes remaining';
    END IF;
  ELSE
    IF _subs_enabled AND NOT public.has_role(_student, 'admin') THEN
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
END; $function$;

-- ---------------------------------------------------------------------------
-- 2) "student book session" INSERT policy: mirror the open-mode rule.
--    Note: the tutor-role check must go through public.has_role() (SECURITY
--    DEFINER) — a raw EXISTS on user_roles always fails because that table's
--    RLS only lets users read their own role rows, so the tutor's row is
--    invisible to the student.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "student book session" ON public.sessions;
CREATE POLICY "student book session"
ON public.sessions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND public.has_role(auth.uid(), 'student'::app_role)
  AND public.has_role(sessions.tutor_id, 'tutor'::app_role)
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
        NOT (SELECT COALESCE(is_subscriptions_enabled, true)
             FROM public.platform_config WHERE id = 1)
        OR public.has_role(auth.uid(), 'admin'::app_role)
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
