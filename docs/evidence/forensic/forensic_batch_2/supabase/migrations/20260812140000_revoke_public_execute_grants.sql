
-- Revoke the legacy PUBLIC EXECUTE grants that were left behind by Supabase's
-- default privileges. `REVOKE ... FROM anon` alone was insufficient: anon (and
-- authenticated) inherited EXECUTE through the PUBLIC (`=X`) grant, so those
-- RPCs remained callable anonymously. Authenticated/service_role grants are
-- preserved here. PUBLIC is intentionally kept on:
--   - list_public_tutors            (public browse pages)
--   - can_access_classroom_room     (used in RLS/storage/realtime policies)
--   - pgvector extension functions  (array_*, halfvec_*, vector_*, ...)

-- Session lifecycle / booking
REVOKE EXECUTE ON FUNCTION public.book_session(uuid, timestamptz, integer, text, boolean, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cancel_session(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.complete_session(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.end_session(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reschedule_session(uuid, timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.start_session(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.booking_conflicts_check(uuid, timestamptz, integer) FROM PUBLIC;

-- Bulk lesson intents
REVOKE EXECUTE ON FUNCTION public.create_bulk_lesson_intent(uuid, integer, integer, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.confirm_bulk_lesson_intent(uuid, text, text) FROM PUBLIC;

-- Entitlement / lookup
REVOKE EXECUTE ON FUNCTION public.get_my_scopes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.student_has_scope(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_session_participant_names() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_tutor_availability_public(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_tutor_busy_slots(uuid, timestamptz, timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_tutor_holidays_public(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_tutor_pricing(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.match_simulations(vector, integer, double precision) FROM PUBLIC;

-- Admin actions
REVOKE EXECUTE ON FUNCTION public.approve_tutor_application(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reject_tutor_application(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_tutor_decision(text, uuid[], text) FROM PUBLIC;

-- Trigger helpers (no EXECUTE grant needed for trigger invocation)
REVOKE EXECUTE ON FUNCTION public.sessions_consume_free_minutes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sessions_protect_immutable_cols() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ledger_block_mutation() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ledger_block_mutation() FROM anon, authenticated;
