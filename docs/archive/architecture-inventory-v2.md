# AskATutorLive — Sanitized Architecture Inventory V2

> Generated locally.
> Repository source code is not included.
> Secret values and sensitive files are excluded.
> This document is intended for architecture analysis.

## 1. Repository Summary

- Included files: **372**
- Source files analyzed: **338**
- Imports detected: **1306**
- Exports detected: **349**
- Functions detected: **368**
- Classes detected: **10**

## 2. File Types

| Extension | Count |
|---|---:|
| `.tsx` | 161 |
| `.sql` | 109 |
| `.ts` | 66 |
| `.json` | 7 |
| `[none]` | 7 |
| `.md` | 5 |
| `.txt` | 3 |
| `.toml` | 2 |
| `.png` | 2 |
| `.mjs` | 1 |
| `.css` | 1 |
| `.jpg` | 1 |
| `.gitignore` | 1 |
| `.lock` | 1 |
| `.prettierrc` | 1 |
| `.prettierignore` | 1 |
| `.ico` | 1 |
| `.jsonc` | 1 |
| `.js` | 1 |

## 3. Top-Level Directories

- `public/` — 3 files
- `scripts/` — 1 files
- `src/` — 227 files
- `supabase/` — 84 files
- `tests/` — 3 files

## 4. Complete File Inventory

`	ext
.gitignore
.prettierignore
.prettierrc
all_triggers.sql
architecture-inventory.md
askatutor-tree.txt
bun.lock
bunfig.toml
CATEGORY2_PRODUCTION_VERIFICATION_RESULT.md
check_auth_users.sql
check_auth_users_full.sql
check_category2_counts.sql
check_other_tables_rls.sql
check_participants_view.sql
check_profiles.sql
check_rls_status.sql
check_sessions_columns.sql
check_sessions_data.sql
check_table_counts.sql
check_trigger.sql
check_tutor_subscriptions.sql
check_user_id.sql
check_user_roles_data.sql
components.json
current_sessions_policies.sql
DEPLOYMENT.md
eslint.config.js
forum_posts_count.sql
GAP_REGISTER.md
inspect_policies_profiles.sql
inspect_policies_sessions.sql
inspect_policies_tutor_courses.sql
inspect_policies_tutor_subscriptions.sql
inspect_policies_user_roles.sql
inspect_profiles.sql
inspect_sessions.sql
inspect_tutor_courses.sql
inspect_tutor_subscriptions.sql
inspect_user_roles.sql
list_tables.sql
package.json
public/favicon.ico
public/logo.png
public/manifest.json
README.md
scripts/start-node.mjs
site_content_data.sql
src/assets/logo.jpg
src/assets/logo.png
src/components/admin/AiKeyManager.tsx
src/components/admin/AiProviderSelect.tsx
src/components/admin/ConfigToggle.tsx
src/components/ai/DiagramBlock.tsx
src/components/ai/SaveToNotes.tsx
src/components/ai/SmartMarkdown.tsx
src/components/classroom/ActionBar.tsx
src/components/classroom/AIAssistantPanel.tsx
src/components/classroom/ClassroomChat.tsx
src/components/classroom/ClassroomHeader.tsx
src/components/classroom/ClassroomShell.tsx
src/components/classroom/ClassroomStage.tsx
src/components/classroom/DeviceSettingsDialog.tsx
src/components/classroom/ParticipantsPanel.tsx
src/components/classroom/SidePanel.tsx
src/components/classroom/useSessionTimer.ts
src/components/classroom/VideoCard.tsx
src/components/classroom/VideoLayout.tsx
src/components/classroom/VideoStage.tsx
src/components/ClassroomFiles.tsx
src/components/dashboard/AdminHome.tsx
src/components/dashboard/AppShell.tsx
src/components/dashboard/CommandPalette.tsx
src/components/dashboard/primitives.tsx
src/components/dashboard/StudentHome.tsx
src/components/dashboard/TutorHome.tsx
src/components/home/HomeSections.tsx
src/components/InstallPrompt.tsx
src/components/lab3d/AmbientEmpty.tsx
src/components/lab3d/GeoView.tsx
src/components/lab3d/LanguageView.tsx
src/components/lab3d/physics.ts
src/components/lab3d/ProcessView.tsx
src/components/lab3d/Scene2D.tsx
src/components/lab3d/SimChat.tsx
src/components/lab3d/SimDispatch.tsx
src/components/lab3d/SimScene.tsx
src/components/lab3d/TimelineView.tsx
src/components/LorddaLab.tsx
src/components/MathTools.tsx
src/components/MobileTabBar.tsx
src/components/Navbar.tsx
src/components/payments/PayButton.tsx
src/components/ScheduleStudentCard.tsx
src/components/ScopeGate.tsx
src/components/ThreeDLab.tsx
src/components/ui/accordion.tsx
src/components/ui/alert.tsx
src/components/ui/alert-dialog.tsx
src/components/ui/aspect-ratio.tsx
src/components/ui/avatar.tsx
src/components/ui/badge.tsx
src/components/ui/breadcrumb.tsx
src/components/ui/button.tsx
src/components/ui/calendar.tsx
src/components/ui/card.tsx
src/components/ui/carousel.tsx
src/components/ui/chart.tsx
src/components/ui/checkbox.tsx
src/components/ui/collapsible.tsx
src/components/ui/command.tsx
src/components/ui/context-menu.tsx
src/components/ui/dialog.tsx
src/components/ui/drawer.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/form.tsx
src/components/ui/hover-card.tsx
src/components/ui/input.tsx
src/components/ui/input-otp.tsx
src/components/ui/label.tsx
src/components/ui/menubar.tsx
src/components/ui/navigation-menu.tsx
src/components/ui/pagination.tsx
src/components/ui/popover.tsx
src/components/ui/progress.tsx
src/components/ui/radio-group.tsx
src/components/ui/resizable.tsx
src/components/ui/scroll-area.tsx
src/components/ui/select.tsx
src/components/ui/separator.tsx
src/components/ui/sheet.tsx
src/components/ui/sidebar.tsx
src/components/ui/skeleton.tsx
src/components/ui/slider.tsx
src/components/ui/sonner.tsx
src/components/ui/switch.tsx
src/components/ui/table.tsx
src/components/ui/tabs.tsx
src/components/ui/textarea.tsx
src/components/ui/toggle.tsx
src/components/ui/toggle-group.tsx
src/components/ui/tooltip.tsx
src/components/WebGLLab.tsx
src/components/whiteboard/ai/ConvertButton.tsx
src/components/whiteboard/ai/insertConversion.ts
src/components/whiteboard/canvas/engine.ts
src/components/whiteboard/canvas/exporter.ts
src/components/whiteboard/canvas/latex.ts
src/components/whiteboard/canvas/realtime.ts
src/components/whiteboard/canvas/renderer.ts
src/components/whiteboard/canvas/smooth.ts
src/components/whiteboard/canvas/Whiteboard.tsx
src/components/whiteboard/collaboration/cursors.tsx
src/components/whiteboard/index.ts
src/hooks/use-agent.ts
src/hooks/use-auth.tsx
src/hooks/useClassroomRTC.ts
src/hooks/use-entitlements.ts
src/hooks/use-mobile.tsx
src/hooks/use-platform-config.ts
src/hooks/use-theme.tsx
src/integrations/supabase/auth-attacher.ts
src/integrations/supabase/auth-middleware.ts
src/integrations/supabase/client.server.ts
src/integrations/supabase/client.ts
src/integrations/supabase/types.ts
src/lib/access.functions.ts
src/lib/admin.functions.ts
src/lib/agents/registry.server.ts
src/lib/agents/run-agent.functions.ts
src/lib/ai/keys.functions.ts
src/lib/ai/provider.server.ts
src/lib/ai-entitlement.ts
src/lib/ai-tools.functions.ts
src/lib/ai-tutor.functions.ts
src/lib/booking-emails.functions.ts
src/lib/classroom-rtc/index.ts
src/lib/classroom-rtc/PeerToPeerRTCService.ts
src/lib/classroom-rtc/types.ts
src/lib/course-materials.functions.ts
src/lib/email/enqueue.server.ts
src/lib/email/provider.server.ts
src/lib/email-templates/_shared.ts
src/lib/email-templates/booking-confirmation.tsx
src/lib/email-templates/help-confirmation.tsx
src/lib/email-templates/help-new-ticket.tsx
src/lib/email-templates/registry.ts
src/lib/email-templates/subscription-approved.tsx
src/lib/email-templates/subscription-rejected.tsx
src/lib/email-templates/welcome.tsx
src/lib/entitlements.functions.ts
src/lib/error-capture.ts
src/lib/error-page.ts
src/lib/help.functions.ts
src/lib/lab-modules.ts
src/lib/payments/checkout.functions.ts
src/lib/payments/paypal.server.ts
src/lib/payments/router.server.ts
src/lib/payments/webhook-actions.ts
src/lib/room-access.ts
src/lib/server/platform.ts
src/lib/sim-chat.functions.ts
src/lib/sim-lab.functions.ts
src/lib/students.functions.ts
src/lib/utils.ts
src/lib/webgl/geometry.ts
src/lib/webgl/mat4.ts
src/lib/webgl/renderer.ts
src/lib/webgl/scenes.ts
src/lib/whiteboard-ai.functions.ts
src/router.tsx
src/routes/__root.tsx
src/routes/_authenticated.tsx
src/routes/_authenticated/admin.ai.tsx
src/routes/_authenticated/admin.analytics.tsx
src/routes/_authenticated/admin.audit.tsx
src/routes/_authenticated/admin.classrooms.tsx
src/routes/_authenticated/admin.commissions.tsx
src/routes/_authenticated/admin.index.tsx
src/routes/_authenticated/admin.moderation.tsx
src/routes/_authenticated/admin.payments.tsx
src/routes/_authenticated/admin.payouts.tsx
src/routes/_authenticated/admin.plans.tsx
src/routes/_authenticated/admin.promotions.tsx
src/routes/_authenticated/admin.reports.tsx
src/routes/_authenticated/admin.students.tsx
src/routes/_authenticated/admin.tutors.tsx
src/routes/_authenticated/admin.whiteboard.tsx
src/routes/_authenticated/ai-tools.tsx
src/routes/_authenticated/ai-tutor.tsx
src/routes/_authenticated/assignments.tsx
src/routes/_authenticated/become-tutor.tsx
src/routes/_authenticated/book.$tutorId.tsx
src/routes/_authenticated/calendar.tsx
src/routes/_authenticated/certificate.tsx
src/routes/_authenticated/classroom.$roomId.tsx
src/routes/_authenticated/code.tsx
src/routes/_authenticated/courses.tsx
src/routes/_authenticated/dashboard.tsx
src/routes/_authenticated/labs.tsx
src/routes/_authenticated/labs_.simulation-lab.tsx
src/routes/_authenticated/lessons.tsx
src/routes/_authenticated/messages.tsx
src/routes/_authenticated/my-courses.tsx
src/routes/_authenticated/notes.tsx
src/routes/_authenticated/notifications.tsx
src/routes/_authenticated/parent.children.tsx
src/routes/_authenticated/parent.tsx
src/routes/_authenticated/pay-tutor.tsx
src/routes/_authenticated/records.tsx
src/routes/_authenticated/resources.tsx
src/routes/_authenticated/settings.tsx
src/routes/_authenticated/tutor.availability.tsx
src/routes/_authenticated/tutor.holidays.tsx
src/routes/_authenticated/wallet.tsx
src/routes/_authenticated/whiteboard-review.$sessionId.tsx
src/routes/api/checkout/return.tsx
src/routes/api/public/webhooks/paypal.ts
src/routes/auth.tsx
src/routes/checkout.cancelled.tsx
src/routes/checkout.failed.tsx
src/routes/checkout.success.tsx
src/routes/community.tsx
src/routes/email/unsubscribe.ts
src/routes/help.tsx
src/routes/index.tsx
src/routes/leaderboard.tsx
src/routes/tutor.$id.tsx
src/routes/tutors.tsx
src/routes/unsubscribe.tsx
src/routeTree.gen.ts
src/server.ts
src/start.ts
src/styles.css
src-tree.txt
supabase/.temp/gotrue-version
supabase/.temp/linked-project.json
supabase/.temp/pooler-url
supabase/.temp/postgres-version
supabase/.temp/project-ref
supabase/.temp/rest-version
supabase/.temp/storage-migration
supabase/.temp/storage-version
supabase/config.toml
supabase/migrations/20260518180453_b7b6b188-b2f9-4a6e-8317-5f8fd52bffac.sql
supabase/migrations/20260518180507_8749a32b-dc91-4e11-b9de-8107bc6e9a43.sql
supabase/migrations/20260518180559_079a0331-844f-4a93-af54-df8c3b16c8ff.sql
supabase/migrations/20260520134733_17b373c0-0c07-41a8-a4e7-7a2d37738f9b.sql
supabase/migrations/20260521120359_e0e495a3-e6c6-4d8c-9376-6aab3bcb158c.sql
supabase/migrations/20260521120426_f8a86ba3-535c-4a9b-9c14-d92ffe33f02c.sql
supabase/migrations/20260521120758_573f01a8-70c7-4bea-904d-df0f39bd7928.sql
supabase/migrations/20260522062230_43125182-8270-4977-9b19-ccf05619dfc1.sql
supabase/migrations/20260522073549_72500aff-965a-49a8-b3ab-2239c850168b.sql
supabase/migrations/20260522080609_f51f3676-392c-4338-9bf9-df9c105ace54.sql
supabase/migrations/20260522081314_e4dfd053-8a0b-4f10-b201-0bf7b8ed2693.sql
supabase/migrations/20260522083220_390d842b-0b64-43c7-b5e6-c87b5c7fd60f.sql
supabase/migrations/20260522085703_b8342121-277e-478e-9c42-e2786a56c7c3.sql
supabase/migrations/20260522085716_cae43fa7-ce66-4c10-81a1-e0f4588a6e75.sql
supabase/migrations/20260522092853_email_infra.sql
supabase/migrations/20260522092905_email_infra.sql
supabase/migrations/20260522093122_email_infra.sql
supabase/migrations/20260522105704_683e0c7c-3a9f-4da8-822e-a34d221a36f2.sql
supabase/migrations/20260522110136_e7689ab4-ce46-4391-8a25-1cc5f1eb3a9d.sql
supabase/migrations/20260522113118_7b053bf2-58a5-48b8-8dbe-dbb0583cf4a1.sql
supabase/migrations/20260522120800_fe282aa0-ce58-4c5b-a14a-79b180215e97.sql
supabase/migrations/20260523081725_04e83f6c-dd2a-4938-9b33-3e24fa61ed29.sql
supabase/migrations/20260523083334_1bbbc501-2402-4d07-a676-38c68d2d1f0b.sql
supabase/migrations/20260524041428_148987e9-23da-47fa-8182-294dcfc9400c.sql
supabase/migrations/20260524041718_e722d83c-5457-4ec3-b7b6-c6e8be29c3df.sql
supabase/migrations/20260524041736_08febb8a-724f-4196-9c78-0b3d6784c153.sql
supabase/migrations/20260524042040_6fd4de5c-4856-4bbc-a86b-eda4026f5bff.sql
supabase/migrations/20260524042244_6ecb8491-343f-435d-9189-c0e2483ea230.sql
supabase/migrations/20260524042859_808cd5c3-c692-4ca0-b22d-e5359b17464c.sql
supabase/migrations/20260524043637_d17d6f91-84c3-45ff-af6b-648a666f715d.sql
supabase/migrations/20260524044641_c5814e6b-fe15-459d-96b0-746ba98fdc2c.sql
supabase/migrations/20260524044744_email_infra.sql
supabase/migrations/20260524051514_1878b3e2-125a-46eb-a789-fa1409028e71.sql
supabase/migrations/20260524064757_b2d8e9c2-2d6e-4b76-8a73-dd3c1987a2ae.sql
supabase/migrations/20260524065325_6df81ffd-fb2e-4df8-ac71-5b5f8cd92554.sql
supabase/migrations/20260524070449_ae8130d6-d9a2-4437-8dd0-73c2893185b3.sql
supabase/migrations/20260524074439_b5bca5df-a7ce-40c8-a931-d1e64321d7b5.sql
supabase/migrations/20260525125039_8673bafb-4eda-434f-9900-1a4c688ab424.sql
supabase/migrations/20260528060818_02ef6fb2-553e-43f1-900a-bd8eb4dd56af.sql
supabase/migrations/20260530152504_b823d221-b60a-432b-85ac-0745a79e9d55.sql
supabase/migrations/20260601045818_f63dbd87-f3a0-4e98-8232-d380ac4a68f6.sql
supabase/migrations/20260605061006_40c146b5-f458-4620-a3ed-688348719a19.sql
supabase/migrations/20260611082303_c77aeed1-ee3d-4917-983d-abc4f0e52ceb.sql
supabase/migrations/20260620193809_e7f89819-b8cc-4e85-9441-39e6b31e579d.sql
supabase/migrations/20260620193831_7e7a3f45-9cbe-4ad4-91c4-0884121a0b3a.sql
supabase/migrations/20260622125739_8a71ad77-3504-43d2-92b4-3fedd6b2a91e.sql
supabase/migrations/20260622125757_eabc3c74-3adb-4b2a-bb50-d98a2da0a202.sql
supabase/migrations/20260622133155_c56722d8-1a65-4287-bf95-1c06689bba3f.sql
supabase/migrations/20260623074007_ddbe3e51-097a-4763-af33-95b236a42698.sql
supabase/migrations/20260623075231_4c324342-ee6b-47fa-ad48-39af2516c21c.sql
supabase/migrations/20260623082025_9963a138-6dc4-4d83-8b63-3cd31e3a7504.sql
supabase/migrations/20260623082050_70d58ecc-f89e-48ad-9e55-0d5e10f677f2.sql
supabase/migrations/20260623082342_5be4ee4e-9845-45f8-b995-dace190d24f1.sql
supabase/migrations/20260623100541_29ade4ae-9cc6-46bf-a916-ba9ecf155ff3.sql
supabase/migrations/20260623102100_68bc0646-a669-4dd9-9ba7-4cdb16225116.sql
supabase/migrations/20260623111535_6dc2ecd4-5f71-421a-a372-bd125820c267.sql
supabase/migrations/20260623113448_5862c988-44e2-423a-8dce-ff55c49cf774.sql
supabase/migrations/20260623114741_9a1edb8d-58ea-4825-8560-ba68d6527ab9.sql
supabase/migrations/20260623121121_6dd82a2e-a01a-42c2-a505-12240ec66391.sql
supabase/migrations/20260701082250_cc8fecf7-8ce5-4d5e-971b-0bad7a33e4e9.sql
supabase/migrations/20260701084425_090d5165-a08f-4cce-ba0a-56620c1578d1.sql
supabase/migrations/20260811090000_29d8fece-92c9-4bab-a85f-e95d49161abf.sql
supabase/migrations/20260812060000_p0_security_fixes.sql
supabase/migrations/20260812100000_close_session_insert_bypass.sql
supabase/migrations/20260812120000_restore_whiteboard_chat_tables.sql
supabase/migrations/20260812130000_harden_rpc_grants_and_guards.sql
supabase/migrations/20260812140000_revoke_public_execute_grants.sql
supabase/migrations/20260812150000_align_booking_gate_with_subscriptions_flag.sql
supabase/migrations/20260813090000_add_rls_profiles_user_roles_policies.sql
supabase/migrations/20260814090000_add_rls_admin_operations_policies.sql
supabase/migrations/20260814140000_add_rls_entitlement_gates_beyond_book_session.sql
supabase/migrations/20260815090000_add_rls_tutor_app_promotion_validation.sql
supabase/migrations/20260815140000_add_rls_parent_role_policies.sql
supabase_schema.json
supabase_schema.txt
tests/ai-entitlement.test.ts
tests/room-access.test.ts
tests/webhook-actions.test.ts
tsconfig.json
tutor_apps_count.sql
verify_profiles_policies.sql
verify_rpcs.sql
verify_sessions_policies.sql
verify_tutor_courses_policies.sql
verify_tutor_subscriptions_policies.sql
verify_user_roles_policies.sql
vite.config.ts
wrangler.jsonc
ZERO_META.json
### `all_triggers.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.2 KB

### `check_auth_users.sql`

- Category: **Authentication / Authorization**
- Type: `.sql`
- Size: 0.1 KB

### `check_auth_users_full.sql`

- Category: **Authentication / Authorization**
- Type: `.sql`
- Size: 0.1 KB

### `check_category2_counts.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.5 KB

### `check_other_tables_rls.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `check_participants_view.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `check_profiles.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `check_rls_status.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.2 KB

### `check_sessions_columns.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `check_sessions_data.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0 KB

### `check_table_counts.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.3 KB

### `check_trigger.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.2 KB

### `check_tutor_subscriptions.sql`

- Category: **Commerce / Payment**
- Type: `.sql`
- Size: 0 KB

### `check_user_id.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `check_user_roles_data.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0 KB

### `current_sessions_policies.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `eslint.config.js`

