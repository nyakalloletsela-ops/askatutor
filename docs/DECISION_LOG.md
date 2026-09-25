# AskATutorLive — Decision Log

- **Work ID:** AT-0001
- **Purpose:** Record explicit engineering governance and application architecture decisions.

## Rules for this log

1. Governance/process decisions and application-architecture decisions are separate.
2. Only **explicit human approval** produces `ACCEPTED`.
3. A roadmap statement or a recommendation in an audit is **NOT** an accepted decision.
4. Recommendations are recorded as `PROPOSED` and remain `PROPOSED` until explicit human acceptance.
5. Do not convert recommendations into accepted decisions.
6. No artificial application-architecture decision is fabricated here to satisfy the existence of the log.

---

## D-0001 — Governance control system adoption (Governance History)

- **Date:** AT-0001
- **Kind:** Engineering-process / governance decision (NOT an application-architecture decision).
- **Status:** RECORDED
- **Decision:** The repository is governed by the control documents installed under `docs/`:
  - `docs/MASTER_PLAN.md`
  - `docs/CURRENT_STATE.md`
  - `docs/WORK_PROTOCOL.md`
  - `docs/DECISION_LOG.md`
  - `docs/BACKLOG.md`
  - `docs/AUDIT_BASELINE_AT-0001.md`
- **Scope:** Engineering process control only. This decision does not accept any application architecture.
- **Notes:** Recorded as governance history for tractability, per the AT-0001 work item. It is not an application-architecture acceptance.

---

## Assessment / Learning Architecture — PROPOSED / UNACCEPTED

- **Reference:** AT-0001 baseline audit (Phases D/E) and prior assessment-ownership inspection.
- **Status:** `PROPOSED / UNACCEPTED`
- **Summary:** The audit documented a proposal for a structured assessment-outcome/learning-state backend consumed by a Learning context (an "Option B"-style direction). This direction is **proposed only**.
- **Explicitly NOT accepted for implementation:** no assessment-outcome tables, no mastery model, no learning-state backend, no scoring service, no wiring of `LearningRecordRepository` into `AppDependencies`.
- **Reason it remains PROPOSED:** It is a recommendation currently supported only by planning/audit material. It has not received explicit human acceptance. The live database state required to validate it (AT-0002) is also unresolved.

This entry does **not** authorize implementation.

**Superseded in part (2026-09-10):** INST-DEC-5 explicitly accepted the **bounded** scope of this proposal (see D-0005) — `topic_prerequisites`, typed `learner_assessments`, `learner_affective_reports`, `mastery_snapshots`, `learning_decisions` — as the target model (`docs/architecture/INSTITUTIONAL_LEARNER_DESIGN.md`). The remainder of the prior proposal (scoring service, learning-state heuristics, AI-graded mastery) remains **NOT ACCEPTED**. This entry is retained as history.

---

## Existing human decisions found in the repository

No explicit, application-architecture `ACCEPTED` decisions were located in the repository control documents during AT-0001 (no prior `DECISION_LOG` existed; historical decisions, if any, were not found as structured accepted records). Where the audit found authoritative present-state facts (e.g., server-authoritative commerce intent flow, centralized AI gateway, owner/admin-scoped RLS), these are recorded as **verified current-state evidence** in `docs/CURRENT_STATE.md` and `docs/AUDIT_BASELINE_AT-0001.md`, not as newly-accepted architectural decisions.

**Correction (documentation archaeology, 2026-09-08):** Structured historical decision records **were** located — in the first-generation Phase-0 governance documents `docs/archive/DECISION_LOG (2).md` and `docs/archive/CURRENT_STATE (2).md` (Work ID AT-0000, dated 2026-09-04), which the AT-0001 control system (D-0001) superseded. Those records (ATD-0001..0011 and five Phase-0 architecture decisions, including financial-safety rules) are migrated below as historical provenance with `HISTORICAL` / `PROPOSED` statuses. They are **not** re-accepted as current decisions and do **not** authorize implementation. The `(2)` source documents are preserved unchanged.

---

## D-0002 — Historical Phase-0 decisions (provenance record)

- **Reference:** `docs/archive/DECISION_LOG (2).md` and `docs/archive/CURRENT_STATE (2).md` (Work ID AT-0000, Phase 0, dated 2026-09-04) — the first-generation governance record superseded by D-0001.
- **Kind:** Application-architecture and requirement-confirmation provenance record. Recording history is **not** re-acceptance.
- **Status:** HISTORICAL — each item below carries its own current status; none is a current `ACCEPTED` decision except ATD-0011, which is accepted as a current decision in D-0003 below (historical record preserved for provenance).
- **Why recorded:** Documentation archaeology located these structured historical decisions after the AT-0001 record asserted none existed (see the correction above). They are preserved so the historical record is not lost, without letting historical `ACCEPTED` status silently become current authorization.
- **Scope:** This entry does **not** authorize implementation of any listed historical decision. Explicit human approval recorded in this log is required before any becomes a current `ACCEPTED` decision.

