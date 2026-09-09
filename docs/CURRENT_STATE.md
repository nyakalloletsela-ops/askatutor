# AskATutorLive — Current State

- **Work ID:** AT-0002 (carries forward the AT-0001 baseline audit record).
- **Type:** Authoritative current-state record (evidence-based, from the AT-0001 baseline audit, updated by the AT-0002 live-verification attempt).
- **Authority:** This document is the authoritative statement of what the repository actually is today. It does not describe what the project should become.
- **AT-0002 outcome:** Now substantially verified (session 3, live production): the operator-authenticated Supabase CLI/Management API provides a working HTTPS path that bypasses the raw 5432 port, enabling **read-only live applied-database verification**. Applied schema, RLS policy definitions, helper functions, `app_role` enum, and empty-table/empty-user state for the 5 learner tables are now **verified live against production**, and the **source↔applied reconciliation is MATCH** for all 5. The **definitive cross-learner (A vs B) runtime isolation test remains NOT VERIFIED / not executable** because the production DB has **zero users** (`auth.users`=0) and **zero rows** in all 5 learner tables, and creating test identities/data would be out-of-scope production modification. AT-0002 = `PARTIALLY VERIFIED` (applied-DB/RLS/deletion+presence verified; cross-learner runtime isolation NOT VERIFIED). Not COMPLETED, not fully VERIFIED. See Isolation Findings below.

---

CURRENT STATE:
Verifiable TanStack Start (React 19 + Vite 7 / Nitro) app backed by Supabase, with a partially-layered architecture: an Application→Domain-ports→Infrastructure shell with a DI composition root exists for a meaningful subset, while presentation/routes still contain substantial direct Supabase-client usage. Identity is Supabase `auth.users` JWT `sub`, roles `admin|tutor|student|parent`, entitlement enforcement fail-closed. Learner isolation appears strong at source/RLS level AND is now **verified live at the applied level** for schema + RLS policy definitions (all 5 learner tables exist, RLS enabled, owner/participant/admin-scoped policies, source↔applied MATCH). The live production DB is effectively **unpopulated**: `auth.users`=0, `user_roles`=0, all 5 learner tables have 0 rows, so the anon `[]` result on resume was an empty table (not RLS-hidden data). The **definitive cross-learner (A vs B) runtime isolation test is NOT VERIFIED** — no learner identities and no records exist to test with, and creating them is out-of-scope production modification. There is NO authoritative assessment/result/mastery/learning-state backend; `assignment_submissions` is a phantom table; quiz scoring is client-side/ephemeral; `LearningRecordRepository` is an interface-only unwired port. Commerce live flow is server-authoritative (bulk-lesson intent re-derives amounts server-side); reconciliation is missing and a latent `startCheckout` client-amount path is unused. Tests are minimal (3 files). Deployment targets: Cloudflare Workers default, Node/Vercel options. AT-0002 is PARTIALLY VERIFIED; remaining runtime cross-learner isolation is UNKNOWN — REQUIRES VERIFICATION.

