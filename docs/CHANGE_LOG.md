# ASKATUTORLIVE — CHANGE LOG

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

This document records meaningful changes chronologically. Every work item records what changed, when, and why.

---

## 2. CHANGE ENTRIES

### AT-0000: Phase 0 Documentation Creation

| Field   | Value                                                           |
| ------- | --------------------------------------------------------------- |
| Work ID | AT-0000                                                         |
| Date    | 2026-09-04                                                      |
| Phase   | 0                                                               |
| Purpose | Create all Phase 0 documentation and engineering control system |

#### FILES CREATED

- .gitignore
- docs/PRODUCT_CONSTITUTION.md
- docs/CONFIRMED_REQUIREMENTS.md
- docs/ARCHITECTURE.md
- docs/DOMAIN_MAP.md
- docs/PRESENTATION_ARCHITECTURE.md
- docs/APPLICATION_ARCHITECTURE.md
- docs/DOMAIN_ARCHITECTURE.md
- docs/DATA_ARCHITECTURE.md
- docs/SECURITY_ARCHITECTURE.md
- docs/AI_ARCHITECTURE.md
- docs/VIRTUAL_LAB_ARCHITECTURE.md
- docs/COMMUNITY_ARCHITECTURE.md
- docs/INSTITUTION_ARCHITECTURE.md
- docs/COMMERCE_ARCHITECTURE.md
- docs/FAILURE_MODEL.md
- docs/DEPENDENCY_GRAPH.md
- docs/WORK_PROTOCOL.md
- docs/DECISION_LOG.md
- docs/CURRENT_STATE.md
- docs/BACKLOG.md
- docs/CHANGE_LOG.md
- docs/MASTER_PLAN.md

#### FILES MODIFIED

- (none — initial creation)

#### FILES DELETED

- (none)

#### COMPONENTS ADDED

- Documentation system (22 files)
- Engineering control system (state tracking)
- Decision tracking system

#### COMPONENTS MODIFIED

- (none)

#### DATABASE CHANGES

- (none)

#### API CHANGES

- (none)

#### SECURITY CHANGES

- (none)

#### TESTS

- (none)

#### VERIFICATION

- Documentation cross-validated against Phase 0 requirement checks
- All 17 validation checks PASSED (see CURRENT_STATE.md)
- Phase 0 status: COMPLETE-PENDING-REVIEW (awaiting human approval)

#### DECISIONS

- ATD-0001: TypeScript — ACCEPTED
- ATD-0002: React — ACCEPTED
- ATD-0003: Vite — ACCEPTED
- ATD-0004: Tailwind CSS — ACCEPTED
- ATD-0005: PostgreSQL via Supabase — ACCEPTED
- ATD-0006: Three.js — ACCEPTED
- ATD-0007: Whiteboard Assessment — ACCEPTED
- ATD-0008: Mandatory Initial Assessment — ACCEPTED

#### KNOWN ISSUES

- Testing framework not yet decided (ATD-0009)
- Deployment platform not yet decided (ATD-0010)
- Authentication provider not yet decided (ATD-0011)

#### NEXT DEPENDENCY

- Complete MASTER_PLAN.md, BACKLOG.md, CHANGE_LOG.md
- Cross-validate documentation consistency
- Resolve pending decisions

---

### RESTRUCTURE-0001: Controlled Documentation Restructuring & Evidence Cleanup

| Field   | Value                                                                                                                                                                                  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work ID | RESTRUCTURE-0001 (documentation-only)                                                                                                                                                  |
| Date    | 2026-09-08                                                                                                                                                                             |
| Phase   | 0 (documentation organization)                                                                                                                                                         |
| Purpose | Reorganize documentation/evidence into a navigable structure while preserving all historical, forensic and audit provenance. No source, migration, database, or configuration changes. |

#### FILES MOVED

- `docs/{ARCHITECTURE,APPLICATION_ARCHITECTURE,DOMAIN_MAP,DOMAIN_ARCHITECTURE,DATA_ARCHITECTURE,PRESENTATION_ARCHITECTURE,COMMERCE_ARCHITECTURE,COMMUNITY_ARCHITECTURE,INSTITUTION_ARCHITECTURE,VIRTUAL_LAB_ARCHITECTURE,SECURITY_ARCHITECTURE,AI_ARCHITECTURE,DEPENDENCY_GRAPH,FAILURE_MODEL}.md` → `docs/architecture/`
- `AUDITS_AI_QUOTA_DESIGN.md`, `AUDITS_AI_SERVER_BOUNDARY.md`, `AUDITS_ARCHITECTURAL_RECONCILIATION.md`, `GAP_REGISTER.md`, `CATEGORY2_PRODUCTION_VERIFICATION_RESULT.md`, `ZERO_META.json` → `docs/audits/`
- `askatutorlive-source.txt`, `askatutorlive-supabase.txt` → `docs/evidence/bundles/`
- `forensic_batch_2/` → `docs/evidence/forensic/forensic_batch_2/` (preserved intact)
- 36 root `*.sql` inspection queries + `supabase_schema.json` + `supabase_schema.txt` → `docs/evidence/queries/`
- `architecture-inventory.md`, `architecture-inventory-v2.md`, `architecture-inventory-v3-arena.md`, `askatutorlive-arena-final.md`, `askatutor-tree.txt`, `src-tree.txt`, `architecture-file-inventory.csv` → `docs/archive/`
- `docs/MASTER_PLAN (2).md`, `docs/WORK_PROTOCOL (2).md`, `docs/BACKLOG (2).md`, `docs/DECISION_LOG (2).md`, `docs/CURRENT_STATE (2).md` → `docs/archive/` (superseded Phase-0 governance, content unchanged)

#### FILES MODIFIED

- `README.md` — rewritten from boilerplate scaffold to an evidence-based entry document.
- 14 files under `docs/architecture/` — prepended `STATUS: HISTORICAL / PLANNING / ASPIRATIONAL` banner (content otherwise unchanged).
- `docs/CHANGE_LOG.md` — this entry.
- `docs/DECISION_LOG.md`, `docs/CURRENT_STATE.md`, `docs/AUDIT_BASELINE_AT-0001.md`, `docs/BACKLOG.md` — path references updated to the new locations (substantive meaning unchanged).

#### FILES DELETED

- (none)

#### VERIFICATION

- All moves performed with `git mv` (history traceable). SHA-256 unchanged for all moved files except the intent: status-banner prepend on the 14 architecture docs.
- `supabase_schema.json`/`.txt` confirmed byte-identical (same SHA-256), UTF-16 Supabase CLI `{
"error": ... }` failure records, not schemas; preserved (not deleted) under `docs/evidence/queries/`.
- No duplicate current governance content was created; no historical decision was re-accepted.

---

### ATD-0011-CLOSURE: Authentication Provider Decision — Supabase Auth (ACCEPTED)

| Field   | Value                                                                                                                                                                                  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work ID | ATD-0011-CLOSURE (documentation-only)                                                                                                                                                  |
| Date    | 2026-09-09                                                                                                                                                                             |
| Phase   | Governance (decision closure)                                                                                                                                                          |
| Purpose | Record the current ATD-0011 authentication-provider decision as `ACCEPTED` in the authoritative governance documents. No source, migration, database, Supabase, or deployment changes. |

#### FILES MODIFIED

- `docs/DECISION_LOG.md` — ATD-0011 status changed `PROPOSED / PENDING` → `ACCEPTED`; new D-0003 entry (decision, scope, rationale, provenance); D-0002 provenance row updated to reference D-0003.
- `docs/CURRENT_STATE.md` — ATD-0011 removed from the unresolved Phase-0 decisions list; accepted decision + `NOT VERIFIED` operational status recorded in DECISIONS.
- `docs/CHANGE_LOG.md` — this entry.

#### FILES DELETED

- (none)

#### DATABASE CHANGES

- (none)

#### API CHANGES

- (none)

#### SECURITY CHANGES

- (none)

#### TESTS

- (none)

#### DECISIONS

- ATD-0011: Authentication provider = **Supabase Auth** — `ACCEPTED` (current, explicit human approval; historical provenance preserved unchanged in `docs/archive/DECISION_LOG (2).md`).

#### KNOWN ISSUES / REMAINING OPEN

- Authentication provider production configuration = `NOT VERIFIED` (Supabase Email provider enablement, Google provider enablement, Site URL, OAuth redirect allow-list, production authentication retest) — separate operational follow-ups, not closed by this decision.
- Current Google/email login failure (`Unsupported provider: provider is not enabled`) is a project-level provider-configuration matter, NOT evidence against the accepted provider.
- Open follow-ups retained: `getClaims()` vs `getUser()` session-hardening decision, explicit admin assertion hardening, authentication/RLS test coverage, authentication gap-register re-baselining.

---

### INSTITUTIONAL-LEARNER-DESIGN-0001: Institutional Learner Architecture — Design Acceptance (INST-DEC-1, INST-DEC-5)

| Field   | Value                                                                                                                                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work ID | INSTITUTIONAL-LEARNER-DESIGN-0001 (design + decision closure; documentation-only)                                                                                                                                   |
| Date    | 2026-09-10                                                                                                                                                                                                          |
| Phase   | Governance (architecture design + decision closure)                                                                                                                                                                 |
| Purpose | Persist the accepted institutional/learning architecture design and record the two explicit product-owner decisions (INST-DEC-1, INST-DEC-5). No source, migration, database, Supabase, API, or deployment changes. |

#### FILES CREATED

- `docs/architecture/INSTITUTIONAL_LEARNER_DESIGN.md` — full 18-section design (evidence, domain model, journeys, prerequisite/assessment/affective architecture, authorization matrix, multi-institution, options, recommended architecture, decision register, risks, migration impact, next action). Status: `ACCEPTED DESIGN — NOT IMPLEMENTED`.

#### FILES MODIFIED

- `docs/DECISION_LOG.md` — prior "Assessment / Learning Architecture — PROPOSED / UNACCEPTED" entry marked superseded in part (bounded scope only); added **D-0004** (INST-DEC-1: M:N memberships + §11 links coexistence) and **D-0005** (INST-DEC-5: bounded learning/assessment target model), both `ACCEPTED`.
- `docs/PRODUCT_CONSTITUTION.md` — §11 amendment note (records INST-DEC-1 coexistence; does not authorize implementation).
- `docs/CURRENT_STATE.md` — DECISIONS and FUTURE updated for the accepted design target (implementation still requires separately authorized work items).
- `docs/CHANGE_LOG.md` — this entry.

#### FILES DELETED

- (none)

#### DATABASE CHANGES

- (none)

#### API CHANGES

- (none)

