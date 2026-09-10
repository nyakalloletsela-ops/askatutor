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

| ID | Historical decision | Historical status (`(2)` source) | Current status under AT-0001 |
|----|---------------------|-----------------------------------|------------------------------|
| ATD-0001 | Implementation language: TypeScript | ACCEPTED | HISTORICAL — consistent with verified present state (TS project); NOT re-accepted as a decision |
| ATD-0002 | Frontend framework: React | ACCEPTED | HISTORICAL — consistent with verified present state (React 19); NOT re-accepted |
| ATD-0003 | Build tool: Vite | ACCEPTED | HISTORICAL — consistent with verified present state (`vite build`); NOT re-accepted |
| ATD-0004 | Styling: Tailwind CSS | ACCEPTED | HISTORICAL — present-state styling stack NOT verified; REQUIRES CURRENT CONFIRMATION |
| ATD-0005 | Database: PostgreSQL via Supabase | ACCEPTED | HISTORICAL — consistent with verified present state (Supabase project); NOT re-accepted |
| ATD-0006 | 3D / lab rendering: Three.js | ACCEPTED | HISTORICAL — no 3D lab in verified present state; REQUIRES CURRENT CONFIRMATION |
| ATD-0007 | Whiteboard assessment requirement: CONFIRMED (Product Constitution §5) | ACCEPTED | HISTORICAL — requirement confirmation, NOT architecture; current status REQUIRES CURRENT CONFIRMATION |
| ATD-0008 | Mandatory initial assessment: CONFIRMED (Product Constitution §4) | ACCEPTED | HISTORICAL — requirement confirmation, NOT architecture; current status REQUIRES CURRENT CONFIRMATION |
| ATD-0009 | Testing framework: Vitest (unit/integration) + Playwright (E2E) recommended | PROPOSED / PENDING | HISTORICAL — current verified test framework is `bun:test`; **Vitest NOT adopted**; `bun:test` + Playwright (future E2E) = current `ACCEPTED` decision (D-0007, 2026-09-10) |
| ATD-0010 | Deployment platform: Vercel + Railway/Supabase recommended | PROPOSED / PENDING | HISTORICAL — current verified deployment is Cloudflare Workers default; Cloudflare Workers primary + provider-neutral external integrations = current `ACCEPTED` decision (D-0008, 2026-09-10) |
| ATD-0011 | Authentication provider: Supabase Auth recommended | PROPOSED / PENDING | `ACCEPTED` as current decision (D-0003, 2026-09-09) — re-confirmed from present-state evidence + explicit human approval; historical record preserved for provenance |

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
- **Date:** 2026-09-10 (recorded by AT-0003; verdict initially a **recommendation pending human acceptance**).
- **Status:** `ACCEPTED (2026-09-10, recorded via docs/PHASE0_ACCEPTANCE.md)` — the reviewer formally accepted `CLOSED WITH EXPLICIT FOLLOW-UPS`; recorded recommendation resolved to acceptance. Acceptance is a governance act, not production-readiness evidence.
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

## D-0007 — ATD-0009 — Testing framework: `bun:test` + Playwright (current accepted decision)

- **Reference:** `docs/BACKLOG.md` CF-001 (ATD-0009, Phase 1 gate); `docs/PHASE1_ACCEPTANCE.md` / `docs/PHASE1_ENTRY_GATE.md` (combined foundation acceptance record); verified testing stack (`bun.lock`, `bunfig.toml`, `bun test` -> `package.json` scripts); historical `docs/archive/DECISION_LOG (2).md` → ATD-0009 (Vitest + Playwright recommendation, `PROPOSED / PENDING`).
- **Kind:** Engineering-process / tooling decision (current).
- **Date:** 2026-09-10 (explicit human approval, Phase 1 start).
- **Status:** `ACCEPTED`
- **Decision:** Unit/integration tests use the **Bun test runner** (`bun:test`) as the verified deterministic framework — `bun test`, runnable to exit-code 0. **Playwright** is the accepted future E2E framework (setup separately authorized — CF-012). **Vitest is explicitly not adopted** (a historical recommendation only). CI quality verification gates on `bun test` + `bunx tsc --noEmit` (green locally).
- **Scope:** Accepts the framework choices and the `"test": "bun test"` command. Does NOT accept: any production code change, Playwright installation/e2e scripts (pending CF-012), lint enforcement (pre-existing red baseline — CF-011), or CI execution verification (CF-013).
- **Rationale (current evidence):** `bun test` executes the existing suite deterministically (35 pass / 0 fail / exit 0, 2026-09-10); Bun v1.3.14 + `bun.lock` are the verified package manager; no Vitest dependency exists.
- **Remaining:** Playwright E2E setup (CF-012), lint baseline enforcement (CF-011), CI execution (CF-013) — `docs/PHASE1_PROGRESS.md`.

---

## D-0008 — ATD-0010 — Deployment platform: Cloudflare Workers primary + provider-neutral external integrations (current accepted decision)

- **Reference:** `docs/BACKLOG.md` CF-002 (ATD-0010, Phase 1 gate); `docs/PHASE1_ACCEPTANCE.md` / `docs/PHASE1_ENTRY_GATE.md` (combined foundation acceptance record); verified present state (Cloudflare Workers default: `wrangler.jsonc`, `src/server.ts` fetch shim, `@cloudflare/vite-plugin`, `nodejs_compat`); historical `docs/archive/DECISION_LOG (2).md` → ATD-0010 (Vercel + Railway/Supabase recommendation, `PROPOSED / PENDING`).
- **Kind:** Application-architecture / deployment decision (current).
- **Date:** 2026-09-10 (explicit human approval, Phase 1 start).
- **Status:** `ACCEPTED`
- **Decision:** **Cloudflare Workers** is the primary deployment target (existing default verified present). **Supabase** provides Postgres + Auth (existing verified stack, D-0003). **External integrations are provider-neutral**, configured via secure **Admin/server-side config** (not hard-coded per-provider branches): AI providers via `AI_PROVIDER` env → `platform_config.ai_provider` Admin switch → default, with keys via env or `ai_provider_keys` (Admin → AI); email via `EMAIL_PROVIDER` (resend/smtp/none); payments via server-side PayPal with webhook signature verification. Contract recorded in `docs/EXTERNAL_INTEGRATION_POLICY.md`.
- **Scope:** Accepts the deployment platform and the provider-neutral integration policy direction. Does NOT accept: any deployment/infrastructure change, provider configuration, or production verification (all remain `NOT VERIFIED` / separate operational work).
- **Rationale (current evidence):** Cloudflare Workers is the verified default deployment (Node/Vercel presets remain as options); provider seams already resolve at server/Admin boundary (`src/lib/ai/provider.server.ts`, `src/lib/email/provider.server.ts`, `src/integrations/supabase`).
- **Remaining:** per-integration verification and production deployment posture — future slices / operational (`docs/PHASE1_PROGRESS.md`).

---

If an explicit human architecture decision is discovered later, it must be recorded here as `ACCEPTED` with its source.