- Category: **Other**
- Type: `.js`
- Size: 1.2 KB
- Imports:
  - `@eslint/js`
  - `eslint-plugin-prettier/recommended`
  - `eslint-plugin-react-hooks`
  - `eslint-plugin-react-refresh`
  - `globals`
  - `typescript-eslint`

### `forum_posts_count.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0 KB

### `inspect_policies_profiles.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `inspect_policies_sessions.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `inspect_policies_tutor_courses.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `inspect_policies_tutor_subscriptions.sql`

- Category: **Commerce / Payment**
- Type: `.sql`
- Size: 0.1 KB

### `inspect_policies_user_roles.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `inspect_profiles.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `inspect_sessions.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `inspect_tutor_courses.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `inspect_tutor_subscriptions.sql`

- Category: **Commerce / Payment**
- Type: `.sql`
- Size: 0.2 KB

### `inspect_user_roles.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `list_tables.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `scripts/start-node.mjs`

- Category: **Other**
- Type: `.mjs`
- Size: 0.5 KB

### `site_content_data.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0 KB

### `src/components/admin/AiKeyManager.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 5.7 KB
- Detected capabilities: AI
- Imports:
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/lib/ai/keys.functions`
  - `@tanstack/react-start`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `AiKeyManager`
- Functions:
  - `AiKeyManager`
- Possible React components:
  - `AiKeyManager`
  - `META`

### `src/components/admin/AiProviderSelect.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.2 KB
- Detected capabilities: Supabase, AI, Classroom
- Imports:
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/hooks/use-platform-config`
  - `@/integrations/supabase/client`
  - `@tanstack/react-query`
  - `sonner`
- Exports:
  - `AiProviderSelect`
- Functions:
  - `AiProviderSelect`
- Possible React components:
  - `AiProviderSelect`
  - `OPTIONS`

### `src/components/admin/ConfigToggle.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.3 KB
- Detected capabilities: Supabase
- Imports:
  - `@/components/ui/button`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/switch`
  - `@/hooks/use-platform-config`
  - `@/integrations/supabase/client`
  - `@tanstack/react-query`
  - `react`
  - `sonner`
- Exports:
  - `ConfigToggle`
- Functions:
  - `ConfigToggle`
  - `NumberRow`
- Possible React components:
  - `ConfigToggle`
  - `NumberRow`

### `src/components/ai/DiagramBlock.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.3 KB
- Detected capabilities: Classroom
- Imports:
  - `lucide-react`
  - `react`
- Exports:
  - `DiagramBlock`
- Functions:
  - `DiagramBlock`
  - `loadMermaid`
- Possible React components:
  - `DiagramBlock`

### `src/components/ai/SaveToNotes.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.8 KB
- Detected capabilities: Supabase, Classroom, Assessment
- Imports:
  - `@/components/ui/button`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `SaveToNotes`
- Functions:
  - `SaveToNotes`
- Possible React components:
  - `SaveToNotes`

### `src/components/ai/SmartMarkdown.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.6 KB
- Detected capabilities: Classroom, Learning
- Imports:
  - `./DiagramBlock`
  - `@/lib/utils`
  - `katex/dist/katex.min.css`
  - `react-markdown`
  - `rehype-katex`
  - `remark-gfm`
  - `remark-math`
- Exports:
  - `SmartMarkdown`
- Functions:
  - `SmartMarkdown`
- Possible React components:
  - `SmartMarkdown`

### `src/components/classroom/ActionBar.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 9.5 KB
- Detected capabilities: Classroom
- Imports:
  - `./ClassroomStage`
  - `./VideoLayout`
  - `@/components/ui/button`
  - `@/components/ui/popover`
  - `@/hooks/use-mobile`
  - `lucide-react`
- Exports:
  - `ActionBar`
  - `PanelKey`
- Functions:
  - `ActionBar`
  - `CircleButton`
  - `Group`
  - `PillButton`
- Possible React components:
  - `ActionBar`
  - `CircleButton`
  - `Group`
  - `PillButton`

### `src/components/classroom/AIAssistantPanel.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 4.3 KB
- Detected capabilities: Authorization
- Imports:
  - `@/components/ai/SmartMarkdown`
  - `@/components/ui/button`
  - `@/components/ui/textarea`
  - `@/hooks/use-agent`
  - `@/lib/utils`
  - `lucide-react`
  - `react`
- Exports:
  - `AIAssistantPanel`
- Functions:
  - `AIAssistantPanel`
- Possible React components:
  - `AIAssistantPanel`
  - `ROLES`

### `src/components/classroom/ClassroomChat.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 3.8 KB
- Detected capabilities: Supabase, Classroom
- Imports:
  - `@/components/ui/button`
  - `@/components/ui/input`
  - `@/integrations/supabase/client`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `ClassroomChat`
- Functions:
  - `ClassroomChat`
- Possible React components:
  - `ClassroomChat`

### `src/components/classroom/ClassroomHeader.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 3.3 KB
- Detected capabilities: Authentication, Classroom
- Imports:
  - `./useSessionTimer`
  - `@/components/ui/button`
  - `@/lib/classroom-rtc`
  - `@tanstack/react-router`
  - `lucide-react`
- Exports:
  - `ClassroomHeader`
- Functions:
  - `ClassroomHeader`
  - `QualityChip`
- Possible React components:
  - `ClassroomHeader`
  - `QualityChip`

### `src/components/classroom/ClassroomShell.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 10.7 KB
- Detected capabilities: Classroom, Realtime
- Imports:
  - `./ActionBar`
  - `./ClassroomHeader`
  - `./ClassroomStage`
  - `./DeviceSettingsDialog`
  - `./SidePanel`
  - `./VideoLayout`
  - `@/components/ui/button`
  - `@/components/ui/sheet`
  - `@/hooks/useClassroomRTC`
  - `@/hooks/use-mobile`
  - `@/lib/lab-modules`
  - `@tanstack/react-router`
  - `framer-motion`
  - `lucide-react`
  - `react`
- Exports:
  - `ClassroomShell`
- Functions:
  - `ClassroomShell`
- Possible React components:
  - `ClassroomShell`

### `src/components/classroom/ClassroomStage.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.7 KB
- Detected capabilities: Classroom
- Imports:
  - `@/components/LorddaLab`
  - `@/components/whiteboard`
  - `lucide-react`
- Exports:
  - `ClassroomStage`
  - `StageKey`
- Functions:
  - `ClassroomStage`
  - `StageTab`
- Possible React components:
  - `ClassroomStage`
  - `StageTab`

### `src/components/classroom/DeviceSettingsDialog.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.6 KB
- Detected capabilities: Classroom
- Imports:
  - `@/components/ui/dialog`
  - `@/components/ui/label`
  - `@/lib/classroom-rtc`
  - `react`
- Exports:
  - `DeviceSettingsDialog`
- Functions:
  - `DeviceSettingsDialog`
  - `Row`
- Possible React components:
  - `DeviceSettingsDialog`
  - `Row`

### `src/components/classroom/ParticipantsPanel.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 4.1 KB
- Detected capabilities: Supabase, Classroom, Realtime
- Imports:
  - `@/components/ui/button`
  - `@/integrations/supabase/client`
  - `@/lib/classroom-rtc/types`
  - `@supabase/supabase-js`
  - `lucide-react`
  - `react`
- Exports:
  - `ParticipantsPanel`
- Functions:
  - `ParticipantRow`
  - `ParticipantsPanel`
- Possible React components:
  - `ParticipantRow`
  - `ParticipantsPanel`

### `src/components/classroom/SidePanel.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 6.8 KB
- Detected capabilities: Supabase, Classroom, Storage, Learning
- Imports:
  - `./AIAssistantPanel`
  - `./ClassroomChat`
  - `@/components/ClassroomFiles`
  - `@/components/ui/button`
  - `@/components/ui/tabs`
  - `@/integrations/supabase/client`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `ClassroomSidePanel`
  - `SidePanelKey`
  - `UsedLab`
- Functions:
  - `ClassroomSidePanel`
  - `NotesTab`
- Classes:
  - `files`
- Possible React components:
  - `ClassroomSidePanel`
  - `NotesTab`

### `src/components/classroom/useSessionTimer.ts`

- Category: **UI Component**
- Type: `.ts`
- Size: 0.7 KB
- Detected capabilities: Authentication
- Imports:
  - `react`
- Exports:
  - `fmtTimer`
  - `useSessionTimer`
- Functions:
  - `fmtTimer`
  - `useSessionTimer`

### `src/components/classroom/VideoCard.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 4.4 KB
- Detected capabilities: Classroom
- Imports:
  - `@/lib/classroom-rtc`
  - `lucide-react`
  - `react`
- Exports:
  - `VideoCard`
- Functions:
  - `QualityIcon`
  - `VideoCard`
- Possible React components:
  - `QualityIcon`
  - `VideoCard`

### `src/components/classroom/VideoLayout.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 8.7 KB
- Detected capabilities: Classroom, Realtime
- Imports:
  - `./VideoCard`
  - `@/lib/classroom-rtc`
  - `framer-motion`
  - `lucide-react`
  - `react`
- Exports:
  - `AnimatedVideoLayout`
  - `LayoutMode`
  - `VideoLayout`
  - `VideoSlot`
- Functions:
  - `AnimatedVideoLayout`
  - `FloatingTile`
  - `FocusBubble`
  - `TopStrip`
  - `VideoLayout`
- Possible React components:
  - `AnimatedVideoLayout`
  - `FloatingTile`
  - `FocusBubble`
  - `TILE_H`
  - `TILE_W`
  - `TopStrip`
  - `VideoLayout`
  - `W`

### `src/components/classroom/VideoStage.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.5 KB
- Detected capabilities: Classroom
- Imports:
  - `./VideoCard`
  - `@/lib/classroom-rtc`
  - `lucide-react`
  - `react`
- Exports:
  - `VideoStage`
- Functions:
  - `FloatingTile`
  - `VideoStage`
- Possible React components:
  - `FloatingTile`
  - `VideoStage`

### `src/components/ClassroomFiles.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 5.1 KB
- Detected capabilities: Supabase, Classroom, Storage
- Imports:
  - `@/components/ui/button`
  - `@/components/ui/tabs`
  - `@/integrations/supabase/client`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `ClassroomFiles`
- Functions:
  - `ClassroomFiles`
- Possible React components:
  - `BUCKET`
  - `ClassroomFiles`

### `src/components/dashboard/AdminHome.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 22.3 KB
- Detected capabilities: Supabase, Authentication, Authorization, Email, Scheduling
- Imports:
  - `@/components/ui/alert-dialog`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/checkbox`
  - `@/components/ui/switch`
  - `@/components/ui/textarea`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `AdminHome`
- Functions:
  - `AdminHome`
  - `Stat`
- Possible React components:
  - `AdminHome`
  - `Stat`

### `src/components/dashboard/AppShell.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 15.8 KB
- Detected capabilities: Supabase, Authentication, Payments, Classroom, Email, Scheduling, Learning
- Imports:
  - `@/assets/logo.png`
  - `@/components/dashboard/CommandPalette`
  - `@/components/ui/avatar`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/dropdown-menu`
  - `@/components/ui/sidebar`
  - `@/hooks/use-auth`
  - `@/hooks/use-theme`
  - `@/integrations/supabase/client`
  - `@/lib/utils`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
- Exports:
  - `AppShell`
- Functions:
  - `AppShell`
  - `buildCrumbs`
  - `NavLink`
  - `NotificationsBell`
  - `prettify`
- Possible React components:
  - `AppShell`
  - `NavLink`
  - `NotificationsBell`

### `src/components/dashboard/CommandPalette.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 3.2 KB
- Detected capabilities: Payments, Learning
- Imports:
  - `@/components/ui/command`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
- Exports:
  - `CommandPalette`
- Functions:
  - `CommandPalette`
- Possible React components:
  - `CommandPalette`

### `src/components/dashboard/primitives.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 4.2 KB
- Imports:
  - `@/lib/utils`
  - `@tanstack/react-router`
  - `lucide-react`
- Exports:
  - `EmptyState`
  - `PageContainer`
  - `QuickAction`
  - `SectionHeader`
  - `StatCard`
- Functions:
  - `EmptyState`
  - `PageContainer`
  - `QuickAction`
  - `SectionHeader`
  - `StatCard`
- Possible React components:
  - `EmptyState`
  - `PageContainer`
  - `QuickAction`
  - `SectionHeader`
  - `StatCard`

### `src/components/dashboard/StudentHome.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 20.7 KB
- Detected capabilities: Supabase, Authentication, Classroom, Scheduling, Assessment, Learning
- Imports:
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `recharts`
- Exports:
  - `StudentHome`
- Functions:
  - `AiAction`
  - `ContinueTile`
  - `StudentHome`
  - `timeAgo`
- Classes:
  - `scheduled`
- Possible React components:
  - `AiAction`
  - `ContinueTile`
  - `StudentHome`

### `src/components/dashboard/TutorHome.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 21 KB
- Detected capabilities: Supabase, Authentication, Payments, Classroom, Scheduling, Assessment, Learning
- Imports:
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/progress`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
- Exports:
  - `TutorHome`
- Functions:
  - `AiAction`
  - `fmtMins`
  - `StatTile`
  - `TutorHome`
- Classes:
  - `scheduled`
- Possible React components:
  - `AiAction`
  - `StatTile`
  - `TutorHome`
  - `WEEKDAYS`

### `src/components/home/HomeSections.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 13.2 KB
- Detected capabilities: Authentication, Authorization, Payments, Classroom, Learning
- Imports:
  - `@/components/ui/accordion`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@tanstack/react-router`
  - `lucide-react`
- Exports:
  - `FAQ`
  - `FinalCTA`
  - `HowItWorks`
  - `PricingSnapshot`
  - `SuccessStories`
  - `TrustStrip`
  - `WhyUs`
- Functions:
  - `FAQ`
  - `FinalCTA`
  - `HowItWorks`
  - `PricingSnapshot`
  - `SuccessStories`
  - `TrustStrip`
  - `WhyUs`
- Classes:
  - `in`
- Possible React components:
  - `FAQ`
  - `FinalCTA`
  - `HowItWorks`
  - `PricingSnapshot`
  - `SuccessStories`
  - `TrustStrip`
  - `WhyUs`

### `src/components/InstallPrompt.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 3.6 KB
- Detected capabilities: Authentication, Storage
- Imports:
  - `@/components/ui/button`
  - `lucide-react`
  - `react`
- Exports:
  - `InstallPrompt`
- Functions:
  - `InstallPrompt`
- Possible React components:
  - `InstallPrompt`

### `src/components/lab3d/AmbientEmpty.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 3.3 KB
- Imports:
  - `lucide-react`
- Exports:
  - `AmbientEmpty`
- Functions:
  - `AmbientEmpty`
- Possible React components:
  - `AmbientEmpty`

### `src/components/lab3d/GeoView.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 3.5 KB
- Imports:
  - `@/lib/sim-lab.functions`
- Exports:
  - `GeoView`
- Functions:
  - `GeoView`
  - `project`
- Possible React components:
  - `GeoView`
  - `W`

### `src/components/lab3d/LanguageView.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 3.1 KB
- Imports:
  - `@/lib/sim-lab.functions`
  - `lucide-react`
- Exports:
  - `LanguageView`
- Functions:
  - `LanguageView`
  - `speak`
- Possible React components:
  - `LanguageView`

### `src/components/lab3d/physics.ts`

- Category: **UI Component**
- Type: `.ts`
- Size: 5.8 KB
- Imports:
  - `@/lib/sim-lab.functions`
- Exports:
  - `buildInitialState`
  - `SimObjectState`
  - `stepSim`
  - `Vec3`
- Functions:
  - `buildInitialState`
  - `stepSim`
  - `toSize`
  - `toVec3`
- Possible React components:
  - `FIXED_TYPES`
  - `PALETTE`

### `src/components/lab3d/ProcessView.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 4.3 KB
- Detected capabilities: Learning
- Imports:
  - `@/lib/sim-lab.functions`
  - `lucide-react`
  - `react`
- Exports:
  - `ProcessView`
- Functions:
  - `ProcessView`
- Possible React components:
  - `ProcessView`

### `src/components/lab3d/Scene2D.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 3.8 KB
- Imports:
  - `@/lib/sim-lab.functions`
  - `react`
- Exports:
  - `Scene2D`
- Functions:
  - `safeEval`
  - `Scene2D`
- Possible React components:
  - `Scene2D`
  - `W`

### `src/components/lab3d/SimChat.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 4.4 KB
- Detected capabilities: Authorization, Assessment
- Imports:
  - `@/components/ui/button`
  - `@/components/ui/input`
  - `@/lib/sim-chat.functions`
  - `@/lib/sim-lab.functions`
  - `@tanstack/react-start`
  - `lucide-react`
  - `react`
- Exports:
  - `SimChat`
- Functions:
  - `send`
  - `SimChat`
- Possible React components:
  - `SimChat`

### `src/components/lab3d/SimDispatch.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.1 KB
- Imports:
  - `./GeoView`
  - `./LanguageView`
  - `./ProcessView`
  - `./Scene2D`
  - `./TimelineView`
  - `@/lib/sim-lab.functions`
  - `lucide-react`
  - `react`
  - `three`
- Exports:
  - `SimDispatch`
- Functions:
  - `SimDispatch`
- Possible React components:
  - `SimDispatch`
  - `SimScene`

### `src/components/lab3d/SimScene.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 8 KB
- Imports:
  - `./physics`
  - `@/lib/sim-lab.functions`
  - `@react-three/drei`
  - `@react-three/fiber`
  - `react`
  - `three`
- Exports:
  - `SimScene`
- Functions:
  - `CanvasReadyBridge`
  - `ConnectionLine`
  - `ObjectMesh`
  - `SimRunner`
  - `SimScene`
- Possible React components:
  - `CanvasReadyBridge`
  - `ConnectionLine`
  - `ObjectMesh`
  - `SimRunner`
  - `SimScene`

### `src/components/lab3d/TimelineView.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.5 KB
- Imports:
  - `@/lib/sim-lab.functions`
  - `react`
- Exports:
  - `TimelineView`
- Functions:
  - `TimelineView`
- Possible React components:
  - `TimelineView`

### `src/components/LorddaLab.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 11.2 KB
- Detected capabilities: Supabase, Authentication, Classroom, Realtime
- Imports:
  - `@/components/ui/button`
  - `@/components/ui/input`
  - `@/components/ui/select`
  - `@/integrations/supabase/client`
  - `@/lib/lab-modules`
  - `lucide-react`
  - `react`
- Exports:
  - `LorddaLab`
- Functions:
  - `LorddaLab`
- Possible React components:
  - `LorddaLab`

### `src/components/MathTools.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 8.2 KB
- Imports:
  - `@/components/ui/button`
  - `@/components/ui/tabs`
  - `katex`
  - `katex/dist/katex.min.css`
  - `lucide-react`
  - `mathjs`
  - `react`
  - `recharts`
  - `sonner`
- Exports:
  - `MathTools`
- Functions:
  - `CalcPad`
  - `GraphPlotter`
  - `LatexEditor`
  - `LatexPreview`
  - `MathTools`
- Possible React components:
  - `CalcPad`
  - `GraphPlotter`
  - `LatexEditor`
  - `LatexPreview`
  - `MathTools`
  - `PRESETS`

### `src/components/MobileTabBar.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.4 KB
- Detected capabilities: Classroom
- Imports:
  - `@/hooks/use-auth`
  - `@tanstack/react-router`
  - `lucide-react`
- Exports:
  - `MobileTabBar`
- Functions:
  - `MobileTabBar`
- Possible React components:
  - `MobileTabBar`

### `src/components/Navbar.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 7 KB
- Detected capabilities: Supabase, Authentication, Payments, Classroom, Learning
- Imports:
  - `@/assets/logo.png`
  - `@/components/ui/button`
  - `@/hooks/use-auth`
  - `@/hooks/use-theme`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
- Exports:
  - `Navbar`
- Functions:
  - `Navbar`
- Possible React components:
  - `APP_SHELL_PREFIXES`
  - `Navbar`

### `src/components/payments/PayButton.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.9 KB
- Detected capabilities: Authentication, Payments, Classroom
- Imports:
  - `@/components/ui/button`
  - `@/lib/payments/checkout.functions`
  - `@tanstack/react-start`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `PayButton`
- Functions:
  - `PayButton`
- Possible React components:
  - `PayButton`

### `src/components/ScheduleStudentCard.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 4.9 KB
- Detected capabilities: Supabase, Authentication, Email, Scheduling
- Imports:
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/integrations/supabase/client`
  - `@/lib/booking-emails.functions`
  - `@/lib/students.functions`
  - `@tanstack/react-start`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `ScheduleStudentCard`
- Functions:
  - `ScheduleStudentCard`
- Possible React components:
  - `ScheduleStudentCard`

### `src/components/ScopeGate.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.5 KB
- Imports:
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/hooks/use-entitlements`
  - `@/lib/entitlements.functions`
  - `@tanstack/react-router`
  - `lucide-react`
- Exports:
  - `ScopeGate`
- Functions:
  - `ScopeGate`
- Possible React components:
  - `ScopeGate`

### `src/components/ThreeDLab.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 3 KB
- Detected capabilities: Authentication
- Imports:
  - `@/components/ui/button`
  - `lucide-react`
  - `react`
