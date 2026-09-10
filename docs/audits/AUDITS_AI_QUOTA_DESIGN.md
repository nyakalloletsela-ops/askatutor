# AI Quota Design Audit (reconstructed)

> **Type:** Read-only audit — no files modified.
> **Scope:** Assess the design and current state of per-user AI token quota enforcement.
> **Note:** This report reconstructs a prior-session audit from verified in-repo evidence.

## 1. Executive summary

A per-user AI token budget is **declared** in configuration and surfaced in the admin UI, but it is **not enforced anywhere**. There is no usage-capture store, RPC, or counter; the provider's token-usage data is discarded at the gateway. The design also leaves the semantics of "monthly" undefined — a **product decision** is required before implementation.

## 2. What exists (declared, not enforced)

### 2.1 Configuration field
- Column `ai_token_limit_per_user integer NOT NULL DEFAULT 100000` on `public.platform_config` (singleton, id=1) — `supabase/migrations/20260601045818_f63dbd87-f3a0-4e98-8232-d380ac4a68f6.sql:83`.
- Readable by `anon`/`authenticated`, admin-updatable (RLS present).

### 2.2 Types + admin UI
- Typed in `src/integrations/supabase/types.ts`.
- Surfaced in the admin platform config form via `use-platform-config` hook (`src/presentation/domains/3-personalization-role-context/hooks/use-platform-config.tsx`) and `src/routes/_authenticated/admin.ai.tsx:34` as a `ConfigToggle` for key `ai_token_limit_per_user` with description *"Approximate monthly AI token budget per user."*

### 2.3 Not present anywhere
- **No usage/token accounting table** (grep for `token_usage`, `tokenUsage`, `recordUsage`, `usage_table` across `src/` returns nothing beyond the config/type/UI hits).
- **No usage RPC** and **no capture point**: nothing writes usage.
- **No enforcement check** in any server fn, gateway, or guard.

Evidence: grep of `src/` for `ai_token_limit_per_user|tokenUsage|token_usage|recordUsage|usage_table` only matches `types.ts`, `use-platform-config.tsx`, and `admin.ai.tsx` — all read/display, none write or enforce.

## 3. Where usage is lost

The `AiGateway.chat` contract returns `{ text, raw }` (`src/application/contracts/ai.ts:29`, `AiChatResult.raw: unknown`). The raw provider response is populated at the provider layer — `src/lib/ai/provider.server.ts:231` (`const raw = await res.json()`) — and returned as `raw` at `:235`.

- No AI use case reads `raw.usage`.
- The `AiGateway` adapter and the application contract carry `raw` but never destructure token counts; **the provider's `usage` (input/output tokens) is discarded**.

## 4. Quota scoping (the mechanism that gating uses today)

Access control scoping (distinct from quota accounting):
- `assertAiEntitlement` (`src/application/services/entitlement-guard.ts:28`) decides WHO may use a capability via roles + feature scope.
- Scopes come from the `get_my_scopes()` RPC, which resolves entitlements from `subscription_assignments` (migration `20260622125739_...sql:117`) keyed via `auth.uid()` and gated by `expires_at`.
- `admin`/`tutor` roles bypass subscription scoping (allow).

This is **entitlement**, not **consumption accounting** — nothing here meters how much a user consumes within a period.

## 5. Design recommendation

- **Accounting seam:** capture usage in the `AiGateway` implementation (Infrastructure seam between Application and provider), reading `raw.usage` before the provider response is discarded. This is the single choke point where every token-producing call already flows (`chat`/`embed`).
- **Policy seam:** enforce the limit in the Application layer (`assertAiEntitlement`-style guard or a sibling `assertAiQuota`) so the rule is bounded and testable against the `EntitlementGateway`/usage port contracts — consistent with the layered architecture.
- **Store:** add a per-user usage table (e.g. accumulated tokens per accounting period) plus an RPC to increment/read, exposed through a new Application port so Infrastructure provides the implementation.

## 6. BLOCKER — period semantics REQUIRES PRODUCT DECISION

The admin label says *"Approximate monthly AI token budget per user"*, but "month" is ambiguous:

- **Calendar month** (1st–month-end, UTC)? Resets on the 1st regardless of subscription.
- **Rolling 30/31-day window**? Continuous, sliding.
- **Assignment-aligned** (reset on subscription start / renewal per `subscription_assignments`)? Ties usage to the paid period.

The current schema stores per-user assignments but has **no period accounting** — no usage table exists to bucket by any of these.

**This decision must be made before implementation** (calendar vs rolling vs assignment-aligned "monthly"), otherwise the reset-boundary and enforcement rules are undefined.

## 7. Quota surface summary

| Layer | Current state |
|---|---|
| Config field | `ai_token_limit_per_user` default 100000 (platform_config) — exists |
| Admin UI | ConfigToggle in `admin.ai.tsx:34` — exists (display only) |
| Types | `src/integrations/supabase/types.ts` — exists |
| Usage capture | None — `raw.usage` discarded (`provider.server.ts:231-235`) |
| Usage store | None |
| Enforcement | None |
| Period semantics | **UNKNOWN — REQUIRES PRODUCT DECISION** |
| Recommended accounting point | `AiGateway` implementation (Infrastructure seam) |
| Recommended policy point | Application guard (e.g. `assertAiQuota`) |
| Primary blocker | No usage store + no period decision |

## 8. Findings

- **HIGH — Quota not enforced:** `ai_token_limit_per_user` is cosmetic today; no cost ceiling or abuse limit exists platform-wide.
- **HIGH (design) — Period semantics undefined:** cannot implement reset rules without the product decision in §6.
- **INFO — Usage data discarded:** `raw.usage` is fetched but dropped; logging it is the minimal first step toward accounting.
