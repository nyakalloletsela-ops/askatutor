# AI Server Boundary Audit (reconstructed)

> **Type:** Read-only audit — no files modified.
> **Scope:** Verify that the AI capability boundary is server-side enforced: authentication, entitlement gating, role sourcing, and provider-secret isolation from the client bundle.
> **Note:** This report reconstructs a prior-session audit from verified in-repo evidence following the Application Layer refactor.

## 1. Executive summary

The AI server boundary is **sound**. Every billable AI capability goes through an authenticated server function, a single shared entitlement gate (`assertAiEntitlement`), and an infrastructure `AiGateway` seam. Roles are resolved server-side and never accepted from the client. The built `dist/client` bundle contains **no** server code, `service_role` usage, or provider API-key values — only benign UI label hints.

Two non-blocking findings remain: **MEDIUM** — no AI per-user rate/quota limiting is enforced (`ai_token_limit_per_user` is unused); **INFO** — the `_userId` parameter of `buildAppDependencies` is dead surface.

## 2. Verified authentication chain

- JWT auth is established in the shared middleware `src/integrations/supabase/auth-middleware.ts` (`requireSupabaseAuth`).
- Every audited AI server fn chains `requireAppDependencies` (`src/integrations/auth/app-dependencies.ts:13`), which in turn chains `requireSupabaseAuth` and builds the request-scoped dependency graph (`buildAppDependencies(context.supabase, context.userId)`).
- Unauthenticated/public server fns use `requirePublicDependencies` (`src/integrations/auth/app-dependencies.ts:24`), which provides only a public-safe subset and fails closed via a `Proxy` for anything else (`src/infrastructure/di/index.ts: buildPublicDependencies`).

**Verdict:** All AI endpoints are behind JWT auth. PASS.

## 3. Entitlement gating coverage

Single shared gate: `assertAiEntitlement(gateway, userId, scope, opts?)` in `src/application/services/entitlement-guard.ts:28`.

Gate rules (fail closed):
1. AI disabled platform-wide (`ai_enabled === false`) → deny.
2. admin or tutor roles → allow (no subscription needed).
3. Subscriptions disabled platform-wide (`is_subscriptions_enabled === false`) → allow (open mode).
4. Otherwise require the matching feature scope; a legacy approved `student_subscriptions` row still counts for the `ai` scope.
5. Any config/role/scope read error denies rather than allows.

AI capabilities and their gates (verified in source):

| Server fn | File | Gate | Scope |
|---|---|---|---|
| `runAgent` | `src/application/use-cases/ai/run-agent.ts:24` | `assertAiEntitlement` | `ai` |
| `aiTutorChat` | `src/application/use-cases/ai/tutor-chat.ts:85` | `assertAiEntitlement` | `ai` |
| `aiToolRun` | `src/application/use-cases/ai/tool-run.ts:56` | `assertAiEntitlement` | `ai` |
| `simLabChat` | `src/application/use-cases/simulation/chat.ts:33` | `assertAiEntitlement` | `ai` |
| `whiteboardConvert` | `src/application/use-cases/whiteboard/convert.ts:22` | `assertAiEntitlement` (+ `requireOcrEnabled`) | `ai` |
| `embedPrompt` | `src/application/use-cases/simulation/lab.ts:495` | `assertLabsScope` → `assertAiEntitlement` | `labs` |
| `findSimilarSimulation` | `src/application/use-cases/simulation/lab.ts:516` | `assertLabsScope` | `labs` |
| `generateSimulationSchema` | `src/application/use-cases/simulation/lab.ts:525` | `assertLabsScope` | `labs` |
| `saveAiKey` | `src/application/use-cases/admin/ai-keys.ts:24` | `assertAdmin` | admin |
| `getAiKeyStatus` | `src/application/use-cases/admin/ai-keys.ts:38` | `assertAdmin` | admin |
| `testAiProvider` | `src/application/use-cases/admin/ai-keys.ts:75` | `assertAdmin` | admin |

**Verdict:** All 11 audited AI/admin AI capabilities gate server-side. No AI path lacks an entitlement or admin check. PASS.

## 4. Roles never client-sourced

- `tutor-chat.ts:88` resolves the user's roles server-side via `deps.user.listRoles(userId)`; tutor-vs-student mode is decided server-side and "cannot be overridden by the client".
- Roles come from `user_roles` via the entitlement gateway (`supabase-entitlement-gateway.ts:22`, `getRoles`), not from request payload/session claims.

**Verdict:** Team/role escalation via crafted client payload is not possible through the audited AI surface. PASS.

## 5. Provider / model isolation

- Application layer requests only abstract capability via the `AiGateway` contract (`src/application/contracts/ai.ts:57`). Contract comments state the gateway should handle provider selection, credential management, model mapping, retries, rate limiting, and "NEVER leak provider-specific details to callers".
- The concrete `AiGateway` is provided by Infrastructure: `createAiGateway` in `src/infrastructure/adapters/ai-gateway-adapter.ts`, which delegates to `@/lib/ai/provider.server` (`aiChat`, `aiEmbed`, `getProviderCreds`, `clearAiProviderCache`).
- Provider selection and credential resolution stay in `src/lib/ai/provider.server.ts` (server-only), never in the client bundle.

**Verdict:** Client cannot choose provider/model; no provider creds cross the boundary. PASS.

## 6. Client bundle leak scan (dist/client)

Scanned the built `dist/client` bundle for server code and secrets:

| Check | Result |
|---|---|
| `service_role` / `SERVICE_ROLE` | Absent |
| `provider.server` (server code path) | Absent |
| `assertAiEntitlement` (server-only logic) | Absent |
| `GROQ_API_KEY` / `GEMINI_API_KEY` strings | Only **UI label hints** in `admin.ai-*.js` ("Requires GROQ_API_KEY (or a key saved below).") — not actual keys |
| `api_key` matches | 1, a UI-field identifier, not a secret value |

**Verdict:** No secret values or server code in the client bundle. PASS (with note that the UI label references the env var name, which is expected).

## 7. Findings

### MEDIUM — No AI rate/quota limiting enforced
`ai_token_limit_per_user` (default 100000) exists in `platform_config` but is **never enforced** by any server fn, gateway, or guard. There is no token usage capture table, RPC, or counter. A client with the `ai` scope can invoke AI indefinitely (subject only to provider-side limits), so there is no platform-level cost/abuse ceiling. See the companion `AUDITS_AI_QUOTA_DESIGN.md`.

### INFO — Dead `_userId` parameter
`buildAppDependencies(supabase, _userId)` in `src/infrastructure/di/index.ts:38` accepts `_userId` but never reads it (repositories derive user identity from the auth-scoped Supabase client). `requireAppDependencies` passes `context.userId` in but it is unused. Safe to drop from the signature or leave documented as reserved.

## 8. Recorded status

- Auth chain: PASS
- Entitlement coverage: PASS (11/11 AI/admin gates)
- Roles not client-sourced: PASS
- Provider/model isolation: PASS
- Client bundle leakage: PASS
- Findings: MEDIUM (no AI quota/rate enforcement), INFO (dead `_userId`)
