# Architectural Reconciliation Report (reconstructed)

> **Type:** Read-only audit — no files modified.
> **Scope:** Reconcile the post-refactor Application Layer against the layered architecture rule; record the composition root, remaining dead surface, and the inventory of the uncommitted change set.
> **Note:** This report reconstructs a prior-session reconciliation from verified in-repo evidence.

## 1. Objective

Confirm the Application Layer refactor satisfies the layer rule and record a durable "first small architectural reconciliation task" for tracking.

## 2. The layer rule (enforced convention)

```
Presentation → Application → Domain ports → Infrastructure
```

- **Presentation** depends on Application (server functions / use cases). Never on Infrastructure directly.
- **Application** implements use cases; depends only on Domain **ports** and Application contracts. It must NOT import `@/infrastructure/*`, `@/lib/*`, `process.env`, or provider SDKs.
- **Domain** holds ports/types only; must not depend on anything outside itself.

## 3. Verified dependency cleanliness

Recursive scan of `src/application` and `src/domain` for `@/infrastructure/`, `@/lib/`, `process.env`, and provider SDKs (`@supabase/supabase-js`, `openai`, `groq-sdk`, `@google/generative-ai`):

**Result: ZERO matches — layer rule clean.**

(The Application `contracts/ai.ts` and `admin/ai-keys.ts` contain the literal strings `"groq"`/`"openai"` — provider-name tokens in local type unions and model identifiers — not imports. `Domain` also uses `"groq"` as a string-literal type; none are module imports or env access.)

## 4. Composition root

- **Contract:** `AppDependencies` (`src/application/contracts/dependencies.ts`).
- **Composition root (Infrastructure):** `buildAppDependencies(supabase, _userId)` and `buildPublicDependencies()` in `src/infrastructure/di/index.ts`.
  - `buildAppDependencies` wires all Supabase repositories + `aiGateway`, `emailService`, `paymentGateway`, and `supabaseEntitlementGateway(supabase)`. The Application layer only ever sees the interfaces.
  - `buildPublicDependencies` returns a `Proxy` over a public-safe subset; any unauthorized capability access **fails closed** (throws) — no auth-scoped client leaks to public endpoints.
- **Middleware wiring:** `requireAppDependencies` / `requirePublicDependencies` in `src/integrations/auth/app-dependencies.ts`, chaining `requireSupabaseAuth` and exposing `context.deps`.

## 5. Serializability constraint (context)

TanStack server functions require returns to be JSON-serializable. During the refactor, `unknown`/index-signature row types were rejected by the serialization validator, which is why `JsonValue` was introduced at `src/domain/ports/json.ts` and applied to repo row types (`note-repository`, `simulation-repository`, `admin-repository`, `classroom-repository`). This is architectural context worth preserving.

## 6. Dead surface

- **`_userId` parameter** in `buildAppDependencies(..., _userId)` (`src/infrastructure/di/index.ts:38`): accepted but never read. Repositories derive identity from the auth-scoped Supabase client. `requireAppDependencies` passes `context.userId` in but it is unused. Candidate for removal or explicit deprecation.

## 7. Inventory of the uncommitted change set (refactor large diff)

`git status` (non-exhaustive, representative):

- **Deleted (legacy):** `src/components/**` — `Classroom*`, `Navbar`, `MathTools`, `ThreeDLab`, `WebGLLab`, `LorddaLab`, `admin/AiKeyManager`, `admin/AiProviderSelect`, `admin/ConfigToggle`, `dashboard/*`, `ai/*`, etc. (moved to layered locations).
- **Added/moved:**
  - `src/application/**` — contracts, services, use-cases (`ai`, `simulation`, `whiteboard`, `identity`, `admin`, …).
  - `src/domain/**` — ports + `json.ts`.
  - `src/presentation/**` — `domains/` and `capabilities/`.
  - `src/integrations/**` — `auth/app-dependencies.ts`, `supabase/auth-middleware.ts`, `supabase/client.server.ts`.
- **`src/lib/**`** — re-export shims restore former import sites onto the new layered modules.
- Root metadata changes: `.prettierignore`, `bunfig.toml`, `components.json`, `eslint.config.js`, `package.json`, `public/manifest.json`.

## 8. Health checks (at time of reconciliation)

- `npx tsc --noEmit`: clean.
- `vite build` (Linux-written scripts; run with `NODE_OPTIONS`): pass.
- `bun test tests/`: 35 tests pass, 0 fail.
- Lint: only pre-existing repo-wide prettier issues; touched files were prettier-formatted.

## 9. First small reconciliation tasks (candidates)

1. Remove the dead `_userId` parameter from `buildAppDependencies` (or document it) — small, safe.
2. Persist this report set (AI Server Boundary, AI Quota Design, Architectural Reconciliation) for the audit record — this is that persistence.
3. Implement AI quota enforcement only after the product decision on "monthly" period semantics (see `AUDITS_AI_QUOTA_DESIGN.md`).
