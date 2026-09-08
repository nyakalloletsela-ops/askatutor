# ASKATUTORLIVE — DOMAIN ARCHITECTURE

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

Each domain owns its business rules, entities, value objects, and domain events. Domains do not depend on infrastructure implementation details.

---

## 2. DOMAIN DEFINITIONS

### 2.1 IDENTITY & ACCESS

**Responsibility**: Account management, authentication, authorization, session management, role enforcement.

**Entities**:
- Account (learner, tutor, parent, admin, institution)
- Session (authenticated session)
- Role (learner, tutor, parent, admin, institution_admin)
- Permission
- InstitutionLink (anonymous institution participants)

**Value Objects**:
- Email
- Password (hash)
- SessionToken
- RoleType

**Domain Rules**:
- Every authenticated user has exactly one primary role
- Institution-link participants have limited session-scoped identity
- Session tokens have configurable expiry
- Account types determine default permissions

**Application Use Cases**:
- create_account, login, verify_email, reset_password, manage_session

**Security Boundary**: Central authentication. All other domains depend on this.

**Persistence**: Account table, session table, role table, permission table

---

### 2.2 LEARNING

**Responsibility**: Topic and lesson management, learner journey, difficulty identification, intervention tracking.

**Entities**:
- Topic
- Lesson
- LearnerProfile
- LearnerConcern
- Difficulty
- Intervention
- LearningSession
- LearnerReflection

**Value Objects**:
- ConcernText
- DifficultyLevel
- InterventionType
- ReflectionResponse (resolved/reduced/unchanged/increased/uncertain)

**Domain Rules**:
- First three lessons require mandatory difficulty/fear interaction
- Learner's initial statement is NOT the final difficulty identification
- AI must probe and clarify before declaring difficulty
- Learner reflection captures whether fear/confusion was resolved
- Journey from concern → intervention → reflection must be preserved

**Events**:
- LearnerConcernRecorded
- DifficultyIdentified
- InterventionStarted
- LessonCompleted
- ReflectionCaptured

**Application Use Cases**:
- create_learning_session, start_difficulty_interaction, record_concern, identify_difficulty, complete_lesson, collect_reflection

**Dependencies**: Identity & Access, AI (for probing)

**Persistence**: Topics, lessons, learner profiles, concerns, difficulties, interventions, sessions, reflections

---

### 2.3 ASSESSMENT

**Responsibility**: Evaluating understanding, tracking mastery, measuring progress.

**Entities**:
- Assessment
- MasteryRecord
- ProgressEntry
- AssessmentResult

**Value Objects**:
- Score
- MasteryLevel
- AssessmentType

**Domain Rules**:
- Assessment and mastery architecture is NOT finalized — requires explicit decision
- Evidence is not automatically mastery
- Assessment methods may include: self-assessment, AI-assessed, tutor-assessed, evidence-based
- Mastery must be distinguishable from mere completion

**Status**: UNKNOWN — REQUIRES DECISION before Phase 3 implementation

**Dependencies**: Learning, Evidence

**Persistence**: Assessment results, mastery records, progress entries

---

### 2.4 TUTORING

**Responsibility**: Tutor management, session assignment, preparation reports, tutoring workflow.

**Entities**:
- TutorProfile
- TutorSession
- PreparationReport
- TutorAvailability

**Value Objects**:
- TutorSpecialization
- SessionStatus (pending/active/completed/cancelled)
- BriefingData

**Domain Rules**:
- Tutor is optional for learner
- Preparation report is generated from difficulty interaction
- Tutor confirmation is authoritative over AI interpretation
- Tutor can see: learner's description, identified difficulties, AI guidance, whiteboard evidence, unresolved concerns

**Events**:
- TutorRequested
- TutorAssigned
- TutorSessionStarted
- TutorSessionCompleted
- InterpretationConfirmed

**Application Use Cases**:
- prepare_tutor_briefing, accept_tutor_session, conduct_tutor_session, confirm_ai_interpretation, complete_tutoring_session

**Dependencies**: Learning, Evidence, AI

**Persistence**: Tutor profiles, sessions, briefing reports

---

### 2.5 CLASSROOM / SESSIONS

**Responsibility**: Real-time learning session management, participation, recording.

**Entities**:
- Session (learning session)
- Participant
- SessionRecord
- SessionResource

**Value Objects**:
- SessionState (lobby/active/paused/completed)
- ParticipantRole (learner/tutor)
- ResourceReference

**Domain Rules**:
- Sessions can be solo (learner + AI) or collaborative (learner + tutor)
- Session resources include: whiteboard, notes, recordings
- Session records must be preserved

