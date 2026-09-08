# AskATutorLive — Arena Architecture Reconnaissance V3

> **Purpose:** External architecture analysis only.
>
> Generated locally from the AskATutorLive repository.
>
> This document does **not** contain repository source code.

## SECURITY BOUNDARY

Arena must treat this document as an architectural map, not as source code.

Excluded:

- credentials
- API keys
- environment values
- passwords
- tokens
- certificates
- private keys
- Git metadata
- dependency/vendor directories
- build artifacts
- application source contents
- SQL statements
- user records

## 1. REPOSITORY PROFILE

| Metric | Value |
|---|---:|
| Included files | 373 |
| Architecture files | 354 |
| Internal import edges | 770 |
| Architectural categories | 17 |

### Project Metadata

- Package name: `askatutorlive`

## 2. DIRECTORY TOPOLOGY

- `src/` — 224 architecture files
- `supabase/` — 75 architecture files
- `[ROOT]/` — 50 architecture files
- `tests/` — 3 architecture files
- `scripts/` — 1 architecture files
- `public/` — 1 architecture files

## 3. COMPLETE SANITIZED FILE TREE

`	ext
.gitignore
.prettierignore
.prettierrc
all_triggers.sql
architecture-inventory.md
architecture-inventory-v2.md
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
### UI_COMPONENT

- `src/components/admin/AiKeyManager.tsx`
- `src/components/admin/AiProviderSelect.tsx`
- `src/components/admin/ConfigToggle.tsx`
- `src/components/ai/DiagramBlock.tsx`
- `src/components/ai/SaveToNotes.tsx`
- `src/components/ai/SmartMarkdown.tsx`
- `src/components/classroom/ActionBar.tsx`
- `src/components/classroom/AIAssistantPanel.tsx`
- `src/components/classroom/ClassroomChat.tsx`
- `src/components/classroom/ClassroomHeader.tsx`
- `src/components/classroom/ClassroomShell.tsx`
- `src/components/classroom/ClassroomStage.tsx`
- `src/components/classroom/DeviceSettingsDialog.tsx`
- `src/components/classroom/ParticipantsPanel.tsx`
- `src/components/classroom/SidePanel.tsx`
- `src/components/classroom/useSessionTimer.ts`
- `src/components/classroom/VideoCard.tsx`
- `src/components/classroom/VideoLayout.tsx`
- `src/components/classroom/VideoStage.tsx`
- `src/components/ClassroomFiles.tsx`
- `src/components/dashboard/AdminHome.tsx`
- `src/components/dashboard/AppShell.tsx`
- `src/components/dashboard/CommandPalette.tsx`
- `src/components/dashboard/primitives.tsx`
- `src/components/dashboard/StudentHome.tsx`
- `src/components/dashboard/TutorHome.tsx`
- `src/components/home/HomeSections.tsx`
- `src/components/InstallPrompt.tsx`
- `src/components/lab3d/AmbientEmpty.tsx`
- `src/components/lab3d/GeoView.tsx`
- `src/components/lab3d/LanguageView.tsx`
- `src/components/lab3d/physics.ts`
- `src/components/lab3d/ProcessView.tsx`
- `src/components/lab3d/Scene2D.tsx`
- `src/components/lab3d/SimChat.tsx`
- `src/components/lab3d/SimDispatch.tsx`
- `src/components/lab3d/SimScene.tsx`
- `src/components/lab3d/TimelineView.tsx`
- `src/components/LorddaLab.tsx`
- `src/components/MathTools.tsx`
- `src/components/MobileTabBar.tsx`
- `src/components/Navbar.tsx`
- `src/components/payments/PayButton.tsx`
- `src/components/ScheduleStudentCard.tsx`
- `src/components/ScopeGate.tsx`
- `src/components/ThreeDLab.tsx`
- `src/components/ui/accordion.tsx`
- `src/components/ui/alert.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/aspect-ratio.tsx`
- `src/components/ui/avatar.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/breadcrumb.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/calendar.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/carousel.tsx`
- `src/components/ui/chart.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/collapsible.tsx`
- `src/components/ui/command.tsx`
- `src/components/ui/context-menu.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/drawer.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/form.tsx`
- `src/components/ui/hover-card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/input-otp.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/menubar.tsx`
- `src/components/ui/navigation-menu.tsx`
- `src/components/ui/pagination.tsx`
- `src/components/ui/popover.tsx`
- `src/components/ui/progress.tsx`
- `src/components/ui/radio-group.tsx`
- `src/components/ui/resizable.tsx`
- `src/components/ui/scroll-area.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/sidebar.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/slider.tsx`
- `src/components/ui/sonner.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/toggle.tsx`
- `src/components/ui/toggle-group.tsx`
- `src/components/ui/tooltip.tsx`
- `src/components/WebGLLab.tsx`
- `src/components/whiteboard/ai/ConvertButton.tsx`
- `src/components/whiteboard/ai/insertConversion.ts`
- `src/components/whiteboard/canvas/engine.ts`
- `src/components/whiteboard/canvas/exporter.ts`
- `src/components/whiteboard/canvas/latex.ts`
- `src/components/whiteboard/canvas/realtime.ts`
- `src/components/whiteboard/canvas/renderer.ts`
- `src/components/whiteboard/canvas/smooth.ts`
- `src/components/whiteboard/canvas/Whiteboard.tsx`
- `src/components/whiteboard/collaboration/cursors.tsx`
- `src/components/whiteboard/index.ts`

### DATABASE_MIGRATION

- `supabase/migrations/20260518180453_b7b6b188-b2f9-4a6e-8317-5f8fd52bffac.sql`
- `supabase/migrations/20260518180507_8749a32b-dc91-4e11-b9de-8107bc6e9a43.sql`
- `supabase/migrations/20260518180559_079a0331-844f-4a93-af54-df8c3b16c8ff.sql`
- `supabase/migrations/20260520134733_17b373c0-0c07-41a8-a4e7-7a2d37738f9b.sql`
- `supabase/migrations/20260521120359_e0e495a3-e6c6-4d8c-9376-6aab3bcb158c.sql`
- `supabase/migrations/20260521120426_f8a86ba3-535c-4a9b-9c14-d92ffe33f02c.sql`
- `supabase/migrations/20260521120758_573f01a8-70c7-4bea-904d-df0f39bd7928.sql`
- `supabase/migrations/20260522062230_43125182-8270-4977-9b19-ccf05619dfc1.sql`
- `supabase/migrations/20260522073549_72500aff-965a-49a8-b3ab-2239c850168b.sql`
- `supabase/migrations/20260522080609_f51f3676-392c-4338-9bf9-df9c105ace54.sql`
- `supabase/migrations/20260522081314_e4dfd053-8a0b-4f10-b201-0bf7b8ed2693.sql`
- `supabase/migrations/20260522083220_390d842b-0b64-43c7-b5e6-c87b5c7fd60f.sql`
- `supabase/migrations/20260522085703_b8342121-277e-478e-9c42-e2786a56c7c3.sql`
- `supabase/migrations/20260522085716_cae43fa7-ce66-4c10-81a1-e0f4588a6e75.sql`
- `supabase/migrations/20260522092853_email_infra.sql`
- `supabase/migrations/20260522092905_email_infra.sql`
- `supabase/migrations/20260522093122_email_infra.sql`
- `supabase/migrations/20260522105704_683e0c7c-3a9f-4da8-822e-a34d221a36f2.sql`
- `supabase/migrations/20260522110136_e7689ab4-ce46-4391-8a25-1cc5f1eb3a9d.sql`
- `supabase/migrations/20260522113118_7b053bf2-58a5-48b8-8dbe-dbb0583cf4a1.sql`
- `supabase/migrations/20260522120800_fe282aa0-ce58-4c5b-a14a-79b180215e97.sql`
- `supabase/migrations/20260523081725_04e83f6c-dd2a-4938-9b33-3e24fa61ed29.sql`
- `supabase/migrations/20260523083334_1bbbc501-2402-4d07-a676-38c68d2d1f0b.sql`
- `supabase/migrations/20260524041428_148987e9-23da-47fa-8182-294dcfc9400c.sql`
- `supabase/migrations/20260524041718_e722d83c-5457-4ec3-b7b6-c6e8be29c3df.sql`
- `supabase/migrations/20260524041736_08febb8a-724f-4196-9c78-0b3d6784c153.sql`
- `supabase/migrations/20260524042040_6fd4de5c-4856-4bbc-a86b-eda4026f5bff.sql`
- `supabase/migrations/20260524042244_6ecb8491-343f-435d-9189-c0e2483ea230.sql`
- `supabase/migrations/20260524042859_808cd5c3-c692-4ca0-b22d-e5359b17464c.sql`
- `supabase/migrations/20260524043637_d17d6f91-84c3-45ff-af6b-648a666f715d.sql`
- `supabase/migrations/20260524044641_c5814e6b-fe15-459d-96b0-746ba98fdc2c.sql`
- `supabase/migrations/20260524044744_email_infra.sql`
- `supabase/migrations/20260524051514_1878b3e2-125a-46eb-a789-fa1409028e71.sql`
- `supabase/migrations/20260524064757_b2d8e9c2-2d6e-4b76-8a73-dd3c1987a2ae.sql`
- `supabase/migrations/20260524065325_6df81ffd-fb2e-4df8-ac71-5b5f8cd92554.sql`
- `supabase/migrations/20260524070449_ae8130d6-d9a2-4437-8dd0-73c2893185b3.sql`
- `supabase/migrations/20260524074439_b5bca5df-a7ce-40c8-a931-d1e64321d7b5.sql`
- `supabase/migrations/20260525125039_8673bafb-4eda-434f-9900-1a4c688ab424.sql`
- `supabase/migrations/20260528060818_02ef6fb2-553e-43f1-900a-bd8eb4dd56af.sql`
- `supabase/migrations/20260530152504_b823d221-b60a-432b-85ac-0745a79e9d55.sql`
- `supabase/migrations/20260601045818_f63dbd87-f3a0-4e98-8232-d380ac4a68f6.sql`
- `supabase/migrations/20260605061006_40c146b5-f458-4620-a3ed-688348719a19.sql`
- `supabase/migrations/20260611082303_c77aeed1-ee3d-4917-983d-abc4f0e52ceb.sql`
- `supabase/migrations/20260620193809_e7f89819-b8cc-4e85-9441-39e6b31e579d.sql`
- `supabase/migrations/20260620193831_7e7a3f45-9cbe-4ad4-91c4-0884121a0b3a.sql`
- `supabase/migrations/20260622125739_8a71ad77-3504-43d2-92b4-3fedd6b2a91e.sql`
- `supabase/migrations/20260622125757_eabc3c74-3adb-4b2a-bb50-d98a2da0a202.sql`
- `supabase/migrations/20260622133155_c56722d8-1a65-4287-bf95-1c06689bba3f.sql`
- `supabase/migrations/20260623074007_ddbe3e51-097a-4763-af33-95b236a42698.sql`
- `supabase/migrations/20260623075231_4c324342-ee6b-47fa-ad48-39af2516c21c.sql`
- `supabase/migrations/20260623082025_9963a138-6dc4-4d83-8b63-3cd31e3a7504.sql`
- `supabase/migrations/20260623082050_70d58ecc-f89e-48ad-9e55-0d5e10f677f2.sql`
- `supabase/migrations/20260623082342_5be4ee4e-9845-45f8-b995-dace190d24f1.sql`
- `supabase/migrations/20260623100541_29ade4ae-9cc6-46bf-a916-ba9ecf155ff3.sql`
- `supabase/migrations/20260623102100_68bc0646-a669-4dd9-9ba7-4cdb16225116.sql`
- `supabase/migrations/20260623111535_6dc2ecd4-5f71-421a-a372-bd125820c267.sql`
- `supabase/migrations/20260623113448_5862c988-44e2-423a-8dce-ff55c49cf774.sql`
- `supabase/migrations/20260623114741_9a1edb8d-58ea-4825-8560-ba68d6527ab9.sql`
- `supabase/migrations/20260623121121_6dd82a2e-a01a-42c2-a505-12240ec66391.sql`
- `supabase/migrations/20260701082250_cc8fecf7-8ce5-4d5e-971b-0bad7a33e4e9.sql`
- `supabase/migrations/20260701084425_090d5165-a08f-4cce-ba0a-56620c1578d1.sql`
- `supabase/migrations/20260811090000_29d8fece-92c9-4bab-a85f-e95d49161abf.sql`
- `supabase/migrations/20260812060000_p0_security_fixes.sql`
- `supabase/migrations/20260812100000_close_session_insert_bypass.sql`
- `supabase/migrations/20260812120000_restore_whiteboard_chat_tables.sql`
- `supabase/migrations/20260812130000_harden_rpc_grants_and_guards.sql`
- `supabase/migrations/20260812140000_revoke_public_execute_grants.sql`
- `supabase/migrations/20260812150000_align_booking_gate_with_subscriptions_flag.sql`
- `supabase/migrations/20260813090000_add_rls_profiles_user_roles_policies.sql`
- `supabase/migrations/20260814090000_add_rls_admin_operations_policies.sql`
- `supabase/migrations/20260814140000_add_rls_entitlement_gates_beyond_book_session.sql`
- `supabase/migrations/20260815090000_add_rls_tutor_app_promotion_validation.sql`
- `supabase/migrations/20260815140000_add_rls_parent_role_policies.sql`

### ROUTING

- `src/lib/payments/router.server.ts`
- `src/router.tsx`
- `src/routes/__root.tsx`
- `src/routes/_authenticated.tsx`
- `src/routes/_authenticated/admin.ai.tsx`
- `src/routes/_authenticated/admin.analytics.tsx`
- `src/routes/_authenticated/admin.audit.tsx`
- `src/routes/_authenticated/admin.classrooms.tsx`
- `src/routes/_authenticated/admin.commissions.tsx`
- `src/routes/_authenticated/admin.index.tsx`
- `src/routes/_authenticated/admin.moderation.tsx`
- `src/routes/_authenticated/admin.payments.tsx`
- `src/routes/_authenticated/admin.payouts.tsx`
- `src/routes/_authenticated/admin.plans.tsx`
- `src/routes/_authenticated/admin.promotions.tsx`
- `src/routes/_authenticated/admin.reports.tsx`
- `src/routes/_authenticated/admin.students.tsx`
- `src/routes/_authenticated/admin.tutors.tsx`
- `src/routes/_authenticated/admin.whiteboard.tsx`
- `src/routes/_authenticated/ai-tools.tsx`
- `src/routes/_authenticated/ai-tutor.tsx`
- `src/routes/_authenticated/assignments.tsx`
- `src/routes/_authenticated/become-tutor.tsx`
- `src/routes/_authenticated/book.$tutorId.tsx`
- `src/routes/_authenticated/calendar.tsx`
- `src/routes/_authenticated/certificate.tsx`
- `src/routes/_authenticated/classroom.$roomId.tsx`
- `src/routes/_authenticated/code.tsx`
- `src/routes/_authenticated/courses.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- `src/routes/_authenticated/labs.tsx`
- `src/routes/_authenticated/labs_.simulation-lab.tsx`
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
- `src/routes/_authenticated/whiteboard-review.$sessionId.tsx`
- `src/routes/api/checkout/return.tsx`
- `src/routes/api/public/webhooks/paypal.ts`
- `src/routes/auth.tsx`
- `src/routes/checkout.cancelled.tsx`
- `src/routes/checkout.failed.tsx`
- `src/routes/checkout.success.tsx`
- `src/routes/community.tsx`
- `src/routes/email/unsubscribe.ts`
- `src/routes/help.tsx`
- `src/routes/index.tsx`
- `src/routes/leaderboard.tsx`
- `src/routes/tutor.$id.tsx`
- `src/routes/tutors.tsx`
- `src/routes/unsubscribe.tsx`