### ATD-0001 — ATD-0011 (stack / requirement decisions, `docs/archive/DECISION_LOG (2).md`)

| ID       | Historical decision                                                         | Historical status (`(2)` source) | Current status under AT-0001                                                                                                                                         |
| -------- | --------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ATD-0001 | Implementation language: TypeScript                                         | ACCEPTED                         | HISTORICAL — consistent with verified present state (TS project); NOT re-accepted as a decision                                                                      |
| ATD-0002 | Frontend framework: React                                                   | ACCEPTED                         | HISTORICAL — consistent with verified present state (React 19); NOT re-accepted                                                                                      |
| ATD-0003 | Build tool: Vite                                                            | ACCEPTED                         | HISTORICAL — consistent with verified present state (`vite build`); NOT re-accepted                                                                                  |
| ATD-0004 | Styling: Tailwind CSS                                                       | ACCEPTED                         | HISTORICAL — present-state styling stack NOT verified; REQUIRES CURRENT CONFIRMATION                                                                                 |
| ATD-0005 | Database: PostgreSQL via Supabase                                           | ACCEPTED                         | HISTORICAL — consistent with verified present state (Supabase project); NOT re-accepted                                                                              |
| ATD-0006 | 3D / lab rendering: Three.js                                                | ACCEPTED                         | HISTORICAL — no 3D lab in verified present state; REQUIRES CURRENT CONFIRMATION                                                                                      |
| ATD-0007 | Whiteboard assessment requirement: CONFIRMED (Product Constitution §5)      | ACCEPTED                         | HISTORICAL — requirement confirmation, NOT architecture; current status REQUIRES CURRENT CONFIRMATION                                                                |
| ATD-0008 | Mandatory initial assessment: CONFIRMED (Product Constitution §4)           | ACCEPTED                         | HISTORICAL — requirement confirmation, NOT architecture; current status REQUIRES CURRENT CONFIRMATION                                                                |
| ATD-0009 | Testing framework: Vitest (unit/integration) + Playwright (E2E) recommended | PROPOSED / PENDING               | HISTORICAL — current verified test framework is `bun:test`; any framework decision REQUIRES CURRENT HUMAN DECISION                                                   |
| ATD-0010 | Deployment platform: Vercel + Railway/Supabase recommended                  | PROPOSED / PENDING               | HISTORICAL — current verified deployment is Cloudflare Workers default (Node/Vercel options); REQUIRES CURRENT HUMAN DECISION                                        |
| ATD-0011 | Authentication provider: Supabase Auth recommended                          | PROPOSED / PENDING               | `ACCEPTED` as current decision (D-0003, 2026-09-09) — re-confirmed from present-state evidence + explicit human approval; historical record preserved for provenance |

### Phase-0 architecture decisions (`docs/archive/CURRENT_STATE (2).md`)

1. **Virtual Lab Domain** — separate module under `domain/lab-runtime/` per Clean Architecture principles (historical status: ACCEPTED; implementation details deferred to Phase 7). Current: **HISTORICAL / REQUIRES CURRENT CONFIRMATION** — not implemented/verified in present state; NOT re-accepted.
2. **Confusion/Fear Step** — hybrid model: part lesson flow state machine with independent concern interface (historical: ACCEPTED; state-transition rules and concern API signatures deferred to Phase 3). Current: **HISTORICAL / REQUIRES CURRENT CONFIRMATION**.
3. **External Simulations** — independent Simulation Approval Module with sandbox approval workflow (historical: ACCEPTED; verification-mechanism details deferred to Phase 6). Current: **HISTORICAL / REQUIRES CURRENT CONFIRMATION**.
4. **Identity Matching** — hybrid model with instructor distribution control (historical: PLANNED/FUTURE; interface stubs only, backend logic deferred per requirements). Current: **HISTORICAL / PLANNED — NOT APPROVED FOR IMPLEMENTATION**.
5. **Financial Safety Rules** — three required components (historical: ACCEPTED):
   1. Tax API (Stripe/Avalara institution-configurable).
   2. Currency conversion with SACU region overrides (ZAR, NAD, BWP, SLE, SZL special handling).
   3. Data residency/sovereignty compliance logging (EU GDPR, US CCPA, SACU local storage).
   - Per-country rules configuration-driven; audit-trail requirements mandatory per law.
     Current: **HISTORICAL → PROPOSED / REQUIRES HUMAN DECISION — NOT ACCEPTED.** These are requirements/recommendations for a future commerce phase, with no verified payment/tax/currency/residency implementation in present state (current Commerce is `PARTIAL` — reconciliation missing; see `docs/CURRENT_STATE.md` → Commerce Findings). They do not authorize or claim implementation.

