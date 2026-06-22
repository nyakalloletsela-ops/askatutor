
# Phased plan — extend, don't replace

You're on TanStack Start + Lovable Cloud (Supabase). I'll keep every existing component and add the missing pieces. The spec's full surface (Next.js rewrite, SFU media server, M-Pesa, 6 languages, PWA, mind-map AI, 3D simulations, etc.) is multi-month work — I'll deliver it in phases, starting with the four areas you marked. This plan is **Phase 1 only**. After it ships we pick the next phase.

## Phase 1 scope (this pass)

### 1. Parent role + child management
- Add `parent` to the `app_role` enum.
- New table `parent_child_links` (parent_id, child_id, relationship, status) with invite flow.
- New table `child_invites` (token, parent_id, child_email, expires_at).
- Server fns: `inviteChild`, `acceptChildInvite`, `listMyChildren`, `unlinkChild`.
- New routes:
  - `/_authenticated/parent` — parent dashboard (children list, upcoming lessons per child, recent recordings, attendance summary)
  - `/_authenticated/parent/children` — manage links + invites
  - `/_authenticated/parent/child/$childId` — drill-down: lessons, tutors, recordings, messages-with-tutor
- Sidebar (`AppShell.tsx`) gets a Parent section when user has `parent` role.
- Signup: add "I'm a parent" option in account-type picker; `handle_new_user` trigger updated to grant `parent` role.
- RLS: parents can SELECT their linked child's `sessions`, `session_records`, `assignments` rows via a `is_parent_of(child_id)` security-definer function. No write access to child data.

### 2. Admin subscription & commission control
- Extend `platform_config` (or new `subscription_plans` table) so admins can CRUD plans for students and tutors:
  - name, audience (student|tutor), price, duration (day|week|month|quarter|year|custom days), features (jsonb), is_active, sort_order.
- New table `commission_rules` (scope: global|tutor|subject, target_id nullable, method: percent|fixed|hybrid, percent, fixed_amount, active_from/to).
- Server fns: `adminListPlans`, `adminUpsertPlan`, `adminDeletePlan`, `adminAssignPlanToUser`, `adminGrantPromoAccess`, `adminListCommissionRules`, `adminUpsertCommissionRule`, `computeCommissionForSession(session_id)`.
- Admin UI: extend `/_authenticated/admin` with two new tabs — **Plans** and **Commissions** — full CRUD tables, manual assignment dialog, promo grant dialog.
- All gated by `has_role(auth.uid(), 'admin')`.

### 3. Tutor content library hardening
- Already have `course_materials` + `course_material_access` + `course-materials` bucket. Add:
  - Folders: `course_folders` table (tutor_id, name, parent_id).
  - Versioning: `course_material_versions` (material_id, version, storage_path, uploaded_at).
  - Per-student access UI improvements on tutor side (multi-select students, bulk grant/revoke).
  - Student view: `/_authenticated/my-courses` already exists — add folder navigation + version history viewer.

### 4. Scheduling upgrades
- Extend `tutor_availability` with `buffer_minutes`, `timezone`.
- New `tutor_holidays` table (tutor_id, start_date, end_date, reason).
- New `session_recurrence` table (parent_session_id, rule: rrule string, until).
- Booking server fn respects: tutor weekly availability minus holidays minus existing bookings, applies buffer, converts to student's TZ.
- Student reschedule flow: cancel + rebook with one click within tutor rules.
- Waitlist: new `session_waitlist` table; offer slot when a cancellation opens.

## Out of scope for Phase 1 (call out for later phases)
- Stack migration to Next.js/Prisma/Redis — **rejected**, would erase current work as you asked.
- Self-hosted SFU media server (current WebRTC is 1:1 P2P via Supabase Realtime signaling).
- M-Pesa / EcoCash / Flutterwave / Paystack integrations.
- Additional languages beyond what's wired (i18n scaffolding only if you ask).
- PWA + offline support.
- AI visualization engine (equation→graph, physics animations, 3D).
- Breakout rooms, live polls, hand-raise reactions in classroom.
- Moderator / Support Agent / Super Admin roles (only Parent added now).
- SMS + push notifications (email already wired).

## Technical notes
- All new tables: `GRANT` block + RLS policies in the same migration.
- Parent access uses a `SECURITY DEFINER` `is_parent_of(_child uuid)` helper to avoid recursive RLS.
- Commission compute runs as a server fn, not a trigger, so admin overrides stay auditable.
- No changes to `src/integrations/supabase/*` auto-gen files.
- No changes to existing classroom/whiteboard code.

## Verification
- Build passes.
- Sign up as parent → invite child → child accepts → parent dashboard lists child's upcoming session.
- Admin creates a plan, assigns it to a student, student sees new plan in subscription page.
- Admin sets a 30% global commission, books a $20 session, `computeCommissionForSession` returns $6.
- Tutor uploads a v2 of a PDF, student sees v2 by default with v1 in history.
- Booking blocks a slot during a tutor holiday.

Reply **approve** to start, or tell me what to cut/add.
