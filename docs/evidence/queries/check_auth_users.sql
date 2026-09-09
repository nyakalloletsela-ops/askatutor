SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE raw_user_meta_data IS NOT NULL
LIMIT 20;