- **Notes:** The `(2)` source documents remain unchanged. Where a historical item is consistent with verified present state (e.g., TypeScript, React, Vite, Supabase DB/Auth), present-state evidence stands on its own; the historical record is retained for provenance, not to confer acceptance.

---

## D-0003 — ATD-0011 — Authentication Provider: Supabase Auth (current accepted decision)

- **Reference:** `docs/archive/DECISION_LOG (2).md` → ATD-0011 (historical: Supabase Auth recommended, `PROPOSED / PENDING`); completed ATD-0011 authentication architectural forensics (2026-09-09, read-only).
- **Kind:** Application-architecture decision (current).
- **Date:** 2026-09-09 (explicit human approval).
- **Status:** `ACCEPTED`
- **Decision:** Supabase Auth is the accepted authentication provider for AskATutorLive.
- **Scope:** Establishes the authentication provider only. Does NOT accept: production provider configuration, Google OAuth configuration, email provider configuration, redirect URLs, production deployment configuration, authentication security hardening, authentication test coverage, or production verification — those remain separate engineering/operational concerns.
- **Architectural consequence:** The existing Supabase Auth implementation is the accepted foundation for user identity, authentication, session identity, server authentication, RLS identity, and application authorization integration.
- **Provider abstraction:** The existing provider integration boundary (`src/integrations/supabase`, `src/integrations/auth`) is preserved; no new abstraction work is introduced by this decision.
- **Rationale (current evidence):** Supabase Auth is already implemented (browser `@supabase/supabase-js` client; server bearer-token middleware `requireSupabaseAuth`, token `sub` → `userId`); `auth.users.id` is the identity root for `profiles`/`user_roles`; RLS and server-side authorization depend on the Supabase identity model; no alternative provider is implemented; and explicit human approval confirms the existing implementation as the architectural choice.
- **Provenance:** The historical ATD-0011 record (recommendation: Supabase Auth; status `PROPOSED / PENDING`; `docs/archive/DECISION_LOG (2).md`) is preserved unchanged (see D-0002). This entry is a **current** confirmation based on present repository evidence and explicit human approval — not a rewrite of history.
- **Separate operational status:** Authentication provider configuration is `NOT VERIFIED` in the deployed Supabase project (provider enablement, OAuth/email configuration, Site URL, redirect allow-list, production retest — see `docs/CURRENT_STATE.md`). The observed login failure (`validation_failed — "Unsupported provider: provider is not enabled"`) is a project-level provider-configuration matter and is **not** evidence against this accepted provider decision.

## D-0004 — INST-DEC-1 — Institution path: first-class M:N memberships coexisting with the §11 link model (current accepted decision)

- **Reference:** Institutional Learner Architecture design (`docs/architecture/INSTITUTIONAL_LEARNER_DESIGN.md`, INST-DEC-1); `docs/PRODUCT_CONSTITUTION.md` §11.
- **Kind:** Application-architecture decision (current).
- **Date:** 2026-09-10 (explicit human approval).
- **Status:** `ACCEPTED`
- **Decision:** Institutions participate through **first-class M:N memberships** (`institution_memberships` with context roles separate from `app_role`) **coexisting with** the Constitution §11 account-less link-based distribution model. Institutions may opt into either path. A Constitution §11 amendment note recording this coexistence was added to `docs/PRODUCT_CONSTITUTION.md`.
- **Scope:** Accepts the institutional domain direction (entities, journeys, M:N model, §13 parts 1 and the institution parts of 3–9) as the target model. Does **NOT** authorize: any schema/migration, RLS/GRANT change, API/UI, or membership implementation. It does not amend Constitution §11 outside the amendment note; the note does not itself authorize implementation.
- **Architectural consequence:** No single `institution_id` FK on learner-owned data; context roles are not `app_role` values; multi-institution is expressed through one join table.
- **Rationale (current evidence):** Verified present state has no institution schema; Constitution §11 mandates link distribution; institutional usage is a Constitution §14 funding pillar; explicit human acceptance of the two-path coexistence (INST-DEC-1 option A, 2026-09-10).
- **Remaining:** INST-DEC-2..10 remain `PROPOSED / PENDING` (see design §14).

---

## D-0005 — INST-DEC-5 — Bounded learning/assessment framework as the target model (current accepted decision)