- Exports:
  - `ThreeDLab`
- Functions:
  - `ThreeDLab`
- Possible React components:
  - `LAB_URL`
  - `ThreeDLab`

### `src/components/ui/accordion.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-accordion`
  - `lucide-react`
  - `react`
- Possible React components:
  - `Accordion`
  - `AccordionContent`
  - `AccordionItem`
  - `AccordionTrigger`

### `src/components/ui/alert.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.6 KB
- Detected capabilities: Authorization
- Imports:
  - `@/lib/utils`
  - `class-variance-authority`
  - `react`
- Possible React components:
  - `Alert`
  - `AlertDescription`
  - `AlertTitle`

### `src/components/ui/alert-dialog.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 4.1 KB
- Imports:
  - `@/components/ui/button`
  - `@/lib/utils`
  - `@radix-ui/react-alert-dialog`
  - `react`
- Possible React components:
  - `AlertDialog`
  - `AlertDialogAction`
  - `AlertDialogCancel`
  - `AlertDialogContent`
  - `AlertDialogDescription`
  - `AlertDialogFooter`
  - `AlertDialogHeader`
  - `AlertDialogOverlay`
  - `AlertDialogPortal`
  - `AlertDialogTitle`
  - `AlertDialogTrigger`

### `src/components/ui/aspect-ratio.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 0.1 KB
- Imports:
  - `@radix-ui/react-aspect-ratio`
- Possible React components:
  - `AspectRatio`

### `src/components/ui/avatar.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.4 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-avatar`
  - `react`
- Possible React components:
  - `Avatar`
  - `AvatarFallback`
  - `AvatarImage`

### `src/components/ui/badge.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.1 KB
- Imports:
  - `@/lib/utils`
  - `class-variance-authority`
  - `react`
- Exports:
  - `BadgeProps`
- Functions:
  - `Badge`
- Possible React components:
  - `Badge`

### `src/components/ui/breadcrumb.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.7 KB
- Detected capabilities: Authorization
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-slot`
  - `lucide-react`
  - `react`
- Possible React components:
  - `Breadcrumb`
  - `BreadcrumbEllipsis`
  - `BreadcrumbItem`
  - `BreadcrumbLink`
  - `BreadcrumbList`
  - `BreadcrumbPage`
  - `BreadcrumbSeparator`
  - `Comp`

### `src/components/ui/button.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.8 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-slot`
  - `class-variance-authority`
  - `react`
- Exports:
  - `ButtonProps`
- Possible React components:
  - `Button`
  - `Comp`

### `src/components/ui/calendar.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 7 KB
- Imports:
  - `@/components/ui/button`
  - `@/lib/utils`
  - `lucide-react`
  - `react`
  - `react-day-picker`
- Functions:
  - `Calendar`
  - `CalendarDayButton`
- Possible React components:
  - `Calendar`
  - `CalendarDayButton`

### `src/components/ui/card.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.8 KB
- Imports:
  - `@/lib/utils`
  - `react`
- Possible React components:
  - `Card`
  - `CardContent`
  - `CardDescription`
  - `CardFooter`
  - `CardHeader`
  - `CardTitle`

### `src/components/ui/carousel.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 6.1 KB
- Detected capabilities: Authorization
- Imports:
  - `@/components/ui/button`
  - `@/lib/utils`
  - `embla-carousel-react`
  - `lucide-react`
  - `react`
- Functions:
  - `useCarousel`
- Possible React components:
  - `Carousel`
  - `CarouselContent`
  - `CarouselContext`
  - `CarouselItem`
  - `CarouselNext`
  - `CarouselPrevious`

### `src/components/ui/chart.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 10.3 KB
- Detected capabilities: Classroom
- Imports:
  - `@/lib/utils`
  - `react`
  - `recharts`
- Exports:
  - `ChartConfig`
- Functions:
  - `getPayloadConfigFromPayload`
  - `useChart`
- Possible React components:
  - `ChartContainer`
  - `ChartContext`
  - `ChartLegend`
  - `ChartLegendContent`
  - `ChartStyle`
  - `ChartTooltip`
  - `ChartTooltipContent`
  - `THEMES`

### `src/components/ui/checkbox.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-checkbox`
  - `lucide-react`
  - `react`
- Possible React components:
  - `Checkbox`

### `src/components/ui/collapsible.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 0.3 KB
- Imports:
  - `@radix-ui/react-collapsible`
- Possible React components:
  - `Collapsible`
  - `CollapsibleContent`
  - `CollapsibleTrigger`

### `src/components/ui/command.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 4.8 KB
- Detected capabilities: Classroom
- Imports:
  - `@/components/ui/dialog`
  - `@/lib/utils`
  - `@radix-ui/react-dialog`
  - `cmdk`
  - `lucide-react`
  - `react`
- Possible React components:
  - `Command`
  - `CommandDialog`
  - `CommandEmpty`
  - `CommandGroup`
  - `CommandInput`
  - `CommandItem`
  - `CommandList`
  - `CommandSeparator`
  - `CommandShortcut`

### `src/components/ui/context-menu.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 7.2 KB
- Detected capabilities: Classroom
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-context-menu`
  - `lucide-react`
  - `react`
- Possible React components:
  - `ContextMenu`
  - `ContextMenuCheckboxItem`
  - `ContextMenuContent`
  - `ContextMenuGroup`
  - `ContextMenuItem`
  - `ContextMenuLabel`
  - `ContextMenuPortal`
  - `ContextMenuRadioGroup`
  - `ContextMenuRadioItem`
  - `ContextMenuSeparator`
  - `ContextMenuShortcut`
  - `ContextMenuSub`
  - `ContextMenuSubContent`
  - `ContextMenuSubTrigger`
  - `ContextMenuTrigger`

### `src/components/ui/dialog.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 3.6 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-dialog`
  - `lucide-react`
  - `react`
- Possible React components:
  - `Dialog`
  - `DialogClose`
  - `DialogContent`
  - `DialogDescription`
  - `DialogFooter`
  - `DialogHeader`
  - `DialogOverlay`
  - `DialogPortal`
  - `DialogTitle`
  - `DialogTrigger`

### `src/components/ui/drawer.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.9 KB
- Imports:
  - `@/lib/utils`
  - `react`
  - `vaul`
- Possible React components:
  - `Drawer`
  - `DrawerClose`
  - `DrawerContent`
  - `DrawerDescription`
  - `DrawerFooter`
  - `DrawerHeader`
  - `DrawerOverlay`
  - `DrawerPortal`
  - `DrawerTitle`
  - `DrawerTrigger`

### `src/components/ui/dropdown-menu.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 7.4 KB
- Detected capabilities: Classroom
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-dropdown-menu`
  - `lucide-react`
  - `react`
- Possible React components:
  - `DropdownMenu`
  - `DropdownMenuCheckboxItem`
  - `DropdownMenuContent`
  - `DropdownMenuGroup`
  - `DropdownMenuItem`
  - `DropdownMenuLabel`
  - `DropdownMenuPortal`
  - `DropdownMenuRadioGroup`
  - `DropdownMenuRadioItem`
  - `DropdownMenuSeparator`
  - `DropdownMenuShortcut`
  - `DropdownMenuSub`
  - `DropdownMenuSubContent`
  - `DropdownMenuSubTrigger`
  - `DropdownMenuTrigger`

### `src/components/ui/form.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 4.1 KB
- Imports:
  - `@/components/ui/label`
  - `@/lib/utils`
  - `@radix-ui/react-label`
  - `@radix-ui/react-slot`
  - `react`
  - `react-hook-form`
- Possible React components:
  - `Form`
  - `FormControl`
  - `FormDescription`
  - `FormField`
  - `FormFieldContext`
  - `FormItem`
  - `FormItemContext`
  - `FormLabel`
  - `FormMessage`

### `src/components/ui/hover-card.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.2 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-hover-card`
  - `react`
- Possible React components:
  - `HoverCard`
  - `HoverCardContent`
  - `HoverCardTrigger`

### `src/components/ui/input.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 0.8 KB
- Imports:
  - `@/lib/utils`
  - `react`
- Possible React components:
  - `Input`

### `src/components/ui/input-otp.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.1 KB
- Detected capabilities: Authorization
- Imports:
  - `@/lib/utils`
  - `input-otp`
  - `lucide-react`
  - `react`
- Possible React components:
  - `InputOTP`
  - `InputOTPGroup`
  - `InputOTPSeparator`
  - `InputOTPSlot`

### `src/components/ui/label.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 0.7 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-label`
  - `class-variance-authority`
  - `react`
- Possible React components:
  - `Label`

### `src/components/ui/menubar.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 8.3 KB
- Detected capabilities: Classroom
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-menubar`
  - `lucide-react`
  - `react`
- Functions:
  - `MenubarGroup`
  - `MenubarMenu`
  - `MenubarPortal`
  - `MenubarRadioGroup`
  - `MenubarSub`
- Possible React components:
  - `Menubar`
  - `MenubarCheckboxItem`
  - `MenubarContent`
  - `MenubarGroup`
  - `MenubarItem`
  - `MenubarLabel`
  - `MenubarMenu`
  - `MenubarPortal`
  - `MenubarRadioGroup`
  - `MenubarRadioItem`
  - `MenubarSeparator`
  - `MenubarShortcut`
  - `MenubarSub`
  - `MenubarSubContent`
  - `MenubarSubTrigger`
  - `MenubarTrigger`

### `src/components/ui/navigation-menu.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 5 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-navigation-menu`
  - `class-variance-authority`
  - `lucide-react`
  - `react`
- Possible React components:
  - `NavigationMenu`
  - `NavigationMenuContent`
  - `NavigationMenuIndicator`
  - `NavigationMenuItem`
  - `NavigationMenuLink`
  - `NavigationMenuList`
  - `NavigationMenuTrigger`
  - `NavigationMenuViewport`

### `src/components/ui/pagination.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.7 KB
- Detected capabilities: Authorization
- Imports:
  - `@/components/ui/button`
  - `@/lib/utils`
  - `lucide-react`
  - `react`
- Possible React components:
  - `Pagination`
  - `PaginationContent`
  - `PaginationEllipsis`
  - `PaginationItem`
  - `PaginationLink`
  - `PaginationNext`
  - `PaginationPrevious`

### `src/components/ui/popover.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.3 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-popover`
  - `react`
- Possible React components:
  - `Popover`
  - `PopoverAnchor`
  - `PopoverContent`
  - `PopoverTrigger`

### `src/components/ui/progress.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 0.8 KB
- Detected capabilities: Learning
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-progress`
  - `react`
- Possible React components:
  - `Progress`

### `src/components/ui/radio-group.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.4 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-radio-group`
  - `lucide-react`
  - `react`
- Possible React components:
  - `RadioGroup`
  - `RadioGroupItem`

### `src/components/ui/resizable.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.5 KB
- Imports:
  - `@/lib/utils`
  - `lucide-react`
  - `react-resizable-panels`
- Possible React components:
  - `ResizableHandle`
  - `ResizablePanel`
  - `ResizablePanelGroup`

### `src/components/ui/scroll-area.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.6 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-scroll-area`
  - `react`
- Possible React components:
  - `ScrollArea`
  - `ScrollBar`

### `src/components/ui/select.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 5.6 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-select`
  - `lucide-react`
  - `react`
- Possible React components:
  - `Select`
  - `SelectContent`
  - `SelectGroup`
  - `SelectItem`
  - `SelectLabel`
  - `SelectScrollDownButton`
  - `SelectScrollUpButton`
  - `SelectSeparator`
  - `SelectTrigger`
  - `SelectValue`

### `src/components/ui/separator.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 0.7 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-separator`
  - `react`
- Possible React components:
  - `Separator`

### `src/components/ui/sheet.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 4.1 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-dialog`
  - `class-variance-authority`
  - `lucide-react`
  - `react`
- Possible React components:
  - `Sheet`
  - `SheetClose`
  - `SheetContent`
  - `SheetDescription`
  - `SheetFooter`
  - `SheetHeader`
  - `SheetOverlay`
  - `SheetPortal`
  - `SheetTitle`
  - `SheetTrigger`

### `src/components/ui/sidebar.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 23.4 KB
- Detected capabilities: Classroom
- Imports:
  - `@/components/ui/button`
  - `@/components/ui/input`
  - `@/components/ui/separator`
  - `@/components/ui/sheet`
  - `@/components/ui/skeleton`
  - `@/components/ui/tooltip`
  - `@/hooks/use-mobile`
  - `@/lib/utils`
  - `@radix-ui/react-slot`
  - `class-variance-authority`
  - `lucide-react`
  - `react`
- Functions:
  - `useSidebar`
- Possible React components:
  - `Comp`
  - `Sidebar`
  - `SIDEBAR_COOKIE_MAX_AGE`
  - `SIDEBAR_COOKIE_NAME`
  - `SIDEBAR_KEYBOARD_SHORTCUT`
  - `SIDEBAR_WIDTH`
  - `SIDEBAR_WIDTH_ICON`
  - `SIDEBAR_WIDTH_MOBILE`
  - `SidebarContent`
  - `SidebarContext`
  - `SidebarFooter`
  - `SidebarGroup`
  - `SidebarGroupAction`
  - `SidebarGroupContent`
  - `SidebarGroupLabel`
  - `SidebarHeader`
  - `SidebarInput`
  - `SidebarInset`
  - `SidebarMenu`
  - `SidebarMenuAction`
  - `SidebarMenuBadge`
  - `SidebarMenuButton`
  - `SidebarMenuItem`
  - `SidebarMenuSkeleton`
  - `SidebarMenuSub`
  - `SidebarMenuSubButton`
  - `SidebarMenuSubItem`
  - `SidebarProvider`
  - `SidebarRail`
  - `SidebarSeparator`
  - `SidebarTrigger`

### `src/components/ui/skeleton.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 0.2 KB
- Imports:
  - `@/lib/utils`
- Functions:
  - `Skeleton`
- Possible React components:
  - `Skeleton`

### `src/components/ui/slider.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-slider`
  - `react`
- Possible React components:
  - `Slider`

### `src/components/ui/sonner.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 0.7 KB
- Imports:
  - `sonner`
- Possible React components:
  - `Toaster`

### `src/components/ui/switch.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.1 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-switch`
  - `react`
- Possible React components:
  - `Switch`

### `src/components/ui/table.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 2.8 KB
- Detected capabilities: Authorization
- Imports:
  - `@/lib/utils`
  - `react`
- Possible React components:
  - `Table`
  - `TableBody`
  - `TableCaption`
  - `TableCell`
  - `TableFooter`
  - `TableHead`
  - `TableHeader`
  - `TableRow`

### `src/components/ui/tabs.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.9 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-tabs`
  - `react`
- Possible React components:
  - `Tabs`
  - `TabsContent`
  - `TabsList`
  - `TabsTrigger`

### `src/components/ui/textarea.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 0.7 KB
- Imports:
  - `@/lib/utils`
  - `react`
- Possible React components:
  - `Textarea`

### `src/components/ui/toggle.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.5 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-toggle`
  - `class-variance-authority`
  - `react`
- Possible React components:
  - `Toggle`

### `src/components/ui/toggle-group.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.7 KB
- Imports:
  - `@/components/ui/toggle`
  - `@/lib/utils`
  - `@radix-ui/react-toggle-group`
  - `class-variance-authority`
  - `react`
- Possible React components:
  - `ToggleGroup`
  - `ToggleGroupContext`
  - `ToggleGroupItem`

### `src/components/ui/tooltip.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.2 KB
- Imports:
  - `@/lib/utils`
  - `@radix-ui/react-tooltip`
  - `react`
- Possible React components:
  - `Tooltip`
  - `TooltipContent`
  - `TooltipProvider`
  - `TooltipTrigger`

### `src/components/WebGLLab.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 7.3 KB
- Detected capabilities: Authentication
- Imports:
  - `@/components/ui/button`
  - `@/lib/webgl/mat4`
  - `@/lib/webgl/renderer`
  - `@/lib/webgl/scenes`
  - `lucide-react`
  - `react`
- Exports:
  - `WebGLLab`
- Functions:
  - `WebGLLab`
- Possible React components:
  - `WebGLLab`

### `src/components/whiteboard/ai/ConvertButton.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 3.6 KB
- Detected capabilities: Classroom
- Imports:
  - `../canvas/engine`
  - `../canvas/Whiteboard`
  - `./insertConversion`
  - `@/components/ui/button`
  - `@/lib/whiteboard-ai.functions`
  - `@tanstack/react-start`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `ConvertButton`
- Functions:
  - `boundsOf`
  - `ConvertButton`
- Possible React components:
  - `ConvertButton`

### `src/components/whiteboard/ai/insertConversion.ts`

- Category: **UI Component**
- Type: `.ts`
- Size: 8.4 KB
- Detected capabilities: Classroom
- Imports:
  - `../canvas/engine`
  - `../canvas/latex`
- Exports:
  - `blocksToShapes`
  - `ConvertedBlock`
  - `parseConversion`
- Functions:
  - `blocksToShapes`
  - `classifyTextualBlock`
  - `extractSvgLabels`
  - `looksLikeMathLine`
  - `normalizeLatex`
  - `parseConversion`
  - `readSvgDims`
  - `splitParagraphs`
  - `svgToDataUrl`
- Possible React components:
  - `LATEX_HINT_RE`
  - `MATH_RE`
  - `SVG_RE`

### `src/components/whiteboard/canvas/engine.ts`

- Category: **UI Component**
- Type: `.ts`
- Size: 4.4 KB
- Detected capabilities: Classroom
- Exports:
  - `ArrowShape`
  - `Camera`
  - `EllipseShape`
  - `HighlighterShape`
  - `hitTest`
  - `ImageShape`
  - `LineShape`
  - `nextId`
  - `observeTs`
  - `PencilShape`
  - `RectShape`
  - `SceneDoc`
  - `Shape`
  - `ShapeBase`
  - `shapeBounds`
  - `StickyShape`
  - `TextShape`
  - `tick`
  - `ToolId`
  - `translateShape`
  - `TriangleShape`
- Functions:
  - `hitTest`
  - `nextId`
  - `observeTs`
  - `shapeBounds`
  - `tick`
  - `translateShape`

### `src/components/whiteboard/canvas/exporter.ts`

- Category: **UI Component**
- Type: `.ts`
- Size: 3.4 KB
- Detected capabilities: Classroom, Storage
- Imports:
  - `./engine`
  - `./renderer`
  - `jspdf`
- Exports:
  - `exportJPG`
  - `exportJSON`
  - `exportPDF`
  - `exportPNG`
- Functions:
  - `bounds`
  - `downloadBlob`
  - `exportJPG`
  - `exportJSON`
  - `exportPDF`
  - `exportPNG`
  - `renderToCanvas`

### `src/components/whiteboard/canvas/latex.ts`

- Category: **UI Component**
- Type: `.ts`
- Size: 2.6 KB
- Imports:
  - `katex`
  - `katex/dist/katex.min.css?inline`
- Exports:
  - `RenderedLatex`
  - `renderLatexToSvgDataUrl`
- Functions:
  - `escapeHtml`
  - `measure`
  - `renderLatexToSvgDataUrl`
- Possible React components:
  - `CSS`

### `src/components/whiteboard/canvas/realtime.ts`

- Category: **UI Component**
- Type: `.ts`
- Size: 2.5 KB
- Detected capabilities: Supabase, Classroom, Realtime
- Imports:
  - `./engine`
  - `@/integrations/supabase/client`
  - `@supabase/supabase-js`
  - `react`
- Exports:
  - `CursorMsg`
  - `useWhiteboardRealtime`
  - `WbOp`
  - `WbOpInput`
- Functions:
  - `useWhiteboardRealtime`

### `src/components/whiteboard/canvas/renderer.ts`

- Category: **UI Component**
- Type: `.ts`
- Size: 11.7 KB
- Imports:
  - `./engine`
- Exports:
  - `GraphAxes`
  - `render`
  - `RenderOpts`
- Functions:
  - `drawGraphAxes`
  - `drawGrid`
  - `drawShape`
  - `importBounds`
  - `niceStep`
  - `render`
  - `roundRect`
  - `strokePath`
  - `wrapText`

### `src/components/whiteboard/canvas/smooth.ts`

- Category: **UI Component**
- Type: `.ts`
- Size: 1.4 KB
- Exports:
  - `simplifyPoints`
- Functions:
  - `simplifyPoints`
  - `sqSegDist`

### `src/components/whiteboard/canvas/Whiteboard.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 56.7 KB
- Detected capabilities: Supabase, Classroom, Realtime, Storage, Scheduling, Learning
- Imports:
  - `../ai/ConvertButton`
  - `../collaboration/cursors`
  - `./engine`
  - `./exporter`
  - `./realtime`
  - `./renderer`
  - `./smooth`
  - `@/components/ui/button`
  - `@/components/ui/popover`
  - `@/hooks/use-mobile`
  - `@/integrations/supabase/client`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `hashColor`
  - `Whiteboard`
  - `WhiteboardHandle`
