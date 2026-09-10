> **STATUS: ACCEPTED DESIGN — NOT IMPLEMENTED — NOT CURRENT IMPLEMENTATION SOURCE OF TRUTH**
> Design accepted 2026-09-10 (INST-DEC-1 and INST-DEC-5; see `docs/DECISION_LOG.md` → D-0004, D-0005). No schema, migration, RLS policy, API, or UI described here is implemented, and this acceptance does NOT authorize implementation. Current authority for implemented state: `docs/CURRENT_STATE.md` + `docs/AUDIT_BASELINE_AT-0001.md`.

# ASKATUTORLIVE — INSTITUTIONAL LEARNER ARCHITECTURE (DESIGN)

Work ID: INSTITUTIONAL-LEARNER-DESIGN-0001  
Status: ACCEPTED DESIGN — NOT IMPLEMENTED  
Date: 2026-09-10  
Related: `docs/PRODUCT_CONSTITUTION.md` (§3, §3.1, §3.2, §4, §5, §6, §9, §10, §11, §12, §14); `docs/CONFIRMED_REQUIREMENTS.md`; `docs/DECISION_LOG.md`; `docs/architecture/DATA_ARCHITECTURE.md` (historical); `docs/architecture/INSTITUTION_ARCHITECTURE.md` (historical)

---

## 1. EXECUTIVE SUMMARY

AskATutorLive currently supports learning only as **episodic sessions** (session booking, `session_records`, participant-scoped assignments) with no persistence of difficulty, assessment, mastery, affective state, or any institution structure. The Product Constitution (§2–§4, §11) mandates a learner-difficulty model, mandatory first-three-lessons interaction, evidence preservation, and institutions. None of that machine-readable learning state exists.

This design is the accepted target model for institutions and the learning engine. Two of the ten decision items are **ACCEPTED** (2026-09-10, explicit human approval):

- **INST-DEC-1 (ACCEPTED):** Institutions participate via **first-class M:N memberships** (context roles) **coexisting with** the Constitution §11 account-less link-based model. A Constitution §11 amendment note has been issued (`docs/PRODUCT_CONSTITUTION.md`).
- **INST-DEC-5 (ACCEPTED):** The **bounded learning/assessment framework** is the target — `topic_prerequisites` graph, typed `learner_assessments` (prerequisite|topic), `learner_affective_reports` (learner-private), `mastery_snapshots`, and `learning_decisions`.

This is a **design-only deliverable**. Nothing is implemented, wired, or authorized for implementation. Each future implementation phase requires its own separately authorized engineering work item.

---

## 2. CURRENT ARCHITECTURE EVIDENCE

| Capability | Evidence | Status |
|---|---|---|
| Learner Difficulty Model (Learner Fear / Learner Claim / Identified Difficulty / Intervention / Learning Evidence / Mastery) | `docs/PRODUCT_CONSTITUTION.md` §3 | DESIGNED only — not implemented |
| `LearningStage` / `LearningRecordRepository` seam | `src/domain/ports/learning.ts` | IMPLEMENTED as interface only — UNWIRED into `AppDependencies` |
| Episodic learning (sessions, `session_records`, verbatim, ownership RLS) | migrations + AT-0002 sessions 5–6 | IMPLEMENTED / APPLIED / VERIFIED (non-prod populated project, 628-case matrix) |
| Assignments + submissions (participant-scoped, grade/feedback) | migration `20260530152504_b823d221-…sql` | IMPLEMENTED / APPLIED / TESTED |
| Topic catalog (`subjects`, `tutor_courses`) | migration `20260522110136_e7689ab4-…sql` | IMPLEMENTED / APPLIED / TESTED — catalog only; `assignments.subject` is free text |
| RBAC (`app_role` admin/tutor/student/parent, `user_roles`, `has_role`) | migration `20260518180453_b7b6b188-…sql` + AT-0002 | IMPLEMENTED / VERIFIED (non-prod); REST grant gaps on `profiles`/`user_roles` + ~18 siblings (AT-0002 finding) |
| Whiteboard-as-evidence (PDF) | Constitution §5; `session_records` | APPLIED (design); live PDF preservation runtime = UNKNOWN |
| Assessment/result persistence, mastery, learning decisions | (no tables) | NOT IMPLEMENTED — no schema exists |
| Institutions, memberships, cohorts, classes | (no tables) | NOT IMPLEMENTED — no schema exists |
| Affective / learner state | (no tables) | NOT IMPLEMENTED — no schema exists |
| Client-side quiz "assessment" mode | `presentation/.../labs_.simulation-lab.tsx` | IMPLEMENTED — local-only, not machine-readable persistence (must NOT be extended into evidence) |

