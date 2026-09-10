> **STATUS: PROPOSED DESIGN — NOT IMPLEMENTED**
> Product/learning-design spike (2026-09-10). No schema, migration, SQL, API, UI, seed data, or runtime change is described as implemented here, and nothing in this document authorizes implementation. It is a design proposal that product owners must review and accept before any engineering spike. Current authority for implemented state: `docs/CURRENT_STATE.md` + `docs/AUDIT_BASELINE_AT-0001.md`. Scope governed by `docs/DECISION_LOG.md` → D-0004/D-0005 and `docs/architecture/INSTITUTIONAL_LEARNER_DESIGN.md` (INST-DEC-1, INST-DEC-5 ACCEPTED; INST-DEC-2..10 PENDING).

# ASKATUTORLIVE — LEARNING & ASSESSMENT DESIGN

Work ID: LEARNING-ASSESSMENT-DESIGN-0001 (PROD-LEARN-0001 — design spike)  
Status: PROPOSED DESIGN — NOT IMPLEMENTED  
Date: 2026-09-10

---

## 1. EXECUTIVE SUMMARY

AskATutorLive has no implemented learning/assessment backend. Every concept in the learning model (difficulty, diagnosis, assessment, mastery, evidence, intervention, affective state, institutions) exists today only as: (a) a Product Constitution requirement (`docs/PRODUCT_CONSTITUTION.md`), (b) an accepted-but-unimplemented architectural target (`docs/architecture/INSTITUTIONAL_LEARNER_DESIGN.md`, INST-DEC-1/5), or (c) unrelated UI/client-side behavior (simulation-lab quiz). This document is the repository-first **product/learning-design analysis** that fixes, for acceptance, WHAT the learning system should mean and measure before engineering begins.

**Verdict of this spike:** the product is **READY WITH PRODUCT DECISIONS REQUIRED** (see §21). The semantics below resolve the vocabulary, journey, assessment-instrument categories, diagnosis, mastery, and decision model — but several genuine product-owner choices remain (assessment-instrument content, affective-signal set, retention/legal posture, mastery window).

**Foundational positions preserved from accepted decisions:**

- One AskATutorLive account per learner; the same account continues when a private-tutoring learner is later associated with an institution; institutional affiliation is separate from identity and platform authorization (D-0004).
- Learning model: **Diagnosis → Intervention → Evidence → Mastery → Decision**.
- New-topic entry identifies prerequisites, assesses prerequisite knowledge, assesses the learner's affective state about the topic, diagnoses, supports an intervention, then evaluates mastery before the next decision.
- Evidence is not automatically mastery; AI output is not evidence; AI never silently becomes the authoritative record.

---

## 2. REPOSITORY EVIDENCE

### 2.1 Verified current state (evidence inventory)

| Concept | Existing Evidence | Status | Location | Notes |
|---|---|---|---|---|
| Learning stage seam (`Diagnosis → Intervention → Evidence → Mastery → Decision`) | `LearningStage`/`LearningStageEvidence`/`LearningRecordRepository` interfaces | DESIGNED (interface only, UNWIRED) | `src/domain/ports/learning.ts:7-21`; re-exported `src/domain/ports/index.ts:15` | Not in `AppDependencies` (`src/application/contracts/dependencies.ts:26-45`); zero consumers |
| Assessment / quiz | simulation-lab `LearningMode = "assessment"` | IMPLEMENTED but client-only, EPHEMERAL | `src/routes/_authenticated/labs_.simulation-lab.tsx:28,92,438-491` | Inline React state scoring; "Finish" resets state; no server call/persistence (`docs/BACKLOG.md` "Quiz scoring is client-side and ephemeral") |
| AI quiz questions | `QuizQuestionSchema`, `quiz` field in AI schema | DESIGNED/APPLIED (AI-generated, stored in `simulations.schema_json`) | `src/application/use-cases/simulation/lab.ts:83,145,164` | Content for UI quiz only; not an assessment backend |
| Quiz me (chat) | SimChat "Quiz me" → single-turn AI prompt | IMPLEMENTED (conversational, unscored) | `src/presentation/.../SimChat.tsx:45`; `src/application/use-cases/simulation/chat.ts:45,52` | No persistence, no scoring |
| Tutor conversation | Socratic student mode; tutor mode mentions misconceptions/prerequisites/rubrics | IMPLEMENTED (AI coaching; no learning-state persistence) | `src/application/use-cases/ai/tutor-chat.ts:23-75,98` | Prompt-level only; no model record |
| Mastery / prerequisite / intervention / affective / diagnosis persistence | — | NOT IMPLEMENTED (no tables, no types) | (grep of 73 migrations: zero tables/types) | `docs/AUDIT_BASELINE_AT-0001.md:139` "No coherent Activity/Evidence/Mastery backend" |
| Assessment result/attempt persistence | — | NOT IMPLEMENTED | `docs/CURRENT_STATE.md:64,191-194` | `assignment_submissions` is a phantom table (no app consumers, `docs/BACKLOG.md`) |
| Subject/course catalog | `subjects` (id, name, level, description), `tutor_courses` (tutor_id, name, level, status) | IMPLEMENTED/APPLIED (admin/tutor catalog; no learning semantics) | migration `20260522110136_*.sql:13,33`; `src/routes/_authenticated/courses.tsx` | No topic graph; `assignments.subject` is free text |
| Roles/RBAC | `app_role` `{admin,tutor,student,parent}`, `user_roles`, `has_role` | IMPLEMENTED/VERIFIED (non-prod AT-0002) | migration `20260518180453_*.sql:3,5,14`; AT-0002 sessions 5–6 | No institution context roles (INST-DEC-2 pending) |
| AI gateway | `AiGateway` contract → adapter → `provider.server.ts` fetch; all AI via `deps.aiGateway.chat()` | IMPLEMENTED (centralized; server-side entitlement-gated) | `src/application/contracts/ai.ts:57`; `src/infrastructure/adapters/ai-gateway-adapter.ts`; `src/lib/ai/provider.server.ts:216`; DI `src/infrastructure/di/index.ts:45` | `docs/CURRENT_STATE.md` "AI Findings"; AI_ARCHITECTURE.md is HISTORICAL header but gateway exists |
| Institution / membership | — | NOT IMPLEMENTED (no institution code in `src/`; only classroom room-membership) | `src/application/services/room-access.ts:2`; `check-access.ts:26` | INST-DEC-1 accepted as design; no schema |
| Whiteboard as evidence | `whiteboards`, `whiteboard_snapshots`, `whiteboard_mutations` tables | IMPLEMENTED/APPLIED (runtime PDF preservation UNKNOWN) | migration `20260812120000_*.sql:14-28` | Constitution §5/§12 requirements; runtime behavior `UNKNOWN — REQUIRES VERIFICATION` |
| Session records as evidence | `session_records` (verbatim, ownership RLS-verified) | IMPLEMENTED/VERIFIED (non-prod) | migration `20260601045818_*.sql:3`; AT-0002 session 5–6 | `ai_summary` writer absent in repo — UNKNOWN |
| Requirements | CR-001..CR-113, UN-001..UN-007, phase locks | CONFIRMED (requirements, NOT implementations) | `docs/CONFIRMED_REQUIREMENTS.md` | Phase locks: difficulty interaction P2, whiteboard assessment P3, AI gateway P5, institution portal P8 |

