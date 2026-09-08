# ASKATUTORLIVE — CONFIRMED REQUIREMENTS

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. REQUIREMENT CLASSIFICATION

| Status | Meaning |
|--------|---------|
| CONFIRMED | Explicitly stated in Product Constitution |
| RECOMMENDED | Architectural recommendation awaiting decision |
| ASSUMED | Logical inference from confirmed requirements |
| UNKNOWN | Requires explicit decision before implementation |

---

## 2. CONFIRMED REQUIREMENTS

### 2.1 Core Learning

| ID | Requirement | Source | Phase |
|----|-------------|--------|-------|
| CR-001 | Platform must help learners identify actual difficulty, not accept initial statement as complete | Constitution §3 | 2 |
| CR-002 | System must distinguish: Learner Fear, Learner Claim, Identified Difficulty, Intervention, Learning Evidence, Mastery | Constitution §3 | 2 |
| CR-003 | AI must probe, clarify, and guide before declaring learner's problem | Constitution §3.1 | 5 |
| CR-004 | Learner's own response is primary starting evidence | Constitution §3.1 | 2 |
| CR-005 | Final evidence must capture whether fear/confusion was resolved, reduced, unchanged, increased, or uncertain | Constitution §3.2 | 3 |
| CR-006 | Platform must preserve journey from initial concern through intervention to final reflection | Constitution §3.2 | 3 |

### 2.2 Mandatory Initial Assessment

| ID | Requirement | Source | Phase |
|----|-------------|--------|-------|
| CR-010 | Learner-difficulty/fear interaction is mandatory for first three lessons | Constitution §4 | 2 |
| CR-011 | After first three lessons, learner may choose whether to use the process | Constitution §4 | 2 |
| CR-012 | Interaction must not feel like a conventional examination | Constitution §4.1 | 2 |
| CR-013 | Presentation must be conversational, interactive, psychologically comfortable, non-threatening, exploratory, learner-controlled | Constitution §4.1 | 2 |

### 2.3 Whiteboard

| ID | Requirement | Source | Phase |
|----|-------------|--------|-------|
| CR-020 | Whiteboard is a core learning surface | Constitution §5 | 3 |
| CR-021 | Learners MUST use whiteboard for writing assessments | Constitution §5 | 3 |
| CR-022 | Whiteboard interactions must support preservation as evidence | Constitution §5 | 3 |
| CR-023 | Whiteboard content must be saved as PDF | Constitution §5 | 3 |
| CR-024 | Whiteboard must integrate with tutor sessions, AI, simulations, labs, notes, records | Constitution §5 | 3 |

### 2.4 AI

| ID | Requirement | Source | Phase |
|----|-------------|--------|-------|
| CR-030 | AI is an assistant and guide, not an authority on learner understanding | Constitution §6 | 5 |
| CR-031 | AI must not silently convert assumptions into established learner evidence | Constitution §6 | 5 |
| CR-032 | AI-generated interpretation must remain distinguishable from learner statements, tutor observations, verified evidence, approved material | Constitution §6 | 5 |
| CR-033 | AI-generated content becoming reusable platform content requires approval rules | Constitution §6 | 5 |

### 2.5 Virtual Labs

| ID | Requirement | Source | Phase |
|----|-------------|--------|-------|
| CR-040 | AI may create virtual laboratory based on learner's requested scenario | Constitution §7 | 7 |
| CR-041 | System must create scenario as requested within controlled lab architecture | Constitution §7 | 7 |
| CR-042 | Architecture must support storing generated labs when user agrees | Constitution §7.1 | 7 |
| CR-043 | Saved labs reusable by same learner, other users, tutors, forums (subject to rules) | Constitution §7.1 | 7 |
| CR-044 | Initial implementation: deliberately limited STEM scenarios | Constitution §7.2 | 7 |
| CR-045 | Architecture must support subject expansion | Constitution §7.2 | 7 |

### 2.6 External Simulations

| ID | Requirement | Source | Phase |
|----|-------------|--------|-------|
| CR-050 | PhET and similar external simulations from official sources | Constitution §8 | 6 |
| CR-051 | Preserve source attribution and required logos/branding | Constitution §8 | 6 |
| CR-052 | Provide external links | Constitution §8 | 6 |
| CR-053 | Do not pretend external simulations are owned by AskATutorLive | Constitution §8 | 6 |
| CR-054 | Integrate conceptually with classroom experiences | Constitution §8.1 | 6 |
| CR-055 | Do not assume undocumented external APIs | Constitution §8.1 | 6 |

### 2.7 Tutor

| ID | Requirement | Source | Phase |
|----|-------------|--------|-------|
| CR-060 | Tutor is optional for the learner | Constitution §9 | 4 |
| CR-061 | Platform must make tutor support easy to activate | Constitution §9 | 4 |
| CR-062 | Difficulty interaction can produce structured tutor preparation report | Constitution §9.1 | 4 |
| CR-063 | Report includes: learner description, specific areas, questions, responses, AI guidance, context, labs, whiteboard, unresolved concerns, reflection | Constitution §9.1 | 4 |
| CR-064 | Tutor may review and confirm/correct AI interpretations | Constitution §9.2 | 4 |
| CR-065 | Tutor confirmation is authoritative over AI where appropriate | Constitution §9.2 | 4 |

### 2.8 Trust / Roles

