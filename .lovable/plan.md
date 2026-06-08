## Scope

Only `src/routes/_authenticated/classroom.$roomId.tsx` and a new `src/components/classroom/*` folder change. Auth, routing, admin, payments, billing, AI-tutor route, /ai-tools, Jitsi `FloatingVideo`, `ClassroomFiles`, `NotesPanel`, `LorddaLab`, `WebGLLab` are untouched. The existing `src/components/Whiteboard.tsx` is left in place (used nowhere else after this change) but no longer imported from the classroom — safe to delete in a follow-up.

## Database (Phase 0)

One migration creates three tables + realtime:

- `whiteboards(id uuid pk, session_id uuid unique, created_at, updated_at)`
- `whiteboard_mutations(id uuid pk, whiteboard_id uuid fk cascade, user_id uuid, mutation_type text, mutation_payload jsonb, created_at)` — indexed on `(whiteboard_id, created_at)`
- `whiteboard_snapshots(id uuid pk, whiteboard_id uuid fk cascade, snapshot_data jsonb, created_at)` — indexed on `(whiteboard_id, created_at desc)`
- `classroom_chat(id uuid pk, room_id text, user_id uuid, display_name text, body text, created_at)` — indexed on `(room_id, created_at)`

Grants to `authenticated` + `service_role`. RLS: read/write only if `public.can_access_classroom_room(room_id)` (existing function) — `whiteboards.session_id` joins through `sessions.id`; mutations/snapshots check via parent whiteboard. `ALTER PUBLICATION supabase_realtime ADD TABLE whiteboard_mutations, classroom_chat`.

Helper RPC `public.ensure_whiteboard(_room_id text) returns uuid` (SECURITY DEFINER) creates/returns the whiteboard row for a session and is callable by any room participant.

## Frontend layout

Rewrite `classroom.$roomId.tsx` body into a CSS grid (desktop) / tabbed (mobile <1024px) layout:

```text
┌─ Top bar (existing controls, kept) ─────────────────────────┐
├──────┬──────────────────────────────────┬──────────────────┤
│ Left │ Center                            │ Right            │
│ Pres-│ tldraw canvas                     │ AI Assistant     │
│ ence │ (toggle: R3F physics overlay      │ (Student/Tutor   │
│ list │  occupies bottom 40%)             │  mode switch)    │
│      ├──────────────────────────────────┤                  │
│      │ Chat (collapsible bottom strip)   │                  │
└──────┴──────────────────────────────────┴──────────────────┘
```

Mobile keeps the existing `Tabs` shell with one consolidated "Workspace" tab containing the new grid stacked vertically.

## New components (under `src/components/classroom/`)

- `ClassroomWorkspace.tsx` — grid/layout orchestrator. Owns whiteboardId from `ensure_whiteboard` RPC, presence channel name, role.
- `TldrawBoard.tsx` — lazy (`React.lazy`) wrapper around tldraw. Wires `store.listen` → buffered insert into `whiteboard_mutations`; subscribes to `postgres_changes` on `whiteboard_mutations` filtered by `whiteboard_id` and applies remote changes with `mergeRemoteChanges`. Loads initial state from latest `whiteboard_snapshots` row, then replays mutations newer than the snapshot. Background snapshot every 60s if there were local changes.
- `PhysicsOverlay.tsx` — lazy R3F scene (`@react-three/fiber` + `@react-three/drei`). Reads two `x`/`y` slider values via props, renders a vector + projectile path. No text inputs, no DOM events forwarded to tldraw (pointer-events isolated container).
- `PresencePanel.tsx` — Supabase Realtime `presence` channel per room. Shows joined users + cursor color dot.
- `ChatPanel.tsx` — reads/writes `classroom_chat` for the room, subscribes to realtime, autoscroll, send-on-enter.
- `AiAssistantPanel.tsx` — role switcher (Student/Tutor, default by `isTutor||isAdmin`). Chat UI; calls a new `askClassroomAi` server fn. Tutor mode allows "Insert into board" button on assistant responses (text + equation become a tldraw text shape via an exposed `insertText` ref from `TldrawBoard`).

## Server function

`src/lib/classroom-ai.functions.ts`:

```ts
askClassroomAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    roomId: z.string().min(1).max(120),
    mode: z.enum(["student","tutor"]),
    messages: z.array(z.object({ role: z.enum(["user","assistant"]), content: z.string().max(8000) })).max(40),
  }).parse)
  .handler(async ({ data, context }) => {
    // verify membership via can_access_classroom_room
    // build system prompt: Student = Socratic hints, never final answers/full solutions
    //                     Tutor = full solutions, can produce quiz items
    // call Lovable AI gateway: google/gemini-3-flash-preview (generateText)
    // return { text, suggestions: [{ kind: "text"|"latex", value: string }] }
  });
```

Handles 429/402 by returning structured error the panel surfaces.

## Dependencies

```
bun add tldraw @react-three/fiber @react-three/drei three ai @ai-sdk/openai-compatible
bun add -D @types/three
```

`tldraw` bundles its own CSS (`tldraw/tldraw.css`) — imported lazily inside `TldrawBoard.tsx` to keep initial route load small.

## Performance / safety

- `React.lazy` + `Suspense` for `TldrawBoard` and `PhysicsOverlay`.
- All Supabase channels created in `useEffect` with explicit `removeChannel` cleanup; mutation writes are debounced (200ms batches) to avoid flooding.
- Snapshot job uses `setInterval` + `visibilitychange` to pause when tab hidden.
- AI request aborts via `AbortController` when panel unmounts or user sends new message.
- All new components are client-only; no server-fn calls from public-route loaders.

## Out of scope (won't touch)

Auth, `_authenticated/*` gate, admin routes, billing, payments, Jitsi config, existing tabs (Files/Notes/PhET/3D Lab), router/start setup, `Whiteboard.tsx` (kept dormant for one release in case rollback is needed).

## Acceptance

- `bun run build` passes cleanly.
- Two browsers in the same room see each other's tldraw shapes, cursors, presence, and chat in <500ms.
- Reload restores the board from snapshot + replay.
- Student-mode AI refuses to output final numeric answers; Tutor-mode does.
- R3F overlay only reacts to its own sliders; tldraw zoom/pan still works.
