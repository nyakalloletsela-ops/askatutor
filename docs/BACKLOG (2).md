# ASKATUTORLIVE — BACKLOG

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

This document tracks all remaining work items across all phases.

---

## 2. PHASE 0 — REMAINING

| ID | Work Item | Status | Priority |
|----|-----------|--------|----------|
| AT-0000 | Complete MASTER_PLAN.md | IN PROGRESS | HIGH |
| AT-0000 | Complete BACKLOG.md | IN PROGRESS | HIGH |
| AT-0000 | Complete CHANGE_LOG.md | IN PROGRESS | HIGH |
| AT-0000 | Cross-validate documentation | PENDING | HIGH |
| AT-0000 | Resolve ATD-0009 (Testing Framework) | PENDING | HIGH |
| AT-0000 | Resolve ATD-0010 (Deployment Platform) | PENDING | HIGH |
| AT-0000 | Resolve ATD-0011 (Auth Provider) | PENDING | HIGH |
| AT-0000 | Phase 0 completion review | PENDING | HIGH |

---

## 3. PHASE 1 — PRESENTATION FOUNDATION (NOT STARTED)

| ID | Work Item | Dependencies | Priority |
|----|-----------|-------------|----------|
| AT-0001 | Initialize project scaffolding (Vite + React + TS) | Phase 0, ATD-0009, ATD-0010 | HIGH |
| AT-0002 | Set up Tailwind CSS | AT-0001 | HIGH |
| AT-0003 | Create design tokens (colors, spacing, typography) | AT-0002 | HIGH |
| AT-0004 | Create typography system | AT-0003 | HIGH |
| AT-0005 | Create responsive breakpoint system | AT-0003 | HIGH |
| AT-0006 | Create layout components (Container, Grid, Stack) | AT-0003 | HIGH |
| AT-0007 | Create Button component | AT-0003 | HIGH |
| AT-0008 | Create Card component | AT-0003 | HIGH |
| AT-0009 | Create Input/FormField components | AT-0003 | HIGH |
| AT-0010 | Create Modal/Dialog system | AT-0003 | HIGH |
| AT-0011 | Create Panel components | AT-0003 | HIGH |
| AT-0012 | Create Table components | AT-0003 | MEDIUM |
| AT-0013 | Create loading state components | AT-0003 | HIGH |
| AT-0014 | Create error state components | AT-0003 | HIGH |
| AT-0015 | Create empty state components | AT-0003 | HIGH |
| AT-0016 | Create notification system | AT-0003 | MEDIUM |
| AT-0017 | Set up routing structure | AT-0001 | HIGH |
| AT-0018 | Create layout system (header, sidebar, content) | AT-0006 | HIGH |
| AT-0019 | Create navigation components | AT-0017 | HIGH |
| AT-0020 | Create accessibility foundation | AT-0003 | HIGH |
| AT-0021 | Create learner-facing visual language | AT-0003 | HIGH |
| AT-0022 | Create tutor-facing visual language | AT-0003 | MEDIUM |
| AT-0023 | Create admin visual foundations | AT-0003 | LOW |
| AT-0024 | Set up testing framework | ATD-0009 | HIGH |
| AT-0025 | Write component tests | AT-0024 | HIGH |
| AT-0026 | Set up CI/CD | ATD-0010 | HIGH |
| AT-0027 | Phase 1 documentation | AT-0001 | HIGH |

---

## 4. PHASE 2 — IDENTITY & ACCESS + LEARNING (NOT STARTED)

| ID | Work Item | Dependencies | Priority |
|----|-----------|-------------|----------|
| AT-0100 | Set up Supabase project | ATD-0011 | HIGH |
| AT-0101 | Implement authentication | AT-0100 | HIGH |
| AT-0102 | Implement role model | AT-0101 | HIGH |
| AT-0103 | Create learner profile model | AT-0102 | HIGH |
| AT-0104 | Create topic/lesson model | AT-0102 | HIGH |
| AT-0105 | Create learning session model | AT-0103, AT-0104 | HIGH |
| AT-0106 | Create learner concern model | AT-0105 | HIGH |
| AT-0107 | Create difficulty identification model | AT-0106 | HIGH |
| AT-0108 | Implement mandatory difficulty interaction (first 3 lessons) | AT-0107 | HIGH |
| AT-0109 | Create learner dashboard | AT-0103 | HIGH |
| AT-0110 | Create topic/lesson experience | AT-0104 | HIGH |

---

## 5. PHASE 3 — WHITEBOARD + EVIDENCE (NOT STARTED)

| ID | Work Item | Dependencies | Priority |
|----|-----------|-------------|----------|
| AT-0200 | Implement whiteboard canvas | Phase 1, Phase 2 | HIGH |
| AT-0201 | Implement whiteboard tools | AT-0200 | HIGH |
| AT-0202 | Implement PDF export | AT-0200 | HIGH |
| AT-0203 | Create evidence model | AT-0200 | HIGH |
| AT-0204 | Implement evidence storage | AT-0203 | HIGH |
| AT-0205 | Implement voice recording | AT-0203 | MEDIUM |
| AT-0206 | Implement video recording | AT-0203 | LOW |
| AT-0207 | Create notes feature | AT-0203 | MEDIUM |
| AT-0208 | Create evidence library | AT-0204 | HIGH |

---

## 6. PHASE 4-19

(See MASTER_PLAN.md for full phase breakdown)

---

## 7. BACKLOG RULES

1. Work items are ordered by phase and priority
2. Dependencies must be resolved before starting work
3. HIGH priority items are required for phase completion
4. MEDIUM priority items are recommended for phase completion
5. LOW priority items are nice-to-have
6. New work items are added to the appropriate phase
7. Completed work items are moved to CHANGE_LOG.md