- **Reference:** Institutional Learner Architecture design (`docs/architecture/INSTITUTIONAL_LEARNER_DESIGN.md`, INST-DEC-5); prior proposal `DECISION_LOG` "Assessment / Learning Architecture — PROPOSED / UNACCEPTED" (superseded in part above).
- **Kind:** Application-architecture decision (current).
- **Date:** 2026-09-10 (explicit human approval).
- **Status:** `ACCEPTED`
- **Decision:** The bounded learning/assessment framework is the accepted **target model**: `topics` + `topic_prerequisites` (relational, cycle-validated; catalog default + authorized overrides; assess only unproven prerequisites), typed `learner_assessments` (`prerequisite`|`topic`) with versioned `assessment_instruments`/`attempts`/`results`, learner-private `learner_affective_reports` (5-value §3.2 resolution; consent-gated; institution-facing aggregates only), `mastery_snapshots` (validity-window policy pending INST-DEC-6), and `learning_decisions` (AI never independently decides).
- **Scope:** Accepts the **model direction** recorded in design §6–§8 and §13 (parts 2, and learning parts of 3–9). Does **NOT** authorize: any schema/migration, RLS/GRANT, API/UI, wiring of `LearningRecordRepository`, a scoring service, or AI-graded "mastery". The prior proposal's non-bounded remainder stays NOT ACCEPTED.
- **UNKNOWN required before implementation:** assessment-instrument **content** (product/learning design per Constitution §3/§3.2/§4/§4.1/§5/§12), affective instrument/frequency/retention (product + legal), mastery validity policy (INST-DEC-6). Results-only-typed persistence; no client-computed mastery path.
- **Rationale (current evidence):** Constitution §2–§4/§12 require the difficulty→intervention→evidence→outcome loop and evidence preservation; verified present state has no machine-readable assessment/mastery persistence; explicit human acceptance (2026-09-10).
- **Remaining:** INST-DEC-6..10 `PROPOSED / PENDING` (design §14); each implementation phase requires its own authorized work item (design §16, §18).

---

## D-0006 — Phase 0 (AT-0000) exit-gate closure assessment (governance — recommended verdict)

- **Reference:** `docs/archive/MASTER_PLAN (2).md` (Phase 0 Definition of COMPLETE / VERIFIED; status `COMPLETE-PENDING-REVIEW`), `docs/archive/CURRENT_STATE (2).md` (17 acceptance checks), D-0001 (control system supersede), D-0002 (provenance record), AT-0003 (closure work item).
- **Kind:** Engineering-process / governance closure assessment (NOT an application-architecture decision).
- **Date:** 2026-09-10 (recorded by AT-0003; verdict is a **recommendation pending human acceptance**).
- **Status:** `ASSESSMENT RECORDED — VERDICT RECOMMENDED (PENDING HUMAN ACCEPTANCE)`.
- **Recommended verdict:** `CLOSED WITH EXPLICIT FOLLOW-UPS`.
- **Basis:** Phase 0's own Definition of COMPLETE ("All Phase 0 documentation created, internally reconciled, consistent") is evidenced as satisfied; its 17 acceptance checks all PASS and are re-checkable; the AT-0003 exit-gate table is 9/10 VERIFIED, with the sole NOT-VERIFIED gate being the Phase-1 gating decisions ATD-0009/ATD-0010 (which block Phase 1 start, not Phase 0 completeness).
- **Carried-forward follow-ups (separately owned; none blocks Phase 0 completeness):**
  - **Phase-1 gating decisions:** ATD-0009 (testing framework; current verified state `bun:test`) and ATD-0010 (deployment platform; current verified state Cloudflare Workers default) — both `PROPOSED / PENDING`, REQUIRES CURRENT HUMAN DECISION (phase lock: Phase 1 depends on both).
  - **Product-owner decisions:** learning-design §21 acceptance list (`docs/architecture/LEARNING_ASSESSMENT_DESIGN.md` — vocabulary, item sets, affective signal set, diagnosis mapping, mastery semantics, decision-autonomy boundary); INST-DEC-6/7/8/9 (product/legal); INST-DEC-2/3; payment-provider details and refund policy (future commerce).
  - **Future implementation (phase-locked; no code exists):** UN-003 (PhET scope, Phase 6); UN-004/UN-005 (video/voice recording limits, Phase 3); UN-006 (institution link flow, Phase 8); AI Gateway / Model Router (Phase 5 — the centralised `AiGateway` is verified present, roadmap model-router component not yet built); N-instructor (multiple-instructor) support (zero `instructor` matches in `src/`; HISTORICAL/PLANNED).
  - **Production verification:** ATD-0011 authentication-provider **production configuration** `NOT VERIFIED` (D-0003 scope: provider enablement, Site URL, OAuth redirect allow-list); AT-0002 residuals (production `anon` over-grant `arwdDxtm`; optional production runtime matrix once populated); affective retention/legal posture `REQUIRES VERIFICATION`.
  - **Evidence-resolvable:** `session_records.ai_summary` writer (UNKNOWN — REQUIRES VERIFICATION; `docs/BACKLOG.md` P2).
  - **Doc reconciliation:** MASTER_PLAN §1 vs D-0005 bounded acceptance (aligned in this exercise); stale archive docs preserved-not-rewritten (`docs/BACKLOG.md` P4).