### LIBRARY

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
- `src/lib/classroom-rtc/index.ts`
- `src/lib/classroom-rtc/PeerToPeerRTCService.ts`
- `src/lib/classroom-rtc/types.ts`
- `src/lib/course-materials.functions.ts`
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
- `src/lib/entitlements.functions.ts`
- `src/lib/error-capture.ts`
- `src/lib/error-page.ts`
- `src/lib/help.functions.ts`
- `src/lib/lab-modules.ts`
- `src/lib/payments/checkout.functions.ts`
- `src/lib/payments/paypal.server.ts`
- `src/lib/payments/webhook-actions.ts`
- `src/lib/room-access.ts`
- `src/lib/server/platform.ts`
- `src/lib/sim-chat.functions.ts`
- `src/lib/sim-lab.functions.ts`
- `src/lib/students.functions.ts`
- `src/lib/utils.ts`
- `src/lib/webgl/geometry.ts`
- `src/lib/webgl/mat4.ts`
- `src/lib/webgl/renderer.ts`
- `src/lib/webgl/scenes.ts`
- `src/lib/whiteboard-ai.functions.ts`

### SQL

- `all_triggers.sql`
- `check_category2_counts.sql`
- `check_other_tables_rls.sql`
- `check_participants_view.sql`
- `check_profiles.sql`
- `check_rls_status.sql`
- `check_sessions_columns.sql`
- `check_sessions_data.sql`
- `check_table_counts.sql`
- `check_trigger.sql`
- `check_user_id.sql`
- `check_user_roles_data.sql`
- `current_sessions_policies.sql`
- `forum_posts_count.sql`
- `list_tables.sql`
- `site_content_data.sql`
- `tutor_apps_count.sql`
- `verify_profiles_policies.sql`
- `verify_rpcs.sql`
- `verify_sessions_policies.sql`
- `verify_user_roles_policies.sql`

### OTHER

- `bunfig.toml`
- `components.json`
- `eslint.config.js`
- `public/manifest.json`
- `scripts/start-node.mjs`
- `src/routeTree.gen.ts`
- `src/server.ts`
- `src/start.ts`
- `src/styles.css`
- `ZERO_META.json`

### DATABASE_INTEGRATION

- `src/integrations/supabase/auth-attacher.ts`
- `src/integrations/supabase/auth-middleware.ts`
- `src/integrations/supabase/client.server.ts`
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `supabase/.temp/linked-project.json`
- `supabase/config.toml`
- `supabase_schema.json`

### TESTING

- `inspect_policies_profiles.sql`
- `inspect_policies_sessions.sql`
- `inspect_policies_user_roles.sql`
- `inspect_profiles.sql`
- `inspect_sessions.sql`
- `inspect_user_roles.sql`
- `tests/room-access.test.ts`
- `tests/webhook-actions.test.ts`

### REACT_HOOK

- `src/hooks/use-agent.ts`
- `src/hooks/use-auth.tsx`
- `src/hooks/useClassroomRTC.ts`
- `src/hooks/use-entitlements.ts`
- `src/hooks/use-mobile.tsx`
- `src/hooks/use-platform-config.ts`
- `src/hooks/use-theme.tsx`

### DOCUMENTATION

- `architecture-inventory.md`
- `architecture-inventory-v2.md`
- `CATEGORY2_PRODUCTION_VERIFICATION_RESULT.md`
- `DEPLOYMENT.md`
- `GAP_REGISTER.md`
- `README.md`

### COMMERCE_PAYMENT

- `check_tutor_subscriptions.sql`
- `inspect_policies_tutor_subscriptions.sql`
- `inspect_tutor_subscriptions.sql`
- `verify_tutor_subscriptions_policies.sql`

### LEARNING_DOMAIN

- `inspect_policies_tutor_courses.sql`
- `inspect_tutor_courses.sql`
- `verify_tutor_courses_policies.sql`

### AUTHENTICATION_AUTHORIZATION

- `check_auth_users.sql`
- `check_auth_users_full.sql`

### AI

- `tests/ai-entitlement.test.ts`

### TYPESCRIPT_CONFIGURATION

- `tsconfig.json`

### BUILD_CONFIGURATION

- `vite.config.ts`

### PACKAGE_CONFIGURATION

- `package.json`

## 5. FILE ARCHITECTURE CATALOG

