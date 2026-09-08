# ASKATUTORLIVE — DOMAIN MAP

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. DOMAIN OVERVIEW

AskATutorLive is organized into the following domains. Each domain owns specific business logic, entities, and rules.

```
┌─────────────────────────────────────────────────────────┐
│                    DISCOVERY DOMAIN                      │
│  Landing, Search, Topic Browse, Onboarding              │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│               IDENTITY & ACCESS DOMAIN                   │
│  Authentication, Authorization, Roles, Sessions          │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                   LEARNING DOMAIN                        │
│  Topics, Lessons, Learner Profile, Difficulty Tracking   │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                  ASSESSMENT DOMAIN                        │
│  Mastery, Progress, Reflection, Evidence Evaluation      │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                  TUTORING DOMAIN                         │
│  Tutor Profile, Session Management, Reports              │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│              CLASSROOM / SESSIONS DOMAIN                  │
│  Session State, Participation, Records                   │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                    AI DOMAIN                             │
│  Gateway, Model Router, Safety, Prompts, Cost Control    │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                 VIRTUAL LABS DOMAIN                      │
│  Lab Specs, Scenario Engine, Execution, Storage          │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                SIMULATIONS DOMAIN                        │
│  External Simulation Integration (PhET, etc.)            │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                  EVIDENCE DOMAIN                         │
│  Whiteboard PDFs, Recordings, Notes, Lab Records         │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                   NOTES DOMAIN                           │
│  Learner Notes, Annotations, References                  │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                 COMMUNICATION DOMAIN                     │
│  Notifications, Messaging, Alerts                        │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                 COMMUNITY DOMAIN                         │
│  Forums, Groups, Discussions, Moderation                 │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                INSTITUTIONS DOMAIN                       │
│  Institution Accounts, Class Links, Reports              │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│               TRUST & SAFETY DOMAIN                      │
│  Abuse Prevention, Content Moderation, Privacy           │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                 COMMERCE DOMAIN                          │
│  Plans, Subscriptions, Payments, Entitlements            │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                ENTITLEMENTS DOMAIN                       │
│  Usage Limits, Feature Access, Plan Enforcement          │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                REPORTING DOMAIN                          │
│  Learner Reports, Tutor Reports, Institution Reports     │
└─────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                OPERATIONS DOMAIN                         │
│  Logging, Monitoring, Health, Deployment                 │
└─────────────────────────────────────────────────────────┘
```

---

## 2. DOMAIN DEPENDENCIES

Direction flows from top-level infrastructure toward specialized domains:

```
IDENTITY & ACCESS
  ├── LEARNING
  │     ├── ASSESSMENT
  │     ├── EVIDENCE
  │     ├── NOTES
  │     └── AI
  │
  ├── TUTORING
  │     └── depends on: LEARNING, EVIDENCE
  │
  ├── CLASSROOM / SESSIONS
  │     └── depends on: LEARNING, EVIDENCE, AI
  │
  ├── VIRTUAL LABS
  │     └── depends on: AI, EVIDENCE
  │
  ├── SIMULATIONS
  │     └── depends on: EVIDENCE
  │
  ├── COMMUNITY
  │     └── depends on: IDENTITY, TRUST & SAFETY
  │
  ├── INSTITUTIONS
  │     └── depends on: IDENTITY, LEARNING, EVIDENCE
  │
  ├── COMMERCE
  │     └── depends on: IDENTITY, ENTITLEMENTS
  │
  ├── ENTITLEMENTS
  │     └── depends on: IDENTITY, COMMERCE
  │
  ├── REPORTING
  │     └── depends on: LEARNING, ASSESSMENT, EVIDENCE
  │
  └── TRUST & SAFETY
        └── depends on: IDENTITY
```

---

## 3. DOMAIN RESPONSIBILITIES

| Domain | Primary Responsibility | Key Entities |
|--------|----------------------|--------------|
| DISCOVERY | Help users find and start learning | Topic, Category, Search |
| IDENTITY & ACCESS | AuthN, AuthZ, sessions, roles | Account, Session, Role, Permission |
| LEARNING | Manage learning journey and difficulty identification | Topic, Lesson, LearnerConcern, Difficulty, Intervention |
| ASSESSMENT | Evaluate understanding and progress | Assessment, Mastery, Reflection, Progress |
| TUTORING | Connect learners with tutors, manage tutoring sessions | Tutor, TutorSession, PreparationReport |
| CLASSROOM/SESSIONS | Manage real-time learning sessions | Session, Participant, SessionRecord |
| AI | Route AI requests, ensure safety, control costs | AIRequest, ModelSelection, AIGateway |
| VIRTUAL LABS | Create, store, execute virtual laboratories | LabSpec, Scenario, LabExecution, LabRecord |
| SIMULATIONS | Integrate external simulations | ExternalSim, SimulationContext |
| EVIDENCE | Preserve and manage learning artifacts | WhiteboardPDF, Recording, EvidenceRecord |
| NOTES | Manage learner annotations and references | Note, Annotation, Reference |
| COMMUNICATION | Notifications and messaging | Notification, Message, Alert |
| COMMUNITY | Forums, groups, peer interaction | Forum, Group, Discussion, Post |
| INSTITUTIONS | Institution accounts and class distribution | Institution, InstitutionClass, InstitutionLink |
| TRUST & SAFETY | Abuse prevention, content moderation, privacy | ModerationAction, Report, PrivacyRule |
| COMMERCE | Plans, payments, billing | Plan, Subscription, Payment, Invoice |
| ENTITLEMENTS | Feature access and usage limits | Entitlement, UsageRecord, Limit |
| REPORTING | Generate learner/tutor/institution reports | Report, ReportTemplate |
| OPERATIONS | Logging, monitoring, deployment | LogEntry, Metric, HealthCheck |
