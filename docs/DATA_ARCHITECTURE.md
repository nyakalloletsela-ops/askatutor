# ASKATUTORLIVE — DATA ARCHITECTURE

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

The conceptual data model defines the major data entities, their relationships, and ownership boundaries. This is an architecture document — not a final physical schema.

---

## 2. DATA DOMAINS

### 2.1 ACCOUNT / IDENTITY

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Account | Platform user | id, email, name, role, status, created_at |
| AccountCredential | Authentication data | account_id, password_hash, provider, provider_id |
| Session | Authenticated session | id, account_id, token, expires_at, ip, user_agent |
| Role | User role assignment | account_id, role_type, assigned_at |
| InstitutionParticipant | Institution-link participant | id, institution_id, session_id, identifier |

**Relationships**:
- Account 1:N Role
- Account 1:N Session
- Account 1:1 AccountCredential
- Institution 1:N InstitutionParticipant

---

### 2.2 LEARNING CONTEXT

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Topic | Learning subject area | id, name, description, category, status |
| Lesson | Individual lesson within topic | id, topic_id, title, order, content_ref |
| LearnerProfile | Learner's learning profile | id, account_id, preferences, onboarding_complete |
| LearnerTopic | Learner enrolled in topic | id, learner_id, topic_id, enrolled_at |

**Relationships**:
- Topic 1:N Lesson
- Account 1:1 LearnerProfile
- LearnerProfile M:N Topic (via LearnerTopic)

---

### 2.3 LEARNER CONCERN

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| LearnerConcern | Learner's initial concern statement | id, session_id, learner_id, text, captured_at |
| ConcernProbe | AI probe/clarification | id, concern_id, question, response, order |
| IdentifiedDifficulty | Identified root difficulty | id, concern_id, description, confirmed_by_learner |

**Relationships**:
- Session 1:N LearnerConcern
- LearnerConcern 1:N ConcernProbe
- LearnerConcern 1:N IdentifiedDifficulty

---

### 2.4 INTERVENTION

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Intervention | Action taken to help learner | id, session_id, type, description, started_at, completed_at |
| InterventionStep | Individual step within intervention | id, intervention_id, action, result, order |

**Relationships**:
- Session 1:N Intervention
- Intervention 1:N InterventionStep

---

### 2.5 ACTIVITY

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| LearningSession | A learning session | id, learner_id, topic_id, status, started_at, completed_at |
| SessionEvent | Event within a session | id, session_id, event_type, data, timestamp |

**Relationships**:
- Account 1:N LearningSession
- Topic 1:N LearningSession
- LearningSession 1:N SessionEvent

---

### 2.6 EVIDENCE

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| EvidenceRecord | Any learning evidence | id, session_id, learner_id, type, metadata, created_at |
| WhiteboardPDF | Saved whiteboard as PDF | id, evidence_id, file_ref, page_count, created_at |
| VoiceRecording | Voice recording | id, evidence_id, file_ref, duration, created_at |
| VideoRecording | Video recording | id, evidence_id, file_ref, duration, created_at |
| EvidenceCollection | Grouped evidence | id, session_id, evidence_ids, assembled_at |

**Relationships**:
- Session 1:N EvidenceRecord
- EvidenceRecord 1:0..1 WhiteboardPDF
- EvidenceRecord 1:0..1 VoiceRecording
- EvidenceRecord 1:0..1 VideoRecording
- EvidenceCollection M:N EvidenceRecord

---

### 2.7 ASSESSMENT

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Assessment | Assessment event | id, session_id, type, status, created_at |
| AssessmentResult | Result of assessment | id, assessment_id, score, feedback, assessed_by |
| MasteryRecord | Mastery tracking | id, learner_id, topic_id, lesson_id, level, achieved_at |
| ProgressEntry | Progress tracking | id, learner_id, topic_id, lesson_id, status, completed_at |

**Status**: Assessment architecture requires explicit decision before implementation.

**Relationships**:
- Session 1:N Assessment
- Assessment 1:1 AssessmentResult
- LearnerProfile 1:N MasteryRecord
- LearnerProfile 1:N ProgressEntry

---

### 2.8 SESSION

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Session | Real-time session | id, type, status, started_at, completed_at |
| Participant | Session participant | id, session_id, account_id, role, joined_at |
| SessionRecord | Session recording/metadata | id, session_id, type, file_ref, created_at |
| SharedResource | Shared session resource | id, session_id, resource_type, resource_ref |

**Relationships**:
- Session 1:N Participant
- Session 1:N SessionRecord
- Session 1:N SharedResource

---

### 2.9 WHITEBOARD

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Whiteboard | Whiteboard canvas | id, session_id, owner_id, state_json, version |
| WhiteboardSnapshot | Point-in-time save | id, whiteboard_id, snapshot_data, created_at |
| WhiteboardExport | PDF export | id, whiteboard_id, file_ref, created_at |