| File | Type | Size KB | Category | Route Candidate | Roles |
|---|---|---:|---|---|---|
| `all_triggers.sql` | `.sql` | 0.2 | SQL |  |  |
| `architecture-inventory.md` | `.md` | 53.8 | DOCUMENTATION |  |  |
| `architecture-inventory-v2.md` | `.md` | 165.8 | DOCUMENTATION |  |  |
| `bunfig.toml` | `.toml` | 0.2 | OTHER |  |  |
| `CATEGORY2_PRODUCTION_VERIFICATION_RESULT.md` | `.md` | 2.4 | DOCUMENTATION |  |  |
| `check_auth_users.sql` | `.sql` | 0.1 | AUTHENTICATION_AUTHORIZATION |  |  |
| `check_auth_users_full.sql` | `.sql` | 0.1 | AUTHENTICATION_AUTHORIZATION |  |  |
| `check_category2_counts.sql` | `.sql` | 0.5 | SQL |  |  |
| `check_other_tables_rls.sql` | `.sql` | 0.1 | SQL |  |  |
| `check_participants_view.sql` | `.sql` | 0.1 | SQL |  |  |
| `check_profiles.sql` | `.sql` | 0.1 | SQL |  |  |
| `check_rls_status.sql` | `.sql` | 0.2 | SQL |  |  |
| `check_sessions_columns.sql` | `.sql` | 0.1 | SQL |  |  |
| `check_sessions_data.sql` | `.sql` | 0 | SQL |  |  |
| `check_table_counts.sql` | `.sql` | 0.3 | SQL |  |  |
| `check_trigger.sql` | `.sql` | 0.2 | SQL |  |  |
| `check_tutor_subscriptions.sql` | `.sql` | 0 | COMMERCE_PAYMENT |  | TUTOR |
| `check_user_id.sql` | `.sql` | 0.1 | SQL |  |  |
| `check_user_roles_data.sql` | `.sql` | 0 | SQL |  |  |
| `components.json` | `.json` | 0.4 | OTHER |  |  |
| `current_sessions_policies.sql` | `.sql` | 0.1 | SQL |  |  |
| `DEPLOYMENT.md` | `.md` | 3.6 | DOCUMENTATION |  |  |
| `eslint.config.js` | `.js` | 1.2 | OTHER |  |  |
| `forum_posts_count.sql` | `.sql` | 0 | SQL |  |  |
| `GAP_REGISTER.md` | `.md` | 10.2 | DOCUMENTATION |  |  |
| `inspect_policies_profiles.sql` | `.sql` | 0.1 | TESTING |  |  |
| `inspect_policies_sessions.sql` | `.sql` | 0.1 | TESTING |  |  |
| `inspect_policies_tutor_courses.sql` | `.sql` | 0.1 | LEARNING_DOMAIN |  | TUTOR |
| `inspect_policies_tutor_subscriptions.sql` | `.sql` | 0.1 | COMMERCE_PAYMENT |  | TUTOR |
| `inspect_policies_user_roles.sql` | `.sql` | 0.1 | TESTING |  |  |
| `inspect_profiles.sql` | `.sql` | 0.1 | TESTING |  |  |
| `inspect_sessions.sql` | `.sql` | 0.1 | TESTING |  |  |
| `inspect_tutor_courses.sql` | `.sql` | 0.1 | LEARNING_DOMAIN |  | TUTOR |
| `inspect_tutor_subscriptions.sql` | `.sql` | 0.2 | COMMERCE_PAYMENT |  | TUTOR |
| `inspect_user_roles.sql` | `.sql` | 0.1 | TESTING |  |  |
| `list_tables.sql` | `.sql` | 0.1 | SQL |  |  |
| `package.json` | `.json` | 3.7 | PACKAGE_CONFIGURATION |  |  |
| `public/manifest.json` | `.json` | 0.5 | OTHER |  |  |
| `README.md` | `.md` | 0.1 | DOCUMENTATION |  |  |
| `scripts/start-node.mjs` | `.mjs` | 0.5 | OTHER |  |  |
| `site_content_data.sql` | `.sql` | 0 | SQL |  |  |
| `src/components/admin/AiKeyManager.tsx` | `.tsx` | 5.7 | UI_COMPONENT |  | ADMIN |
| `src/components/admin/AiProviderSelect.tsx` | `.tsx` | 2.2 | UI_COMPONENT |  | ADMIN |
| `src/components/admin/ConfigToggle.tsx` | `.tsx` | 2.3 | UI_COMPONENT |  | ADMIN |
| `src/components/ai/DiagramBlock.tsx` | `.tsx` | 2.3 | UI_COMPONENT |  |  |
| `src/components/ai/SaveToNotes.tsx` | `.tsx` | 1.8 | UI_COMPONENT |  |  |
| `src/components/ai/SmartMarkdown.tsx` | `.tsx` | 2.6 | UI_COMPONENT |  |  |
| `src/components/classroom/ActionBar.tsx` | `.tsx` | 9.5 | UI_COMPONENT |  |  |
| `src/components/classroom/AIAssistantPanel.tsx` | `.tsx` | 4.3 | UI_COMPONENT |  |  |
| `src/components/classroom/ClassroomChat.tsx` | `.tsx` | 3.8 | UI_COMPONENT |  |  |
| `src/components/classroom/ClassroomHeader.tsx` | `.tsx` | 3.3 | UI_COMPONENT |  |  |
| `src/components/classroom/ClassroomShell.tsx` | `.tsx` | 10.7 | UI_COMPONENT |  |  |
| `src/components/classroom/ClassroomStage.tsx` | `.tsx` | 2.7 | UI_COMPONENT |  |  |
| `src/components/classroom/DeviceSettingsDialog.tsx` | `.tsx` | 2.6 | UI_COMPONENT |  |  |
| `src/components/classroom/ParticipantsPanel.tsx` | `.tsx` | 4.1 | UI_COMPONENT |  |  |
| `src/components/classroom/SidePanel.tsx` | `.tsx` | 6.8 | UI_COMPONENT |  |  |
| `src/components/classroom/useSessionTimer.ts` | `.ts` | 0.7 | UI_COMPONENT |  |  |
| `src/components/classroom/VideoCard.tsx` | `.tsx` | 4.4 | UI_COMPONENT |  |  |
| `src/components/classroom/VideoLayout.tsx` | `.tsx` | 8.7 | UI_COMPONENT |  |  |
| `src/components/classroom/VideoStage.tsx` | `.tsx` | 2.5 | UI_COMPONENT |  |  |
| `src/components/ClassroomFiles.tsx` | `.tsx` | 5.1 | UI_COMPONENT |  |  |
| `src/components/dashboard/AdminHome.tsx` | `.tsx` | 22.3 | UI_COMPONENT |  | ADMIN |
| `src/components/dashboard/AppShell.tsx` | `.tsx` | 15.8 | UI_COMPONENT |  |  |
| `src/components/dashboard/CommandPalette.tsx` | `.tsx` | 3.2 | UI_COMPONENT |  |  |
| `src/components/dashboard/primitives.tsx` | `.tsx` | 4.2 | UI_COMPONENT |  |  |
| `src/components/dashboard/StudentHome.tsx` | `.tsx` | 20.7 | UI_COMPONENT |  | STUDENT |
| `src/components/dashboard/TutorHome.tsx` | `.tsx` | 21 | UI_COMPONENT |  | TUTOR |
| `src/components/home/HomeSections.tsx` | `.tsx` | 13.2 | UI_COMPONENT |  |  |
| `src/components/InstallPrompt.tsx` | `.tsx` | 3.6 | UI_COMPONENT |  |  |
| `src/components/lab3d/AmbientEmpty.tsx` | `.tsx` | 3.3 | UI_COMPONENT |  |  |
| `src/components/lab3d/GeoView.tsx` | `.tsx` | 3.5 | UI_COMPONENT |  |  |
| `src/components/lab3d/LanguageView.tsx` | `.tsx` | 3.1 | UI_COMPONENT |  |  |
| `src/components/lab3d/physics.ts` | `.ts` | 5.8 | UI_COMPONENT |  |  |
| `src/components/lab3d/ProcessView.tsx` | `.tsx` | 4.3 | UI_COMPONENT |  |  |
| `src/components/lab3d/Scene2D.tsx` | `.tsx` | 3.8 | UI_COMPONENT |  |  |
| `src/components/lab3d/SimChat.tsx` | `.tsx` | 4.4 | UI_COMPONENT |  |  |
| `src/components/lab3d/SimDispatch.tsx` | `.tsx` | 2.1 | UI_COMPONENT |  |  |
| `src/components/lab3d/SimScene.tsx` | `.tsx` | 8 | UI_COMPONENT |  |  |
| `src/components/lab3d/TimelineView.tsx` | `.tsx` | 2.5 | UI_COMPONENT |  |  |
| `src/components/LorddaLab.tsx` | `.tsx` | 11.2 | UI_COMPONENT |  |  |
| `src/components/MathTools.tsx` | `.tsx` | 8.2 | UI_COMPONENT |  |  |
| `src/components/MobileTabBar.tsx` | `.tsx` | 2.4 | UI_COMPONENT |  |  |
| `src/components/Navbar.tsx` | `.tsx` | 7 | UI_COMPONENT |  |  |
| `src/components/payments/PayButton.tsx` | `.tsx` | 1.9 | UI_COMPONENT |  |  |
| `src/components/ScheduleStudentCard.tsx` | `.tsx` | 4.9 | UI_COMPONENT |  | STUDENT |
| `src/components/ScopeGate.tsx` | `.tsx` | 1.5 | UI_COMPONENT |  |  |
| `src/components/ThreeDLab.tsx` | `.tsx` | 3 | UI_COMPONENT |  |  |
| `src/components/ui/accordion.tsx` | `.tsx` | 2 | UI_COMPONENT |  |  |
| `src/components/ui/alert.tsx` | `.tsx` | 1.6 | UI_COMPONENT |  |  |
| `src/components/ui/alert-dialog.tsx` | `.tsx` | 4.1 | UI_COMPONENT |  |  |
| `src/components/ui/aspect-ratio.tsx` | `.tsx` | 0.1 | UI_COMPONENT |  |  |
| `src/components/ui/avatar.tsx` | `.tsx` | 1.4 | UI_COMPONENT |  |  |
| `src/components/ui/badge.tsx` | `.tsx` | 1.1 | UI_COMPONENT |  |  |
| `src/components/ui/breadcrumb.tsx` | `.tsx` | 2.7 | UI_COMPONENT |  |  |
| `src/components/ui/button.tsx` | `.tsx` | 1.8 | UI_COMPONENT |  |  |
| `src/components/ui/calendar.tsx` | `.tsx` | 7 | UI_COMPONENT |  |  |
| `src/components/ui/card.tsx` | `.tsx` | 1.8 | UI_COMPONENT |  |  |
| `src/components/ui/carousel.tsx` | `.tsx` | 6.1 | UI_COMPONENT |  |  |
| `src/components/ui/chart.tsx` | `.tsx` | 10.3 | UI_COMPONENT |  |  |
| `src/components/ui/checkbox.tsx` | `.tsx` | 1 | UI_COMPONENT |  |  |
| `src/components/ui/collapsible.tsx` | `.tsx` | 0.3 | UI_COMPONENT |  |  |
| `src/components/ui/command.tsx` | `.tsx` | 4.8 | UI_COMPONENT |  |  |
| `src/components/ui/context-menu.tsx` | `.tsx` | 7.2 | UI_COMPONENT |  |  |
| `src/components/ui/dialog.tsx` | `.tsx` | 3.6 | UI_COMPONENT |  |  |
| `src/components/ui/drawer.tsx` | `.tsx` | 2.9 | UI_COMPONENT |  |  |
| `src/components/ui/dropdown-menu.tsx` | `.tsx` | 7.4 | UI_COMPONENT |  |  |
| `src/components/ui/form.tsx` | `.tsx` | 4.1 | UI_COMPONENT |  |  |
| `src/components/ui/hover-card.tsx` | `.tsx` | 1.2 | UI_COMPONENT |  |  |
| `src/components/ui/input.tsx` | `.tsx` | 0.8 | UI_COMPONENT |  |  |
| `src/components/ui/input-otp.tsx` | `.tsx` | 2.1 | UI_COMPONENT |  |  |
| `src/components/ui/label.tsx` | `.tsx` | 0.7 | UI_COMPONENT |  |  |
| `src/components/ui/menubar.tsx` | `.tsx` | 8.3 | UI_COMPONENT |  |  |
| `src/components/ui/navigation-menu.tsx` | `.tsx` | 5 | UI_COMPONENT |  |  |
| `src/components/ui/pagination.tsx` | `.tsx` | 2.7 | UI_COMPONENT |  |  |
| `src/components/ui/popover.tsx` | `.tsx` | 1.3 | UI_COMPONENT |  |  |
| `src/components/ui/progress.tsx` | `.tsx` | 0.8 | UI_COMPONENT |  |  |
| `src/components/ui/radio-group.tsx` | `.tsx` | 1.4 | UI_COMPONENT |  |  |
| `src/components/ui/resizable.tsx` | `.tsx` | 1.5 | UI_COMPONENT |  |  |
| `src/components/ui/scroll-area.tsx` | `.tsx` | 1.6 | UI_COMPONENT |  |  |
| `src/components/ui/select.tsx` | `.tsx` | 5.6 | UI_COMPONENT |  |  |
| `src/components/ui/separator.tsx` | `.tsx` | 0.7 | UI_COMPONENT |  |  |
| `src/components/ui/sheet.tsx` | `.tsx` | 4.1 | UI_COMPONENT |  |  |
| `src/components/ui/sidebar.tsx` | `.tsx` | 23.4 | UI_COMPONENT |  |  |
| `src/components/ui/skeleton.tsx` | `.tsx` | 0.2 | UI_COMPONENT |  |  |
| `src/components/ui/slider.tsx` | `.tsx` | 1 | UI_COMPONENT |  |  |
| `src/components/ui/sonner.tsx` | `.tsx` | 0.7 | UI_COMPONENT |  |  |
| `src/components/ui/switch.tsx` | `.tsx` | 1.1 | UI_COMPONENT |  |  |
| `src/components/ui/table.tsx` | `.tsx` | 2.8 | UI_COMPONENT |  |  |
| `src/components/ui/tabs.tsx` | `.tsx` | 1.9 | UI_COMPONENT |  |  |
| `src/components/ui/textarea.tsx` | `.tsx` | 0.7 | UI_COMPONENT |  |  |
| `src/components/ui/toggle.tsx` | `.tsx` | 1.5 | UI_COMPONENT |  |  |
| `src/components/ui/toggle-group.tsx` | `.tsx` | 1.7 | UI_COMPONENT |  |  |
| `src/components/ui/tooltip.tsx` | `.tsx` | 1.2 | UI_COMPONENT |  |  |
| `src/components/WebGLLab.tsx` | `.tsx` | 7.3 | UI_COMPONENT |  |  |
| `src/components/whiteboard/ai/ConvertButton.tsx` | `.tsx` | 3.6 | UI_COMPONENT |  |  |
| `src/components/whiteboard/ai/insertConversion.ts` | `.ts` | 8.4 | UI_COMPONENT |  |  |
| `src/components/whiteboard/canvas/engine.ts` | `.ts` | 4.4 | UI_COMPONENT |  |  |
| `src/components/whiteboard/canvas/exporter.ts` | `.ts` | 3.4 | UI_COMPONENT |  |  |
| `src/components/whiteboard/canvas/latex.ts` | `.ts` | 2.6 | UI_COMPONENT |  |  |
| `src/components/whiteboard/canvas/realtime.ts` | `.ts` | 2.5 | UI_COMPONENT |  |  |
| `src/components/whiteboard/canvas/renderer.ts` | `.ts` | 11.7 | UI_COMPONENT |  |  |
| `src/components/whiteboard/canvas/smooth.ts` | `.ts` | 1.4 | UI_COMPONENT |  |  |
| `src/components/whiteboard/canvas/Whiteboard.tsx` | `.tsx` | 56.7 | UI_COMPONENT |  |  |
| `src/components/whiteboard/collaboration/cursors.tsx` | `.tsx` | 1.1 | UI_COMPONENT |  |  |
| `src/components/whiteboard/index.ts` | `.ts` | 0.1 | UI_COMPONENT |  |  |
| `src/hooks/use-agent.ts` | `.ts` | 2.1 | REACT_HOOK |  |  |
| `src/hooks/use-auth.tsx` | `.tsx` | 2.1 | REACT_HOOK |  |  |
| `src/hooks/useClassroomRTC.ts` | `.ts` | 2.7 | REACT_HOOK |  |  |
| `src/hooks/use-entitlements.ts` | `.ts` | 1.2 | REACT_HOOK |  |  |
| `src/hooks/use-mobile.tsx` | `.tsx` | 0.6 | REACT_HOOK |  |  |
| `src/hooks/use-platform-config.ts` | `.ts` | 1.5 | REACT_HOOK |  |  |
| `src/hooks/use-theme.tsx` | `.tsx` | 1.1 | REACT_HOOK |  |  |
| `src/integrations/supabase/auth-attacher.ts` | `.ts` | 0.6 | DATABASE_INTEGRATION |  |  |
| `src/integrations/supabase/auth-middleware.ts` | `.ts` | 2.3 | DATABASE_INTEGRATION |  |  |
| `src/integrations/supabase/client.server.ts` | `.ts` | 1.7 | DATABASE_INTEGRATION |  |  |
| `src/integrations/supabase/client.ts` | `.ts` | 1.6 | DATABASE_INTEGRATION |  |  |
| `src/integrations/supabase/types.ts` | `.ts` | 81.8 | DATABASE_INTEGRATION |  |  |
| `src/lib/access.functions.ts` | `.ts` | 2.9 | LIBRARY |  |  |
| `src/lib/admin.functions.ts` | `.ts` | 3.6 | LIBRARY |  | ADMIN |
| `src/lib/agents/registry.server.ts` | `.ts` | 4.5 | LIBRARY |  |  |
| `src/lib/agents/run-agent.functions.ts` | `.ts` | 1.1 | LIBRARY |  |  |
| `src/lib/ai/keys.functions.ts` | `.ts` | 4.7 | LIBRARY |  |  |
| `src/lib/ai/provider.server.ts` | `.ts` | 9.2 | LIBRARY |  |  |
| `src/lib/ai-entitlement.ts` | `.ts` | 4.3 | LIBRARY |  |  |
| `src/lib/ai-tools.functions.ts` | `.ts` | 4.1 | LIBRARY |  |  |
| `src/lib/ai-tutor.functions.ts` | `.ts` | 6.9 | LIBRARY |  | TUTOR |
| `src/lib/booking-emails.functions.ts` | `.ts` | 3.9 | LIBRARY |  |  |
| `src/lib/classroom-rtc/index.ts` | `.ts` | 0.6 | LIBRARY |  |  |
| `src/lib/classroom-rtc/PeerToPeerRTCService.ts` | `.ts` | 16.7 | LIBRARY |  |  |
| `src/lib/classroom-rtc/types.ts` | `.ts` | 1.9 | LIBRARY |  |  |
| `src/lib/course-materials.functions.ts` | `.ts` | 2 | LIBRARY |  |  |
| `src/lib/email/enqueue.server.ts` | `.ts` | 4.3 | LIBRARY |  |  |
| `src/lib/email/provider.server.ts` | `.ts` | 4.8 | LIBRARY |  |  |
| `src/lib/email-templates/_shared.ts` | `.ts` | 0.9 | LIBRARY |  |  |
| `src/lib/email-templates/booking-confirmation.tsx` | `.tsx` | 2.6 | LIBRARY |  |  |
| `src/lib/email-templates/help-confirmation.tsx` | `.tsx` | 1.5 | LIBRARY |  |  |
| `src/lib/email-templates/help-new-ticket.tsx` | `.tsx` | 1.4 | LIBRARY |  |  |
| `src/lib/email-templates/registry.ts` | `.ts` | 0.5 | LIBRARY |  |  |
| `src/lib/email-templates/subscription-approved.tsx` | `.tsx` | 1.3 | LIBRARY |  |  |
| `src/lib/email-templates/subscription-rejected.tsx` | `.tsx` | 1.4 | LIBRARY |  |  |
| `src/lib/email-templates/welcome.tsx` | `.tsx` | 1.2 | LIBRARY |  |  |
| `src/lib/entitlements.functions.ts` | `.ts` | 0.5 | LIBRARY |  |  |
| `src/lib/error-capture.ts` | `.ts` | 0.9 | LIBRARY |  |  |
| `src/lib/error-page.ts` | `.ts` | 1.3 | LIBRARY |  |  |
| `src/lib/help.functions.ts` | `.ts` | 4.2 | LIBRARY |  |  |
| `src/lib/lab-modules.ts` | `.ts` | 15 | LIBRARY |  |  |
| `src/lib/payments/checkout.functions.ts` | `.ts` | 2.8 | LIBRARY |  |  |
| `src/lib/payments/paypal.server.ts` | `.ts` | 5.9 | LIBRARY |  |  |
| `src/lib/payments/router.server.ts` | `.ts` | 4.7 | ROUTING | YES |  |
| `src/lib/payments/webhook-actions.ts` | `.ts` | 2.2 | LIBRARY |  |  |
| `src/lib/room-access.ts` | `.ts` | 1.2 | LIBRARY |  |  |
| `src/lib/server/platform.ts` | `.ts` | 3.8 | LIBRARY |  |  |
| `src/lib/sim-chat.functions.ts` | `.ts` | 2.5 | LIBRARY |  |  |
| `src/lib/sim-lab.functions.ts` | `.ts` | 20 | LIBRARY |  |  |
| `src/lib/students.functions.ts` | `.ts` | 1.5 | LIBRARY |  | STUDENT |
| `src/lib/utils.ts` | `.ts` | 0.2 | LIBRARY |  |  |
| `src/lib/webgl/geometry.ts` | `.ts` | 3.2 | LIBRARY |  |  |
| `src/lib/webgl/mat4.ts` | `.ts` | 2.8 | LIBRARY |  |  |
| `src/lib/webgl/renderer.ts` | `.ts` | 4.3 | LIBRARY |  |  |
| `src/lib/webgl/scenes.ts` | `.ts` | 6.6 | LIBRARY |  |  |
| `src/lib/whiteboard-ai.functions.ts` | `.ts` | 3.6 | LIBRARY |  |  |
| `src/router.tsx` | `.tsx` | 0.4 | ROUTING | YES |  |
| `src/routes/__root.tsx` | `.tsx` | 4.8 | ROUTING | YES |  |
| `src/routes/_authenticated.tsx` | `.tsx` | 0.7 | ROUTING | YES |  |
| `src/routes/_authenticated/admin.ai.tsx` | `.tsx` | 1.4 | ROUTING | YES | ADMIN |
| `src/routes/_authenticated/admin.analytics.tsx` | `.tsx` | 4 | ROUTING | YES | ADMIN |
| `src/routes/_authenticated/admin.audit.tsx` | `.tsx` | 5.9 | ROUTING | YES | ADMIN |
| `src/routes/_authenticated/admin.classrooms.tsx` | `.tsx` | 1 | ROUTING | YES | ADMIN |
| `src/routes/_authenticated/admin.commissions.tsx` | `.tsx` | 10.4 | ROUTING | YES | ADMIN |
| `src/routes/_authenticated/admin.index.tsx` | `.tsx` | 30 | ROUTING | YES | ADMIN |
| `src/routes/_authenticated/admin.moderation.tsx` | `.tsx` | 2.7 | ROUTING | YES | ADMIN |
| `src/routes/_authenticated/admin.payments.tsx` | `.tsx` | 13.1 | ROUTING | YES | ADMIN |
| `src/routes/_authenticated/admin.payouts.tsx` | `.tsx` | 45.6 | ROUTING | YES | ADMIN |
| `src/routes/_authenticated/admin.plans.tsx` | `.tsx` | 13.7 | ROUTING | YES | ADMIN |
| `src/routes/_authenticated/admin.promotions.tsx` | `.tsx` | 7.2 | ROUTING | YES | ADMIN |
| `src/routes/_authenticated/admin.reports.tsx` | `.tsx` | 2.5 | ROUTING | YES | ADMIN |
| `src/routes/_authenticated/admin.students.tsx` | `.tsx` | 2.8 | ROUTING | YES | ADMIN, STUDENT |
| `src/routes/_authenticated/admin.tutors.tsx` | `.tsx` | 4.1 | ROUTING | YES | ADMIN, TUTOR |
| `src/routes/_authenticated/admin.whiteboard.tsx` | `.tsx` | 1.4 | ROUTING | YES | ADMIN |
| `src/routes/_authenticated/ai-tools.tsx` | `.tsx` | 8.2 | ROUTING | YES |  |
| `src/routes/_authenticated/ai-tutor.tsx` | `.tsx` | 9.8 | ROUTING | YES | TUTOR |
| `src/routes/_authenticated/assignments.tsx` | `.tsx` | 9 | ROUTING | YES |  |
| `src/routes/_authenticated/become-tutor.tsx` | `.tsx` | 13.2 | ROUTING | YES | TUTOR |
| `src/routes/_authenticated/book.$tutorId.tsx` | `.tsx` | 16.5 | ROUTING | YES | TUTOR |
| `src/routes/_authenticated/calendar.tsx` | `.tsx` | 6 | ROUTING | YES |  |
| `src/routes/_authenticated/certificate.tsx` | `.tsx` | 6.3 | ROUTING | YES |  |
| `src/routes/_authenticated/classroom.$roomId.tsx` | `.tsx` | 1.5 | ROUTING | YES |  |
| `src/routes/_authenticated/code.tsx` | `.tsx` | 5.2 | ROUTING | YES |  |
| `src/routes/_authenticated/courses.tsx` | `.tsx` | 16.5 | ROUTING | YES |  |
| `src/routes/_authenticated/dashboard.tsx` | `.tsx` | 45.9 | ROUTING | YES |  |
| `src/routes/_authenticated/labs.tsx` | `.tsx` | 4.4 | ROUTING | YES |  |
| `src/routes/_authenticated/labs_.simulation-lab.tsx` | `.tsx` | 23.8 | ROUTING | YES |  |
| `src/routes/_authenticated/lessons.tsx` | `.tsx` | 8.6 | ROUTING | YES |  |
| `src/routes/_authenticated/messages.tsx` | `.tsx` | 7.7 | ROUTING | YES |  |
| `src/routes/_authenticated/my-courses.tsx` | `.tsx` | 4.2 | ROUTING | YES |  |
| `src/routes/_authenticated/notes.tsx` | `.tsx` | 6.4 | ROUTING | YES |  |
| `src/routes/_authenticated/notifications.tsx` | `.tsx` | 3.9 | ROUTING | YES |  |
| `src/routes/_authenticated/parent.children.tsx` | `.tsx` | 7.3 | ROUTING | YES | PARENT |
| `src/routes/_authenticated/parent.tsx` | `.tsx` | 5.6 | ROUTING | YES | PARENT |
| `src/routes/_authenticated/pay-tutor.tsx` | `.tsx` | 6.4 | ROUTING | YES | TUTOR |
| `src/routes/_authenticated/records.tsx` | `.tsx` | 4.8 | ROUTING | YES |  |
| `src/routes/_authenticated/resources.tsx` | `.tsx` | 6.9 | ROUTING | YES |  |
| `src/routes/_authenticated/settings.tsx` | `.tsx` | 11.5 | ROUTING | YES |  |
| `src/routes/_authenticated/tutor.availability.tsx` | `.tsx` | 7.4 | ROUTING | YES | TUTOR |
| `src/routes/_authenticated/tutor.holidays.tsx` | `.tsx` | 4.2 | ROUTING | YES | TUTOR |
| `src/routes/_authenticated/wallet.tsx` | `.tsx` | 8.2 | ROUTING | YES |  |
| `src/routes/_authenticated/whiteboard-review.$sessionId.tsx` | `.tsx` | 1.3 | ROUTING | YES |  |
| `src/routes/api/checkout/return.tsx` | `.tsx` | 3.8 | ROUTING | YES |  |
| `src/routes/api/public/webhooks/paypal.ts` | `.ts` | 3 | ROUTING | YES |  |
| `src/routes/auth.tsx` | `.tsx` | 6.8 | ROUTING | YES |  |
| `src/routes/checkout.cancelled.tsx` | `.tsx` | 0.7 | ROUTING | YES |  |
| `src/routes/checkout.failed.tsx` | `.tsx` | 1.2 | ROUTING | YES |  |
| `src/routes/checkout.success.tsx` | `.tsx` | 0.7 | ROUTING | YES |  |
| `src/routes/community.tsx` | `.tsx` | 9.6 | ROUTING | YES |  |
| `src/routes/email/unsubscribe.ts` | `.ts` | 5.3 | ROUTING | YES |  |
| `src/routes/help.tsx` | `.tsx` | 3.6 | ROUTING | YES |  |
| `src/routes/index.tsx` | `.tsx` | 14.3 | ROUTING | YES |  |
| `src/routes/leaderboard.tsx` | `.tsx` | 4.7 | ROUTING | YES |  |
| `src/routes/tutor.$id.tsx` | `.tsx` | 7.9 | ROUTING | YES | TUTOR |
| `src/routes/tutors.tsx` | `.tsx` | 12.8 | ROUTING | YES | TUTOR |
| `src/routes/unsubscribe.tsx` | `.tsx` | 3.2 | ROUTING | YES |  |
| `src/routeTree.gen.ts` | `.ts` | 52.1 | OTHER |  |  |
| `src/server.ts` | `.ts` | 0.4 | OTHER |  |  |
| `src/start.ts` | `.ts` | 0.8 | OTHER |  |  |
| `src/styles.css` | `.css` | 7.9 | OTHER |  |  |
| `supabase/.temp/linked-project.json` | `.json` | 0.2 | DATABASE_INTEGRATION |  |  |
| `supabase/config.toml` | `.toml` | 0 | DATABASE_INTEGRATION |  |  |
| `supabase/migrations/20260518180453_b7b6b188-b2f9-4a6e-8317-5f8fd52bffac.sql` | `.sql` | 4.6 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260518180507_8749a32b-dc91-4e11-b9de-8107bc6e9a43.sql` | `.sql` | 0.3 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260518180559_079a0331-844f-4a93-af54-df8c3b16c8ff.sql` | `.sql` | 0.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260520134733_17b373c0-0c07-41a8-a4e7-7a2d37738f9b.sql` | `.sql` | 0.9 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260521120359_e0e495a3-e6c6-4d8c-9376-6aab3bcb158c.sql` | `.sql` | 1.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260521120426_f8a86ba3-535c-4a9b-9c14-d92ffe33f02c.sql` | `.sql` | 1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260521120758_573f01a8-70c7-4bea-904d-df0f39bd7928.sql` | `.sql` | 1.8 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522062230_43125182-8270-4977-9b19-ccf05619dfc1.sql` | `.sql` | 1.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522073549_72500aff-965a-49a8-b3ab-2239c850168b.sql` | `.sql` | 2.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522080609_f51f3676-392c-4338-9bf9-df9c105ace54.sql` | `.sql` | 1.2 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522081314_e4dfd053-8a0b-4f10-b201-0bf7b8ed2693.sql` | `.sql` | 0 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522083220_390d842b-0b64-43c7-b5e6-c87b5c7fd60f.sql` | `.sql` | 4 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522085703_b8342121-277e-478e-9c42-e2786a56c7c3.sql` | `.sql` | 1.6 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522085716_cae43fa7-ce66-4c10-81a1-e0f4588a6e75.sql` | `.sql` | 0.4 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522092853_email_infra.sql` | `.sql` | 11.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522092905_email_infra.sql` | `.sql` | 11.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522093122_email_infra.sql` | `.sql` | 11.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522105704_683e0c7c-3a9f-4da8-822e-a34d221a36f2.sql` | `.sql` | 1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522110136_e7689ab4-ce46-4391-8a25-1cc5f1eb3a9d.sql` | `.sql` | 3.7 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522113118_7b053bf2-58a5-48b8-8dbe-dbb0583cf4a1.sql` | `.sql` | 2.8 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260522120800_fe282aa0-ce58-4c5b-a14a-79b180215e97.sql` | `.sql` | 1.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260523081725_04e83f6c-dd2a-4938-9b33-3e24fa61ed29.sql` | `.sql` | 1.5 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260523083334_1bbbc501-2402-4d07-a676-38c68d2d1f0b.sql` | `.sql` | 0.6 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524041428_148987e9-23da-47fa-8182-294dcfc9400c.sql` | `.sql` | 1.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524041718_e722d83c-5457-4ec3-b7b6-c6e8be29c3df.sql` | `.sql` | 2.3 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524041736_08febb8a-724f-4196-9c78-0b3d6784c153.sql` | `.sql` | 0 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524042040_6fd4de5c-4856-4bbc-a86b-eda4026f5bff.sql` | `.sql` | 0.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524042244_6ecb8491-343f-435d-9189-c0e2483ea230.sql` | `.sql` | 5.5 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524042859_808cd5c3-c692-4ca0-b22d-e5359b17464c.sql` | `.sql` | 0.3 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524043637_d17d6f91-84c3-45ff-af6b-648a666f715d.sql` | `.sql` | 2 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524044641_c5814e6b-fe15-459d-96b0-746ba98fdc2c.sql` | `.sql` | 1.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524044744_email_infra.sql` | `.sql` | 11.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524051514_1878b3e2-125a-46eb-a789-fa1409028e71.sql` | `.sql` | 2 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524064757_b2d8e9c2-2d6e-4b76-8a73-dd3c1987a2ae.sql` | `.sql` | 1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524065325_6df81ffd-fb2e-4df8-ac71-5b5f8cd92554.sql` | `.sql` | 0.8 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524070449_ae8130d6-d9a2-4437-8dd0-73c2893185b3.sql` | `.sql` | 3.3 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260524074439_b5bca5df-a7ce-40c8-a931-d1e64321d7b5.sql` | `.sql` | 0.5 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260525125039_8673bafb-4eda-434f-9900-1a4c688ab424.sql` | `.sql` | 0.9 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260528060818_02ef6fb2-553e-43f1-900a-bd8eb4dd56af.sql` | `.sql` | 0.3 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260530152504_b823d221-b60a-432b-85ac-0745a79e9d55.sql` | `.sql` | 8.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260601045818_f63dbd87-f3a0-4e98-8232-d380ac4a68f6.sql` | `.sql` | 6.4 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260605061006_40c146b5-f458-4620-a3ed-688348719a19.sql` | `.sql` | 2.9 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260611082303_c77aeed1-ee3d-4917-983d-abc4f0e52ceb.sql` | `.sql` | 3.2 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260620193809_e7f89819-b8cc-4e85-9441-39e6b31e579d.sql` | `.sql` | 3.8 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260620193831_7e7a3f45-9cbe-4ad4-91c4-0884121a0b3a.sql` | `.sql` | 1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260622125739_8a71ad77-3504-43d2-92b4-3fedd6b2a91e.sql` | `.sql` | 17.7 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260622125757_eabc3c74-3adb-4b2a-bb50-d98a2da0a202.sql` | `.sql` | 0.6 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260622133155_c56722d8-1a65-4287-bf95-1c06689bba3f.sql` | `.sql` | 8.7 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260623074007_ddbe3e51-097a-4763-af33-95b236a42698.sql` | `.sql` | 1.7 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260623075231_4c324342-ee6b-47fa-ad48-39af2516c21c.sql` | `.sql` | 1.9 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260623082025_9963a138-6dc4-4d83-8b63-3cd31e3a7504.sql` | `.sql` | 24.3 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260623082050_70d58ecc-f89e-48ad-9e55-0d5e10f677f2.sql` | `.sql` | 1.2 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260623082342_5be4ee4e-9845-45f8-b995-dace190d24f1.sql` | `.sql` | 1.9 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260623100541_29ade4ae-9cc6-46bf-a916-ba9ecf155ff3.sql` | `.sql` | 6 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260623102100_68bc0646-a669-4dd9-9ba7-4cdb16225116.sql` | `.sql` | 1.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260623111535_6dc2ecd4-5f71-421a-a372-bd125820c267.sql` | `.sql` | 7.6 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260623113448_5862c988-44e2-423a-8dce-ff55c49cf774.sql` | `.sql` | 2 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260623114741_9a1edb8d-58ea-4825-8560-ba68d6527ab9.sql` | `.sql` | 0.5 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260623121121_6dd82a2e-a01a-42c2-a505-12240ec66391.sql` | `.sql` | 4.4 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260701082250_cc8fecf7-8ce5-4d5e-971b-0bad7a33e4e9.sql` | `.sql` | 1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260701084425_090d5165-a08f-4cce-ba0a-56620c1578d1.sql` | `.sql` | 0.7 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260811090000_29d8fece-92c9-4bab-a85f-e95d49161abf.sql` | `.sql` | 0.8 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260812060000_p0_security_fixes.sql` | `.sql` | 17.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260812100000_close_session_insert_bypass.sql` | `.sql` | 0.6 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260812120000_restore_whiteboard_chat_tables.sql` | `.sql` | 6.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260812130000_harden_rpc_grants_and_guards.sql` | `.sql` | 11.7 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260812140000_revoke_public_execute_grants.sql` | `.sql` | 2.7 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260812150000_align_booking_gate_with_subscriptions_flag.sql` | `.sql` | 5.6 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260813090000_add_rls_profiles_user_roles_policies.sql` | `.sql` | 3.1 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260814090000_add_rls_admin_operations_policies.sql` | `.sql` | 3.1 | DATABASE_MIGRATION |  | ADMIN |
| `supabase/migrations/20260814140000_add_rls_entitlement_gates_beyond_book_session.sql` | `.sql` | 1.9 | DATABASE_MIGRATION |  |  |
| `supabase/migrations/20260815090000_add_rls_tutor_app_promotion_validation.sql` | `.sql` | 4.1 | DATABASE_MIGRATION |  | TUTOR |
| `supabase/migrations/20260815140000_add_rls_parent_role_policies.sql` | `.sql` | 6.1 | DATABASE_MIGRATION |  | PARENT |
| `supabase_schema.json` | `.json` | 0.5 | DATABASE_INTEGRATION |  |  |
| `tests/ai-entitlement.test.ts` | `.ts` | 4.9 | AI |  |  |
| `tests/room-access.test.ts` | `.ts` | 2.5 | TESTING |  |  |
| `tests/webhook-actions.test.ts` | `.ts` | 2.7 | TESTING |  |  |
| `tsconfig.json` | `.json` | 0.7 | TYPESCRIPT_CONFIGURATION |  |  |
| `tutor_apps_count.sql` | `.sql` | 0.1 | SQL |  | TUTOR |
| `verify_profiles_policies.sql` | `.sql` | 0.1 | SQL |  |  |
| `verify_rpcs.sql` | `.sql` | 0.2 | SQL |  |  |
| `verify_sessions_policies.sql` | `.sql` | 0.1 | SQL |  |  |
| `verify_tutor_courses_policies.sql` | `.sql` | 0.1 | LEARNING_DOMAIN |  | TUTOR |
| `verify_tutor_subscriptions_policies.sql` | `.sql` | 0.1 | COMMERCE_PAYMENT |  | TUTOR |
| `verify_user_roles_policies.sql` | `.sql` | 0.1 | SQL |  |  |
| `vite.config.ts` | `.ts` | 3.8 | BUILD_CONFIGURATION |  |  |
| `ZERO_META.json` | `.json` | 5 | OTHER |  |  |

## 6. INTERNAL DEPENDENCY GRAPH

> Only repository-local import relationships are represented.
> External package imports are deliberately omitted.

| From | Imports |
|---|---|
| `src/components/admin/AiKeyManager.tsx` | @/components/ui/badge<br>@/components/ui/button<br>@/components/ui/input<br>@/components/ui/label<br>@/lib/ai/keys.functions |
| `src/components/admin/AiProviderSelect.tsx` | @/components/ui/label<br>@/components/ui/select<br>@/hooks/use-platform-config<br>@/integrations/supabase/client |
| `src/components/admin/ConfigToggle.tsx` | @/components/ui/button<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/switch<br>@/hooks/use-platform-config<br>@/integrations/supabase/client |
| `src/components/ai/SaveToNotes.tsx` | @/components/ui/button<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/components/ai/SmartMarkdown.tsx` | ./DiagramBlock<br>@/lib/utils |
| `src/components/classroom/ActionBar.tsx` | ./ClassroomStage<br>./VideoLayout<br>@/components/ui/button<br>@/components/ui/popover<br>@/hooks/use-mobile |
| `src/components/classroom/AIAssistantPanel.tsx` | @/components/ai/SmartMarkdown<br>@/components/ui/button<br>@/components/ui/textarea<br>@/hooks/use-agent<br>@/lib/utils |
| `src/components/classroom/ClassroomChat.tsx` | @/components/ui/button<br>@/components/ui/input<br>@/integrations/supabase/client |
| `src/components/classroom/ClassroomHeader.tsx` | ./useSessionTimer<br>@/components/ui/button<br>@/lib/classroom-rtc |
| `src/components/classroom/ClassroomShell.tsx` | ./ActionBar<br>./ClassroomHeader<br>./ClassroomStage<br>./DeviceSettingsDialog<br>./SidePanel<br>./VideoLayout<br>@/components/ui/button<br>@/components/ui/sheet<br>@/hooks/useClassroomRTC<br>@/hooks/use-mobile<br>@/lib/lab-modules |
| `src/components/classroom/ClassroomStage.tsx` | @/components/LorddaLab<br>@/components/whiteboard |
| `src/components/classroom/DeviceSettingsDialog.tsx` | @/components/ui/dialog<br>@/components/ui/label<br>@/lib/classroom-rtc |
| `src/components/classroom/ParticipantsPanel.tsx` | @/components/ui/button<br>@/integrations/supabase/client<br>@/lib/classroom-rtc/types |
| `src/components/classroom/SidePanel.tsx` | ./AIAssistantPanel<br>./ClassroomChat<br>@/components/ClassroomFiles<br>@/components/ui/button<br>@/components/ui/tabs<br>@/integrations/supabase/client |
| `src/components/classroom/VideoCard.tsx` | @/lib/classroom-rtc |
| `src/components/classroom/VideoLayout.tsx` | ./VideoCard<br>@/lib/classroom-rtc |
| `src/components/classroom/VideoStage.tsx` | ./VideoCard<br>@/lib/classroom-rtc |
| `src/components/ClassroomFiles.tsx` | @/components/ui/button<br>@/components/ui/tabs<br>@/integrations/supabase/client |
| `src/components/dashboard/AdminHome.tsx` | @/components/ui/alert-dialog<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/checkbox<br>@/components/ui/switch<br>@/components/ui/textarea<br>@/integrations/supabase/client |
| `src/components/dashboard/AppShell.tsx` | @/assets/logo.png<br>@/components/dashboard/CommandPalette<br>@/components/ui/avatar<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/dropdown-menu<br>@/components/ui/sidebar<br>@/hooks/use-auth<br>@/hooks/use-theme<br>@/integrations/supabase/client<br>@/lib/utils |
| `src/components/dashboard/CommandPalette.tsx` | @/components/ui/command |
| `src/components/dashboard/primitives.tsx` | @/lib/utils |
| `src/components/dashboard/StudentHome.tsx` | @/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/components/dashboard/TutorHome.tsx` | @/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/progress<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/components/home/HomeSections.tsx` | @/components/ui/accordion<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card |
| `src/components/InstallPrompt.tsx` | @/components/ui/button |
| `src/components/lab3d/GeoView.tsx` | @/lib/sim-lab.functions |
| `src/components/lab3d/LanguageView.tsx` | @/lib/sim-lab.functions |
| `src/components/lab3d/physics.ts` | @/lib/sim-lab.functions |
| `src/components/lab3d/ProcessView.tsx` | @/lib/sim-lab.functions |
| `src/components/lab3d/Scene2D.tsx` | @/lib/sim-lab.functions |
| `src/components/lab3d/SimChat.tsx` | @/components/ui/button<br>@/components/ui/input<br>@/lib/sim-chat.functions<br>@/lib/sim-lab.functions |
| `src/components/lab3d/SimDispatch.tsx` | ./GeoView<br>./LanguageView<br>./ProcessView<br>./Scene2D<br>./TimelineView<br>@/lib/sim-lab.functions |
| `src/components/lab3d/SimScene.tsx` | ./physics<br>@/lib/sim-lab.functions |
| `src/components/lab3d/TimelineView.tsx` | @/lib/sim-lab.functions |
| `src/components/LorddaLab.tsx` | @/components/ui/button<br>@/components/ui/input<br>@/components/ui/select<br>@/integrations/supabase/client<br>@/lib/lab-modules |
| `src/components/MathTools.tsx` | @/components/ui/button<br>@/components/ui/tabs |
| `src/components/MobileTabBar.tsx` | @/hooks/use-auth |
| `src/components/Navbar.tsx` | @/assets/logo.png<br>@/components/ui/button<br>@/hooks/use-auth<br>@/hooks/use-theme<br>@/integrations/supabase/client |
| `src/components/payments/PayButton.tsx` | @/components/ui/button<br>@/lib/payments/checkout.functions |
| `src/components/ScheduleStudentCard.tsx` | @/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/select<br>@/integrations/supabase/client<br>@/lib/booking-emails.functions<br>@/lib/students.functions |
| `src/components/ScopeGate.tsx` | @/components/ui/button<br>@/components/ui/card<br>@/hooks/use-entitlements<br>@/lib/entitlements.functions |
| `src/components/ThreeDLab.tsx` | @/components/ui/button |
| `src/components/ui/accordion.tsx` | @/lib/utils |
| `src/components/ui/alert.tsx` | @/lib/utils |
| `src/components/ui/alert-dialog.tsx` | @/components/ui/button<br>@/lib/utils |
| `src/components/ui/avatar.tsx` | @/lib/utils |
| `src/components/ui/badge.tsx` | @/lib/utils |
| `src/components/ui/breadcrumb.tsx` | @/lib/utils |
| `src/components/ui/button.tsx` | @/lib/utils |
| `src/components/ui/calendar.tsx` | @/components/ui/button<br>@/lib/utils |
| `src/components/ui/card.tsx` | @/lib/utils |
| `src/components/ui/carousel.tsx` | @/components/ui/button<br>@/lib/utils |
| `src/components/ui/chart.tsx` | @/lib/utils |
| `src/components/ui/checkbox.tsx` | @/lib/utils |
| `src/components/ui/command.tsx` | @/components/ui/dialog<br>@/lib/utils |
| `src/components/ui/context-menu.tsx` | @/lib/utils |
| `src/components/ui/dialog.tsx` | @/lib/utils |
| `src/components/ui/drawer.tsx` | @/lib/utils |
| `src/components/ui/dropdown-menu.tsx` | @/lib/utils |
| `src/components/ui/form.tsx` | @/components/ui/label<br>@/lib/utils |
| `src/components/ui/hover-card.tsx` | @/lib/utils |
| `src/components/ui/input.tsx` | @/lib/utils |
| `src/components/ui/input-otp.tsx` | @/lib/utils |
| `src/components/ui/label.tsx` | @/lib/utils |
| `src/components/ui/menubar.tsx` | @/lib/utils |
| `src/components/ui/navigation-menu.tsx` | @/lib/utils |
| `src/components/ui/pagination.tsx` | @/components/ui/button<br>@/lib/utils |
| `src/components/ui/popover.tsx` | @/lib/utils |
| `src/components/ui/progress.tsx` | @/lib/utils |
| `src/components/ui/radio-group.tsx` | @/lib/utils |
| `src/components/ui/resizable.tsx` | @/lib/utils |
| `src/components/ui/scroll-area.tsx` | @/lib/utils |
| `src/components/ui/select.tsx` | @/lib/utils |
| `src/components/ui/separator.tsx` | @/lib/utils |
| `src/components/ui/sheet.tsx` | @/lib/utils |
| `src/components/ui/sidebar.tsx` | @/components/ui/button<br>@/components/ui/input<br>@/components/ui/separator<br>@/components/ui/sheet<br>@/components/ui/skeleton<br>@/components/ui/tooltip<br>@/hooks/use-mobile<br>@/lib/utils |
| `src/components/ui/skeleton.tsx` | @/lib/utils |
| `src/components/ui/slider.tsx` | @/lib/utils |
| `src/components/ui/switch.tsx` | @/lib/utils |
| `src/components/ui/table.tsx` | @/lib/utils |
| `src/components/ui/tabs.tsx` | @/lib/utils |
| `src/components/ui/textarea.tsx` | @/lib/utils |
| `src/components/ui/toggle.tsx` | @/lib/utils |
| `src/components/ui/toggle-group.tsx` | @/components/ui/toggle<br>@/lib/utils |
| `src/components/ui/tooltip.tsx` | @/lib/utils |
| `src/components/WebGLLab.tsx` | @/components/ui/button<br>@/lib/webgl/mat4<br>@/lib/webgl/renderer<br>@/lib/webgl/scenes |
| `src/components/whiteboard/ai/ConvertButton.tsx` | ../canvas/engine<br>../canvas/Whiteboard<br>./insertConversion<br>@/components/ui/button<br>@/lib/whiteboard-ai.functions |
| `src/components/whiteboard/ai/insertConversion.ts` | ../canvas/engine<br>../canvas/latex |
| `src/components/whiteboard/canvas/exporter.ts` | ./engine<br>./renderer |
| `src/components/whiteboard/canvas/realtime.ts` | ./engine<br>@/integrations/supabase/client |
| `src/components/whiteboard/canvas/renderer.ts` | ./engine |
| `src/components/whiteboard/canvas/Whiteboard.tsx` | ../ai/ConvertButton<br>../collaboration/cursors<br>./engine<br>./exporter<br>./realtime<br>./renderer<br>./smooth<br>@/components/ui/button<br>@/components/ui/popover<br>@/hooks/use-mobile<br>@/integrations/supabase/client |
| `src/components/whiteboard/collaboration/cursors.tsx` | ../canvas/realtime |
| `src/components/whiteboard/index.ts` | ./canvas/Whiteboard |
| `src/hooks/use-agent.ts` | @/lib/agents/run-agent.functions |
| `src/hooks/use-auth.tsx` | @/integrations/supabase/client |
| `src/hooks/useClassroomRTC.ts` | @/lib/classroom-rtc |
| `src/hooks/use-entitlements.ts` | @/hooks/use-auth<br>@/hooks/use-platform-config<br>@/lib/entitlements.functions |
| `src/hooks/use-platform-config.ts` | @/integrations/supabase/client |
| `src/integrations/supabase/auth-attacher.ts` | ./client |
| `src/integrations/supabase/auth-middleware.ts` | ./types |
| `src/integrations/supabase/client.server.ts` | ./types<br>@/integrations/supabase/client.server |
| `src/integrations/supabase/client.ts` | ./types<br>@/integrations/supabase/client |
| `src/lib/access.functions.ts` | @/integrations/supabase/auth-middleware<br>@/integrations/supabase/types<br>@/lib/room-access |
| `src/lib/admin.functions.ts` | @/integrations/supabase/auth-middleware<br>@/integrations/supabase/client.server |
| `src/lib/agents/run-agent.functions.ts` | @/integrations/supabase/auth-middleware<br>@/lib/ai-entitlement |
| `src/lib/ai/keys.functions.ts` | @/integrations/supabase/auth-middleware |
| `src/lib/ai-entitlement.ts` | @/integrations/supabase/types |
| `src/lib/ai-tools.functions.ts` | @/integrations/supabase/auth-middleware<br>@/lib/ai-entitlement |
| `src/lib/ai-tutor.functions.ts` | @/integrations/supabase/auth-middleware<br>@/lib/ai-entitlement |
| `src/lib/booking-emails.functions.ts` | @/integrations/supabase/auth-middleware<br>@/integrations/supabase/client.server |
| `src/lib/classroom-rtc/index.ts` | ./PeerToPeerRTCService<br>./types |
| `src/lib/classroom-rtc/PeerToPeerRTCService.ts` | ./types<br>@/integrations/supabase/client |
| `src/lib/course-materials.functions.ts` | @/integrations/supabase/auth-middleware |
| `src/lib/email/enqueue.server.ts` | @/integrations/supabase/client.server<br>@/lib/email/provider.server<br>@/lib/email-templates/registry |
| `src/lib/email-templates/booking-confirmation.tsx` | ./registry |
| `src/lib/email-templates/help-confirmation.tsx` | ./_shared<br>./registry |
| `src/lib/email-templates/help-new-ticket.tsx` | ./_shared<br>./registry |
| `src/lib/email-templates/registry.ts` | ./booking-confirmation |
| `src/lib/email-templates/subscription-approved.tsx` | ./_shared<br>./registry |
| `src/lib/email-templates/subscription-rejected.tsx` | ./_shared<br>./registry |
| `src/lib/email-templates/welcome.tsx` | ./_shared<br>./registry |
| `src/lib/entitlements.functions.ts` | @/integrations/supabase/auth-middleware |
| `src/lib/help.functions.ts` | @/integrations/supabase/auth-middleware<br>@/integrations/supabase/client.server<br>@/lib/email/enqueue.server |
| `src/lib/payments/checkout.functions.ts` | @/integrations/supabase/auth-middleware |
| `src/lib/payments/router.server.ts` | ./paypal.server |
| `src/lib/server/platform.ts` | ./dist/server/platform.js<br>@/lib/error-capture<br>@/lib/error-page<br>@/lib/server/platform |
| `src/lib/sim-chat.functions.ts` | @/integrations/supabase/auth-middleware<br>@/lib/ai-entitlement |
| `src/lib/sim-lab.functions.ts` | @/integrations/supabase/auth-middleware<br>@/lib/ai-entitlement |
| `src/lib/students.functions.ts` | @/integrations/supabase/auth-middleware<br>@/integrations/supabase/client.server |
| `src/lib/webgl/renderer.ts` | ./geometry<br>./mat4 |
| `src/lib/webgl/scenes.ts` | ./geometry<br>./mat4<br>./renderer |
| `src/lib/whiteboard-ai.functions.ts` | @/integrations/supabase/auth-middleware<br>@/lib/ai-entitlement |
| `src/router.tsx` | ./routeTree.gen |
| `src/routes/__root.tsx` | ../styles.css?url<br>@/components/InstallPrompt<br>@/components/MobileTabBar<br>@/components/ui/sonner<br>@/hooks/use-auth<br>@/hooks/use-theme |
| `src/routes/_authenticated.tsx` | @/components/dashboard/AppShell<br>@/hooks/use-auth |
| `src/routes/_authenticated/admin.ai.tsx` | @/components/admin/AiKeyManager<br>@/components/admin/AiProviderSelect<br>@/components/admin/ConfigToggle<br>@/components/dashboard/primitives<br>@/lib/access.functions |
| `src/routes/_authenticated/admin.analytics.tsx` | @/components/dashboard/primitives<br>@/components/ui/card<br>@/integrations/supabase/client<br>@/lib/access.functions |
| `src/routes/_authenticated/admin.audit.tsx` | @/components/dashboard/primitives<br>@/components/ui/badge<br>@/components/ui/card<br>@/lib/access.functions |
| `src/routes/_authenticated/admin.classrooms.tsx` | @/components/admin/ConfigToggle<br>@/components/dashboard/primitives<br>@/lib/access.functions |
| `src/routes/_authenticated/admin.commissions.tsx` | @/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/dialog<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/select<br>@/components/ui/switch<br>@/components/ui/textarea<br>@/integrations/supabase/client<br>@/lib/access.functions |
| `src/routes/_authenticated/admin.index.tsx` | @/components/Navbar<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/select<br>@/components/ui/switch<br>@/components/ui/tabs<br>@/components/ui/textarea<br>@/hooks/use-auth<br>@/integrations/supabase/client<br>@/lib/access.functions<br>@/lib/admin.functions<br>@/lib/help.functions |
| `src/routes/_authenticated/admin.moderation.tsx` | @/components/dashboard/primitives<br>@/components/ui/button<br>@/components/ui/card<br>@/integrations/supabase/client<br>@/lib/access.functions |
| `src/routes/_authenticated/admin.payments.tsx` | @/components/dashboard/primitives<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/dialog<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/select<br>@/components/ui/tabs<br>@/components/ui/textarea<br>@/integrations/supabase/client<br>@/lib/access.functions |
| `src/routes/_authenticated/admin.payouts.tsx` | @/components/dashboard/primitives<br>@/components/ui/alert-dialog<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/dialog<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/switch<br>@/components/ui/tabs<br>@/components/ui/textarea<br>@/integrations/supabase/client<br>@/lib/access.functions |
| `src/routes/_authenticated/admin.plans.tsx` | @/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/dialog<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/select<br>@/components/ui/switch<br>@/components/ui/textarea<br>@/integrations/supabase/client<br>@/lib/access.functions |
| `src/routes/_authenticated/admin.promotions.tsx` | @/components/dashboard/primitives<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/select<br>@/hooks/use-auth<br>@/integrations/supabase/client<br>@/lib/access.functions |
| `src/routes/_authenticated/admin.reports.tsx` | @/components/dashboard/primitives<br>@/components/ui/badge<br>@/components/ui/card<br>@/integrations/supabase/client<br>@/lib/access.functions |
| `src/routes/_authenticated/admin.students.tsx` | @/components/dashboard/primitives<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/lib/access.functions<br>@/lib/admin.functions |
| `src/routes/_authenticated/admin.tutors.tsx` | @/components/dashboard/primitives<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/integrations/supabase/client<br>@/lib/access.functions |
| `src/routes/_authenticated/admin.whiteboard.tsx` | @/components/admin/ConfigToggle<br>@/components/dashboard/primitives<br>@/lib/access.functions |
| `src/routes/_authenticated/ai-tools.tsx` | @/components/ai/SaveToNotes<br>@/components/ai/SmartMarkdown<br>@/components/ScopeGate<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/textarea<br>@/lib/ai-tools.functions |
| `src/routes/_authenticated/ai-tutor.tsx` | @/components/ai/SaveToNotes<br>@/components/ai/SmartMarkdown<br>@/components/ScopeGate<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/textarea<br>@/lib/ai-tutor.functions |
| `src/routes/_authenticated/assignments.tsx` | @/components/dashboard/primitives<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/dialog<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/select<br>@/components/ui/textarea<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/become-tutor.tsx` | @/components/Navbar<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/textarea<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/book.$tutorId.tsx` | @/components/dashboard/primitives<br>@/components/ScopeGate<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/dialog<br>@/components/ui/label<br>@/components/ui/select<br>@/hooks/use-auth<br>@/integrations/supabase/client<br>@/lib/booking-emails.functions<br>@/lib/utils |
| `src/routes/_authenticated/calendar.tsx` | @/components/dashboard/primitives<br>@/components/ScheduleStudentCard<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/hooks/use-auth<br>@/integrations/supabase/client<br>@/lib/utils |
| `src/routes/_authenticated/certificate.tsx` | @/components/Navbar<br>@/components/ui/button<br>@/components/ui/card<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/classroom.$roomId.tsx` | @/components/classroom/ClassroomShell<br>@/hooks/use-auth<br>@/lib/access.functions |
| `src/routes/_authenticated/code.tsx` | @/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/textarea<br>@/lib/ai-tools.functions |
| `src/routes/_authenticated/courses.tsx` | @/components/dashboard/primitives<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/checkbox<br>@/components/ui/dialog<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/select<br>@/components/ui/textarea<br>@/hooks/use-auth<br>@/integrations/supabase/client<br>@/lib/course-materials.functions |
| `src/routes/_authenticated/dashboard.tsx` | @/components/dashboard/AdminHome<br>@/components/dashboard/StudentHome<br>@/components/dashboard/TutorHome<br>@/components/Navbar<br>@/components/ScheduleStudentCard<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/progress<br>@/components/ui/select<br>@/components/ui/textarea<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/labs.tsx` | @/components/LorddaLab<br>@/components/Navbar<br>@/components/ScopeGate<br>@/components/WebGLLab<br>@/hooks/use-auth<br>@/lib/lab-modules |
| `src/routes/_authenticated/labs_.simulation-lab.tsx` | @/components/lab3d/AmbientEmpty<br>@/components/lab3d/SimChat<br>@/components/lab3d/SimDispatch<br>@/components/Navbar<br>@/components/ScopeGate<br>@/components/ui/button<br>@/components/ui/dialog<br>@/components/ui/input<br>@/components/ui/tabs<br>@/components/ui/textarea<br>@/lib/sim-lab.functions |
| `src/routes/_authenticated/lessons.tsx` | @/components/dashboard/primitives<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/dialog<br>@/components/ui/input<br>@/components/ui/tabs<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/messages.tsx` | @/components/Navbar<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/my-courses.tsx` | @/components/dashboard/primitives<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/dialog<br>@/hooks/use-auth<br>@/integrations/supabase/client<br>@/lib/course-materials.functions |
| `src/routes/_authenticated/notes.tsx` | @/components/ai/SmartMarkdown<br>@/components/dashboard/primitives<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/textarea<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/notifications.tsx` | @/components/dashboard/primitives<br>@/components/ui/button<br>@/components/ui/card<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/parent.children.tsx` | @/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/label<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/parent.tsx` | @/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/pay-tutor.tsx` | @/components/Navbar<br>@/components/ScopeGate<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/select<br>@/integrations/supabase/client |
| `src/routes/_authenticated/records.tsx` | @/components/dashboard/primitives<br>@/components/ui/button<br>@/components/ui/card<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/resources.tsx` | @/components/dashboard/primitives<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/dialog<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/select<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/settings.tsx` | @/components/dashboard/AppShell<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/separator<br>@/components/ui/switch<br>@/components/ui/tabs<br>@/components/ui/textarea<br>@/hooks/use-auth<br>@/hooks/use-theme<br>@/integrations/supabase/client |
| `src/routes/_authenticated/tutor.availability.tsx` | @/components/dashboard/primitives<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/select<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/tutor.holidays.tsx` | @/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/label<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/wallet.tsx` | @/components/dashboard/primitives<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/_authenticated/whiteboard-review.$sessionId.tsx` | @/components/ui/button |
| `src/routes/auth.tsx` | @/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/tabs<br>@/integrations/supabase/client |
| `src/routes/checkout.cancelled.tsx` | @/components/ui/button |
| `src/routes/checkout.failed.tsx` | @/components/ui/button |
| `src/routes/checkout.success.tsx` | @/components/ui/button |
| `src/routes/community.tsx` | @/components/Navbar<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/textarea<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/help.tsx` | @/components/Navbar<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/textarea<br>@/hooks/use-auth<br>@/lib/help.functions |
| `src/routes/index.tsx` | @/components/Navbar<br>@/components/ui/button<br>@/components/ui/dialog<br>@/hooks/use-auth<br>@/integrations/supabase/client |
| `src/routes/leaderboard.tsx` | @/components/Navbar<br>@/components/ui/badge<br>@/components/ui/card<br>@/integrations/supabase/client |
| `src/routes/tutor.$id.tsx` | @/components/Navbar<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/integrations/supabase/client |
| `src/routes/tutors.tsx` | @/components/Navbar<br>@/components/ui/badge<br>@/components/ui/button<br>@/components/ui/card<br>@/components/ui/dialog<br>@/components/ui/input<br>@/components/ui/label<br>@/components/ui/select<br>@/hooks/use-auth<br>@/integrations/supabase/client<br>@/lib/booking-emails.functions |
| `src/routes/unsubscribe.tsx` | @/components/ui/button<br>@/components/ui/card |
| `src/routeTree.gen.ts` | ./router.tsx<br>./routes/__root<br>./routes/_authenticated<br>./routes/_authenticated/admin.ai<br>./routes/_authenticated/admin.analytics<br>./routes/_authenticated/admin.audit<br>./routes/_authenticated/admin.classrooms<br>./routes/_authenticated/admin.commissions<br>./routes/_authenticated/admin.index<br>./routes/_authenticated/admin.moderation<br>./routes/_authenticated/admin.payments<br>./routes/_authenticated/admin.payouts<br>./routes/_authenticated/admin.plans<br>./routes/_authenticated/admin.promotions<br>./routes/_authenticated/admin.reports<br>./routes/_authenticated/admin.students<br>./routes/_authenticated/admin.tutors<br>./routes/_authenticated/admin.whiteboard<br>./routes/_authenticated/ai-tools<br>./routes/_authenticated/ai-tutor<br>./routes/_authenticated/assignments<br>./routes/_authenticated/become-tutor<br>./routes/_authenticated/book.$tutorId<br>./routes/_authenticated/calendar<br>./routes/_authenticated/certificate<br>./routes/_authenticated/classroom.$roomId<br>./routes/_authenticated/code<br>./routes/_authenticated/courses<br>./routes/_authenticated/dashboard<br>./routes/_authenticated/labs<br>./routes/_authenticated/labs_.simulation-lab<br>./routes/_authenticated/lessons<br>./routes/_authenticated/messages<br>./routes/_authenticated/my-courses<br>./routes/_authenticated/notes<br>./routes/_authenticated/notifications<br>./routes/_authenticated/parent<br>./routes/_authenticated/parent.children<br>./routes/_authenticated/pay-tutor<br>./routes/_authenticated/records<br>./routes/_authenticated/resources<br>./routes/_authenticated/settings<br>./routes/_authenticated/tutor.availability<br>./routes/_authenticated/tutor.holidays<br>./routes/_authenticated/wallet<br>./routes/_authenticated/whiteboard-review.$sessionId<br>./routes/api/checkout/return<br>./routes/api/public/webhooks/paypal<br>./routes/auth<br>./routes/checkout.cancelled<br>./routes/checkout.failed<br>./routes/checkout.success<br>./routes/community<br>./routes/email/unsubscribe<br>./routes/help<br>./routes/index<br>./routes/leaderboard<br>./routes/reset-password<br>./routes/tutor.$id<br>./routes/tutors<br>./routes/unsubscribe<br>./start.ts |
| `src/server.ts` | ./lib/server/platform |
| `src/start.ts` | ./lib/error-page<br>@/integrations/supabase/auth-attacher |
| `tests/ai-entitlement.test.ts` | ../src/lib/ai-entitlement |
| `tests/room-access.test.ts` | ../src/lib/room-access |
| `tests/webhook-actions.test.ts` | ../src/lib/payments/webhook-actions |

