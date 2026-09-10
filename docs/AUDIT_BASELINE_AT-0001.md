# AskATutorLive — Audit Baseline Report (AT-0001)

- **Work ID:** AT-0001 — Governance Installation & Baseline Architecture Audit
- **Type:** Evidence-based baseline audit (read-only research; persistence of findings into the control system)
- **Date:** AT-0001 session
- **Method:** Read-only repository inspection (git, source, migrations, generated types, tests, deployment config, documentation). **No live database access** was performed — the repository contains no database connection string. Live-applied database state is therefore `UNKNOWN — REQUIRES VERIFICATION` throughout unless otherwise stated.
- **Key input gap:** The referenced "Master Engineering Programme and Governance Protocol" was supplied with the task but is **not present in the repository**. This report and `docs/` treat the task's supplied rules as the governance model and do not fabricate a programme file or roadmap beyond the supplied phases.

State-model conventions used: `DESIGNED`, `IMPLEMENTED`, `APPLIED`, `TESTED`, `VERIFIED`, `PRODUCTION-VERIFIED`. Source inspection yields at most `VERIFIED` (source-level). `PRODUCTION-VERIFIED` requires current-session tool evidence from the actual production environment and is not claimed here.

---

## 1. Executive Baseline

AskATutorLive is a TanStack Start (React 19 + Vite 7 / Nitro) application backed by Supabase, deployable to Cloudflare Workers (default), Node, or Vercel. It has a partially-layered architecture: an Application→Domain-ports→Infrastructure shell with a DI composition root covers a meaningful subset of server functions, while the presentation/routes layer still performs substantial direct Supabase-client access (a two-tier UI↔DB style coexists with the three-layer subset).

Identity is Supabase `auth.users` JWT `sub`; roles are `admin|tutor|student|parent`; entitlement enforcement is fail-closed and tested. Learner isolation appears strong at source/RLS level, but live-applied database state is unverified. There is **no authoritative assessment/result/mastery/learning-state backend**; `assignment_submissions` is a phantom table; quiz scoring is client-side and ephemeral; `LearningRecordRepository` is an interface-only, unwired port.

Commerce's live bulk-lesson flow is server-authoritative (amounts re-derived server-side), but reconciliation is missing, and a latent `startCheckout` client-amount path is present-but-unused. Automated tests are minimal (3 files). The single largest unresolved verification boundary is live database/RLS state.

---

## 2. Repository Baseline

- Branch: `main` (only local branch); one worktree at `main`.
- 2 commits ahead of `origin/main`; no stash; remote PRs beyond `origin/main` not inspected.
- Large uncommitted working tree: the in-progress architecture migration / shim retirement (deleting `src/components/*`, `src/hooks/*`, several `src/lib/*.functions.ts`, re-homing imports). Pre-existing and unrelated to AT-0001.
- Package manager: `bun` (`bun.lock`, `bunfig.toml`). Build: `vite build` (Nitro). Tests: `bun:test`.
- Deployment config: `wrangler.jsonc` (Cloudflare Workers, `main: src/server.ts`, `nodejs_compat`), `@cloudflare/vite-plugin`; npm scripts `build:node` (`NITRO_PRESET=node-server`), `build:vercel` (`NITRO_PRESET=vercel`); `DEPLOYMENT.md` documents multi-target.
- `src/routes/api/` contains only `checkout/return.tsx` and `public/webhooks/paypal.ts`.
- No `supabase/functions/` (no Edge Functions). Env: Supabase REST keys only; no DB connection string in repo. Linked project ref `bzjlhxmiwdkteqkzqasi`.
- No `test` script in package.json. No CI config found. Previously observed (not re-run this session): `bun test tests/` → 35 passing; `tsc --noEmit` → 0; `vite build` → 0.

---

## 3. Architecture Matrix (26 areas)

