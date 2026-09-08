SELECT trigger_name, event_manipulation, action_statement, action_timing, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public' AND trigger_name = 'on_auth_user_created';