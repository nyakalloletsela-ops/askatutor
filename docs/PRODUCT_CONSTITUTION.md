# ASKATUTORLIVE — PRODUCT CONSTITUTION

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. PURPOSE

AskATutorLive is a learning platform whose central purpose is to help learners understand what they actually struggle with and then provide targeted assistance through AI, tutors, interactive learning experiences, simulations, virtual laboratories, and evidence of learning.

---

## 2. CENTRAL LEARNING PRINCIPLE

```
UNDERSTAND THE LEARNER'S ACTUAL DIFFICULTY
  → IDENTIFY THE SPECIFIC CONFUSION
  → INTERVENE
  → PRACTICE / EXPERIMENT / EXPLAIN
  → OBSERVE WHAT HAPPENS
  → VERIFY UNDERSTANDING
  → ASK THE LEARNER WHETHER THE FEAR/CONFUSION WAS RESOLVED
  → PRESERVE THE LEARNING EVIDENCE
```

---

## 3. LEARNER DIFFICULTY MODEL

The system must distinguish:

- LEARNER FEAR (emotional/affective state)
- LEARNER CLAIM (what the learner says is wrong)
- IDENTIFIED DIFFICULTY (actual root confusion after probing)
- INTERVENTION (what was done to help)
- LEARNING EVIDENCE (artifacts produced)
- MASTERY (demonstrated capability)

A learner's initial statement must NOT be treated as the complete problem description. AI must probe, clarify, and guide the learner to identify what feels difficult.

### 3.1 AI Interpretation Boundary

AI must NOT independently invent an interpretation and declare "Your problem is X." The learner's own response is the primary starting evidence.

AI should:
- Ask
- Probe
- Clarify
- Guide
- Break the problem down
- Let the learner identify what feels difficult
- Confirm understanding

### 3.2 Final Evidence

The final evidence must include whether the learner reports that the fear/confusion was:
- Resolved
- Reduced
- Unchanged
- Increased
- Uncertain

The platform must preserve the journey from initial concern through intervention to final reflection.

---

## 4. MANDATORY INITIAL LEARNING ASSESSMENT

The learner-difficulty/fear interaction is **mandatory for the first three lessons**.

After the first three lessons, the learner may choose to use this process:
- For every topic
- Every lesson
- Whenever needed
- Or not use it for every lesson

### 4.1 Interaction Must Not Feel Like an Exam

The presentation must be:
- Conversational
- Interactive
- Psychologically comfortable
- Non-threatening
- Exploratory
- Learner-controlled

The purpose is: "Tell us what is confusing or worrying you so we can help."

---

## 5. WHITEBOARD REQUIREMENT

The whiteboard is a core learning surface.

Learners **MUST** use the whiteboard for writing their assessments.

The architecture must treat the whiteboard as a first-class learning interaction, not merely an optional visual widget.

Whiteboard interactions must:
- Support preservation as evidence
- Be saved as PDF
- Integrate with tutor sessions, AI assistance, simulations, virtual labs, notes, and classroom/session records

---

## 6. AI PRINCIPLES

AI is an assistant and guide.

AI does NOT independently decide what the learner understands or does not understand.

AI may:
- Ask questions
- Probe
- Clarify
- Guide
- Explain
- Generate learning scenarios
- Assist tutors
- Analyze learner responses
- Suggest interventions
- Create virtual laboratories
- Help organize evidence

AI must not silently convert an assumption into established learner evidence.

AI-generated interpretation must remain distinguishable from:
- Learner statements
- Tutor observations
- Verified learning evidence
- Approved instructional material

AI-generated learning content that becomes reusable platform content requires appropriate approval rules.

---

## 7. VIRTUAL LAB PRINCIPLES

AskATutorLive will use AI-generated virtual laboratories.

The AI Agent may create a virtual laboratory based on the learner's requested scenario.

The system must be capable of creating the scenario as imposed/requested by the learner within the platform's controlled laboratory architecture.

### 7.1 Storage and Reuse

The architecture must eventually support storing generated labs when the user agrees.

Saved labs may become reusable by:
- The same learner
- Other users
- Tutors
- Forums/community spaces

Subject to the platform's sharing and safety rules.

### 7.2 Subject Scope

The platform will initially focus on a deliberately limited set of STEM scenarios.

However, the architecture must support expansion. AskATutorLive is not STEM-only. Other subjects are part of the platform.

---

## 8. PHET / EXTERNAL SIMULATIONS

PhET and similar external simulations may be used from their official sources.

The platform must:
- Preserve appropriate source attribution
- Display required logos/branding where permitted
- Provide external links
- NOT pretend the external simulation is owned by AskATutorLive

### 8.1 Integration Constraints

External simulations must integrate conceptually with AskATutorLive classroom experiences.

Where technically and legally possible, the architecture should allow interaction with:
- Whiteboard
- Notes
- Classroom/session context
- Evidence
- Tutor assistance

Do not assume undocumented external APIs. If synchronization capabilities are not technically available, record the limitation rather than inventing integration.

---

## 9. TUTOR MODEL

A tutor is optional for the learner.

