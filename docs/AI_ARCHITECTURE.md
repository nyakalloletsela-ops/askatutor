# ASKATUTORLIVE — AI ARCHITECTURE

Work ID: AT-0000  
Phase: 0  
Status: CREATED  
Date: 2026-09-04

---

## 1. OVERVIEW

AI is a central component of AskATutorLive. All AI access goes through a centralized AI Gateway. AI is an assistant and guide — NOT the authority on learner understanding.

---

## 2. AI GATEWAY

The AI Gateway is the single entry point for all AI interactions.

```
┌─────────────────────────────────────────────┐
│                AI GATEWAY                    │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Model   │  │ Provider │  │  Safety  │ │
│  │  Router  │  │ Adapter  │  │  Filter  │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Entitle- │  │   Cost   │  │ Structured│ │
│  │  ment    │  │ Control  │  │  Output  │ │
│  │  Check   │  │          │  │ Validate │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Retry   │  │ Timeout  │  │ Logging  │ │
│  │ Handler  │  │ Manager  │  │ & Audit  │ │
│  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────┘
```

---

## 3. AI GATEWAY RESPONSIBILITIES

| Responsibility | Description |
|---------------|-------------|
| Model Selection | Choose appropriate model for the task |
| Provider Selection | Choose provider based on cost/availability |
| Entitlement Check | Verify user has AI access entitlement |
| Quota Enforcement | Track and enforce usage quotas |
| Safety Filtering | Filter unsafe/inappropriate responses |
| Structured Output Validation | Validate AI output against expected schema |
| Retry Logic | Handle transient failures with retries |
| Timeout Management | Enforce request timeouts |
| Logging | Log all AI interactions for audit |
| Cost Controls | Track token usage and costs |
| Fallback | Fallback to alternative model/provider |
| Observability | Metrics, health, alerts |

---

## 4. PROVIDER ADAPTERS

AI providers are accessed through a standardized adapter interface.

```
Port: AIProviderPort
  ├── OpenAIAdapter (GPT-4, GPT-3.5)
  ├── AnthropicAdapter (Claude)
  ├── GoogleAdapter (Gemini) — FUTURE
  ├── LocalAdapter (self-hosted) — FUTURE
  └── FutureAdapter (new providers)
```

Adding a new provider requires implementing the adapter interface. No changes to core AI Gateway logic.

---

## 5. AI USE CASES IN ASKATUTORLIVE

### 5.1 Learner Difficulty Probing

| Aspect | Detail |
|--------|--------|
| Purpose | Help identify the learner's actual difficulty |
| Input | Learner's initial concern statement |
| Output | Probing questions, difficulty suggestions |
| Constraint | Must NOT declare difficulty independently |
| Authority | Learner confirms, not AI |
| Phase | 2-5 |

### 5.2 Learning Guidance

| Aspect | Detail |
|--------|--------|
| Purpose | Guide learner through topic |
| Input | Current lesson, learner's progress, identified difficulties |
| Output | Explanations, hints, practice suggestions |
| Constraint | Must respect learner's pace |
| Authority | Learner controls flow |
| Phase | 5 |

### 5.3 Virtual Lab Generation

| Aspect | Detail |
|--------|--------|
| Purpose | Generate virtual lab scenarios |
| Input | Learner's requested scenario, topic context |
| Output | Lab specification, scenario definition |
| Constraint | Must stay within controlled lab architecture |
| Authority | Platform validates, learner interacts |
| Phase | 7 |

### 5.4 Tutor Briefing Generation

| Aspect | Detail |
|--------|--------|
| Purpose | Prepare tutor for learner session |
| Input | Learner's concern, identified difficulties, session history |
| Output | Structured briefing report |
| Constraint | Clearly mark AI-generated vs learner-stated |
| Authority | Tutor confirms/overrides |
| Phase | 4 |

### 5.5 Evidence Analysis

| Aspect | Detail |
|--------|--------|
| Purpose | Analyze learning evidence for insights |
| Input | Evidence records (whiteboard, notes, etc.) |
| Output | Analysis, suggestions |
| Constraint | Analysis is advisory, not authoritative |
| Authority | Tutor confirmation required for instructional decisions |
| Phase | 5 |

### 5.6 Content Generation

| Aspect | Detail |
|--------|--------|
| Purpose | Generate practice questions, explanations |
| Input | Topic, difficulty level, learner profile |
| Output | Generated content |
| Constraint | Must be reviewed before becoming reusable platform content |
| Authority | Approval required for reuse |
| Phase | 5 |

---

## 6. AI SAFETY RULES

### 6.1 Content Safety

- AI must not generate harmful, biased, or inappropriate content
- AI must not generate content that could cause psychological harm
- AI must not make clinical diagnoses or medical advice
- AI must not replace professional tutoring for critical learning needs

### 6.2 Learner Safety

- AI must not pressure learners
- AI must respect learner's emotional state
- AI must escalate to human tutor when appropriate
- AI must not create dependency — encourage learner autonomy

### 6.3 Data Safety

- AI must not access data outside the current session context
- AI must not store learner data beyond the session (unless permitted)
- AI interactions are logged for audit
- AI provider communication is encrypted

### 6.4 Content Integrity

- AI-generated content is distinguishable from human-created content
- AI interpretation is distinguishable from verified evidence
- AI suggestions are marked as suggestions, not facts
- AI-generated reusable content requires approval

---

## 7. AI OUTPUT STRUCTURE

AI responses follow structured output schemas:

```typescript
interface AIResponse {
  type: 'probe' | 'suggestion' | 'explanation' | 'lab_spec' | 'briefing' | 'analysis'
  content: string
  metadata: {
    model: string
    provider: string
    tokens: { input: number; output: number }
    cost: number
    confidence: number
    is_ai_generated: true
  }
  safety: {
    flagged: boolean
    flags: string[]
  }
}
```

---

## 8. AI COST CONTROL

| Control | Description |
|---------|-------------|
| Token Limits | Max tokens per request |
| Daily Limits | Max tokens per user per day |
| Monthly Budgets | Max cost per user per month |
| Model Selection | Cheaper models for simple tasks |
| Caching | Cache repeated queries |
| Fallback | Use cheaper model if budget exceeded |

---

## 9. AI OBSERVABILITY

| Metric | Description |
|--------|-------------|
| Request Count | Total AI requests |
| Response Time | Average response latency |
| Error Rate | Failed request percentage |
| Token Usage | Tokens consumed per request |
| Cost | Dollar cost per request/user/day |
| Safety Flags | Content safety violations |
| Provider Availability | Uptime per provider |

---

## 10. AI AUTHORITY BOUNDARY

This is the most critical architectural constraint:

```
AI DOES NOT:
  - Decide what the learner understands
  - Declare the learner's difficulty independently
  - Replace tutor judgment
  - Create verified evidence without human confirmation
  - Override learner's self-assessment
  - Make instructional decisions autonomously

AI DOES:
  - Ask questions
  - Probe for clarification
  - Suggest possible difficulties
  - Generate explanations
  - Create practice scenarios
  - Generate lab specifications
  - Prepare tutor briefings
  - Analyze evidence (advisory)
  - Provide guidance
```

The learner's own response is ALWAYS the primary starting evidence. Tutor confirmation is authoritative over AI interpretation where appropriate.
