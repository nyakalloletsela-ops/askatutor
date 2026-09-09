# AskATutorLive — Master Engineering Programme & Governance Protocol

- **Work ID:** AT-0001 (control-system baseline; AT-0002 tracked below)
- **Status:** IN_PROGRESS (control system installed and AT-0001 COMPLETED; AT-0002 PARTIALLY VERIFIED — see Work Item Register / capability entry)
- **Type:** Engineering governance (process control), not an application architecture decision
- **Authority:** The governance model supplied with the AT-0001 task brief. Where the supplied Master Engineering Programme is referenced, it is authoritative for *engineering process*. It is NOT automatically authoritative for *application architecture decisions* (see Governance Rule below).

---

## 0. Purpose

This document is the permanent engineering-control specification for the AskATutorLive repository. It exists to prevent:

- context switching from destroying continuity
- abandoned implementations
- ghost features
- duplicate architectures
- demo-only systems being mistaken for production systems
- undocumented architectural changes
- stale documentation being treated as fact
- unsupported verification claims
- unfinished work being silently forgotten

The repository's *actual* state — as established by the AT-0001 baseline audit — is recorded in
`docs/CURRENT_STATE.md` and `docs/AUDIT_BASELINE_AT-0001.md`. **Evidence takes precedence over assumptions.**

---

## 1. Governance Rule (Roadmap ≠ Accepted Architecture)

A statement in this Master Plan's roadmap is a **programme map**, not a bound application-architecture decision.

Any specific architectural stance must be either:

1. backed by an `ACCEPTED` entry in `docs/DECISION_LOG.md`, **or**
2. explicitly labelled `PROPOSED`.

**In particular:**

> **Assessment architecture is `PROPOSED / UNACCEPTED`.**
>
> The "dedicated assessment outcome consumed by Learning" direction discussed during the audit is a *proposed* architectural direction. It has **not** been accepted by explicit human decision and is **not** permission to implement. Only an explicit `ACCEPTED` entry in `docs/DECISION_LOG.md` authorizes implementation.

No roadmap phase implies authorization to implement.

---

## 2. Lifecycle / State Model

`DESIGNED` — planned/documented, not yet built.
`IMPLEMENTED` — source exists in the repository.
`APPLIED` — a migration/schema/config exists and is intended to be applied.
`TESTED` — a test asserts the behavior.
`VERIFIED` — confirmed by repository/runtime evidence.
`PRODUCTION-VERIFIED` — confirmed by current-session, tool-based evidence **from the actual production environment**.

Rules:

- Do not claim a higher state than the evidence supports.
- Source inspection yields at most `VERIFIED` (source-level). Live DB/applied-migration state remains `UNKNOWN — REQUIRES VERIFICATION` unless live evidence exists.
- `PRODUCTION-VERIFIED` requires current-session tool evidence from production. Repository/deployment config alone does **not** establish it.
- A migration file existing on disk is `APPLIED` intent only; whether it is reflected in the live database is `UNKNOWN — REQUIRES VERIFICATION` until verified live.
- `AI OUTPUT != EVIDENCE`. AI-generated content may be a coach artifact but is not authoritative learning evidence unless an accepted, implemented evidence model exists.

---

## 3. Roadmap Phases (Programme Map)

The phases below are the programme map supplied with the task. They are **programme phases**, not automatically accepted application-architecture decisions. Phase-specific architecture must satisfy the Governance Rule (Section 1).

> NOTE: The AT-0001 baseline audit (docs/CURRENT_STATE.md, docs/AUDIT_BASELINE_AT-0001.md) MUST be consulted to determine where the repository *actually* sits relative to these phases. Do not assume the repository is at a phase merely because the roadmap lists it. See `ROADMAP POSITION` in the baseline audit.

Phases 0–19 (as supplied):

- **0** — Governance & baseline establishment (this work; AT-0001).
- **1** — Foundations & repository consolidation.
- **2** — Identity, authentication & authorization baseline.
- **3** — Learner isolation & multi-user security.
- **4** — Learning backbone (Activity / Evidence / Mastery distinction).
- **5** — Assessment & outcomes.
- **6** — Mastery & progression.
- **7** — AI gateway hardening (quotas, logging, retries, timeouts, moderation).
- **8** — Commerce & financial integrity.
- **9** — Trust, safety & privacy.
- **10** — Audit & operations.
- **11** — Quality & security testing.
- **12** — Performance & scale.
- **13** — Deployment & production verification.
- **14** — Continuous improvement.
- **15** — Recommended/intervention layer.
- **16** — Content & curriculum.
- **17** — Communication & tutoring.
- **18** — Recommendation/intervention (advanced).
- **19** — Future/expansion roadmap.

> The exact official phase list supplied in the task overrides this summary if a discrepancy exists; this summary preserves the 0–19 programme structure.

---

## 4. Work Item Register

Permanent work IDs use the format `AT-####`.

