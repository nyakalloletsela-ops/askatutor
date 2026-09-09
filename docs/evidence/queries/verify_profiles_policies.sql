SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;