- Functions:
  - `cursorFor`
  - `ExportMenu`
  - `handleStyle`
  - `hashColor`
  - `Whiteboard`
- Possible React components:
  - `COLORS`
  - `ExportMenu`
  - `IconTile`
  - `SIZES`
  - `ToolBtn`
  - `Whiteboard`

### `src/components/whiteboard/collaboration/cursors.tsx`

- Category: **UI Component**
- Type: `.tsx`
- Size: 1.1 KB
- Detected capabilities: Realtime
- Imports:
  - `../canvas/realtime`
- Exports:
  - `LiveCursors`
- Functions:
  - `LiveCursors`
- Possible React components:
  - `LiveCursors`

### `src/components/whiteboard/index.ts`

- Category: **UI Component**
- Type: `.ts`
- Size: 0.1 KB
- Detected capabilities: Classroom
- Imports:
  - `./canvas/Whiteboard`

### `src/hooks/use-agent.ts`

- Category: **React Hook**
- Type: `.ts`
- Size: 2.1 KB
- Detected capabilities: Authorization, Classroom
- Imports:
  - `@/lib/agents/run-agent.functions`
  - `@tanstack/react-start`
  - `react`
  - `sonner`
- Exports:
  - `AgentMessage`
  - `AgentRole`
  - `useAgent`
  - `useRunAgentOnce`
- Functions:
  - `useAgent`
  - `useRunAgentOnce`

### `src/hooks/use-auth.tsx`

- Category: **React Hook**
- Type: `.tsx`
- Size: 2.1 KB
- Detected capabilities: Supabase, Authentication, Authorization, Payments
- Imports:
  - `@/integrations/supabase/client`
  - `@supabase/supabase-js`
  - `react`
- Exports:
  - `AuthProvider`
  - `useAuth`
- Functions:
  - `AuthProvider`
  - `useAuth`
- Possible React components:
  - `AuthProvider`
  - `Ctx`

### `src/hooks/useClassroomRTC.ts`

- Category: **React Hook**
- Type: `.ts`
- Size: 2.7 KB
- Detected capabilities: Classroom
- Imports:
  - `@/lib/classroom-rtc`
  - `react`
- Exports:
  - `ClassroomRTCState`
  - `useClassroomRTC`
- Functions:
  - `useClassroomRTC`

### `src/hooks/use-entitlements.ts`

- Category: **React Hook**
- Type: `.ts`
- Size: 1.2 KB
- Detected capabilities: Payments
- Imports:
  - `@/hooks/use-auth`
  - `@/hooks/use-platform-config`
  - `@/lib/entitlements.functions`
  - `@tanstack/react-query`
  - `@tanstack/react-start`
- Exports:
  - `useEntitlements`
- Functions:
  - `useEntitlements`

### `src/hooks/use-mobile.tsx`

- Category: **React Hook**
- Type: `.tsx`
- Size: 0.6 KB
- Imports:
  - `react`
- Exports:
  - `useIsMobile`
- Functions:
  - `useIsMobile`
- Possible React components:
  - `MOBILE_BREAKPOINT`

### `src/hooks/use-platform-config.ts`

- Category: **React Hook**
- Type: `.ts`
- Size: 1.5 KB
- Detected capabilities: Supabase, Payments, AI, Classroom
- Imports:
  - `@/integrations/supabase/client`
  - `@tanstack/react-query`
- Exports:
  - `AiProvider`
  - `PlatformConfig`
  - `usePlatformConfig`
- Functions:
  - `usePlatformConfig`
- Possible React components:
  - `DEFAULTS`

### `src/hooks/use-theme.tsx`

- Category: **React Hook**
- Type: `.tsx`
- Size: 1.1 KB
- Detected capabilities: Storage
- Imports:
  - `react`
- Exports:
  - `ThemeProvider`
  - `useTheme`
- Functions:
  - `ThemeProvider`
  - `useTheme`
- Possible React components:
  - `ThemeCtx`
  - `ThemeProvider`

### `src/integrations/supabase/auth-attacher.ts`

- Category: **Authentication / Authorization**
- Type: `.ts`
- Size: 0.6 KB
- Detected capabilities: Supabase, Authentication
- Imports:
  - `./client`
  - `@tanstack/react-start`
- Exports:
  - `attachSupabaseAuth`

### `src/integrations/supabase/auth-middleware.ts`

- Category: **Middleware**
- Type: `.ts`
- Size: 2.3 KB
- Detected capabilities: Supabase, Authentication, Storage, Assessment
- Imports:
  - `./types`
  - `@supabase/supabase-js`
  - `@tanstack/react-start`
  - `@tanstack/react-start/server`
- Exports:
  - `requireSupabaseAuth`
- Possible React components:
  - `SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_URL`

### `src/integrations/supabase/client.server.ts`

- Category: **Other**
- Type: `.ts`
- Size: 1.7 KB
- Detected capabilities: Supabase, Authentication, Authorization, Storage, Assessment
- Imports:
  - `./types`
  - `@/integrations/supabase/client.server`
  - `@supabase/supabase-js`
- Exports:
  - `supabaseAdmin`
- Functions:
  - `createSupabaseAdminClient`
- Possible React components:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_URL`

### `src/integrations/supabase/client.ts`

- Category: **Other**
- Type: `.ts`
- Size: 1.6 KB
- Detected capabilities: Supabase, Authentication, Storage, Assessment
- Imports:
  - `./types`
  - `@/integrations/supabase/client`
  - `@supabase/supabase-js`
- Exports:
  - `supabase`
- Functions:
  - `createSupabaseClient`
- Possible React components:
  - `SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_URL`

### `src/integrations/supabase/types.ts`

- Category: **Other**
- Type: `.ts`
- Size: 81.8 KB
- Detected capabilities: Supabase, Authentication, Authorization, Payments, Classroom, Storage, Email, Scheduling, Assessment, Learning
- Exports:
  - `CompositeTypes`
  - `Constants`
  - `Database`
  - `Enums`
  - `Json`
  - `Tables`
  - `TablesInsert`
  - `TablesUpdate`
- Possible React components:
  - `Constants`

### `src/lib/access.functions.ts`

- Category: **Other**
- Type: `.ts`
- Size: 2.9 KB
- Detected capabilities: Supabase, Authentication, Authorization, Classroom
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@/integrations/supabase/types`
  - `@/lib/room-access`
  - `@supabase/supabase-js`
  - `@tanstack/react-start`
  - `zod`
- Exports:
  - `checkIsAdmin`
  - `checkRoomMembership`
  - `getClassroomContext`
- Functions:
  - `isAdminUser`

### `src/lib/admin.functions.ts`

- Category: **Other**
- Type: `.ts`
- Size: 3.6 KB
- Detected capabilities: Supabase, Authorization, Email
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@/integrations/supabase/client.server`
  - `@tanstack/react-start`
  - `zod`
- Exports:
  - `adminCreateUser`
  - `adminDeleteUser`
  - `adminListUsers`
- Functions:
  - `assertAdmin`
- Possible React components:
  - `CreateUserSchema`

### `src/lib/agents/registry.server.ts`

- Category: **Other**
- Type: `.ts`
- Size: 4.5 KB
- Detected capabilities: Authorization, AI, Classroom, Assessment, Learning
- Exports:
  - `AGENT_REGISTRY`
  - `AgentDefinition`
  - `AgentRole`
  - `callAgent`
  - `ChatMessage`
- Functions:
  - `callAgent`
- Possible React components:
  - `AGENT_REGISTRY`
  - `OUTPUT_CONTRACT`

### `src/lib/agents/run-agent.functions.ts`

- Category: **Other**
- Type: `.ts`
- Size: 1.1 KB
- Detected capabilities: Supabase, Authorization, Classroom
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@/lib/ai-entitlement`
  - `@tanstack/react-start`
  - `zod`
- Exports:
  - `runAgent`
- Possible React components:
  - `InputSchema`
  - `MessageSchema`

### `src/lib/ai/keys.functions.ts`

- Category: **AI**
- Type: `.ts`
- Size: 4.7 KB
- Detected capabilities: Supabase, Authorization, AI
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@tanstack/react-start`
  - `zod`
- Exports:
  - `getAiKeyStatus`
  - `saveAiKey`
  - `testAiProvider`
- Functions:
  - `assertAdmin`
- Possible React components:
  - `ProviderSchema`

### `src/lib/ai/provider.server.ts`

- Category: **AI**
- Type: `.ts`
- Size: 9.2 KB
- Detected capabilities: Supabase, Authorization, AI
- Exports:
  - `aiChat`
  - `AiChatOptions`
  - `AiChatResult`
  - `AiContentPart`
  - `aiEmbed`
  - `AiEmbedOptions`
  - `AiError`
  - `AiMessage`
  - `clearAiProviderCache`
  - `getProviderCreds`
- Functions:
  - `aiChat`
  - `aiEmbed`
  - `clearAiProviderCache`
  - `endpointFor`
  - `getProviderCreds`
  - `mapModel`
  - `resolveProvider`
  - `stripVendor`
- Classes:
  - `AiError`
- Possible React components:
  - `CACHE_MS`

### `src/lib/ai-entitlement.ts`

- Category: **Other**
- Type: `.ts`
- Size: 4.3 KB
- Detected capabilities: Supabase, Authentication, Authorization, Payments, Classroom
- Imports:
  - `@/integrations/supabase/types`
  - `@supabase/supabase-js`
- Exports:
  - `AiScope`
  - `assertAiEntitlement`
  - `EntitlementGateway`
  - `PlatformConfigShape`
  - `premiumMessage`
  - `supabaseEntitlementGateway`
  - `UserRole`
- Functions:
  - `assertAiEntitlement`
  - `premiumMessage`
  - `supabaseEntitlementGateway`

### `src/lib/ai-tools.functions.ts`

- Category: **Other**
- Type: `.ts`
- Size: 4.1 KB
- Detected capabilities: Supabase, Authorization, AI, Assessment, Learning
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@/lib/ai-entitlement`
  - `@tanstack/react-start`
  - `zod`
- Exports:
  - `aiToolRun`
- Possible React components:
  - `InputSchema`
  - `SYSTEM_BY_TOOL`
  - `ToolEnum`

### `src/lib/ai-tutor.functions.ts`

- Category: **Other**
- Type: `.ts`
- Size: 6.9 KB
- Detected capabilities: Supabase, Authorization, AI, Storage, Assessment, Learning
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@/lib/ai-entitlement`
  - `@tanstack/react-start`
  - `zod`
- Exports:
  - `aiTutorChat`
- Possible React components:
  - `ImagePartSchema`
  - `InputSchema`
  - `MessageSchema`
  - `PartSchema`
  - `STUDENT_SYSTEM_PROMPT`
  - `TextPartSchema`
  - `TUTOR_SYSTEM_PROMPT`

### `src/lib/booking-emails.functions.ts`

- Category: **Other**
- Type: `.ts`
- Size: 3.9 KB
- Detected capabilities: Supabase, Authentication, Authorization, Email, Scheduling
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@/integrations/supabase/client.server`
  - `@tanstack/react-start`
  - `zod`
- Exports:
  - `notifyBookingEmails`
- Functions:
  - `formatWhen`
  - `sendOne`

### `src/lib/classroom-rtc/index.ts`

- Category: **Classroom / Realtime**
- Type: `.ts`
- Size: 0.6 KB
- Detected capabilities: Classroom
- Imports:
  - `./PeerToPeerRTCService`
  - `./types`
- Exports:
  - `createClassroomRTC`
- Functions:
  - `createClassroomRTC`

### `src/lib/classroom-rtc/PeerToPeerRTCService.ts`

- Category: **Classroom / Realtime**
- Type: `.ts`
- Size: 16.7 KB
- Detected capabilities: Supabase, Authentication, Authorization, Classroom, Realtime, Assessment
- Imports:
  - `./types`
  - `@/integrations/supabase/client`
- Exports:
  - `PeerToPeerRTCConfig`
  - `PeerToPeerRTCService`
- Functions:
  - `classifyQuality`
- Classes:
  - `PeerToPeerRTCService`

### `src/lib/classroom-rtc/types.ts`

- Category: **Classroom / Realtime**
- Type: `.ts`
- Size: 1.9 KB
- Detected capabilities: Classroom
- Exports:
  - `ClassroomRTCService`
  - `ConnectionQuality`
  - `ConnectionStats`
  - `DeviceKind`
  - `MediaDeviceLists`
  - `Participant`
  - `ParticipantStatus`
  - `RemoteParticipant`
  - `RTCEventMap`
  - `RTCListener`

### `src/lib/course-materials.functions.ts`

- Category: **Other**
- Type: `.ts`
- Size: 2 KB
- Detected capabilities: Supabase, Authorization, Storage, Learning
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@tanstack/react-start`
  - `zod`
- Exports:
  - `getCourseMaterialUrl`

### `src/lib/email/enqueue.server.ts`

- Category: **Other**
- Type: `.ts`
- Size: 4.3 KB
- Detected capabilities: Supabase, Payments, Email
- Imports:
  - `@/integrations/supabase/client.server`
  - `@/lib/email/provider.server`
  - `@/lib/email-templates/registry`
  - `@react-email/components`
  - `react`
- Exports:
  - `enqueueTransactionalEmail`
- Functions:
  - `enqueueTransactionalEmail`
  - `token32`
  - `unsubscribeFooter`
- Possible React components:
  - `ALIAS_DISPLAY`
  - `ALLOWED`
  - `BRAND`
  - `FROM_DOMAIN`

### `src/lib/email/provider.server.ts`

- Category: **Other**
- Type: `.ts`
- Size: 4.8 KB
- Detected capabilities: Payments, Email
- Exports:
  - `deliverEmail`
  - `EmailError`
  - `emailProvider`
  - `OutgoingEmail`
  - `publicBaseUrl`
  - `sendTransactionalEmail`
  - `TransactionalEmail`
- Functions:
  - `deliverEmail`
  - `emailProvider`
  - `publicBaseUrl`
  - `sendTransactionalEmail`
  - `sendViaResend`
  - `sendViaSmtpBridge`
- Classes:
  - `EmailError`

### `src/lib/email-templates/_shared.ts`

- Category: **Other**
- Type: `.ts`
- Size: 0.9 KB
- Detected capabilities: Email
- Exports:
  - `btn`
  - `card`
  - `container`
  - `h1`
  - `main`
  - `muted`
  - `SITE`
  - `SITE_URL`
  - `text`
- Possible React components:
  - `SITE`
  - `SITE_URL`

### `src/lib/email-templates/booking-confirmation.tsx`

- Category: **Other**
- Type: `.tsx`
- Size: 2.6 KB
- Detected capabilities: Authorization, Classroom, Email, Scheduling
- Imports:
  - `./registry`
  - `@react-email/components`
- Exports:
  - `template`
- Classes:
  - `has`
  - `is`
- Possible React components:
  - `BookingConfirmationEmail`
  - `SITE_NAME`

### `src/lib/email-templates/help-confirmation.tsx`

- Category: **Other**
- Type: `.tsx`
- Size: 1.5 KB
- Detected capabilities: Email
- Imports:
  - `./_shared`
  - `./registry`
  - `@react-email/components`
  - `react`
- Exports:
  - `template`
- Possible React components:
  - `HelpConfirmationEmail`

### `src/lib/email-templates/help-new-ticket.tsx`

- Category: **Other**
- Type: `.tsx`
- Size: 1.4 KB
- Detected capabilities: Email, Assessment
- Imports:
  - `./_shared`
  - `./registry`
  - `@react-email/components`
  - `react`
- Exports:
  - `template`
- Possible React components:
  - `HelpNewTicketEmail`

### `src/lib/email-templates/registry.ts`

- Category: **Other**
- Type: `.ts`
- Size: 0.5 KB
- Detected capabilities: Email
- Imports:
  - `./booking-confirmation`
  - `react`
- Exports:
  - `TemplateEntry`
  - `TEMPLATES`
- Possible React components:
  - `TEMPLATES`

### `src/lib/email-templates/subscription-approved.tsx`

- Category: **Commerce / Payment**
- Type: `.tsx`
- Size: 1.3 KB
- Detected capabilities: Payments, Email
- Imports:
  - `./_shared`
  - `./registry`
  - `@react-email/components`
  - `react`
- Exports:
  - `template`
- Possible React components:
  - `SubscriptionApprovedEmail`

### `src/lib/email-templates/subscription-rejected.tsx`

- Category: **Commerce / Payment**
- Type: `.tsx`
- Size: 1.4 KB
- Detected capabilities: Payments, Email
- Imports:
  - `./_shared`
  - `./registry`
  - `@react-email/components`
  - `react`
- Exports:
  - `template`
- Possible React components:
  - `SubscriptionRejectedEmail`

### `src/lib/email-templates/welcome.tsx`

- Category: **Other**
- Type: `.tsx`
- Size: 1.2 KB
- Detected capabilities: Authentication, Email
- Imports:
  - `./_shared`
  - `./registry`
  - `@react-email/components`
  - `react`
- Exports:
  - `template`
- Possible React components:
  - `WelcomeEmail`

### `src/lib/entitlements.functions.ts`

- Category: **Other**
- Type: `.ts`
- Size: 0.5 KB
- Detected capabilities: Supabase
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@tanstack/react-start`
- Exports:
  - `FeatureScope`
  - `getMyScopes`

### `src/lib/error-capture.ts`

- Category: **Other**
- Type: `.ts`
- Size: 0.9 KB
- Exports:
  - `consumeLastCapturedError`
- Functions:
  - `consumeLastCapturedError`
  - `record`
- Possible React components:
  - `TTL_MS`

### `src/lib/error-page.ts`

- Category: **Other**
- Type: `.ts`
- Size: 1.3 KB
- Exports:
  - `renderErrorPage`
- Functions:
  - `renderErrorPage`

### `src/lib/help.functions.ts`

- Category: **Other**
- Type: `.ts`
- Size: 4.2 KB
- Detected capabilities: Supabase, Authentication, Authorization, Payments, Email
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@/integrations/supabase/client.server`
  - `@/lib/email/enqueue.server`
  - `@tanstack/react-start`
  - `zod`
- Exports:
  - `sendSubscriptionDecisionEmail`
  - `sendWelcomeEmail`
  - `submitHelpMessage`
- Possible React components:
  - `HelpSchema`
  - `SubEmailSchema`
  - `WelcomeSchema`

### `src/lib/lab-modules.ts`

- Category: **Other**
- Type: `.ts`
- Size: 15 KB
- Detected capabilities: Storage
- Exports:
  - `LAB_LEVELS`
  - `LAB_MODULES`
  - `LAB_SUBJECTS`
  - `LAB_USAGE_STORAGE_KEY`
  - `LabLevel`
  - `LabModule`
  - `LabSubject`
  - `phetUrl`
  - `readViewedSlugs`
  - `recordViewedSlug`
  - `STUDENT_LAB_LIMIT`
- Functions:
  - `readViewedSlugs`
  - `recordViewedSlug`
- Possible React components:
  - `LAB_LEVELS`
  - `LAB_MODULES`
  - `LAB_SUBJECTS`
  - `LAB_USAGE_STORAGE_KEY`
  - `STUDENT_LAB_LIMIT`

### `src/lib/payments/checkout.functions.ts`

- Category: **Commerce / Payment**
- Type: `.ts`
- Size: 2.8 KB
- Detected capabilities: Supabase, Authentication, Payments, Classroom
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@tanstack/react-start`
  - `zod`
- Exports:
  - `startCheckout`
- Possible React components:
  - `StartSchema`

### `src/lib/payments/paypal.server.ts`

- Category: **Commerce / Payment**
- Type: `.ts`
- Size: 5.9 KB
- Detected capabilities: Authentication, Payments
- Exports:
  - `paypalCaptureOrder`
  - `paypalCreateOrder`
  - `paypalGetOrder`
  - `paypalVerifyWebhook`
- Functions:
  - `baseUrl`
  - `getAccessToken`
  - `paypalCaptureOrder`
  - `paypalCreateOrder`
  - `paypalGetOrder`
  - `paypalVerifyWebhook`
  - `readCreds`

### `src/lib/payments/router.server.ts`

- Category: **Routing**
- Type: `.ts`
- Size: 4.7 KB
- Detected capabilities: Supabase, Payments, Classroom, Assessment
- Imports:
  - `./paypal.server`
- Exports:
  - `ProviderRow`
  - `routeCheckoutStart`
  - `selectProviders`
  - `StartCheckoutResult`
- Functions:
  - `recordAttempt`
  - `routeCheckoutStart`
  - `selectProviders`
  - `smartScore`
  - `supports`

### `src/lib/payments/webhook-actions.ts`

- Category: **Commerce / Payment**
- Type: `.ts`
- Size: 2.2 KB
- Detected capabilities: Payments
- Exports:
  - `PaypalWebhookEvent`
  - `resolvePaypalWebhookAction`
  - `WebhookAction`
