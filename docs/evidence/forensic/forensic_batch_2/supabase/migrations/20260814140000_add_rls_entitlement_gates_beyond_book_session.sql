-- ============================================================================
-- AskATutorLive — GAP-003: Add entitlement gate and beyond-book-session logic
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Entitlement gates table: no CREATE POLICY statements (only function definitions)
-- ---------------------------------------------------------------------------

-- 1. Create/update entitlement gate for session booking eligibility
CREATE OR REPLACE FUNCTION public.check_session_eligibility(
  p_user_id uuid,
  p_session_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Check that user has an active subscription and the session is bookable
  IF EXISTS (
    SELECT 1
    FROM public.tutor_subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
  ) AND EXISTS (
    SELECT 1
    FROM public.sessions
    WHERE id = p_session_id
      AND status = 'open'
  ) THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- 2. Create/update beyond-book-session marker function
CREATE OR REPLACE FUNCTION public.mark_beyond_book_session(
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_lesson_count integer;
BEGIN
  SELECT COUNT(*) INTO v_lesson_count
  FROM public.sessions
  WHERE user_id = p_user_id
    AND status = 'completed';

  IF v_lesson_count > 10 THEN
    -- Insert or update beyond_book_session flag
    INSERT INTO public.user_metadata (user_id, beyond_book_session)
      VALUES (p_user_id, TRUE)
    ON CONFLICT (user_id) DO UPDATE
      SET beyond_book_session = TRUE;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- No CREATE POLICY statements in this migration — only function definitions.
-- Functions are inherently idempotent via CREATE OR REPLACE.
-- ---------------------------------------------------------------------------