#### SECURITY CHANGES

- (none)

#### TESTS

- (none)

#### DECISIONS

- INST-DEC-1: Institution path = **Both: first-class M:N memberships + Constitution §11 links** — `ACCEPTED` (2026-09-10, D-0004).
- INST-DEC-5: Bounded learning/assessment framework = **accepted target model** — `ACCEPTED` (2026-09-10, D-0005).

#### KNOWN ISSUES / REMAINING OPEN

- Design acceptance does **NOT** authorize implementation; each of design §16 phases 1–5 requires its own authorized engineering work item (Phase 1 spike recommended: `topics` + `topic_prerequisites` cycle validator).
- Assessment-instrument **content**, affective instrument/frequency/retention, and mastery-validity policy = UNKNOWN (INST-DEC-6/7/9, product + legal).
- INST-DEC-2..10 remain `PROPOSED / PENDING` (`docs/architecture/INSTITUTIONAL_LEARNER_DESIGN.md` §14).
- AT-0002 residual grant gaps (`profiles`/`user_roles` + ~18 sibling tables) still block new-table REST integration until separately remediated (BACKLOG).

---

### LEARNING-ASSESSMENT-DESIGN-0001: Learning & Assessment Design Spike (PROPOSED — documentation-only)

| Field   | Value                                                                                                                                                                                                                 |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work ID | LEARNING-ASSESSMENT-DESIGN-0001 (product/learning-design spike)                                                                                                                                                       |
| Date    | 2026-09-10                                                                                                                                                                                                            |
| Phase   | Governance (design spike; targets Phase 4–6 learning backbone)                                                                                                                                                        |
| Purpose | Repository-first product/learning-design analysis resolving the semantics and assessment-instrument design needed before engineering. No source, migration, database, SQL, API, UI, seed, RLS, or production changes. |

#### FILES CREATED

- `docs/architecture/LEARNING_ASSESSMENT_DESIGN.md` — statements: `STATUS: PROPOSED DESIGN — NOT IMPLEMENTED`. Contents: evidence inventory, current-state assessment, domain terminology, learning architecture, prerequisite-graph design, assessment model (target types × lifecycle purposes, item categories), affective-learning model, diagnosis scenarios, intervention model, evidence, mastery semantics, learning decisions, tutor/instructor authority, institutional boundaries, AI boundaries, MVP learning model, INST-DEC-2..10 mapping (all remain PROPOSED/PENDING), engineering contract, risks/gaps/unknowns, next action.

#### FILES MODIFIED

- `docs/CHANGE_LOG.md` — this entry.
- `docs/CURRENT_STATE.md` — pointer to the PROPOSED design document added (no state claim changed).

#### FILES DELETED

- (none)

#### DATABASE CHANGES

- (none)

#### API CHANGES

- (none)

#### SECURITY CHANGES

- (none)

#### TESTS

- (none)

#### DECISIONS

- NONE — no decision was accepted, changed, or re-classified. D-0004/D-0005 untouched; INST-DEC-2..10 remain PENDING (`docs/DECISION_LOG.md` rules).

#### KNOWN ISSUES / REMAINING OPEN

- Verdict: `READY WITH PRODUCT DECISIONS REQUIRED` — product/learning acceptance list is in design §21 (vocabulary, item sets, affective signal set, diagnosis mapping, mastery semantics, decision autonomy); INST-DEC-6/7/8/9 and UN-007 remain open for acceptance; instrument content and affective retention/legal posture = UNKNOWN — REQUIRES VERIFICATION.

---

### PHASE0-CLOSURE-0001: Phase 0 (AT-0000) Exit-Gate Closure Assessment (AT-0003)

| Field   | Value                                                                                                                                                                                                                                                                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work ID | PHASE0-CLOSURE-0001 → registers permanent work ID AT-0003 (documentation-only)                                                                                                                                                                                                                                                                           |
| Date    | 2026-09-10                                                                                                                                                                                                                                                                                                                                               |
| Phase   | Governance (Phase 0 exit-gate closure)                                                                                                                                                                                                                                                                                                                   |
| Purpose | Record the evidence-based exit-gate assessment and recommended verdict for the historical Phase 0 exercise (AT-0000): 10-gate closure table (9 VERIFIED, 1 NOT VERIFIED), A/B/C/D/E classification of every unresolved item, and reconciliation of the dual Phase-0 roadmap views. No source, migration, database, Supabase, API, or deployment changes. |

#### FILES MODIFIED

- `docs/CURRENT_STATE.md` — added "Phase 0 (AT-0000) — Exit-Gate Closure Assessment" section (gate table 9/10 VERIFIED; recommended verdict `CLOSED WITH EXPLICIT FOLLOW-UPS`; classification summary; carried-forward pointer).
- `docs/DECISION_LOG.md` — added **D-0006** (governance closure assessment; verdict `CLOSED WITH EXPLICIT FOLLOW-UPS` **recommended**, pending human acceptance; full carried-forward follow-up list; explicitly NOT an application-architecture decision).
- `docs/MASTER_PLAN.md` — §1 governance rule reconciled with D-0005 (bounded acceptance carve-out, remainder stays PROPOSED/UNACCEPTED); Phase-0 roadmap line annotated (historical AT-0000 closed via AT-0003); Work Item Register gained **AT-0003**.
- `docs/BACKLOG.md` — registered **AT-0003** (COMPLETED assessment, verdict pending human acceptance) and the **CF-001..CF-010** carried-forward registers (item / type / owner-phase / status).
- `docs/CHANGE_LOG.md` — this entry.

#### FILES DELETED / CREATED

- (none)

#### DATABASE CHANGES

- (none)

#### API CHANGES

- (none)

#### SECURITY CHANGES

- (none)

#### TESTS

- (none)

#### DECISIONS

- D-0006: Phase 0 exit-gate closure assessment — recommended verdict `CLOSED WITH EXPLICIT FOLLOW-UPS`, **PENDING HUMAN ACCEPTANCE** (governance/process kind; not an application-architecture decision).

#### KNOWN ISSUES / REMAINING OPEN

- Verdict is a recommendation until the reviewer formally accepts it (DECISION_LOG D-0006).
- Phase 1 remains blocked on ATD-0009 (testing framework) and ATD-0010 (deployment platform) — CF-001/CF-002.
- All other carried-forward items are separately owned per CF-001..CF-010; none blocks Phase 0 completeness.

---

### AT-0004: Presentation Foundation, Public Trust Pages & Build Repair

| Field   | Value                                                                                                                                                                                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work ID | AT-0004                                                                                                                                                                                                                                                                               |
| Date    | 2026-09-13                                                                                                                                                                                                                                                                            |
| Phase   | 1 (presentation-foundation / public trust pages, branch `presentation/public-trust-pages`)                                                                                                                                                                                            |
| Purpose | Merge `origin/main` into the public-trust-pages branch; verify the presentation/navigation foundation; correct the Windows build; normalise formatting; classify the entire working tree into an evidence-based change set. Source/DB/security changes: none beyond the merged pages. |

#### FILES CREATED

- `audit-evidence/` — AT-0004 working-tree classification + verification artifacts: `working-tree-classification.json`, `classify-worktrees.mjs`, `verify-quoted-docs.mjs`, `AT-0004.md`. Included in the AT-0004 substantive commit (audit evidence is tracked in this repository, cf. `docs/evidence/`).

#### FILES MODIFIED (committed on branch — previous commits)

- Public trust pages and navigation foundation (see `docs/CURRENT_STATE.md` → AT-0004, "Public trust pages" / "Navigation foundation"): commits `12d7daf`..`e2e774b` (public experience), `6537d67`..`a31e8f5` (trust pages + footer links), `10044d1`..`404ea77` (navigation-visibility/shared-shell/role-aware command palette), plus merge `31dc916`.

#### FILES MODIFIED (uncommitted, AT-0004 working tree — substantive subset)

- `package.json` — `build`/`build:dev`/`build:node`/`build:vercel` switched to `cross-env`; `cross-env@10.1.0` added to `devDependencies`; `nitro` repositioned (cosmetic).
- `src/routes/__root.tsx` — `ErrorComponent` retyped with `ErrorComponentProps` (tsc fix) + prettier.
- `src/routeTree.gen.ts` — regenerated route tree adds `/about`, `/contact`, `/privacy`, `/terms`.
- `.prettierignore` — added `docs/evidence`, `audit-evidence`.
- `.gitignore` — added `.env*`.
- Documentation (this change set): `docs/CURRENT_STATE.md`, `docs/DECISION_LOG.md` (D-0007 — includes the STOP verdict: bun authoritative, pnpm NOT adopted, `pnpm-lock.yaml`/`pnpm-workspace.yaml` excluded), `docs/CHANGE_LOG.md` (this entry), `docs/BACKLOG.md` (AT-0004 register).
- `docs/archive/{BACKLOG,CURRENT_STATE,DECISION_LOG,MASTER_PLAN,WORK_PROTOCOL} (2).md` — prettier-only reformat (Git-quoted paths; classified as FORMATTING_ONLY by `verify-quoted-docs.mjs`; committed in the formatting-only commit).

#### FILES MODIFIED (post-commit, D-0007 follow-up — entities pin resolution)

- `package.json` — `pnpm.overrides.entities = 4.5.0` block removed (dead config; ignored by pnpm 11 and Bun; pin proven NOT REQUIRED — see DECISION_LOG D-0007). Only change = 5 lines deleted.
- `bun.lock` — reconciled by `bun install` to the manifest (`cross-env@10.1.0` at root, was stale `7.0.3`; `@react-three/drei` nested `cross-env@7.0.3` retained; entities unchanged: 4.5.0 top-level, 6.0.1 nested in parse5).

#### FILES MODIFIED (uncommitted, AT-0004 formatting-only — 263 files)

- Pure `prettier --write` rewrites across `src/`, `docs/`, `tests/`, `README.md`, `DEPLOYMENT.md` — proven `working tree == prettier.format(HEAD)` byte-for-byte (`audit-evidence/working-tree-classification.json`; the 5 `docs/archive/*(2).md` files verified by `audit-evidence/verify-quoted-docs.mjs`). Zero content drift. Committed as the formatting-only commit.

#### FILES DELETED

- (none)

#### DATABASE CHANGES

- (none — production and non-prod Supabase untouched in AT-0004)

#### API CHANGES

- (none)

#### SECURITY CHANGES

- (none)

#### TESTS

- Working-tree reformat of the 2 existing test files (`ai-entitlement.test.ts`, `room-access.test.ts`) — formatting only; no test-logic change.

#### VERIFICATION

