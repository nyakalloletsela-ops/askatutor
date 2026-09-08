# AskATutorLive — Work Protocol

- **Work ID:** AT-0001
- **Type:** Engineering process control
- **Companion:** `docs/MASTER_PLAN.md`, `docs/CURRENT_STATE.md`, `docs/DECISION_LOG.md`, `docs/BACKLOG.md`

This document is the permanent operating protocol for all engineering work in this repository.

---

## 1. Work Items & IDs

- Every meaningful piece of work gets a permanent ID: `AT-####`.
- IDs are assigned in `docs/BACKLOG.md` when a work item is created, and tracked in `docs/CURRENT_STATE.md`.
- IDs are never casually reused. A completed ID is retired; new work gets a new ID.
- The one-next-action rule: at any time there is exactly ONE recommended next action, chosen from dependencies, security, isolation, architecture, current state, blockers, and production value.

---

## 2. Work-Item Lifecycle

`INSPECT → PLAN → IMPLEMENT → TEST → VERIFY → DOCUMENT → CLOSE`

Each state is recorded in the work item and/or `docs/CURRENT_STATE.md`.

State labels for work items:

- `BACKLOG` — accepted as real work, not started.
- `PLANNED` — design/approach exists, not yet begun.
- `IN_PROGRESS` — active work.
- `COMPLETED` — the work declared done.
- `BLOCKED` — cannot progress; blocker recorded.
- `VERIFIED` — only if the verification criteria are actually satisfied (see Section 6).

Do **not** mark a work item `VERIFIED` merely because files were written or work "was done." Verification must be evidence-based.

---

## 3. Incremental State Recording & Context Switching

- Record state incrementally. Do not rely on memory across sessions.
- Before writing state: `git status`, inspect current control docs, check whether another session changed them, reconcile newer state, then write. Never silently overwrite newer information.
- When interrupting work mid-way, leave a recorded handoff: current work ID, state, what is done, what is next, blockers, and the ONE recommended next action.

### Interruption & safe interruption

- An interruption is safe when the current state can be reconstructed from documents without loss of context.
- If an interruption is required, write the incremental state record first.

---

## 4. Classification vs Interruption (two separate decisions)

A discovery may be classified as one of:

- `SECURITY ISSUE`
- `BLOCKER`
- `BUG`
- `DEPENDENCY`
- `ARCHITECTURE CHANGE`
- `DISCOVERY`
- `NEW FEATURE`
- `FUTURE IDEA`

**The classification does not automatically determine whether work must stop.** Classify the finding, then separately evaluate whether the particular finding actually requires interruption (e.g., an active security emergency with immediate impact) versus safe continuation/recording.

- If a condition genuinely requires interruption, interrupt safely (record state first).
- Otherwise record the finding in `docs/BACKLOG.md` / `docs/CURRENT_STATE.md` and continue the current authorized work.

---

## 5. Ghost-Work & Handoff Prevention

- No work is "silently forgotten." Every identified finding becomes a backlog/work item with an ID, or is explicitly dismissed with a recorded reason.
- No implementation is started without an authorized, ID-tracked work item.
- Handoff requirements: when passing work to another session, provide work ID, state, objective, evidence, decisions, blockers, and ONE next action.

---

## 6. Verification Levels

Verification levels map to the state model in `docs/MASTER_PLAN.md`:

- `DESIGNED`, `IMPLEMENTED`, `APPLIED`, `TESTED`, `VERIFIED`, `PRODUCTION-VERIFIED`.

Rules:

- Source inspection = `VERIFIED` (source-level) at most.
- Live DB/applied-migration/RLS state = `UNKNOWN — REQUIRES VERIFICATION` unless live evidence exists.
- `PRODUCTION-VERIFIED` requires current-session tool evidence from the actual production environment. Config/deployment files alone do not establish it.
- Do not convert source evidence into production evidence.
- `AI OUTPUT != EVIDENCE`: AI output is not authoritative learning evidence unless an accepted, implemented evidence model exists.

---

## 7. Completion / Verification Reconciliation

Before marking a work item `COMPLETED` or `VERIFIED`:

1. Review all incremental state records from the task.
2. Every failure, limitation, contradiction, or negative test result must be either **resolved** or **explicitly carried forward as a known limitation/blocker**.
3. Never silently erase earlier negative evidence. Never silently supersede earlier findings.
4. If repository inspection succeeded but live production verification was unavailable, do not claim production verification.

---

## 8. No Silent Supersession

- Later documents may correct earlier ones only explicitly, with the newer finding recorded and the older finding preserved as history.
- Stale documents are recorded as stale and/or marked with a historical notice; they are not silently deleted or rewritten as if current.

---

## 9. Backlog Governance

- `docs/BACKLOG.md` is the single register of real, accepted, or candidate work.
- Backlog entries preserve: ID, title, category, description, reason, affected domain, dependencies, architectural impact, risk, priority, source/evidence, status.
- Doing backlog work requires starting its work item explicitly (assigning ID, entering PLANNED/IN_PROGRESS).
- Fixing backlog items is a separate decision from authorizing a task. Do not fix backlog items as a side effect of an audit unless it is an active security emergency.

---

## 10. One-Next-Action Rule

At the end of any work item, choose exactly ONE recommended next action, based on dependencies, security, isolation, architecture, current implementation state, blockers, production value. Record it in `docs/CURRENT_STATE.md`. The next action is a *recommendation*; beginning it requires an explicit, separate authorization (a new work item enters PLANNED/IN_PROGRESS).
