# AskATutorLive Dashboard System — Phased Rebuild

Linear/Notion aesthetic. Reuses existing auth, roles, sessions, whiteboard, classroom, messages, AI tools. Adds the missing modules end-to-end with real schemas.

## Design tokens (applied globally in `src/styles.css`)
- Background `oklch(0.99 0 0)` / surface `oklch(0.97 0.005 240)` / border `oklch(0.92 0.005 240)`
- Primary `oklch(0.55 0.18 255)` (blue 500-ish), foreground neutral slate
- Dark mode mirror with `oklch(0.14 0.02 250)` background
- Radius `0.625rem`, soft shadows (`0 1px 2px rgb(0 0 0 / 0.04)`), generous spacing, Inter font

## Phase 1 — Shared shell (this turn)
1. **`AppShell` layout** (`src/components/dashboard/AppShell.tsx`)
   - Collapsible sidebar (shadcn `Sidebar`, `collapsible="icon"`), active-route highlighting, mobile sheet, framer-motion transitions
   - Topbar: breadcrumbs, command-palette search (⌘K), notifications bell w/ unread badge, theme toggle, profile dropdown
   - Role-aware nav links (student / tutor / admin sets)
2. **Mount on `_authenticated.tsx`** wrapping the existing `<Outlet />` so every protected route gets the new chrome. Existing `MobileTabBar` retired.
3. **Reusable primitives** in `src/components/dashboard/`: `StatCard`, `SectionHeader`, `EmptyState`, `DataTable`, `PageContainer`.
4. **Restyle existing `/dashboard`** to use the new shell + StatCards. Role-branch into 3 dashboard components:
   - `StudentDashboard` — Upcoming classes, completed lessons, study hours, free minutes, subject progress (derived from sessions)
   - `TutorDashboard` — Earnings (sum sessions × rate), students count, sessions completed, avg rating, upcoming schedule, quick-launch classroom
   - `AdminDashboard` — totals (users/tutors/students/sessions/revenue), live sessions, recent signups, pending tutor apps

## Phase 2 — Missing modules (schemas + routes)
Single migration adds these tables (all with GRANTs + RLS scoped to owner/admin, service_role full):

| Table | Purpose |
|---|---|
| `assignments` | tutor-created homework: title, description, subject, due_at, tutor_id, student_id, attachment_path, status |
| `assignment_submissions` | student uploads: assignment_id, student_id, file_path, note, submitted_at, grade, feedback |
| `notes` | personal notes/bookmarks: user_id, title, body, kind (`note`/`bookmark`/`whiteboard`/`ai`), ref_id |
| `notifications` | user_id, type, title, body, link, read_at |
| `tutor_availability` | tutor_id, weekday, start_min, end_min |
| `tutor_resources` | tutor_id, title, kind, storage_path, subject, visibility |

Realtime enabled on `notifications` only (others stay polled — keeps `profiles`/`sessions` out of realtime per security memory).

New routes under `_authenticated/`:
- `assignments.tsx` (split view by role)
- `notes.tsx`
- `calendar.tsx` (month + agenda view from `sessions` + `assignments`)
- `notifications.tsx` (full inbox; bell shows last 8)
- `resources.tsx` (tutor uploads)
- `_authenticated/admin/payments.tsx`, `admin/reports.tsx`, `admin/moderation.tsx`, `admin/analytics.tsx` (recharts: users over time, revenue, session volume)

Server fns for each module in `src/lib/{name}.functions.ts` (TanStack `createServerFn` + `requireSupabaseAuth`).

## Phase 3 — Polish & integrations
- Notifications: triggers on `sessions` insert (reminder), `assignments` insert, new `messages` insert, `student_subscriptions` status change
- Real-time bell + toast via Supabase channel
- Dark mode via existing `use-theme` hook wired into topbar toggle, persisted
- Framer-motion page transitions, skeleton loaders, recharts for all analytics
- Mobile: sidebar becomes Sheet, topbar collapses, cards stack

## Technical notes
- Stack stays: TanStack Router/Query/Start, Supabase, Tailwind v4, shadcn, framer-motion (add `bun add framer-motion recharts` — recharts already present, check)
- All new tables: explicit `GRANT` for `authenticated` + `service_role`, no anon; RLS scoped to `auth.uid()` with admin override via `has_role`
- No edits to existing whiteboard/classroom/Jitsi code in this rebuild
- `MobileTabBar` removed in favor of sidebar Sheet
- Keep `list_public_tutors()` RPC as the only public-tutor surface

## Out of scope (will flag separately)
- Real payment processing (Stripe/Paddle) — admin payments page reads existing `*_subscriptions` tables only
- Session recording (no infra for it)
- Group chat (current `messages` is 1:1; would need rooms table)

## Delivery order
Phase 1 ships first (visible improvement immediately). Phase 2 ships as one migration + per-route follow-ups. Phase 3 is polish on top of Phase 2.

Approve to start Phase 1.
