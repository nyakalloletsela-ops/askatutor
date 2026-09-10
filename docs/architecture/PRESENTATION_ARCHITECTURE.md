> **STATUS: HISTORICAL / PLANNING / ASPIRATIONAL — NOT CURRENT IMPLEMENTATION SOURCE OF TRUTH**
> Phase-0 planning record (AT-0000, 2026-09-04). Current authority: `docs/CURRENT_STATE.md` + `docs/AUDIT_BASELINE_AT-0001.md`.

# ASKATUTORLIVE — PRESENTATION ARCHITECTURE

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. PRESENTATION ARCHITECTURE OVERVIEW

The presentation layer is the user-facing interface of AskATutorLive. It is organized into major areas, each with specific components, screens, and data requirements.

**Technology**: React + Vite + Tailwind CSS

---

## 2. MAJOR PRESENTATION AREAS

### 2.1 LANDING / DISCOVERY

**Purpose**: Public-facing entry point for new and returning users

| Attribute | Detail |
|-----------|--------|
| Screens | Home, Topic Browse, Search Results, About, Pricing |
| Components | HeroSection, TopicGrid, TopicCard, SearchBar, TestimonialCarousel, PricingTable |
| State | None (public) |
| Data | Topic catalog, testimonials, pricing plans |
| Use Cases | browse_topics, search_content |
| Permissions | Public |
| Dependencies | Topic catalog, pricing data |
| Phase | 1 |

---

### 2.2 AUTHENTICATION

**Purpose**: Account creation, login, session management

| Attribute | Detail |
|-----------|--------|
| Screens | Login, Register, Forgot Password, Email Verification, Account Setup |
| Components | LoginForm, RegisterForm, PasswordReset, EmailVerify, AccountTypeSelect |
| State | Auth state (global) |
| Data | Credentials, account type, verification status |
| Use Cases | create_account, login, verify_email, reset_password |
| Permissions | Public (unauthenticated), then authenticated |
| Dependencies | Identity & Access domain |
| Phase | 1 |

---

### 2.3 LEARNER DASHBOARD

**Purpose**: Central hub for learner's learning journey

| Attribute | Detail |
|-----------|--------|
| Screens | Dashboard Home, My Topics, My Sessions, My Progress, Settings |
| Components | WelcomeBanner, TopicList, SessionList, ProgressOverview, QuickActions |
| State | Learner profile, topic list, session list, progress data |
| Data | Learner profile, enrolled topics, recent sessions, progress metrics |
| Use Cases | view_dashboard, get_learner_progress, list_sessions |
| Permissions | Learner (own data only) |
| Dependencies | Learning domain, Assessment domain |
| Phase | 2 |

---

### 2.4 LEARNER TOPIC / LESSON EXPERIENCE

**Purpose**: Core learning interaction surface

| Attribute | Detail |
|-----------|--------|
| Screens | Topic Overview, Lesson View, Lesson Complete, Lesson History |
| Components | LessonContent, ProgressIndicator, LessonNavigation, CompletionSummary |
| State | Current lesson, lesson progress, completion status |
| Data | Lesson content, learner's lesson history, topic structure |
| Use Cases | start_lesson, complete_lesson, view_lesson_content |
| Permissions | Learner (own sessions) |
| Dependencies | Learning domain, Assessment domain |
| Phase | 2 |

---

### 2.5 MANDATORY INITIAL DIFFICULTY / FEAR INTERACTION

**Purpose**: First-contact difficulty identification (mandatory for first 3 lessons)

| Attribute | Detail |
|-----------|--------|
| Screens | Welcome Concern Prompt, Concern Exploration, Difficulty Identification, Difficulty Confirmation, Learner Reflection |
| Components | ConversationFlow, ConcernInput, DifficultyProbe, ReflectionCapture, JourneySummary |
| State | Current concern, identified difficulties, AI interaction state, learner reflection |
| Data | Learner's initial statement, AI probes, learner responses, identified difficulties, final reflection |
| Use Cases | start_difficulty_interaction, record_concern, probe_clarify, identify_difficulty, capture_reflection |
| Permissions | Learner |
| Dependencies | Learning domain, AI Gateway |
| Phase | 2 |

---

### 2.6 WHITEBOARD

**Purpose**: Core learning surface for writing, problem-solving, assessment

| Attribute | Detail |
|-----------|--------|
| Screens | Whiteboard Canvas, Whiteboard History, Whiteboard Export |
| Components | CanvasRenderer, DrawingTools, TextTools, ShapeTools, UndoRedo, ExportToPDF, WhiteboardHistory |
| State | Canvas state, tool selection, undo/redo stack, saved state |
| Data | Canvas strokes, shapes, text, images; saved whiteboard records |
| Use Cases | create_whiteboard, draw_on_whiteboard, save_whiteboard, export_pdf, view_whiteboard_history |
| Permissions | Learner (own whiteboards), Tutor (session whiteboards) |
| Dependencies | Evidence domain, PDF generation |
| Phase | 3 |

