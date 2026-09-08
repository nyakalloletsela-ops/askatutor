# ASKATUTORLIVE — MASTER PLAN (PHASE 0-19)

Work ID: AT-0000  
Phase: 0  
Status: IN PROGRESS  
Date: 2026-09-04

---

## OVERVIEW

This is the 20-phase roadmap for AskATutorLive from foundation to production. Every phase has a clear scope, dependencies, and verification criteria.

---

## PHASE STATUS LEGEND

| Status | Meaning |
|--------|---------|
| NOT STARTED | Work has not begun |
| PLANNED | Work is planned but not started |
| IN PROGRESS | Work is actively underway |
| BLOCKED | Work is blocked by dependency or issue |
| PARTIALLY COMPLETE | Some work done, not all |
| COMPLETE | Implementation scope implemented and tested |
| VERIFIED | Independent verification evidence exists |
| PRODUCTION-VERIFIED | Actual production evidence exists |

---

## PHASE 0: PRODUCT CONSTITUTION + ENGINEERING FOUNDATION

| Field | Value |
|-------|-------|
| Phase ID | 0 |
| Phase Name | Product Constitution, Requirements, Architecture Foundation & Engineering Control System |
| Purpose | Establish the permanent foundation: constitution, requirements, architecture, domain map, security, AI, labs, community, institutions, commerce, dependency graph, roadmap, state-control system |
| Components | Documentation system, decision tracking, state control, 20-phase roadmap |
| Dependencies | None (starts here) |
| Inputs | Product vision, requirements, constraints |
| Outputs | Complete Phase 0 documentation, engineering control system |
| Risks | Incomplete documentation, unresolved decisions |
| Definition of COMPLETE | All Phase 0 documentation created, internally reconciled, consistent |
| Definition of VERIFIED | Documentation independently checked against Phase 0 acceptance criteria |
| Files Expected | docs/*, .gitignore, CONTROL/* |
| Test Requirements | Documentation consistency checks |
| Security Requirements | None (documentation only) |
| Handoff to Next Phase | Phase 1 cannot begin until Phase 0 is COMPLETE |
| Status | **COMPLETE-PENDING-REVIEW** (all 17 consistency checks passed; awaiting human approval for COMPLETE) |

---

## PHASE 1: PRESENTATION FOUNDATION

| Field | Value |
|-------|-------|
| Phase ID | 1 |
| Phase Name | Presentation Foundation |
| Purpose | Establish the presentation layer: app shell, routing, layout, design tokens, reusable UI primitives, accessibility foundation |
| Components | React app, routing, layout system, design tokens, typography, responsive system, UI primitives (buttons, cards, inputs, modals, panels, tables), loading/error/empty states, navigation, notifications |
| Dependencies | Phase 0 COMPLETE, ATD-0009 (testing framework), ATD-0010 (deployment platform) |
| Inputs | Phase 0 architecture docs, design decisions |
| Outputs | Working React app with complete UI component system |
| Risks | Testing framework decision delayed, deployment platform decision delayed |
| Definition of COMPLETE | All planned UI components implemented, routing works, layout responsive, accessibility passes, component tests pass |
| Definition of VERIFIED | Components render correctly, routing navigates correctly, responsive design works, accessibility audit passes, tests pass |
| Files Expected | apps/web/*, packages/shared/*, package.json, tsconfig.json, vite.config.ts, tailwind.config.ts |
| Test Requirements | Unit tests for components, accessibility tests, visual regression tests |
| Security Requirements | Basic CSP headers, XSS prevention |
| Handoff to Next Phase | Phase 2 depends on Phase 1 |
| Status | **NOT STARTED** |

---

## PHASE 2: IDENTITY & ACCESS + LEARNING FOUNDATION

| Field | Value |
|-------|-------|
| Phase ID | 2 |
| Phase Name | Identity & Access + Learning Foundation |
| Purpose | Establish authentication, authorization, learner profiles, topic/lesson model, and mandatory difficulty interaction |
| Components | Authentication system, role model, learner profiles, topics, lessons, learning sessions, learner concerns, difficulty identification, mandatory first-3-lessons interaction, learner dashboard, topic/lesson experience |
| Dependencies | Phase 1 COMPLETE, ATD-0011 (auth provider) |
| Inputs | Phase 0 security architecture, domain architecture, confirmed requirements |
| Outputs | Working auth system, learner profiles, learning session model, difficulty interaction |
| Risks | Auth provider decision delayed, complex difficulty interaction UX |
| Definition of COMPLETE | Auth works, roles enforced, learner profiles created, topics/lessons accessible, difficulty interaction works for first 3 lessons |
| Definition of VERIFIED | Auth flows tested, role access verified, learner isolation confirmed, difficulty interaction tested |
| Files Expected | packages/domain/identity/*, packages/domain/learning/*, packages/api/src/routes/auth/*, apps/web/src/pages/auth/*, apps/web/src/pages/learner/* |
| Test Requirements | Auth integration tests, role access tests, learner isolation tests, difficulty interaction tests |
| Security Requirements | Auth security, session management, role enforcement, learner data isolation |
| Handoff to Next Phase | Phase 3 and Phase 4 depend on Phase 2 |
| Status | **NOT STARTED** |

---

## PHASE 3: WHITEBOARD + EVIDENCE + NOTES

| Field | Value |
|-------|-------|
| Phase ID | 3 |
| Phase Name | Whiteboard, Evidence & Notes |
| Purpose | Implement the whiteboard as a first-class learning surface, evidence preservation, and notes |
| Components | Whiteboard canvas, drawing tools, text tools, shape tools, undo/redo, PDF export, evidence model, evidence storage, voice recording, video recording (basic), notes, evidence library |
| Dependencies | Phase 1 COMPLETE, Phase 2 COMPLETE |
| Inputs | Phase 0 whiteboard requirement, evidence architecture, confirmed requirements |
| Outputs | Working whiteboard, PDF export, evidence storage, notes |
| Risks | Whiteboard performance, PDF generation complexity, recording browser compatibility |
| Definition of COMPLETE | Whiteboard renders, tools work, PDF exports, evidence saves, notes work |
| Definition of VERIFIED | Whiteboard interactions tested, PDF output verified, evidence persistence confirmed, notes CRUD tested |
| Files Expected | apps/web/src/components/whiteboard/*, packages/domain/evidence/*, packages/domain/notes/*, apps/web/src/pages/evidence/* |
| Test Requirements | Whiteboard tool tests, PDF export tests, evidence storage tests, notes tests |
| Security Requirements | Evidence access control, file upload validation, storage security |
| Handoff to Next Phase | Phase 4 depends on Phase 3 |
| Status | **NOT STARTED** |

---

## PHASE 4: TUTORING + SESSIONS + NOTIFICATIONS

| Field | Value |
|-------|-------|
| Phase ID | 4 |
| Phase Name | Tutoring, Sessions & Notifications |
| Purpose | Implement tutor model, session management, real-time sessions, and notifications |
| Components | Tutor profiles, tutor sessions, preparation reports, session management, real-time sessions (WebSocket), shared whiteboard in sessions, session recording, notifications |
| Dependencies | Phase 2 COMPLETE, Phase 3 COMPLETE |
| Inputs | Phase 0 tutoring architecture, session architecture |
| Outputs | Working tutor model, session management, real-time collaboration, notifications |
| Risks | Real-time sync complexity, WebSocket reliability |
| Definition of COMPLETE | Tutor profiles work, sessions create/join/complete, real-time sync works, notifications deliver |
| Definition of VERIFIED | Tutor session flow tested, real-time sync verified, notification delivery confirmed |
| Files Expected | packages/domain/tutoring/*, packages/domain/session/*, packages/api/src/routes/tutor/*, apps/web/src/pages/tutor/*, packages/domain/communication/* |
| Test Requirements | Tutor session tests, real-time sync tests, notification tests |
| Security Requirements | Session authorization, tutor access control, notification privacy |
| Handoff to Next Phase | Phase 5 depends on Phase 4 |
| Status | **NOT STARTED** |

---

## PHASE 5: AI GATEWAY + AI FEATURES

| Field | Value |
|-------|-------|
| Phase ID | 5 |
| Phase Name | AI Gateway & AI Features |
| Purpose | Implement centralized AI Gateway and AI-assisted learning features |
| Components | AI Gateway, model router, provider adapters, safety filtering, structured output validation, retry/timeout, cost controls, AI chat, AI learning guidance, AI-assisted difficulty probing |
| Dependencies | Phase 2 COMPLETE, Phase 4 COMPLETE |
| Inputs | Phase 0 AI architecture, AI principles |
| Outputs | Working AI Gateway, AI chat, AI learning guidance |
| Risks | AI provider costs, AI output quality, safety filtering accuracy |
| Definition of COMPLETE | AI Gateway routes requests, providers work, safety filters active, AI chat functions, cost tracking works |
| Definition of VERIFIED | AI routing tested, safety filters verified, cost controls confirmed, AI output validated |
| Files Expected | packages/ai-gateway/*, packages/domain/ai/*, apps/web/src/components/ai/*, apps/web/src/pages/ai/* |
| Test Requirements | AI Gateway unit tests, provider adapter tests, safety filter tests, cost tracking tests |
| Security Requirements | AI data boundary, provider authentication, output validation, cost limits |
| Handoff to Next Phase | Phase 6 and Phase 7 depend on Phase 5 |
| Status | **NOT STARTED** |

---

## PHASE 6: EXTERNAL SIMULATIONS

| Field | Value |
|-------|-------|
| Phase ID | 6 |
| Phase Name | External Simulations |
| Purpose | Integrate external simulations (PhET, etc.) with proper attribution |
| Components | External simulation browser, PhET embedding, attribution system, simulation context linking |
| Dependencies | Phase 3 COMPLETE, Phase 5 COMPLETE |
| Inputs | Phase 0 simulation architecture, external simulation constraints |
| Outputs | Working simulation browser, PhET integration, attribution |
| Risks | PhET API limitations, attribution compliance |
| Definition of COMPLETE | Simulations browse, embed, attribute correctly, context links work |
| Definition of VERIFIED | PhET embedding tested, attribution verified, context linking confirmed |
| Files Expected | packages/domain/simulations/*, apps/web/src/components/simulation/*, apps/web/src/pages/simulation/* |
| Test Requirements | Simulation embedding tests, attribution tests |
| Security Requirements | External content sandboxing, iframe security |
| Handoff to Next Phase | Phase 12 depends on Phase 6 |
| Status | **NOT STARTED** |

---

## PHASE 7: VIRTUAL LABS

| Field | Value |
|-------|-------|
| Phase ID | 7 |
| Phase Name | Virtual Labs |
| Purpose | Implement virtual laboratory system with AI-generated scenarios |
| Components | Lab specification model, lab runtime, AI lab generation, Three.js rendering, basic STEM labs, lab controls, lab persistence, lab evidence capture |
| Dependencies | Phase 5 COMPLETE, Phase 3 COMPLETE |
| Inputs | Phase 0 virtual lab architecture |
| Outputs | Working virtual labs (3-5 STEM types), lab generation, lab persistence |
| Risks | Lab rendering complexity, AI generation quality, sandbox security |
| Definition of COMPLETE | Labs generate, render, interact, save, produce evidence |
| Definition of VERIFIED | Lab generation tested, rendering verified, interaction confirmed, persistence tested |
| Files Expected | packages/lab-runtime/*, packages/domain/lab/*, apps/web/src/components/lab/*, apps/web/src/pages/lab/* |
| Test Requirements | Lab generation tests, rendering tests, interaction tests, persistence tests |
| Security Requirements | Sandbox execution, resource limits, AI generation validation |
| Handoff to Next Phase | Phase 8, Phase 12 depend on Phase 7 |
| Status | **NOT STARTED** |

---

## PHASE 8: INSTITUTIONS

| Field | Value |
|-------|-------|
| Phase ID | 8 |
| Phase Name | Institutions |
| Purpose | Implement institution accounts, class management, and link distribution |
| Components | Institution accounts, class management, session creation, link generation, institution-link learners, institution reports |
| Dependencies | Phase 2 COMPLETE, Phase 3 COMPLETE, Phase 4 COMPLETE |
| Inputs | Phase 0 institution architecture |
| Outputs | Working institution portal, class management, link distribution |
| Risks | Institution-link identity model complexity |
| Definition of COMPLETE | Institution accounts work, classes create, links generate and work, institution-link learners participate |
| Definition of VERIFIED | Institution flow tested, link security verified, institution reports confirmed |
| Files Expected | packages/domain/institution/*, packages/api/src/routes/institution/*, apps/web/src/pages/institution/* |
| Test Requirements | Institution flow tests, link security tests, report tests |
| Security Requirements | Institution data isolation, link token security, institution-link learner identification |
| Handoff to Next Phase | Phase 9 depends on Phase 8 |
| Status | **NOT STARTED** |

---

## PHASE 9: COMMERCE + ENTITLEMENTS + REPORTS + PARENTS

| Field | Value |
|-------|-------|
| Phase ID | 9 |
| Phase Name | Commerce, Entitlements, Reports & Parents |
| Purpose | Implement plans, subscriptions, payments, entitlements, reporting, and parent experience |
| Components | Plan structure, subscriptions, payment processing, entitlements, usage tracking, learner reports, tutor reports, institution reports, parent dashboard |
| Dependencies | Phase 2 COMPLETE, Phase 8 COMPLETE |
| Inputs | Phase 0 commerce architecture, security architecture |
| Outputs | Working subscription system, payment processing, entitlements, reports, parent view |
| Risks | Payment security, entitlement accuracy, financial audit |
| Definition of COMPLETE | Plans subscribe, payments process, entitlements enforce, reports generate, parent view works |
| Definition of VERIFIED | Payment flow tested, entitlement enforcement verified, report accuracy confirmed, parent access validated |
| Files Expected | packages/domain/commerce/*, packages/domain/entitlements/*, packages/domain/reporting/*, apps/web/src/pages/billing/*, apps/web/src/pages/reports/*, apps/web/src/pages/parent/* |
| Test Requirements | Payment integration tests, entitlement tests, report tests, parent access tests |
| Security Requirements | Payment security (PCI), financial audit, entitlement server-authoritative, parent access control |
| Handoff to Next Phase | Phase 10 depends on Phase 9 |
| Status | **NOT STARTED** |

---

## PHASE 10: ADMIN PORTAL + OPERATIONS

| Field | Value |
|-------|-------|
| Phase ID | 10 |
| Phase Name | Admin Portal & Operations |
| Purpose | Implement admin dashboard, user management, content moderation, system health, audit logging |
| Components | Admin dashboard, user management, content moderation tools, system health monitoring, audit logging, operations tooling |
| Dependencies | Phase 9 COMPLETE |
| Inputs | Phase 0 security architecture, operations architecture |
| Outputs | Working admin portal, moderation tools, health monitoring |
| Risks | Admin security, audit completeness |
| Definition of COMPLETE | Admin dashboard works, users manage, moderation works, health monitoring active |
| Definition of VERIFIED | Admin access controls tested, moderation flow verified, audit logging confirmed |
| Files Expected | packages/api/src/routes/admin/*, apps/web/src/pages/admin/*, packages/domain/operations/* |
| Test Requirements | Admin access tests, moderation tests, audit tests |
| Security Requirements | Admin role enforcement, audit logging, data access controls |
| Handoff to Next Phase | Phase 11 depends on Phase 10 |
| Status | **NOT STARTED** |

---

## PHASE 11: COMMUNITY FOUNDATION

| Field | Value |
|-------|-------|
| Phase ID | 11 |
| Phase Name | Community Foundation |
| Purpose | Implement forums, basic groups, moderation, user reporting, abuse prevention |
| Components | Forums, threads, posts, basic groups, moderation queue, user reporting, content filtering |
| Dependencies | Phase 10 COMPLETE, Phase 2 COMPLETE |
| Inputs | Phase 0 community architecture |
| Outputs | Working forums, basic groups, moderation tools |
| Risks | Community abuse, moderation scale |
| Definition of COMPLETE | Forums work, groups create, moderation functions, reports process |
| Definition of VERIFIED | Forum flow tested, group access verified, moderation tested, abuse prevention confirmed |
| Files Expected | packages/domain/community/*, apps/web/src/pages/community/*, apps/web/src/components/community/* |
| Test Requirements | Forum tests, group tests, moderation tests |
| Security Requirements | Content moderation, abuse prevention, access control |
| Handoff to Next Phase | Phase 12 depends on Phase 11 |
| Status | **NOT STARTED** |

---

## PHASE 12: ADVANCED LEARNING + COMMUNITY

| Field | Value |
|-------|-------|
| Phase ID | 12 |
| Phase Name | Advanced Learning & Community |
| Purpose | Implement advanced assessment, mastery engine, advanced labs, real-time discussions, advanced groups |
| Components | Advanced assessment methods, mastery tracking, advanced lab types, real-time discussions, advanced group features |
| Dependencies | Phase 11 COMPLETE, Phase 5 COMPLETE, Phase 7 COMPLETE |
| Inputs | Phase 0 assessment architecture, learning architecture |
| Outputs | Working assessment system, mastery engine, advanced labs, discussions |
| Risks | Assessment architecture complexity, mastery definition |
| Definition of COMPLETE | Assessment works, mastery tracks, advanced labs function, discussions work |
| Definition of VERIFIED | Assessment accuracy verified, mastery logic confirmed, lab quality tested |
| Files Expected | packages/domain/assessment/*, apps/web/src/pages/assessment/*, apps/web/src/components/advanced-lab/* |
| Test Requirements | Assessment tests, mastery tests, advanced lab tests |
| Security Requirements | Assessment integrity, mastery data accuracy |
| Handoff to Next Phase | Phase 13 depends on Phase 12 |
| Status | **NOT STARTED** |

---

## PHASE 13: ADVANCED FEATURES

| Field | Value |
|-------|-------|
| Phase ID | 13 |
| Phase Name | Advanced Features |
| Purpose | Implement resource sharing, peer help, institution LMS integration, advanced commerce, advanced reporting |
| Components | Resource sharing system, peer help matching, LMS integration, advanced billing, advanced reports |
| Dependencies | Phase 12 COMPLETE |
| Inputs | Phase 0 architecture, community architecture |
| Outputs | Working resource sharing, peer help, LMS integration, advanced commerce |
| Risks | LMS integration complexity, peer help quality |
| Definition of COMPLETE | Resources share, peer help matches, LMS integrates, advanced commerce works |
| Definition of VERIFIED | Sharing tested, peer help verified, LMS integration confirmed |
| Files Expected | packages/domain/community/*, packages/domain/institution/*, packages/domain/commerce/* |
| Test Requirements | Sharing tests, peer help tests, LMS tests, commerce tests |
| Security Requirements | Resource sharing safety, LMS auth, advanced payment security |
| Handoff to Next Phase | Phase 14 depends on Phase 13 |
| Status | **NOT STARTED** |

---

## PHASE 14: OPTIMIZATION + SCALE

| Field | Value |
|-------|-------|
| Phase ID | 14 |
| Phase Name | Optimization & Scale |
| Purpose | Performance optimization, caching, CDN, advanced analytics |
| Components | Performance optimization, caching strategy, CDN setup, analytics dashboard, advanced metrics |
| Dependencies | Phase 13 COMPLETE |
| Inputs | Phase 0 operations architecture |
| Outputs | Optimized performance, caching, analytics |
| Risks | Optimization complexity, cache invalidation |
| Definition of COMPLETE | Performance meets targets, caching works, analytics active |
| Definition of VERIFIED | Performance benchmarks met, cache behavior verified, analytics accuracy confirmed |
| Files Expected | packages/shared/performance/*, packages/domain/operations/* |
| Test Requirements | Performance tests, cache tests, analytics tests |
| Security Requirements | Cache security, analytics privacy |
| Handoff to Next Phase | Phase 15, 16, 17 depend on Phase 14 |
| Status | **NOT STARTED** |

---

## PHASE 15: ADVANCED COMMUNITY

| Field | Value |
|-------|-------|
| Phase ID | 15 |
| Phase Name | Advanced Community |
| Purpose | Community-driven content, reputation system, advanced moderation |
| Components | Content approval workflow, reputation system, advanced moderation tools, community analytics |
| Dependencies | Phase 14 COMPLETE |
| Inputs | Phase 0 community architecture |
| Outputs | Working reputation system, advanced moderation, community analytics |
| Risks | Reputation gaming, moderation scale |
| Definition of COMPLETE | Reputation tracks, moderation scales, community analytics work |
| Definition of VERIFIED | Reputation logic verified, moderation effectiveness confirmed |
| Files Expected | packages/domain/community/*, apps/web/src/pages/community/* |
| Test Requirements | Reputation tests, moderation tests |
| Security Requirements | Reputation manipulation prevention, content safety |
| Handoff to Next Phase | Phase 18 depends on Phase 15 |
| Status | **NOT STARTED** |

---

## PHASE 16: MOBILE + CROSS-PLATFORM

| Field | Value |
|-------|-------|
| Phase ID | 16 |
| Phase Name | Mobile & Cross-Platform |
| Purpose | Mobile optimization, PWA, offline support |
| Components | Mobile responsive optimization, PWA manifest, service worker, offline support |
| Dependencies | Phase 14 COMPLETE |
| Inputs | Phase 0 architecture |
| Outputs | Optimized mobile experience, PWA, offline capability |
| Risks | Offline data sync, mobile performance |
| Definition of COMPLETE | Mobile experience works, PWA installs, offline basic functions work |
| Definition of VERIFIED | Mobile testing passes, PWA audit passes, offline behavior verified |
| Files Expected | apps/web/public/manifest.json, apps/web/src/service-worker/* |
| Test Requirements | Mobile tests, PWA tests, offline tests |
| Security Requirements | Offline data security, service worker security |
| Handoff to Next Phase | Phase 18 depends on Phase 16 |
| Status | **NOT STARTED** |

---

## PHASE 17: ADVANCED AI

| Field | Value |
|-------|-------|
| Phase ID | 17 |
| Phase Name | Advanced AI |
| Purpose | Advanced AI tutoring, AI content review, AI analytics, cost optimization |
| Components | Advanced AI tutoring flows, AI content approval workflow, AI analytics dashboard, AI cost optimization |
| Dependencies | Phase 14 COMPLETE |
| Inputs | Phase 0 AI architecture |
| Outputs | Advanced AI features, AI analytics, cost optimization |
| Risks | AI cost escalation, AI quality consistency |
| Definition of COMPLETE | Advanced AI tutoring works, content review works, analytics active, costs optimized |
| Definition of VERIFIED | AI quality verified, cost controls confirmed, analytics accuracy tested |
| Files Expected | packages/ai-gateway/*, packages/domain/ai/* |
| Test Requirements | AI quality tests, cost control tests, analytics tests |
| Security Requirements | AI safety, content approval security |
| Handoff to Next Phase | Phase 18 depends on Phase 17 |
| Status | **NOT STARTED** |

---

## PHASE 18: ENTERPRISE + SCALE

| Field | Value |
|-------|-------|
| Phase ID | 18 |
| Phase Name | Enterprise & Scale |
| Purpose | Enterprise features, advanced institution tools, multi-region, advanced security |
| Components | Enterprise features, advanced institution tools, multi-region support, advanced security |
| Dependencies | Phase 16 COMPLETE, Phase 17 COMPLETE |
| Inputs | Phase 0 architecture |
| Outputs | Enterprise-ready platform |
| Risks | Enterprise requirements complexity, multi-region consistency |
| Definition of COMPLETE | Enterprise features work, institutions scale, multi-region functions |
| Definition of VERIFIED | Enterprise testing passes, scale testing passes, security audit passes |
| Files Expected | packages/domain/institution/*, packages/domain/commerce/*, infrastructure/* |
| Test Requirements | Enterprise tests, scale tests, security audit |
| Security Requirements | Enterprise security, multi-region security, advanced audit |
| Handoff to Next Phase | Phase 19 depends on Phase 18 |
| Status | **NOT STARTED** |

---

## PHASE 19: PRODUCTION HARDENING

| Field | Value |
|-------|-------|
| Phase ID | 19 |
| Phase Name | Production Hardening |
| Purpose | Production monitoring, disaster recovery, performance baseline, security audit, launch preparation |
| Components | Production monitoring, disaster recovery, performance baseline, security audit, launch checklist |
| Dependencies | Phase 18 COMPLETE |
| Inputs | All previous phases |
| Outputs | Production-ready platform |
| Risks | Undiscovered production issues |
| Definition of COMPLETE | All monitoring active, DR tested, performance baseline set, security audit passed |
| Definition of VERIFIED | Production evidence confirms all behaviors, monitoring confirms health |
| Files Expected | infrastructure/*, monitoring/*, docs/production/* |
| Test Requirements | Production smoke tests, load tests, security audit, DR tests |
| Security Requirements | Full security audit, penetration testing, compliance verification |
| Handoff to Next Phase | Platform launch ready |
| Status | **NOT STARTED** |

---

## PHASE STATUS SUMMARY

| Phase | Name | Status |
|-------|------|--------|
| 0 | Product Constitution + Engineering Foundation | **COMPLETE-PENDING-REVIEW** |
| 1 | Presentation Foundation | NOT STARTED |
| 2 | Identity & Access + Learning Foundation | NOT STARTED |
| 3 | Whiteboard + Evidence + Notes | NOT STARTED |
| 4 | Tutoring + Sessions + Notifications | NOT STARTED |
| 5 | AI Gateway + AI Features | NOT STARTED |
| 6 | External Simulations | NOT STARTED |
| 7 | Virtual Labs | NOT STARTED |
| 8 | Institutions | NOT STARTED |
| 9 | Commerce + Entitlements + Reports + Parents | NOT STARTED |
| 10 | Admin Portal + Operations | NOT STARTED |
| 11 | Community Foundation | NOT STARTED |
| 12 | Advanced Learning + Community | NOT STARTED |
| 13 | Advanced Features | NOT STARTED |
| 14 | Optimization + Scale | NOT STARTED |
| 15 | Advanced Community | NOT STARTED |
| 16 | Mobile + Cross-Platform | NOT STARTED |
| 17 | Advanced AI | NOT STARTED |
| 18 | Enterprise + Scale | NOT STARTED |
| 19 | Production Hardening | NOT STARTED |
