# ASKATUTORLIVE — VIRTUAL LAB ARCHITECTURE

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

Virtual laboratories are AI-generated, controlled learning environments. The architecture must be sandboxed, limited, and extensible.

---

## 2. ARCHITECTURE PRINCIPLES

1. Labs are created within a **controlled architecture** — not arbitrary executable content
2. Initial implementation: **deliberately limited STEM scenarios**
3. Architecture must support **expansion** to non-STEM subjects
4. Labs are **sandboxed** with resource limits
5. Learner **consent** required for saving/sharing
6. External simulations are **not owned** by AskATutorLive
7. Lab generation goes through the **AI Gateway**

---

## 3. LAB ARCHITECTURE

```
┌─────────────────────────────────────────────────┐
│                 AI GATEWAY                       │
│  (Lab Scenario Generation)                       │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────┐
│              LAB SPECIFICATION                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Scenario │  │Component │  │  Rules   │     │
│  │ Def      │  │  Set     │  │  Engine  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────┐
│              LAB RUNTIME                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Execution │  │  State   │  │ Controls │     │
│  │ Engine   │  │ Manager  │  │  Panel   │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Sandbox  │  │ Physics/ │  │ Resource │     │
│  │          │  │ Domain   │  │ Monitor  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────┐
│              LAB PERSISTENCE                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Lab Spec │  │Execution │  │  Shared  │     │
│  │ Storage  │  │ History  │  │  Labs    │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
```

---

## 4. LAB COMPONENTS

### 4.1 Lab Specification

```typescript
interface LabSpec {
  id: string
  creator_id: string
  scenario: ScenarioDefinition
  component_set: PermittedComponents
  physics_rules: PhysicsRules
  domain_rules: DomainRules
  status: 'draft' | 'active' | 'saved' | 'shared'
  version: number
}
```

### 4.2 Scenario Definition

```typescript
interface ScenarioDefinition {
  name: string
  description: string
  subject: string // Initially STEM only
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  learning_objectives: string[]
  parameters: Record<string, any>
  constraints: string[]
}
```

### 4.3 Permitted Components

Each lab scenario has a defined set of permitted components:

| Category | Initial Components |
|----------|-------------------|
| Mechanics | Mass, Spring, Pulley, Incline, Force Vector |
| Thermodynamics | Temperature, Pressure, Volume, Heat Source |
| Circuits | Resistor, Capacitor, Battery, Wire, Switch |
| Optics | Lens, Mirror, Light Source, Screen |
| Chemistry | Molecule, Reaction, Catalyst, Solution |
| Math | Function Plot, Coordinate System, Data Points |

### 4.4 Simulation State

```typescript
interface SimulationState {
  timestamp: number
  variables: Record<string, number>
  objects: LabObject[]
  interactions: Interaction[]
  is_paused: boolean
}
```

---

## 5. EXECUTION BOUNDARY

### 5.1 What Labs CAN Do

- Render predefined component types
- Apply physics/domain rules
- Accept user inputs (slider, click, drag)
- Update simulation state
- Record interaction history
- Display results
- Save state snapshots

### 5.2 What Labs CANNOT Do

- Execute arbitrary code
- Access network resources
- Access file system
- Access other tabs/windows
- Run for unlimited time
- Use unlimited memory
- Generate external content

### 5.3 Sandboxing

- Labs run in a sandboxed iframe or Web Worker
- No access to parent page context
- Resource limits enforced (CPU, memory, time)
- Timeout after configurable duration
- Graceful shutdown on resource exhaustion

---

## 6. AI GENERATION BOUNDARY

The AI generates lab **specifications**, not executable code.

```
AI generates:
  → Scenario definition (parameters, rules, objectives)
  → Component selection (from permitted set)
  → Initial conditions
  → Suggested interactions

Platform renders:
  → Lab from specification
  → Uses predefined rendering components
  → Applies predefined physics/domain rules

AI does NOT:
  → Generate executable JavaScript
  → Create custom rendering code
  → Define new physics rules
  → Add new component types
```

---

## 7. LAB WORKFLOW

```
1. Learner requests scenario
2. AI Gateway routes to model
3. Model generates LabSpec
4. Platform validates LabSpec against permitted components
5. Platform renders lab from specification
6. Learner interacts with lab
7. Platform records interactions
8. Learner may save lab (with consent)
9. Saved lab may be shared (with consent + safety rules)
10. Lab interactions become evidence
```

---

## 8. LAB PERSISTENCE

| Storage Type | Description | Retention |
|-------------|-------------|-----------|
| Active Lab | Currently executing | Session only |
| Saved Lab | Learner-saved lab spec | Until deleted |
| Shared Lab | Community-shared lab | Subject to moderation |
| Lab Record | Execution history | Per evidence retention |
| Lab Template | Approved reusable lab | Permanent |

---

## 9. LAB SHARING

| Sharing Level | Description |
|--------------|-------------|
| Private | Only the learner |
| Tutor | Learner + assigned tutor |
| Group | Learning group members |
| Community | All platform users (subject to moderation) |
| Institution | Institution class members |

Sharing requires:
- Learner consent
- Safety review (for community sharing)
- Attribution to original creator
- Moderation approval (for public sharing)

---

## 10. EVIDENCE INTEGRATION

Lab interactions produce evidence:

| Evidence Type | Description |
|--------------|-------------|
| Lab Session Recording | Full interaction timeline |
| Lab Results | Final state and measurements |
| Lab Screenshots | Visual captures at key moments |
| Lab Reflection | Learner's reflection on lab experience |

---

## 11. INITIAL SCOPE (PHASE 7)

Phase 7 implements:

- Lab specification model
- Basic scenario generation (AI-generated specs)
- 3-5 predefined STEM lab types
- Basic rendering with Three.js
- Simple controls (sliders, buttons)
- State persistence
- Basic evidence capture
- Save functionality

Phase 7 does NOT implement:
- Community sharing
- Advanced physics
- Non-STEM labs
- Complex interactions
- Full moderation

---

## 12. FUTURE EXPANSION

| Expansion | Phase |
|-----------|-------|
| Additional STEM lab types | 7-8 |
| Non-STEM lab types | 12+ |
| Community lab sharing | 11 |
| Institution lab assignments | 8 |
| Advanced physics engine | 8+ |
| Collaborative labs | 12+ |
| Lab templates library | 10+ |