---

### 2.7 TUTOR EXPERIENCE

**Purpose**: Tutor-facing portal for managing tutoring activities

| Attribute | Detail |
|-----------|--------|
| Screens | Tutor Dashboard, Available Sessions, Learner Briefing, Active Session, Session History, Tutor Profile |
| Components | SessionQueue, LearnerBriefingCard, ActiveSessionView, SessionHistoryList, ProfileEditor |
| State | Tutor profile, assigned sessions, active session, session history |
| Data | Tutor profile, session queue, learner briefing reports, session records |
| Use Cases | view_tutor_dashboard, accept_session, review_briefing, conduct_session, complete_session |
| Permissions | Tutor |
| Dependencies | Tutoring domain, Learning domain, Evidence domain |
| Phase | 4 |

---

### 2.8 AI ASSISTANCE

**Purpose**: AI-powered learning assistance surface

| Attribute | Detail |
|-----------|--------|
| Screens | AI Chat Panel, AI Suggestion Overlay, AI Explanation View |
| Components | ChatMessageList, ChatInput, SuggestionCard, ExplanationPanel, StreamingRenderer |
| State | Chat messages, streaming state, suggestion list |
| Data | Chat history, AI responses, suggestions, explanations |
| Use Cases | send_ai_message, get_ai_suggestion, get_ai_explanation, stream_ai_response |
| Permissions | Learner, Tutor |
| Dependencies | AI Gateway, Learning domain |
| Phase | 5 |

---

### 2.9 VIRTUAL LAB

**Purpose**: Interactive virtual laboratory experience

| Attribute | Detail |
|-----------|--------|
| Screens | Lab Browser, Lab Creation, Active Lab, Lab Results, Saved Labs |
| Components | LabCard, LabCreator, LabCanvas, LabControls, LabResults, LabHistory |
| State | Available labs, active lab state, lab results, saved labs |
| Data | Lab specs, scenario definitions, execution state, results |
| Use Cases | browse_labs, create_lab, start_lab, interact_lab, save_lab, view_lab_results |
| Permissions | Learner, Tutor |
| Dependencies | Virtual Labs domain, AI Gateway, Evidence domain |
| Phase | 7 |

---

### 2.10 EXTERNAL SIMULATION EXPERIENCE

**Purpose**: Integration with external simulations (PhET, etc.)

| Attribute | Detail |
|-----------|--------|
| Screens | Simulation Browser, Embedded Simulation, Simulation Context |
| Components | SimulationCard, SimulationEmbed, ContextPanel, AttributionBadge |
| State | Available simulations, active simulation context |
| Data | Simulation metadata, embed URLs, attribution info |
| Use Cases | browse_simulations, launch_simulation, attach_simulation_context |
| Permissions | Learner, Tutor |
| Dependencies | Simulations domain |
| Phase | 6 |

---

### 2.11 CLASSROOM / SESSION EXPERIENCE

**Purpose**: Real-time collaborative learning session

| Attribute | Detail |
|-----------|--------|
| Screens | Session Lobby, Active Session, Session Recording, Session Review |
| Components | ParticipantList, SharedWhiteboard, ChatPanel, RecordingControls, SessionTimeline |
| State | Session state, participants, shared resources, recording state |
| Data | Session data, participant list, shared whiteboard, recordings |
| Use Cases | join_session, participate_session, share_whiteboard, record_session, review_session |
| Permissions | Session participants |
| Dependencies | Session domain, Whiteboard, Evidence, AI |
| Phase | 4 |

---

### 2.12 NOTES

**Purpose**: Learner annotations and reference management

| Attribute | Detail |
|-----------|--------|
| Screens | Note Editor, Note List, Note Search |
| Components | NoteEditor, NoteCard, NoteSearch, NoteTagging |
| State | Note list, current note, search state |
| Data | Note content, tags, links to lessons/labs |
| Use Cases | create_note, edit_note, search_notes, link_note_to_lesson |
| Permissions | Learner (own notes) |
| Dependencies | Notes domain |
| Phase | 3 |

---

### 2.13 RECORDINGS / EVIDENCE

**Purpose**: Manage and review learning evidence

| Attribute | Detail |
|-----------|--------|
| Screens | Evidence Library, Evidence Detail, Evidence Export |
| Components | EvidenceList, EvidenceCard, EvidenceDetail, PDFPreview, AudioPlayer, VideoPlayer |
| State | Evidence list, current evidence, playback state |
| Data | Evidence records, file references, metadata |
| Use Cases | view_evidence, play_recording, export_evidence, share_evidence |
| Permissions | Learner (own evidence), Tutor (session evidence) |
| Dependencies | Evidence domain, Storage |
| Phase | 3 |

