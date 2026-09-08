# AskATutorLive — Final Sanitized Architecture Reconnaissance

> Generated locally.
> This document contains repository metadata and architectural structure only.
> Application source contents, credentials, secrets, SQL statements, user data and Git metadata are excluded.

## SECURITY BOUNDARY

This document is safe for external architecture analysis only to the extent that the security checks below report no unresolved findings.

## 1. REPOSITORY PROFILE

| Metric | Value |
|---|---:|
| Included files | 371 |
| Architecture/source metadata files | 352 |
| Repository root | [REDACTED] |
| Generated | 2026-08-21 21:35:57 |

## 2. FILE TYPE SUMMARY

| Extension | Count |
|---|---:|
| `.tsx` | 161 |
| `.sql` | 109 |
| `.ts` | 66 |
| `.json` | 7 |
| `[none]` | 7 |
| `.md` | 4 |
| `.txt` | 3 |
| `.png` | 2 |
| `.toml` | 2 |
| `.mjs` | 1 |
| `.gitignore` | 1 |
| `.css` | 1 |
| `.jpg` | 1 |
| `.lock` | 1 |
| `.prettierrc` | 1 |
| `.prettierignore` | 1 |
| `.ico` | 1 |
| `.jsonc` | 1 |
| `.js` | 1 |

## 3. DIRECTORY TOPOLOGY

- `public/` — 3 included files
- `scripts/` — 1 included files
- `src/` — 227 included files
- `supabase/` — 84 included files
- `tests/` — 3 included files

## 4. COMPLETE SANITIZED FILE TREE