| # | Area | Status | Evidence | Risk | Dependency |
|----|------|--------|----------|------|-----------|
| 1 | Application foundation | VERIFIED (subset) | App/domain/infra + DI root (`src/infrastructure/di`, `src/application/contracts/dependencies.ts`) | Low | Foundational |
| 2 | Identity | VERIFIED (source) | `auth-middleware.ts` JWT `sub` canonical id; `auth-attacher.ts` | Low | Foundational |
| 3 | Authentication | VERIFIED (source) | `requireSupabaseAuth` middleware; page/session auth | Low | Foundational |
| 4 | Authorization | VERIFIED (subset) | `entitlement-guard.ts` fail-closed + tests; room-access fail-closed | Medium (live unverified) | Identity |
| 5 | Learner isolation | VERIFIED (source) / UNKNOWN (live) | RLS owner/admin-scoped; dropped permissive policies | HIGH (live unverified) | DB/Rls |
| 6 | Ownership | VERIFIED (source) | user_id/student_id/tutor_id scoping; RLS | Low–Med | Identity |
| 7 | Relationships | VERIFIED (schema) | sessions aggregate; FKs (submissions→assignments CASCADE, etc.) | Low | Schema |
| 8 | Lifecycle/state | PARTIAL | sessions status; assignment status; no assessment/learning loop | Med | — |
| 9 | Learning context | MISSING/PROPOSED | only `domain/ports/learning.ts` interface-unwired | Med | Architecture decision |
| 10 | Activity | PARTIAL | notes, session_records artifacts; not modeled as activity | Med | — |
| 11 | Interaction | PARTIAL | classroom chat/whiteboard/sim | Low | — |
| 12 | Evidence | PARTIAL | assignment_submissions(phantom), session_records, notes; not a modeled loop | Med | — |
| 13 | Assessment | MISSING (authoritative) | no result/attempt/score table; quiz client-only | HIGH (product) | Architecture decision |
| 14 | Mastery/learning state | MISSING | no table/model; port only | HIGH (product) | Architecture decision |
| 15 | Content | PARTIAL | tutor_courses/materials/simulations | Low | — |
| 16 | Recommendation/intervention | MISSING | no engine; AI prompt-level only | Med | Learning/assessment |
| 17 | AI | PARTIAL | centralized gateway; quotas/logging/retries/timeout/moderation missing | Med | Entitlement |
| 18 | Communication/tutoring | PARTIAL | messaging, email, notifications; AI coach chats | Low–Med | — |
| 19 | Commerce | PARTIAL | server-authoritative intent; reconciliation missing | Med (latent amount risk) | Payments |
| 20 | Trust/safety/privacy | PARTIAL | forum moderation only; AI moderation missing | Med | — |
| 21 | Audit/operations | PARTIAL | admin_audit_log (tutor decisions); no AI usage log | Med | — |
| 22 | Quality/security | PARTIAL | 3 test files; no RLS automated tests; typecheck/build pass | Med | Tests/DB |
| 23 | Performance/scale | PARTIAL/UNKNOWN | vector index; no load/scale evidence | Med | Live/DB |
| 24 | Deployment | CONFIGURED/VERIFIED(config) | Workers/Node/Vercel presets; no production run evidence | Low–Med | Env |
| 25 | Production verification | NOT VERIFIED | no live access; live DB state UNKNOWN | HIGH | AT-0002 |
| 26 | Continuous improvement | DESIGNED (this doc set) | control docs installed; one-next-action | Low | Process |

---

## 4. Verified Foundations

- Build/runtime and multi-target deployment configuration (Workers/Node/Vercel).
- Identity/auth: canonical `auth.users` JWT `sub`; roles `admin|tutor|student|parent`; fail-closed entitlement gateway (tested).
- Application→Domain-ports→Infrastructure layering with DI composition root; application/domain layers avoid infrastructure/lib/process.env imports (layer rule clean for that subset).
- Source-level RLS: previously permissive `"anyone view roles"`/`"profiles public read"` policies dropped by migration history; owner/admin-scoped policies exist for identified learner data.
- Commerce (source): server-authoritative bulk-lesson intent; append-only service-role-constrained ledger; idempotent finalize/refund.
- AI: centralized gateway; server-side entitlement gating; no direct provider bypass identified in audited entry points.
- Server-authoritative entitlement/scoping in commerce and identity seams (fail-closed).