---

### 2.14 REPORTS

**Purpose**: Learning progress and performance reports

| Attribute | Detail |
|-----------|--------|
| Screens | Report Dashboard, Report Detail, Report Export |
| Components | ReportCard, ReportChart, ReportTable, ExportButton |
| State | Report list, current report |
| Data | Report data, charts, export formats |
| Use Cases | generate_report, view_report, export_report |
| Permissions | Learner (own reports), Tutor (assigned learner reports), Institution (class reports) |
| Dependencies | Reporting domain, Assessment domain |
| Phase | 9 |

---

### 2.15 COMMUNITY / FORUM

**Purpose**: Peer interaction and knowledge sharing

| Attribute | Detail |
|-----------|--------|
| Screens | Forum Home, Thread View, Create Post, Group List, Group View |
| Components | ForumList, ThreadList, PostCard, CreatePostForm, GroupCard, GroupMemberList |
| State | Forum list, thread list, group list |
| Data | Forums, threads, posts, groups, members |
| Use Cases | view_forums, create_thread, reply_to_thread, join_group, share_resource |
| Permissions | Learner, Tutor |
| Dependencies | Community domain, Trust & Safety domain |
| Phase | 11 |

---

### 2.16 INSTITUTION PORTAL

**Purpose**: Institution management and class distribution

| Attribute | Detail |
|-----------|--------|
| Screens | Institution Dashboard, Class Management, Link Distribution, Reports |
| Components | ClassList, ClassCreate, LinkGenerator, ReportCard, StudentList |
| State | Institution profile, classes, links |
| Data | Institution data, class data, student lists, reports |
| Use Cases | manage_classes, generate_link, distribute_link, view_reports |
| Permissions | Institution Admin |
| Dependencies | Institutions domain |
| Phase | 8 |

---

### 2.17 PARENT EXPERIENCE

**Purpose**: Parent visibility into learner progress

| Attribute | Detail |
|-----------|--------|
| Screens | Parent Dashboard, Learner Progress, Support Actions |
| Components | ProgressCard, ActivityList, SupportButton |
| State | Parent profile, linked learners |
| Data | Learner progress summaries, activity logs |
| Use Cases | view_learner_progress, support_learner |
| Permissions | Parent (linked learners only) |
| Dependencies | Learning domain, Assessment domain |
| Phase | 9 |

---

### 2.18 ADMIN / OPERATIONS

**Purpose**: Platform administration and operations

| Attribute | Detail |
|-----------|--------|
| Screens | Admin Dashboard, User Management, Content Moderation, System Health |
| Components | UserList, ModerationQueue, HealthPanel, AuditLog |
| State | System metrics, user list, moderation queue |
| Data | Users, content, audit logs, system metrics |
| Use Cases | manage_users, moderate_content, view_health, view_audit |
| Permissions | Admin |
| Dependencies | Operations domain, Trust & Safety domain |
| Phase | 10 |

---

### 2.19 SUBSCRIPTION / COMMERCE

**Purpose**: Plan management, billing, payments

| Attribute | Detail |
|-----------|--------|
| Screens | Plan Selection, Billing History, Payment Methods, Subscription Management |
| Components | PlanCard, BillingTable, PaymentMethodForm, SubscriptionStatus |
| State | Current plan, billing history, payment methods |
| Data | Plans, subscriptions, payments, invoices |
| Use Cases | view_plans, subscribe, manage_subscription, view_billing |
| Permissions | Learner (own billing), Admin (all billing) |
| Dependencies | Commerce domain |
| Phase | 9 |

---

### 2.20 SETTINGS

**Purpose**: User account and preference management

| Attribute | Detail |
|-----------|--------|
| Screens | Account Settings, Notification Preferences, Privacy Settings, Profile |
| Components | AccountForm, NotificationPrefs, PrivacyForm, ProfileEditor |
| State | User settings, notification prefs |
| Data | Account data, preferences |
| Use Cases | update_account, update_preferences, update_privacy |
| Permissions | User (own settings) |
| Dependencies | Identity domain |
| Phase | 1 |

---

### 2.21 NOTIFICATIONS

**Purpose**: User notification system

| Attribute | Detail |
|-----------|--------|
| Screens | Notification Center, Notification List |
| Components | NotificationBell, NotificationList, NotificationCard |
| State | Unread count, notification list |
| Data | Notifications |
| Use Cases | get_notifications, mark_read, dismiss_notification |
| Permissions | User (own notifications) |
| Dependencies | Communication domain |
| Phase | 4 |
