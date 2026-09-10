SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('profiles', 'user_roles', 'tutor_subscriptions', 'tutor_courses', 'sessions')
ORDER BY relname;