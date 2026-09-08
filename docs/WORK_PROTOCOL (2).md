# ASKATUTORLIVE — WORK PROTOCOL

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

This document defines the engineering work protocol for AskATutorLive. Every meaningful work item must follow this protocol.

---

## 2. WORK ITEM STRUCTURE

Every work item must record:

| Field | Description |
|-------|-------------|
| WORK ID | Unique identifier (AT-XXXX format) |
| PHASE | Phase number |
| PHASE NAME | Phase description |
| OBJECTIVE | What this work item achieves |
| STATUS | NOT STARTED / IN PROGRESS / COMPLETE / VERIFIED / BLOCKED |
| FILES INSPECTED | Files read before making changes |
| FILES CREATED | New files created |
| FILES MODIFIED | Existing files changed |
| FILES DELETED | Files removed |
| COMPONENTS CHANGED | Components affected |
| DATABASE CHANGES | Schema/migration changes |
| API CHANGES | API endpoint changes |
| SECURITY CHANGES | Security-relevant changes |
| TESTS EXECUTED | Tests run |
| TEST RESULTS | Pass/fail results |
| VERIFICATION LEVEL | None / Local Test / Integration Test / Production |
| KNOWN FAILURES | Tests that failed |
| KNOWN LIMITATIONS | Constraints or limitations |
| UNRESOLVED ISSUES | Open issues |
| DECISIONS MADE | Decisions taken during work |
| DECISIONS PENDING | Decisions deferred |
| DEPENDENCIES AFFECTED | Other work items or phases affected |
| NEXT ACTION | What should happen next |

---

## 3. WORK ITEM TEMPLATE

```markdown
# WORK ITEM: AT-XXXX

PHASE: X
PHASE NAME: Phase Name
WORK ID: AT-XXXX
DATE: YYYY-MM-DD

## OBJECTIVE
[What this work item achieves]

## STATUS
[NOT STARTED / IN PROGRESS / COMPLETE / VERIFIED / BLOCKED]

## FILES INSPECTED
- [list of files read]

## FILES CREATED
- [new files]

## FILES MODIFIED
- [changed files with summary of changes]

## FILES DELETED
- [deleted files]

## COMPONENTS CHANGED
- [components affected]

## DATABASE CHANGES
- [schema/migration changes, if any]

## API CHANGES
- [API changes, if any]

## SECURITY CHANGES
- [security-relevant changes, if any]

## TESTS EXECUTED
- [tests run]

## TEST RESULTS
- [pass/fail]

## VERIFICATION LEVEL
- [None / Local Test / Integration Test / Production]

## KNOWN FAILURES
- [failed tests or issues]

## KNOWN LIMITATIONS
- [constraints]

## UNRESOLVED ISSUES
- [open issues]

## DECISIONS MADE
- [decisions taken]

## DECISIONS PENDING
- [deferred decisions]

## DEPENDENCIES AFFECTED
- [affected dependencies]

## NEXT ACTION
- [what should happen next]
```

---

## 4. WORK SEQUENCING RULES

1. **One work item at a time** per focus area
2. **Complete before moving on** — do not leave work items half-done
3. **Update state after every meaningful change**
4. **Never skip documentation** — if it's not documented, it didn't happen
5. **Test before marking complete** — implementation without testing is not complete
6. **Verify before marking verified** — testing without independent verification is not verified

---

## 5. FILE CHANGE TRACKING

### 5.1 When to Record

Record file changes when:
- Creating a new file
- Modifying an existing file
- Deleting a file
- Renaming a file
- Moving a file

### 5.2 What to Record

For each file change:
- File path
- Type of change (create/modify/delete)
- Summary of what changed
- Why it changed
- Which work item caused the change

---

## 6. STATE CONTROL FILES

The following files must be updated after every meaningful work item:

| File | Purpose | Update Frequency |
|------|---------|-----------------|
| CURRENT_STATE.md | Fast state lookup | After every work item |
| CHANGE_LOG.md | Chronological change record | After every work item |
| BACKLOG.md | Remaining work | When work items added/completed |
| DECISION_LOG.md | Architecture decisions | When decisions made |
| MASTER_PLAN.md | Phase roadmap | When phases change status |

---

## 7. PHASE COMPLETION CHECKLIST

Before marking a phase COMPLETE:

- [ ] Implementation scope reviewed
- [ ] All planned components accounted for
- [ ] All planned files created/modified
- [ ] Tests executed
- [ ] Test failures reviewed
- [ ] Known limitations recorded
- [ ] Dependencies checked
- [ ] Security checks completed
- [ ] Documentation updated
- [ ] CURRENT_STATE.md updated
- [ ] CHANGE_LOG.md updated
- [ ] BACKLOG.md updated
- [ ] Next phase dependency confirmed

Before marking a phase VERIFIED:

- [ ] Independent verification evidence exists
- [ ] Verification covers all phase requirements
- [ ] Verification results documented
- [ ] No critical issues outstanding

Before marking a phase PRODUCTION-VERIFIED:

- [ ] Actual production evidence exists
- [ ] Production behavior matches requirements
- [ ] Production monitoring confirms behavior

---

## 8. DECISION PROTOCOL

### 8.1 When to Record a Decision

Record a decision when:
- Choosing between multiple technical approaches
- Defining architecture boundaries
- Setting policy or rules
- Making scope decisions
- Resolving ambiguity

### 8.2 Decision Record Structure

```markdown
# DECISION: ATD-XXXX

DATE: YYYY-MM-DD
STATUS: [PROPOSED / ACCEPTED / REJECTED / SUPERSEDED]

## QUESTION
[What is being decided]

## OPTIONS
1. [Option A]
2. [Option B]
3. [Option C]

## TRADE-OFFS
[Pros and cons of each option]

## RECOMMENDATION
[What is recommended and why]

## DECISION
[What was actually decided]

## RATIONALE
[Why this decision was made]

## IMPACT
[What this decision affects]
```

---

## 9. UNKNOWN TRACKING

Unknowns are tracked in CONFIRMED_REQUIREMENTS.md under "UNKNOWN REQUIREMENTS".

When an unknown is resolved:
1. Update CONFIRMED_REQUIREMENTS.md
2. Record the decision in DECISION_LOG.md
3. Update affected architecture documents
4. Update CHANGE_LOG.md

---

## 10. HANDOFF PROTOCOL

When handing off work:

1. Ensure CURRENT_STATE.md is up to date
2. Ensure all work items are documented
3. Ensure next action is clearly identified
4. Ensure no half-done work remains
5. Ensure tests pass (or failures are documented)
6. Commit all changes
7. Update CHANGE_LOG.md