---

## 3. EXISTING LEARNING MODEL

The verified present state is **episodic and transactional**: a learner books a session; the session produces `session_records` (verbatim transcript, ownership-scoped, RLS-verified by AT-0002); assignments are participant-scoped with grade/feedback on submissions; the simulation lab has a client-side quiz mode; `tutor-chat.ts` references "misconceptions/prerequisites" in prompt material only.

There is exactly **one learning-model seam**: `src/domain/ports/learning.ts` (`LearningStage`, `LearningStageEvidence`, `LearningRecordRepository`) — interface-only and unwired. The prior assessment-outcome proposal (an "Option B"-style structured learning-state backend) was `PROPOSED / UNACCEPTED` (`docs/DECISION_LOG.md` ≈ L34–44). This design's **INST-DEC-5** accepts the bounded scope of that direction; the remainder (scoring service, AI-graded mastery, heuristics) stays NOT ACCEPTED.

---

## 4. INSTITUTIONAL DOMAIN MODEL

Proposed core entities (ADDITIVE — none exist today):

- `institutions` — root. id, name, slug, status, settings.
- `institution_memberships` — the single **M:N join** between an app actor and an institution. Carries a **context role** that is SEPARATE from `app_role`: `{ admin, staff, instructor, learner }`. Rationale: one person can be a tutor (app_role) who is also an institution admin in one institution and a learner in another. Reusing `app_role` as membership context is rejected (INST-DEC-2).
- `academic_terms` — temporal grouping for progress/reporting windows.
- `cohorts` — institution-(or term-)scoped learner groups; the early grouping primitive.
- **Delayed (NOT in core):** `departments`, `grades`, `classes` — a premature hierarchy is rejected; `cohorts` covers early needs.
- `institution_links` (design-space for §11 coexistence) — tokenized, expiring, usage-limited session-distribution links. Link-learners are identified by the institution-provided identifier within session scope; **no account is auto-created** for them (Constitution §11).

**Rejected anti-patterns:** a single `institution_id` column on learner-owned data; a hard-coded 1:1 institution↔learner; treating context roles as `app_role` values.

---

## 5. JOURNEYS

- **5.1 Learner with account** — difficulty/fear interaction (mandatory first three lessons per §4, then opt-in) → identified difficulty → intervention → evidence → learner reflection (§3.2) → targeted assessment → mastery; tutor-preparation report (§9.1) whenever a tutor is engaged. Learner controls all sharing.
- **5.2 Institution-link learner (no account, §11)** — joins via institution link into a session/class context; identified within institution scope; produces PDF/whiteboard/recordings/session evidence aggregable by the institution. Because there is no account-linked identity, account-linked mastery/personalization does not apply (documented limitation, accepted under INST-DEC-1).
- **5.3 Institution operator/staff** — enrolls cohorts/terms; sets instrument policy; consumes **aggregate** metrics and anonymized/institution-scoped session outputs through SECURITY-DEFINER reporting (never raw learner-private affective rows; see §8, §9).
- **5.4 Tutor / instructor in institution context** — a tutor prepares from the §9.1 report; an instructor (institution context role) sees institution-scoped aggregates and per-learner evidence within their institutional authorization — never platform-wide data, never other institutions' data.

---

## 6. PREREQUISITE ARCHITECTURE