| ID | Requirement | Source | Phase |
|----|-------------|--------|-------|
| CR-070 | Learner controls their learning journey and own data | Constitution §10 | 2 |
| CR-071 | Learner chooses tutor support | Constitution §10 | 4 |
| CR-072 | Learner chooses lab save/share preferences | Constitution §10 | 7 |
| CR-073 | Tutor sees information necessary to prepare and teach | Constitution §10 | 4 |
| CR-074 | Parent may receive appropriate progress/support info | Constitution §10 | 9 |
| CR-075 | Parent must not automatically receive unrestricted access | Constitution §10 | 9 |
| CR-076 | Admin accesses with proper authorization and auditing | Constitution §10 | 10 |
| CR-077 | AI receives only permitted information; must not bypass authorization | Constitution §10 | 5 |

### 2.9 Institutions

| ID | Requirement | Source | Phase |
|----|-------------|--------|-------|
| CR-080 | Institutions supported but NOT primary target market | Constitution §11 | 8 |
| CR-081 | Institution may distribute lesson/class/session links | Constitution §11 | 8 |
| CR-082 | Institution-link learners do NOT need individual accounts | Constitution §11 | 8 |
| CR-083 | Institution-link learners are NOT anonymous — identified in institution context | Constitution §11 | 8 |
| CR-084 | Institution can receive learning outputs (PDFs, whiteboard records, recordings, evidence, reports) | Constitution §11 | 8 |

### 2.10 Recording and Evidence

| ID | Requirement | Source | Phase |
|----|-------------|--------|-------|
| CR-090 | Whiteboard always saved as PDF | Constitution §12 | 3 |
| CR-091 | Voice recorded when needed/enabled | Constitution §12 | 3 |
| CR-092 | Video recorded when needed/enabled and supported by plan | Constitution §12 | 3 |
| CR-093 | Platform starts with FREE tier | Constitution §12.1 | 8 |
| CR-094 | Architecture must account for storage/recording/retention/entitlement limits | Constitution §12.1 | 8 |
| CR-095 | Evidence types: responses, whiteboard, notes, simulations, labs, tutor interactions, AI interactions, voice, video, session records, reflection | Constitution §12.2 | 3 |
| CR-096 | Evidence is not automatically mastery | Constitution §12.2 | 3 |

### 2.11 Community

| ID | Requirement | Source | Phase |
|----|-------------|--------|-------|
| CR-100 | Learners must eventually interact with other learners | Constitution §13 | 11 |
| CR-101 | Forums, groups, discussions, resource sharing, lab sharing | Constitution §13 | 11 |
| CR-102 | Strong moderation, reporting, privacy, abuse prevention, access control, content ownership, safety | Constitution §13 | 11 |

### 2.12 Commerce

| ID | Requirement | Source | Phase |
|----|-------------|--------|-------|
| CR-110 | Every meaningful interaction within entitlement/account model | Constitution §14 | 9 |
| CR-111 | Support: free tier, paid plans, tutor services, institutions, subscriptions, payments, entitlements, usage limits | Constitution §14 | 9 |
| CR-112 | Payment architecture must be server-authoritative | Constitution §14.1 | 9 |
| CR-113 | Financial records: authorization, validation, idempotency, transaction safety, auditability, reconciliation | Constitution §14.1 | 9 |

---

## 3. TECHNOLOGY REQUIREMENTS

| ID | Requirement | Status |
|----|-------------|--------|
| TR-001 | TypeScript implementation language | CONFIRMED |
| TR-002 | React frontend framework | CONFIRMED |
| TR-003 | Vite build tool | CONFIRMED |
| TR-004 | Tailwind CSS styling | CONFIRMED |
| TR-005 | Node.js backend | CONFIRMED |
| TR-006 | PostgreSQL/Supabase database | CONFIRMED |
| TR-007 | Three.js for 3D experiences | CONFIRMED |
| TR-008 | Testing framework | UNKNOWN — REQUIRES DECISION |
| TR-009 | Deployment platform | UNKNOWN — REQUIRES DECISION |

---

## 4. PHASE-LOCKED REQUIREMENTS

The following are explicitly locked to specific phases and MUST NOT be implemented before:

| Requirement | Locked To |
|-------------|-----------|
| Whiteboard assessment writing | Phase 3 |
| Mandatory difficulty interaction (first 3 lessons) | Phase 2 |
| Virtual labs (initial STEM) | Phase 7 |
| Community forums/groups | Phase 11 |
| Payments/commerce | Phase 9 |
| Institution portal | Phase 8 |
| AI Gateway | Phase 5 |
| Parent experience | Phase 9 |

---

## 5. UNKNOWN REQUIREMENTS

| ID | Question | Impact | Required By |
|----|----------|--------|-------------|
| UN-001 | Which testing framework? | Affects dev setup, CI/CD | Phase 1 |
| UN-002 | Which deployment platform? | Affects infrastructure, CI/CD | Phase 1 |
| UN-003 | Specific PhET integration scope? | Affects simulation architecture | Phase 6 |
| UN-004 | Video recording technical limits? | Affects evidence architecture | Phase 3 |
| UN-005 | Voice recording technical limits? | Affects evidence architecture | Phase 3 |
| UN-006 | Specific institution link flow? | Affects institution architecture | Phase 8 |
| UN-007 | Assessment/mastery architecture details? | Affects learning domain | Phase 3 |

---

## 6. REJECTED / NOT-APPLICABLE

No requirements have been rejected at Phase 0.
