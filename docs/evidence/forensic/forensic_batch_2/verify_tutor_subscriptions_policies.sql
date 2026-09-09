SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'tutor_subscriptions'
ORDER BY policyname;