---

## 5. Partial Systems

- Partially-layered architecture: 51 presentation/routes files import Supabase client directly.
- Assignments: thin UI↔DB feature (create/list/mark-done/delete); no grading/submission flow (schema-only).
- Trust & safety: forum moderation only.
- Simulations: schema generation + client quiz (ephemeral); no result persistence.
- AI: quotas/logging/retries/timeouts/moderation incomplete; some outputs (flashcard/quiz JSON) unvalidated.
- Commerce: reconciliation missing.
- Quality/security: only 3 test files; no RLS automated tests.

---

## 6. Missing Systems

- Authoritative assessment-result/attempt/score persistence (no table found in any migration; `grade` is `text`).
- Mastery/learning-state backend; `LearningRecordRepository` implementation/wiring.
- Activity ≠ Evidence ≠ Mastery model.
- AI usage logging; quota enforcement; automated RLS/authorization tests; CI/CD.
- Commerce reconciliation/quarantine.
- AI input/output moderation.

---

## 7. Unknowns (`UNKNOWN — REQUIRES VERIFICATION`)

- Live applied migrations / schema drift; live row counts (esp. `assignments`, `assignment_submissions`); live `app_role` enum coverage; live RLS policy application and enforcement of the intended ownership boundary (no DB connection string in repo; requires operator access — AT-0002).
- `session_records.ai_summary` writer (not found in `src/`; may be an external/Edge process not in this codebase) and any downstream use of it.
- Remote PRs beyond `origin/main`.
- Whether the latent `startCheckout` path is ever reachable in any deployed/environment config beyond `src/`.
- `AI OUTPUT != EVIDENCE` enforcement (not confirmed; not fully enforced).

---

## 8. Contradictions

- `docs/archive/architecture-inventory.md`, `docs/archive/architecture-inventory-v2.md`, `docs/archive/architecture-inventory-v3-arena.md`, `docs/archive/askatutorlive-arena-final.md`: STALE — reference deleted `src/components/*`, `src/hooks/*`, 9 deleted `*.functions.ts` shims; wrong file counts (184 `.tsx`/117 `.ts` actual vs 161/66 claimed; 73 `.sql` vs 109 claimed).
- `README.md`: generic boilerplate, no project-specific content.
- `docs/audits/AUDITS_AI_QUOTA_DESIGN.md`, `docs/audits/AUDITS_AI_SERVER_BOUNDARY.md`, `docs/audits/AUDITS_ARCHITECTURAL_RECONCILIATION.md`, `docs/audits/GAP_REGISTER.md`, `docs/audits/CATEGORY2_PRODUCTION_VERIFICATION_RESULT.md`: substantially current / accurately flagged (incl. production DB blocked).
- Phantom resources: `assignment_submissions` table (schema+RLS+triggers, zero app consumers), `LearningRecordRepository` port (interface-unwired).
- Shim retirement incomplete: 3 `*.functions.ts` remaining (`access`, `entitlements`, `sim-lab`) + `room-access.ts`, per audit evidence.
- Dead DB functions in `20260814140000_*.sql` reference nonexistent `tutor_subscriptions.user_id` and a `user_metadata` table.

These are recorded, not "fixed" during AT-0001. Do not treat stale docs as fact.

---

## 9. Identity / Authentication / Isolation Audit

- Canonical identity: `auth.users` via JWT `sub` (`src/integrations/supabase/auth-middleware.ts`), established server-side; userId never trusted from client.
- Roles: `admin|tutor|student|parent`; entitlement gateway fail-closed and unit-tested.
- RLS (source): permissive role/profile read policies were dropped (`20260521120758`, `20260521120359`); GAP-001/GAP-005 rebuild owner/admin-scoped policies for `user_roles`, `profiles`, `sessions`, `tutor_subscriptions`, `tutor_courses`. Owner/participant/admin/parent policies exist for notes, session_records, assignments/assignment_submissions, simulations, ledger, payment_intents.
- Commerce/ledger isolation: append-only, service-role-constrained; RLS owner-scoped; cross-user writes admin-guarded.
- Boundary: source-level isolation appears strong for identified areas; LIVE applied state and actual enforcement = `UNKNOWN — REQUIRES VERIFICATION`. No learner-A-vs-learner-B live test performed.

