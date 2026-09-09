SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('payment_intents', 'ledger_entries', 'site_content')
ORDER BY relname;