VERIFIED:
- Build/runtime: `bun`, TanStack Start, React 19, Vite 7, Nitro; `vite build` is the build.
- Deployment: Cloudflare Workers default (`wrangler.jsonc`, `src/server.ts` fetch shim, `@cloudflare/vite-plugin`, `nodejs_compat`); Node (`build:node`/`NITRO_PRESET=node-server`) and Vercel (`build:vercel`/`NITRO_PRESET=vercel`) options; solo `src/routes/api/` = checkout-return + paypal webhook only; NO `supabase/functions/` (no Edge Functions); only Supabase REST keys in env (no DB connection string in repo).
- Identity/auth: canonical id = `auth.users` via JWT `sub` (`src/integrations/supabase/auth-middleware.ts`); roles `admin|tutor|student|parent`; fail-closed entitlement gateway (`src/application/services/entitlement-guard.ts`).
- Architecture: Application→Domain ports→Infrastructure with DI root (`src/infrastructure/di`), `requireAppDependencies`/`requirePublicDependencies`; application/domain layers observed with zero imports of `@/infrastructure`, `@/lib`, `process.env` (layer rule clean for that subset). `LearningRecordRepository` is NOT wired into `AppDependencies`.
- RLS source-level: previously permissive `"anyone view roles"` and `"profiles public read"` policies were DROPPED by migration history (`20260521120758`, `20260521120359`); GAP-001/GAP-005 migrations rebuild owner/admin-scoped policies for `user_roles`, `profiles`, `sessions`, `tutor_subscriptions`, `tutor_courses`. Owner/participant/admin/parent-scoped policies exist for identified learner data (notes, session_records, assignments/assignment_submissions, simulations).
- Commerce (source): bulk-lesson flow is server-authoritative (`create_bulk_lesson_intent` re-derives gross/commission/net from `profiles.hourly_rate`); ledger append-only, service-role-constrained, idempotent; PayPal disabled by default (manual flow only).
- AI: centralized `AiGateway`→adapter→provider stack; AI entry points server-side entitlement-gated; no direct provider bypass identified in audited entry points.
- Tests observable: only 3 test files (`ai-entitlement`, `room-access`, `webhook-actions`); no `test` script in package.json; no CI config found.
- AT-0002 resume (session 2, live PRODUCTION data plane): production REST API reachable from this host (TCP 443 open, DNS resolves). Anon (publishable-key) `GET /rest/v1/{table}?select=*&limit=1` on learner-owned tables `assignments`, `assignment_submissions`, `notes`, `session_records`, `simulations` → **HTTP 200 with empty `[]` body** (anon denied / no leaked rows). This verifies the data plane is live and that unauthenticated access to these tables returns no data.
- AT-0002 session 3 (live PRODUCTION applied DB via authenticated Management API over HTTPS — read-only, no raw 5432 needed): **applied schema verified live** — all 5 learner tables exist with ownership columns (`assignments.tutor_id/student_id`, `assignment_submissions.student_id`, `notes.user_id`, `session_records.created_by`, `simulations.user_id`), RLS enabled on all 5 (`rls_enabled=true`, none forced). **Applied RLS policy definitions verified live** (see Isolation Findings): owner/participant/admin-scoped, `auth.uid()`-based, for SELECT/INSERT/UPDATE/DELETE on all 5 tables. **Applied RLS helpers verified** (`has_role`, `is_parent_of`, `can_access_classroom_room`) and **`app_role` enum = {admin, tutor, student, parent}** present. **Source↔applied reconciliation = MATCH** for all 5 tables + policies + helpers + enum. **Row/data-presence verified** — all 5 learner tables = 0 rows; `auth.users`=0, `user_roles`=0 (production DB is empty/unpopulated).

PARTIAL:
- Architecture is partially layered, not uniformly enforced: 51 presentation/routes files import the Supabase client directly (two-tier UI↔DB coexists with three-layer subset).
- Trust & safety = forum-moderation only.
- AI: quotas not enforced, usage logging missing, retries/timeouts/moderation incomplete/missing, structured validation incomplete for some tool outputs (flashcard/quiz JSON).
- Assessment: assignments implemented as thin UI↔DB feature (create/list/mark-done/delete); assignment grading/submission path absent.
- Commerce: reconciliation missing; latent `startCheckout` client-amount path unused in `src/`.
- Test/verification: build/typecheck previously observed to pass (`bun test tests/` → 35 passing, `tsc --noEmit` → 0, `vite build` → 0 — as previously run, not re-run this session); no RLS automated tests.