- **`AT-0001` — Governance Installation & Baseline Architecture Audit** (COMPLETED — control docs installed and baseline persisted; not VERIFIED).
- **`AT-0002` — Live Database Verification & RLS Isolation Confirmation** (`PARTIALLY VERIFIED / awaiting authorized populated test environment` — static/applied RLS model PARTIALLY VERIFIED via source/migration RLS evidence + recorded session-3 live narrative; investigation paused; not actively executing. Definitive cross-learner A/B **runtime** isolation still NOT VERIFIED / BLOCKED, pending an authorized, populated test environment with two learner identities and explicit resume authorization. See capability entry below).

IDs are never casually reused. Each new meaningful piece of work receives a new permanent ID assigned in `docs/BACKLOG.md` and tracked in `docs/CURRENT_STATE.md`.

---

## 5. AT-0002 Capability Entry (verification outcome)

**Work ID:** AT-0002
**Capability affected:** Learner isolation & multi-user security (Phases 2–3); applied database / RLS state.

- **Previous status:** `UNKNOWN — REQUIRES VERIFICATION` → `BLOCKED` (session 1) → `PARTIALLY VERIFIED` (session 2) → `PARTIALLY VERIFIED` (session 3, applied-DB segments now VERIFIED).
- **New status:** `PARTIALLY VERIFIED` — the **static/applied RLS model** (Set A learner tables `assignments`, `assignment_submissions`, `notes`, `session_records`, `simulations` — NOT the Category-2/GAP-001..005 tracked set `profiles`, `user_roles`, `tutor_subscriptions`, `tutor_courses`, `sessions`) is `PARTIALLY VERIFIED` via source/migration RLS evidence + recorded session-3 live narrative. **Current reproducible live evidence = `NOT VERIFIED`** (session-3 claims are historical narrative in `docs/CURRENT_STATE.md`; no captured query-result artifacts stored). The **definitive cross-learner (A vs B) runtime isolation test remains NOT VERIFIED / BLOCKED** (empty production DB; `auth.users`=0; no learner identities/records; out-of-scope to create). Not COMPLETED, not fully VERIFIED.
- **Evidence (recorded session 3, live PRODUCTION applied DB via authenticated Management API over HTTPS — read-only, no secrets exposed; historical narrative, NOT captured output):** all 5 learner tables (Set A) exist with RLS enabled; exact owner/participant/admin-scoped policies verified for SELECT/INSERT/UPDATE/DELETE; RLS helpers (`has_role`,`is_parent_of`,`can_access_classroom_room`) + `app_role` enum `{admin,tutor,student,parent}` present; all 5 tables have 0 rows; `auth.users`=0; source↔applied policy MATCH. (Session-2 evidence preserved: REST data plane reachable; anon/probe → HTTP 200 `[]`.) `docs/evidence/queries/*.sql` = query definitions only; `supabase_schema.json`/`.txt` = error captures (`LegacyDeclarativeNotEnabledError`), not valid schema dumps.
- **Tests (session 3, recorded narrative, not captured artifacts):** read-only Management-API SQL (query definitions mirrored in `docs/evidence/queries/*.sql`): table/RLS-enablement catalog check; `pg_policies` for all 5 tables; column schema; declared FKs; helper-function presence; `app_role` enum; `COUNT(*)` for all 5 tables; `auth.users`/`user_roles` counts. Cross-learner A/B runtime tests NOT run (no two authenticated learner identities; tables empty; out-of-scope to create test data). Service-role not used as RLS evidence.
- **Verification level:** Static/applied RLS model (Set A: applied schema + RLS policy definitions + row-presence) = `PARTIALLY VERIFIED` — supported by source/migration RLS evidence plus recorded session-3 live narrative. **Current reproducible live evidence = `NOT VERIFIED`** (no captured query-result artifacts in repo). Cross-learner runtime isolation and application-boundary runtime behavior = `NOT VERIFIED`. `PRODUCTION-VERIFIED` is **not** claimed: session-3 results were live at the time but are stored only as narrative in `docs/CURRENT_STATE.md`, not as captured current-session tool evidence.
- **Remaining uncertainty:** Cross-learner (A vs B) **runtime enforcement behavior** — whether one authenticated learner can actually SELECT/UPDATE/DELETE another learner's rows, or INSERT falsely-attributed rows — remains `UNKNOWN — REQUIRES VERIFICATION` (unexercised due to empty DB + no identities).
- **Dependencies:** An authorized, populated test environment with **two authenticated learner identities (Learner A / B)** and controlled A/B-owned records (or explicit authorization to create test data in a non-production/empty-DB environment) to execute the definitive cross-learner RLS tests (read + write + IDOR). Explicit re-authorization to resume.
- **Next required work:** Finish AT-0002 — execute Learner-A-vs-Learner-B runtime RLS isolation tests in an authorized, populated test environment (two identities + controlled records).

---

## 6. Authority & Change Control

- Document changes to engineering process are made here (MASTER_PLAN.md) and in `docs/WORK_PROTOCOL.md`.
- Application architecture decisions are recorded in `docs/DECISION_LOG.md`. Only explicit human acceptance produces `ACCEPTED`.
- This master plan is a process control document. It does not approve any application implementation by itself.