- `topic_prerequisites` — relational graph rows `(topic_id, requires_topic_id)`. Supports linear chains (A→B→C) and conjunctive prerequisites (A+C→B via multiple rows for B). A DAG; write-time cycle validation via a SECURITY-DEFINER validator RPC.
- **Catalog-level prereqs are the default**; institutions (and catalog-level tutors) may set **logged, audited overrides**. Authorization to override is permissive-down (catalog default wins unless an authorized context overrides).
- **Assessment policy:** assess ONLY unproven prerequisites. If a valid `mastery_snapshots` row exists for the prerequisite (within the INST-DEC-6 validity window), skip; otherwise run a typed `prerequisite` assessment.
- **Missing/insufficient mastery → `learning_decisions`:** a decision row `{ kind, actor, recommendation (remediate | retry | alternate-path | skip-with-rationale), rationale }`. AI NEVER independently decides; learner confirmation and tutor authority (§9.2) govern (Constitution §3.1, §6).

---

## 7. ASSESSMENT ARCHITECTURE

- `learner_assessments` — an assessment instance: learner, instrument, **type** `{ prerequisite | topic }`, source `{ constitution-3 pathway | tutor | instructor }`, status.
- `assessment_attempts` — timed attempts; `assessment_results` — machine-readable, per-item outcomes that feed `mastery_snapshots`.
- `assessment_instruments` — a bounded catalog of authored, **versioned** instruments so results stay comparable; authoring authority = catalog + authorized institution contexts (INST-DEC-9).
- **INSTRUMENT CONTENT = UNKNOWN — REQUIRES PRODUCT/LEARNING DESIGN.** Constitution §3/§3.2/§4/§4.1/§5/§12 bind the instruments: conversational and non-exam; learner-controlled; whiteboard-first; outcomes must include the learner's final 5-state reflection; **a score alone is never mastery** (evidence is not automatically mastery, §12).
- No client-computed "mastery" path. The current local-only quiz pattern is explicitly barred from becoming evidence.

---

## 8. AFFECTIVE BOUNDARY

- `learner_affective_reports` — **learner-private by default**; the learner is the only row-level reader; institutions receive **aggregates only**.
- Resolution state is the **5-value §3.2 set**: resolved / reduced / unchanged / increased / uncertain.
- **Consent gates** are required before any institution-facing use; the §4 mandatory first-three-lessons interaction stays product-mandatory regardless of sharing consent.
- Instrument/frequency/retention = UNKNOWN — REQUIRES product + legal design (child data; GDPR/CCPA/SACU residency — cf. historical financial-safety provenance `docs/DECISION_LOG.md` D-0002 → ATD-0005).
- AI boundary (§3.1): probe, clarify, guide — never invent an interpretation; affective self-reports are evidence of learner state only as reported/confirmed by the learner.

---

## 9. AUTHORIZATION MODEL

Authorization matrix (resource rows × actor columns):

| Resource | Learner (owner) | Tutor | Institution Instructor | Institution Staff | Institution Admin | Platform Admin |
|---|---|---|---|---|---|---|
| Own profile/evidence | Full | Scoped (§9.1 report, active tutor) | Scoped (institutional authz) | Aggregate-only | Aggregate-only | Legit ops/safety (§10) |
| Membership/context | Own memberships | Non-applicable | Non-applicable | Manage staff/instructors | Manage members/links | Manage all |
| Prerequisite assessment | Create own | Authorize within tutor scope | Authorize within cohort | No | Policy | Audit |
| Topic assessment | Create own | Authorize/grade within scope | Authorize/grade within cohort | No | Policy | Audit |
| Affective reports | Full (own only) | Prepared-report only (learner-consented) | Consent-gated aggregate only | Aggregate only | Aggregate only | Audit (consent-gated) |
| Evidence records | Full (own) | Scoped | Scoped | Scoped/aggregate | Aggregate + evidence per authz | Audit |
| Mastery snapshots | Full (own) | Scoped | Cohort scoped | No | Aggregate metrics | Audit |
| Aggregate metrics | Own-only views | Scoped | Cohort | Term/cohort | Institution-wide | Platform-wide |

