# Phase 2 Build Plan

Three sequential phases. Each phase is its own approval cycle: ship 2A, verify, then 2B, then 2C. This keeps PRs reviewable and avoids a 30-file mega-migration.

## Phase 2A — Scheduling & Bookings

Goal: replace the current ad-hoc booking with a Preply-style engine.

### Data (one migration)
- `tutor_availability`: add `timezone text not null default 'UTC'`, `buffer_before_min int default 0`, `buffer_after_min int default 0`. (`tutor_holidays`, `session_recurrence`, `session_waitlist` already exist from Phase 1.)
- `sessions`: add `parent_session_id uuid` (recurrence link), `cancelled_at`, `cancelled_by`, `cancel_reason`, `rescheduled_from uuid`.
- New `booking_conflicts_check(tutor uuid, start timestamptz, duration int)` SECURITY DEFINER RPC returning bool — checks holidays, existing sessions + buffers, weekly availability window in tutor TZ.
- New `book_session(...)` RPC: transactional insert that calls the conflict check, expands recurrence rows, returns session id(s).
- New `reschedule_session(id, new_start)` and `cancel_session(id, reason)` RPCs respecting the existing immutability trigger (we extend the trigger to allow these RPC paths via a session GUC).
- GRANT + RLS on all new objects.

### Server functions (`src/lib/booking.functions.ts`)
- `getTutorAvailability(tutorId)` — public.
- `getBookableSlots(tutorId, weekStart, studentTz)` — computes free slots in student TZ from availability − holidays − sessions − buffers.
- `bookSession({ tutorId, startAt, durationMin, subject, recurrence?, isFree })` — auth, calls RPC.
- `rescheduleSession`, `cancelSession`, `joinWaitlist`, `leaveWaitlist`.
- `listMyUpcomingSessions(role)` — used by dashboards.

### UI
- `/_authenticated/book/$tutorId` — Preply-style week grid, TZ selector, duration picker, recurrence toggle (weekly N weeks), confirm modal, waitlist CTA when no slots.
- `/_authenticated/tutor/availability` — weekly grid editor with TZ, buffers, copy-week button. Links to existing `/tutor/holidays`.
- `/_authenticated/calendar` — day/week/month tabs (reuse `react-day-picker` for month; custom CSS grid for day/week). Role-aware: tutor sees students, student sees tutors.
- `/_authenticated/lessons` — list view with filters (upcoming / past / cancelled), reschedule + cancel actions, join-classroom button when within 10 min.
- Dashboard widget: "Next 3 lessons" card on student + tutor home.
- Email notification on book / reschedule / cancel via existing email queue (`enqueue_email`).

### Conflict prevention
Single source of truth = `booking_conflicts_check` RPC, called both client-side (UX) and server-side (authority) inside `book_session`. Unique partial index on `(tutor_id, scheduled_at)` where `status = 'scheduled'` as final safety net.

## Phase 2B — Tutor Marketplace

### Data
- `profiles`: add `intro_video_url text`, `languages text[]`, `years_experience int`, `is_verified bool default false`, `verification_type text`, `headline text`.
- New `tutor_favorites(student_id, tutor_id)` table + GRANT/RLS.
- Extend `list_public_tutors()` RPC to return the new fields + `is_favorited` (for current user).

### UI
- Redesign `/tutors` — left filter rail (subject, language, price range, rating ≥ N, availability today/this week, verified only), card grid with avatar, headline, rating, price, intro-video play overlay, favorite heart.
- Redesign `/tutors/$id` — hero with intro video player, verification badge, languages chips, subjects, experience, reviews list, sticky "Book a lesson" CTA opening Phase 2A flow.
- `/tutors/compare?ids=a,b,c` — side-by-side comparison table (up to 3).
- `/favorites` — saved tutors.
- Featured tutors carousel on home (uses existing `is_featured` flag).

### Storage
- New public bucket `tutor-intros` for intro videos (≤100MB MP4). Existing avatar bucket reused.

## Phase 2C — Content Library

### Data
- `course_materials`: add `folder_id uuid references course_folders`, `file_type text` (video|pdf|docx|pptx|image|other), `size_bytes bigint`.
- `assignments`: add `attachment_material_id uuid references course_materials` (or array — pick array for multi-file).
- Per-student access already modeled in `course_material_access`; ensure RLS uses it consistently.

### UI
- `/_authenticated/tutor/library` — folder tree on left, file grid on right, drag-to-folder, upload dropzone (multi-file, progress, file-type detection), version history drawer (uses `course_material_versions`), per-file student-access modal.
- `/_authenticated/student/library` — read-only view filtered by `course_material_access`, grouped by tutor / folder, inline PDF + video preview.
- Assignment editor: attach materials from the library or upload new.

### Storage
Reuse existing `course-materials` bucket. RLS via storage policies tied to `course_material_access`.

## Out of scope (deferred per user)
3D AI viz, mind maps, i18n, mobile apps, new payment gateways, SFU rebuild, classroom/whiteboard/AI upgrades.

## Verification per phase
- 2A: book a recurring weekly slot → 4 sessions appear; second student booking same slot blocked; cancel sends email; calendar week view renders in student TZ ≠ tutor TZ.
- 2B: filter by language + rating → list narrows; favorite persists across reload; compare 3 tutors renders.
- 2C: tutor uploads PDF v1 then v2 → student sees v2, v1 in history; un-granted student gets 403 on download URL.

## Approval
Reply **go 2A** to start. I'll ship 2A end-to-end (migration → server fns → UI → email), then pause for review before 2B.