- Functions:
  - `readCustomId`
  - `resolvePaypalWebhookAction`

### `src/lib/room-access.ts`

- Category: **Other**
- Type: `.ts`
- Size: 1.2 KB
- Detected capabilities: Authentication, Classroom
- Exports:
  - `resolveRoomMembership`
  - `RoomAccess`
  - `RoomLookup`
  - `SessionParticipantRow`
- Functions:
  - `resolveRoomMembership`

### `src/lib/server/platform.ts`

- Category: **Other**
- Type: `.ts`
- Size: 3.8 KB
- Detected capabilities: Assessment
- Imports:
  - `./dist/server/platform.js`
  - `@/lib/error-capture`
  - `@/lib/error-page`
  - `@/lib/server/platform`
  - `node:http`
- Exports:
  - `DELETE`
  - `GET`
  - `handleRequest`
  - `PATCH`
  - `POST`
  - `PUT`
  - `runtime`
- Functions:
  - `brandedErrorResponse`
  - `getServerEntry`
  - `handleRequest`
  - `isCatastrophicSsrErrorBody`
  - `normalizeCatastrophicSsrResponse`
- Possible React components:
  - `DELETE`
  - `GET`
  - `PATCH`
  - `POST`
  - `PUT`

### `src/lib/sim-chat.functions.ts`

- Category: **Other**
- Type: `.ts`
- Size: 2.5 KB
- Detected capabilities: Supabase, Authorization, AI, Assessment
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@/lib/ai-entitlement`
  - `@tanstack/react-start`
  - `zod`
- Exports:
  - `simLabChat`
- Possible React components:
  - `MsgSchema`

### `src/lib/sim-lab.functions.ts`

- Category: **Other**
- Type: `.ts`
- Size: 20 KB
- Detected capabilities: Supabase, Authorization, AI, Assessment, Learning
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@/lib/ai-entitlement`
  - `@tanstack/react-start`
  - `zod`
- Exports:
  - `deleteSimulation`
  - `embedPrompt`
  - `findSimilarSimulation`
  - `generateSimulationSchema`
  - `listSimulations`
  - `saveSimulation`
  - `SimulationSchema`
  - `SimulationSchemaT`
- Functions:
  - `assertLabsScope`
  - `callGateway`
  - `fallbackSchema`
  - `toVectorLiteral`
- Possible React components:
  - `ConnectionSchema`
  - `DialogueLineSchema`
  - `ExplainSchema`
  - `GeoRegionSchema`
  - `LanguageSceneSchema`
  - `ObjectSchema`
  - `ProcessStepSchema`
  - `QuizQuestionSchema`
  - `SimulationSchema`
  - `SYSTEM_PROMPT`
  - `TimelineEventSchema`

### `src/lib/students.functions.ts`

- Category: **Other**
- Type: `.ts`
- Size: 1.5 KB
- Detected capabilities: Supabase, Authorization, Scheduling
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@/integrations/supabase/client.server`
  - `@tanstack/react-start`
- Exports:
  - `listSchedulableStudents`

### `src/lib/utils.ts`

- Category: **Other**
- Type: `.ts`
- Size: 0.2 KB
- Imports:
  - `clsx`
  - `tailwind-merge`
- Exports:
  - `cn`
- Functions:
  - `cn`

### `src/lib/webgl/geometry.ts`

- Category: **Other**
- Type: `.ts`
- Size: 3.2 KB
- Exports:
  - `cylinder`
  - `Mesh`
  - `sphere`
  - `surface`
  - `torus`
- Functions:
  - `cylinder`
  - `sphere`
  - `surface`
  - `torus`

### `src/lib/webgl/mat4.ts`

- Category: **Other**
- Type: `.ts`
- Size: 2.8 KB
- Exports:
  - `m4`
  - `Mat4`
  - `Vec3`

### `src/lib/webgl/renderer.ts`

- Category: **Other**
- Type: `.ts`
- Size: 4.3 KB
- Detected capabilities: Storage
- Imports:
  - `./geometry`
  - `./mat4`
- Exports:
  - `DrawCall`
  - `MeshHandle`
  - `Renderer`
- Functions:
  - `compile`
- Classes:
  - `Renderer`
- Possible React components:
  - `FRAG`
  - `VERT`

### `src/lib/webgl/scenes.ts`

- Category: **Other**
- Type: `.ts`
- Size: 6.6 KB
- Detected capabilities: Storage
- Imports:
  - `./geometry`
  - `./mat4`
  - `./renderer`
- Exports:
  - `Scene`
  - `SceneInstance`
  - `SCENES`
- Functions:
  - `bond`
- Possible React components:
  - `C`
  - `FRAMES`
  - `H`
  - `H1`
  - `H2`
  - `O`
  - `R`
  - `SCENES`

### `src/lib/whiteboard-ai.functions.ts`

- Category: **Classroom / Realtime**
- Type: `.ts`
- Size: 3.6 KB
- Detected capabilities: Supabase, Authorization, AI, Classroom, Assessment
- Imports:
  - `@/integrations/supabase/auth-middleware`
  - `@/lib/ai-entitlement`
  - `@tanstack/react-start`
  - `zod`
- Exports:
  - `whiteboardConvert`
- Possible React components:
  - `Input`

### `src/router.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 0.4 KB
- Imports:
  - `./routeTree.gen`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
- Exports:
  - `getRouter`

### `src/routes/__root.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 4.8 KB
- Detected capabilities: Classroom, Storage, Learning
- Imports:
  - `../styles.css?url`
  - `@/components/InstallPrompt`
  - `@/components/MobileTabBar`
  - `@/components/ui/sonner`
  - `@/hooks/use-auth`
  - `@/hooks/use-theme`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
- Exports:
  - `Route`
- Functions:
  - `ErrorComponent`
  - `NotFoundComponent`
  - `RootComponent`
  - `RootShell`
- Possible React components:
  - `ErrorComponent`
  - `NotFoundComponent`
  - `RootComponent`
  - `RootShell`
  - `Route`

### `src/routes/_authenticated.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 0.7 KB
- Imports:
  - `@/components/dashboard/AppShell`
  - `@/hooks/use-auth`
  - `@tanstack/react-router`
  - `react`
- Exports:
  - `Route`
- Functions:
  - `AuthGate`
- Possible React components:
  - `AuthGate`
  - `Route`

### `src/routes/_authenticated/admin.ai.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 1.4 KB
- Detected capabilities: Classroom
- Imports:
  - `@/components/admin/AiKeyManager`
  - `@/components/admin/AiProviderSelect`
  - `@/components/admin/ConfigToggle`
  - `@/components/dashboard/primitives`
  - `@/lib/access.functions`
  - `@tanstack/react-router`
- Exports:
  - `Route`
- Possible React components:
  - `Route`

### `src/routes/_authenticated/admin.analytics.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 4 KB
- Detected capabilities: Supabase, Authentication, Authorization, Scheduling
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/card`
  - `@/integrations/supabase/client`
  - `@/lib/access.functions`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `recharts`
- Exports:
  - `Route`
- Functions:
  - `AnalyticsPage`
- Possible React components:
  - `AnalyticsPage`
  - `Route`

### `src/routes/_authenticated/admin.audit.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 5.9 KB
- Detected capabilities: Payments, Classroom
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/badge`
  - `@/components/ui/card`
  - `@/lib/access.functions`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
- Exports:
  - `Route`
- Functions:
  - `AuditPage`
- Possible React components:
  - `AuditPage`
  - `REGISTRY`
  - `Route`

### `src/routes/_authenticated/admin.classrooms.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 1 KB
- Detected capabilities: Authorization, Classroom
- Imports:
  - `@/components/admin/ConfigToggle`
  - `@/components/dashboard/primitives`
  - `@/lib/access.functions`
  - `@tanstack/react-router`
- Exports:
  - `Route`
- Possible React components:
  - `Route`

### `src/routes/_authenticated/admin.commissions.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 10.4 KB
- Detected capabilities: Supabase
- Imports:
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/dialog`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/components/ui/switch`
  - `@/components/ui/textarea`
  - `@/integrations/supabase/client`
  - `@/lib/access.functions`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `AdminCommissions`
- Possible React components:
  - `AdminCommissions`
  - `Route`

### `src/routes/_authenticated/admin.index.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 30 KB
- Detected capabilities: Supabase, Authorization, Payments, Storage, Email, Learning
- Imports:
  - `@/components/Navbar`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/components/ui/switch`
  - `@/components/ui/tabs`
  - `@/components/ui/textarea`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@/lib/access.functions`
  - `@/lib/admin.functions`
  - `@/lib/help.functions`
  - `@tanstack/react-router`
  - `@tanstack/react-start`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `AdminPage`
  - `AllUsersList`
  - `ManualCreateUser`
  - `SiteContentEditor`
  - `SubjectsManager`
  - `TutorApplicationsQueue`
  - `TutorCoursesQueue`
- Possible React components:
  - `AdminPage`
  - `AllUsersList`
  - `LEVEL_LABELS`
  - `ManualCreateUser`
  - `Route`
  - `SiteContentEditor`
  - `SubjectsManager`
  - `TutorApplicationsQueue`
  - `TutorCoursesQueue`

### `src/routes/_authenticated/admin.moderation.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 2.7 KB
- Detected capabilities: Supabase
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/integrations/supabase/client`
  - `@/lib/access.functions`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `ModerationPage`
- Possible React components:
  - `ModerationPage`
  - `Route`

### `src/routes/_authenticated/admin.payments.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 13.1 KB
- Detected capabilities: Supabase, Payments
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/dialog`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/components/ui/tabs`
  - `@/components/ui/textarea`
  - `@/integrations/supabase/client`
  - `@/lib/access.functions`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `EditDialog`
  - `GrantDialog`
  - `PaymentsPage`
  - `tableFor`
- Possible React components:
  - `EditDialog`
  - `GrantDialog`
  - `PaymentsPage`
  - `Route`

### `src/routes/_authenticated/admin.payouts.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 45.6 KB
- Detected capabilities: Supabase, Authentication, Payments, Classroom, Storage, Assessment
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/alert-dialog`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/dialog`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/switch`
  - `@/components/ui/tabs`
  - `@/components/ui/textarea`
  - `@/integrations/supabase/client`
  - `@/lib/access.functions`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `AdminPayoutsPage`
  - `fmt`
  - `IntentRow`
  - `IntentsTab`
  - `LevelRow`
  - `ManualIntentDialog`
  - `OverviewTab`
  - `PayoutItemRow`
  - `PayoutRunDialog`
  - `PayoutRunsTab`
  - `ProviderFormDialog`
  - `ProvidersTab`
  - `statusBadge`
  - `TutorLevelsTab`
- Possible React components:
  - `AdminPayoutsPage`
  - `IntentRow`
  - `IntentsTab`
  - `LevelRow`
  - `ManualIntentDialog`
  - `OverviewTab`
  - `PayoutItemRow`
  - `PayoutRunDialog`
  - `PayoutRunsTab`
  - `ProviderFormDialog`
  - `ProvidersTab`
  - `Route`
  - `TutorLevelsTab`

### `src/routes/_authenticated/admin.plans.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 13.7 KB
- Detected capabilities: Supabase, Payments, Classroom, Email, Assessment, Learning
- Imports:
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/dialog`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/components/ui/switch`
  - `@/components/ui/textarea`
  - `@/integrations/supabase/client`
  - `@/lib/access.functions`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `AdminPlans`
- Possible React components:
  - `AdminPlans`
  - `ALL_SCOPES`
  - `Route`

### `src/routes/_authenticated/admin.promotions.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 7.2 KB
- Detected capabilities: Supabase, Payments
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@/lib/access.functions`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `PromotionsPage`
- Possible React components:
  - `PromotionsPage`
  - `Route`

### `src/routes/_authenticated/admin.reports.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 2.5 KB
- Detected capabilities: Supabase, Email
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/badge`
  - `@/components/ui/card`
  - `@/integrations/supabase/client`
  - `@/lib/access.functions`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
- Exports:
  - `Route`
- Functions:
  - `ReportsPage`
- Possible React components:
  - `ReportsPage`
  - `Route`

### `src/routes/_authenticated/admin.students.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 2.8 KB
- Detected capabilities: Authorization, Email
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/lib/access.functions`
  - `@/lib/admin.functions`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `StudentsAdmin`
- Possible React components:
  - `Route`
  - `StudentsAdmin`

### `src/routes/_authenticated/admin.tutors.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 4.1 KB
- Detected capabilities: Supabase, Authorization, Email
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/integrations/supabase/client`
  - `@/lib/access.functions`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `TutorsAdmin`
- Possible React components:
  - `Route`
  - `TutorsAdmin`

### `src/routes/_authenticated/admin.whiteboard.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 1.4 KB
- Detected capabilities: Authorization, Classroom
- Imports:
  - `@/components/admin/ConfigToggle`
  - `@/components/dashboard/primitives`
  - `@/lib/access.functions`
  - `@tanstack/react-router`
- Exports:
  - `Route`
- Possible React components:
  - `Route`

### `src/routes/_authenticated/ai-tools.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 8.2 KB
- Detected capabilities: Assessment
- Imports:
  - `@/components/ai/SaveToNotes`
  - `@/components/ai/SmartMarkdown`
  - `@/components/ScopeGate`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/textarea`
  - `@/lib/ai-tools.functions`
  - `@tanstack/react-router`
  - `@tanstack/react-start`
  - `framer-motion`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `AiToolsPage`
- Possible React components:
  - `AiToolsPage`
  - `Icon`
  - `Route`
  - `TOOLS`

### `src/routes/_authenticated/ai-tutor.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 9.8 KB
- Detected capabilities: Authorization, Storage, Assessment
- Imports:
  - `@/components/ai/SaveToNotes`
  - `@/components/ai/SmartMarkdown`
  - `@/components/ScopeGate`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/textarea`
  - `@/lib/ai-tutor.functions`
  - `@tanstack/react-router`
  - `@tanstack/react-start`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `AiTutorPage`
  - `fileToDataUrl`
- Possible React components:
  - `AiTutorPage`
  - `MAX_IMAGE_BYTES`
  - `Route`

### `src/routes/_authenticated/assignments.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 9 KB
- Detected capabilities: Supabase
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/dialog`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/components/ui/textarea`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `AssignmentsPage`
  - `CreateAssignmentDialog`
- Possible React components:
  - `AssignmentsPage`
  - `CreateAssignmentDialog`
  - `Route`

### `src/routes/_authenticated/become-tutor.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 13.2 KB
- Detected capabilities: Supabase, Storage, Email
- Imports:
  - `@/components/Navbar`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/textarea`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `BecomeTutorPage`
- Possible React components:
  - `BecomeTutorPage`
  - `DOC_SPECS`
  - `Route`

### `src/routes/_authenticated/book.$tutorId.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 16.5 KB
- Detected capabilities: Supabase, Authentication, Email, Scheduling, Learning
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ScopeGate`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/dialog`
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@/lib/booking-emails.functions`
  - `@/lib/utils`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `BookTutorPage`
  - `buildTutorLocal`
  - `joinWaitlist`
  - `startOfWeek`
  - `zonedTimeToUtc`
- Possible React components:
  - `BookTutorPage`
  - `Route`
  - `STEP_MIN`

### `src/routes/_authenticated/calendar.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 6 KB
- Detected capabilities: Supabase, Authentication, Scheduling
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ScheduleStudentCard`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@/lib/utils`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
- Exports:
  - `Route`
- Functions:
  - `buildGrid`
  - `CalendarPage`
- Possible React components:
  - `CalendarPage`
  - `Route`

### `src/routes/_authenticated/certificate.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 6.3 KB
- Detected capabilities: Supabase, Authentication, Storage, Email, Learning
- Imports:
  - `@/components/Navbar`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
- Exports:
  - `Route`
- Functions:
  - `CertificatePage`
- Possible React components:
  - `CertificatePage`
  - `Route`

### `src/routes/_authenticated/classroom.$roomId.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 1.5 KB
- Detected capabilities: Authentication, Classroom, Email
- Imports:
  - `@/components/classroom/ClassroomShell`
  - `@/hooks/use-auth`
  - `@/lib/access.functions`
  - `@tanstack/react-router`
  - `react`
- Exports:
  - `Route`
- Functions:
  - `ClassroomPage`
- Possible React components:
  - `ClassroomPage`
  - `Route`

### `src/routes/_authenticated/code.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 5.2 KB
- Imports:
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/textarea`
  - `@/lib/ai-tools.functions`
  - `@tanstack/react-router`
  - `@tanstack/react-start`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `CodePlayground`
  - `factorial`
  - `fmt`
- Possible React components:
  - `CodePlayground`
  - `Route`
  - `STARTER`

### `src/routes/_authenticated/courses.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 16.5 KB
- Detected capabilities: Supabase, Authentication, Storage, Learning
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/checkbox`
  - `@/components/ui/dialog`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/components/ui/textarea`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@/lib/course-materials.functions`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `@tanstack/react-start`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `CoursesPage`
  - `kindIcon`
  - `ManageAccessDialog`
  - `MaterialCard`
  - `NewMaterialDialog`
- Possible React components:
  - `CoursesPage`
  - `Icon`
  - `ManageAccessDialog`
  - `MaterialCard`
  - `NewMaterialDialog`
  - `Route`

### `src/routes/_authenticated/dashboard.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 45.9 KB
- Detected capabilities: Supabase, Authentication, Authorization, Payments, Classroom, Storage, Email, Scheduling, Assessment, Learning
- Imports:
  - `@/components/dashboard/AdminHome`
  - `@/components/dashboard/StudentHome`
  - `@/components/dashboard/TutorHome`
  - `@/components/Navbar`
  - `@/components/ScheduleStudentCard`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/progress`
  - `@/components/ui/select`
  - `@/components/ui/textarea`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `Dashboard`
  - `ProposeCourseCard`
  - `QuickAction`
  - `ReviewsCard`
  - `SectionHeader`
  - `StatCard`
  - `StudentFeeCard`
  - `SubscriptionPanel`
- Possible React components:
  - `Dashboard`
  - `ProposeCourseCard`
  - `QuickAction`
  - `ReviewsCard`
  - `Route`
  - `SectionHeader`
  - `StatCard`
  - `StudentFeeCard`
  - `SUBJECT_SUGGESTIONS`
  - `SubscriptionPanel`

### `src/routes/_authenticated/labs.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 4.4 KB
- Imports:
  - `@/components/LorddaLab`
  - `@/components/Navbar`
  - `@/components/ScopeGate`
  - `@/components/WebGLLab`
  - `@/hooks/use-auth`
  - `@/lib/lab-modules`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
- Exports:
  - `Route`
- Functions:
  - `LabsPage`
- Possible React components:
  - `LabsPage`
  - `Route`

### `src/routes/_authenticated/labs_.simulation-lab.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 23.8 KB
- Detected capabilities: Assessment, Learning
- Imports:
  - `@/components/lab3d/AmbientEmpty`
  - `@/components/lab3d/SimChat`
  - `@/components/lab3d/SimDispatch`
  - `@/components/Navbar`
  - `@/components/ScopeGate`
  - `@/components/ui/button`
  - `@/components/ui/dialog`
  - `@/components/ui/input`
  - `@/components/ui/tabs`
  - `@/components/ui/textarea`
  - `@/lib/sim-lab.functions`
  - `@tanstack/react-router`
  - `@tanstack/react-start`
  - `lucide-react`
  - `react`
  - `sonner`
  - `three`
- Exports:
  - `Route`
- Functions:
  - `generateAnyway`
  - `goFullscreen`
  - `handleGenerate`
  - `Lab3DPage`
  - `loadFromLibrary`
  - `loadMatched`
  - `refreshLibrary`
  - `removeItem`
  - `toLibraryItems`
- Possible React components:
  - `Lab3DPage`
  - `Route`

### `src/routes/_authenticated/lessons.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 8.6 KB
- Detected capabilities: Supabase, Authentication, Authorization, Classroom, Scheduling, Learning
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/dialog`
  - `@/components/ui/input`
  - `@/components/ui/tabs`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `LessonsPage`
- Possible React components:
  - `LessonsPage`
  - `Route`

### `src/routes/_authenticated/messages.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 7.7 KB
- Detected capabilities: Supabase, Authentication, Realtime, Scheduling
- Imports:
  - `@/components/Navbar`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `MessagesPage`
- Possible React components:
  - `MessagesPage`
  - `Route`

### `src/routes/_authenticated/my-courses.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 4.2 KB
- Detected capabilities: Supabase, Storage, Learning
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/dialog`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@/lib/course-materials.functions`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `@tanstack/react-start`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `kindIcon`
  - `MyCoursesPage`
- Possible React components:
  - `Icon`
  - `MyCoursesPage`
  - `Route`

### `src/routes/_authenticated/notes.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 6.4 KB
- Detected capabilities: Supabase, Classroom
- Imports:
  - `@/components/ai/SmartMarkdown`
  - `@/components/dashboard/primitives`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/textarea`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `FolderFilter`
  - `folderLabel`
  - `NotesPage`
- Possible React components:
  - `FolderFilter`
  - `NotesPage`
  - `Route`

### `src/routes/_authenticated/notifications.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 3.9 KB
- Detected capabilities: Supabase
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
- Exports:
  - `Route`
