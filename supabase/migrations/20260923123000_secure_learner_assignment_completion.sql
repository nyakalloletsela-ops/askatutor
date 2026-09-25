-- Let an authenticated learner report completion of their own assignment.
-- This is a self-reported task status, not an assessment result or mastery claim.
-- The function changes only status and derives ownership from auth.uid().

CREATE OR REPLACE FUNCTION public.complete_own_assignment(_assignment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF NOT COALESCE(public.has_role(_user_id, 'student'::public.app_role), false) THEN
    RAISE EXCEPTION 'Student role required' USING ERRCODE = '42501';
  END IF;

  UPDATE public.assignments
  SET status = 'completed'
  WHERE id = _assignment_id
    AND student_id = _user_id
    AND status <> 'completed';

  IF FOUND THEN
    RETURN;
  END IF;

  -- Make a retried completion idempotent without revealing another learner's
  -- assignment existence.
  IF EXISTS (
    SELECT 1
    FROM public.assignments
    WHERE id = _assignment_id
      AND student_id = _user_id
      AND status = 'completed'
  ) THEN
    RETURN;
  END IF;

  RAISE EXCEPTION 'Assignment not found or unavailable' USING ERRCODE = 'P0002';
END;
$$;

REVOKE ALL ON FUNCTION public.complete_own_assignment(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_own_assignment(uuid) TO authenticated;