- **Scope:** This entry does **not** accept, change, or re-classify any application architecture; it does **not** authorise Phase 1 or any implementation. Acceptance of this closure recommendation is the reviewer's act; the historical `COMPLETE-PENDING-REVIEW` status is resolved to this recorded recommendation pending that acceptance.

---

## D-0007 — Build-script portability correction and dependency-configuration observation (AT-0004, engineering/process)

- **Reference:** AT-0004 (branch `presentation/public-trust-pages`); build failure + correction, `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`; current-state record `docs/CURRENT_STATE.md` → AT-0004.
- **Kind:** Engineering-process / tooling record (NOT an application-architecture decision).
- **Date:** 2026-09-13 (AT-0004 verification phase).
- **Status:** RECORDED — including the evidence investigation of the package-manager question (2026-09-13). **No package-manager decision made: pnpm is NOT adopted** (STOP — an authoritative Bun workflow contradicts pnpm adoption; see fact 3). Changes already applied + verified; no new architecture accepted.
- **Recorded facts (evidence-verified in AT-0004):**
  1. **Windows build correction APPLIED and VERIFIED:** the previous build scripts used Unix-only environment-prefix syntax (`NODE_OPTIONS=...`, `NITRO_PRESET=...`), which fails on Windows shells. `build`, `build:dev`, `build:node`, `build:vercel` now use `cross-env` (devDependency `cross-env@10.1.0`); `pnpm build` → SUCCESS (exit 0, ~29 s) on this Windows host. This is a build-tooling correction, not an application-architecture decision.
  2. **`package.json` `pnpm.overrides` (`entities` = `4.5.0`) — RESOLVED, pin NOT REQUIRED:** the dead `pnpm` field was ignored by pnpm 11 (verified warning) and completely ignored by Bun. Investigation found no documented engineering reason for the pin (introduced by gpt-engineer scaffold `b0ac8db` alongside email templates); no `src/` or `test/` code imports `entities` directly (purely transitive). The `entities` dependency chain: `dom-serializer@2.0.0` (^4.2.0), `htmlparser2@8.0.2` (^4.4.0), `@react-email/render@2.1.0` (^4.5.0) all require `^4.x` → Bun resolves `entities@4.5.0` naturally; `parse5@7.3.0` (^6.0.0) maintains its own `entities@6.0.1` nested copy. The `vite.config.ts` aliases (lines 92–107) explicitly compensate for subpath differences between the two versions. No Snyk advisories for entities@4.5.0. The `pnpm.overrides` block has been **removed from `package.json`**. Verification: clean Bun install → 822 packages; `bunx tsc --noEmit` → 0; `bunx prettier --check .` → clean; `bun run lint` → 112 baseline; `bun run build` → SUCCESS. `bun.lock` entities resolution unchanged (4.5.0 top-level, 6.0.1 nested in parse5).
  3. **No package-manager decision made — STOP (authoritative Bun workflow contradicts pnpm adoption):** an untruncated evidence investigation (2026-09-13) across the tracked tree found an authoritative Bun workflow: `README.md` documents the project as "managed with **bun**" (`bun.lock`, `bunfig.toml`); `DEPLOYMENT.md` uses bun commands throughout (`bun install`, `bun run build`, `bun run start` via `scripts/start-node.mjs`, `FROM oven/bun:1` Dockerfile with `bun install --frozen-lockfile`, `bunx wrangler deploy`); the canonical tracked lockfile is `bun.lock` (unchanged) with tracked `bunfig.toml` (`minimumReleaseAge = 86400` supply-chain guard); `docs/AUDIT_BASELINE_AT-0001.md` records "Package manager: `bun`"; tests run via `bun:test`. `package.json` has **no `packageManager` field**. The only pnpm signal is the dead `pnpm` field (ignored by pnpm 11) and untracked `pnpm-lock.yaml`/`pnpm-workspace.yaml`; npm appears only in ignore patterns and a "or: npm install" alternative — none constitute adoption evidence. Per the AT-0004 decision rule, the contradictory authoritative Bun workflow means the decision is **NOT MADE → pnpm is NOT adopted**; `pnpm-lock.yaml`/`pnpm-workspace.yaml` remain **untracked** and are **excluded** from the AT-0004 commits. Package-manager unification (bun, or a deliberate pnpm migration) stays an open item requiring an explicit human decision.
- **Scope:** Records the current dependency/tooling state, the not-applied override, and that **no new application-architecture decision was accepted** during AT-0004. It does **not** authorise implementation, migration, dependency changes, or a package-manager migration.

---