### 2.2 What must NOT be inferred from terminology

- "assessment", "quiz", "evidence", "mastery", "diagnosis" appear in prompts, type unions, and UI labels — none is a persisted learning artifact.
- `session_records` are session transcripts, not learning-state records.
- The existence of `subjects`/`tutor_courses` does not imply a topic graph or curriculum.
- The `LearningStage` union type is a domain seam, not an implemented pipeline.

---

## 3. CURRENT-STATE ASSESSMENT

The repository implements: identity/RBAC; entitlements; sessions and classroom; assignments (metadata + submissions, ungraded in practice); notes; simulations with a client-side quiz; whiteboard tables; a centralized AI gateway. It does NOT implement: topic/curriculum model, prerequisite graph, any assessment-instrument definition, any assessment attempt/result persistence, mastery, learning decisions, affective reports, or institutions.

Roadmap position (from `docs/MASTER_PLAN.md` §3 and `docs/CURRENT_STATE.md` "Roadmap Position"): learning backbone (Phase 4), assessment & outcomes (Phase 5), mastery & progression (Phase 6) are essentially absent; identity/auth (2–3) largely present; AI gateway (7) partially present; commerce (8) partial. This design targets the Phase 4–6 learning backbone as a **bounded**, accepted-direction model (INST-DEC-5), to be implemented only through separately authorized work items.

---

## 4. DOMAIN TERMINOLOGY

Precise product-level definitions. **Design rule: one node type — `topic`.** Concept and skill are *kinds* (classifications) of topic, not separate entity types. A richer ontology is not justified at this stage and would be harder for learners, tutors, instructors, institutions, and reviewers to reason about.

| Term | Definition |
|---|---|
| **Topic** | The smallest addressable unit of study a learner can engage and be assessed on within a subject. The single node of the prerequisite graph. Carries a `kind` and one or more learning outcomes. Example: "Solving linear equations in one variable". A topic is NOT a `subjects` row (subject = coarse catalog level) and NOT a `tutor_courses` row (course = tutor-offered bundle). |
| **Skill** | A topic whose `kind = skill` — a procedure/capability the learner must *demonstrate doing* (e.g., balancing equations, drawing a graph). Same node type; the assessment expectations differ from knowledge topics. |
| **Concept** | A topic whose `kind = concept` — declarative understanding (e.g., "what a slope of a line means"). |
| **Learning objective / outcome** | A plain-language statement of what the learner should be able to do after engaging the topic. Every topic has ≥1 outcome; outcomes bound what the assessment instrument may claim to measure. |
| **Prerequisite** | A directed relationship between topics: to learn topic **A**, the learner should demonstrate **B** first. Modeled as a directed edge **A → requires → B** in the prerequisite graph. A prerequisite is always a topic. |
| **Learner assessment** | A bounded interaction that produces machine-readable evidence about whether the learner demonstrates some topic capability targeted by the instrument. Two target types: `prerequisite` (targets a prerequisite topic, at topic-entry) and `topic` (targets the topic itself). Each instance also has a lifecycle `purpose` (§7). |
| **Diagnostic assessment** | An assessment used to establish the learner's current state *before* instruction: a prerequisite assessment at topic entry, or an initial topic diagnostic. |
| **Topic assessment** | An assessment targeting the topic itself, used across its lifecycle (diagnostic → formative → mastery → post-intervention). |
| **Affective learning report** | The learner's own self-report of learning-state signals (confidence, confusion, perceived difficulty, frustration) about a topic, plus optional free text. Explicitly **not** a clinical instrument (§8). |
| **Intervention** | An educational action, chosen from a catalog, intended to move the learner toward the topic's outcome, recorded and linked to the learning decision that selected it. Never a clinical prescription. |
| **Evidence** | Any recorded artifact or attributed observation that supports a mastery/learning characterization of the learner (assessment responses, explanations, submitted work, tutor/instructor observations, whiteboard PDFs, session records, simulation/lab outputs). Evidence supports but never equals mastery. |
| **Mastery** | A point-in-time characterization that the learner has *demonstrated* a topic's outcome(s), supported by ≥1 (typically ≥2) pieces of evidence through an assessment, person, or combination. Revisable downward and upward; subject to a re-verification window (INST-DEC-6). Evaluated qualitatively — `demonstrated` / `not demonstrated` / `uncertain` — never a bare percentage. |
| **Mastery snapshot** | The record of a mastery evaluation at a point in time (the result of a mastery evaluation), enabling "when was this demonstrated" and validity-window decisions. |
| **Learning decision** | An explicit, recorded choice about the next learning step, carrying actor, kind (recommendation vs confirmed vs override), and rationale (§13). |