**Events**:
- SessionCreated
- ParticipantJoined
- SessionStarted
- SessionPaused
- SessionCompleted

**Dependencies**: Learning, Evidence, Whiteboard

**Persistence**: Session records, participant records

---

### 2.6 AI

**Responsibility**: AI gateway, model routing, safety, cost control, structured output validation.

**Entities**:
- AIGateway
- ModelRouter
- AIRequest
- AIResponse
- SafetyCheck

**Value Objects**:
- ModelSelection
- ProviderSelection
- TokenCount
- CostRecord
- SafetyResult

**Domain Rules**:
- All AI access must go through the centralized gateway
- AI is NOT the authority on learner understanding
- AI-generated content must be distinguishable from learner statements and verified evidence
- AI-generated reusable content requires approval
- AI receives only information permitted by trust boundaries
- Provider adapters are replaceable

**Events**:
- AIRequestRouted
- AIResponseValidated
- SafetyViolationDetected
- CostThresholdReached

**Application Use Cases**:
- route_ai_request, validate_ai_output, enforce_ai_safety, track_ai_cost, stream_ai_response

**Dependencies**: Identity & Access (for trust boundaries)

**Persistence**: AI request logs, cost records, safety logs

---

### 2.7 VIRTUAL LABS

**Responsibility**: Lab creation, scenario definition, execution, storage, sharing.

**Entities**:
- LabSpec
- LabScenario
- LabExecution
- LabRecord
- LabComponent

**Value Objects**:
- ScenarioDefinition
- ExecutionState
- ComponentSet (permitted components)
- LabStatus (draft/active/completed/saved/shared)

**Domain Rules**:
- Labs are AI-generated within controlled architecture
- Initial scope: deliberately limited STEM scenarios
- Architecture must support expansion to non-STEM
- Labs can be saved when learner agrees
- Saved labs may be shared subject to safety rules
- Labs must be sandboxed with resource limits
- External simulation content is not owned by AskATutorLive

**Events**:
- LabCreated
- LabStarted
- LabInteraction
- LabSaved
- LabShared

**Dependencies**: AI, Evidence

**Persistence**: Lab specs, scenarios, executions, records

---

### 2.8 SIMULATIONS

**Responsibility**: External simulation integration, attribution, context linking.

**Entities**:
- ExternalSimulation
- SimulationContext
- SimulationAttribution

**Value Objects**:
- SimulationSource
- EmbedUrl
- AttributionData

**Domain Rules**:
- External simulations from official sources only
- Attribution and branding must be preserved
- Do not claim ownership of external simulations
- Integration must not assume undocumented APIs
- Record limitations when integration is not possible

**Dependencies**: Evidence

**Persistence**: Simulation metadata, attribution records

---

### 2.9 EVIDENCE

**Responsibility**: Preservation and management of learning artifacts.

**Entities**:
- EvidenceRecord
- WhiteboardPDF
- VoiceRecording
- VideoRecording
- EvidenceCollection

**Value Objects**:
- EvidenceType (whiteboard/voice/video/note/lab/ai_interaction/session_record)
- FileReference
- EvidenceMetadata

**Domain Rules**:
- Whiteboard is always saved as PDF
- Evidence is not automatically mastery
- Evidence types include: whiteboard, notes, simulations, labs, tutor interactions, AI interactions, voice, video, session records, reflection
- Free tier has storage/retention limits
- Evidence ownership belongs to learner

**Events**:
- EvidenceCreated
- EvidenceStored
- EvidenceShared

**Dependencies**: Storage (via port/adapter)

**Persistence**: Evidence records, file references

---

### 2.10 NOTES

**Responsibility**: Learner annotations, references, note management.

**Entities**:
- Note
- Annotation
- NoteLink

**Value Objects**:
- NoteContent
- Tag
- ReferenceLink

**Domain Rules**:
- Notes belong to the learner
- Notes can be linked to lessons, labs, sessions
- Notes can be shared (with appropriate permissions)

**Dependencies**: Identity & Access

**Persistence**: Notes, annotations, links

---

### 2.11 COMMUNICATION

**Responsibility**: Notifications, alerts, messaging.

**Entities**:
- Notification
- Alert
- Message

**Value Objects**:
- NotificationType
- NotificationPriority
- DeliveryChannel

**Domain Rules**:
- Notifications respect user preferences
- Alerts for critical events (entitlement limits, safety)
- Message delivery is best-effort

**Dependencies**: Identity & Access

**Persistence**: Notifications, delivery logs

---

### 2.12 COMMUNITY

