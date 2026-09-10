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

| Field | Value |
|-------|-------|
| Work ID | AT-0000 |
| Date | 2026-09-04 |
| Phase | 0 |
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

| Field | Value |
|-------|-------|
| Work ID | RESTRUCTURE-0001 (documentation-only) |
| Date | 2026-09-08 |
| Phase | 0 (documentation organization) |
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

| Field | Value |
|-------|-------|
| Work ID | ATD-0011-CLOSURE (documentation-only) |
| Date | 2026-09-09 |
| Phase | Governance (decision closure) |
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

| Field | Value |
|-------|-------|
| Work ID | INSTITUTIONAL-LEARNER-DESIGN-0001 (design + decision closure; documentation-only) |
| Date | 2026-09-10 |
| Phase | Governance (architecture design + decision closure) |
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

| Field | Value |
|-------|-------|
| Work ID | LEARNING-ASSESSMENT-DESIGN-0001 (product/learning-design spike) |
| Date | 2026-09-10 |
| Phase | Governance (design spike; targets Phase 4–6 learning backbone) |
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

| Field | Value |
|-------|-------|
| Work ID | PHASE0-CLOSURE-0001 → registers permanent work ID AT-0003 (documentation-only) |
| Date | 2026-09-10 |
| Phase | Governance (Phase 0 exit-gate closure) |
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

## 3. CHANGE RULES

1. Never silently remove previous negative evidence
2. Every work item must have a change entry
3. Changes are recorded chronologically
4. File changes are tracked at the file level
5. Component changes are tracked at the component level
6. Database changes are tracked separately
7. Security changes are tracked separately
8. Decisions are recorded in DECISION_LOG.md and referenced here
