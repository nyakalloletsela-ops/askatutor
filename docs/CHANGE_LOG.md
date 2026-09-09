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

## 3. CHANGE RULES

1. Never silently remove previous negative evidence
2. Every work item must have a change entry
3. Changes are recorded chronologically
4. File changes are tracked at the file level
5. Component changes are tracked at the component level
6. Database changes are tracked separately
7. Security changes are tracked separately
8. Decisions are recorded in DECISION_LOG.md and referenced here