---

## 5. LEARNING ARCHITECTURE

The canonical loop: **Diagnosis → Intervention → Evidence → Mastery → Decision** (matches `src/domain/ports/learning.ts:7` seam and INST-DEC-5).

Pipe (conceptual stages, each with inputs→outputs):

1. **Diagnosis** — combine prerequisite evidence + affective signal + prior mastery into a diagnosis state (§9).
2. **Intervention** — select from the intervention catalog based on diagnosis (§10); learner/tutor/instructor confirms (§10, §14).
3. **Evidence** — capture artifacts as the learner works (§11).
4. **Mastery** — evaluate demonstrated capability from evidence via topic-assessment purpose=mastery (§7, §12).
5. **Decision** — record the next step (§13); loop back to diagnosis for the next topic entry.

Architectural posture: the accepted target model (`topic_prerequisites`, typed `learner_assessments` [prerequisite|topic], `learner_affective_reports`, `mastery_snapshots`, `learning_decisions`) is preserved unchanged. This spike adds the *product semantics* those entities must carry; it does not revise the accepted design.

---

## 6. PREREQUISITE GRAPH

**Q&A (all decisions are PROPOSED until product acceptance):**

| Question | Recommendation | Rationale |
|---|---|---|
| Is a prerequisite a topic, skill, concept, or objective? | A **topic** (node). Edges connect topics, not objective statements. | Single node type keeps the graph simple and testable (§4). |
| Can one topic have multiple prerequisites? | Yes — conjunctive by default (A requires B and C). | Standard curriculum reality. |
| Can prerequisites have prerequisites? | Yes — transitively, but the platform **assesses only the direct required prerequisites** of the target topic. | Limits assessment load; transitive chain is enforced by the cycle validator, not by assessment. |
| Mandatory, recommended, or confidence-weighted? | Edge `kind ∈ {required, recommended}`. No confidence weights. | Required = gate (assess unproven, then remediate); recommended = advisory, never blocks. Weighting is statistical machinery — deferred (INST-DEC-4 family). |
| Can instructors/tutors override an inferred prerequisite? | Yes — logged override per scope (catalog default; institution/tutor override), audited. | Mirrors INST-DEC-1/D-0004 and Constitution §9.2 (tutor authority). |
| Can different curricula define different relationships? | Yes — edges carry a `scope` (catalog default vs institution context). | Institutions need their own curriculum (INST-DEC-1), without breaking the M:N model. |
| Contradictory definitions? | Deterministic precedence: catalog default `<` institution override; a conflict between two **catalog-level** definitions is rejected at write time until reconciled; overrides log supersede/precedence. | No silent last-writer-wins on curriculum. |
| Cycles? | Write-time DAG validation (a new edge that would close a cycle is rejected by a validator); only direct prereqs are assessed. | Cycles make "requires" meaningless and would break remediation. |
| Direction? | Edge direction is **A → requires → B**: "learning A requires having demonstrated B". Traversal used: "which direct topics must be checked before A" (in-edges) and "which topics does B unblock" (out-edges). | Precisely the new-topic journey (§7.4 in design / this §6's semantics). |
| Strength/type? | `kind` (required/recommended) + outcome-reference + optional rationale text. No numeric strength. | Numeric strength = unjustified machinery now. |
| Versioning when curriculum changes? | Edges have an effective window (valid-period) + supersession rule; versioning of the topic node itself deferred (INST-DEC-3). | Minimum contract to survive curriculum edits without rewriting history. |

**Graph model (PROPOSED):** directed acyclic graph, nodes = topics, edges = `required`/`recommended` prerequisites with scope and effective window. Topic A →requires→ Topic B means: *the platform must verify B's demonstrated capability before treating A as actionable for the learner*.

**Minimum semantic contract for the engineering spike:** (1) topics with stable identity + kind + outcomes; (2) directed edges {from, to, kind, scope, effective window}; (3) DAG invariant enforced at write time; (4) assessment policy "assess only unproven required direct prerequisites"; (5) override precedence rule. No columns are specified here (that is the engineering spike's job).

---

## 7. ASSESSMENT MODEL

### 7.1 Two target types × one lifecycle

The accepted model has typed assessments `prerequisite | topic`. These are **target types** (what is being assessed). Separately, each assessment instance has a lifecycle **purpose**:

- **Diagnostic** — before instruction (whether the learner can start/enter).
- **Formative** — during learning (is the intervention working?).
- **Mastery** — verification of demonstrated outcome(s).
- **Post-intervention** — re-verification after remediation.

**Recommendation:** one `learner_assessments` concept with these two orthogonal dimensions (target × purpose). Do **not** model formative/mastery/diagnostic as separate assessment types — they are states of one concept. Rationale: items, instruments, and persistence are shared; separating them would multiply RLS, wiring, and UI without clarifying the learner's story.

### 7.2 Instrument design (proposed item categories)

| Category | What it measures | Why it matters | Evidence generated | Prerequisite-appropriate | Topic-appropriate | Automated evaluation | Human evaluation |
|---|---|---|---|---|---|---|---|
| Recall | Fact retrieval | Quick screen only | Low-value answer | Marginal (screen only) | Weak (not mastery) | Yes | No |
| Recognition | Selection among options (MCQ) | Cheap sampling; guessing-prone | Answer choice | Yes (as a *component*, never alone) | Yes (as a *component*) | Yes | No |
| Conceptual understanding | Whether the learner can explain/justify the idea | Distinguishes knowing-from vs understanding | Explanation + choice | **Yes (core)** | **Yes (core)** | Partial (Zod-validated structure; rubric review) | Yes (for claims) |
| Application | Whether they can use the idea in a new case | Predicts transfer | Worked solution / result | Yes (core) | Yes (core) | Partial | Yes (open items) |
| Problem solving | Multi-step reasoning | Strong mastery signal | Full process trace | Recommended | **Yes (mastery purpose)** | No (structure only) | Yes |
| Misconception detection | The *specific wrong model* behind an error | Separates "gap" from "wrong model"; drives remediation choice | Error-pattern + explanation | **Yes (critical)** | Yes | Partial (flagging) | Yes |
| Confidence / self-report | Learner's felt state about the item/topic | Feeds affine diagnosis; not a mastery determiner | Self-report value | Auxiliary | Auxiliary | Yes | No |
| Explanation | Free-text reasoning | Rich, hard-to-fake evidence | Text | Yes | **Yes (mastery purpose)** | No (draft only) | Yes |
| Practical / performance evidence | Doing (labs, performance) | Highest-fidelity demonstration | Artifact (lab output, PDF) | LATER (when labs land) | LATER | No | Yes (artifact review) |
| Tutor/instructor observation | Professional judgment of demonstration | Human authority (§9.2, §14) | Observation record | Yes (conflict resolution) | Yes (mastery input) | N/A | Yes |

**Proposed core sets (MVP):** prerequisite instrument ≈ conceptual-understanding + application + misconception-detection + confidence self-report. Topic (mastery) instrument ≈ conceptual + application + problem solving + explanation (+ confidence). Recall/recognition are permittable *components* but never sufficient alone. Practical/performance and full problem-solving weight are pushed to LATER.

### 7.3 Result semantics (shared, qualitative)

Assessment produces a **result state** per target (not a percentage): `demonstrated`, `not demonstrated`, `uncertain`, `misconception suspected`, `insufficient evidence` — plus `skipped` (valid mastery already available). See §12 for how these feed mastery.

---

## 8. AFFECTIVE-LEARNING MODEL

### 8.1 Product signal set

The Constitution's "Learner Fear" (`docs/PRODUCT_CONSTITUTION.md` §3; CR-002) has **no scientifically validated meaning in the product** (constraint 8). Recommend operating on a bounded, learning-oriented signal set that maps to what a learner can actually tell us:

- **Confidence** ("I feel confident / unsure I understand this topic")
- **Confusion** ("how confusing does this topic feel?")
- **Perceived difficulty**
- **Frustration** (optional fourth)

Scored as a small learner-facing ordinal (e.g., 3 points, low/medium/high), plus an optional free-text field — *"What feels confusing or worrying? (in your own words)"* — which preserves CR-002's "Learner Claim" and lets the learner use the word "fear" themselves without the platform scoring it.

**The word "fear" is retained only as learner-supplied language, never as a platform scale or diagnosis.**

### 8.2 Boundary

- **learning-state signal ≠ clinical psychological diagnosis.** The report never outputs a diagnostic label; it feeds diagnosis only as one contextual input (§9).
- **Who submits:** the learner (primary, sole row-level writer). Tutor/instructor may submit *observations* — separate, attributed evidence — never merged into the learner's self-report (§14).
- **AI may NOT infer the signal.** AI may *ask* the learner (§3.1: probe/clarify) and record only what the learner confirms. An unconfirmed AI inference is a coach artifact, not a report row (MASTER_PLAN §2: AI OUTPUT != EVIDENCE).
- **Learner visibility/correction:** the learner can see and correct their own report (bounded edit window; history preserved).
- **Access:** learner = full; tutor = consent-gated prepared-report content only (Constitution §9.1, CR-062/063); institution staff = **aggregates only, never individual reports**; platform admin = audit, consent-gated.
- **Retention/privacy:** fail-closed; explicit retention policy is **UNKNOWN — REQUIRES VERIFICATION** (legal — GDPR/CCPA/SACU provenance, `docs/DECISION_LOG.md` D-0002 → ATD-0005). Sponsorship by an institution never weakens these controls (constraint/§15).
- **Decision influence:** yes, the signal is one input into diagnosis (§9) — but never necessary for topic-begin decisions in the self-directed path, and never the sole driver.

---

## 9. DIAGNOSIS

Diagnosis is a structured combination of prerequisite evidence + affective signal (+ prior mastery), producing an **educational** recommendation, never a clinical one.

| Scenario | Prerequisite evidence | Affective signal | Diagnosis (PROPOSED) | Likely learning response |
|---|---|---|---|---|
| A | Low | Low fear/confusion (confident, not confused) | `remediate-prerequisite` | Prerequisite remediation: review + practice + formative assessment before the topic; treat as a knowledge gap, not a fear problem |
| B | High | High fear/confusion | `affective-support` | Do **not** force mastery. Confidence-building: tutor support, scaffolding, smaller steps, Chat via coach, then diagnostic-begin; learner stays in control |
| C | Low | High fear/confusion | `remediate-and-support` | Staged remediation that also lowers pressure (worked examples, tutor check-in). Address affective dimension alongside the gap; never "just push content" |
| D | High | Low fear/confusion | `ready` | Proceed to initial topic diagnostic/instruction; standard path |
| — | Conflicting / ambiguous | any | `insufficient-evidence` | Reassess (per §7.3) or escalate to tutor |
| — | Repeated assessment failure | any | `escalate-to-tutor` | Human involvement; learner/tutor decides |

Purpose of the table: to prevent the system from treating every poor learning outcome as "does not know the prerequisite" (Phase 9 objective). Interventions remain educational (§10).

---

## 10. INTERVENTION MODEL

Interventions are educational actions from a **catalog**, recorded and linked to the decision that selected them:

prerequisite remediation · worked example · simpler explanation · alternate explanation · guided practice · additional practice · tutor intervention · instructor intervention · confidence-building activity · misconception correction · prerequisite review.

**Selection boundary (PROPOSED):** system/AI recommend (option suggestions only); the **learner** selects in the self-directed path; the **tutor/instructor** selects/recommends within their scope (§14). Nothing auto-administers an unchosen intervention. AI recommendations are **human-confirmed before being recorded as the intervention** (Constraint 16; CR-031). Interventions are catalogued (not free-form AI prescriptions) so they remain auditable and educationally bounded.

---

## 11. EVIDENCE

What counts as evidence (map to existing repo + proposed kinds):

| Evidence kind | Exists today? | Status |
|---|---|---|
| Assessment responses | No (client quiz is ephemeral) | PROPOSED (new) |
| Explanations | No | PROPOSED |
| Completed exercises / submitted work | Partial (`assignments`/`assignment_submissions`, ungraded in practice) | EXISTS (weak) |
| Tutor observations | No | PROPOSED |
| Instructor observations | No | PROPOSED |
| Session activity/records | Yes (`session_records`, RLS-verified) | EXISTS (transcript, not learning-state) |
| Simulation results | Partial (client-side quiz; `simulations` row) | EXISTS (weak) |
| Whiteboard / PDF | Tables exist; runtime PDF preservation UNKNOWN | APPLIED-DESIGN |
| AI interactions | `session_records.ai_summary` writer absent in repo | UNKNOWN — REQUIRES VERIFICATION |

**Evidence ↔ mastery:** evidence *supports* a mastery evaluation; mastery is a judgment over evidence, made by an assessment result, tutor/instructor observation, or both. **Evidence is not automatically mastery** (Constitution §12; CR-096) and **AI output is not evidence** (MASTER_PLAN §2). An evidence artifact becomes a mastery input only inside the defined mastery workflow (§12).

---

## 12. MASTERY

- **Scope:** mastery is **topic-specific** (per mastered topic). A "skill" is mastered by mastering the topic whose kind=skill — no separate mastery kind.
- **Evaluation outcome (not a percentage):** `demonstrated` / `not demonstrated` / `uncertain`. The existing architecture does not support percentage-as-mastery (client quiz percentages are explicitly rejected as evidence), so mastery is never a bare score.
- **Evidence sufficiency:** typically **≥2 evidence points** (e.g., a mastery-purpose assessment result + an explanation, or an assessment + tutor observation). One item is insufficient (Phase 6).
- **Decay:** yes — mastery is a point-in-time judgment with a **re-verification validity window** (policy open: INST-DEC-6; PROPOSED default = finite window, extendable by fresh evidence).
- **Revision:** yes — new evidence revises mastery up or down; revisions are recorded (snapshot history), never silently overwritten.
- **Conflict:** conflicting evidence → `uncertain` or tutor adjudication (never resolved by averaging).
- **Users with authority:** tutor/instructor may adjust mastery with a recorded rationale (§14). AI may *recommend* a mastery evaluation but is **never the final authority** (CR-030/064/065).

---

## 13. LEARNING DECISIONS

Represented decision kinds (PROPOSED): proceed-to-topic · remediate-prerequisite · retry-assessment · change-intervention · request-tutor-support · request-instructor-support · reassess · mark-topic-mastered · continue-practice · defer-topic.

**Model (one record, three natures):** a learning decision is recorded with an **actor** (system-rule | ai-recommendation | learner | tutor | instructor) and a **kind**:
- `recommendation` — an unconfirmed suggestion (AI or rule). Never changes the path by itself.
- `confirmation` — an actor accepts a recommendation (path change takes effect).
- `override` — an actor deliberately overrides a recommendation/decision (recorded, auditable; Constitution §9.2).

**Autonomy boundary (safest & most useful):** automated (rule/AI) decisions may only *recommend*; path-changing and mastery-changing decisions require learner confirmation (self-directed) or tutor/instructor confirmation (tutor/institution paths). Only safe operational defaults (e.g., "schedule prerequisite review", "retry assessment") may auto-apply, subject to learner override.

---

## 14. TUTOR / INSTRUCTOR AUTHORITY

**Academic authority** (what a person may legitimately do educationally) is separate from **platform authorization role** (what their account/RBAC allows). Tutor ≠ instructor.

| Action | Tutor | Instructor (institution context) | Notes |
|---|---|---|---|
| Create/edit prerequisite relationships | Catalog-level proposals only | Institution-scope override (audited) | Overrides never silently change catalog defaults (§6) |
| Confirm/override prerequisites | Yes (§9.2) | Yes (institution scope) | Logged |
| Create assessments | Author within a topic (catalog review) | Institution policy + catalog review | Instruments are catalogued, versioned (INST-DEC-9) |
| Review assessment evidence | Within active session/consent scope | Cohort scope | Consent-gated |
| Provide interventions | Yes (select/recommend) | Yes (policy + select) | Educational catalog only |
| Override a learning decision | Yes (recorded) | Yes (recorded) | `override` nature (§13) |
| Record observations | Yes (attributed; never merged into learner self-report) | Yes (cohort) | Visible as observation, distinct from self-report |
| Review affective reports | Consent-gated prepared-report only | Never individual; aggregates only | §8 privacy invariant |
| Influence mastery | Yes (recorded rationale) | Yes (cohort; recorded) | AI never final (§12) |

---

## 15. INSTITUTIONAL BOUNDARY

Preserves the single-account principle (D-0004): institution affiliation = membership, not a new identity; no "institutional learner account"; a former private-tutoring learner uses the same account.

| Actor / dimension | May do / see |
|---|---|
| Institution (admin) | Configure: institution-scope prerequisite overrides, instrument policy, cohorts/terms, link-based session distribution (§11 flow). See: **aggregate** metrics, anonymized evidence/PDF outputs via link flow; **never individual affective reports**; mastery only at aggregate level with small-cell suppression |
| Instructor | Cohort/term-scope: member lists, cohort diagnostics, assessment policy within institution, aggregate cohort metrics, recorded observations |
| Tutor | Session-scope: preparation report (§9.1), session evidence, intervention selection, recorded observations, mastery input (consent-gated) |
| Learner | Full control of their own data, affective report, sharing choices, learning path (self-directed) |
| Platform admin | Legitimate ops/safety/compliance access, audit (Constitution §10; CR-076) |

Invariant: institutional participation automatically exposes **nothing** that is learner-private; aggregates only, and never cell-level affective/evidence data without consent. **Do not weaken privacy because an institution sponsors the learner.**

---

## 16. AI BOUNDARY

All AI stays behind the existing centralized `AiGateway` → adapter → `provider.server` gateway (`src/application/contracts/ai.ts:57`; `src/infrastructure/di/index.ts:45`). No provider-specific integration is designed here; no direct provider call is added.

| AI role | Allowed | Constraint |
|---|---|---|
| Question generation | Yes (proposal only) | Instrument content must be catalog-reviewed before reuse (CR-033) |
| Misconception detection | Yes — as a hypothesis that triggers a probe | Never recorded as fact without learner confirmation (§3.1) |
| Assessment interpretation | Draft only | Human/tutor confirm; AI ≠ authoritative record |
| Prerequisite recommendations | Yes (proposal) | Catalog default + human override |
| Intervention recommendations | Yes (options) | Learner/tutor confirm before recording (§10) |
| Feedback generation | Yes (coach) | Labeled as AI; tutor-chat Socratic rules preserved (`tutor-chat.ts:23-45`) |
| Mastery recommendation | Yes (proposal) | Never final authority (§12) |
| Learning-decision recommendation | Yes | Only `recommendation` nature; confirmation required (§13) |

Hard rule, repeated from constraint: **an AI recommendation never silently becomes an authoritative educational record** (CR-031; MASTER_PLAN §2).

---

## 17. MVP LEARNING MODEL (smallest coherent first implementation)

### MUST HAVE
- Topics (stable identity, kind, outcomes) + `topic_prerequisites` graph with required/recommended edges, scope, cycle-DAG validation, effective-window.
- Prerequisite assessment at topic entry with the qualitative outcome vocabulary (§6, §7.3) — server-evaluated, persisted.
- Topic assessment lifecycle (diagnostic → formative → mastery → post-intervention) as one typed concept (§7.1).
- Mastery evaluation semantics (§12) + snapshot persistence + validity window (finite default).
- Learning-decision record (actor/nature/kind) with the autonomy boundary (§13).
- Affective self-report (signal set §8) — learner-only write, learner-visible/correctable, consent-gated share, aggregate-only to institutions.
- Diagnosis combination (§9) using prerequisite + affective evidence for the four scenarios.
- Evidence typing with the invariant "evidence ≠ mastery, AI output ≠ evidence".

### SHOULD HAVE (next iteration)
- Tutor/instructor observations as attributed evidence.
- Intervention catalog + selection/confirmation flow.
- Institution-scope prerequisite overrides and cohort scoping.
- Aggregate institutional reporting with small-cell suppression (INST-DEC-8).

### LATER
- Practical/performance assessment from labs; explanation auto-scoring; adaptive item selection; disjunctive ("any-of") prerequisite groups; forgetting/decay curves; full curriculum versioning history; cross-institution curriculum sharing; rubric authoring UI.

---

## 18. INST-DEC-2..10 DECISION MAPPING

Every row below remains **PROPOSED / PENDING** — repository evidence (`docs/architecture/INSTITUTIONAL_LEARNER_DESIGN.md` §14; `docs/DECISION_LOG.md` D-0004/D-0005 scope lines) does not mark any of these accepted. Nothing here changes that.

| ID | Question | Status | Evidence | Options considered | Recommendation | Rationale | Dependencies | Product-owner acceptance required? |
|---|---|---|---|---|---|---|---|---|
| INST-DEC-2 | Reuse `app_role` as membership context? | PROPOSED / PENDING | design §14; D-0004 | reuse vs separate context role | **Separate `institution_memberships.context_role`** | Same person can be tutor+admin+learner across contexts; reuse conflates identity and affiliation (§4, §15) | INST-DEC-1 | Yes |
| INST-DEC-3 | Topic identity & versioning | PROPOSED / PENDING | design §14 | stable rows vs content-versioned nodes | Stable topic identity; **content/instrument versioning deferred** | Stable graph keys make prereq edges meaningful (§6) | none | Yes |
| INST-DEC-4 | Prerequisite storage | PROPOSED / PENDING | design §14 | relational edges vs jsonb | **Relational edges (DAG)** with DAG validation | JSON inside one row cannot be validated or scoped per-edge (§6) | INST-DEC-3 | No (engineering) |
| INST-DEC-5 | Bounded learning/assessment target model | **ACCEPTED** (D-0005) | DECISION_LOG D-0005 | (accepted) | — | — | — | Already accepted |
| INST-DEC-6 | Mastery validity window / expiry | PROPOSED / PENDING | design §14; this §12 | finite window vs indefinite vs decay-model | **Finite window; fresh evidence extends; decay-curve later** | Balances re-verification with not re-testing everything (§12) | product research | **Yes** |
| INST-DEC-7 | Affective consent + retention | PROPOSED / PENDING | design §14; this §8 | open retention vs fail-closed + legal review | **Fail-closed retention; legal review before any institution-facing use** | Child data, GDPR/CCPA/SACU (§8) | legal | **Yes** |
| INST-DEC-8 | Aggregate reporting + small-cell suppression | PROPOSED / PENDING | design §14; this §15 | raw cell access vs aggregate-only | **Aggregate-only RPCs + small-cell suppression** | Prevent deanonymization (§9 design) | INST-DEC-2, 7 | **Yes** |
| INST-DEC-9 | Instrument authoring authority | PROPOSED / PENDING | design §14; this §7, §14 | any-user vs catalog+review | **Catalog + authorized institution contexts, reviewed/versioned** | CR-033 approval rules; comparability (§7) | INST-DEC-3, 5 | **Yes** |
| INST-DEC-10 | Migration phasing/order | PROPOSED / PENDING | design §16 | phases 1–5 in any order | Phases in design §16 order | topics/prereqs first (foundation), institutions after, affective last | INST-DEC-3–9 | No (engineering) |

---

## 19. ENGINEERING CONTRACT (conceptual — NOT SQL)

Domain-level contract the engineering spike can implement without re-deriving semantics:

**Topic** — stable id; name; subject reference; `kind` (concept|skill); one or more outcome statements; status. No free-text-only identity.

**Prerequisite** — directed edge (from=target topic, to=prereq topic); `kind` required|recommended; scope (catalog default | institution override); effective window; supersedes-note on conflict; **invariant: graph is acyclic (write-time validation)**; policy: assess only unproven *required* direct prereqs; recommended edges never block.

**Assessment** — typed by target (prerequisite|topic) and lifecycle purpose (diagnostic|formative|mastery|post-intervention); constructed from a catalogued, versioned instrument; evaluated server-side into a closed outcome vocabulary (`demonstrated|not demonstrated|uncertain|misconception suspected|insufficient evidence|skipped`); client-side scoring is never accepted as an assessment.

**Affective report** — learner-authored self-report; signal set {confidence, confusion, perceived difficulty, frustration} + optional free text; learner-visible/correctable; consent-gated; institution access = aggregates only; no inference-to-record by AI; not a clinical instrument.

**Intervention** — catalogued educational action; selected with confirmation from learner/tutor/instructor; linked to the learning decision; no free-form clinical prescription.

**Evidence** — typed, attributed artifact/observation; invariants: evidence ≠ mastery; AI output ≠ evidence; unconfirmed AI interpretation is a coach artifact.

**Mastery** — topic-scoped characterization (`demonstrated|not demonstrated|uncertain`); ≥2 evidence points typical; finite re-verification window (default); revisable up/down with recorded snapshot history; never a bare percentage; AI recommends, tutor/instructor/learner confirm; conflicting evidence → uncertain or tutor adjudication.

**Learning decision** — recorded choice with actor (system-rule|ai-recommendation|learner|tutor|instructor) and nature (recommendation|confirmation|override); path- and mastery-changing decisions require human confirmation; automated only for safe defaults.

**Actor responsibilities** — learner (self-report, selection, control); tutor (session teaching, observation, confirmation, mastery input); instructor (institution curriculum/cohort, policy); institution staff/admin (aggregates, links); platform admin (ops/audit).

**Privacy boundaries** — learner-private affective; aggregate-only institutional views; small-cell suppression; consent gates; single-account identity everywhere.

**AI boundaries** — all model calls via `AiGateway`; recommendation ≠ record; human confirmation invariant.

**Validation requirements** — DAG cycle check; closed outcome vocabulary; evidence sufficiency; consent checks; actor/nature required on decisions; outcome windows enforced; no client-supplied institution authorization.

---

## 20. RISKS / GAPS / UNKNOWNS

### 20.1 Contradictions & terminology conflicts (identified, not silently resolved)

| Item | Location | Nature |
|---|---|---|
| Constitution §11 link-learners have no account ⇔ account-linked mastery/personalization in this design | `docs/PRODUCT_CONSTITUTION.md` §11; this §6/§15 | Accepted coexistence (INST-DEC-1/D-0004), but link-learners cannot receive account-linked mastery — documented limitation, not resolved further here |
| `subjects`/`tutor_courses` vs new `topic` | migrations; this §4 | Terminology collision risk — "topic" must not be confused with subject/course rows; spike must map rather than reuse |
| Client-side quiz (%) rejected as mastery while "assessment" is a UI concept today | `labs_.simulation-lab.tsx`; this §7.3/§12 | Existing behavior is not evidence; design must not extend it |
| `LearningStage` union vs new pipeline | `learning.ts:7`; this §5 | Aligned by intent; wiring is separate authorized work |
| Historical `DATA_ARCHITECTURE.md` (LearnerConcern/Intervention/MasteryRecord(topic_id)) vs current target | `docs/architecture/DATA_ARCHITECTURE.md:43,59` | HISTORICAL only; not re-accepted |
| MASTER_PLAN §1 "Assessment = PROPOSED/UNACCEPTED" vs D-0005 bounded acceptance | `docs/MASTER_PLAN.md:40-42` | MASTER_PLAN predates D-0005; bounded scope accepted, remainder still NOT ACCEPTED — flagged, not edited |

### 20.2 Missing decisions / must-not-promote assumptions

- Instrument **content** (item banks, rubrics, difficulty calibration) = **UNKNOWN — REQUIRES VERIFICATION** (product/learning design).
- Affective instrument/frequency/retention + consent legal posture = **UNKNOWN — REQUIRES VERIFICATION**.
- Mastery window duration = **UNKNOWN** (INST-DEC-6).
- "Fear" is not a validated product construct — do not promote it as a scale (constraint 8).
- Do not promote percentage mastery, statistical weights, or decay curves before acceptance.
- ASSUMED (needs confirmation before engineering): topic-outcome statements are the unit of assessment claims.

### 20.3 Risks

- **Privacy/legal (HIGH):** affective data use without a validated instrument + retention policy risks regulatory exposure; mitigations: fail-closed, aggregate-only, consent gates.
- **Authorization (MEDIUM):** new RLS/aggregate surfaces must reuse the SECURITY-DEFINER helper pattern (design §9); no client `institution_id` authorization.
- **AI risk (MEDIUM):** unconfirmed AI interpretation becoming evidence; mitigated by the recommendation≠record invariant (§16).
- **Institutional reporting risk (MEDIUM):** small-cell deanonymization; mitigated by suppression (INST-DEC-8).
- **Scope creep (MEDIUM):** turning MVP into an LMS; §17 bounds it.
- **Implementation dependency (MEDIUM):** AT-0002 residual grant gaps (`profiles`/`user_roles`, ~18 empty-relacl tables) block new-table REST integration until separately remediated (`docs/BACKLOG.md`).
- **Efficacy overclaim (LOW):** mastery = demonstrated capability; no claims before live verification.
- **UNKNOWN writer risk:** `session_records.ai_summary` writer absent in repo → AI-output-as-evidence unverified.

---

## 21. RECOMMENDED NEXT ACTION

1. **Product/learning design session (before engineering):** accept the §4 vocabulary, §7.2 core item sets, §8 signal set, §9 scenario mapping, §12 mastery semantics, §13 decision autonomy boundary; then commission instrument-content design (satisfies the UNKNOWN instrument content).
2. **Resolve/confirm INST-DEC-6, 7, 8, 9** (product/legal acceptances required per §18), and UN-007 (assessment/mastery architecture details).
3. **Legal review** of affective consent/retention before any institution-facing affective use.
4. **Then authorize the Phase-1 engineering spike** (`topics` + `topic_prerequisites` + DAG validator) using §19 as the semantic contract. The spike remains a separate, explicitly authorized work item.

---

*Verdict: READY WITH PRODUCT DECISIONS REQUIRED (see §21 acceptance list). This document is a proposal; it changes nothing in the implemented system.*