## 7. DEPENDENCY HUB CANDIDATES

> These are statistical signals, not architectural conclusions.

| Target | Incoming References |
|---|---:|
| `@/components/ui/button` | 78 |
| `@/integrations/supabase/client` | 57 |
| `@/components/ui/card` | 49 |
| `@/lib/utils` | 49 |
| `@/hooks/use-auth` | 37 |
| `@/components/ui/badge` | 35 |
| `@/components/ui/input` | 32 |
| `@/components/ui/label` | 26 |
| `@/components/dashboard/primitives` | 24 |
| `@/components/ui/textarea` | 19 |
| `@/components/ui/select` | 16 |
| `@/lib/access.functions` | 16 |
| `@/components/ui/dialog` | 15 |
| `@/integrations/supabase/auth-middleware` | 15 |
| `@/components/Navbar` | 14 |
| `@/components/ui/tabs` | 10 |
| `@/lib/sim-lab.functions` | 10 |
| `@/components/ui/switch` | 7 |
| `@/lib/classroom-rtc` | 6 |
| `@/components/ScopeGate` | 6 |
| `@/integrations/supabase/client.server` | 6 |
| `@/lib/ai-entitlement` | 6 |
| `./registry` | 6 |
| `./types` | 5 |
| `./_shared` | 5 |
| `./engine` | 4 |
| `@/components/ai/SmartMarkdown` | 4 |
| `@/hooks/use-mobile` | 4 |
| `@/hooks/use-theme` | 4 |
| `@/components/admin/ConfigToggle` | 3 |

