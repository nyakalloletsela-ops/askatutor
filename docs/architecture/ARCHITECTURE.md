> **STATUS: HISTORICAL / PLANNING / ASPIRATIONAL — NOT CURRENT IMPLEMENTATION SOURCE OF TRUTH**
> Phase-0 planning record (AT-0000, 2026-09-04). Current authority: `docs/CURRENT_STATE.md` + `docs/AUDIT_BASELINE_AT-0001.md`.

# ASKATUTORLIVE — ARCHITECTURE OVERVIEW

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. ARCHITECTURE PRINCIPLES

### 1.1 Layer Separation

The target architecture separates:

1. **Presentation Layer** — UI, routing, visual components
2. **Application Layer** — Use cases, orchestration
3. **Domain Layer** — Business rules, entities, value objects
4. **Data/Infrastructure Layer** — Persistence, external services
5. **Integration Layer** — External provider adapters
6. **Security/Identity Layer** — Authentication, authorization, roles
7. **AI Gateway Layer** — Model routing, safety, cost control
8. **Virtual Lab Runtime** — Controlled simulation execution
9. **Operations/Observability** — Logging, metrics, health

### 1.2 Dependency Direction

```
Presentation → Application → Domain ← Data/Infrastructure
                                    ← Integration
                                    ← AI Gateway
                                    ← Virtual Lab Runtime

Security/Identity crosses all layers.
Operations/Observability crosses all layers.
```

Rules:
- Presentation must NOT contain domain business rules
- Domain must NOT depend on UI
- Domain/Application must NOT directly depend on infrastructure implementation details
- External providers must be behind ports/adapters
- AI provider access must be centralized through the AI Gateway

---

## 2. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  React + Vite + Tailwind CSS                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Learner  │ │  Tutor   │ │ Institution│ │  Admin   │  │
│  │  Portal  │ │ Portal   │ │  Portal   │ │ Portal   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │ API / tRPC / WebSocket
┌───────────────────────────┴─────────────────────────────┐
│                   APPLICATION LAYER                      │
│  Use Cases / Orchestration                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Learning │ │ Tutoring │ │Evidence  │ │Community │  │
│  │ Use Cases│ │ Use Cases│ │ Use Cases│ │ Use Cases│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                     DOMAIN LAYER                         │
│  Entities / Value Objects / Domain Rules                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Learning │ │ Session  │ │  Trust   │ │Commerce  │  │
│  │ Domain   │ │ Domain   │ │ Domain   │ │ Domain   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│              DATA / INFRASTRUCTURE LAYER                 │
│  PostgreSQL / Supabase / Storage                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Database │ │  File    │ │  Cache   │ │  Queue   │  │
│  │          │ │ Storage  │ │          │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 INTEGRATION LAYER                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ AI       │ │ Payment  │ │ Email    │ │External  │  │
│  │ Gateway  │ │ Provider │ │ Provider │ │ Sim (PhET)│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│               SECURITY / IDENTITY LAYER                 │
│  Authentication / Authorization / Roles / Audit          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                VIRTUAL LAB RUNTIME                       │
│  Controlled Sandboxed Execution                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │  Lab     │ │Scenario  │ │Execution │               │
│  │ Spec     │ │Engine    │ │Sandbox   │               │
│  └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│             OPERATIONS / OBSERVABILITY                   │
│  Logging / Metrics / Health / Alerts                     │
└─────────────────────────────────────────────────────────┘
```

---

## 3. TECHNOLOGY STACK

| Layer | Technology | Notes |
|-------|-----------|-------|
| Language | TypeScript | Full-stack |
| Frontend | React 18+ | SPA with routing |
| Build | Vite | Fast dev/build |
| Styling | Tailwind CSS | Utility-first |
| API | REST + WebSocket | WebSocket for real-time |
| Backend | Node.js | API server |
| Database | PostgreSQL | Via Supabase |
| Auth | Supabase Auth | Or custom — REQUIRES DECISION |
| Storage | Supabase Storage / S3 | For files, recordings, PDFs |
| 3D | Three.js | For virtual labs |
| AI | AI Gateway (custom) | See AI_ARCHITECTURE.md |
| Testing | UNKNOWN | REQUIRES DECISION |
| Deployment | UNKNOWN | REQUIRES DECISION |
| CI/CD | UNKNOWN | REQUIRES DECISION |
| Monitoring | UNKNOWN | REQUIRES DECISION |

---

## 4. PORTS AND ADAPTERS PATTERN

External dependencies are accessed through ports (interfaces) and adapters (implementations):

```
Domain
  ├── Port: AIProviderPort
  │     └── Adapter: OpenAIAdapter
  │     └── Adapter: AnthropicAdapter
  │     └── Adapter: FutureAdapter
  │
  ├── Port: PaymentProviderPort
  │     └── Adapter: StripeAdapter
  │     └── Adapter: FutureAdapter
  │
  ├── Port: EmailProviderPort
  │     └── Adapter: ResendAdapter
  │     └── Adapter: FutureAdapter
  │
  ├── Port: StorageProviderPort
  │     └── Adapter: SupabaseStorageAdapter
  │     └── Adapter: S3Adapter
  │
  └── Port: SimulationProviderPort
        └── Adapter: PhETAdapter
        └── Adapter: InternalLabAdapter
```

---

## 5. REAL-TIME ARCHITECTURE

WebSocket connections support:
- Live tutoring sessions
- Whiteboard collaboration
- AI chat/streaming
- Virtual lab interaction
- Community real-time features

WebSocket server runs alongside the API server or as a separate service.

---

## 6. FILE STRUCTURE (TARGET)

```
askatutorlive/
├── apps/
│   └── web/                    # React frontend
│       ├── src/
│       │   ├── components/     # UI components
│       │   ├── pages/          # Route pages
│       │   ├── hooks/          # React hooks
│       │   ├── stores/         # State management
│       │   ├── services/       # API client
│       │   └── lib/            # Utilities
│       └── public/
│
├── packages/
│   ├── api/                    # Backend API
│   │   ├── src/
│   │   │   ├── routes/         # API routes
│   │   │   ├── middleware/     # Auth, validation
│   │   │   └── services/       # Business logic
│   │   └── ...
│   │
│   ├── domain/                 # Domain layer
│   │   ├── learning/
│   │   ├── session/
│   │   ├── tutoring/
│   │   ├── evidence/
│   │   ├── community/
│   │   ├── institution/
│   │   ├── commerce/
│   │   └── trust/
│   │
│   ├── ai-gateway/             # AI Gateway
│   │   ├── providers/
│   │   ├── router/
│   │   └── safety/
│   │
│   ├── lab-runtime/            # Virtual Lab Runtime
│   │   ├── specs/
│   │   ├── engine/
│   │   └── sandbox/
│   │
│   └── shared/                 # Shared utilities
│       ├── types/
│       └── utils/
│
├── docs/                       # Documentation
├── scripts/                    # Build/dev scripts
└── config/                     # Configuration
```

> NOTE: This is a recommended structure. Final structure TBD during implementation.
