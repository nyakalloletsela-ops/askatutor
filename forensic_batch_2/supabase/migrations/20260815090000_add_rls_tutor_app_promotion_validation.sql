-- ============================================================================
-- AskATutorLive — GAP-004: Add RLS policies and RPC functions for tutor app
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Profiles table RLS policies
-- ---------------------------------------------------------------------------

-- 1. Users can read own profile
DROP POLICY IF EXISTS "users read own profile" ON public.profiles;
CREATE POLICY "users read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. Admins can read all profiles
DROP POLICY IF EXISTS "admins read all profiles" ON public.profiles;
CREATE POLICY "admins read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Users can update own profile
DROP POLICY IF EXISTS "users update own profile" ON public.profiles;
CREATE POLICY "users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Admins can update all profiles
DROP POLICY IF EXISTS "admins update all profiles" ON public.profiles;
CREATE POLICY "admins update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ---------------------------------------------------------------------------
-- user_roles table RLS policies
-- ---------------------------------------------------------------------------

-- 5. Users can read own role
DROP POLICY IF EXISTS "users read own role" ON public.user_roles;
CREATE POLICY "users read own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Admins can read all roles
DROP POLICY IF EXISTS "admins read all roles" ON public.user_roles;
CREATE POLICY "admins read all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 7. Admins can insert roles
DROP POLICY IF EXISTS "admins insert roles" ON public.user_roles;
CREATE POLICY "admins insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ---------------------------------------------------------------------------
-- RPC functions (idempotent via CREATE OR REPLACE)
-- ---------------------------------------------------------------------------

-- 8. Validate promotion from student to tutor
CREATE OR REPLACE FUNCTION public.validate_tutor_promotion(
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_role record;
  v_subscription_active boolean;
BEGIN
  -- Check user has tutor role
  SELECT * INTO v_role
  FROM public.user_roles
  WHERE user_id = p_user_id
    AND role = 'tutor';

  IF v_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check active subscription
  SELECT EXISTS(
    SELECT 1
    FROM public.tutor_subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
  ) INTO v_subscription_active;

  IF NOT v_subscription_active THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- 9. Validate session booking eligibility
CREATE OR REPLACE FUNCTION public.validate_session_booking(
  p_user_id uuid,
  p_session_type text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_eligible boolean;
BEGIN
  -- Check basic eligibility via check_session_eligibility logic
  IF EXISTS (
    SELECT 1
    FROM public.tutor_subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
  ) THEN
    v_eligible := TRUE;
  ELSE
    v_eligible := FALSE;
  END IF;

  RETURN v_eligible;
END;
$$;

-- ---------------------------------------------------------------------------
-- No additional CREATE POLICY statements requiring drop guards in this file.
-- All policy guards already applied in prior migrations; RPCs are inherently
-- idempotent via CREATE OR REPLACE.
-- ---------------------------------------------------------------------------