## 8. ROUTING / ENTRYPOINT CANDIDATES

- `src/lib/payments/router.server.ts` — ROUTING
- `src/router.tsx` — ROUTING
- `src/routes/__root.tsx` — ROUTING
- `src/routes/_authenticated.tsx` — ROUTING
- `src/routes/_authenticated/admin.ai.tsx` — ROUTING
- `src/routes/_authenticated/admin.analytics.tsx` — ROUTING
- `src/routes/_authenticated/admin.audit.tsx` — ROUTING
- `src/routes/_authenticated/admin.classrooms.tsx` — ROUTING
- `src/routes/_authenticated/admin.commissions.tsx` — ROUTING
- `src/routes/_authenticated/admin.index.tsx` — ROUTING
- `src/routes/_authenticated/admin.moderation.tsx` — ROUTING
- `src/routes/_authenticated/admin.payments.tsx` — ROUTING
- `src/routes/_authenticated/admin.payouts.tsx` — ROUTING
- `src/routes/_authenticated/admin.plans.tsx` — ROUTING
- `src/routes/_authenticated/admin.promotions.tsx` — ROUTING
- `src/routes/_authenticated/admin.reports.tsx` — ROUTING
- `src/routes/_authenticated/admin.students.tsx` — ROUTING
- `src/routes/_authenticated/admin.tutors.tsx` — ROUTING
- `src/routes/_authenticated/admin.whiteboard.tsx` — ROUTING
- `src/routes/_authenticated/ai-tools.tsx` — ROUTING
- `src/routes/_authenticated/ai-tutor.tsx` — ROUTING
- `src/routes/_authenticated/assignments.tsx` — ROUTING
- `src/routes/_authenticated/become-tutor.tsx` — ROUTING
- `src/routes/_authenticated/book.$tutorId.tsx` — ROUTING
- `src/routes/_authenticated/calendar.tsx` — ROUTING
- `src/routes/_authenticated/certificate.tsx` — ROUTING
- `src/routes/_authenticated/classroom.$roomId.tsx` — ROUTING
- `src/routes/_authenticated/code.tsx` — ROUTING
- `src/routes/_authenticated/courses.tsx` — ROUTING
- `src/routes/_authenticated/dashboard.tsx` — ROUTING
- `src/routes/_authenticated/labs.tsx` — ROUTING
- `src/routes/_authenticated/labs_.simulation-lab.tsx` — ROUTING
- `src/routes/_authenticated/lessons.tsx` — ROUTING
- `src/routes/_authenticated/messages.tsx` — ROUTING
- `src/routes/_authenticated/my-courses.tsx` — ROUTING
- `src/routes/_authenticated/notes.tsx` — ROUTING
- `src/routes/_authenticated/notifications.tsx` — ROUTING
- `src/routes/_authenticated/parent.children.tsx` — ROUTING
- `src/routes/_authenticated/parent.tsx` — ROUTING
- `src/routes/_authenticated/pay-tutor.tsx` — ROUTING
- `src/routes/_authenticated/records.tsx` — ROUTING
- `src/routes/_authenticated/resources.tsx` — ROUTING
- `src/routes/_authenticated/settings.tsx` — ROUTING
- `src/routes/_authenticated/tutor.availability.tsx` — ROUTING
- `src/routes/_authenticated/tutor.holidays.tsx` — ROUTING
- `src/routes/_authenticated/wallet.tsx` — ROUTING
- `src/routes/_authenticated/whiteboard-review.$sessionId.tsx` — ROUTING
- `src/routes/api/checkout/return.tsx` — ROUTING
- `src/routes/api/public/webhooks/paypal.ts` — ROUTING
- `src/routes/auth.tsx` — ROUTING
- `src/routes/checkout.cancelled.tsx` — ROUTING
- `src/routes/checkout.failed.tsx` — ROUTING
- `src/routes/checkout.success.tsx` — ROUTING
- `src/routes/community.tsx` — ROUTING
- `src/routes/email/unsubscribe.ts` — ROUTING
- `src/routes/help.tsx` — ROUTING
- `src/routes/index.tsx` — ROUTING
- `src/routes/leaderboard.tsx` — ROUTING
- `src/routes/tutor.$id.tsx` — ROUTING
- `src/routes/tutors.tsx` — ROUTING
- `src/routes/unsubscribe.tsx` — ROUTING

