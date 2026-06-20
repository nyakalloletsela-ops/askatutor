## What I'll build

### 1. Tutor course materials (upload + per-student access)
- New page `/_authenticated/courses` (tutor view) accessible from the dashboard.
- Tutors can upload videos, PDFs, slides, and add links — each tied to one of their existing **tutor_courses**.
- Per-material **access list**: tutor picks which of their students may view each video/file (default = private, no one until granted).
- Students see a new `/_authenticated/my-courses` page listing materials shared with them; clicking opens a signed video player / file preview.
- Storage: new private bucket `course-materials`; downloads served via short-lived signed URLs from a server function that checks access.

**Schema changes (new migration)**
- `course_materials` (id, course_id, tutor_id, title, kind: video|pdf|slide|link, storage_path, external_url, duration_sec, created_at) + RLS + GRANTs.
- `course_material_access` (material_id, student_id, granted_at) — unique pair + RLS so only the owning tutor / admin / the student themself can read their row.
- Storage bucket `course-materials` (private) + object policies: tutors write/delete inside their own `{tutor_id}/...` folder; reads only via signed URL from server function.
- Server fn `getCourseMaterialUrl({ materialId })` — verifies access (tutor owner, admin, or student in `course_material_access`) and returns a 5-min signed URL.

### 2. Admin subscription control
Expand `/admin/payments` so admins can fully manage `student_subscriptions` and `tutor_subscriptions`:
- Tabs: Pending / Approved / Rejected / All, with separate Students / Tutors filters.
- Per-row actions: **Approve**, **Reject**, **Revoke** (sets back to pending), **Edit amount**, **Add note**, **Delete**.
- New action: **Grant subscription manually** (admin creates an approved row for a chosen user without a transaction ref — e.g. comp/scholarship).
- DB: extend `sub_status` enum with `revoked` if not present; add `admin update + delete + insert` policies (admin already has UPDATE; add INSERT + DELETE for admin role); add `notes` editable.

### 3. Broken-link / route audit
- Scan all `<Link to=…>`, `<a href=…>`, and `navigate({to:…})` calls against the file-based routes in `src/routes/`.
- Fix any that point to non-existent routes (e.g. `/courses`, `/my-courses` will be added; broken admin sub-pages get redirected or stubbed).
- Repair Navbar / dashboard quick-actions / mobile tab bar entries that lead to 404s.

## Out of scope
- Public marketplace listing of courses (this turn keeps materials private per tutor → granted students only).
- Payment processing for courses (free-to-grant model; subscriptions remain manual M-Pesa/EcoCash flow).
- Video transcoding / HLS (we serve the original uploaded file via signed URL).

## File summary
- New: `supabase` migration; `src/routes/_authenticated/courses.tsx`; `src/routes/_authenticated/my-courses.tsx`; `src/lib/course-materials.functions.ts`; small `<VideoPlayer>` component.
- Edited: `src/routes/_authenticated/admin.payments.tsx` (full management UI); `src/routes/_authenticated/dashboard.tsx` + `Navbar.tsx` + `MobileTabBar.tsx` (link to new pages, fix broken links).

Approve and I'll implement.