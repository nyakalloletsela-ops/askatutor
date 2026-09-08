-- ============================================================================
-- AskATutorLive — GAP-002: Add RLS policies for tutor operations
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tutor subscriptions table RLS policies
-- ---------------------------------------------------------------------------

-- 1. Users can read own subscription
DROP POLICY IF EXISTS "users read own subscription" ON public.tutor_subscriptions;
CREATE POLICY "users read own subscription"
  ON public.tutor_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = tutor_id);

-- 2. Users can insert own subscription
DROP POLICY IF EXISTS "users insert own subscription" ON public.tutor_subscriptions;
CREATE POLICY "users insert own subscription"
  ON public.tutor_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = tutor_id);

-- 3. Admins can read all subscriptions
DROP POLICY IF EXISTS "admins read all subscriptions" ON public.tutor_subscriptions;
CREATE POLICY "admins read all subscriptions"
  ON public.tutor_subscriptions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Admins can update any subscription status
DROP POLICY IF EXISTS "admins update subscriptions" ON public.tutor_subscriptions;
CREATE POLICY "admins update subscriptions"
  ON public.tutor_subscriptions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Admins can delete subscriptions
DROP POLICY IF EXISTS "admins delete subscriptions" ON public.tutor_subscriptions;
CREATE POLICY "admins delete subscriptions"
  ON public.tutor_subscriptions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ---------------------------------------------------------------------------
-- Tutor courses table RLS policies
-- ---------------------------------------------------------------------------

-- 6. Users can read own course enrollments
DROP POLICY IF EXISTS "users read own course enrollments" ON public.tutor_courses;
CREATE POLICY "users read own course enrollments"
  ON public.tutor_courses FOR SELECT
  TO authenticated
  USING (auth.uid() = tutor_id);

-- 7. Admins can read all courses
DROP POLICY IF EXISTS "admins read all courses" ON public.tutor_courses;
CREATE POLICY "admins read all courses"
  ON public.tutor_courses FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 8. Admins can insert courses
DROP POLICY IF EXISTS "admins insert courses" ON public.tutor_courses;
CREATE POLICY "admins insert courses"
  ON public.tutor_courses FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 9. Admins can update courses
DROP POLICY IF EXISTS "admins update courses" ON public.tutor_courses;
CREATE POLICY "admins update courses"
  ON public.tutor_courses FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));