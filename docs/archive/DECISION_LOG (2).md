# ASKATUTORLIVE — DECISION LOG

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

This log records all architectural and technical decisions. Decisions are tracked with their status: PROPOSED, ACCEPTED, REJECTED, or SUPERSEDED.

---

## 2. DECISIONS

### ATD-0001: Implementation Language

| Field | Value |
|-------|-------|
| Date | 2026-09-04 |
| Status | ACCEPTED |
| Question | What language should be used for implementation? |
| Options | 1. TypeScript, 2. JavaScript, 3. Python, 4. Other |
| Decision | TypeScript |
| Rationale | Full-stack type safety, strong ecosystem, React compatibility |
| Impact | All codebases, tooling, developer experience |

---

### ATD-0002: Frontend Framework

| Field | Value |
|-------|-------|
| Date | 2026-09-04 |
| Status | ACCEPTED |
| Question | What frontend framework should be used? |
| Options | 1. React, 2. Vue, 3. Svelte, 4. Angular |
| Decision | React |
| Rationale | Large ecosystem, strong TypeScript support, team familiarity |
| Impact | Frontend architecture, component system, state management |

---

### ATD-0003: Build Tool

| Field | Value |
|-------|-------|
| Date | 2026-09-04 |
| Status | ACCEPTED |
| Question | What build tool should be used? |
| Options | 1. Vite, 2. Webpack, 3. Turbopack |
| Decision | Vite |
| Rationale | Fast dev experience, good React support, simple configuration |
| Impact | Development workflow, build configuration |

---

### ATD-0004: Styling

| Field | Value |
|-------|-------|
| Date | 2026-09-04 |
| Status | ACCEPTED |
| Question | What styling approach should be used? |
| Options | 1. Tailwind CSS, 2. CSS Modules, 3. Styled Components, 4. Emotion |
| Decision | Tailwind CSS |
| Rationale | Utility-first, fast development, consistent design, good with React |
| Impact | Component styling, design system, visual consistency |

---

### ATD-0005: Database

| Field | Value |
|-------|-------|
| Date | 2026-09-04 |
| Status | ACCEPTED |
| Question | What database should be used? |
| Options | 1. PostgreSQL via Supabase, 2. PostgreSQL direct, 3. MongoDB, 4. Firebase |
| Decision | PostgreSQL via Supabase |
| Rationale | Relational integrity, Supabase provides auth/storage/realtime, good TypeScript support |
| Impact | Data layer, ORM choice, hosting |

---

### ATD-0006: 3D / Lab Rendering

| Field | Value |
|-------|-------|
| Date | 2026-09-04 |
| Status | ACCEPTED |
| Question | What technology for 3D virtual lab rendering? |
| Options | 1. Three.js, 2. Babylon.js, 3. Unity WebGL |
| Decision | Three.js |
| Rationale | Lightweight, good React integration (react-three-fiber), web-native |
| Impact | Virtual lab architecture, lab rendering |

---

### ATD-0007: Whiteboard Assessment Requirement

| Field | Value |
|-------|-------|
| Date | 2026-09-04 |
| Status | ACCEPTED |
| Question | Is the whiteboard assessment requirement confirmed? |
| Options | 1. CONFIRMED — learners must use whiteboard for assessments, 2. NOT CONFIRMED |
| Decision | CONFIRMED — learners must use whiteboard for assessments |
| Rationale | Explicitly stated in Product Constitution §5 |
| Impact | Whiteboard must be first-class, must support PDF export, must integrate with evidence |

---

### ATD-0008: Mandatory Initial Assessment

| Field | Value |
|-------|-------|
| Date | 2026-09-04 |
| Status | ACCEPTED |
| Question | Is the mandatory initial assessment requirement confirmed? |
| Options | 1. CONFIRMED — difficulty interaction mandatory for first 3 lessons, 2. NOT CONFIRMED |
| Decision | CONFIRMED — difficulty interaction mandatory for first 3 lessons |
| Rationale | Explicitly stated in Product Constitution §4 |
| Impact | Learning flow, presentation architecture, AI interaction |

---

### ATD-0009: Testing Framework

| Field | Value |
|-------|-------|
| Date | 2026-09-04 |
| Status | PROPOSED |
| Question | What testing framework should be used? |
| Options | 1. Vitest, 2. Jest, 3. Playwright (E2E), 4. Cypress |
| Recommendation | Vitest (unit/integration) + Playwright (E2E) |
| Decision | PENDING — requires decision before Phase 1 |
| Rationale | Vitest fast with Vite, Playwright good for E2E |
| Impact | Dev workflow, CI/CD, test infrastructure |

---

### ATD-0010: Deployment Platform

| Field | Value |
|-------|-------|
| Date | 2026-09-04 |
| Status | PROPOSED |
| Question | What deployment platform should be used? |
| Options | 1. Vercel, 2. Netlify, 3. AWS, 4. Railway, 5. Render |
| Recommendation | Vercel (frontend) + Railway or Supabase (backend) |
| Decision | PENDING — requires decision before Phase 1 |
| Rationale | Vercel excellent for React/Vite, Railway simple for Node.js |
| Impact | Infrastructure, CI/CD, hosting costs |

---

### ATD-0011: Authentication Provider

| Field | Value |
|-------|-------|
| Date | 2026-09-04 |
| Status | PROPOSED |
| Question | What authentication provider should be used? |
| Options | 1. Supabase Auth, 2. NextAuth.js, 3. Clerk, 4. Custom |
| Recommendation | Supabase Auth (integrated with Supabase database) |
| Decision | PENDING — requires decision before Phase 2 |
| Rationale | Already using Supabase, integrated auth reduces complexity |
| Impact | Auth flow, session management, role enforcement |

---

## 3. DECISION STATUS SUMMARY

| ID | Decision | Status |
|----|----------|--------|
| ATD-0001 | Implementation Language: TypeScript | ACCEPTED |
| ATD-0002 | Frontend Framework: React | ACCEPTED |
| ATD-0003 | Build Tool: Vite | ACCEPTED |
| ATD-0004 | Styling: Tailwind CSS | ACCEPTED |
| ATD-0005 | Database: PostgreSQL via Supabase | ACCEPTED |
| ATD-0006 | 3D Rendering: Three.js | ACCEPTED |
| ATD-0007 | Whiteboard Assessment: CONFIRMED | ACCEPTED |
| ATD-0008 | Mandatory Initial Assessment: CONFIRMED | ACCEPTED |
| ATD-0009 | Testing Framework | PROPOSED |
| ATD-0010 | Deployment Platform | PROPOSED |
| ATD-0011 | Authentication Provider | PROPOSED |
