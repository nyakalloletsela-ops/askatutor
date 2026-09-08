-- ============================================================================
-- AskATutorLive — GAP-005: Add RLS policies for parent/tutor role expansion
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

-- 8. Admins can update roles
DROP POLICY IF EXISTS "admins update roles" ON public.user_roles;
CREATE POLICY "admins update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ---------------------------------------------------------------------------
-- Sessions table RLS policies
-- ---------------------------------------------------------------------------

-- 9. Users can read own sessions
DROP POLICY IF EXISTS "users read own sessions" ON public.sessions;
CREATE POLICY "users read own sessions"
  ON public.sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- 10. Admins can read all sessions
DROP POLICY IF EXISTS "admins read all sessions" ON public.sessions;
CREATE POLICY "admins read all sessions"
  ON public.sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 11. Users can update own session status
DROP POLICY IF EXISTS "users update own session status" ON public.sessions;
CREATE POLICY "users update own session status"
  ON public.sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- ---------------------------------------------------------------------------
-- Tutor subscriptions table RLS policies
-- ---------------------------------------------------------------------------

-- 12. Users can read own subscription
DROP POLICY IF EXISTS "users read own subscription" ON public.tutor_subscriptions;
CREATE POLICY "users read own subscription"
  ON public.tutor_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = tutor_id);

-- 13. Admins can read all subscriptions
DROP POLICY IF EXISTS "admins read all subscriptions" ON public.tutor_subscriptions;
CREATE POLICY "admins read all subscriptions"
  ON public.tutor_subscriptions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 14. Admins can update subscription status
DROP POLICY IF EXISTS "admins update subscription status" ON public.tutor_subscriptions;
CREATE POLICY "admins update subscription status"
  ON public.tutor_subscriptions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ---------------------------------------------------------------------------
-- Tutor courses table RLS policies
-- ---------------------------------------------------------------------------

-- 15. Users can read own course enrollments
DROP POLICY IF EXISTS "users read own course enrollments" ON public.tutor_courses;
CREATE POLICY "users read own course enrollments"
  ON public.tutor_courses FOR SELECT
  TO authenticated
  USING (auth.uid() = tutor_id);

-- 16. Admins can read all courses
DROP POLICY IF EXISTS "admins read all courses" ON public.tutor_courses;
CREATE POLICY "admins read all courses"
  ON public.tutor_courses FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 17. Admins can insert courses
DROP POLICY IF EXISTS "admins insert courses" ON public.tutor_courses;
CREATE POLICY "admins insert courses"
  ON public.tutor_courses FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 18. Admins can update courses
DROP POLICY IF EXISTS "admins update courses" ON public.tutor_courses;
CREATE POLICY "admins update courses"
  ON public.tutor_courses FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ---------------------------------------------------------------------------
-- End of migration GAP-005
-- ---------------------------------------------------------------------------