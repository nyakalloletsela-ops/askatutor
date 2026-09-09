SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sessions' AND column_name = 'user_id';