**Relationships**:
- Session 1:1 Whiteboard
- Whiteboard 1:N WhiteboardSnapshot
- Whiteboard 1:N WhiteboardExport

---

### 2.10 NOTE

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Note | Learner note | id, owner_id, title, content, tags, created_at, updated_at |
| NoteLink | Link to other entities | id, note_id, entity_type, entity_id |

**Relationships**:
- Account 1:N Note
- Note 1:N NoteLink

---

### 2.11 LAB

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| LabSpec | Lab specification | id, creator_id, scenario_json, component_set, status |
| LabScenario | Scenario definition | id, lab_spec_id, name, description, rules |
| LabExecution | Lab execution session | id, lab_spec_id, session_id, state, started_at, completed_at |
| LabRecord | Saved lab record | id, lab_spec_id, execution_id, shared, created_at |

**Relationships**:
- LabSpec 1:N LabScenario
- LabSpec 1:N LabExecution
- LabExecution 1:0..1 LabRecord

---

### 2.12 SIMULATION

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| ExternalSimulation | External simulation reference | id, name, source, embed_url, attribution |
| SimulationContext | Simulation linked to session | id, simulation_id, session_id, context_data |

**Relationships**:
- ExternalSimulation 1:N SimulationContext

---

### 2.13 RECORDING

(See EVIDENCE domain — recordings are a type of evidence)

---

### 2.14 COMMUNITY

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Forum | Discussion forum | id, name, category, description, created_at |
| Thread | Forum thread | id, forum_id, author_id, title, created_at |
| Post | Thread post | id, thread_id, author_id, content, created_at |
| Group | Learning group | id, name, description, created_by, created_at |
| GroupMember | Group membership | id, group_id, account_id, role, joined_at |
| CommunityResource | Shared resource | id, group_id, shared_by, resource_type, resource_ref |

**Relationships**:
- Forum 1:N Thread
- Thread 1:N Post
- Account 1:N GroupMember
- Group 1:N GroupMember
- Group 1:N CommunityResource

---

### 2.15 INSTITUTION

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Institution | Institution account | id, name, admin_id, status, created_at |
| InstitutionClass | Class within institution | id, institution_id, name, description |
| InstitutionSession | Session created by institution | id, class_id, session_data, link_token |
| InstitutionLink | Shareable link | id, institution_session_id, token, uses, expires_at |
| InstitutionReport | Institution-specific report | id, institution_id, report_data, format, created_at |

**Relationships**:
- Institution 1:N InstitutionClass
- InstitutionClass 1:N InstitutionSession
- InstitutionSession 1:N InstitutionLink
- Institution 1:N InstitutionReport

---

### 2.16 ENTITLEMENT

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Entitlement | Feature access grant | id, account_id, feature_id, status, expires_at |
| UsageRecord | Usage tracking | id, account_id, feature_id, count, period_start, period_end |
| FeatureLimit | Limit definition | id, feature_id, plan_id, limit_value, period |

**Relationships**:
- Account 1:N Entitlement
- Account 1:N UsageRecord
- Plan 1:N FeatureLimit

---

### 2.17 COMMERCE

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| Plan | Subscription plan | id, name, type, price, features, status |
| Subscription | User subscription | id, account_id, plan_id, status, started_at, expires_at |
| Payment | Payment transaction | id, subscription_id, amount, currency, status, provider_ref |
| Invoice | Billing invoice | id, subscription_id, payment_id, amount, created_at |

**Relationships**:
- Plan 1:N Subscription
- Account 1:N Subscription
- Subscription 1:N Payment
- Payment 1:1 Invoice

---

### 2.18 AUDIT

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| AuditRecord | Security audit log | id, account_id, action, resource_type, resource_id, timestamp, ip |
| ModerationAction | Content moderation | id, content_id, action, moderator_id, reason, timestamp |
| Report | Abuse/content report | id, reporter_id, content_id, reason, status, created_at |

---

## 3. DATA OWNERSHIP BOUNDARIES

| Data | Owner | Can Access |
|------|-------|-----------|
| Learner personal data | Learner | Learner, Admin (with auth) |
| Learner learning data | Learner | Learner, Tutor (session-scoped), Admin |
| Tutor profile | Tutor | Tutor, Admin |
| Institution data | Institution | Institution, Admin |
| Community posts | Author | Community, Moderators |
| Payment data | Account holder | Account holder, Admin, Finance |
| AI interaction logs | Platform | AI Gateway, Admin |
| Audit logs | Platform | Admin, Security |

---

## 4. DATA FLOW PRINCIPLES

1. Learner data is isolated by default
2. Tutor access is session-scoped
3. Parent access requires explicit learner consent
4. Institution access is controlled by institution admin
5. AI receives only permitted data per trust boundary
6. All data access is auditable
7. Financial data is server-authoritative
8. Evidence ownership belongs to the learner