The platform should make tutor support easy to activate when the learner needs it.

### 9.1 Tutor Preparation Report

The learner's initial difficulty/fear interaction can produce a structured preparation report for the selected tutor.

The report may include:
- Learner's own description
- Specific areas they identified as confusing
- Questions asked during the interaction
- Learner responses
- AI guidance
- Relevant learning context
- Simulations/labs used
- Whiteboard evidence
- Unresolved concerns
- Learner's final reflection

### 9.2 Tutor Authority

The tutor may review this information and confirm or correct instructional interpretation. Tutor confirmation is authoritative over AI-generated interpretation where appropriate.

---

## 10. TRUST MODEL

Different participants have different visibility:

| Role | Visibility |
|------|-----------|
| LEARNER | Controls their learning journey, sees their own learning information, chooses tutor support, chooses whether generated labs are saved/shared |
| TUTOR | Sees information necessary to prepare and teach the learner, can review learner evidence, can confirm/correct AI interpretations |
| PARENT | May receive appropriate learner progress/support information, may support the learner, may facilitate payments; must not automatically receive unrestricted access |
| ADMIN | Must be able to access platform information when legitimately required for administration, safety, support, compliance or operations, subject to proper authorization and auditing |
| AI | Receives only information permitted by the relevant trust boundary; must not bypass authorization |

---

## 11. INSTITUTION MODEL

> **AMENDMENT NOTE (2026-09-10, `docs/DECISION_LOG.md` → D-0004):** Explicit human approval accepted that first-class institutional memberships (M:N `institution_memberships` with context roles) **coexist with** this §11 account-less link-based model — institutions may use either path. This section remains the normative baseline for link-based distribution; the coexistence design is recorded in `docs/architecture/INSTITUTIONAL_LEARNER_DESIGN.md` (INST-DEC-1). A formal rewrite of this section is deferred, and this note does **not** authorize any implementation.

Institutions are supported but are NOT the primary target market.

An institution may distribute a lesson/class/session link to learners.

Learners using an institution-provided link:
- Do NOT need individual AskATutorLive accounts for that institutional experience
- Are NOT anonymous — they are identified within the institution's controlled context
- Can participate in an assigned class/session

The institution can receive learning outputs such as:
- PDFs
- Whiteboard records
- Recordings where enabled
- Session evidence
- Relevant learning reports

---

## 12. RECORDING AND EVIDENCE

Whiteboard and other core learning interactions must be preserved appropriately.

| Type | Policy |
|------|--------|
| WHITEBOARD | Always saved as PDF |
| VOICE | Recorded when the tutor or learner needs it / when enabled |
| VIDEO | Recorded when needed / when enabled and supported by user's plan and technical limits |

### 12.1 Free Tier Constraints

The platform starts with a FREE tier. Architecture must account for:
- Storage limits
- Recording limits
- Retention
- Entitlement
- Resource usage
- Future paid plans

### 12.2 Evidence Types

Evidence may include:
- Learner responses
- Whiteboard
- Notes
- Simulations
- Virtual labs
- Tutor interactions
- AI interactions
- Voice
- Video
- Session records
- Final learner reflection

Evidence is not automatically mastery.

---

## 13. COMMUNITY

Learners must eventually be able to interact with other learners.

Community functionality includes:
- Forums
- Groups
- Learner discussions
- Sharing useful learning resources
- Sharing approved/safe saved labs

Community must have strong:
- Moderation
- Reporting
- Privacy
- Abuse prevention
- Access control
- Content ownership
- Safety controls

---

## 14. PAYMENTS / COMMERCE

Every meaningful user interaction should exist within an entitlement/account model because AskATutorLive is a paid platform.

The architecture must support:
- Free tier
- Paid plans
- Tutor services
- Institutional usage
- Subscriptions
- Payments
- Entitlements
- Usage limits
- Future commerce expansion

### 14.1 Financial Safety Rules

Payment architecture must be server-authoritative. Never trust client-supplied financial values.

Financial records require:
- Authorization
- Validation
- Idempotency
- Transaction safety
- Auditability
- Reconciliation

---

## 15. TECHNOLOGY DECISION

Implementation language: **TypeScript**

| Category | Decision |
|----------|----------|
| Language | TypeScript |
| Frontend | React |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | Node.js |
| Database | PostgreSQL / Supabase |
| 3D / Labs | Three.js (where required) |
| Testing | TBD — REQUIRES DECISION |
| Deployment | TBD — REQUIRES DECISION |

---

## 16. SCOPE BOUNDARIES

### IN SCOPE (Complete Platform)
- Learner difficulty identification and intervention
- Whiteboard as first-class surface
- AI-assisted learning guidance
- Tutor optional model with preparation reports
- Virtual laboratories (initially limited STEM)
- External simulation integration (PhET etc.)
- Community and forums
- Institution support
- Free tier and paid plans
- Evidence preservation
- Reporting

### OUT OF SCOPE (Phase 0)
- Application feature implementation
- Dashboard implementation
- AI feature implementation
- Lab implementation
- Whiteboard implementation
- Community implementation
- Commerce implementation
- Production deployment
