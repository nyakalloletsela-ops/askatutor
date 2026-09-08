# ASKATUTORLIVE — DEPENDENCY GRAPH

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

This document defines the dependency ordering for AskATutorLive implementation phases. Dependencies flow from foundation toward specialized features.

---

## 2. DEPENDENCY GRAPH

```
PHASE 0: Product Constitution + Engineering Foundation
  (No dependencies — starts here)
  │
  ▼
PHASE 1: Presentation Foundation
  (Depends on: Phase 0)
  │
  ├─── Reusable UI components
  ├─── Routing structure
  ├─── Layout system
  ├─── Design tokens
  └─── Accessibility foundation
  │
  ▼
PHASE 2: Identity & Access + Learning Foundation
  (Depends on: Phase 1)
  │
  ├─── Authentication
  ├─── Role model
  ├─── Learner profile
  ├─── Topic/lesson model
  └─── Mandatory difficulty interaction (first 3 lessons)
  │
  ▼
PHASE 3: Whiteboard + Evidence + Notes
  (Depends on: Phase 1, Phase 2)
  │
  ├─── Whiteboard canvas
  ├─── PDF export
  ├─── Evidence model
  ├─── Recording infrastructure
  └─── Notes
  │
  ▼
PHASE 4: Tutoring + Sessions
  (Depends on: Phase 2, Phase 3)
  │
  ├─── Tutor model
  ├─── Session management
  ├─── Tutor preparation reports
  ├─── Real-time sessions
  └─── Notifications
  │
  ▼
PHASE 5: AI Gateway + AI Features
  (Depends on: Phase 2, Phase 4)
  │
  ├─── AI Gateway
  ├─── Model routing
  ├─── Safety filtering
  ├─── AI-assisted learning
  └─── AI cost controls
  │
  ▼
PHASE 6: External Simulations
  (Depends on: Phase 3, Phase 5)
  │
  ├─── PhET integration
  ├─── External simulation embedding
  ├─── Attribution
  └─── Context linking
  │
  ▼
PHASE 7: Virtual Labs
  (Depends on: Phase 5, Phase 3)
  │
  ├─── Lab specification model
  ├─── Lab runtime
  ├─── AI lab generation
  ├─── Basic STEM labs
  └─── Lab persistence
  │
  ▼
PHASE 8: Institutions
  (Depends on: Phase 2, Phase 3, Phase 4)
  │
  ├─── Institution accounts
  ├─── Class management
  ├─── Link distribution
  ├─── Institution reports
  └─── Institution-link learners
  │
  ▼
PHASE 9: Commerce + Entitlements + Reports + Parents
  (Depends on: Phase 2, Phase 8)
  │
  ├─── Plan structure
  ├─── Subscriptions
  ├─── Payments
  ├─── Entitlements
  ├─── Usage limits
  ├─── Reporting
  └─── Parent experience
  │
  ▼
PHASE 10: Admin Portal + Operations
  (Depends on: Phase 9)
  │
  ├─── Admin dashboard
  ├─── User management
  ├─── Content moderation
  ├─── System health
  ├─── Audit logging
  └─── Operations tooling
  │
  ▼
PHASE 11: Community Foundation
  (Depends on: Phase 10, Phase 2)
  │
  ├─── Forums
  ├─── Basic groups
  ├─── Moderation
  ├─── User reporting
  └─── Abuse prevention
  │
  ▼
PHASE 12: Advanced Learning + Community
  (Depends on: Phase 11, Phase 5, Phase 7)
  │
  ├─── Advanced assessment
  ├─── Mastery engine
  ├─── Advanced labs
  ├─── Real-time discussions
  └─── Advanced groups
  │
  ▼
PHASE 13: Advanced Features
  (Depends on: Phase 12)
  │
  ├─── Resource sharing
  ├─── Peer help
  ├─── Institution LMS integration
  ├─── Advanced commerce
  └─── Advanced reporting
  │
  ▼
PHASE 14: Optimization + Scale
  (Depends on: Phase 13)
  │
  ├─── Performance optimization
  ├─── Caching strategy
  ├─── CDN
  ├─── Advanced analytics
  └─── Community analytics
  │
  ▼
PHASE 15: Advanced Community
  (Depends on: Phase 14)
  │
  ├─── Community-driven content
  ├─── Reputation system
  ├─── Advanced moderation
  └─── Community analytics
  │
  ▼
PHASE 16: Mobile + Cross-Platform
  (Depends on: Phase 14)
  │
  ├─── Mobile optimization
  ├─── PWA
  ├─── Offline support
  └─── Cross-platform testing
  │
  ▼
PHASE 17: Advanced AI
  (Depends on: Phase 12, Phase 14)
  │
  ├─── Advanced AI tutoring
  ├─── AI-generated content review
  ├─── AI analytics
  └─── AI cost optimization
  │
  ▼
PHASE 18: Enterprise + Scale
  (Depends on: Phase 16, Phase 17)
  │
  ├─── Enterprise features
  ├─── Advanced institution tools
  ├─── Multi-region
  └─── Advanced security
  │
  ▼
PHASE 19: Production Hardening
  (Depends on: Phase 18)
  │
  ├─── Production monitoring
  ├─── Disaster recovery
  ├─── Performance baseline
  ├─── Security audit
  └─── Launch preparation
```

---

## 3. CRITICAL PATH

The critical path through the dependency graph:

```
Phase 0 → Phase 1 → Phase 2 → Phase 4 → Phase 5 → Phase 7 → Phase 12 → Phase 14 → Phase 17 → Phase 19
```

---

## 4. PARALLEL WORK STREAMS

After Phase 2, multiple work streams can proceed in parallel:

| Stream | Phases |
|--------|--------|
| Whiteboard/Evidence | Phase 3 |
| Tutoring/Sessions | Phase 4 |
| AI Gateway | Phase 5 |
| Simulations | Phase 6 |
| Virtual Labs | Phase 7 |
| Institutions | Phase 8 |
| Commerce | Phase 9 |

After Phase 9, additional parallelism:

| Stream | Phases |
|--------|--------|
| Admin/Operations | Phase 10 |
| Community | Phase 11 |
| Advanced Learning | Phase 12 |
| Advanced Features | Phase 13 |

After Phase 14, further parallelism:

| Stream | Phases |
|--------|--------|
| Advanced Community | Phase 15 |
| Mobile/Cross-Platform | Phase 16 |
| Advanced AI | Phase 17 |
| Enterprise | Phase 18 |

---

## 5. DEPENDENCY RULES

1. A phase cannot start until all its dependencies are COMPLETE
2. A phase's dependencies must be VERIFIED before the phase is marked COMPLETE
3. Parallel phases can share components but must not create circular dependencies
4. Infrastructure dependencies (database, deployment) are established in Phase 1
5. Security foundations are established in Phase 1-2 and extended throughout