## D-0008 — Auth/`localhost:3000` classification and self-service checkout enablement (AT-0005, engineering/process + verified current-state facts)

- **Reference:** AT-0005 (branch `presentation/public-trust-pages`); auth/origin investigation (`src/integrations/supabase/{client.ts,client.server.ts,auth-middleware.ts,auth-attacher.ts,previewAuthStorage.ts}`, `src/start.ts`, `src/routes/{auth.tsx,reset-password.tsx}`, `vite.config.ts`, `.env*`); commerce slice (`src/application/use-cases/commerce/initiate-checkout.ts`, `src/routes/_authenticated/pay-tutor.tsx`, `src/routes/checkout.success.tsx`, `src/presentation/domains/7-commerce-financial/payments/BulkLessonConfig.tsx`); migration `supabase/migrations/20260914120000_self_service_checkout_intent_finalize.sql`.
- **Kind:** Engineering-process / verified-current-state record (NOT an application-architecture decision). **No application-architecture decision accepted by AT-0005.**
- **Date:** 2026-09-14 (AT-0005 implementation + verification).
- **Status:** RECORDED.
- **Recorded facts (evidence-verified in AT-0005):**
  1. **`localhost:3000` classification — INERT generated code; no code change made.** The only `localhost:3000` references are `scripts/start-node.mjs` run-time fallback (`process.env.PORT ??= "3000"`), `.env.example` `PORT=3000`, `DEPLOYMENT.md` examples, and the scaffold-generated `previewAuthStorage.ts` (dev-editor regex + `ancestorOrigins`). In `previewAuthStorage.ts` the 3000/localhost branch activates **only** when the host matches a project-UUID pattern AND the window is framed (`window.parent !== window`) AND the `EDITOR_ORIGINS` regex matches (e.g. `http://localhost:3000` for the Lovable dev editor); under the plain `localhost:8080` dev origin (`364d9c1` introduced 8080) it returns `localStorage`. Dev server verified running at `http://localhost:8080`; SSR smoke test: `/`, `/auth`, `/reset-password`, `/tutors`, `/dashboard` → HTTP 200; no `localhost:3000` and no Supabase ref leakage in served HTML; auth surfaces intact (sign-in → `/dashboard`, PKCE recovery, OAuth/signup `redirectTo` = `window.location.origin`). Git: `previewAuthStorage.ts` added in `4c74239`; the integration stack was touched by the "AskATutorLive Lovable removal and infrastructure/self-hosting changes" commit `59710c5` (2026-08-12); no codegen/generator manifest exists — the added headers are Lovable-era scaffold artifacts. **Classification: Lovable/`previewAuthStorage` integration = DEPRECATED legacy support — inert locally, retained as scaffold history; removal recommended as a separately authorized follow-up (not performed in AT-0005).** App must not depend on port 3000.
  2. **Self-service checkout enabled — server-authoritative only.** `PaymentGateway.startCheckout` (previously latent/unused; caller-supplied `amountCents` risk logged in BACKLOG) is now wired through the new `initiateCheckout` use-case: client sends only `{tutorId, lessons, lessonMinutes}` (zod-validated 1–100 / 30|45|60|90|120); amount, gross/commission/net are re-derived **server-side** by `create_bulk_lesson_intent`; the like follows `create_bulk_lesson_intent` (server-authoritative) → `startCheckout(amount,…)` → approval URL. The dangerous client-amount variant exists **only** in forensic history (`docs/evidence/forensic/forensic_batch_2/.../checkout.functions.ts`, `PayButton.tsx`) and must never be resurrected into `src/`.
  3. **Two SQL blockers fixed in the new migration** `20260914120000_self_service_checkout_intent_finalize.sql`: (a) `create_bulk_lesson_intent` lost its `authenticated` grant during the 2026-08-12 grant hardening (20260812* migrations revoked PUBLIC/anon and never re-granted) — **grant restored to `authenticated`** so the self-service path is executable by learners; (b) `finalize_payment_succeeded` (service_role; used by the PayPal webhook AND the checkout-return capture path) did **not** credit `prepaid_lessons` for bulk intents (only the admin-only `confirm_bulk_lesson_intent` did) — the function now inserts the prepaid-lessons reservation when `metadata->>'kind' = 'bulk_lessons'` (idempotent via `NOT EXISTS`), then re-`REVOKE PUBLIC` + `GRANT service_role`. Net effect: a customer completing self-service capture now receives ledger credit AND prepaid lessons.
  4. **Verification (AT-0005):** `bunx tsc --noEmit` → 0; eslint clean on the 4 changed files; `bunx prettier --check .` → clean; `bun run lint` → 112 baseline unchanged; `bun run build` → SUCCESS; `git diff --check` → clean. **Not `PRODUCTION-VERIFIED`**: no live PayPal sandbox/live capture and no DB migration applied to any environment in AT-0005 (migration file authored; environment application requires separate authorization).