- Functions:
  - `NotificationsPage`
- Possible React components:
  - `NotificationsPage`
  - `Route`

### `src/routes/_authenticated/parent.children.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 7.3 KB
- Detected capabilities: Supabase, Authorization, Email, Assessment
- Imports:
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `ManageChildren`
- Possible React components:
  - `ManageChildren`
  - `Route`

### `src/routes/_authenticated/parent.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 5.6 KB
- Detected capabilities: Supabase, Authentication, Authorization, Scheduling, Learning
- Imports:
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
- Exports:
  - `Route`
- Functions:
  - `ParentDashboard`
  - `StatCard`
- Possible React components:
  - `ParentDashboard`
  - `Route`
  - `StatCard`

### `src/routes/_authenticated/pay-tutor.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 6.4 KB
- Detected capabilities: Supabase, Authentication, Payments, Learning
- Imports:
  - `@/components/Navbar`
  - `@/components/ScopeGate`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `PayTutorInner`
  - `PayTutorPage`
- Possible React components:
  - `PayTutorInner`
  - `PayTutorPage`
  - `Route`

### `src/routes/_authenticated/records.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 4.8 KB
- Detected capabilities: Supabase, Authentication, Classroom, Storage, Learning
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
- Exports:
  - `Route`
- Functions:
  - `RecordsPage`
- Possible React components:
  - `RecordsPage`
  - `Route`

### `src/routes/_authenticated/resources.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 6.9 KB
- Detected capabilities: Supabase, Storage
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/dialog`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `NewResourceDialog`
  - `ResourcesPage`
- Possible React components:
  - `NewResourceDialog`
  - `ResourcesPage`
  - `Route`

### `src/routes/_authenticated/settings.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 11.5 KB
- Detected capabilities: Supabase, Authentication, Payments, Email, Scheduling
- Imports:
  - `@/components/dashboard/AppShell`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/separator`
  - `@/components/ui/switch`
  - `@/components/ui/tabs`
  - `@/components/ui/textarea`
  - `@/hooks/use-auth`
  - `@/hooks/use-theme`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `AppearanceSection`
  - `BillingSection`
  - `NotificationsSection`
  - `ProfileSection`
  - `SecuritySection`
  - `SettingsPage`
  - `ToggleRow`
- Possible React components:
  - `AppearanceSection`
  - `BillingSection`
  - `NotificationsSection`
  - `ProfileSection`
  - `Route`
  - `SecuritySection`
  - `SettingsPage`
  - `ToggleRow`

### `src/routes/_authenticated/tutor.availability.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 7.4 KB
- Detected capabilities: Supabase, Scheduling, Learning
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `AvailabilityPage`
  - `hhmm`
  - `mins`
- Possible React components:
  - `AvailabilityPage`
  - `Route`
  - `WEEKDAYS`

### `src/routes/_authenticated/tutor.holidays.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 4.2 KB
- Detected capabilities: Supabase, Scheduling, Learning
- Imports:
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `Holidays`
- Possible React components:
  - `Holidays`
  - `Route`

### `src/routes/_authenticated/wallet.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 8.2 KB
- Detected capabilities: Supabase, Payments, Classroom
- Imports:
  - `@/components/dashboard/primitives`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-query`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
- Exports:
  - `Route`
- Functions:
  - `fmt`
  - `WalletPage`
- Possible React components:
  - `Route`
  - `WalletPage`

### `src/routes/_authenticated/whiteboard-review.$sessionId.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 1.3 KB
- Detected capabilities: Authentication, Classroom, Assessment
- Imports:
  - `@/components/ui/button`
  - `@tanstack/react-router`
  - `lucide-react`
- Exports:
  - `Route`
- Functions:
  - `ReviewPage`
- Possible React components:
  - `ReviewPage`
  - `Route`

### `src/routes/api/checkout/return.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 3.8 KB
- Detected capabilities: Supabase, Payments
- Imports:
  - `@tanstack/react-router`
- Exports:
  - `Route`
- Possible React components:
  - `Route`

### `src/routes/api/public/webhooks/paypal.ts`

- Category: **Routing**
- Type: `.ts`
- Size: 3 KB
- Detected capabilities: Supabase, Payments
- Imports:
  - `@tanstack/react-router`
- Exports:
  - `Route`
- Possible React components:
  - `Route`

### `src/routes/auth.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 6.8 KB
- Detected capabilities: Supabase, Authentication, Email
- Imports:
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/tabs`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
  - `zod`
- Exports:
  - `Route`
- Functions:
  - `AuthPage`
  - `Field`
- Possible React components:
  - `AuthPage`
  - `Field`
  - `Route`

### `src/routes/checkout.cancelled.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 0.7 KB
- Detected capabilities: Payments, Classroom
- Imports:
  - `@/components/ui/button`
  - `@tanstack/react-router`
  - `lucide-react`
- Exports:
  - `Route`
- Possible React components:
  - `Route`

### `src/routes/checkout.failed.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 1.2 KB
- Detected capabilities: Payments
- Imports:
  - `@/components/ui/button`
  - `@tanstack/react-router`
  - `lucide-react`
- Exports:
  - `Route`
- Functions:
  - `FailedPage`
- Possible React components:
  - `FailedPage`
  - `Route`

### `src/routes/checkout.success.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 0.7 KB
- Detected capabilities: Payments
- Imports:
  - `@/components/ui/button`
  - `@tanstack/react-router`
  - `lucide-react`
- Exports:
  - `Route`
- Possible React components:
  - `Route`

### `src/routes/community.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 9.6 KB
- Detected capabilities: Supabase
- Imports:
  - `@/components/Navbar`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/textarea`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `framer-motion`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `CommunityPage`
  - `ReplyBox`
- Possible React components:
  - `CommunityPage`
  - `ReplyBox`
  - `Route`

### `src/routes/email/unsubscribe.ts`

- Category: **Routing**
- Type: `.ts`
- Size: 5.3 KB
- Detected capabilities: Supabase, Authorization, Email
- Imports:
  - `@supabase/supabase-js`
  - `@tanstack/react-router`
- Exports:
  - `Route`
- Functions:
  - `redactEmail`
- Possible React components:
  - `Route`

### `src/routes/help.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 3.6 KB
- Detected capabilities: Email
- Imports:
  - `@/components/Navbar`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/textarea`
  - `@/hooks/use-auth`
  - `@/lib/help.functions`
  - `@tanstack/react-router`
  - `@tanstack/react-start`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `HelpPage`
- Possible React components:
  - `HelpPage`
  - `Route`

### `src/routes/index.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 14.3 KB
- Detected capabilities: Supabase, Authentication, Authorization, Classroom, Assessment, Learning
- Imports:
  - `@/components/Navbar`
  - `@/components/ui/button`
  - `@/components/ui/dialog`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
- Exports:
  - `Route`
- Functions:
  - `ActivityTicker`
  - `Hero`
  - `Home`
  - `HowItWorks`
  - `InstantActions`
  - `MinimalFooter`
  - `subjectEmoji`
  - `Subjects`
  - `TrustMetrics`
- Possible React components:
  - `ActivityTicker`
  - `Hero`
  - `Home`
  - `HowItWorks`
  - `InstantActions`
  - `MinimalFooter`
  - `Route`
  - `Subjects`
  - `TrustMetrics`

### `src/routes/leaderboard.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 4.7 KB
- Detected capabilities: Supabase
- Imports:
  - `@/components/Navbar`
  - `@/components/ui/badge`
  - `@/components/ui/card`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
- Exports:
  - `Route`
- Functions:
  - `LeaderboardPage`
- Possible React components:
  - `LeaderboardPage`
  - `Route`

### `src/routes/tutor.$id.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 7.9 KB
- Detected capabilities: Supabase, Authentication
- Imports:
  - `@/components/Navbar`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/integrations/supabase/client`
  - `@tanstack/react-router`
  - `framer-motion`
  - `lucide-react`
  - `react`
- Exports:
  - `Route`
- Functions:
  - `TutorProfile`
- Possible React components:
  - `Route`
  - `TutorProfile`

### `src/routes/tutors.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 12.8 KB
- Detected capabilities: Supabase, Authentication, Payments, Email, Scheduling, Learning
- Imports:
  - `@/components/Navbar`
  - `@/components/ui/badge`
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@/components/ui/dialog`
  - `@/components/ui/input`
  - `@/components/ui/label`
  - `@/components/ui/select`
  - `@/hooks/use-auth`
  - `@/integrations/supabase/client`
  - `@/lib/booking-emails.functions`
  - `@tanstack/react-router`
  - `lucide-react`
  - `react`
  - `sonner`
- Exports:
  - `Route`
- Functions:
  - `AllTutorsPage`
  - `BookSessionDialog`
  - `TutorCard`
- Possible React components:
  - `AllTutorsPage`
  - `BookSessionDialog`
  - `Route`
  - `TutorCard`

### `src/routes/unsubscribe.tsx`

- Category: **Routing**
- Type: `.tsx`
- Size: 3.2 KB
- Detected capabilities: Email
- Imports:
  - `@/components/ui/button`
  - `@/components/ui/card`
  - `@tanstack/react-router`
  - `react`
- Exports:
  - `Route`
- Functions:
  - `UnsubscribePage`
- Possible React components:
  - `Route`
  - `UnsubscribePage`

### `src/routeTree.gen.ts`

- Category: **Other**
- Type: `.ts`
- Size: 52.1 KB
- Detected capabilities: Authentication, Payments, Classroom, Email, Scheduling, Learning
- Imports:
  - `./router.tsx`
  - `./routes/__root`
  - `./routes/_authenticated`
  - `./routes/_authenticated/admin.ai`
  - `./routes/_authenticated/admin.analytics`
  - `./routes/_authenticated/admin.audit`
  - `./routes/_authenticated/admin.classrooms`
  - `./routes/_authenticated/admin.commissions`
  - `./routes/_authenticated/admin.index`
  - `./routes/_authenticated/admin.moderation`
  - `./routes/_authenticated/admin.payments`
  - `./routes/_authenticated/admin.payouts`
  - `./routes/_authenticated/admin.plans`
  - `./routes/_authenticated/admin.promotions`
  - `./routes/_authenticated/admin.reports`
  - `./routes/_authenticated/admin.students`
  - `./routes/_authenticated/admin.tutors`
  - `./routes/_authenticated/admin.whiteboard`
  - `./routes/_authenticated/ai-tools`
  - `./routes/_authenticated/ai-tutor`
  - `./routes/_authenticated/assignments`
  - `./routes/_authenticated/become-tutor`
  - `./routes/_authenticated/book.$tutorId`
  - `./routes/_authenticated/calendar`
  - `./routes/_authenticated/certificate`
  - `./routes/_authenticated/classroom.$roomId`
  - `./routes/_authenticated/code`
  - `./routes/_authenticated/courses`
  - `./routes/_authenticated/dashboard`
  - `./routes/_authenticated/labs`
  - `./routes/_authenticated/labs_.simulation-lab`
  - `./routes/_authenticated/lessons`
  - `./routes/_authenticated/messages`
  - `./routes/_authenticated/my-courses`
  - `./routes/_authenticated/notes`
  - `./routes/_authenticated/notifications`
  - `./routes/_authenticated/parent`
  - `./routes/_authenticated/parent.children`
  - `./routes/_authenticated/pay-tutor`
  - `./routes/_authenticated/records`
  - `./routes/_authenticated/resources`
  - `./routes/_authenticated/settings`
  - `./routes/_authenticated/tutor.availability`
  - `./routes/_authenticated/tutor.holidays`
  - `./routes/_authenticated/wallet`
  - `./routes/_authenticated/whiteboard-review.$sessionId`
  - `./routes/api/checkout/return`
  - `./routes/api/public/webhooks/paypal`
  - `./routes/auth`
  - `./routes/checkout.cancelled`
  - `./routes/checkout.failed`
  - `./routes/checkout.success`
  - `./routes/community`
  - `./routes/email/unsubscribe`
  - `./routes/help`
  - `./routes/index`
  - `./routes/leaderboard`
  - `./routes/reset-password`
  - `./routes/tutor.$id`
  - `./routes/tutors`
  - `./routes/unsubscribe`
  - `./start.ts`
- Exports:
  - `FileRoutesByFullPath`
  - `FileRoutesById`
  - `FileRoutesByTo`
  - `FileRouteTypes`
  - `RootRouteChildren`
  - `routeTree`
- Possible React components:
  - `ApiCheckoutReturnRoute`
  - `ApiPublicWebhooksPaypalRoute`
  - `AuthenticatedAdminAiRoute`
  - `AuthenticatedAdminAnalyticsRoute`
  - `AuthenticatedAdminAuditRoute`
  - `AuthenticatedAdminClassroomsRoute`
  - `AuthenticatedAdminCommissionsRoute`
  - `AuthenticatedAdminIndexRoute`
  - `AuthenticatedAdminModerationRoute`
  - `AuthenticatedAdminPaymentsRoute`
  - `AuthenticatedAdminPayoutsRoute`
  - `AuthenticatedAdminPlansRoute`
  - `AuthenticatedAdminPromotionsRoute`
  - `AuthenticatedAdminReportsRoute`
  - `AuthenticatedAdminStudentsRoute`
  - `AuthenticatedAdminTutorsRoute`
  - `AuthenticatedAdminWhiteboardRoute`
  - `AuthenticatedAiToolsRoute`
  - `AuthenticatedAiTutorRoute`
  - `AuthenticatedAssignmentsRoute`
  - `AuthenticatedBecomeTutorRoute`
  - `AuthenticatedBookTutorIdRoute`
  - `AuthenticatedCalendarRoute`
  - `AuthenticatedCertificateRoute`
  - `AuthenticatedClassroomRoomIdRoute`
  - `AuthenticatedCodeRoute`
  - `AuthenticatedCoursesRoute`
  - `AuthenticatedDashboardRoute`
  - `AuthenticatedLabsRoute`
  - `AuthenticatedLabsSimulationLabRoute`
  - `AuthenticatedLessonsRoute`
  - `AuthenticatedMessagesRoute`
  - `AuthenticatedMyCoursesRoute`
  - `AuthenticatedNotesRoute`
  - `AuthenticatedNotificationsRoute`
  - `AuthenticatedParentChildrenRoute`
  - `AuthenticatedParentRoute`
  - `AuthenticatedParentRouteChildren`
  - `AuthenticatedParentRouteWithChildren`
  - `AuthenticatedPayTutorRoute`
  - `AuthenticatedRecordsRoute`
  - `AuthenticatedResourcesRoute`
  - `AuthenticatedRoute`
  - `AuthenticatedRouteChildren`
  - `AuthenticatedRouteWithChildren`
  - `AuthenticatedSettingsRoute`
  - `AuthenticatedTutorAvailabilityRoute`
  - `AuthenticatedTutorHolidaysRoute`
  - `AuthenticatedWalletRoute`
  - `AuthenticatedWhiteboardReviewSessionIdRoute`
  - `AuthRoute`
  - `CheckoutCancelledRoute`
  - `CheckoutFailedRoute`
  - `CheckoutSuccessRoute`
  - `CommunityRoute`
  - `EmailUnsubscribeRoute`
  - `HelpRoute`
  - `IndexRoute`
  - `LeaderboardRoute`
  - `ResetPasswordRoute`
  - `TutorIdRoute`
  - `TutorsRoute`
  - `UnsubscribeRoute`

### `src/server.ts`

- Category: **Other**
- Type: `.ts`
- Size: 0.4 KB
- Imports:
  - `./lib/server/platform`

### `src/start.ts`

- Category: **Other**
- Type: `.ts`
- Size: 0.8 KB
- Detected capabilities: Supabase, Email
- Imports:
  - `./lib/error-page`
  - `@/integrations/supabase/auth-attacher`
  - `@tanstack/react-start`
- Exports:
  - `startInstance`

### `supabase/migrations/20260518180453_b7b6b188-b2f9-4a6e-8317-5f8fd52bffac.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 4.6 KB

### `supabase/migrations/20260518180507_8749a32b-dc91-4e11-b9de-8107bc6e9a43.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.3 KB

### `supabase/migrations/20260518180559_079a0331-844f-4a93-af54-df8c3b16c8ff.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.1 KB

### `supabase/migrations/20260520134733_17b373c0-0c07-41a8-a4e7-7a2d37738f9b.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.9 KB

### `supabase/migrations/20260521120359_e0e495a3-e6c6-4d8c-9376-6aab3bcb158c.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.1 KB

### `supabase/migrations/20260521120426_f8a86ba3-535c-4a9b-9c14-d92ffe33f02c.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1 KB

### `supabase/migrations/20260521120758_573f01a8-70c7-4bea-904d-df0f39bd7928.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.8 KB

### `supabase/migrations/20260522062230_43125182-8270-4977-9b19-ccf05619dfc1.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.1 KB

### `supabase/migrations/20260522073549_72500aff-965a-49a8-b3ab-2239c850168b.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 2.1 KB

### `supabase/migrations/20260522080609_f51f3676-392c-4338-9bf9-df9c105ace54.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.2 KB

### `supabase/migrations/20260522081314_e4dfd053-8a0b-4f10-b201-0bf7b8ed2693.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0 KB

### `supabase/migrations/20260522083220_390d842b-0b64-43c7-b5e6-c87b5c7fd60f.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 4 KB

### `supabase/migrations/20260522085703_b8342121-277e-478e-9c42-e2786a56c7c3.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.6 KB

### `supabase/migrations/20260522085716_cae43fa7-ce66-4c10-81a1-e0f4588a6e75.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.4 KB

### `supabase/migrations/20260522092853_email_infra.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 11.1 KB

### `supabase/migrations/20260522092905_email_infra.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 11.1 KB

### `supabase/migrations/20260522093122_email_infra.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 11.1 KB

### `supabase/migrations/20260522105704_683e0c7c-3a9f-4da8-822e-a34d221a36f2.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1 KB

### `supabase/migrations/20260522110136_e7689ab4-ce46-4391-8a25-1cc5f1eb3a9d.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 3.7 KB

### `supabase/migrations/20260522113118_7b053bf2-58a5-48b8-8dbe-dbb0583cf4a1.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 2.8 KB

### `supabase/migrations/20260522120800_fe282aa0-ce58-4c5b-a14a-79b180215e97.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.1 KB

### `supabase/migrations/20260523081725_04e83f6c-dd2a-4938-9b33-3e24fa61ed29.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.5 KB

### `supabase/migrations/20260523083334_1bbbc501-2402-4d07-a676-38c68d2d1f0b.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.6 KB

### `supabase/migrations/20260524041428_148987e9-23da-47fa-8182-294dcfc9400c.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.1 KB

### `supabase/migrations/20260524041718_e722d83c-5457-4ec3-b7b6-c6e8be29c3df.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 2.3 KB

### `supabase/migrations/20260524041736_08febb8a-724f-4196-9c78-0b3d6784c153.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0 KB

### `supabase/migrations/20260524042040_6fd4de5c-4856-4bbc-a86b-eda4026f5bff.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.1 KB

### `supabase/migrations/20260524042244_6ecb8491-343f-435d-9189-c0e2483ea230.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 5.5 KB

### `supabase/migrations/20260524042859_808cd5c3-c692-4ca0-b22d-e5359b17464c.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.3 KB

### `supabase/migrations/20260524043637_d17d6f91-84c3-45ff-af6b-648a666f715d.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 2 KB

### `supabase/migrations/20260524044641_c5814e6b-fe15-459d-96b0-746ba98fdc2c.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.1 KB

### `supabase/migrations/20260524044744_email_infra.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 11.1 KB

### `supabase/migrations/20260524051514_1878b3e2-125a-46eb-a789-fa1409028e71.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 2 KB

### `supabase/migrations/20260524064757_b2d8e9c2-2d6e-4b76-8a73-dd3c1987a2ae.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1 KB

### `supabase/migrations/20260524065325_6df81ffd-fb2e-4df8-ac71-5b5f8cd92554.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.8 KB

### `supabase/migrations/20260524070449_ae8130d6-d9a2-4437-8dd0-73c2893185b3.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 3.3 KB

### `supabase/migrations/20260524074439_b5bca5df-a7ce-40c8-a931-d1e64321d7b5.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.5 KB

### `supabase/migrations/20260525125039_8673bafb-4eda-434f-9900-1a4c688ab424.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.9 KB

### `supabase/migrations/20260528060818_02ef6fb2-553e-43f1-900a-bd8eb4dd56af.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.3 KB

### `supabase/migrations/20260530152504_b823d221-b60a-432b-85ac-0745a79e9d55.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 8.1 KB

### `supabase/migrations/20260601045818_f63dbd87-f3a0-4e98-8232-d380ac4a68f6.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 6.4 KB

### `supabase/migrations/20260605061006_40c146b5-f458-4620-a3ed-688348719a19.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 2.9 KB