**Responsibility**: Forums, groups, peer interaction, content sharing.

**Entities**:
- Forum
- Thread
- Post
- Group
- GroupMember
- CommunityResource

**Value Objects**:
- ForumCategory
- PostContent
- GroupType
- ModerationStatus

**Domain Rules**:
- Strong moderation and reporting required
- Privacy and abuse prevention
- Content ownership belongs to creator
- Sharing of labs/resources subject to safety rules
- Access control on group content

**Events**:
- PostCreated
- ReportFiled
- ContentModerated
- GroupJoined

**Dependencies**: Identity & Access, Trust & Safety

**Persistence**: Forums, threads, posts, groups, members, resources

---

### 2.13 INSTITUTIONS

**Responsibility**: Institution accounts, class distribution, institutional reporting.

**Entities**:
- Institution
- InstitutionClass
- InstitutionSession
- InstitutionLink
- InstitutionReport

**Value Objects**:
- InstitutionIdentifier
- ClassIdentifier
- LinkToken
- ReportFormat

**Domain Rules**:
- Institutions are NOT the primary target market
- Institution-link learners do NOT need individual accounts
- Institution-link learners are NOT anonymous — identified in institution context
- Institution can receive: PDFs, whiteboard records, recordings, evidence, reports
- Link distribution is controlled by institution

**Events**:
- InstitutionCreated
- ClassCreated
- LinkGenerated
- LinkUsed
- ReportGenerated

**Dependencies**: Identity & Access, Learning, Evidence

**Persistence**: Institutions, classes, sessions, links, reports

---

### 2.14 TRUST & SAFETY

**Responsibility**: Abuse prevention, content moderation, privacy enforcement.

**Entities**:
- ModerationAction
- Report
- PrivacyRule
- AbuseFlag

**Value Objects**:
- ModerationType
- PrivacyLevel
- ReportReason

**Domain Rules**:
- Community content requires moderation
- User reports must be actioned
- Privacy rules enforced across all domains
- Abuse prevention measures active on all user-generated content

**Dependencies**: Identity & Access

**Persistence**: Moderation records, reports, privacy rules

---

### 2.15 COMMERCE

**Responsibility**: Plans, subscriptions, payments, billing.

**Entities**:
- Plan
- Subscription
- Payment
- Invoice
- BillingRecord

**Value Objects**:
- PlanType (free/paid)
- PaymentMethod
- BillingCycle
- Amount
- Currency

**Domain Rules**:
- Payment architecture must be server-authoritative
- Never trust client-supplied financial values
- Financial records require: authorization, validation, idempotency, transaction safety, auditability, reconciliation
- Free tier is the default starting point

**Events**:
- SubscriptionCreated
- PaymentProcessed
- SubscriptionCancelled
- PaymentFailed

**Dependencies**: Identity & Access, Entitlements

**Persistence**: Plans, subscriptions, payments, invoices

---

### 2.16 ENTITLEMENTS

**Responsibility**: Feature access, usage limits, plan enforcement.

**Entities**:
- Entitlement
- UsageRecord
- FeatureLimit

**Value Objects**:
- FeatureId
- UsageCount
- LimitValue
- EntitlementStatus (active/expired/exceeded)

**Domain Rules**:
- Every meaningful interaction exists within entitlement model
- Usage limits enforced server-side
- Free tier has specific limits
- Entitlement checks before feature access

**Events**:
- EntitlementChecked
- UsageLimitReached
- EntitlementExpired

**Dependencies**: Identity & Access, Commerce

**Persistence**: Entitlements, usage records, limits

---

### 2.17 REPORTING

**Responsibility**: Generating learner, tutor, and institution reports.

**Entities**:
- Report
- ReportTemplate
- ReportSection

**Value Objects**:
- ReportType (learner/tutor/institution)
- ReportFormat (PDF/CSV/JSON)
- DateRange

**Domain Rules**:
- Reports generated from domain data
- Learner reports: own data only
- Tutor reports: assigned learner data
- Institution reports: institution class data
- Report generation is async for large datasets

**Dependencies**: Learning, Assessment, Evidence

**Persistence**: Generated reports, templates

---

### 2.18 OPERATIONS

**Responsibility**: Logging, monitoring, health checks, deployment.

**Entities**:
- LogEntry
- Metric
- HealthCheck
- AuditRecord

**Value Objects**:
- LogLevel
- MetricType
- HealthStatus

**Domain Rules**:
- All domain operations should be loggable
- Health checks for critical services
- Audit records for security-relevant actions

**Dependencies**: None (cross-cutting)

**Persistence**: Logs, metrics, audit records