---

## 10. Learning / Assessment Audit

- No coherent Activity/Evidence/Mastery backend. `assignment_submissions` phantom. Quiz scoring client-side/ephemeral (`labs_.simulation-lab.tsx`). No persisted result/attempt/mastery table. `LearningRecordRepository` interface-unwired. Assessment architecture = `PROPOSED / UNACCEPTED`. Not implemented during AT-0001.

---

## 11. AI Audit

- Centralized `AiGateway`/adapter/provider; server-side entitlement gating; no direct bypass in audited entry points.
- Gaps: quota unused, usage logging missing, retries/timeouts/moderation incomplete, some structured outputs unvalidated.
- `AI OUTPUT != EVIDENCE` not fully enforced. `session_records.ai_summary` writer unknown — further verification required.

---

## 12. Commerce Audit

- Live bulk-lesson intent flow server-authoritative (amounts re-derived server-side from `profiles.hourly_rate`); ledger append-only/service-role/idempotent.
- Reconciliation missing. `startCheckout`/`routeCheckoutStart` caller-supplied `amountCents` path exists in audited historical/forensic code, currently unused in `src/` — latent, not active. PayPal disabled by default (manual flow only). Dead guard funcs reference nonexistent columns.

---

## 13. Quality / Security / Deployment Audit

- Tests: 3 files (`ai-entitlement`, `room-access`, `webhook-actions`). No RLS automated tests, no assignment/quiz/assessment isolation coverage. No CI/CD. Build/typecheck previously passed (not re-run this session). Deployment multi-target configured; no production run evidence.

---

## 14. Dead / Ghost / Phantom / Duplicate Systems

- `assignment_submissions` table (phantom). `LearningRecordRepository` port (unwired). Dead DB funcs (`20260814140000_*.sql`). Stale architecture-inventory docs (relocated to `docs/archive/`). `simulation_assets` table (no app consumers found). Latent `startCheckout`/`checkout.functions.ts` (historical/forensic, in `docs/evidence/forensic/`). None deleted nor fixed during AT-0001.

---

## 15. Dependency Map

- Live DB/RLS verification (AT-0002) gates confident decisions on learner isolation and on whether assessment/mastery can be safely added with the current ownership model.
- Assessment/mastery backend is `PROPOSED`; its implementation is blocked on an explicit `ACCEPTED` decision and on live DB verification.
- AI quota/logging/hardening and commerce reconciliation are independent hardening tracks (BACKLOG).

---

## 16. Roadmap Position

Foundation (identity/auth/layering/deployment) substantially exists. Assessment/mastery/learning-state is essentially absent, and that direction is `PROPOSED/UNACCEPTED`. The biggest unresolved boundary is live DB/RLS verification. Recommended next work item: AT-0002 (PLANNED). This is not "next phase because phase 1 comes first" — it is driven by the security/isolation verification gap and the blocking dependency on live database evidence.

---

## 17. Recommended Next Work Item

**AT-0002 — Live Database Verification & RLS Isolation Confirmation** (PLANNED, not begun). Chosen because live database/applied-migration/RLS state is the single most important unresolved security/isolation verification boundary, and it blocks confident decisions on learner isolation and any assessment/mastery direction. Requires operator-provided DB access and explicit authorization.

---

## 18. Known Limitations of This Audit

- Read-only static inspection; no live DB access (no connection string in repo). Live state is `UNKNOWN — REQUIRES VERIFICATION`.
- No learner-A-vs-learner-B live penetration testing.
- Remote PRs beyond `origin/main` not inspected.
- `session_records.ai_summary` writer and the `AI OUTPUT != EVIDENCE` question not fully resolved.
- No CI/automation observed; test/build observations are from prior runs, not re-run this session.
- `docs/evidence/forensic/forensic_batch_2/` is a historical/forensic snapshot; its presence does not mean its code is live in `src/`.