### `supabase/migrations/20260611082303_c77aeed1-ee3d-4917-983d-abc4f0e52ceb.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 3.2 KB

### `supabase/migrations/20260620193809_e7f89819-b8cc-4e85-9441-39e6b31e579d.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 3.8 KB

### `supabase/migrations/20260620193831_7e7a3f45-9cbe-4ad4-91c4-0884121a0b3a.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1 KB

### `supabase/migrations/20260622125739_8a71ad77-3504-43d2-92b4-3fedd6b2a91e.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 17.7 KB

### `supabase/migrations/20260622125757_eabc3c74-3adb-4b2a-bb50-d98a2da0a202.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.6 KB

### `supabase/migrations/20260622133155_c56722d8-1a65-4287-bf95-1c06689bba3f.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 8.7 KB

### `supabase/migrations/20260623074007_ddbe3e51-097a-4763-af33-95b236a42698.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.7 KB

### `supabase/migrations/20260623075231_4c324342-ee6b-47fa-ad48-39af2516c21c.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.9 KB

### `supabase/migrations/20260623082025_9963a138-6dc4-4d83-8b63-3cd31e3a7504.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 24.3 KB

### `supabase/migrations/20260623082050_70d58ecc-f89e-48ad-9e55-0d5e10f677f2.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.2 KB

### `supabase/migrations/20260623082342_5be4ee4e-9845-45f8-b995-dace190d24f1.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.9 KB

### `supabase/migrations/20260623100541_29ade4ae-9cc6-46bf-a916-ba9ecf155ff3.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 6 KB

### `supabase/migrations/20260623102100_68bc0646-a669-4dd9-9ba7-4cdb16225116.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.1 KB

### `supabase/migrations/20260623111535_6dc2ecd4-5f71-421a-a372-bd125820c267.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 7.6 KB

### `supabase/migrations/20260623113448_5862c988-44e2-423a-8dce-ff55c49cf774.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 2 KB

### `supabase/migrations/20260623114741_9a1edb8d-58ea-4825-8560-ba68d6527ab9.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.5 KB

### `supabase/migrations/20260623121121_6dd82a2e-a01a-42c2-a505-12240ec66391.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 4.4 KB

### `supabase/migrations/20260701082250_cc8fecf7-8ce5-4d5e-971b-0bad7a33e4e9.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1 KB

### `supabase/migrations/20260701084425_090d5165-a08f-4cce-ba0a-56620c1578d1.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.7 KB

### `supabase/migrations/20260811090000_29d8fece-92c9-4bab-a85f-e95d49161abf.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.8 KB

### `supabase/migrations/20260812060000_p0_security_fixes.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 17.1 KB

### `supabase/migrations/20260812100000_close_session_insert_bypass.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 0.6 KB

### `supabase/migrations/20260812120000_restore_whiteboard_chat_tables.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 6.1 KB

### `supabase/migrations/20260812130000_harden_rpc_grants_and_guards.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 11.7 KB

### `supabase/migrations/20260812140000_revoke_public_execute_grants.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 2.7 KB

### `supabase/migrations/20260812150000_align_booking_gate_with_subscriptions_flag.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 5.6 KB

### `supabase/migrations/20260813090000_add_rls_profiles_user_roles_policies.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 3.1 KB

### `supabase/migrations/20260814090000_add_rls_admin_operations_policies.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 3.1 KB

### `supabase/migrations/20260814140000_add_rls_entitlement_gates_beyond_book_session.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 1.9 KB

### `supabase/migrations/20260815090000_add_rls_tutor_app_promotion_validation.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 4.1 KB

### `supabase/migrations/20260815140000_add_rls_parent_role_policies.sql`

- Category: **Database Migration**
- Type: `.sql`
- Size: 6.1 KB

### `tests/ai-entitlement.test.ts`

- Category: **Testing**
- Type: `.ts`
- Size: 4.9 KB
- Detected capabilities: Authorization, Payments, Classroom
- Imports:
  - `../src/lib/ai-entitlement`
  - `bun:test`
- Functions:
  - `makeGateway`
- Possible React components:
  - `UID`

### `tests/room-access.test.ts`

- Category: **Testing**
- Type: `.ts`
- Size: 2.5 KB
- Detected capabilities: Authentication
- Imports:
  - `../src/lib/room-access`
  - `bun:test`
- Functions:
  - `lookup`
- Possible React components:
  - `ROOM`
  - `STUDENT`
  - `TUTOR`

### `tests/webhook-actions.test.ts`

- Category: **Testing**
- Type: `.ts`
- Size: 2.7 KB
- Detected capabilities: Payments
- Imports:
  - `../src/lib/payments/webhook-actions`
  - `bun:test`

### `tutor_apps_count.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `verify_profiles_policies.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `verify_rpcs.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.2 KB

### `verify_sessions_policies.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `verify_tutor_courses_policies.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `verify_tutor_subscriptions_policies.sql`

- Category: **Commerce / Payment**
- Type: `.sql`
- Size: 0.1 KB

### `verify_user_roles_policies.sql`

- Category: **SQL**
- Type: `.sql`
- Size: 0.1 KB

### `vite.config.ts`

- Category: **Build Configuration**
- Type: `.ts`
- Size: 3.8 KB
- Imports:
  - `@tailwindcss/vite`
  - `@tanstack/react-start/plugin/vite`
  - `@vitejs/plugin-react`
  - `node:path`
  - `vite`
  - `vite-tsconfig-paths`
- Possible React components:
  - `NITRO_PRESET`

## 6. Capability Index

### Supabase

Detected in **84** files.
- `src/components/admin/AiProviderSelect.tsx`
- `src/components/admin/ConfigToggle.tsx`
- `src/components/ai/SaveToNotes.tsx`
- `src/components/classroom/ClassroomChat.tsx`
- `src/components/classroom/ParticipantsPanel.tsx`
- `src/components/classroom/SidePanel.tsx`
- `src/components/ClassroomFiles.tsx`
- `src/components/dashboard/AdminHome.tsx`
- `src/components/dashboard/AppShell.tsx`
- `src/components/dashboard/StudentHome.tsx`
- `src/components/dashboard/TutorHome.tsx`
- `src/components/LorddaLab.tsx`
- `src/components/Navbar.tsx`
- `src/components/ScheduleStudentCard.tsx`
- `src/components/whiteboard/canvas/realtime.ts`
- `src/components/whiteboard/canvas/Whiteboard.tsx`
- `src/hooks/use-auth.tsx`
- `src/hooks/use-platform-config.ts`
- `src/integrations/supabase/auth-attacher.ts`
- `src/integrations/supabase/auth-middleware.ts`
- `src/integrations/supabase/client.server.ts`
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `src/lib/access.functions.ts`
- `src/lib/admin.functions.ts`
- `src/lib/agents/run-agent.functions.ts`
- `src/lib/ai/keys.functions.ts`
- `src/lib/ai/provider.server.ts`
- `src/lib/ai-entitlement.ts`
- `src/lib/ai-tools.functions.ts`
- `src/lib/ai-tutor.functions.ts`
- `src/lib/booking-emails.functions.ts`
- `src/lib/classroom-rtc/PeerToPeerRTCService.ts`
- `src/lib/course-materials.functions.ts`
- `src/lib/email/enqueue.server.ts`
- `src/lib/entitlements.functions.ts`
- `src/lib/help.functions.ts`
- `src/lib/payments/checkout.functions.ts`
- `src/lib/payments/router.server.ts`
- `src/lib/sim-chat.functions.ts`
- `src/lib/sim-lab.functions.ts`
- `src/lib/students.functions.ts`
- `src/lib/whiteboard-ai.functions.ts`
- `src/routes/_authenticated/admin.analytics.tsx`
- `src/routes/_authenticated/admin.commissions.tsx`
- `src/routes/_authenticated/admin.index.tsx`
- `src/routes/_authenticated/admin.moderation.tsx`
- `src/routes/_authenticated/admin.payments.tsx`
- `src/routes/_authenticated/admin.payouts.tsx`
- `src/routes/_authenticated/admin.plans.tsx`
- `src/routes/_authenticated/admin.promotions.tsx`
- `src/routes/_authenticated/admin.reports.tsx`
- `src/routes/_authenticated/admin.tutors.tsx`
- `src/routes/_authenticated/assignments.tsx`
- `src/routes/_authenticated/become-tutor.tsx`
- `src/routes/_authenticated/book.$tutorId.tsx`
- `src/routes/_authenticated/calendar.tsx`
- `src/routes/_authenticated/certificate.tsx`
- `src/routes/_authenticated/courses.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- `src/routes/_authenticated/lessons.tsx`
- `src/routes/_authenticated/messages.tsx`
- `src/routes/_authenticated/my-courses.tsx`
- `src/routes/_authenticated/notes.tsx`
- `src/routes/_authenticated/notifications.tsx`
- `src/routes/_authenticated/parent.children.tsx`
- `src/routes/_authenticated/parent.tsx`
- `src/routes/_authenticated/pay-tutor.tsx`
- `src/routes/_authenticated/records.tsx`
- `src/routes/_authenticated/resources.tsx`
- `src/routes/_authenticated/settings.tsx`
- `src/routes/_authenticated/tutor.availability.tsx`
- `src/routes/_authenticated/tutor.holidays.tsx`
- `src/routes/_authenticated/wallet.tsx`
- `src/routes/api/checkout/return.tsx`
- `src/routes/api/public/webhooks/paypal.ts`
- `src/routes/auth.tsx`
- `src/routes/community.tsx`
- `src/routes/email/unsubscribe.ts`
- `src/routes/index.tsx`
- `src/routes/leaderboard.tsx`
- `src/routes/tutor.$id.tsx`
- `src/routes/tutors.tsx`
- `src/start.ts`

### Authentication

Detected in **50** files.
- `src/components/classroom/ClassroomHeader.tsx`
- `src/components/classroom/useSessionTimer.ts`
- `src/components/dashboard/AdminHome.tsx`
- `src/components/dashboard/AppShell.tsx`
- `src/components/dashboard/StudentHome.tsx`
- `src/components/dashboard/TutorHome.tsx`
- `src/components/home/HomeSections.tsx`
- `src/components/InstallPrompt.tsx`
- `src/components/LorddaLab.tsx`
- `src/components/Navbar.tsx`
- `src/components/payments/PayButton.tsx`
- `src/components/ScheduleStudentCard.tsx`
- `src/components/ThreeDLab.tsx`
- `src/components/WebGLLab.tsx`
- `src/hooks/use-auth.tsx`
- `src/integrations/supabase/auth-attacher.ts`
- `src/integrations/supabase/auth-middleware.ts`
- `src/integrations/supabase/client.server.ts`
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `src/lib/access.functions.ts`
- `src/lib/ai-entitlement.ts`
- `src/lib/booking-emails.functions.ts`
- `src/lib/classroom-rtc/PeerToPeerRTCService.ts`
- `src/lib/email-templates/welcome.tsx`
- `src/lib/help.functions.ts`
- `src/lib/payments/checkout.functions.ts`
- `src/lib/payments/paypal.server.ts`
- `src/lib/room-access.ts`
- `src/routes/_authenticated/admin.analytics.tsx`
- `src/routes/_authenticated/admin.payouts.tsx`
- `src/routes/_authenticated/book.$tutorId.tsx`
- `src/routes/_authenticated/calendar.tsx`
- `src/routes/_authenticated/certificate.tsx`
- `src/routes/_authenticated/classroom.$roomId.tsx`
- `src/routes/_authenticated/courses.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- `src/routes/_authenticated/lessons.tsx`
- `src/routes/_authenticated/messages.tsx`
- `src/routes/_authenticated/parent.tsx`
- `src/routes/_authenticated/pay-tutor.tsx`
- `src/routes/_authenticated/records.tsx`
- `src/routes/_authenticated/settings.tsx`
- `src/routes/_authenticated/whiteboard-review.$sessionId.tsx`
- `src/routes/auth.tsx`
- `src/routes/index.tsx`
- `src/routes/tutor.$id.tsx`
- `src/routes/tutors.tsx`
- `src/routeTree.gen.ts`
- `tests/room-access.test.ts`

### Authorization

Detected in **46** files.
- `src/components/classroom/AIAssistantPanel.tsx`
- `src/components/dashboard/AdminHome.tsx`
- `src/components/home/HomeSections.tsx`
- `src/components/lab3d/SimChat.tsx`
- `src/components/ui/alert.tsx`
- `src/components/ui/breadcrumb.tsx`
- `src/components/ui/carousel.tsx`
- `src/components/ui/input-otp.tsx`
- `src/components/ui/pagination.tsx`
- `src/components/ui/table.tsx`
- `src/hooks/use-agent.ts`
- `src/hooks/use-auth.tsx`
- `src/integrations/supabase/client.server.ts`
- `src/integrations/supabase/types.ts`
- `src/lib/access.functions.ts`
- `src/lib/admin.functions.ts`
- `src/lib/agents/registry.server.ts`
- `src/lib/agents/run-agent.functions.ts`
- `src/lib/ai/keys.functions.ts`
- `src/lib/ai/provider.server.ts`
- `src/lib/ai-entitlement.ts`
- `src/lib/ai-tools.functions.ts`
- `src/lib/ai-tutor.functions.ts`
- `src/lib/booking-emails.functions.ts`
- `src/lib/classroom-rtc/PeerToPeerRTCService.ts`
- `src/lib/course-materials.functions.ts`
- `src/lib/email-templates/booking-confirmation.tsx`
- `src/lib/help.functions.ts`
- `src/lib/sim-chat.functions.ts`
- `src/lib/sim-lab.functions.ts`
- `src/lib/students.functions.ts`
- `src/lib/whiteboard-ai.functions.ts`
- `src/routes/_authenticated/admin.analytics.tsx`
- `src/routes/_authenticated/admin.classrooms.tsx`
- `src/routes/_authenticated/admin.index.tsx`
- `src/routes/_authenticated/admin.students.tsx`
- `src/routes/_authenticated/admin.tutors.tsx`
- `src/routes/_authenticated/admin.whiteboard.tsx`
- `src/routes/_authenticated/ai-tutor.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- `src/routes/_authenticated/lessons.tsx`
- `src/routes/_authenticated/parent.children.tsx`
- `src/routes/_authenticated/parent.tsx`
- `src/routes/email/unsubscribe.ts`
- `src/routes/index.tsx`
- `tests/ai-entitlement.test.ts`

### Payments

Detected in **39** files.
- `src/components/dashboard/AppShell.tsx`
- `src/components/dashboard/CommandPalette.tsx`
- `src/components/dashboard/TutorHome.tsx`
- `src/components/home/HomeSections.tsx`
- `src/components/Navbar.tsx`
- `src/components/payments/PayButton.tsx`
- `src/hooks/use-auth.tsx`
- `src/hooks/use-entitlements.ts`
- `src/hooks/use-platform-config.ts`
- `src/integrations/supabase/types.ts`
- `src/lib/ai-entitlement.ts`
- `src/lib/email/enqueue.server.ts`
- `src/lib/email/provider.server.ts`
- `src/lib/email-templates/subscription-approved.tsx`
- `src/lib/email-templates/subscription-rejected.tsx`
- `src/lib/help.functions.ts`
- `src/lib/payments/checkout.functions.ts`
- `src/lib/payments/paypal.server.ts`
- `src/lib/payments/router.server.ts`
- `src/lib/payments/webhook-actions.ts`
- `src/routes/_authenticated/admin.audit.tsx`
- `src/routes/_authenticated/admin.index.tsx`
- `src/routes/_authenticated/admin.payments.tsx`
- `src/routes/_authenticated/admin.payouts.tsx`
- `src/routes/_authenticated/admin.plans.tsx`
- `src/routes/_authenticated/admin.promotions.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- `src/routes/_authenticated/pay-tutor.tsx`
- `src/routes/_authenticated/settings.tsx`
- `src/routes/_authenticated/wallet.tsx`
- `src/routes/api/checkout/return.tsx`
- `src/routes/api/public/webhooks/paypal.ts`
- `src/routes/checkout.cancelled.tsx`
- `src/routes/checkout.failed.tsx`
- `src/routes/checkout.success.tsx`
- `src/routes/tutors.tsx`
- `src/routeTree.gen.ts`
- `tests/ai-entitlement.test.ts`
- `tests/webhook-actions.test.ts`

### AI

Detected in **11** files.
- `src/components/admin/AiKeyManager.tsx`
- `src/components/admin/AiProviderSelect.tsx`
- `src/hooks/use-platform-config.ts`
- `src/lib/agents/registry.server.ts`
- `src/lib/ai/keys.functions.ts`
- `src/lib/ai/provider.server.ts`
- `src/lib/ai-tools.functions.ts`
- `src/lib/ai-tutor.functions.ts`
- `src/lib/sim-chat.functions.ts`
- `src/lib/sim-lab.functions.ts`
- `src/lib/whiteboard-ai.functions.ts`

### Classroom

Detected in **71** files.
- `src/components/admin/AiProviderSelect.tsx`
- `src/components/ai/DiagramBlock.tsx`
- `src/components/ai/SaveToNotes.tsx`
- `src/components/ai/SmartMarkdown.tsx`
- `src/components/classroom/ActionBar.tsx`
- `src/components/classroom/ClassroomChat.tsx`
- `src/components/classroom/ClassroomHeader.tsx`
- `src/components/classroom/ClassroomShell.tsx`
- `src/components/classroom/ClassroomStage.tsx`
- `src/components/classroom/DeviceSettingsDialog.tsx`
- `src/components/classroom/ParticipantsPanel.tsx`
- `src/components/classroom/SidePanel.tsx`
- `src/components/classroom/VideoCard.tsx`
- `src/components/classroom/VideoLayout.tsx`
- `src/components/classroom/VideoStage.tsx`
- `src/components/ClassroomFiles.tsx`
- `src/components/dashboard/AppShell.tsx`
- `src/components/dashboard/StudentHome.tsx`
- `src/components/dashboard/TutorHome.tsx`
- `src/components/home/HomeSections.tsx`
- `src/components/LorddaLab.tsx`
- `src/components/MobileTabBar.tsx`
- `src/components/Navbar.tsx`
- `src/components/payments/PayButton.tsx`
- `src/components/ui/chart.tsx`
- `src/components/ui/command.tsx`
- `src/components/ui/context-menu.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/menubar.tsx`
- `src/components/ui/sidebar.tsx`
- `src/components/whiteboard/ai/ConvertButton.tsx`
- `src/components/whiteboard/ai/insertConversion.ts`
- `src/components/whiteboard/canvas/engine.ts`
- `src/components/whiteboard/canvas/exporter.ts`
- `src/components/whiteboard/canvas/realtime.ts`
- `src/components/whiteboard/canvas/Whiteboard.tsx`
- `src/components/whiteboard/index.ts`
- `src/hooks/use-agent.ts`
- `src/hooks/useClassroomRTC.ts`
- `src/hooks/use-platform-config.ts`
- `src/integrations/supabase/types.ts`
- `src/lib/access.functions.ts`
- `src/lib/agents/registry.server.ts`
- `src/lib/agents/run-agent.functions.ts`
- `src/lib/ai-entitlement.ts`
- `src/lib/classroom-rtc/index.ts`
- `src/lib/classroom-rtc/PeerToPeerRTCService.ts`
- `src/lib/classroom-rtc/types.ts`
- `src/lib/email-templates/booking-confirmation.tsx`
- `src/lib/payments/checkout.functions.ts`
- `src/lib/payments/router.server.ts`
- `src/lib/room-access.ts`
- `src/lib/whiteboard-ai.functions.ts`
- `src/routes/__root.tsx`
- `src/routes/_authenticated/admin.ai.tsx`
- `src/routes/_authenticated/admin.audit.tsx`
- `src/routes/_authenticated/admin.classrooms.tsx`
- `src/routes/_authenticated/admin.payouts.tsx`
- `src/routes/_authenticated/admin.plans.tsx`
- `src/routes/_authenticated/admin.whiteboard.tsx`
- `src/routes/_authenticated/classroom.$roomId.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- `src/routes/_authenticated/lessons.tsx`
- `src/routes/_authenticated/notes.tsx`
- `src/routes/_authenticated/records.tsx`
- `src/routes/_authenticated/wallet.tsx`
- `src/routes/_authenticated/whiteboard-review.$sessionId.tsx`
- `src/routes/checkout.cancelled.tsx`
- `src/routes/index.tsx`
- `src/routeTree.gen.ts`
- `tests/ai-entitlement.test.ts`

### Realtime

Detected in **9** files.
- `src/components/classroom/ClassroomShell.tsx`
- `src/components/classroom/ParticipantsPanel.tsx`
- `src/components/classroom/VideoLayout.tsx`
- `src/components/LorddaLab.tsx`
- `src/components/whiteboard/canvas/realtime.ts`
- `src/components/whiteboard/canvas/Whiteboard.tsx`
- `src/components/whiteboard/collaboration/cursors.tsx`
- `src/lib/classroom-rtc/PeerToPeerRTCService.ts`
- `src/routes/_authenticated/messages.tsx`

### Storage

Detected in **26** files.
- `src/components/classroom/SidePanel.tsx`
- `src/components/ClassroomFiles.tsx`
- `src/components/InstallPrompt.tsx`
- `src/components/whiteboard/canvas/exporter.ts`
- `src/components/whiteboard/canvas/Whiteboard.tsx`
- `src/hooks/use-theme.tsx`
- `src/integrations/supabase/auth-middleware.ts`
- `src/integrations/supabase/client.server.ts`
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `src/lib/ai-tutor.functions.ts`
- `src/lib/course-materials.functions.ts`
- `src/lib/lab-modules.ts`
- `src/lib/webgl/renderer.ts`
- `src/lib/webgl/scenes.ts`
- `src/routes/__root.tsx`
- `src/routes/_authenticated/admin.index.tsx`
- `src/routes/_authenticated/admin.payouts.tsx`
- `src/routes/_authenticated/ai-tutor.tsx`
- `src/routes/_authenticated/become-tutor.tsx`
- `src/routes/_authenticated/certificate.tsx`
- `src/routes/_authenticated/courses.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- `src/routes/_authenticated/my-courses.tsx`
- `src/routes/_authenticated/records.tsx`
- `src/routes/_authenticated/resources.tsx`