- **Scope:** Records (1) the evidence classification of `localhost:3000`/Lovable scaffold code, (2) the wiring of the latent `startCheckout` path behind a server-authoritative use-case without changing gateway architecture, and (3) the two migration-level grant/credit corrections. It does **not** accept any new application architecture, does **not** authorize DB-application or production deployment of the migration, and does **not** create a package-manager or provider decision. No commit was made during AT-0005; the untracked `pnpm-lock.yaml`/`pnpm-workspace.yaml` remain excluded.

---

## D-0009 — FC-003 — AT-0005 migration applied + verified on NON-PROD (engineering/process + verified current-state record)

- **Reference:** FC-003 (`docs/BACKLOG.md`); migration `supabase/migrations/20260914120000_self_service_checkout_intent_finalize.sql`; non-prod project `rwpxaejhouunxlcibpou` (`askatutorlive-at0002-nonprod`); AT-0005 (`src/lib/payments/*`, `src/routes/checkout.success.tsx`, `use-cases/commerce`, `payment_intents`/`prepaid_lessons`/`ledger_entries`); current-state record `docs/CURRENT_STATE.md` → AT-0005 → FC-003.
- **Kind:** Engineering-process / verified-current-state record (NOT an application-architecture decision). **No application-architecture decision accepted by FC-003.**
- **Date:** 2026-09-14 (FC-003 execution + verification).
- **Status:** RECORDED. Classification: **`PARTIALLY VERIFIED`** — the migration's DB layer is fully verified on the non-prod project; the **live provider (PayPal sandbox) path is BLOCKED** on missing sandbox credentials. Not `PRODUCTION-VERIFIED`; production apply NOT performed.
- **Recorded facts (evidence-verified in FC-003, non-prod `rwpxaejhouunxlcibpou`):**
  1. **Pre-apply bug reproduced:** `create_bulk_lesson_intent` proacl = `{postgres=X/postgres}` — **no role could EXECUTE it** (the self-service blocker the migration fixes). `finalize_payment_succeeded` proacl = `{postgres=X/postgres,service_role=X/postgres}`. Applied migration history = 73; the only repo migration newer than applied was `20260914120000_self_service_checkout_intent_finalize.sql`.
  2. **Apply (Management API, isolated to the non-prod ref):** `POST /v1/projects/{ref}/database/migrations` with the verbatim file bytes as `query`, `name = 20260914120000_self_service_checkout_intent_finalize.sql`, and a `rollback` payload (prior function definition + old grant state — captured at `%LOCALAPPDATA%\Temp\opencode\fc003-rollback.sql`). The API auto-assigns a per-second server timestamp as the history `version` → recorded as **`20260914073900`**; applied count 73 → 74.
  3. **Post-apply grants verified:** `create_bulk_lesson_intent` proacl = `{postgres=X/postgres,authenticated=X/postgres}`; `has_function_privilege` authenticated = **true**, anon = false. `finalize_payment_succeeded` grant boundary unchanged (service_role only — verified `SET ROLE authenticated` → `permission denied for function finalize_payment_succeeded`). Function body contains the `bulk_lessons` → `prepaid_lessons` credit branch (idempotent via `NOT EXISTS`). RLS policy counts unchanged (payment_intents 3, payment_attempts 1, prepaid_lessons 1, ledger_entries 2).
  4. **DB behavior tests (5/5 PASS; single transactional batch; ROLLBACK; zero residue):** intent creation as student s001 (gross 25000¢ / commission 3750¢ gold 15% / net 21250¢ / USD / method online / metadata `{kind:bulk_lessons,lessons:5,lesson_minutes:60}` / student = caller); argument-signature proof that `create_bulk_lesson_intent(uuid,int,int,text)` has **no amount parameter** (server re-derives gross = 50×100×(60/60)×5 = 25000); `finalize_payment_succeeded` called twice → ledger 2 rows + `prepaid_lessons` 1 row + idempotent + status `succeeded` + provider_ref `sandbox:fc003-capture-A` (first call wins; prepaid row 5/5 lessons / 60 min / hourly_rate_cents 5000 / USD / intent-linked); scope guard s002 (no assignment) → rejected `Find Tutors subscription required`; service_role boundary intact. Post-rollback residue = 0.
  5. **Live provider leg BLOCKED:** `payment_providers` row `paypal` is `is_enabled=false`, `credentials_ref=PAYPAL`, and no `PAYPAL_*` env vars exist on the host → no live PayPal sandbox checkout could be executed. The migration's DB layer is verified; the end-to-end provider handshake is NOT verified.
  6. **Regression (unchanged):** `bunx tsc --noEmit` 0; `bunx prettier --check .` clean; `bun run lint` 112 (74 err / 38 warn — baseline); `bun run build` SUCCESS. Working tree same as AT-0005 (no new source changes; documentation updated).
