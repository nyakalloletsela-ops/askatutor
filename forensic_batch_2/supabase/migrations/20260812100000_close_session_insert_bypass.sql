-- Close the P0-1 RLS bypass left by the legacy "students book tutor sessions"
-- policy (20260524065325): it allowed any student to INSERT into sessions
-- directly without the entitlement required by book_session.
--
-- The hardened "student book session" policy (P0 security fixes migration)
-- covers the same student path WITH the entitlement gate, so the legacy
-- policy is redundant and is dropped. Tutor-driven inserts remain governed by
-- "tutors schedule student sessions" (tutor schedules their own lessons).

DROP POLICY IF EXISTS "students book tutor sessions" ON public.sessions;