`	ext
.gitignore
.prettierignore
.prettierrc
all_triggers.sql
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
| File | Extension | Size | Category |
|---|---|---:|---|
| `all_triggers.sql` | `.sql` | 0.2 KB | SQL |
| `bunfig.toml` | `.toml` | 0.2 KB | Other |
| `CATEGORY2_PRODUCTION_VERIFICATION_RESULT.md` | `.md` | 2.4 KB | Documentation |
| `check_auth_users.sql` | `.sql` | 0.1 KB | SQL |
| `check_auth_users_full.sql` | `.sql` | 0.1 KB | SQL |
| `check_category2_counts.sql` | `.sql` | 0.5 KB | SQL |
| `check_other_tables_rls.sql` | `.sql` | 0.1 KB | SQL |
| `check_participants_view.sql` | `.sql` | 0.1 KB | SQL |
| `check_profiles.sql` | `.sql` | 0.1 KB | SQL |
| `check_rls_status.sql` | `.sql` | 0.2 KB | SQL |
| `check_sessions_columns.sql` | `.sql` | 0.1 KB | SQL |
| `check_sessions_data.sql` | `.sql` | 0 KB | SQL |
| `check_table_counts.sql` | `.sql` | 0.3 KB | SQL |
| `check_trigger.sql` | `.sql` | 0.2 KB | SQL |
| `check_tutor_subscriptions.sql` | `.sql` | 0 KB | Commerce/Payment |
| `check_user_id.sql` | `.sql` | 0.1 KB | SQL |
| `check_user_roles_data.sql` | `.sql` | 0 KB | SQL |
| `components.json` | `.json` | 0.4 KB | Other |
| `current_sessions_policies.sql` | `.sql` | 0.1 KB | SQL |
| `DEPLOYMENT.md` | `.md` | 3.6 KB | Documentation |
| `eslint.config.js` | `.js` | 1.2 KB | Other |
| `forum_posts_count.sql` | `.sql` | 0 KB | SQL |
| `GAP_REGISTER.md` | `.md` | 10.2 KB | Documentation |
| `inspect_policies_profiles.sql` | `.sql` | 0.1 KB | SQL |
| `inspect_policies_sessions.sql` | `.sql` | 0.1 KB | SQL |
| `inspect_policies_tutor_courses.sql` | `.sql` | 0.1 KB | SQL |
| `inspect_policies_tutor_subscriptions.sql` | `.sql` | 0.1 KB | Commerce/Payment |
| `inspect_policies_user_roles.sql` | `.sql` | 0.1 KB | SQL |
| `inspect_profiles.sql` | `.sql` | 0.1 KB | SQL |
| `inspect_sessions.sql` | `.sql` | 0.1 KB | SQL |
| `inspect_tutor_courses.sql` | `.sql` | 0.1 KB | SQL |
| `inspect_tutor_subscriptions.sql` | `.sql` | 0.2 KB | Commerce/Payment |
| `inspect_user_roles.sql` | `.sql` | 0.1 KB | SQL |
| `list_tables.sql` | `.sql` | 0.1 KB | SQL |
| `package.json` | `.json` | 3.7 KB | Package Configuration |
| `public/manifest.json` | `.json` | 0.5 KB | Other |
| `README.md` | `.md` | 0.1 KB | Documentation |
| `scripts/start-node.mjs` | `.mjs` | 0.5 KB | Other |
| `site_content_data.sql` | `.sql` | 0 KB | SQL |
| `src/components/admin/AiKeyManager.tsx` | `.tsx` | 5.7 KB | UI Component |
| `src/components/admin/AiProviderSelect.tsx` | `.tsx` | 2.2 KB | UI Component |
| `src/components/admin/ConfigToggle.tsx` | `.tsx` | 2.3 KB | UI Component |
| `src/components/ai/DiagramBlock.tsx` | `.tsx` | 2.3 KB | UI Component |
| `src/components/ai/SaveToNotes.tsx` | `.tsx` | 1.8 KB | UI Component |
| `src/components/ai/SmartMarkdown.tsx` | `.tsx` | 2.6 KB | UI Component |
| `src/components/classroom/ActionBar.tsx` | `.tsx` | 9.5 KB | UI Component |
| `src/components/classroom/AIAssistantPanel.tsx` | `.tsx` | 4.3 KB | UI Component |
| `src/components/classroom/ClassroomChat.tsx` | `.tsx` | 3.8 KB | UI Component |
| `src/components/classroom/ClassroomHeader.tsx` | `.tsx` | 3.3 KB | UI Component |
| `src/components/classroom/ClassroomShell.tsx` | `.tsx` | 10.7 KB | UI Component |
| `src/components/classroom/ClassroomStage.tsx` | `.tsx` | 2.7 KB | UI Component |
| `src/components/classroom/DeviceSettingsDialog.tsx` | `.tsx` | 2.6 KB | UI Component |
| `src/components/classroom/ParticipantsPanel.tsx` | `.tsx` | 4.1 KB | UI Component |
| `src/components/classroom/SidePanel.tsx` | `.tsx` | 6.8 KB | UI Component |
| `src/components/classroom/useSessionTimer.ts` | `.ts` | 0.7 KB | UI Component |
| `src/components/classroom/VideoCard.tsx` | `.tsx` | 4.4 KB | UI Component |
| `src/components/classroom/VideoLayout.tsx` | `.tsx` | 8.7 KB | UI Component |
| `src/components/classroom/VideoStage.tsx` | `.tsx` | 2.5 KB | UI Component |
| `src/components/ClassroomFiles.tsx` | `.tsx` | 5.1 KB | UI Component |
| `src/components/dashboard/AdminHome.tsx` | `.tsx` | 22.3 KB | UI Component |
| `src/components/dashboard/AppShell.tsx` | `.tsx` | 15.8 KB | UI Component |
| `src/components/dashboard/CommandPalette.tsx` | `.tsx` | 3.2 KB | UI Component |
| `src/components/dashboard/primitives.tsx` | `.tsx` | 4.2 KB | UI Component |
| `src/components/dashboard/StudentHome.tsx` | `.tsx` | 20.7 KB | UI Component |
| `src/components/dashboard/TutorHome.tsx` | `.tsx` | 21 KB | UI Component |
| `src/components/home/HomeSections.tsx` | `.tsx` | 13.2 KB | UI Component |
| `src/components/InstallPrompt.tsx` | `.tsx` | 3.6 KB | UI Component |
| `src/components/lab3d/AmbientEmpty.tsx` | `.tsx` | 3.3 KB | UI Component |
| `src/components/lab3d/GeoView.tsx` | `.tsx` | 3.5 KB | UI Component |
| `src/components/lab3d/LanguageView.tsx` | `.tsx` | 3.1 KB | UI Component |
| `src/components/lab3d/physics.ts` | `.ts` | 5.8 KB | UI Component |
| `src/components/lab3d/ProcessView.tsx` | `.tsx` | 4.3 KB | UI Component |
| `src/components/lab3d/Scene2D.tsx` | `.tsx` | 3.8 KB | UI Component |
| `src/components/lab3d/SimChat.tsx` | `.tsx` | 4.4 KB | UI Component |
| `src/components/lab3d/SimDispatch.tsx` | `.tsx` | 2.1 KB | UI Component |
| `src/components/lab3d/SimScene.tsx` | `.tsx` | 8 KB | UI Component |
| `src/components/lab3d/TimelineView.tsx` | `.tsx` | 2.5 KB | UI Component |
| `src/components/LorddaLab.tsx` | `.tsx` | 11.2 KB | UI Component |
| `src/components/MathTools.tsx` | `.tsx` | 8.2 KB | UI Component |
| `src/components/MobileTabBar.tsx` | `.tsx` | 2.4 KB | UI Component |
| `src/components/Navbar.tsx` | `.tsx` | 7 KB | UI Component |
| `src/components/payments/PayButton.tsx` | `.tsx` | 1.9 KB | UI Component |
| `src/components/ScheduleStudentCard.tsx` | `.tsx` | 4.9 KB | UI Component |
| `src/components/ScopeGate.tsx` | `.tsx` | 1.5 KB | UI Component |
| `src/components/ThreeDLab.tsx` | `.tsx` | 3 KB | UI Component |
| `src/components/ui/accordion.tsx` | `.tsx` | 2 KB | UI Component |
| `src/components/ui/alert.tsx` | `.tsx` | 1.6 KB | UI Component |
| `src/components/ui/alert-dialog.tsx` | `.tsx` | 4.1 KB | UI Component |
| `src/components/ui/aspect-ratio.tsx` | `.tsx` | 0.1 KB | UI Component |
| `src/components/ui/avatar.tsx` | `.tsx` | 1.4 KB | UI Component |
| `src/components/ui/badge.tsx` | `.tsx` | 1.1 KB | UI Component |
| `src/components/ui/breadcrumb.tsx` | `.tsx` | 2.7 KB | UI Component |
| `src/components/ui/button.tsx` | `.tsx` | 1.8 KB | UI Component |
| `src/components/ui/calendar.tsx` | `.tsx` | 7 KB | UI Component |
| `src/components/ui/card.tsx` | `.tsx` | 1.8 KB | UI Component |
| `src/components/ui/carousel.tsx` | `.tsx` | 6.1 KB | UI Component |
| `src/components/ui/chart.tsx` | `.tsx` | 10.3 KB | UI Component |
| `src/components/ui/checkbox.tsx` | `.tsx` | 1 KB | UI Component |
| `src/components/ui/collapsible.tsx` | `.tsx` | 0.3 KB | UI Component |
| `src/components/ui/command.tsx` | `.tsx` | 4.8 KB | UI Component |
| `src/components/ui/context-menu.tsx` | `.tsx` | 7.2 KB | UI Component |
| `src/components/ui/dialog.tsx` | `.tsx` | 3.6 KB | UI Component |
| `src/components/ui/drawer.tsx` | `.tsx` | 2.9 KB | UI Component |
| `src/components/ui/dropdown-menu.tsx` | `.tsx` | 7.4 KB | UI Component |
| `src/components/ui/form.tsx` | `.tsx` | 4.1 KB | UI Component |
| `src/components/ui/hover-card.tsx` | `.tsx` | 1.2 KB | UI Component |
| `src/components/ui/input.tsx` | `.tsx` | 0.8 KB | UI Component |
| `src/components/ui/input-otp.tsx` | `.tsx` | 2.1 KB | UI Component |
| `src/components/ui/label.tsx` | `.tsx` | 0.7 KB | UI Component |
| `src/components/ui/menubar.tsx` | `.tsx` | 8.3 KB | UI Component |
| `src/components/ui/navigation-menu.tsx` | `.tsx` | 5 KB | UI Component |
| `src/components/ui/pagination.tsx` | `.tsx` | 2.7 KB | UI Component |
| `src/components/ui/popover.tsx` | `.tsx` | 1.3 KB | UI Component |
| `src/components/ui/progress.tsx` | `.tsx` | 0.8 KB | UI Component |
| `src/components/ui/radio-group.tsx` | `.tsx` | 1.4 KB | UI Component |
| `src/components/ui/resizable.tsx` | `.tsx` | 1.5 KB | UI Component |
| `src/components/ui/scroll-area.tsx` | `.tsx` | 1.6 KB | UI Component |
| `src/components/ui/select.tsx` | `.tsx` | 5.6 KB | UI Component |
| `src/components/ui/separator.tsx` | `.tsx` | 0.7 KB | UI Component |
| `src/components/ui/sheet.tsx` | `.tsx` | 4.1 KB | UI Component |
| `src/components/ui/sidebar.tsx` | `.tsx` | 23.4 KB | UI Component |
| `src/components/ui/skeleton.tsx` | `.tsx` | 0.2 KB | UI Component |
| `src/components/ui/slider.tsx` | `.tsx` | 1 KB | UI Component |
| `src/components/ui/sonner.tsx` | `.tsx` | 0.7 KB | UI Component |
| `src/components/ui/switch.tsx` | `.tsx` | 1.1 KB | UI Component |
| `src/components/ui/table.tsx` | `.tsx` | 2.8 KB | UI Component |
| `src/components/ui/tabs.tsx` | `.tsx` | 1.9 KB | UI Component |
| `src/components/ui/textarea.tsx` | `.tsx` | 0.7 KB | UI Component |
| `src/components/ui/toggle.tsx` | `.tsx` | 1.5 KB | UI Component |
| `src/components/ui/toggle-group.tsx` | `.tsx` | 1.7 KB | UI Component |
| `src/components/ui/tooltip.tsx` | `.tsx` | 1.2 KB | UI Component |
| `src/components/WebGLLab.tsx` | `.tsx` | 7.3 KB | UI Component |
| `src/components/whiteboard/ai/ConvertButton.tsx` | `.tsx` | 3.6 KB | UI Component |
| `src/components/whiteboard/ai/insertConversion.ts` | `.ts` | 8.4 KB | UI Component |
| `src/components/whiteboard/canvas/engine.ts` | `.ts` | 4.4 KB | UI Component |
| `src/components/whiteboard/canvas/exporter.ts` | `.ts` | 3.4 KB | UI Component |
| `src/components/whiteboard/canvas/latex.ts` | `.ts` | 2.6 KB | UI Component |
| `src/components/whiteboard/canvas/realtime.ts` | `.ts` | 2.5 KB | UI Component |
| `src/components/whiteboard/canvas/renderer.ts` | `.ts` | 11.7 KB | UI Component |
| `src/components/whiteboard/canvas/smooth.ts` | `.ts` | 1.4 KB | UI Component |
| `src/components/whiteboard/canvas/Whiteboard.tsx` | `.tsx` | 56.7 KB | UI Component |
| `src/components/whiteboard/collaboration/cursors.tsx` | `.tsx` | 1.1 KB | UI Component |
| `src/components/whiteboard/index.ts` | `.ts` | 0.1 KB | UI Component |
| `src/hooks/use-agent.ts` | `.ts` | 2.1 KB | React Hook |
| `src/hooks/use-auth.tsx` | `.tsx` | 2.1 KB | React Hook |
| `src/hooks/useClassroomRTC.ts` | `.ts` | 2.7 KB | React Hook |
| `src/hooks/use-entitlements.ts` | `.ts` | 1.2 KB | React Hook |
| `src/hooks/use-mobile.tsx` | `.tsx` | 0.6 KB | React Hook |
| `src/hooks/use-platform-config.ts` | `.ts` | 1.5 KB | React Hook |
| `src/hooks/use-theme.tsx` | `.tsx` | 1.1 KB | React Hook |
| `src/integrations/supabase/auth-attacher.ts` | `.ts` | 0.6 KB | Authentication/Authorization |
| `src/integrations/supabase/auth-middleware.ts` | `.ts` | 2.3 KB | Middleware |
| `src/integrations/supabase/client.server.ts` | `.ts` | 1.7 KB | Other |
| `src/integrations/supabase/client.ts` | `.ts` | 1.6 KB | Other |
| `src/integrations/supabase/types.ts` | `.ts` | 81.8 KB | Other |
| `src/lib/access.functions.ts` | `.ts` | 2.9 KB | Library/Utility |
| `src/lib/admin.functions.ts` | `.ts` | 3.6 KB | Library/Utility |
| `src/lib/agents/registry.server.ts` | `.ts` | 4.5 KB | Library/Utility |
| `src/lib/agents/run-agent.functions.ts` | `.ts` | 1.1 KB | Library/Utility |
| `src/lib/ai/keys.functions.ts` | `.ts` | 4.7 KB | Library/Utility |
| `src/lib/ai/provider.server.ts` | `.ts` | 9.2 KB | Library/Utility |
| `src/lib/ai-entitlement.ts` | `.ts` | 4.3 KB | Library/Utility |
| `src/lib/ai-tools.functions.ts` | `.ts` | 4.1 KB | Library/Utility |
| `src/lib/ai-tutor.functions.ts` | `.ts` | 6.9 KB | Library/Utility |
| `src/lib/booking-emails.functions.ts` | `.ts` | 3.9 KB | Library/Utility |
| `src/lib/classroom-rtc/index.ts` | `.ts` | 0.6 KB | Library/Utility |
| `src/lib/classroom-rtc/PeerToPeerRTCService.ts` | `.ts` | 16.7 KB | Library/Utility |
| `src/lib/classroom-rtc/types.ts` | `.ts` | 1.9 KB | Library/Utility |
| `src/lib/course-materials.functions.ts` | `.ts` | 2 KB | Library/Utility |
| `src/lib/email/enqueue.server.ts` | `.ts` | 4.3 KB | Library/Utility |
| `src/lib/email/provider.server.ts` | `.ts` | 4.8 KB | Library/Utility |
| `src/lib/email-templates/_shared.ts` | `.ts` | 0.9 KB | Library/Utility |
| `src/lib/email-templates/booking-confirmation.tsx` | `.tsx` | 2.6 KB | Library/Utility |
| `src/lib/email-templates/help-confirmation.tsx` | `.tsx` | 1.5 KB | Library/Utility |
| `src/lib/email-templates/help-new-ticket.tsx` | `.tsx` | 1.4 KB | Library/Utility |
| `src/lib/email-templates/registry.ts` | `.ts` | 0.5 KB | Library/Utility |
| `src/lib/email-templates/subscription-approved.tsx` | `.tsx` | 1.3 KB | Library/Utility |
| `src/lib/email-templates/subscription-rejected.tsx` | `.tsx` | 1.4 KB | Library/Utility |
| `src/lib/email-templates/welcome.tsx` | `.tsx` | 1.2 KB | Library/Utility |
| `src/lib/entitlements.functions.ts` | `.ts` | 0.5 KB | Library/Utility |
| `src/lib/error-capture.ts` | `.ts` | 0.9 KB | Library/Utility |
| `src/lib/error-page.ts` | `.ts` | 1.3 KB | Library/Utility |
| `src/lib/help.functions.ts` | `.ts` | 4.2 KB | Library/Utility |
| `src/lib/lab-modules.ts` | `.ts` | 15 KB | Library/Utility |
| `src/lib/payments/checkout.functions.ts` | `.ts` | 2.8 KB | Library/Utility |
| `src/lib/payments/paypal.server.ts` | `.ts` | 5.9 KB | Library/Utility |
| `src/lib/payments/router.server.ts` | `.ts` | 4.7 KB | Routing |
| `src/lib/payments/webhook-actions.ts` | `.ts` | 2.2 KB | Library/Utility |
| `src/lib/room-access.ts` | `.ts` | 1.2 KB | Library/Utility |
| `src/lib/server/platform.ts` | `.ts` | 3.8 KB | Library/Utility |
| `src/lib/sim-chat.functions.ts` | `.ts` | 2.5 KB | Library/Utility |
| `src/lib/sim-lab.functions.ts` | `.ts` | 20 KB | Library/Utility |
| `src/lib/students.functions.ts` | `.ts` | 1.5 KB | Library/Utility |
| `src/lib/utils.ts` | `.ts` | 0.2 KB | Library/Utility |
| `src/lib/webgl/geometry.ts` | `.ts` | 3.2 KB | Library/Utility |
| `src/lib/webgl/mat4.ts` | `.ts` | 2.8 KB | Library/Utility |
| `src/lib/webgl/renderer.ts` | `.ts` | 4.3 KB | Library/Utility |
| `src/lib/webgl/scenes.ts` | `.ts` | 6.6 KB | Library/Utility |
| `src/lib/whiteboard-ai.functions.ts` | `.ts` | 3.6 KB | Library/Utility |
| `src/router.tsx` | `.tsx` | 0.4 KB | Routing |
| `src/routes/__root.tsx` | `.tsx` | 4.8 KB | Routing |
| `src/routes/_authenticated.tsx` | `.tsx` | 0.7 KB | Routing |
| `src/routes/_authenticated/admin.ai.tsx` | `.tsx` | 1.4 KB | Routing |
| `src/routes/_authenticated/admin.analytics.tsx` | `.tsx` | 4 KB | Routing |
| `src/routes/_authenticated/admin.audit.tsx` | `.tsx` | 5.9 KB | Routing |
| `src/routes/_authenticated/admin.classrooms.tsx` | `.tsx` | 1 KB | Routing |
| `src/routes/_authenticated/admin.commissions.tsx` | `.tsx` | 10.4 KB | Routing |
| `src/routes/_authenticated/admin.index.tsx` | `.tsx` | 30 KB | Routing |
| `src/routes/_authenticated/admin.moderation.tsx` | `.tsx` | 2.7 KB | Routing |
| `src/routes/_authenticated/admin.payments.tsx` | `.tsx` | 13.1 KB | Routing |
| `src/routes/_authenticated/admin.payouts.tsx` | `.tsx` | 45.6 KB | Routing |
| `src/routes/_authenticated/admin.plans.tsx` | `.tsx` | 13.7 KB | Routing |
| `src/routes/_authenticated/admin.promotions.tsx` | `.tsx` | 7.2 KB | Routing |
| `src/routes/_authenticated/admin.reports.tsx` | `.tsx` | 2.5 KB | Routing |
| `src/routes/_authenticated/admin.students.tsx` | `.tsx` | 2.8 KB | Routing |
| `src/routes/_authenticated/admin.tutors.tsx` | `.tsx` | 4.1 KB | Routing |
| `src/routes/_authenticated/admin.whiteboard.tsx` | `.tsx` | 1.4 KB | Routing |
| `src/routes/_authenticated/ai-tools.tsx` | `.tsx` | 8.2 KB | Routing |
| `src/routes/_authenticated/ai-tutor.tsx` | `.tsx` | 9.8 KB | Routing |
| `src/routes/_authenticated/assignments.tsx` | `.tsx` | 9 KB | Routing |
| `src/routes/_authenticated/become-tutor.tsx` | `.tsx` | 13.2 KB | Routing |
| `src/routes/_authenticated/book.$tutorId.tsx` | `.tsx` | 16.5 KB | Routing |
| `src/routes/_authenticated/calendar.tsx` | `.tsx` | 6 KB | Routing |
| `src/routes/_authenticated/certificate.tsx` | `.tsx` | 6.3 KB | Routing |
| `src/routes/_authenticated/classroom.$roomId.tsx` | `.tsx` | 1.5 KB | Routing |
| `src/routes/_authenticated/code.tsx` | `.tsx` | 5.2 KB | Routing |
| `src/routes/_authenticated/courses.tsx` | `.tsx` | 16.5 KB | Routing |
| `src/routes/_authenticated/dashboard.tsx` | `.tsx` | 45.9 KB | Routing |
| `src/routes/_authenticated/labs.tsx` | `.tsx` | 4.4 KB | Routing |
| `src/routes/_authenticated/labs_.simulation-lab.tsx` | `.tsx` | 23.8 KB | Routing |
| `src/routes/_authenticated/lessons.tsx` | `.tsx` | 8.6 KB | Routing |
| `src/routes/_authenticated/messages.tsx` | `.tsx` | 7.7 KB | Routing |
| `src/routes/_authenticated/my-courses.tsx` | `.tsx` | 4.2 KB | Routing |
| `src/routes/_authenticated/notes.tsx` | `.tsx` | 6.4 KB | Routing |
| `src/routes/_authenticated/notifications.tsx` | `.tsx` | 3.9 KB | Routing |
| `src/routes/_authenticated/parent.children.tsx` | `.tsx` | 7.3 KB | Routing |
| `src/routes/_authenticated/parent.tsx` | `.tsx` | 5.6 KB | Routing |
| `src/routes/_authenticated/pay-tutor.tsx` | `.tsx` | 6.4 KB | Routing |
| `src/routes/_authenticated/records.tsx` | `.tsx` | 4.8 KB | Routing |
| `src/routes/_authenticated/resources.tsx` | `.tsx` | 6.9 KB | Routing |
| `src/routes/_authenticated/settings.tsx` | `.tsx` | 11.5 KB | Routing |
| `src/routes/_authenticated/tutor.availability.tsx` | `.tsx` | 7.4 KB | Routing |
| `src/routes/_authenticated/tutor.holidays.tsx` | `.tsx` | 4.2 KB | Routing |
| `src/routes/_authenticated/wallet.tsx` | `.tsx` | 8.2 KB | Routing |
| `src/routes/_authenticated/whiteboard-review.$sessionId.tsx` | `.tsx` | 1.3 KB | Routing |
| `src/routes/api/checkout/return.tsx` | `.tsx` | 3.8 KB | Routing |
| `src/routes/api/public/webhooks/paypal.ts` | `.ts` | 3 KB | Routing |
| `src/routes/auth.tsx` | `.tsx` | 6.8 KB | Routing |
| `src/routes/checkout.cancelled.tsx` | `.tsx` | 0.7 KB | Routing |
| `src/routes/checkout.failed.tsx` | `.tsx` | 1.2 KB | Routing |
| `src/routes/checkout.success.tsx` | `.tsx` | 0.7 KB | Routing |
| `src/routes/community.tsx` | `.tsx` | 9.6 KB | Routing |
| `src/routes/email/unsubscribe.ts` | `.ts` | 5.3 KB | Routing |
| `src/routes/help.tsx` | `.tsx` | 3.6 KB | Routing |
| `src/routes/index.tsx` | `.tsx` | 14.3 KB | Routing |
| `src/routes/leaderboard.tsx` | `.tsx` | 4.7 KB | Routing |
| `src/routes/tutor.$id.tsx` | `.tsx` | 7.9 KB | Routing |
| `src/routes/tutors.tsx` | `.tsx` | 12.8 KB | Routing |
| `src/routes/unsubscribe.tsx` | `.tsx` | 3.2 KB | Routing |
| `src/routeTree.gen.ts` | `.ts` | 52.1 KB | Other |
| `src/server.ts` | `.ts` | 0.4 KB | Other |
| `src/start.ts` | `.ts` | 0.8 KB | Other |
| `src/styles.css` | `.css` | 7.9 KB | Other |
| `supabase/.temp/linked-project.json` | `.json` | 0.2 KB | Other |
| `supabase/config.toml` | `.toml` | 0 KB | Other |
| `supabase/migrations/20260518180453_b7b6b188-b2f9-4a6e-8317-5f8fd52bffac.sql` | `.sql` | 4.6 KB | Database Migration |
| `supabase/migrations/20260518180507_8749a32b-dc91-4e11-b9de-8107bc6e9a43.sql` | `.sql` | 0.3 KB | Database Migration |
| `supabase/migrations/20260518180559_079a0331-844f-4a93-af54-df8c3b16c8ff.sql` | `.sql` | 0.1 KB | Database Migration |
| `supabase/migrations/20260520134733_17b373c0-0c07-41a8-a4e7-7a2d37738f9b.sql` | `.sql` | 0.9 KB | Database Migration |
| `supabase/migrations/20260521120359_e0e495a3-e6c6-4d8c-9376-6aab3bcb158c.sql` | `.sql` | 1.1 KB | Database Migration |
| `supabase/migrations/20260521120426_f8a86ba3-535c-4a9b-9c14-d92ffe33f02c.sql` | `.sql` | 1 KB | Database Migration |
| `supabase/migrations/20260521120758_573f01a8-70c7-4bea-904d-df0f39bd7928.sql` | `.sql` | 1.8 KB | Database Migration |
| `supabase/migrations/20260522062230_43125182-8270-4977-9b19-ccf05619dfc1.sql` | `.sql` | 1.1 KB | Database Migration |
| `supabase/migrations/20260522073549_72500aff-965a-49a8-b3ab-2239c850168b.sql` | `.sql` | 2.1 KB | Database Migration |
| `supabase/migrations/20260522080609_f51f3676-392c-4338-9bf9-df9c105ace54.sql` | `.sql` | 1.2 KB | Database Migration |
| `supabase/migrations/20260522081314_e4dfd053-8a0b-4f10-b201-0bf7b8ed2693.sql` | `.sql` | 0 KB | Database Migration |
| `supabase/migrations/20260522083220_390d842b-0b64-43c7-b5e6-c87b5c7fd60f.sql` | `.sql` | 4 KB | Database Migration |
| `supabase/migrations/20260522085703_b8342121-277e-478e-9c42-e2786a56c7c3.sql` | `.sql` | 1.6 KB | Database Migration |
| `supabase/migrations/20260522085716_cae43fa7-ce66-4c10-81a1-e0f4588a6e75.sql` | `.sql` | 0.4 KB | Database Migration |
| `supabase/migrations/20260522092853_email_infra.sql` | `.sql` | 11.1 KB | Database Migration |
| `supabase/migrations/20260522092905_email_infra.sql` | `.sql` | 11.1 KB | Database Migration |
| `supabase/migrations/20260522093122_email_infra.sql` | `.sql` | 11.1 KB | Database Migration |
| `supabase/migrations/20260522105704_683e0c7c-3a9f-4da8-822e-a34d221a36f2.sql` | `.sql` | 1 KB | Database Migration |
| `supabase/migrations/20260522110136_e7689ab4-ce46-4391-8a25-1cc5f1eb3a9d.sql` | `.sql` | 3.7 KB | Database Migration |
| `supabase/migrations/20260522113118_7b053bf2-58a5-48b8-8dbe-dbb0583cf4a1.sql` | `.sql` | 2.8 KB | Database Migration |
| `supabase/migrations/20260522120800_fe282aa0-ce58-4c5b-a14a-79b180215e97.sql` | `.sql` | 1.1 KB | Database Migration |
| `supabase/migrations/20260523081725_04e83f6c-dd2a-4938-9b33-3e24fa61ed29.sql` | `.sql` | 1.5 KB | Database Migration |
| `supabase/migrations/20260523083334_1bbbc501-2402-4d07-a676-38c68d2d1f0b.sql` | `.sql` | 0.6 KB | Database Migration |
| `supabase/migrations/20260524041428_148987e9-23da-47fa-8182-294dcfc9400c.sql` | `.sql` | 1.1 KB | Database Migration |
| `supabase/migrations/20260524041718_e722d83c-5457-4ec3-b7b6-c6e8be29c3df.sql` | `.sql` | 2.3 KB | Database Migration |
| `supabase/migrations/20260524041736_08febb8a-724f-4196-9c78-0b3d6784c153.sql` | `.sql` | 0 KB | Database Migration |
| `supabase/migrations/20260524042040_6fd4de5c-4856-4bbc-a86b-eda4026f5bff.sql` | `.sql` | 0.1 KB | Database Migration |
| `supabase/migrations/20260524042244_6ecb8491-343f-435d-9189-c0e2483ea230.sql` | `.sql` | 5.5 KB | Database Migration |
| `supabase/migrations/20260524042859_808cd5c3-c692-4ca0-b22d-e5359b17464c.sql` | `.sql` | 0.3 KB | Database Migration |
| `supabase/migrations/20260524043637_d17d6f91-84c3-45ff-af6b-648a666f715d.sql` | `.sql` | 2 KB | Database Migration |
| `supabase/migrations/20260524044641_c5814e6b-fe15-459d-96b0-746ba98fdc2c.sql` | `.sql` | 1.1 KB | Database Migration |
| `supabase/migrations/20260524044744_email_infra.sql` | `.sql` | 11.1 KB | Database Migration |
| `supabase/migrations/20260524051514_1878b3e2-125a-46eb-a789-fa1409028e71.sql` | `.sql` | 2 KB | Database Migration |
| `supabase/migrations/20260524064757_b2d8e9c2-2d6e-4b76-8a73-dd3c1987a2ae.sql` | `.sql` | 1 KB | Database Migration |
| `supabase/migrations/20260524065325_6df81ffd-fb2e-4df8-ac71-5b5f8cd92554.sql` | `.sql` | 0.8 KB | Database Migration |
| `supabase/migrations/20260524070449_ae8130d6-d9a2-4437-8dd0-73c2893185b3.sql` | `.sql` | 3.3 KB | Database Migration |
| `supabase/migrations/20260524074439_b5bca5df-a7ce-40c8-a931-d1e64321d7b5.sql` | `.sql` | 0.5 KB | Database Migration |
| `supabase/migrations/20260525125039_8673bafb-4eda-434f-9900-1a4c688ab424.sql` | `.sql` | 0.9 KB | Database Migration |
| `supabase/migrations/20260528060818_02ef6fb2-553e-43f1-900a-bd8eb4dd56af.sql` | `.sql` | 0.3 KB | Database Migration |
| `supabase/migrations/20260530152504_b823d221-b60a-432b-85ac-0745a79e9d55.sql` | `.sql` | 8.1 KB | Database Migration |
| `supabase/migrations/20260601045818_f63dbd87-f3a0-4e98-8232-d380ac4a68f6.sql` | `.sql` | 6.4 KB | Database Migration |
| `supabase/migrations/20260605061006_40c146b5-f458-4620-a3ed-688348719a19.sql` | `.sql` | 2.9 KB | Database Migration |
| `supabase/migrations/20260611082303_c77aeed1-ee3d-4917-983d-abc4f0e52ceb.sql` | `.sql` | 3.2 KB | Database Migration |
| `supabase/migrations/20260620193809_e7f89819-b8cc-4e85-9441-39e6b31e579d.sql` | `.sql` | 3.8 KB | Database Migration |
| `supabase/migrations/20260620193831_7e7a3f45-9cbe-4ad4-91c4-0884121a0b3a.sql` | `.sql` | 1 KB | Database Migration |
| `supabase/migrations/20260622125739_8a71ad77-3504-43d2-92b4-3fedd6b2a91e.sql` | `.sql` | 17.7 KB | Database Migration |
| `supabase/migrations/20260622125757_eabc3c74-3adb-4b2a-bb50-d98a2da0a202.sql` | `.sql` | 0.6 KB | Database Migration |
| `supabase/migrations/20260622133155_c56722d8-1a65-4287-bf95-1c06689bba3f.sql` | `.sql` | 8.7 KB | Database Migration |
| `supabase/migrations/20260623074007_ddbe3e51-097a-4763-af33-95b236a42698.sql` | `.sql` | 1.7 KB | Database Migration |
| `supabase/migrations/20260623075231_4c324342-ee6b-47fa-ad48-39af2516c21c.sql` | `.sql` | 1.9 KB | Database Migration |
| `supabase/migrations/20260623082025_9963a138-6dc4-4d83-8b63-3cd31e3a7504.sql` | `.sql` | 24.3 KB | Database Migration |
| `supabase/migrations/20260623082050_70d58ecc-f89e-48ad-9e55-0d5e10f677f2.sql` | `.sql` | 1.2 KB | Database Migration |
| `supabase/migrations/20260623082342_5be4ee4e-9845-45f8-b995-dace190d24f1.sql` | `.sql` | 1.9 KB | Database Migration |
| `supabase/migrations/20260623100541_29ade4ae-9cc6-46bf-a916-ba9ecf155ff3.sql` | `.sql` | 6 KB | Database Migration |
| `supabase/migrations/20260623102100_68bc0646-a669-4dd9-9ba7-4cdb16225116.sql` | `.sql` | 1.1 KB | Database Migration |
| `supabase/migrations/20260623111535_6dc2ecd4-5f71-421a-a372-bd125820c267.sql` | `.sql` | 7.6 KB | Database Migration |
| `supabase/migrations/20260623113448_5862c988-44e2-423a-8dce-ff55c49cf774.sql` | `.sql` | 2 KB | Database Migration |
| `supabase/migrations/20260623114741_9a1edb8d-58ea-4825-8560-ba68d6527ab9.sql` | `.sql` | 0.5 KB | Database Migration |
| `supabase/migrations/20260623121121_6dd82a2e-a01a-42c2-a505-12240ec66391.sql` | `.sql` | 4.4 KB | Database Migration |
| `supabase/migrations/20260701082250_cc8fecf7-8ce5-4d5e-971b-0bad7a33e4e9.sql` | `.sql` | 1 KB | Database Migration |
| `supabase/migrations/20260701084425_090d5165-a08f-4cce-ba0a-56620c1578d1.sql` | `.sql` | 0.7 KB | Database Migration |
| `supabase/migrations/20260811090000_29d8fece-92c9-4bab-a85f-e95d49161abf.sql` | `.sql` | 0.8 KB | Database Migration |
| `supabase/migrations/20260812060000_p0_security_fixes.sql` | `.sql` | 17.1 KB | Database Migration |
| `supabase/migrations/20260812100000_close_session_insert_bypass.sql` | `.sql` | 0.6 KB | Database Migration |
| `supabase/migrations/20260812120000_restore_whiteboard_chat_tables.sql` | `.sql` | 6.1 KB | Database Migration |
| `supabase/migrations/20260812130000_harden_rpc_grants_and_guards.sql` | `.sql` | 11.7 KB | Database Migration |
| `supabase/migrations/20260812140000_revoke_public_execute_grants.sql` | `.sql` | 2.7 KB | Database Migration |
| `supabase/migrations/20260812150000_align_booking_gate_with_subscriptions_flag.sql` | `.sql` | 5.6 KB | Database Migration |
| `supabase/migrations/20260813090000_add_rls_profiles_user_roles_policies.sql` | `.sql` | 3.1 KB | Database Migration |
| `supabase/migrations/20260814090000_add_rls_admin_operations_policies.sql` | `.sql` | 3.1 KB | Database Migration |
| `supabase/migrations/20260814140000_add_rls_entitlement_gates_beyond_book_session.sql` | `.sql` | 1.9 KB | Database Migration |
| `supabase/migrations/20260815090000_add_rls_tutor_app_promotion_validation.sql` | `.sql` | 4.1 KB | Database Migration |
| `supabase/migrations/20260815140000_add_rls_parent_role_policies.sql` | `.sql` | 6.1 KB | Database Migration |
| `supabase_schema.json` | `.json` | 0.5 KB | Other |
| `tests/ai-entitlement.test.ts` | `.ts` | 4.9 KB | Testing |
| `tests/room-access.test.ts` | `.ts` | 2.5 KB | Testing |
| `tests/webhook-actions.test.ts` | `.ts` | 2.7 KB | Testing |
| `tsconfig.json` | `.json` | 0.7 KB | TypeScript Configuration |
| `tutor_apps_count.sql` | `.sql` | 0.1 KB | SQL |
| `verify_profiles_policies.sql` | `.sql` | 0.1 KB | SQL |
| `verify_rpcs.sql` | `.sql` | 0.2 KB | SQL |
| `verify_sessions_policies.sql` | `.sql` | 0.1 KB | SQL |
| `verify_tutor_courses_policies.sql` | `.sql` | 0.1 KB | SQL |
| `verify_tutor_subscriptions_policies.sql` | `.sql` | 0.1 KB | Commerce/Payment |
| `verify_user_roles_policies.sql` | `.sql` | 0.1 KB | SQL |
| `vite.config.ts` | `.ts` | 3.8 KB | Build Configuration |
| `ZERO_META.json` | `.json` | 5 KB | Other |

## 6. PACKAGE METADATA

> Package names and declared versions only. No environment values are exported.

**Project:** `askatutorlive`

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

## 7. SUPABASE MIGRATION INVENTORY

> Migration filenames only. SQL contents are deliberately excluded.

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

## 8. ARCHITECTURAL HOTSPOTS

The following areas were detected from repository paths and filenames:

- Authentication / Authorization
- AI / LLM
- Classroom / Realtime
- Whiteboard
- Payments / Commerce
- Supabase / Database
- Routing
- Administration
- Testing
- Learning / Courses / Lessons
- Tutor / Student workflows
- Parent workflows
- Messaging / Notifications
- Resources / Files
- Analytics / Reporting

## 9. SANITIZATION VALIDATION


## 10. LIMITATIONS

- File responsibility is inferred from paths, names and metadata.
- Actual source-code behavior is not represented.
- SQL statements are not represented.
- Runtime behavior is not represented.
- Database RLS behavior is not proven by this inventory.
- Authentication authorization correctness is not proven.
- Payment security is not proven.
- AI provider behavior is not proven.
- Import paths represent structural evidence, not guaranteed runtime dependency semantics.

## 11. INSTRUCTIONS FOR EXTERNAL ARCHITECTURE ANALYSIS

Use this document as reconnaissance evidence.

Do NOT assume the existing architecture is correct merely because a file exists.

Determine:

1. What architectural domains AskATutorLive currently contains.
2. What responsibilities each domain appears to have.
3. Which domains are tightly coupled.
4. Which boundaries are missing or weak.
5. Which capabilities appear duplicated.
6. Which critical capabilities appear absent.
7. Which architectural decisions should be changed before further coding.
8. What target architecture would best support the stated AskATutorLive product vision.
9. What should be preserved, refactored, replaced or removed.
10. What implementation sequence should be followed later by OpenCode.

Do not generate implementation code from this document.
First produce architecture, domain boundaries, dependency direction, workflows, risks and implementation sequencing.

## 12. FINAL SAFETY STATEMENT

This file was generated locally.
No repository source-code contents were intentionally written into this document.
No credentials, API keys, environment values, private keys or user records are intentionally included.