- Merge: `VERIFIED` — HEAD `31dc916`; 3 conflicts (terms/privacy/MinimalFooter) resolved intentionally; `git ls-files -u` = 0.
- Navigation foundation: `VERIFIED` (source-level consistency inspection of `navigation-visibility`, `AppShell`, `Navbar`, `MobileTabBar`, `CommandPalette`, auth/role boundaries).
- TypeScript: `pnpm exec tsc --noEmit` → 0 errors.
- Prettier: `pnpm exec prettier --check .` → clean (after `pnpm format`; 474 prior prettier violations across 71 files resolved).
- Lint: `pnpm lint` → 112 known baseline problems (74 errors / 38 warnings; 67 no-explicit-any, 21 only-export-components, 15 exhaustive-deps, 6 prefer-const, 2 unused eslint-disable, 1 no-empty; 11 flagged files under `docs/evidence/forensic/...`). TECHNICAL DEBT, not AT-0004 blockers.
- Build: Windows `NODE_OPTIONS=`/`NITRO_PRESET=` prefix failure corrected via `cross-env`; `pnpm build` → SUCCESS (exit 0, ~29 s).
- Working-tree classification: 272 ` M` + 3 `??`; 263 formatting-only (258 classifier-verified `FORMATTING_ONLY` + 5 `docs/archive/*(2).md` reformatted), 9 substantive modified (the 5 config/source files above + the 4 governance docs `docs/{BACKLOG,CHANGE_LOG,CURRENT_STATE,DECISION_LOG}.md`), 4 audit-evidence artifacts created, 2 untracked (`pnpm-lock.yaml`, `pnpm-workspace.yaml`). Status: VERIFIED (not PRODUCTION-VERIFIED).
- Commit record: two commits created (Commit 1 = 13 substantive files incl. `audit-evidence/`; Commit 2 = 263 formatting-only files). `pnpm-lock.yaml`/`pnpm-workspace.yaml` NOT committed (D-0007 STOP).

#### DECISIONS

- D-0007 (`docs/DECISION_LOG.md`, RECORDED, engineering/process): `cross-env` build fix applied+verified; `pnpm.overrides.entities=4.5.0` ignored by pnpm 11 = NOT APPLIED (`UNKNOWN — REQUIRES VERIFICATION`); **package-manager decision STOP — bun authoritative; pnpm NOT adopted** (untruncated grep evidence: README "managed with bun", DEPLOYMENT.md bun commands/oven/bun Dockerfile/bunx wrangler, tracked `bun.lock` + `bunfig.toml`, AUDIT_BASELINE "Package manager: bun", 3 `bun:test` test files, no `packageManager` field; pnpm signal limited to the dead `pnpm` field + untracked lockfiles → contradiction rule → NOT DECIDED, pnpm excluded from commits). No application-architecture decision accepted by AT-0004.

#### KNOWN ISSUES / REMAINING OPEN

- ~~`entities@4.5.0` override ineffective (see D-0007) — resolve (remove dead field or move to `pnpm-workspace.yaml` `overrides`).~~ **RESOLVED — NOT REQUIRED; dead `pnpm.overrides` removed from `package.json`.** Clean Bun install verified (822 packages, tsc 0, prettier clean, lint 112 baseline, build SUCCESS).
- Package-manager split (`bun.lock` tracked canonical vs untracked pnpm tooling) unresolved — requires an explicit human decision.
- 112 baseline lint problems remain (separate authorized fixing item required).

---

### AT-0005: Auth/Origin Verification (`localhost:3000`) & Self-Service Checkout Enablement

| Field   | Value                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work ID | AT-0005                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Date    | 2026-09-14                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Phase   | 1 (branch `presentation/public-trust-pages`)                                                                                                                                                                                                                                                                                                                                                                                                    |
| Purpose | Evidence-classify the `localhost:3000`/Lovable scaffold code (inert legacy — no code change); wire the previously-latent `PaymentGateway.startCheckout` behind a server-authoritative student self-service checkout use-case; author the migration fixing the two commerce SQL blockers (lost `authenticated` grant on `create_bulk_lesson_intent`; missing prepaid-lessons credit in `finalize_payment_succeeded`). No commit made in AT-0005. |

#### FILES CREATED

- `src/application/use-cases/commerce/initiate-checkout.ts` — `initiateCheckout` (POST, `[requireAppDependencies]`, zod `{tutorId: uuid, lessons: 1–100, lessonMinutes: 30|45|60|90|120}`): `context.supabase.rpc("create_bulk_lesson_intent", {_tutor, _lessons, _lesson_minutes, _method:"online"})` (server-derived amount) → `deps.paymentGateway.startCheckout({amountCents, currency, method:"online", reference, returnUrl, cancelUrl, metadata})` with `returnUrl = ${base}/api/checkout/return?intent=` and `cancelUrl = ${base}/checkout/cancelled?intent=`. Returns `{intentId, providerSlug, approvalUrl, providerRef}`. Plus `getCheckoutState` (GET, RLS-enforced ownership) → `{id, status, gross_cents, currency, provider, method, created_at}` or null.
- `supabase/migrations/20260914120000_self_service_checkout_intent_finalize.sql` — (1) `GRANT EXECUTE ... ON FUNCTION public.create_bulk_lesson_intent(...) TO authenticated` (restores the grant lost in the 2026-08-12 hardening); (2) replaces `finalize_payment_succeeded` so it also INSERTs the `prepaid_lessons` reservation when `metadata->>'kind' = 'bulk_lessons'` (idempotent via `NOT EXISTS`), then re-`REVOKE PUBLIC` + `GRANT service_role`.

#### FILES MODIFIED

- `src/routes/_authenticated/pay-tutor.tsx` — replaced the direct manual RPC with `useServerFn(initiateCheckout)` + `window.location.assign(result.approvalUrl)`; removed the now-unused `supabase` import.
- `src/routes/checkout.success.tsx` — rewritten for the authoritative post-payment state page (slash route `/checkout/success`): `validateSearch({intent})`, `useQuery(getCheckoutState)` with 5 s refetch while pending, renders only server-confirmed states (succeeded / pending-processing / failed / refunded / not-found), amount from server `gross_cents` + `currency`.
- `src/presentation/domains/7-commerce-financial/payments/BulkLessonConfig.tsx` — button label "Create payment request" → "Proceed to payment"; copy updated to mention secure checkout and auto-crediting of lessons.
- Documentation (this change set): `docs/CURRENT_STATE.md`, `docs/DECISION_LOG.md` (D-0008), `docs/CHANGE_LOG.md` (this entry), `docs/BACKLOG.md` (AT-0005 register; latent-financial-risk status update).

#### FILES DELETED

- (none)

#### DATABASE CHANGES

- Authored (NOT applied to any environment — application requires separate authorization): `20260914120000_self_service_checkout_intent_finalize.sql` — restores the `authenticated` EXECUTE grant on `create_bulk_lesson_intent`; replaced `finalize_payment_succeeded` now credits `prepaid_lessons` for `kind='bulk_lessons'` intents on the service_role webhook/capture path.

#### API CHANGES

- New server functions: `initiateCheckout` (POST) and `getCheckoutState` (GET); `pay-tutor` now consumes `initiateCheckout` instead of calling Supabase directly.

#### SECURITY CHANGES

- Client can no longer supply an amount: `lessonMinutes`/`lessons` are zod-enumerated/numeric-capped on the server and the amount is re-derived server-side by `create_bulk_lesson_intent`; ownership of `getCheckoutState` is enforced by RLS on `payment_intents`.

#### TESTS

- (none added; verification below)

#### VERIFICATION

- `bunx tsc --noEmit` → 0 errors.
- `bunx eslint` on the 4 changed files → clean.
- `bunx prettier --write` applied to `initiate-checkout.ts` + `checkout.success.tsx`; `bunx prettier --check .` → clean.
- `bun run lint` → 112 baseline (74 err / 38 warn) — unchanged, no new issues.
- `bun run build` → SUCCESS.
- `git diff --check` → clean (LF→CRLF warnings only). Not `PRODUCTION-VERIFIED` (no live PayPal or DB migration execution in AT-0005).

#### DECISIONS

- D-0008 (`docs/DECISION_LOG.md`, RECORDED, engineering/process — NOT an application-architecture decision): `localhost:3000`/Lovable scaffold = INERT/DEPRECATED legacy code (evidence: `previewAuthStorage.ts` activation conditions, 8080 dev origin, git history `4c74239`/`59710c5`, SSR smoke no leakage) — no auth code change; `startCheckout` wired server-authoritatively (latent risk mitigated on the live path); two SQL blockers fixed in the new migration; forensic client-amount `checkout.functions.ts` must never be resurrected.

#### KNOWN ISSUES / REMAINING OPEN

- Migration file authored but **not applied** to any database (no DB access in AT-0005; environment application needs separate authorization + the mandatory migration verification).
- Reconciliation/quarantine for commerce still missing (P3 backlog).
- `APP_SHELL_PREFIXES` dot-form (`/checkout.success`) vs slash-form (`/checkout/success`) drift reproduced (navigation-visibility debt); `whiteboard-review/$sessionId` remains a stub.
- Lovable/preview scaffold removal (including `localhost:3000` references) recommended as a separate follow-up; no commit made in AT-0005 (including the untracked `pnpm-lock.yaml`/`pnpm-workspace.yaml`).

---

### FC-003: Apply + verify the AT-0005 self-service checkout migration on the target database (NON-PROD)

| Field   | Value                                                                                                                                                                                                                                                                                                                                                                               |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work ID | FC-003                                                                                                                                                                                                                                                                                                                                                                              |
| Date    | 2026-09-14                                                                                                                                                                                                                                                                                                                                                                          |
| Phase   | 1 (commerce / DB verification on non-prod `askatutorlive-at0002-nonprod` ref `rwpxaejhouunxlcibpou`; branch `presentation/public-trust-pages`, no commit)                                                                                                                                                                                                                           |
| Purpose | Apply `20260914120000_self_service_checkout_intent_finalize.sql` to the non-prod environment and verify the two corrections: `create_bulk_lesson_intent` executable by `authenticated`, and a completed bulk capture credits `prepaid_lessons` exactly once. Classification: `PARTIALLY VERIFIED` (DB layer verified; live provider path BLOCKED). No source or production changes. |

#### FILES MODIFIED

- Documentation (this change set): `docs/CURRENT_STATE.md` (FC-003 subsection + NEXT ACTION/FUTURE updates), `docs/DECISION_LOG.md` (D-0009), `docs/CHANGE_LOG.md` (this entry), `docs/BACKLOG.md` (FC-003 status COMPLETED — non-prod, PARTIALLY VERIFIED).

#### FILES DELETED