## 9. DATABASE / SUPABASE ARCHITECTURE

Migration files detected: **73**

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

### Database Domain Signals

**AUTH / IDENTITY** — 4 migration filename matches
- `20260812100000_close_session_insert_bypass.sql`
- `20260813090000_add_rls_profiles_user_roles_policies.sql`
- `20260814140000_add_rls_entitlement_gates_beyond_book_session.sql`
- `20260815140000_add_rls_parent_role_policies.sql`

**COMMERCE** — 1 migration filename matches
- `20260812150000_align_booking_gate_with_subscriptions_flag.sql`

**LEARNING** — 0 migration filename matches

**ASSESSMENT** — 0 migration filename matches

**CLASSROOM** — 3 migration filename matches
- `20260812100000_close_session_insert_bypass.sql`
- `20260812120000_restore_whiteboard_chat_tables.sql`
- `20260814140000_add_rls_entitlement_gates_beyond_book_session.sql`

**SCHEDULING** — 0 migration filename matches

**COMMUNICATION** — 5 migration filename matches
- `20260522092853_email_infra.sql`
- `20260522092905_email_infra.sql`
- `20260522093122_email_infra.sql`
- `20260524044744_email_infra.sql`
- `20260812120000_restore_whiteboard_chat_tables.sql`

**STORAGE** — 1 migration filename matches
- `20260813090000_add_rls_profiles_user_roles_policies.sql`