- **Scope:** Records that the AT-0005 migration is APPLIED and DB-VERIFIED on the non-prod project and that the live provider path remains unverified (blocked on credentials). It does **not** authorize production application, does **not** accept validation of a live payment provider, does **not** manufacture payment success evidence, and does **not** accept any new application architecture. No commit was made during FC-003; the untracked `pnpm-lock.yaml`/`pnpm-workspace.yaml` remain excluded.

---

## D-0010 — FC-004 — PayPal SANDBOX end-to-end checkout verification attempt (engineering/process + verified current-state record)

- **Reference:** FC-004 (`docs/BACKLOG.md`); existing AT-0005 checkout path (`src/routes/_authenticated/pay-tutor.tsx`, `src/application/use-cases/commerce/initiate-checkout.ts`, `src/lib/payments/router.server.ts`, `src/lib/payments/paypal.server.ts`, `src/routes/api/checkout/return.tsx`, `src/routes/api/public/webhooks/paypal.ts`, `src/infrastructure/adapters/paypal-webhook-action.ts`); non-prod project `rwpxaejhouunxlcibpou` (`askatutorlive-at0002-nonprod`); `payment_providers` table; current-state record `docs/CURRENT_STATE.md` → FC-004.
- **Kind:** Engineering-process / verified-current-state record (NOT an application-architecture decision). **No application-architecture decision accepted by FC-004.**
- **Date:** 2026-09-14 (FC-004 configuration inspection + blocker determination).
- **Status:** RECORDED. Classification: **`BLOCKED — SANDBOX CREDENTIALS UNAVAILABLE`** — no genuine PayPal SANDBOX transaction could be executed. No code, configuration, or database change was made; no commit.
- **Recorded facts (evidence-verified in FC-004):**
  1. **Provider disabled + credential store absent:** non-prod `payment_providers.paypal` row = `is_enabled=false`, `mode=sandbox`, `credentials_ref=PAYPAL`. The table has no secret-bearing columns; `config` jsonb is empty for paypal. Credentials are resolved **only** from process env (`paypal.server.ts readCreds()` builds `${ref}_CLIENT_ID` / `${ref}_CLIENT_SECRET` / `${ref}_WEBHOOK_ID` and throws `Missing PayPal credentials` when absent).
  2. **Env sweep (process/user/machine + `.env`/`.env.local`/`.env.example`):** `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_ENVIRONMENT`, `PAYPAL_LIVE_CLIENT_ID`, `PAYPAL_LIVE_CLIENT_SECRET` = **all ABSENT**. `.env.local` empty; `.env` contains only Supabase + keys.
  3. **Runtime wiring blocker (in addition to credentials):** the app runtime `.env` points `SUPABASE_URL`/`VITE_SUPABASE_URL` at **PRODUCTION** `bzjlhxmiwdkteqkzqasi`; there is NO non-prod runtime (no `.env` for `rwpxaejhouunxlcibpou`, no Vercel project linked). A real checkout with the existing runtime would write a `payment_intents` row to **production** — prohibited. Even with sandbox credentials, execution requires an approved non-prod runtime pivot that does not exist.
  4. **Sandbox endpoint:** `api-m.sandbox.paypal.com` responds at the TLS/app layer (unauthenticated HEAD → 403 is expected PayPal behavior; not a network failure); code `baseUrl('sandbox')` = `https://api-m.sandbox.paypal.com` correct.
  5. **Doc/impl mismatch (recorded, NOT changed):** `.env.example` documents PayPal as "Configured in the database (payment_providers table). No env vars required," but the implementation reads `PAYPAL_*` env vars only; the DB is a **reference** store (`credentials_ref`), not a secret store.
  6. **Regression (unchanged):** `bunx tsc --noEmit` 0; `bunx prettier --check .` clean; `bun run lint` 112 (74 err / 38 warn — baseline); `bun run build` SUCCESS; `git diff --check` clean. No source change made in FC-004.
- **Scope:** Records the evidence-backed `BLOCKED` determination for the live PayPal sandbox leg (FC-003's one unverified path) and the single combined prerequisite to re-open (sandbox credentials + webhook id into an approved non-prod runtime + enable `payment_providers.paypal` in non-prod). It does **not** authorize production application, does **not** validate a live payment provider, does **not** manufacture payment success evidence, and does **not** accept any new application architecture. No commit was made during FC-004; the untracked `pnpm-lock.yaml`/`pnpm-workspace.yaml`/`audit-evidence/EMAIL_REFERENCE_AUDIT_20260913-092816.txt` remain excluded.

---

If an explicit human architecture decision is discovered later, it must be recorded here as `ACCEPTED` with its source.