- (none)

#### DATABASE CHANGES

- Applied to **non-prod** `rwpxaejhouunxlcibpou` via the Management API migrations endpoint (isolated to the non-prod ref; production untouched): version `20260914073900` (API-assigned timestamp) — the existing `20260914120000_self_service_checkout_intent_finalize.sql` was the only unapplied repo migration (applied count 73 → 74).
- Result (verified): `create_bulk_lesson_intent` EXECUTE restored to `authenticated` (previously `{postgres=X/postgres}` — unreachable by any client); `finalize_payment_succeeded` now credits `prepaid_lessons` for `kind='bulk_lessons'` intents (idempotent via `NOT EXISTS`); `finalize_payment_succeeded` grant boundary unchanged (service_role only); RLS policy counts unchanged.
- Rollback payload (prior function definition + grant state) captured at `%LOCALAPPDATA%\Temp\opencode\fc003-rollback.sql`; evidence artifacts (behavior-test SQL/payloads, pre/post grant state) under `%LOCALAPPDATA%\Temp\opencode\fc003-*` (session-local, not in repo).

#### API CHANGES

- (none — server functions `initiateCheckout`/`getCheckoutState` were authored in AT-0005, unchanged here)

#### SECURITY CHANGES

- Verified boundary changes only: the `authenticated` EXECUTE grant on `create_bulk_lesson_intent` (the target of the migration) and the unchanged service_role-only `finalize_payment_succeeded`. `SET ROLE authenticated` → `permission denied for function finalize_payment_succeeded` (boundary intact).

#### TESTS

- DB behavior suite (5/5 PASS; single transactional batch + `ROLLBACK` → zero residue): intent creation (amount/commission/net server-derived, metadata), argument-signature proof (no amount parameter), idempotent `finalize_payment_succeeded` (ledger 2 / prepaid 1 / status `succeeded`), scope guard rejection (`Find Tutors subscription required`), service_role boundary (`permission denied` under `authenticated`).

#### VERIFICATION

- Pre-apply bug reproduced (proacl `{postgres=X/postgres}`); post-apply `has_function_privilege` authenticated=true / anon=false; function body contains the bulk branch; RLS policy counts unchanged. Regression at baseline: `bunx tsc --noEmit` 0; `bunx prettier --check .` clean; `bun run lint` 112 (74 err / 38 warn); `bun run build` SUCCESS.
- **NOT verified:** live provider (PayPal sandbox) end-to-end — `payment_providers.paypal` `is_enabled=false`, `credentials_ref=PAYPAL`, no `PAYPAL_*` env vars on host (BLOCKED). Production apply + production verification NOT performed. Not `PRODUCTION-VERIFIED`.

#### DECISIONS

- D-0009 (`docs/DECISION_LOG.md`, RECORDED, engineering/process — NOT an application-architecture decision): FC-003 non-prod migration apply + DB-layer verification; classification `PARTIALLY VERIFIED`; live provider leg blocked; production apply remains separately authorized.

#### KNOWN ISSUES / REMAINING OPEN

- **Only unverified leg:** a live PayPal sandbox checkout/capture test (requires sandbox credentials; provider disabled + no env vars). Per AT-0005 NEXT ACTION, that test precedes a separately authorized production apply + verify.
- No commit made in FC-003 (including the untracked `pnpm-lock.yaml`/`pnpm-workspace.yaml`).

---

### FC-004: PayPal SANDBOX configuration + end-to-end checkout verification (BLOCKED)

| Field   | Value                                                                                                                                                                                                                                                                                         |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work ID | FC-004                                                                                                                                                                                                                                                                                        |
| Date    | 2026-09-14                                                                                                                                                                                                                                                                                    |
| Phase   | 1 (commerce / live-provider verification attempt on non-prod `rwpxaejhouunxlcibpou`; branch `presentation/public-trust-pages`, no commit)                                                                                                                                                     |
| Purpose | Determine whether the EXISTING AT-0005 checkout implementation can complete ONE genuine PayPal SANDBOX transaction in the designated NON-PRODUCTION environment. Outcome: **BLOCKED — SANDBOX CREDENTIALS UNAVAILABLE** (no transaction executed; no code/config/database change; no commit). |

#### FILES MODIFIED

- Documentation (this change set): `docs/CURRENT_STATE.md` (FC-004 subsection, NEXT ACTION update), `docs/DECISION_LOG.md` (D-0010), `docs/CHANGE_LOG.md` (this entry), `docs/BACKLOG.md` (FC-004 register).

#### FILES DELETED

- (none)

#### DATABASE CHANGES

- (none — non-prod `payment_providers.paypal` read-only: `is_enabled=false`, `mode=sandbox`, `credentials_ref=PAYPAL`; unchanged)

#### API CHANGES

- (none)

#### SECURITY CHANGES

- (none — no secret exposed, no credential invented, no provider bypass; production untouched)

#### TESTS

- (none executed — the genuine sandbox checkout is the subject under test and could not be initiated: no `PAYPAL_*` env vars anywhere, provider disabled globally, and the app runtime is wired to production, so no real checkout was started)

#### VERIFICATION

- **BLOCKED — SANDBOX CREDENTIALS UNAVAILABLE.** Evidence: `payment_providers.paypal` disabled (`is_enabled=false`, non-prod); `PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET`/`PAYPAL_WEBHOOK_ID` ABSENT in process/user/machine env and in `.env`/`.env.local`/`.env.example`; no DB secret store (`config` jsonb empty; no secret columns); app runtime `.env` points at **production** `bzjlhxmiwdkteqkzqasi` (no non-prod runtime to execute the checkout against safely — a real checkout would write `payment_intents` to production, prohibited). Sandbox API `api-m.sandbox.paypal.com` reachable; code `baseUrl('sandbox')` correct. `.env.example` documents a DB-only PayPal config mechanism the implementation does not implement (env-only `readCreds`) — recorded, no change. Regression baseline unchanged: tsc 0; prettier clean; lint 112; build SUCCESS; `git diff --check` clean.

#### DECISIONS

- D-0010 (`docs/DECISION_LOG.md`, RECORDED, engineering/process — NOT an application-architecture decision): FC-004 sandbox end-to-end verification = BLOCKED (no sandbox credentials, no non-prod runtime); no code/configuration/database change made; re-open prerequisite recorded.

#### KNOWN ISSUES / REMAINING OPEN

- **Only gap:** live PayPal sandbox end-to-end. Prerequisite (one combined human action): provision PayPal **sandbox** REST credentials (`PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET`/`PAYPAL_WEBHOOK_ID`) into an approved **non-prod runtime** (`SUPABASE_URL` → `rwpxaejhouunxlcibpou`), enable `payment_providers.paypal` in non-prod, then re-run FC-004.
- No commit made in FC-004; untracked `pnpm-lock.yaml`/`pnpm-workspace.yaml`/`audit-evidence/EMAIL_REFERENCE_AUDIT_20260913-092816.txt` remain excluded.
- Not `PRODUCTION-VERIFIED`; production apply + live-provider end-to-end separately authorized.

---

### AT-0006: Discovery vertical — `/tutors` browse + `/tutor/$id` profile conversion to the application use-case boundary

| Field   | Value                                                                                                                                                                                                                                                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work ID | AT-0006                                                                                                                                                                                                                                                                                                                                                       |
| Date    | 2026-09-14                                                                                                                                                                                                                                                                                                                                                    |
| Phase   | 1 (presentation-layer architecture remediation; branch `presentation/public-trust-pages`, no commit)                                                                                                                                                                                                                                                          |
| Purpose | Convert the remaining Discovery `SUPABASE-DIRECT` presentation routes to the established application boundary (UI → Application Use Case → Domain Port → Infrastructure Repository → Database), as recommended by the ARCHITECTURE-TO-IMPLEMENTATION GAP REPORT (slice 1 = Browse `/tutors`, slice 2 = Profile `/tutor/$id`). No DB/security/behavior change. |

#### FILES CREATED

- `src/application/use-cases/discovery/browse-tutors.ts` — `browseTutors` (GET, `[requireAppDependencies]`, zod `{subject?, search?}`): reads `context.deps.tutor.listPublicTutors()` and applies server-side subject/name filtering. (Slice 1.)

#### FILES MODIFIED

- `src/domain/ports/tutor-repository.ts` — `TutorProfile` extended from `{full_name, hourly_rate, subjects}` to the full public shape (`id`, `full_name`, `bio`, `subjects`, `hourly_rate`, `avatar_url`, `is_featured`, `avg_rating`, `review_count`); new `TutorReview` type (`id`, `rating`, `comment`, `created_at`); `TutorRepository` gains `listTutorReviews(tutorId, limit?)`.
- `src/infrastructure/repositories/tutor-repository.ts` — `getProfile` now reads the single profile row plus its review count/avg rating in one targeted fetch (replaces the previous 3-column query; fixes the "fetch ALL tutors via `list_public_tutors` and filter client-side" wastefulness on the profile page); new `listTutorReviews` (query `tutor_reviews` newest-first, limit 20 default).
- `src/application/use-cases/discovery/book-session.ts` — new `getTutorReviews` (GET, `[requireAppDependencies]`, zod `{tutorId: uuid, limit?}`) → `context.deps.tutor.listTutorReviews(...)`; `getTutorProfile` unchanged (now returns the extended `TutorProfile`).
- `src/application/index.ts`, `src/domain/ports/index.ts` — re-export `getTutorReviews` / `TutorReview`.
- `src/routes/tutors.tsx` — rewritten from direct `supabase.rpc("list_public_tutors")` to `useServerFn(browseTutors)` + `useQuery` (TanStack Query). (Slice 1.)
- `src/routes/tutor.$id.tsx` — rewritten from two direct Supabase queries (client-side `list_public_tutors` filter for the profile + `tutor_reviews` for the list) to `useServerFn(getTutorProfile)` + `useServerFn(getTutorReviews)` + `useQuery`, with explicit loading / not-found / error states; removed the direct `supabase` client import.

#### FILES DELETED

- (none)

#### DATABASE CHANGES

- (none — no migration authored or applied; ratings/review-count recomputed server-side with semantics identical to `list_public_tutors` (`ROUND(AVG(rating), 2)` / `COUNT(DISTINCT id)`, and the two RPC queries use the same `profiles`/`tutor_reviews` RLS-open reads the previous browser code used))

#### API CHANGES

- New server functions: `browseTutors` (GET; slice 1) and `getTutorReviews` (GET; slice 2). `getTutorProfile` response shape extended (superset — the booking page consumer reads `full_name`/`hourly_rate`/`subjects`, all still present).

#### SECURITY CHANGES