**AI** — 4 migration filename matches
- `20260522092853_email_infra.sql`
- `20260522092905_email_infra.sql`
- `20260522093122_email_infra.sql`
- `20260524044744_email_infra.sql`

**ADMINISTRATION** — 1 migration filename matches
- `20260814090000_add_rls_admin_operations_policies.sql`

## 10. EXTERNAL PACKAGE ARCHITECTURE

> Package names and declared versions only.

### Runtime Dependencies

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

## 11. ROLE / PERSONA SIGNALS

> These are filename/path signals only and are not claims about authorization.

### STUDENT

Candidate files: **4**
- `src/components/dashboard/StudentHome.tsx`
- `src/components/ScheduleStudentCard.tsx`
- `src/lib/students.functions.ts`
- `src/routes/_authenticated/admin.students.tsx`

### TUTOR

Candidate files: **20**
- `check_tutor_subscriptions.sql`
- `inspect_policies_tutor_courses.sql`
- `inspect_policies_tutor_subscriptions.sql`
- `inspect_tutor_courses.sql`
- `inspect_tutor_subscriptions.sql`
- `src/components/dashboard/TutorHome.tsx`
- `src/lib/ai-tutor.functions.ts`
- `src/routes/_authenticated/admin.tutors.tsx`
- `src/routes/_authenticated/ai-tutor.tsx`
- `src/routes/_authenticated/become-tutor.tsx`
- `src/routes/_authenticated/book.$tutorId.tsx`
- `src/routes/_authenticated/pay-tutor.tsx`
- `src/routes/_authenticated/tutor.availability.tsx`
- `src/routes/_authenticated/tutor.holidays.tsx`
- `src/routes/tutor.$id.tsx`
- `src/routes/tutors.tsx`
- `supabase/migrations/20260815090000_add_rls_tutor_app_promotion_validation.sql`
- `tutor_apps_count.sql`
- `verify_tutor_courses_policies.sql`
- `verify_tutor_subscriptions_policies.sql`

