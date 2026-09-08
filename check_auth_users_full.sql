SELECT id, email, raw_app_meta_data, created_at, confirmed_at, last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;