- (none — profile route remains public, exposing only the public `profiles` columns + `tutor_reviews` rows already readable by everyone under existing RLS; no private fields added to the port/response)

#### TESTS

- No unit tests exist for presentation-layer routes in this repo (baseline: 3 `bun:test` files, none route-level). Verification via authoritative Bun tooling below.

#### VERIFICATION

- `bunx tsc --noEmit` → 0; `bunx prettier --check` clean on changed files; `bun run lint` → 112 known baseline (74 err / 38 warn — unchanged; eslint clean on the 6 changed source files); `bun run build` → SUCCESS (exit 0, ~43 s); `git diff --check` clean.
- **NOT** browser-executed end-to-end (no live runtime inside this session) and **NOT** `PRODUCTION-VERIFIED`.

#### DECISIONS

- No application-architecture decision accepted by AT-0006 (implementation follows the already-established server-fn/port/repository boundary; the `TutorProfile` extension is additive and non-breaking). Not recorded in `docs/DECISION_LOG.md`.

#### KNOWN ISSUES / REMAINING OPEN

- **Systemic (pre-existing, NOT introduced by this slice):** the `requireAppDependencies` → `requireSupabaseAuth` server-fn chain requires a Bearer token; `attachSupabaseAuth` attaches one **only when a session exists**. Public/anon visitors to `/tutors` or `/tutor/$id` will therefore receive an "Unauthorized" server-fn error. The pre-conversion browser-direct `supabase.rpc` path worked for anon (public RPC + RLS-open tables). This affects all existing `[requireAppDependencies]` public-server-fn consumers (including `browseTutors` and the new `getTutorReviews`/`getTutorProfile`) and should be resolved by a public/anon-capable middleware (e.g. `buildPublicDependencies`-style binding or an anon token flow) before these pages are relied on for logged-out visitors.
- Remaining Discovery/other `SUPABASE-DIRECT` routes not converted in AT-0006 (see ARCHITECTURE-TO-IMPLEMENTATION GAP REPORT; each requires separate authorization).
- No commit made in AT-0006 (commit only on explicit instruction); untracked junk files (`bject Name, Mode, Length`, `ersUserDocumentsProjectsaskatutor?`, `t ?`n=== ... ===?`) remain untouched.

---

### AT-0007: Public/anon-capable Dependency Boundary for the Discovery server functions

| Field   | Value                                                                                                                                                                                                                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Work ID | AT-0007                                                                                                                                                                                                                                                                                                                              |
| Date    | 2026-09-14                                                                                                                                                                                                                                                                                                                           |
| Phase   | 1 (presentation-layer architecture remediation; branch `presentation/public-trust-pages`, no commit)                                                                                                                                                                                                                                 |
| Purpose | Close the AT-0006 systemic open issue: logged-out visitors could not call `browseTutors` / `getTutorProfile` / `getTutorReviews` because they were wired to `requireAppDependencies` → `requireSupabaseAuth` (Bearer token required; `attachSupabaseAuth` attaches one only when a session exists). No DB/RLS/security-model change. |

#### FILES CREATED

- `src/integrations/supabase/client.public.server.ts` — `supabaseAnon`: lazy server-side anon-role Supabase client (`SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY`, `persistSession: false`, no token) mirroring the `supabaseAdmin`/`supabase` proxy pattern. RLS applies through the `anon` role; never a service-role/bypass client. Server-only (only reachable from the middleware/DI path, which TanStack Start keeps out of client bundles).

#### FILES MODIFIED

- `src/infrastructure/di/index.ts` — `buildPublicDependencies()` now also provides `tutor: new SupabaseTutorRepository(supabaseAnon)`; the pre-existing `/requirePublicDependencies` middleware (already production-used by the help form) therefore covers the Discovery fns — no parallel middleware architecture was invented.
- `src/infrastructure/repositories/tutor-repository.ts` — anon-safe data paths: `getProfile` now sources the profile via the PUBLIC-granted `list_public_tutors` RPC (SECURITY DEFINER) filtered by id, replacing the direct `profiles`-table query (`profiles` has no anon-readable surface; its RLS policies are all `authenticated`-only); `listTutorReviews` queries the PUBLIC-granted `tutor_reviews_public` view (sanctioned public reviews surface — `student_id` stripped) replacing the `tutor_reviews` table (RLS `authenticated`-only).
- `src/application/use-cases/discovery/book-session.ts` — `getTutorProfile` and `getTutorReviews` switched from `[requireAppDependencies]` to `[requirePublicDependencies]`; `getTutorAvailability`, `bookSession`, `joinWaitlist` remain `[requireAppDependencies]` (booking/availability is authenticated; availability RPCs are not PUBLIC-granted).
- `src/application/use-cases/discovery/browse-tutors.ts` — `browseTutors` switched from `[requireAppDependencies]` to `[requirePublicDependencies]`.

#### FILES DELETED

- (none)

#### DATABASE CHANGES

- (none — no migration authored or applied. Principle: the public data surface already exists (`list_public_tutors` PUBLIC-EXECUTE retained by design in `20260812140000_revoke_public_execute_grants.sql`; `tutor_reviews_public` view `GRANT SELECT TO anon, authenticated` in `20260524041718_e722d83c...sql`). The slice routes the public server fns onto that sanctioned surface instead of the authenticated-only `profiles`/`tutor_reviews` tables.)

#### API CHANGES

- `browseTutors` / `getTutorProfile` / `getTutorReviews` are now callable without a session (data contract unchanged — identical public data for anonymous and authenticated callers). Request/response shapes unchanged.

#### SECURITY CHANGES

- Positive hardening: the discovery fns no longer touch the `profiles` table or the `tutor_reviews` table directly through the request path; they use the PUBLIC-granted RPC/view surfaces only. `buildPublicDependencies()` still fails closed for every other capability (`tutor` added, all other repository/gateway keys still proxy-throw in the public context). No private field is newly exposed; `tutor_reviews_public` guarantees `student_id` is never returned.

#### TESTS

- No unit tests exist for presentation-layer routes in this repo (baseline: 3 `bun:test` files, none server-fn/route-level). Verification via authoritative Bun tooling below.

#### VERIFICATION

- `bunx tsc --noEmit` → 0; `bunx prettier --check` clean on the 5 changed/new files; eslint clean on all 5 files; `bun run lint` baseline unaffected; `bun run build` → SUCCESS (exit 0, ~42 s); `git diff --check` clean (LF→CRLF warnings only).
- **NOT** browser-executed end-to-end (no live runtime inside this session) and **NOT** `PRODUCTION-VERIFIED` (`.env` runtime points at production `bzjlhxmiwdkteqkzqasi`; no non-prod runtime configured for anonymous smoke tests).

#### DECISIONS

- No new accepted architecture decision: this slice reuses the established `requirePublicDependencies`/`buildPublicDependencies` boundary (widening it with an anon-role client + `tutor` repo) rather than inventing a parallel middleware system. Not recorded in `docs/DECISION_LOG.md`.

#### KNOWN ISSUES / REMAINING OPEN

- `profiles` remains REST-grantless (pre-existing AT-0002 grant-gap; REST 42501 for direct postgREST `profiles` queries, even authenticated). Fully sidestepped for Discovery — public profile reads go through `list_public_tutors`. Fixing the grant gap is a separate, separately-authorized DB change.
- `get_tutor_availability_public` / `get_tutor_holidays_public` / `get_tutor_busy_slots` had PUBLIC EXECUTE revoked (`20260812140000...`) with no visible authenticated-specific GRANT in migration history — authenticated booking-page availability may 42501 at runtime. Pre-existing; untested; out of scope (booking stays `[requireAppDependencies]`).
- `getProfile` now filters the full `list_public_tutors` result server-side (no DB change); a targeted single-tutor public RPC is a possible performance follow-up.
- No commit made in AT-0007 (commit only on explicit instruction); untracked junk files remain untouched.

---

### AT-0008: Read-only verification of the tutor-availability capability

| Field   | Value                                                                                                                                                                                                                                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Work ID | AT-0008                                                                                                                                                                                                                                                                                                                                    |
| Date    | 2026-09-14                                                                                                                                                                                                                                                                                                                                 |
| Phase   | 1 (presentation-layer architecture remediation; branch `presentation/public-trust-pages`, no commit)                                                                                                                                                                                                                                       |
| Purpose | Verify read-only that `getTutorAvailability` works for authenticated users through the application boundary and that the authenticated DB contract (EXECUTE grants + SECURITY DEFINER + RLS) actually exists in the applied database. Follow-up to the AT-0007 "availability RPCs may 42501" open issue. No behavior change; no migration. |

#### FILES CREATED

- (none)

#### FILES MODIFIED

- (none — read-only verification slice; no code changed)

#### FILES DELETED

- (none)

#### DATABASE CHANGES

- (none authored/applied). Applied-evidence collected **read-only** against NON-PROD project `rwpxaejhouunxlcibpou` (askatutorlive-at0002-nonprod, eu-west-1) via the Supabase Management API `/v1/projects/{ref}/database/query` (in-memory CLI access token from Windows Credential Store entry `Supabase CLI:supabase` — token never printed, no production writes):
- Functions (all three: `get_tutor_availability_public(uuid)`, `get_tutor_holidays_public(uuid)`, `get_tutor_busy_slots(uuid,timestamptz,timestamptz)`): owner `postgres`; `sec_definer=true`; `proacl={postgres=X/postgres, authenticated=X/postgres}`; `anon_exec=FALSE`; `auth_exec=TRUE`; `svc_exec=FALSE`.
- Tables (RLS enabled, `rls_force=false`; no `FORCE ROW LEVEL SECURITY` in any migration): `tutor_availability` relacl `{postgres=arwdDxtm, anon=r, authenticated=arwd, service_role=arwdDxtm}` — write policies owner/admin-gated, SELECT "owner or admin reads availability" TO authenticated USING `(auth.uid()=tutor_id) OR has_role(auth.uid(),'admin')`, no anon SELECT policy (vestigial anon `r` is neutralized by RLS default-deny → 0 rows); `tutor_holidays` relacl `{postgres=arwdDxtm, authenticated=arwd, service_role=arwdDxtm}` — "anyone signed in views holidays" TO authenticated USING true; `sessions` relacl `{postgres=arwdDxtm, authenticated=arwd, service_role=arwdDxtm}` — participant/admin/parent/owner-scoped policies, every one expression-gated on `auth.uid()`/`has_role`/`is_parent_of` (false for anon), no anon grant.
- Migrations applied on non-prod: **74/74** (through `20260914120000_self_service_checkout_intent_finalize.sql`, applied 2026-09-14 07:39), including the Aug-12 hardening pair (`20260812130000_harden_rpc_grants_and_guards.sql`, `20260812140000_revoke_public_execute_grants.sql`) that revoked anon + PUBLIC EXECUTE — the **authenticated grant was never revoked**.

#### API CHANGES

- (none)

#### SECURITY CHANGES

- (none authored). Verification confirms: availability is authenticated by design and fail-closed for anon end-to-end (anon EXECUTE revoked twice; no anon RLS policies of consequence; no anon table grants of consequence). The RPCs are SECURITY DEFINER owned by postgres with `search_path` pinned (bypass RLS deliberately — the sanctioned booking surface IS the RPC) and expose only the window/slot/holiday shape (weekday/start/end/buffer, scheduled_at+duration, start/end date — no participant identity, room, or subject). RLS remains the guard for direct table reads. Nothing was made public; RLS untouched.

#### TESTS

- `bun test` → **35 pass / 0 fail across 4 files** (ai-entitlement, room-access, webhook-actions + forensic duplicate). No availability-specific test exists; none authored (no code changed). Read-only checks performed in this slice: applied-DB ACL/policy inspection via the Management API.

#### VERIFICATION

- Code path fully traced (see `docs/CURRENT_STATE.md` → AT-0008): `/book/$tutorId` → `getTutorAvailability` (`[requireAppDependencies]`, zod `{tutorId,from,to}`) → `context.deps.tutor.getAvailability` → `SupabaseTutorRepository.getAvailability` (`tutor-repository.ts:50-54`) → `get_tutor_availability_public`/`get_tutor_holidays_public`/`get_tutor_busy_slots`. Application/use-case boundary already correct — no refactor. Applied-DB contract confirmed with live non-prod evidence.

#### VERDICT

- **PARTIALLY VERIFIED.** Database contract (authenticated EXECUTE + SECURITY DEFINER + RLS) is confirmed in the LIVE non-prod applied database — the AT-0007 "availability RPCs may 42501 for authenticated users" hypothesis is **REFUTED**. No grant gap exists; no migration required. Full authenticated runtime execution (browser → login → availability render) was NOT exercised: **RUNTIME TEST BLOCKED — no approved non-prod runtime with a test user** (`.env` points at production; never a substitute).

#### DECISIONS

- No architecture decision; verdict classification per template: **PARTIALLY VERIFIED**. Next slice: AT-0009 (`/book/$tutorId` conversion of the remaining direct-Supabase waitlist/email functions — 2 of 3; `bookSession` is already wrapped in `useServerFn` at `book.$tutorId.tsx:94`, the remaining direct calls are `joinWaitlist` and `notifyBookingEmails`). Not recorded in `docs/DECISION_LOG.md`.

#### KNOWN ISSUES / REMAINING OPEN

- Authenticated runtime execution of availability remains unexercised (pending an approved non-prod runtime + test user).
- `svc_exec=FALSE` on the three RPCs (hardening) — no app path uses service-role for availability; observation only.
- `/book/$tutorId` still calls direct-Supabase for `joinWaitlist`/`notifyBookingEmails` (2 of 3 — `bookSession` is already converted via `useServerFn` at `book.$tutorId.tsx:94`) → AT-0009 (separately authorized).
- No commit made in AT-0008 (commit only on explicit instruction); untracked junk files remain untouched.

---

### AUDIT-0001: Repository-wide Verification Queue Audit — persisted (documentation only)

| Field   | Value                                                                                                                                                                                                                                                                              |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work ID | AUDIT-0001                                                                                                                                                                                                                                                                         |
| Date    | 2026-09-14                                                                                                                                                                                                                                                                         |
| Phase   | Control-state (all current phases); branch `presentation/public-trust-pages`; no commit                                                                                                                                                                                            |
| Purpose | Persist the repository-wide verification backlog audit into the control system and correct the AT-0009 scope discrepancy (2 of 3 remaining direct calls). Audit-only: no code, no DB, no config, no production action, no PayPal, no migration, no RLS change, no commit, no push. |

#### FILES CREATED

- `docs/audits/AUDIT_VERIFICATION_QUEUE_20260914.md` — the authoritative repository-wide verification backlog audit (12 sections: executive verdict; master queue; blocked queue; security/access-control queue; database/migration queue; presentation/route queue; integration queue; production queue; false-completion flags; duplicates/stale; recommended order; project-state conclusions).

#### FILES MODIFIED

- `docs/CURRENT_STATE.md` (NEXT ACTION: audit pointer + keystone prerequisite), `docs/BACKLOG.md` (register note + AT-0009 scope correction), `docs/CHANGE_LOG.md` (this entry), `docs/DECISION_LOG.md` (NO change — the audit is a process/verification record, not an architecture decision; consistent with the AT-0006/0007/0008 precedent of not adding D-entries).

#### FILES DELETED

- (none)

#### DATABASE CHANGES

- (none)

#### API CHANGES

- (none)

#### SECURITY CHANGES

- (none authored). The audit preserves (does not remediate) the security backlog facts: production `anon` over-grant unresolved; AT-0002 residual `profiles`/`user_roles` grant issue; GAP-001…005 production verification pending; AI quota enforcement an implementation gap; email runtime verification pending; PayPal runtime verification BLOCKED; CI verification gate absent.

#### TESTS

- (none authored). Audit cross-checks confirmed: 3 tracked test files (ai-entitlement, room-access, webhook-actions) + 1 forensic duplicate; `bun test` → 35 pass (AT-0008 record).

#### VERIFICATION

- AT-0009 scope corrected by direct code inspection: `book.$tutorId.tsx:94` wraps `bookSession` in `useServerFn` (converted); `joinWaitlistFn` (`:470-472`) and `notifyBookingEmails` (`:177`) remain direct calls — **2 of 3**, not 3. All control-doc mentions updated to the corrected scope.

#### VERDICT

- Classifications preserved and re-asserted (nothing upgraded): FC-004 = **BLOCKED** (PayPal sandbox credentials + approved non-prod runtime + provider enablement); AT-0008 = **PARTIALLY VERIFIED** (DB contract + application path verified; runtime blocked; `42501` hypothesis refuted); AT-0006/AT-0007 = structurally verified, runtime smoke pending; AT-0005 = in-repo + non-prod DB evidence, provider/production pending.

#### DECISIONS

- No application-architecture decision accepted. The keystone prerequisite is recorded, not created: **APPROVED NON-PRODUCTION RUNTIME + TEST USERS = BLOCKED / NOT AVAILABLE** — blocks AT-0006 runtime smoke, AT-0007 runtime smoke, AT-0008 runtime e2e, and FC-004 PayPal sandbox e2e; FC-004 additionally requires `PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET`/`PAYPAL_WEBHOOK_ID` + `payment_providers.paypal` enabled in non-prod.

#### KNOWN ISSUES / REMAINING OPEN

- Alpha/preview naming note: prior `docs/audits/` files use an `AUDITS_*` prefix; this record uses the explicitly requested `AUDIT_VERIFICATION_QUEUE_20260914.md` name (dated suffix matching the `audit-evidence/` convention).
- No commit made in AUDIT-0001.

---

### VIRTUAL-LAB-PHASE-2: Additive Model-Class Contract + Deterministic 1-D Mechanics Reference Engine

| Field   | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Work ID | VIRTUAL-LAB-PHASE-2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Date    | 2026-09-15                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Phase   | Target Virtual Lab architecture (ND-LAB-01) — Phase 2 of the incremental migration; branch `presentation/public-trust-pages`; no commit                                                                                                                                                                                                                                                                                                                                                                 |
| Purpose | Add an additive, pure, subject-neutral, renderer-independent Model-Class contract and a deterministic reference engine for one model class (1-D mechanics / Newton's second law), with deterministic validation. No renderer wiring, no feature flags, no `EvidenceEnvelope`, no database/RLS change, no D-0005 implementation. Approved scope: `src/domain/lab/model-class.ts`, `src/domain/lab/validation.ts`, `src/domain/lab/engines/mechanics-1d.ts`, `tests/lab-model-class.test.ts`, this entry. |

#### FILES CREATED

- `src/domain/lab/model-class.ts` — subject-neutral `ModelClassSpec` / `ModelInstance` contract + `createModelClassRegistry`. Requires `subjectNeutral: true`; rejects subject/level/`*Engine` keys; closed `IntegratorId` allowlist (currently `"euler"`). No executable expressions in this phase.
- `src/domain/lab/validation.ts` — pure, total validators (`validateModelClassSpec`, `validateModelInstance`) plus dimension parsing/equality helpers. No `eval`, `new Function`, clock, or randomness.
- `src/domain/lab/engines/mechanics-1d.ts` — reference engine `physics.mechanics.1d.newton2` (`ENGINE_VERSION` `1.0.0`, model-class version `1.0.0`): pure `buildModel`/`createState`/`step`/`run`/`toObservables`; semi-implicit Euler; explicit time accumulator; observables position/velocity/acceleration/net_force.
- `tests/lab-model-class.test.ts` — 20 `bun:test` cases: contract accept/reject, instance validation, determinism, constant-force kinematics, free fall, mass-independent acceleration, step purity, and a static scan asserting the new subtree contains no `eval`/`new Function`/`performance`/`Date.now`/`Math.random`.

#### FILES MODIFIED

- `docs/CHANGE_LOG.md` (this entry only).

#### FILES DELETED

- (none)

#### DATABASE CHANGES

- (none)

#### API CHANGES

- (none)

#### SECURITY CHANGES

- (none authored). No `eval`/`new Function`/dynamic code execution introduced; the new domain subtree is static-scanned by test and is free of wall-clock and randomness dependencies.

#### TESTS

- `bun test tests/` → **55 pass / 0 fail across 5 files** (pre-existing 35 across 4 files + 20 new). No pre-existing test modified.

#### VERIFICATION

- `bunx tsc --noEmit` → 0 errors. `bunx prettier --write` applied to the new files + this entry; `bunx prettier --check .` → reports only the **pre-existing untracked** `docs/audits/AUDIT_VERIFICATION_QUEUE_20260914.md` (not authored/modified here, left untouched); all four new source/test files are clean. `bun run lint` → 112 known baseline (74 err / 38 warn — unchanged; no findings in the new files). `bun run build` → SUCCESS (exit 0, ~35s). `git diff --check` → exit 0 (LF→CRLF warnings only). Static security scan of `src/domain/lab/**` → no violations. Diff inspected: **no changes to `physics.ts`, `SimScene.tsx`, `SimDispatch.tsx`, lab schemas, routes, DI, repositories, Supabase/migrations/RLS, or production configuration.**

#### VERDICT

- **TESTED** (deterministic components + unit tests) and **VERIFIED** at source/build level only. **NOT PRODUCTION-VERIFIED** — the engine is intentionally not wired to any renderer or runtime path, so it is unexercised end-to-end and in any environment. Additive and inert: nothing existing imports `src/domain/lab/**`.

#### DECISIONS

- No new architecture decision accepted. Implementation follows the already-accepted **ND-LAB-01** (Virtual Lab target architecture) and the design-spec Phase 2. `DECISION_LOG.md`, `BACKLOG.md`, and LAB-0001…LAB-0008 were **not modified**. D-0005 remains not implemented (no assessment/mastery/decision persistence).

#### KNOWN ISSUES / REMAINING OPEN

- Phase 2 deliberately excludes: renderer wiring, feature flags, `EvidenceEnvelope`, symbolic equation parsing, non-Euler integrators, a second model class, and any persistence. The 1-D mechanics engine is a reference implementation, not the permanent architecture.
- `tsconfig.json` does not include `tests/`, so tests are type-run by Bun (`bun test`), not covered by `tsc --noEmit` (pre-existing project behavior).
- No commit made in VIRTUAL-LAB-PHASE-2 (commit only on explicit instruction). A doc-only D-0005/D-0004 status inconsistency remains in `BACKLOG.md` / `CURRENT_STATE.md` (flagged previously; not addressed here).

---

### VIRTUAL-LAB-PHASE-3: Physics Domain Architecture Correction (Generic Entity Collections) + Multi-Body Newtonian Slice

| Field   | Value                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Work ID | VIRTUAL-LAB-PHASE-3                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Date    | 2026-09-15                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Phase   | Target Virtual Lab architecture (ND-LAB-01) — architecture stress-test + one implementation slice; branch `presentation/public-trust-pages`; no commit                                                                                                                                                                                                                                                                                           |
| Purpose | Stress-test the Phase 2 Model-Class contract against the P1–P9 physics model classes, apply the minimum generic correction it lacks, and implement exactly one physics slice (1-D Newtonian N-body). Correction only: no renderer wiring, no `physics.ts`/`SimScene.tsx`/`SimDispatch.tsx` change, no `EvidenceEnvelope`, no database/RLS/migration, no D-0005, no new specialized engines, no quantum implementation (architecture check only). |

#### FILES CREATED

- `src/domain/lab/execution/fixed-step.ts` — generic, domain-agnostic bounded execution contract (`FixedStepSchedule`, `StepContext`, `resolveFixedStepSchedule`, `executeFixedStep`). Time is derived from step index × dt; strict `maxSteps` bound; no wall clock. Reusable by every model class.
- `src/domain/lab/domains/physics/nbody-1d.ts` — reference model class `physics.mechanics.1d.nbody` (`NBODY_ENGINE_VERSION` `1.0.0`, model-class version `1.0.0`): variable-cardinality bodies via the new entity-collection mechanism; pairwise Plummer-softened 1-D gravitation; semi-implicit Euler; pure `buildModel`/`createState`/`computeAccelerations`/`step`/`run`/`toObservables`/`toObservation`; per-body observations + aggregate observables (total_momentum, total_kinetic_energy, center_of_mass).
- `tests/lab-physics-nbody.test.ts` — 20 `bun:test` cases: entity-collection spec accept/reject, instance validation (unknown collection/quantity, duplicate/malformed ids, allocation bound, finite values, constraints), generic fixed-step contract, determinism, coincidence/softening finiteness, own-mass independence, net-force = m·a and pairwise cancellation, momentum conservation, purity, and bounded-execution rejection.

#### FILES MODIFIED

- `src/domain/lab/model-class.ts` — additive correction: optional generic `entities?: EntityCollectionSpec[]` on `ModelClassSpec` (per-collection `maxEntities` allocation bound + reuses `QuantitySpec`/`ConstraintSpec`), `EntityRecord`, and optional `entities?: Record<string, EntityRecord[]>` on `ModelInstance`. No field removed/renamed; Phase 2 usage unchanged.
- `src/domain/lab/validation.ts` — additive correction: `validateEntityCollection` + `validateEntityRecord`, wired into `validateModelClassSpec` (collection id/`maxEntities`/quantity/constraint checks) and `validateModelInstance` (known collections, array shape, allocation bound, unique snake_case entity ids, per-entity values/bounds/constraints). `effectiveValue` generalised to a value-source interface.
- `docs/CHANGE_LOG.md` (this entry only).

#### FILES DELETED

- (none)

#### DATABASE CHANGES

- (none)

#### API CHANGES

- (none)

#### SECURITY CHANGES

- (none authored). No `eval`/`new Function`/dynamic code execution; allocation is explicitly bounded by `maxEntities` and execution by `maxSteps`, so per-run work is finite. The Phase 2 static scanner (which walks the whole `src/domain/lab/**` subtree) now also covers the new files and reports no wall-clock/randomness/dynamic-execution violations.

#### TESTS

- `bun test tests/` → **75 pass / 0 fail / 613 expect() calls across 6 files** (pre-existing 55 across 5 files + 20 new). No pre-existing test modified.

#### VERIFICATION

- `bunx tsc --noEmit` → 0 errors. `bun run lint` → **112 baseline (74 err / 38 warn), unchanged**; no findings in the new/changed files. `bun run build` → SUCCESS (exit 0, ~50s). `git diff --check` → exit 0 (LF→CRLF warnings only). `bunx prettier --check` on all five changed/created files → clean. Static scan of `src/domain/lab/**` → no `eval`/`new Function`/`performance`/`Date.now`/`Math.random`. Import scan → the new modules are referenced only by the lab subtree's own tests; **no production file outside `src/domain/lab/**` imports them (still inert)**. Diff inspected: **no changes to `physics.ts`, `SimScene.tsx`, `SimDispatch.tsx`, lab schemas, routes, DI, repositories, Supabase/migrations/RLS, or production configuration.**

#### VERDICT

- **TESTED** (deterministic components + unit tests) and **VERIFIED** at source/build level only. **NOT PRODUCTION-VERIFIED** — the slice is intentionally not wired to any renderer or runtime path, so it is unexercised end-to-end and in any environment.

#### DECISIONS

- No new accepted architecture decision. The correction is deliberately minimal and generic: **variable-cardinality state is modelled as bounded homogeneous entity collections** (not per-domain fields), and **execution bounds/scheduling live in a domain-agnostic fixed-step contract** separate from physics. This keeps model classes subject-neutral and avoids per-subject/per-level engines. `DECISION_LOG.md`, `BACKLOG.md`, and LAB-0001…LAB-0008 were **not modified**; D-0005 remains not implemented.

#### KNOWN ISSUES / REMAINING OPEN

- Per-entity observables are currently emitted by the N-body engine's own `Observation` shape; `ModelClassSpec.observables` remains flat (aggregate). Declaring entity-scoped observables in the contract is deferred.
- Entity collections are optional and instances need not allocate every declared collection; domain engines enforce their own minimum (N-body requires ≥ 1 body).
- Still excluded: renderer wiring, feature flags, `EvidenceEnvelope`, non-Euler integrators, symbolic expressions, and any persistence.
- No commit made in VIRTUAL-LAB-PHASE-3 (commit only on explicit instruction).

---

## 3. CHANGE RULES

1. Never silently remove previous negative evidence
2. Every work item must have a change entry
3. Changes are recorded chronologically
4. File changes are tracked at the file level
5. Component changes are tracked at the component level
6. Database changes are tracked separately
7. Security changes are tracked separately
8. Decisions are recorded in DECISION_LOG.md and referenced here

### AT-0009 — Fresh online revalidation and booking route boundary (2026-09-23)

- **Work ID:** AT-0009 (booking route); AT-0010 (PayPal configuration-example correction); AUDIT-0002 (fresh repository/online revalidation).
- **Scope:** Rechecked repository quality, live public routes, current Supabase project status/migration state/selected production ACLs and advisor findings, and PayPal sandbox reachability. No production changes or payment transactions.
- **Application changes:** `src/routes/_authenticated/book.$tutorId.tsx` now uses `useServerFn` for waitlist and booking-email functions, removes a stale `any` cast, fixes the two hook dependencies, and surfaces email delivery failure without converting a successful booking into a failed booking. `.env.example` now documents the server-only PayPal env vars read by `paypal.server.ts`.
- **External evidence:** production Supabase is active; approved non-production ref `rwpxaejhouunxlcibpou` is inactive and its migration query times out. Production shows 73 applied migrations vs 74 in repository, with the local checkout-finalization migration unapplied. Production counts show one auth user/profile/role and zero rows in the inspected learner/payment tables. `anon` has explicit all-privilege ACLs on eight inspected learner/account tables while selected RLS policies are identity-gated; this is recorded as a security hardening risk, not claimed as proven data disclosure. Production advisor findings are enumerated in `docs/audits/AUDIT_REVALIDATION_20260923.md`.
- **Public endpoint checks:** homepage, tutors, auth, privacy returned HTTP 200 on `www`; apex returned 308. PayPal sandbox unauthenticated HEAD returned 403; PayPal credentials absent from local env files and process/user/machine environments.
- **Tests:** `bun test` → 75 pass / 0 fail / 613 assertions; `bunx tsc --noEmit` → 0; targeted ESLint for booking route clean; `bun run build` succeeded; full lint → 109 findings (73 errors / 36 warnings); `git diff --check` clean.
- **Verification status:** AT-0009 is locally implemented/typechecked/built/tested; authenticated browser/runtime journey is **BLOCKED** by inactive non-production and was not run. AT-0010 is source-verified only. No production DDL/configuration, authentication, payment, DNS, or deployment action was performed.
- **Files touched by this work:** `.env.example`; `src/routes/_authenticated/book.$tutorId.tsx`; `docs/audits/AUDIT_REVALIDATION_20260923.md`; `docs/BACKLOG.md`; `docs/CURRENT_STATE.md`; `docs/CHANGE_LOG.md`.
- **Next action:** Reactivate approved non-production and provision/identify student+tutor test accounts; resume AT-0009 runtime verification.
# 2026-09-23 — AT-0011 Learning Domain discovery and topic graph foundation

- Added evidence-based learning-domain case matrix at `docs/audits/LEARNING_DOMAIN_CASE_MATRIX_20260923.md`.
- Added `src/domain/learning/topic.ts` with concept/skill topic types, required/recommended prerequisite edges, and pure graph validation for identity, references, duplicate edges, and acyclicity.
- Added `tests/learning-topic.test.ts` for valid graphs, malformed identities/references, duplicates, cycles, and a 12,000-topic chain.
- Added migration `supabase/migrations/20260923110000_harden_assignment_submission_ownership.sql` after finding that existing RLS did not bind a new submission to an assignment owned by that learner and allowed learners to write grading columns. The migration separates student and tutor/admin update policies; it is not applied to any database.
- Updated `docs/BACKLOG.md` and `docs/CURRENT_STATE.md` with status, scope, open decisions, and verification blockers.
- No database operation was performed. Topic semantics follow bounded D-0005; assessment, mastery, affective-data, entitlement, and role rules remain unimplemented pending their stated decisions. The assignment-submission migration is local and unapplied.

### AT-0011 continuation — Free audit and saved-simulation entitlement (2026-09-23)

- **Scope:** Continue independent source-level Learning Domain work while topic-authoring and non-production environment questions remain unresolved/unavailable.
- **Files changed:** `docs/audits/LEARNING_DOMAIN_CASE_MATRIX_20260923.md`, `docs/BACKLOG.md`, `docs/CURRENT_STATE.md`, `src/application/use-cases/simulation/lab.ts`, `tests/simulation-entitlement.test.ts`.
- **Documentation:** Added explicit evidence statuses across the case matrix, a current Free capability matrix, and a Free-tier unknown/decision matrix. Recorded the live production configuration and paid plan scopes/prices as read-only evidence. Corrected LAB-0001 to reflect that new simulation saves are now entitlement-gated while list/delete remain owner-RLS operations pending expiry policy. Recorded that the 10-experiment browser counter is client-controlled and that the configured AI budget is not enforced.
- **Application:** New simulation creation now calls the Labs entitlement guard and passes only the authenticated server context user id to persistence. The AI gateway request helper now uses a discriminated typed request instead of `any`.
- **Tests:** Added a no-active-scope (expired/missing entitlement) denial case. At the end of the initial continuation, `bun test tests/` → **85 pass / 0 fail / 634 assertions**; latest cumulative verification is recorded in the next continuation (**101 pass / 0 fail / 653 assertions**). `bunx tsc --noEmit` → **0 errors**; targeted ESLint and Prettier checks pass; `git diff --check` passes with line-ending warnings only.
- **Database and security:** No migration was applied and no production write was made. Assignment-submission migration `20260923110000_harden_assignment_submission_ownership.sql` remains unapplied. Non-production allow/deny probes for submissions and owner-RLS remain blocked by inactive Supabase/Docker availability.
- **Decisions:** No new product or architecture decision accepted. Free allowance/accounting semantics, saved-simulation access after expiry, topic author/read authority, and assessment attempt/content rules remain explicit gates.
- **Limitations:** The expiry test verifies that an empty active-scope result is denied by application code; the database RPC's expiry filtering has not been runtime exercised. The 10-lab count and AI token setting are observations, not validated Free-tier policy.

### AT-0011 continuation — Learner assignment completion, simulation integrity, and whiteboard persistence (2026-09-23)

- **Files changed:** `src/application/contracts/dependencies.ts`, `src/application/index.ts`, `src/application/use-cases/learning/assignments.ts`, `src/domain/ports/assignment-repository.ts`, `src/domain/ports/index.ts`, `src/infrastructure/di/index.ts`, `src/infrastructure/repositories/assignment-repository.ts`, `src/infrastructure/repositories/classroom-repository.ts`, `src/infrastructure/repositories/simulation-repository.ts`, `src/presentation/domains/3-personalization-role-context/ScopeGate.tsx`, `src/presentation/domains/3-personalization-role-context/hooks/use-entitlements.tsx`, `src/presentation/domains/3-personalization-role-context/hooks/use-platform-config.tsx`, `src/presentation/domains/3-personalization-role-context/resolve-scope-access.ts`, `src/routes/_authenticated/assignments.tsx`, `src/integrations/supabase/types.ts`, new migrations `20260923123000_secure_learner_assignment_completion.sql` and `20260923140000_enforce_simulation_entitlement_and_atomic_save.sql`, tests `assignment-repository.test.ts`, `classroom-repository.test.ts`, `scope-access.test.ts`, `simulation-repository.test.ts`.
- **Assignment transition:** The student “Mark done” control now calls an authenticated Application server function. Its repository invokes a database RPC with no user-id argument. The prepared security-definer RPC checks the student role and `auth.uid()` ownership, changes only status, and is idempotent for repeated completion. The route only displays this control to the assigned learner.
- **Simulation persistence/security:** Repository save invokes an authenticated security-definer RPC that checks AI availability plus Labs/open-mode/privileged-role access, derives owner from `auth.uid()`, and creates both `simulations` and `simulation_versions` version 1 in one transaction. The prepared migration revokes direct INSERT from `PUBLIC`, `anon`, and `authenticated` on both tables, leaving the RPC as the authenticated creation path; until applied, the current owner-only policy permits authenticated direct INSERT. Existing list/update/delete behavior remains owner-RLS scoped while expiry policy is unresolved.
- **Whiteboard persistence:** Classroom repository now throws setup and snapshot-read errors instead of interpreting failures as a missing/empty board. Save setup errors are also surfaced. Room membership remains enforced by existing database RPC/RLS boundaries.
- **Presentation entitlement:** `usePlatformConfig` exposes query errors and route gates no longer treat fallback defaults as a verified open-mode setting. A pure scope resolver fails closed when config or scope lookups fail; `ScopeGate` shows a verification error rather than a subscription upsell in that case.
- **Tests and checks:** `bun test tests/` → **101 pass / 0 fail / 653 assertions**; `bunx tsc --noEmit` → **0 errors**; targeted ESLint/Prettier → clean; `bun run build` succeeded; `git diff --check` → clean with line-ending warnings. Build emits project-wide `inputValidator()` deprecations and dependency chunk/directive warnings.
- **Database/security status:** The three Learning Domain migrations (`20260923110000_harden_assignment_submission_ownership.sql`, `20260923123000_secure_learner_assignment_completion.sql`, `20260923140000_enforce_simulation_entitlement_and_atomic_save.sql`) remain unapplied. Non-production is inactive, so RLS, RPC grants, cross-user denial, concurrent save, and rollback cases remain blocked. No production or database writes were made.
- **Decisions:** Learner “Mark done” is explicitly self-reported task status, not a score or mastery claim. No submission delete/resubmission, saved-simulation expiry, assessment instrument, mastery, or Free quota policy was added.
- **Requirements cross-check:** Confirmed requirements CR-001–CR-006 and CR-010–CR-013 require a learner-guided difficulty interaction (mandatory for the first three lessons), a preserved concern-to-reflection journey, and learner choice afterward. Repository search found no corresponding flow/use case/persistence. Added three cases to the matrix. Implementation remains gated on what counts as a lesson, assessment content, and affective-data instrument/consent/retention; no fear scale or extra affective collection was invented.

### AT-0011 continuation — Virtual Lab lifecycle and simulation integrity (2026-09-23)

- **Scope:** Promote Virtual Lab/Labs into the Learning Domain case matrix; trace catalog access, classroom sync, Simulation Lab generation, client renderers, validation, persistence, entitlement, AI assistance, UI state and the saved-version tables.
- **Implementation:** Generated definitions no longer auto-save. Desktop and mobile now expose an explicit Save action; failures preserve one request UUID for same-page retries. The repository omits client owner identity and the planned database RPC derives it from `auth.uid()`. The prepared migration deduplicates same-owner retries, creates simulation and version 1 atomically, blocks direct inserts and unversioned updates, and blocks independent version-row insertion/update/deletion. Parent deletion still cascades versions under the existing owner delete policy. It uses a private definer helper with empty `search_path` behind an authenticated invoker wrapper.
- **Safety/UI:** Removed the unsupported 10-lab browser counter and “Free plan” quota copy from the active catalog and the unreferenced legacy `ThreeDLab`. Replaced `Scene2D`'s `new Function` with a bounded math parser and allowlisted evaluator; formula validation rejects unsupported JavaScript. Lab chat now requires both existing Labs and AI gates, rejects client `system` messages, treats context as untrusted, and states the assistant cannot create authoritative records. Added mobile chat access and made the generated quiz explicitly non-persistent practice. Classroom Realtime sync now has prepared member-only `lab:<roomId>` policies.
- **Evidence:** Added the Virtual Lab case matrix and synchronized `docs/CURRENT_STATE.md` / LAB-0001, LAB-0002, LAB-0009 and LAB-0010. Added expression, simulation-schema, chat entitlement/role, repository retry-key, and static migration contract tests. Static review also changed `match_simulations` from `SECURITY DEFINER` to owner-RLS-respecting `SECURITY INVOKER` with bounded query arguments, and pinned `has_role`, `get_my_scopes`, `student_has_scope`, and `can_access_classroom_room` to an empty search path. A read-only inventory of the active production project places `vector` in `public`; it did not execute the migration or establish runtime behavior.
- **Unresolved:** Session/runtime persistence, results and measurements, reflection, assessment attempt policy, completion, progress/mastery contribution, LearningRecord wiring, tutor review, parent/admin visibility, offline recovery, saved-artifact expiry, Free Labs/AI quotas, storage and duration rules, and who controls shared classroom lab state remain missing product decisions. Existing saved library items restart from the saved definition. The migration remains unapplied and no database/runtime verification is claimed.
- **Verification:** `bun test tests/` → **118 passed / 0 failed / 725 assertions**; `bunx tsc --noEmit` → **0 errors**; targeted Virtual Lab ESLint and Prettier checks passed, including the new case matrix. Full lint reports **68 errors / 34 warnings** across repository and archived evidence; full Prettier check reports five Markdown files. `bun run build` succeeded with project-wide `inputValidator()` deprecations and dependency/chunk/SSR stub warnings, including `THREE.Vector3`. `git diff --check` passed with LF→CRLF notices only. The database migration and classroom topic policies require approved non-production for runtime allow/deny, concurrency and rollback probes.

### AT-0011 continuation — OpenCode handoff preparation (2026-09-23)

- Added root `AGENTS.md` as the shared Codex/OpenCode contract: inspect and preserve the dirty workspace, follow the required engineering loop, and continue to the next safe task without waiting for a new prompt.
- Added `docs/OPEN_CODE_HANDOFF_20260923.md` with the current Learning Domain and Virtual Lab state, exact prior verification results, verified/partial/unknown/blocked evidence, migration states, unresolved product decisions, initial dirty-tree inventory, remaining gaps, and one next engineering task.
- Corrected the Learning Domain case matrix's stale claim that save retries have no idempotency key; added same-key/different-payload, concurrent retry, direct-RPC validation, and rollback probes. No code or database state changed in this handoff step.
- No migration was applied, no production write was made, and no commit was created.