**Rules:** authorization is resolved through **SECURITY-DEFINER membership helpers** (`resolve_membership`, `has_institution_role`, cohort membership) shared by RLS policies AND aggregate RPCs. **No client-supplied `institution_id` is ever used as authorization.** Aggregate RPCs return aggregates only and enforce **small-cell suppression**.

**Threats mitigated:** analytic/report IDOR (helper + server-side aggregate only), cross-institution access (membership helper + RLS), cross-cohort access, aggregate leakage, small-cell deanonymization.

---

## 10. MULTI-INSTITUTION

Institutions are M:N with learners through the single join table `institution_memberships`. A learner may hold different context roles in different institutions simultaneously. Learner-owned data (evidence, mastery, affective) stays learner-owned; institutions get context-scoped or aggregate visibility. Design proscriptions: **no** single `institution_id` FK on learner-owned tables; **no** hard-coded 1:1; institutions never co-own learner data.

---

## 11. FUNDING VALUE

Constitution §14 makes AskATutorLive a paid platform (free tier, paid plans, tutor services, institutional usage). The learning-engine data (typed assessment outcomes, mastery, affective aggregate insight, §9.1 prep reports) is the institutional differentiator institutions will pay for (reports, efficacy, compliance). It also defines free-tier vs paid boundaries (instrument authoring authority; aggregate reporting depth). This value statement does NOT authorize commerce implementation — existing commerce findings stand (AT-0001: reconciliation missing).

---

## 12. ARCHITECTURAL OPTIONS

- **Option A — Supabase-native bounded context (RECOMMENDED).** New schema in the existing Postgres project; RLS + SECURITY-DEFINER helpers; aggregates as SECURITY-DEFINER RPCs. Aligns with the current single data plane and the RLS enforcement pattern AT-0002 verified live. Limits: not sized for heavy BI; fine here.
- **Option B — A + deferred warehouse.** Ship A; add an OLAP/export layer only when aggregate load demands. Kept as the growth path for §18.
- **Option C — separate microservice/context — REJECTED.** Duplicates the authorization surface, has no existing pattern in the repo, adds infra/ops cost, and moves away from the single-policy Postgres boundary AT-0002 verified.

---

## 13. RECOMMENDED ARCHITECTURE (10 PARTS)

1. **Institutions context** — `institutions`, `institution_memberships` (context roles), `academic_terms`, `cohorts`, link-model tables (§11 coexistence).
2. **Learning Engine context** — `topics`, `topic_prerequisites`, `assessment_instruments`/`attempts`/`results`, `mastery_snapshots`, `learning_decisions`, `learner_affective_reports`.
3. **Learner-owned entities**; no single `institution_id` on learner data.
4. **SECURITY-DEFINER authz helpers** shared by policies AND aggregate RPCs.
5. **Workflow** — assess only unproven prerequisites; remediation decisions recorded; evidence mandatory; affective interaction mandatory first three lessons then opt-in (§4).
6. **Prerequisite graph** — catalog default + institution overrides; write-time cycle validation.
7. **Typed assessments** — instrument content product-designed later; conversational, non-exam; whiteboard-first; 5-state reflection captured.
8. **Affective** — learner-private; consent gates; aggregate-only to institutions.
9. **Reporting** — SECURITY-DEFINER aggregate RPCs; small-cell suppression; no client `institution_id` authorization.
10. **Stay-out list** — no RPC-computed client "mastery"; no scoring service; no AI-authored "mastery"; AI interpretation remains distinguishable from evidence (§6); affiliate-safe.

---

## 14. DECISION REGISTER (INST-DEC-1 .. INST-DEC-10)

