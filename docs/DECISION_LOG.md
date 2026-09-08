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

If an explicit human architecture decision is discovered later, it must be recorded here as `ACCEPTED` with its source.
