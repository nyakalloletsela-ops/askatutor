## Goal

Stand up a **multi-agent AI layer** on Lovable AI Gateway (free for you — billed from workspace credits, no key needed) so every AI surface in the app renders **KaTeX equations** and **Mermaid/SVG diagrams** cleanly. Each role gets its own dedicated agent (system prompt + model + output contract), invoked from one shared client hook.

Note on Ollama: you confirmed Lovable AI Gateway instead. Ollama still requires a GPU host (RunPod/your VPS) — not free in practice. The gateway gives us Gemini 3 Flash + GPT-5 family without per-key setup, and we can swap to Ollama later behind the same agent interface.

---

## Architecture

```text
              ┌──────────────────────────────────────────┐
              │  src/lib/agents/  (server-only registry) │
              │  ─ math.agent.ts        (LaTeX solver)   │
              │  ─ diagram.agent.ts     (Mermaid/SVG)    │
              │  ─ tutor.agent.ts       (explainer)      │
              │  ─ whiteboard.agent.ts  (ink → shapes)   │
              │     each: { model, system, schema }      │
              └──────────────────────────────────────────┘
                              ▲
                              │ createServerFn / streaming route
              ┌──────────────────────────────────────────┐
              │  src/routes/api/agent.ts  (stream)       │
              │  src/lib/ai/run-agent.functions.ts (RPC) │
              └──────────────────────────────────────────┘
                              ▲
                              │ useAgent(role) hook
              ┌──────────────────────────────────────────┐
              │  Renderers (client)                      │
              │  ─ <SmartMarkdown/>  KaTeX + Mermaid +   │
              │                       code + tables      │
              │  ─ <DiagramBlock/>   mermaid → SVG       │
              │  ─ <EquationBlock/>  KaTeX               │
              └──────────────────────────────────────────┘
                              ▲
                              │ used by:
              Classroom chat • Assistant • Whiteboard convert
              • Lesson notes • Content library
```

### Agent contract (uniform output)

Every agent returns markdown with two extensions the renderer always knows how to parse:

- **Math** — `$inline$` and `$$block$$` (KaTeX)
- **Diagrams** — fenced ```` ```mermaid ```` blocks

This means *one renderer* covers chat bubbles, lesson notes, and whiteboard text shapes. The diagram agent additionally emits a `<DiagramSpec>` JSON block when the caller needs a raw spec (e.g. to drop onto the whiteboard canvas as an editable shape).

---

## Steps

1. **Install renderers** (client-only):
   `katex`, `react-katex`, `mermaid`, `remark-math`, `rehype-katex`, plus existing `react-markdown`.

2. **Create `<SmartMarkdown/>`** at `src/components/ai/SmartMarkdown.tsx`
   - `react-markdown` + `remark-math` + `rehype-katex` for equations
   - custom `code` renderer: when `lang === "mermaid"` → `<DiagramBlock spec={children}/>`, else syntax-highlighted code
   - safe-mode: sanitise, no raw HTML

3. **Create `<DiagramBlock/>`** at `src/components/ai/DiagramBlock.tsx`
   - lazy-loads `mermaid`, renders to SVG into a ref
   - error fallback: shows the raw spec + "retry" so a broken diagram never breaks the page
   - "Open in whiteboard" action emits the SVG to the active whiteboard handle

4. **Agent registry** at `src/lib/agents/registry.server.ts`
   - Each role: `{ id, label, model, system, temperature, postProcess? }`
   - Math → `google/gemini-2.5-pro` (strong reasoning, LaTeX-aware)
   - Diagram → `google/gemini-3-flash-preview` (fast, structured)
   - Tutor → `google/gemini-3-flash-preview` (conversational)
   - Whiteboard → existing `whiteboardConvert` re-pointed at this registry
   - Shared system-prompt preamble enforces the markdown/KaTeX/Mermaid contract

5. **Server endpoints**
   - `src/routes/api/agent.ts` — streaming `useChat` transport, takes `{ role, messages }`, picks agent from registry, calls `streamText` via the Lovable gateway helper
   - `src/lib/ai/run-agent.functions.ts` — `createServerFn` for one-shot calls (whiteboard convert, lesson-note generation) returning `{ markdown, diagrams[] }`

6. **Client hook** `src/hooks/use-agent.ts`
   - `useAgent("math" | "diagram" | "tutor")` → wraps AI SDK `useChat` pointed at `/api/agent` with the role baked in
   - `runAgentOnce(role, prompt)` → wraps the server-fn for non-chat callers

7. **Wire renderers everywhere**
   - **Classroom chat** (`ClassroomShell` chat panel) — replace plaintext bubbles with `<SmartMarkdown/>`, add a role switcher (Tutor / Math / Diagram)
   - **Assistant route** (if present, else add `src/routes/_authenticated/assistant.tsx`)
   - **Whiteboard convert** — pipe converter output through the diagram agent so handwriting like "x²+y²=r²" returns a KaTeX-rendered shape, and "flowchart of photosynthesis" returns a Mermaid diagram dropped on canvas
   - **Lesson notes / content library** — render note bodies with `<SmartMarkdown/>`; add "Ask AI" action that calls the tutor agent and inserts the response

8. **Error + cost handling**
   - 429 → toast "AI is busy, retrying" + exponential backoff
   - 402 → toast "Workspace AI credits exhausted" + link to billing
   - Mermaid parse error → inline retry, never throws

---

## Technical details

- All agents share the gateway helper from `src/lib/ai-gateway.server.ts` (per `connecting-to-ai-models-tanstack`). `LOVABLE_API_KEY` stays server-side.
- Streaming route returns `result.toUIMessageStreamResponse()` wrapped with `withLovableAiGatewayRunIdHeader` so run-ids propagate.
- `SmartMarkdown` is the single render path — no surface renders raw model text directly. This is the rule that guarantees LaTeX + diagrams "everywhere".
- KaTeX CSS imported once in `src/styles.css` via the @fontsource pattern? No — KaTeX ships its own CSS; import from `katex/dist/katex.min.css` in `src/main.tsx` (one-time).
- Mermaid initialised with `{ startOnLoad: false, theme: 'dark' | 'default' }` matching app theme.
- Adding Ollama later = add one entry to the registry with a custom `fetch` baseURL — no caller changes.

---

## Out of scope (this turn)

- Persisting agent chat history per user (will follow `chat-agent-ui-contract` later if you want threads)
- Voice/TTS agent
- Self-hosted Ollama wiring (kept as a future registry entry)