### Email

Detected in **36** files.
- `src/components/dashboard/AdminHome.tsx`
- `src/components/dashboard/AppShell.tsx`
- `src/components/ScheduleStudentCard.tsx`
- `src/integrations/supabase/types.ts`
- `src/lib/admin.functions.ts`
- `src/lib/booking-emails.functions.ts`
- `src/lib/email/enqueue.server.ts`
- `src/lib/email/provider.server.ts`
- `src/lib/email-templates/_shared.ts`
- `src/lib/email-templates/booking-confirmation.tsx`
- `src/lib/email-templates/help-confirmation.tsx`
- `src/lib/email-templates/help-new-ticket.tsx`
- `src/lib/email-templates/registry.ts`
- `src/lib/email-templates/subscription-approved.tsx`
- `src/lib/email-templates/subscription-rejected.tsx`
- `src/lib/email-templates/welcome.tsx`
- `src/lib/help.functions.ts`
- `src/routes/_authenticated/admin.index.tsx`
- `src/routes/_authenticated/admin.plans.tsx`
- `src/routes/_authenticated/admin.reports.tsx`
- `src/routes/_authenticated/admin.students.tsx`
- `src/routes/_authenticated/admin.tutors.tsx`
- `src/routes/_authenticated/become-tutor.tsx`
- `src/routes/_authenticated/book.$tutorId.tsx`
- `src/routes/_authenticated/certificate.tsx`
- `src/routes/_authenticated/classroom.$roomId.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- `src/routes/_authenticated/parent.children.tsx`
- `src/routes/_authenticated/settings.tsx`
- `src/routes/auth.tsx`
- `src/routes/email/unsubscribe.ts`
- `src/routes/help.tsx`
- `src/routes/tutors.tsx`
- `src/routes/unsubscribe.tsx`
- `src/routeTree.gen.ts`
- `src/start.ts`

### Scheduling

Detected in **22** files.
- `src/components/dashboard/AdminHome.tsx`
- `src/components/dashboard/AppShell.tsx`
- `src/components/dashboard/StudentHome.tsx`
- `src/components/dashboard/TutorHome.tsx`
- `src/components/ScheduleStudentCard.tsx`
- `src/components/whiteboard/canvas/Whiteboard.tsx`
- `src/integrations/supabase/types.ts`
- `src/lib/booking-emails.functions.ts`
- `src/lib/email-templates/booking-confirmation.tsx`
- `src/lib/students.functions.ts`
- `src/routes/_authenticated/admin.analytics.tsx`
- `src/routes/_authenticated/book.$tutorId.tsx`
- `src/routes/_authenticated/calendar.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- `src/routes/_authenticated/lessons.tsx`
- `src/routes/_authenticated/messages.tsx`
- `src/routes/_authenticated/parent.tsx`
- `src/routes/_authenticated/settings.tsx`
- `src/routes/_authenticated/tutor.availability.tsx`
- `src/routes/_authenticated/tutor.holidays.tsx`
- `src/routes/tutors.tsx`
- `src/routeTree.gen.ts`

### Assessment

Detected in **27** files.
- `src/components/ai/SaveToNotes.tsx`
- `src/components/dashboard/StudentHome.tsx`
- `src/components/dashboard/TutorHome.tsx`
- `src/components/lab3d/SimChat.tsx`
- `src/integrations/supabase/auth-middleware.ts`
- `src/integrations/supabase/client.server.ts`
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `src/lib/agents/registry.server.ts`
- `src/lib/ai-tools.functions.ts`
- `src/lib/ai-tutor.functions.ts`
- `src/lib/classroom-rtc/PeerToPeerRTCService.ts`
- `src/lib/email-templates/help-new-ticket.tsx`
- `src/lib/payments/router.server.ts`
- `src/lib/server/platform.ts`
- `src/lib/sim-chat.functions.ts`
- `src/lib/sim-lab.functions.ts`
- `src/lib/whiteboard-ai.functions.ts`
- `src/routes/_authenticated/admin.payouts.tsx`
- `src/routes/_authenticated/admin.plans.tsx`
- `src/routes/_authenticated/ai-tools.tsx`
- `src/routes/_authenticated/ai-tutor.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- `src/routes/_authenticated/labs_.simulation-lab.tsx`
- `src/routes/_authenticated/parent.children.tsx`
- `src/routes/_authenticated/whiteboard-review.$sessionId.tsx`
- `src/routes/index.tsx`

### Learning

Detected in **35** files.
- `src/components/ai/SmartMarkdown.tsx`
- `src/components/classroom/SidePanel.tsx`
- `src/components/dashboard/AppShell.tsx`
- `src/components/dashboard/CommandPalette.tsx`
- `src/components/dashboard/StudentHome.tsx`
- `src/components/dashboard/TutorHome.tsx`
- `src/components/home/HomeSections.tsx`
- `src/components/lab3d/ProcessView.tsx`
- `src/components/Navbar.tsx`
- `src/components/ui/progress.tsx`
- `src/components/whiteboard/canvas/Whiteboard.tsx`
- `src/integrations/supabase/types.ts`
- `src/lib/agents/registry.server.ts`
- `src/lib/ai-tools.functions.ts`
- `src/lib/ai-tutor.functions.ts`
- `src/lib/course-materials.functions.ts`
- `src/lib/sim-lab.functions.ts`
- `src/routes/__root.tsx`
- `src/routes/_authenticated/admin.index.tsx`
- `src/routes/_authenticated/admin.plans.tsx`
- `src/routes/_authenticated/book.$tutorId.tsx`
- `src/routes/_authenticated/certificate.tsx`
- `src/routes/_authenticated/courses.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- `src/routes/_authenticated/labs_.simulation-lab.tsx`
- `src/routes/_authenticated/lessons.tsx`
- `src/routes/_authenticated/my-courses.tsx`
- `src/routes/_authenticated/parent.tsx`
- `src/routes/_authenticated/pay-tutor.tsx`
- `src/routes/_authenticated/records.tsx`
- `src/routes/_authenticated/tutor.availability.tsx`
- `src/routes/_authenticated/tutor.holidays.tsx`
- `src/routes/index.tsx`
- `src/routes/tutors.tsx`
- `src/routeTree.gen.ts`

## 7. Supabase Migration Inventory

| Migration |
|---|
| `supabase/migrations/20260518180453_b7b6b188-b2f9-4a6e-8317-5f8fd52bffac.sql` |
| `supabase/migrations/20260518180507_8749a32b-dc91-4e11-b9de-8107bc6e9a43.sql` |
| `supabase/migrations/20260518180559_079a0331-844f-4a93-af54-df8c3b16c8ff.sql` |
| `supabase/migrations/20260520134733_17b373c0-0c07-41a8-a4e7-7a2d37738f9b.sql` |
| `supabase/migrations/20260521120359_e0e495a3-e6c6-4d8c-9376-6aab3bcb158c.sql` |
| `supabase/migrations/20260521120426_f8a86ba3-535c-4a9b-9c14-d92ffe33f02c.sql` |
| `supabase/migrations/20260521120758_573f01a8-70c7-4bea-904d-df0f39bd7928.sql` |
| `supabase/migrations/20260522062230_43125182-8270-4977-9b19-ccf05619dfc1.sql` |
| `supabase/migrations/20260522073549_72500aff-965a-49a8-b3ab-2239c850168b.sql` |
| `supabase/migrations/20260522080609_f51f3676-392c-4338-9bf9-df9c105ace54.sql` |
| `supabase/migrations/20260522081314_e4dfd053-8a0b-4f10-b201-0bf7b8ed2693.sql` |
| `supabase/migrations/20260522083220_390d842b-0b64-43c7-b5e6-c87b5c7fd60f.sql` |
| `supabase/migrations/20260522085703_b8342121-277e-478e-9c42-e2786a56c7c3.sql` |
| `supabase/migrations/20260522085716_cae43fa7-ce66-4c10-81a1-e0f4588a6e75.sql` |
| `supabase/migrations/20260522092853_email_infra.sql` |
| `supabase/migrations/20260522092905_email_infra.sql` |
| `supabase/migrations/20260522093122_email_infra.sql` |
| `supabase/migrations/20260522105704_683e0c7c-3a9f-4da8-822e-a34d221a36f2.sql` |
| `supabase/migrations/20260522110136_e7689ab4-ce46-4391-8a25-1cc5f1eb3a9d.sql` |
| `supabase/migrations/20260522113118_7b053bf2-58a5-48b8-8dbe-dbb0583cf4a1.sql` |
| `supabase/migrations/20260522120800_fe282aa0-ce58-4c5b-a14a-79b180215e97.sql` |
| `supabase/migrations/20260523081725_04e83f6c-dd2a-4938-9b33-3e24fa61ed29.sql` |
| `supabase/migrations/20260523083334_1bbbc501-2402-4d07-a676-38c68d2d1f0b.sql` |
| `supabase/migrations/20260524041428_148987e9-23da-47fa-8182-294dcfc9400c.sql` |
| `supabase/migrations/20260524041718_e722d83c-5457-4ec3-b7b6-c6e8be29c3df.sql` |
| `supabase/migrations/20260524041736_08febb8a-724f-4196-9c78-0b3d6784c153.sql` |
| `supabase/migrations/20260524042040_6fd4de5c-4856-4bbc-a86b-eda4026f5bff.sql` |
| `supabase/migrations/20260524042244_6ecb8491-343f-435d-9189-c0e2483ea230.sql` |
| `supabase/migrations/20260524042859_808cd5c3-c692-4ca0-b22d-e5359b17464c.sql` |
| `supabase/migrations/20260524043637_d17d6f91-84c3-45ff-af6b-648a666f715d.sql` |
| `supabase/migrations/20260524044641_c5814e6b-fe15-459d-96b0-746ba98fdc2c.sql` |
| `supabase/migrations/20260524044744_email_infra.sql` |
| `supabase/migrations/20260524051514_1878b3e2-125a-46eb-a789-fa1409028e71.sql` |
| `supabase/migrations/20260524064757_b2d8e9c2-2d6e-4b76-8a73-dd3c1987a2ae.sql` |
| `supabase/migrations/20260524065325_6df81ffd-fb2e-4df8-ac71-5b5f8cd92554.sql` |
| `supabase/migrations/20260524070449_ae8130d6-d9a2-4437-8dd0-73c2893185b3.sql` |
| `supabase/migrations/20260524074439_b5bca5df-a7ce-40c8-a931-d1e64321d7b5.sql` |
| `supabase/migrations/20260525125039_8673bafb-4eda-434f-9900-1a4c688ab424.sql` |
| `supabase/migrations/20260528060818_02ef6fb2-553e-43f1-900a-bd8eb4dd56af.sql` |
| `supabase/migrations/20260530152504_b823d221-b60a-432b-85ac-0745a79e9d55.sql` |
| `supabase/migrations/20260601045818_f63dbd87-f3a0-4e98-8232-d380ac4a68f6.sql` |
| `supabase/migrations/20260605061006_40c146b5-f458-4620-a3ed-688348719a19.sql` |
| `supabase/migrations/20260611082303_c77aeed1-ee3d-4917-983d-abc4f0e52ceb.sql` |
| `supabase/migrations/20260620193809_e7f89819-b8cc-4e85-9441-39e6b31e579d.sql` |
| `supabase/migrations/20260620193831_7e7a3f45-9cbe-4ad4-91c4-0884121a0b3a.sql` |
| `supabase/migrations/20260622125739_8a71ad77-3504-43d2-92b4-3fedd6b2a91e.sql` |
| `supabase/migrations/20260622125757_eabc3c74-3adb-4b2a-bb50-d98a2da0a202.sql` |
| `supabase/migrations/20260622133155_c56722d8-1a65-4287-bf95-1c06689bba3f.sql` |
| `supabase/migrations/20260623074007_ddbe3e51-097a-4763-af33-95b236a42698.sql` |
| `supabase/migrations/20260623075231_4c324342-ee6b-47fa-ad48-39af2516c21c.sql` |
| `supabase/migrations/20260623082025_9963a138-6dc4-4d83-8b63-3cd31e3a7504.sql` |
| `supabase/migrations/20260623082050_70d58ecc-f89e-48ad-9e55-0d5e10f677f2.sql` |
| `supabase/migrations/20260623082342_5be4ee4e-9845-45f8-b995-dace190d24f1.sql` |
| `supabase/migrations/20260623100541_29ade4ae-9cc6-46bf-a916-ba9ecf155ff3.sql` |
| `supabase/migrations/20260623102100_68bc0646-a669-4dd9-9ba7-4cdb16225116.sql` |
| `supabase/migrations/20260623111535_6dc2ecd4-5f71-421a-a372-bd125820c267.sql` |
| `supabase/migrations/20260623113448_5862c988-44e2-423a-8dce-ff55c49cf774.sql` |
| `supabase/migrations/20260623114741_9a1edb8d-58ea-4825-8560-ba68d6527ab9.sql` |
| `supabase/migrations/20260623121121_6dd82a2e-a01a-42c2-a505-12240ec66391.sql` |
| `supabase/migrations/20260701082250_cc8fecf7-8ce5-4d5e-971b-0bad7a33e4e9.sql` |
| `supabase/migrations/20260701084425_090d5165-a08f-4cce-ba0a-56620c1578d1.sql` |
| `supabase/migrations/20260811090000_29d8fece-92c9-4bab-a85f-e95d49161abf.sql` |
| `supabase/migrations/20260812060000_p0_security_fixes.sql` |
| `supabase/migrations/20260812100000_close_session_insert_bypass.sql` |
| `supabase/migrations/20260812120000_restore_whiteboard_chat_tables.sql` |
| `supabase/migrations/20260812130000_harden_rpc_grants_and_guards.sql` |
| `supabase/migrations/20260812140000_revoke_public_execute_grants.sql` |
| `supabase/migrations/20260812150000_align_booking_gate_with_subscriptions_flag.sql` |
| `supabase/migrations/20260813090000_add_rls_profiles_user_roles_policies.sql` |
| `supabase/migrations/20260814090000_add_rls_admin_operations_policies.sql` |
| `supabase/migrations/20260814140000_add_rls_entitlement_gates_beyond_book_session.sql` |
| `supabase/migrations/20260815090000_add_rls_tutor_app_promotion_validation.sql` |
| `supabase/migrations/20260815140000_add_rls_parent_role_policies.sql` |

## 8. Package Metadata

- Project: `askatutorlive`

### Dependencies

| Package | Version |
|---|---|
| `@cloudflare/vite-plugin` | `^1.25.5` |
| `@hookform/resolvers` | `^5.2.2` |
| `@radix-ui/react-accordion` | `^1.2.12` |
| `@radix-ui/react-alert-dialog` | `^1.1.15` |
| `@radix-ui/react-aspect-ratio` | `^1.1.8` |
| `@radix-ui/react-avatar` | `^1.1.11` |
| `@radix-ui/react-checkbox` | `^1.3.3` |
| `@radix-ui/react-collapsible` | `^1.1.12` |
| `@radix-ui/react-context-menu` | `^2.2.16` |
| `@radix-ui/react-dialog` | `^1.1.15` |
| `@radix-ui/react-dropdown-menu` | `^2.1.16` |
| `@radix-ui/react-hover-card` | `^1.1.15` |
| `@radix-ui/react-label` | `^2.1.8` |
| `@radix-ui/react-menubar` | `^1.1.16` |
| `@radix-ui/react-navigation-menu` | `^1.2.14` |
| `@radix-ui/react-popover` | `^1.1.15` |
| `@radix-ui/react-progress` | `^1.1.8` |
| `@radix-ui/react-radio-group` | `^1.3.8` |
| `@radix-ui/react-scroll-area` | `^1.2.10` |
| `@radix-ui/react-select` | `^2.2.6` |
| `@radix-ui/react-separator` | `^1.1.8` |
| `@radix-ui/react-slider` | `^1.3.6` |
| `@radix-ui/react-slot` | `^1.2.4` |
| `@radix-ui/react-switch` | `^1.2.6` |
| `@radix-ui/react-tabs` | `^1.1.13` |
| `@radix-ui/react-toggle` | `^1.1.10` |
| `@radix-ui/react-toggle-group` | `^1.1.11` |
| `@radix-ui/react-tooltip` | `^1.2.8` |
| `@react-email/components` | `^1.0.12` |
| `@react-three/drei` | `^10.7.7` |
| `@react-three/fiber` | `^9.6.1` |
| `@supabase/supabase-js` | `^2.106.1` |
| `@tailwindcss/vite` | `^4.2.1` |
| `@tanstack/react-query` | `^5.83.0` |
| `@tanstack/react-router` | `^1.168.25` |
| `@tanstack/react-start` | `^1.167.50` |
| `@tanstack/router-plugin` | `^1.167.28` |
| `@types/three` | `^0.184.1` |
| `class-variance-authority` | `^0.7.1` |
| `clsx` | `^2.1.1` |
| `cmdk` | `^1.1.1` |
| `date-fns` | `^4.1.0` |
| `embla-carousel-react` | `^8.6.0` |
| `framer-motion` | `^12.39.0` |
| `input-otp` | `^1.4.2` |
| `jspdf` | `^4.2.1` |
| `katex` | `^0.17.0` |
| `lucide-react` | `^0.575.0` |
| `mathjs` | `^15.2.0` |
| `mermaid` | `^11.15.0` |
| `nitro` | `3.0.260603-beta` |
| `react` | `^19.2.0` |
| `react-day-picker` | `^9.14.0` |
| `react-dom` | `^19.2.0` |
| `react-email` | `^6.3.2` |
| `react-hook-form` | `^7.71.2` |
| `react-markdown` | `^10.1.0` |
| `react-resizable-panels` | `^4.6.5` |
| `recharts` | `^2.15.4` |
| `rehype-katex` | `^7.0.1` |
| `remark-gfm` | `^4.0.1` |
| `remark-math` | `^6.0.0` |
| `sonner` | `^2.0.7` |
| `tailwindcss` | `^4.2.1` |
| `tailwind-merge` | `^3.5.0` |
| `three` | `^0.184.0` |
| `tw-animate-css` | `^1.3.4` |
| `vaul` | `^1.1.2` |
| `vite-tsconfig-paths` | `^6.0.2` |
| `zod` | `^3.24.2` |

### Development Dependencies

| Package | Version |
|---|---|
| `@eslint/js` | `^9.32.0` |
| `@types/katex` | `^0.16.8` |
| `@types/node` | `^22.16.5` |
| `@types/react` | `^19.2.0` |
| `@types/react-dom` | `^19.2.0` |
| `@vitejs/plugin-react` | `^5.0.4` |
| `eslint` | `^9.32.0` |
| `eslint-config-prettier` | `^10.1.1` |
| `eslint-plugin-prettier` | `^5.2.6` |
| `eslint-plugin-react-hooks` | `^5.2.0` |
| `eslint-plugin-react-refresh` | `^0.4.20` |
| `globals` | `^15.15.0` |
| `prettier` | `^3.7.3` |
| `typescript` | `^5.8.3` |
| `typescript-eslint` | `^8.56.1` |
| `vite` | `^7.3.1` |

## 9. Sanitization

Excluded directories:
- `.git`
- `.svn`
- `node_modules`
- `.pnpm`
- `.next`
- `.nuxt`
- `.output`
- `.vercel`
- `.turbo`
- `.cache`
- `.parcel-cache`
- `.vite`
- `.tanstack`
- `dist`
- `build`
- `coverage`
- `__pycache__`
- `.idea`
- `.vscode`

Excluded sensitive filename patterns:
- `.env`
- `.env.*`
- `*.pem`
- `*.key`
- `*.crt`
- `*.cer`
- `*.p12`
- `*.pfx`
- `*.jks`
- `*secret*`
- `*credential*`
- `*password*`
- `*token*`

## 10. Important Limitation

This inventory is metadata, not an authoritative description of business responsibility.
Architecture conclusions should be validated against imports, exports, database structure, routes and application behavior.