| ID | Question | Recommendation | Status |
|---|---|---|---|
| INST-DEC-1 | Institution path: link-only vs first-class members vs both | **Both: M:N memberships + §11 links** | **ACCEPTED (2026-09-10, D-0004)** — §11 amendment note issued |
| INST-DEC-2 | Reuse `app_role` as membership context or separate context roles | Separate `institution_memberships.context_role` | PROPOSED / PENDING |
| INST-DEC-3 | Topic identity & versioning | Controlled `topics` rows; versioned instruments keyed by topic | PROPOSED / PENDING |
| INST-DEC-4 | Prerequisite storage | Relational `topic_prerequisites` (not jsonb) | PROPOSED / PENDING |
| INST-DEC-5 | Accept the bounded learning/assessment framework as target model | **Accept: topics/prereqs, typed assessments, affective, mastery, learning decisions** | **ACCEPTED (2026-09-10, D-0005)** — instrument content remains UNKNOWN |
| INST-DEC-6 | Mastery validity window / expiry policy | Finite window; learner evidence extends it | PROPOSED / PENDING (product design) |
| INST-DEC-7 | Affective consent + retention | Consent gates; fail-closed retention | PROPOSED / PENDING (legal) |
| INST-DEC-8 | Aggregate reporting boundaries + small-cell thresholds | Small-cell suppression; aggregate-only RPCs | PROPOSED / PENDING (legal/product) |
| INST-DEC-9 | Instrument authoring authority | Catalog + authorized institution contexts, audited | PROPOSED / PENDING |
| INST-DEC-10 | Migration phasing/order | Phases 1–5 (§16), each its own authorized work item | PROPOSED / PENDING |

Consequences of ignoring the register: INST-DEC-1 ignored → §11 conflict or lost institutional revenue; INST-DEC-5 ignored → continued episodic-only learning with no mastery/assessment persistence. Remaining items are PENDING until explicit human acceptance.

---

## 15. RISKS

1. **Aggregate RPC misuse → analytic leak** — mitigated by helper-only authorization and the "no client `institution_id`" rule.
2. **Affective data legal exposure** (child data; GDPR/CCPA/SACU residency) — consent gates + UNKNOWN retention; the design fails closed (learner-private).
3. **§11 link-model tension** — link-learners cannot receive account-linked mastery/personalization; documented under INST-DEC-1; per-learner identity remains institution-controlled.
4. **Governance status drift** — the prior `PROPOSED / UNACCEPTED` entry (`DECISION_LOG` ≈ L34–44) is superseded ONLY for the INST-DEC-1/5 scope; all other proposal content remains NOT ACCEPTED.
5. **AT-0002 grant gap** on `profiles`/`user_roles` + ~18 sibling tables blocks new-table integration until separately remediated (BACKLOG).
6. **Scope creep** into AI grading/scoring services — enforced by the §13 stay-out list.
7. **AI-as-evidence** — §3.1/§6 bound; an AI grade is never evidence; tutor authority (§9.2) governs.
8. **Efficacy overclaim** — mastery = demonstrated capability via instrument, not attendance; no claims before live verification.

---

## 16. MIGRATION IMPACT

**Additive only.** Proposed phases (each a separate authorized engineering work item):

1. `topics` + `topic_prerequisites` + seed catalog defaults + cycle validator.
2. `institutions` + `institution_memberships` (context roles) + membership helpers.
3. `assessment_instruments` / `assessment_attempts` / `assessment_results` + `mastery_snapshots`.
4. `learner_affective_reports` + consent gates.
5. `learning_decisions` + aggregate RPC reporting + small-cell suppression.

New tables ship **with grants + RLS from creation** (explicitly avoiding the AT-0002 empty-`relacl` class). No existing table is altered in phasing; migrating `assignments.subject` free text to `topics` is optional and later. Nothing is applied; no production impact.

---

## 17. CURRENT STATE UPDATE

No implementation was performed. This deliverable is design + decision closure only: this document, `docs/DECISION_LOG.md` → D-0004/D-0005, and the Constitution §11 amendment note. Status: **ACCEPTED DESIGN — NOT IMPLEMENTED.**

---

## 18. NEXT ACTION

1. **Authorize an engineering work item for Phase 1** — the `topics` + `topic_prerequisites` schema and cycle-validation spike (smallest de-risking step; independent of institutions).
2. **Parallel, product-side:** design the assessment-instrument content per Constitution §3/§4/§5 (resolves INST-DEC-6/9 and the UNKNOWN instrument content).
3. Re-open INST-DEC-2..10 for acceptance during or after Phase 1.

---