### PARENT

Candidate files: **3**
- `src/routes/_authenticated/parent.children.tsx`
- `src/routes/_authenticated/parent.tsx`
- `supabase/migrations/20260815140000_add_rls_parent_role_policies.sql`

### ADMIN

Candidate files: **21**
- `src/components/admin/AiKeyManager.tsx`
- `src/components/admin/AiProviderSelect.tsx`
- `src/components/admin/ConfigToggle.tsx`
- `src/components/dashboard/AdminHome.tsx`
- `src/lib/admin.functions.ts`
- `src/routes/_authenticated/admin.ai.tsx`
- `src/routes/_authenticated/admin.analytics.tsx`
- `src/routes/_authenticated/admin.audit.tsx`
- `src/routes/_authenticated/admin.classrooms.tsx`
- `src/routes/_authenticated/admin.commissions.tsx`
- `src/routes/_authenticated/admin.index.tsx`
- `src/routes/_authenticated/admin.moderation.tsx`
- `src/routes/_authenticated/admin.payments.tsx`
- `src/routes/_authenticated/admin.payouts.tsx`
- `src/routes/_authenticated/admin.plans.tsx`
- `src/routes/_authenticated/admin.promotions.tsx`
- `src/routes/_authenticated/admin.reports.tsx`
- `src/routes/_authenticated/admin.students.tsx`
- `src/routes/_authenticated/admin.tutors.tsx`
- `src/routes/_authenticated/admin.whiteboard.tsx`
- `supabase/migrations/20260814090000_add_rls_admin_operations_policies.sql`

## 12. QUESTIONS FOR ARCHITECTURAL REVIEW

Arena should answer these questions without writing code:

1. What is the current architectural style?
2. What are the major bounded domains?
3. What are the major application-layer responsibilities?
4. What appears to be the system's domain model?
5. What are the major dependency hubs?
6. Where does cross-domain coupling appear strongest?
7. What are the likely architectural boundaries?
8. Which modules appear to violate clean dependency direction?
9. Which areas are candidates for consolidation?
10. Which areas are candidates for separation?
11. Where are security boundaries likely to exist?
12. Where are client/server boundaries likely to exist?
13. How does the database appear to support the application?
14. How does AI appear to integrate with the platform?
15. How does classroom/realtime functionality appear to integrate?
16. How does commerce/payment functionality appear to integrate?
17. How does learning/assessment functionality appear to integrate?
18. What architecture is implied by the existing repository?
19. What architecture should AskATutorLive evolve toward?
20. What should NOT be changed merely for architectural fashion?
21. What are the highest-risk architectural decisions?
22. What should be frozen before implementation?
23. What should be redesigned before further coding?
24. What should be implemented first, and why?
25. Produce a dependency-aware implementation roadmap.

## 13. SANITIZATION RECORD

The following directory classes were excluded:
- `.git`
- `.svn`
- `.hg`
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

Sensitive filename patterns excluded:
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

## 14. ANALYSIS CONTRACT

This file is NOT authorization to access the repository.

The recipient must:

- analyze architecture
- identify domains
- identify dependencies
- identify risks
- propose target architecture
- propose implementation sequencing
- avoid generating implementation code unless explicitly requested
- never assume that filename-based classification is authoritative
- distinguish observed evidence from architectural inference

