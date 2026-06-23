# AskATutorLive 3D AI Lab — MVP

A new feature inside the existing app (not a replacement). Lives at `/_authenticated/labs/3d-ai-lab`, gated by the existing `labs` feature scope via `<ScopeGate>`. Uses Lovable AI Gateway (no user API key) and Lovable Cloud (Supabase) for storage + pgvector memory.

## Scope of this pass (MVP)

Included:
- New route + page with three-pane layout (left prompt, center 3D viewport, right Library)
- Empty initial scene: dark bg, subtle grid, ambient light, no objects
- Prompt → embedding similarity check → load existing OR generate new schema via Lovable AI
- Strict JSON schema for simulations (subject, title, objects, rules, timeline)
- R3F renderer with object mapping (car, sphere, wall, particle, default cube)
- Simple physics loop: velocity, gravity, basic AABB collision, Newton 2nd law
- Controls: Play / Pause / Reset / time scrubber / OrbitControls / fullscreen
- Library: list, search (text + semantic), subject filter, click to load, thumbnail
- Canvas screenshot → upload to Storage → save thumbnail_url
- Universal subject fallback (abstract glowing shapes when subject unknown)
- Dark futuristic styling using existing design tokens

Out of scope (explicitly deferred):
- Versioning, remix, JSON import/export, duplicate button
- Advanced physics (rigid body engine, constraints, fluids)
- Multi-user shared simulations
- Mobile-optimized layout (desktop-first only this pass)

## Technical details

**Routes & gating**
- `src/routes/_authenticated/labs.3d-ai-lab.tsx` — new page, wrapped in `<ScopeGate scope="labs">`
- Add card/link from existing `/labs` page

**Dependencies**
- `three`, `@react-three/fiber`, `@react-three/drei` (bun add)

**Database (one migration)**
- Enable `vector` extension
- Create `public.simulations`:
  - `id uuid pk`, `user_id uuid → auth.users`, `prompt text`, `subject text`, `title text`, `schema_json jsonb`, `embedding vector(3072)`, `thumbnail_url text`, `created_at timestamptz`
  - GRANTs for `authenticated` + `service_role`; RLS: owner-only SELECT/INSERT/UPDATE/DELETE via `auth.uid() = user_id`
  - HNSW index on `embedding vector_cosine_ops`
- RPC `match_simulations(query_embedding, match_count, min_similarity)` — security definer, filters by `auth.uid()`
- New storage bucket `simulation-thumbnails` (public read, owner-write policy)

**Server functions** (`src/lib/sim-lab.functions.ts`, all `requireSupabaseAuth`)
- `embedPrompt({ text })` → calls Lovable AI Gateway `/v1/embeddings` with `google/gemini-embedding-001`, returns 3072-dim vector
- `findSimilarSimulation({ embedding })` → calls `match_simulations` RPC, returns top match + similarity
- `generateSimulationSchema({ prompt })` → calls Lovable AI `google/gemini-3-flash-preview` with strict system prompt + Zod-validated JSON output; fallback schema on parse failure
- `saveSimulation({ prompt, schema, embedding, thumbnailDataUrl })` → uploads thumbnail to storage, inserts row, returns saved record
- `listSimulations({ search?, subject? })` → semantic when search present (embed → RPC), else recent first

**Frontend modules**
- `src/components/lab3d/Scene.tsx` — Canvas, grid, lights, camera, OrbitControls
- `src/components/lab3d/SimRenderer.tsx` — maps `objects[]` → primitives via instanced meshes where repeated
- `src/components/lab3d/physics.ts` — pure functions: `stepNewton`, `stepCollision`, `stepGravity`, `stepFlow`; rule dispatch table
- `src/components/lab3d/useSimLoop.ts` — `useFrame` loop with play/pause/scrub, memoized rule handlers
- `src/components/lab3d/PromptPanel.tsx` — input + Generate + similar-match modal
- `src/components/lab3d/LibraryPanel.tsx` — list, search, filter, thumbnail grid
- `src/components/lab3d/Controls.tsx` — play/pause/reset/time slider/fullscreen
- `src/components/lab3d/captureThumbnail.ts` — `gl.domElement.toDataURL()` helper

**AI system prompt (one source of truth, in server fn)**
Forces JSON-only output matching the schema, auto-detects subject, no prose. Validated server-side with Zod; on failure, retry once with the validator error, then fall back to a minimal abstract schema (`{subject:"abstract", objects:[3 glowing spheres], rules:["flow_dynamics"]}`).

**Error handling**
- AI failure → fallback schema + toast
- Embedding failure → skip similarity check, proceed to generate
- DB failure on save → keep simulation in local state, toast "saved locally"
- Unknown rule → skipped in dispatch table

**Performance**
- `InstancedMesh` for ≥4 objects of same primitive type
- Physics state in refs, not React state, to avoid re-renders
- Library queries paginated to 50

## What the user sees

1. Visits `/labs/3d-ai-lab` (linked from `/labs`)
2. Empty dark 3D scene, prompt panel left, empty Library right
3. Types prompt → Generate
4. If similar simulation exists: modal "Load existing or generate new?"
5. New simulation renders, controls appear, auto-saves with thumbnail
6. Library updates instantly; click any item to reload

Ready to build on approval.
