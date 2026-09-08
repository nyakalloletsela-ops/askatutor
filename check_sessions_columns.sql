SELECT column_name
FROM information_schema.columns
WHERE table_name = 'sessions'
ORDER BY ordinal_position;