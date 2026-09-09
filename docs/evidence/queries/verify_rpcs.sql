SELECT proname, prosrc
FROM pg_proc
WHERE proname IN ('ensure_whiteboard', 'get_tutor_pricing', 'match_simulations', 'get_my_scopes', 'approve_tutor_application', 'reject_tutor_application', 'log_tutor_decision')
ORDER BY proname;