UNKNOWN:
- **Cross-learner (A vs B) runtime isolation enforcement** — the definitive RLS *behavior* test (whether one authenticated learner can SELECT/UPDATE/DELETE another's records, or INSERT falsely-attributed-to-B rows) remains `UNKNOWN — REQUIRES VERIFICATION`. Applied RLS policy *definitions* are verified owner/participant/admin-scoped, but runtime enforcement between two learners is not testable here: `auth.users`=0 (no learner identities exist) and all 5 learner tables have 0 rows; creating test identities/records is out-of-scope production modification. AT-0002 remains PARTIALLY VERIFIED on this account.
- `session_records.ai_summary` writer not found in `src/` (may be an external/Edge process not in this codebase).
- Remote PRs beyond `origin/main` (not inspected).
- AI-OUTPUT-as-EVIDENCE enforcement: not confirmed; `AI OUTPUT != EVIDENCE` not yet fully enforced.
- Live runtime application/API boundary behaviour for an authenticated learner (ownership propagation end-to-end) — NOT VERIFIED (no authenticated runtime/identities available this session).

BLOCKERS:
- **AT-0002 (resolved in part, session 3):** The applied-schema/RLS-policy/row-count enumeration blocker is **RESOLVED** — the operator-authenticated Supabase CLI/Management API provides a working HTTPS path to the production DB (raw pooler 5432 still times out and direct 5432 host `db.*.supabase.co` does not resolve, but no raw connection is needed). Live, read-only applied-DB verification was completed (schema, RLS, helpers, enum, row counts, source↔applied MATCH). **Remaining AT-0002 blocker:** the definitive **cross-learner (A vs B) runtime isolation test is NOT EXECUTABLE** — `auth.users`=0 (no learner identities), `user_roles`=0, and all 5 learner tables have 0 rows; creating test identities/controlled records would be out-of-scope production modification. This runtime behavior remains `NOT VERIFIED — REQUIRES VERIFICATION`.
- None other technical for the current baseline documentation.

DECISIONS:
- No new application architecture was accepted during AT-0001 or AT-0002.
- Assessment / learning architecture = `PROPOSED / UNACCEPTED` (see `docs/DECISION_LOG.md`).
- **ATD-0011 — Authentication provider: Supabase Auth = `ACCEPTED`** (explicit human decision; see `docs/DECISION_LOG.md` → D-0003). **Authentication provider production configuration = `NOT VERIFIED`**; current Google/email login = `FAILING / NOT VERIFIED`. Reason: provider configuration (provider enablement, Site URL, OAuth redirect allow-list) is outside repository evidence and requires project-level verification — separate operational follow-ups, not closed by this decision.
- AT-0002 = `PARTIALLY VERIFIED` — the applied-DB/RLS/schema/row-count/reconciliation segments are now **VERIFIED live** (session 3); the definitive cross-learner (A vs B) runtime isolation test remains **NOT VERIFIED** (no identities/records in an empty production DB; creating them is out of scope). Not COMPLETED, not fully VERIFIED. Prior blocked-session evidence is preserved below.
- No application/schema/migration/config/data change was made during AT-0002 (verification-only read-only; not authorized to modify). All live queries were read-only (SELECT/catalog/COUNT); no data was written.
- Historical Phase-0 architecture/requirement decisions (AT-0000) are recorded as **provenance only** in the "Historical Phase-0 Decisions (Provenance Record)" section below and in `docs/DECISION_LOG.md` → D-0002 — **not** re-accepted and do **not** authorize implementation.

RISKS:
- Unverified **runtime** cross-learner (A vs B) RLS/isolation behavior — the primary remaining open security concern (target of AT-0002). Applied RLS policy *definitions* are verified owner/participant/admin-scoped, but live cross-learner enforcement has not been executed (empty production DB; no learner identities). Do not claim complete runtime isolation without a live cross-user test (requires a populated/authorized test environment).
- The production DB is currently **empty/unpopulated** — this reduces exploitable data exposure now, but also means RLS enforcement is unexercised by real data/users; a future populated deployment must re-verify runtime isolation.
- Latent `startCheckout`/`routeCheckoutStart` caller-supplied `amountCents` path — latent financial-integrity risk if ever activated unguarded (logged in BACKLOG, not fixed).
- No authoritative assessment/result persistence — assessment results not machine-readable; has product-value implications (PROPOSED direction, not implemented).
- Minimal automated test coverage (3 files) and no RLS automated verification.
- Stale architecture documentation must not be treated as fact.

IN PROGRESS:
- AT-0001 — Governance Installation & Baseline Architecture Audit (COMPLETED at the control-document level).
- AT-0002 — Live Database Verification & RLS Isolation Confirmation — `PARTIALLY VERIFIED / awaiting authorized populated test environment`. Not actively executing: the investigation has reached the maximum verification level the current environment permits and is **paused pending an authorized, populated test environment**. The applied schema/RLS-policy/hook/enum/row-count/reconciliation segments are VERIFIED live (session 3); only the definitive cross-learner A/B **runtime** isolation test remains open and cannot run until two learner identities + controlled records are available and resume is explicitly re-authorized (see BACKLOG). (See also repository working-tree: the ongoing architecture migration / shim retirement is separate, pre-existing uncommitted work unrelated to this task.)

NEXT ACTION:
- **Determine and explicitly authorize the next work item after AT-0002 state reconciliation.** AT-0002 is `PARTIALLY VERIFIED` and is **not** started automatically. No implementation item is begun without explicit, separate authorization (a new work item enters PLANNED → IN_PROGRESS). The definitive A/B runtime-isolation continuation remains available as a **future** work item pending an authorized, populated test environment: an operator must provide **two authenticated learner identities (Learner A / B)** and controlled A/B-owned records (or explicit authorization to create test data in a non-production/empty-DB environment) to run the cross-learner RLS enforcement tests (read + write + IDOR). Until then, runtime cross-learner isolation remains `NOT VERIFIED — REQUIRES VERIFICATION`. This next action is a recommendation only; beginning it requires explicit re-authorization.

FUTURE:
- Finish AT-0002 (only as a separately authorized continuation): once an operator provides an **authorized, populated test environment** with **two learner identities (Learner A / B)** and controlled A/B-owned records, execute the definitive Learner-A-vs-Learner-B RLS isolation tests (read + write + IDOR) before any assessment/mastery direction is pursued. The applied schema/RLS-policy segments are already VERIFIED live; this continuation targets the remaining **runtime** enforcement gap only.
- Assess the `PROPOSED` learning/assessment outcome architecture only after live DB state (AT-0002) is confirmed and an explicit human `ACCEPTED` decision is recorded in `docs/DECISION_LOG.md`.
- Harden AI quotas/usage-logging, retries/timeouts/moderation; commerce reconciliation; RLS automated tests; retire remaining shims — all captured in `docs/BACKLOG.md`, each requiring its own authorized work item.

---

## Repository Baseline

- Branch: `main` (only local branch); one worktree at `main`; 2 commits ahead of `origin/main`; no stash; remote PRs beyond `origin/main` not inspected.
- Large uncommitted working tree is the in-progress architecture migration / shim retirement (deleting `src/components/*`, `src/hooks/*`, several `src/lib/*.functions.ts`; re-homing imports). This is pre-existing, separate from AT-0001.
- Package manager: `bun` (bun.lock, bunfig.toml).
- Build/runtime: TanStack Start (React 19 + Vite 7 / Nitro). Deployment: Cloudflare Workers default; Node/Vercel options. No `supabase/functions/`.
- Tests: `bun:test`; no `test` script; 3 test files. Previously observed: `bun test tests/` → 35 passing, `tsc --noEmit` → 0, `vite build` → 0 (previously run, not re-run this session). No CI config found.
- Env: Supabase REST keys (project id `bzjlhxmiwdkteqkzqasi` linked); NO DB connection string/password in repo. Supabase CLI authenticated to the Management API (session 3; credential in OS credential store) gives an HTTPS path to the production DB for read-only applied verification (raw pooler 5432 still times out; direct `db.*.supabase.co` does not resolve from this host). AT-0002: session 1 host unresolvable → session 2 REST data plane reachable + anon-denial → session 3 applied-DB/RLS verified live (see Isolation Findings).

## Architecture Baseline

- Application/domain/infrastructure layering exists in a meaningful subset; DI composition root exists; `requireAppDependencies`/`requirePublicDependencies` exist.
- Application/domain layers observed avoiding infrastructure/lib/process.env imports (layer rule clean for that subset).
- Presentation/routes still contain substantial direct Supabase-client usage (51 files). Therefore architecture is partially layered, not uniformly enforced.

## Identity / Authentication / Learner-Isolation Findings

- Canonical id: Supabase `auth.users` JWT `sub`. Roles: `admin|tutor|student|parent`.
- Entitlement enforcement fail-closed and tested (`assertAiEntitlement`; `tests/ai-entitlement.test.ts`).
- Source-level RLS: permissive role/profile read policies were dropped by migration history; owner/admin-scoped policies exist for relevant learner data.
- Source-level isolation appears strong for identified commerce/notes/assignments/simulations areas.
- APPLIED data plane + schema + RLS policy definitions: verified (AT-0002 sessions 2–3). LIVE **runtime** CROSS-LEARNER RLS enforcement (A vs B) = `NOT VERIFIED` — no authenticated learner identities (`auth.users`=0) and no records to test with; requires two authenticated learner identities and a populated/authorized test environment. Do not claim complete runtime isolation without live cross-user evidence.

### AT-0002 Isolation Verification Outcome (env + access)

**Session 1 (original, BLOCKED) — preserved evidence:**
- **Environment determination:** The repository links a live Supabase project (`askatutorlive`, ref `bzjlhxmiwdkteqkzqasi`, eu-west-1). No local/dev/staging environment exists (no Docker/Podman, no local Supabase stack, no Supabase CLI session credentials). The `.env` contains Supabase REST keys (anon/publishable + service-role) and the project URL, but **no database connection string or DB password**.
- **Applicable evidence level:** `PRODUCTION` is the ONLY candidate environment present (linked project). `LOCAL/DEVELOPMENT/STAGING` are not available.
- **Access probes (read-only, no secrets exposed):**
  - Production REST host `https://bzjlhxmiwdkteqkzqasi.supabase.co` → **DNS name does not exist** (cannot resolve; version + REST root both fail) at that time.
  - Production pooler `aws-1-eu-west-1.pooler.supabase.com:5432` → resolves (AWS ELB eu-west-1) but **outbound TCP 5432 connection times out** (and no DB password exists in the repo).
  - General internet works (`example.com` → HTTP 200), so the failure was specific to the Supabase project REST host / DB port, not a blanket network outage.
- **Session-1 conclusion:** `LIVE DATABASE VERIFICATION = BLOCKED`. Applied-schema, applied-RLS, and cross-learner A/B runtime verification could not be executed.

**Session 2 (resume) — new partial progress:**
- Production REST **data plane now reachable** from this host: TCP 443 open to `bzjlhxmiwdkteqkzqasi.supabase.co`; `GET /rest/v1/` without a key → HTTP 401 (host live, requires key); with anon (publishable) key the API responds.
- **Anon-denial probe (read-only, `limit=1`, anon/publishable key, no data dumped):** `assignments`, `assignment_submissions`, `notes`, `session_records`, `simulations` → each returned **HTTP 200 with an empty `[]` body**. This is a real applied-data-plane behavior: an unauthenticated request to these learner-owned tables returns no rows (consistent with RLS owner-scoped enforcement). Keys confirmed as legacy format (`sb_publishable_...` = anon, `sb_secret_...` = service role).
- **Limitation:** an empty anon result cannot by itself distinguish "RLS denial" from "table currently has no rows." Establishing the difference requires an authenticated identity or direct DB count — neither available.
- **Remaining sessions-2 blockers:** direct Postgres (pooler 5432) still unreachable + no password → applied-schema/RLS-policy/migration/row-count enumeration NOT VERIFIED. Two authenticated learner identities (A/B) unavailable → cross-learner A/B isolation NOT VERIFIED / BLOCKED. Service-role key bypasses RLS and was **not** used for data access.

**Session 3 (final resume) — applied-database verification (live, current-session PRODUCTION, read-only):**
- **Access change:** The operator-authenticated Supabase CLI / Management API now provides a **working HTTPS path to the production DB that does not require the raw 5432 port**. Raw pooler `aws-1-eu-west-1.pooler.supabase.com:5432` still times out and the direct host `db.bzjlhxmiwdkteqkzqasi.supabase.co` does not resolve from this host; these raw / direct connections remain unreachable, but read-only SQL is executed via `POST https://api.supabase.com/v1/projects/{ref}/database/query` (Management API) using the authenticated session. Credential used only in-process (never printed/committed/written to docs).
- **Applied schema (VERIFIED live):** all 5 learner tables exist; RLS enabled on all 5 (`relrowsecurity=true`, none forced). Ownership columns: `assignments.tutor_id`/`student_id`, `assignment_submissions.student_id`, `notes.user_id`, `session_records.created_by`, `simulations.user_id` (all `uuid NOT NULL`). Declared FKs: `simulations.user_id → auth.users(id)`, `assignment_submissions.assignment_id → assignments(id) ON DELETE CASCADE`.
- **Applied RLS policies (VERIFIED live, exact defs) — owner/participant/admin-scoped via `auth.uid()`:**
  - `assignments`: SELECT `auth.uid()=tutor_id OR auth.uid()=student_id OR admin` (+ parent `is_parent_of(student_id)`); INSERT WITH CHECK `auth.uid()=tutor_id AND has_role(tutor)`; UPDATE/DELETE `tutor_id OR admin`.
  - `assignment_submissions`: SELECT/UPDATE `auth.uid()=student_id OR EXISTS(assignments a WHERE a.id=assignment_id AND a.tutor_id=auth.uid()) OR admin`; INSERT WITH CHECK `auth.uid()=student_id AND has_role(student)`; DELETE `auth.uid()=student_id OR admin`.
  - `notes`: SELECT `auth.uid()=user_id OR admin`; INSERT WITH CHECK `auth.uid()=user_id`; UPDATE/DELETE `auth.uid()=user_id` (UPDATE WITH CHECK same).
  - `session_records`: SELECT `can_access_classroom_room(room_id)` (+ parent subquery over `sessions`/`is_parent_of`); INSERT WITH CHECK `auth.uid()=created_by AND can_access_classroom_room(room_id) AND (tutor OR admin)`; UPDATE `admin OR (can_access_classroom_room(room_id) AND tutor)`; DELETE `admin`.
  - `simulations`: SELECT/INSERT/UPDATE/DELETE all `auth.uid()=user_id` (INSERT/UPDATE also WITH CHECK `auth.uid()=user_id`).
- **Applied helpers/enum (VERIFIED live):** `has_role`, `is_parent_of`, `can_access_classroom_room` present; `app_role` enum = `{admin,tutor,student,parent}`.
- **Row/data-presence (VERIFIED live):** all 5 learner tables have **0 rows**; `auth.users`=0 and `user_roles`=0. The **session-2 empty `[]` ambiguity is resolved**: the anon empty result was a *genuinely empty table*, not RLS-hidden populated data. The production DB is effectively unpopulated.
- **Source↔applied reconciliation = MATCH:** applied table existence, columns, RLS-enablement, and every policy definition (name/command/roles/USING/WITH CHECK) match the repository migrations (`20260530152504` assignments/submissions/notes; `20260601045818` + `20260622125739` session_records + parent policies; `20260623113448` simulations; `20260605061006` submissions INSERT role-gate; helper definitions in `20260518180453`/`20260522073549`/`20260622125739`; `parent` enum in `20260622125739`). No mismatch found for the 5 learner tables.
- **Cross-learner (A vs B) runtime isolation test: NOT EXECUTABLE / NOT VERIFIED — REQUIRES VERIFICATION.** No two authenticated learner identities exist (`auth.users`=0); all 5 learner tables are empty; creating test identities/controlled A/B-owned records would be out-of-scope production modification (and, being empty, there are no B-owned rows to attempt to read/write). The applied RLS policy *definitions* are confirmed owner-scoped, but runtime enforcement between two learners is unexercised. IDOR/object-reference read+mutation and application-boundary runtime tests likewise not executable for the same reason.
- **Security note:** no vulnerability confirmed. RLS policy definitions are consistent and owner-scoped. The only finding is the unexercised runtime state (empty DB), which requires a populated/authorized environment to test.

**Aggregate conclusion:** `PARTIALLY VERIFIED` — the applied schema, RLS policy definitions, helper functions, `app_role` enum, row/data-presence, and source↔applied reconciliation are **VERIFIED live** against production (current-session). The definitive **cross-learner (A vs B) runtime isolation** behavior remains **NOT VERIFIED — REQUIRES VERIFICATION** (empty production DB; no learner identities; out-of-scope to create test data). No fabricated live results; no claim of runtime cross-learner isolation without a live cross-user test.

## Learning / Assessment Findings

- Activity ≠ Evidence ≠ Mastery is not currently modeled as a coherent backend architecture.
- `assignment_submissions` exists but has no application consumers found in the repository (phantom table).
- Quiz scoring in the simulation lab is client-side and ephemeral.
- No structured persisted assessment outcome/result/mastery/learning-state backend found.
- `LearningRecordRepository` is an interface/port without implementation/wiring.
- Assessment architecture = `PROPOSED / UNACCEPTED`. Not implemented during AT-0001.

## AI Findings

- Centralized `AiGateway`/adapter/provider architecture; AI entry points server-side entitlement-gated; no direct provider bypass identified in audited entry points.
- Quota enforcement incomplete/unused; usage logging missing; retries/timeouts/moderation incomplete or missing; structured validation incomplete for identified AI tool outputs.
- `AI OUTPUT != EVIDENCE` not yet fully enforced. `session_records.ai_summary` requires further verification regarding its writer.

## Commerce Findings

- Server-authoritative bulk-lesson intent flow; gross/commission/net re-derived server-side.
- Ledger append-only/service-role-constrained/idempotent (source evidence).
- Reconciliation missing. `startCheckout`/`routeCheckoutStart` caller-supplied `amountCents` path exists in audited historical/forensic code and is currently unused in `src/` — latent risk, not an active exploit claim. PayPal disabled by default/manual flow only.
- **Financial-safety rules (Phase-0 historical):** the Phase-0 Tax API / SACU currency (ZAR, NAD, BWP, SLE, SZL) / data-residency (EU GDPR, US CCPA, SACU local storage) components are historical requirements recorded as provenance (see "Historical Phase-0 Decisions" below + `docs/DECISION_LOG.md` → D-0002). They are **NOT implemented** and are `PROPOSED / REQUIRES HUMAN DECISION`, not claims of current Commerce capability.

## Historical Phase-0 Decisions (Provenance Record)

- **Sources:** `docs/archive/CURRENT_STATE (2).md` and `docs/archive/DECISION_LOG (2).md` (Work ID AT-0000, Phase 0, dated 2026-09-04) — the first-generation governance record, superseded by the AT-0001 control system (D-0001) and preserved **unchanged**. Entries below are provenance only — **NOT** current decisions and **NOT** verified present-state capability.
- Cross-recorded with individual current statuses in `docs/DECISION_LOG.md` → **D-0002** (HISTORICAL / PROPOSED). Nothing historical was re-accepted.
- **Financial Safety Rules** (Phase-0 ACCEPTED → **PROPOSED / REQUIRES HUMAN DECISION — NOT ACCEPTED**), three required components from the Phase-0 record:
  1. Tax API (Stripe/Avalara institution-configurable).
  2. Currency conversion with SACU region overrides (ZAR, NAD, BWP, SLE, SZL special handling).
  3. Data residency/sovereignty compliance logging (EU GDPR, US CCPA, SACU local storage).
  - Per-country rules configuration-driven; audit-trail requirements mandatory per law (per the Phase-0 record).
- **Current-state classification:** the three components above are requirements/recommendations — there is NO verified payment/tax/currency/residency implementation in the current repository. Current Commerce is `PARTIAL` (server-authoritative bulk-lesson intent flow; **reconciliation missing**; latent unused `startCheckout` client-amount path; see Commerce Findings and `docs/AUDIT_BASELINE_AT-0001.md`). SACU/currency/tax/residency content exists nowhere else in the current control docs.
- **Phase-0 architecture decisions requiring current human decision:** Virtual Lab Domain, Confusion/Fear Step hybrid model, External Simulations approval module, Identity Matching hybrid model, and the postponed stack items ATD-0009 (testing framework), ATD-0010 (deployment platform) — see `docs/DECISION_LOG.md` → D-0002. **ATD-0011 (authentication provider) is no longer unresolved: `ACCEPTED` — Supabase Auth** (`docs/DECISION_LOG.md` → D-0003; authentication provider production configuration remains `NOT VERIFIED`).

## Quality / Security / Deployment Findings

- Only 3 test files; no comprehensive RLS automated verification; no meaningful assignment/quiz/assessment isolation test coverage.
- Build/typecheck evidence exists (previously observed pass).
- CI/CD not found. Security verification incomplete.

## Documentation Contradictions

- Several architecture-inventory documents under `docs/archive/` are stale (`architecture-inventory.md`, `architecture-inventory-v2.md`, `architecture-inventory-v3-arena.md`, `askatutorlive-arena-final.md`): they reference deleted paths/components/hooks/functions and have wrong file counts.
- `docs/audits/AUDITS_*` and `docs/audits/GAP_REGISTER.md` were substantially more current. `README.md` was generic/boilerplate (rewritten as an evidence-based entry document in RESTRUCTURE-0001).
- Phantom resources: `assignment_submissions`, `LearningRecordRepository`.
- Shim retirement incomplete: 3 shims plus `room-access.ts` remain per audit evidence (`src/lib/{access,entitlements,sim-lab}.functions.ts` + `src/lib/room-access.ts`).
- These stale/dead resources are recorded here and in `docs/BACKLOG.md`; they are NOT deleted or fixed during AT-0001.

## Roadmap Position

See `docs/AUDIT_BASELINE_AT-0001.md` → `ROADMAP POSITION` for the evidence-based determination. Summary: foundational identity/auth/layering/deployment capabilities exist; assessment/mastery/learning-state is essentially absent; applied-DB/RLS birth-to-verification is now largely complete (AT-0002 verified the applied schema + RLS policy definitions live against production, source↔applied MATCH). The one remaining unresolved boundary is **runtime cross-learner (A vs B) DB/RLS verification**, which requires a populated/authorized test environment with two learner identities. The next work item is AT-0002, which is `PARTIALLY VERIFIED` (applied-DB/RLS verified; cross-learner runtime NOT VERIFIED — see Isolation Findings / BACKLOG).
