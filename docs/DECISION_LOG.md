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
| ATD-0009 | Testing framework: Vitest (unit/integration) + Playwright (E2E) recommended | PROPOSED / PENDING | HISTORICAL — current verified test framework is `bun:test`; any framework decision REQUIRES CURRENT HUMAN DECISION |
| ATD-0010 | Deployment platform: Vercel + Railway/Supabase recommended | PROPOSED / PENDING | HISTORICAL — current verified deployment is Cloudflare Workers default (Node/Vercel options); REQUIRES CURRENT HUMAN DECISION |
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

If an explicit human architecture decision is discovered later, it must be recorded here as `ACCEPTED` with its source.
