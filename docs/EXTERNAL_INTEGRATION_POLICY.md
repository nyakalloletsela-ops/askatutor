# AskATutorLive — External Integration Policy

- **Date:** 2026-09-10
- **Status:** ACCEPTED ENGINEERING POLICY (accepted direction — ATD-0010 / D-0008; applied-state inspection recorded; deeper per-integration verification `NOT VERIFIED`).
- **Scope:** Payments and all external providers/integrations.

## Principle

AskATutorLive must not hard-code production provider choices, credentials, endpoints, or operational settings into learner/tutor product flows.

External integrations are platform capabilities. Their provider selection, enablement, mode, credentials reference, supported regions/currencies, and operational status must be controlled through **secure administrative configuration and server-side integration boundaries**.

## Required architecture

1. **Admin-controlled configuration** — Provider enablement and operational configuration belong in the Admin dashboard and the backing configuration model. Secrets are never committed to source control and never exposed to browser clients. Secret values should be stored in an appropriate secret manager; the application database stores only a safe reference/identifier where possible.
2. **Provider-neutral application contracts** — Application/domain code depends on provider-neutral ports/contracts. Provider SDKs and protocol details remain in Infrastructure/Integration adapters. A provider must be replaceable without rewriting learner, tutor, commerce, or scheduling domain logic.
3. **Server-authoritative execution** — Amounts, commissions, entitlements, payment state, refunds, and other financial outcomes are determined server-side. Client input is intent, never financial authority. Webhooks are authenticated, idempotent, and reconciled against internal state.
4. **No silent provider activation** — A provider is disabled unless explicitly configured and enabled by an authorized administrator. Missing credentials/configuration produces a controlled unavailable state, not a fallback that silently changes financial behavior. Sandbox/live mode must be explicit.
5. **Operational observability** — Provider attempts, failures, retries, webhook events, reconciliation status, and configuration changes must be auditable without storing sensitive secret material in logs.

## Current applied state (verified evidence)

| Integration | Seam (server-only unless noted) | Resolution / configuration | Evidence |
|---|---|---|---|
| AI | `src/lib/ai/provider.server.ts` (server-only) | Provider resolution: `process.env.AI_PROVIDER` (deploy override) → `platform_config.ai_provider` (Admin global switch, DB-backed) → default `gemini`. Keys: env (`GEMINI_API_KEY`/`GROQ_API_KEY`/`OLLAMA_BASE_URL`) or per-provider `ai_provider_keys` table via **Admin → AI**; DB values win over env. | file header (lines 1–18); `.env.example` |
| Email | `src/lib/email/provider.server.ts`, `src/lib/email/enqueue.server.ts` (server-only) | `EMAIL_PROVIDER` = `resend` \| `smtp` \| `none` (admin/env-configured) | `.env.example` |
| Payments | `src/lib/payments/router.server.ts`, `src/lib/payments/paypal.server.ts` (server-only) | PayPal disabled by default; server-side webhook signature verification; env-prefixed `…_CLIENT_ID` / `…_CLIENT_SECRET`. `payment_providers` stores provider configuration metadata; Admin Payments & Payouts exposes a Providers section. | `.env.example`; repo inspection |
| Auth/DB | `src/integrations/supabase/*` (`client.ts` browser publishable, `client.server.ts` server/service, `auth-middleware.ts` bearer → `sub`) | Supabase REST; server uses server-side client + role checks; browser uses provided publishable/anon key only | repo inspection |

This is consistent with the AT-0001 verified seam claims: centralized `AiGateway → adapter → provider` stack with `src/lib/ai/provider.server.ts` as the single seam; no provider bypass identified in audited entry points.

## Applies beyond payments

The same pattern applies to: AI providers and model routing; email delivery; video/meeting providers; storage/media services; tax and currency services; identity/OAuth providers; analytics and observability services; future education/simulation integrations.

Each integration must have an explicit owner, configuration boundary, secret boundary, failure behavior, audit requirements, and verification evidence before production enablement.

## Rules (binding for new integrations)

1. **Single seam per integration class.** New providers plug into the existing seam (e.g., a new adapter in `src/lib/ai/`), not new per-provider code paths in routes/use-cases.
2. **Server-only for secrets.** Credentials live in server-only modules or Admin-managed DB tables (`ai_provider_keys` pattern). Client bundle may contain only publishable keys (Supabase URL + anon key).
3. **Provider-neutral selection.** Consumers depend on the seam interface, never on `provider === "x"` branches in application code. Provider choice belongs to the seam (env → Admin DB → default).
4. **Fail-closed defaults.** Missing/errored provider config fails closed (entitlement/access denied), never degrades to "open" or "anonymous".
5. **No fabricating third-party credentials** in the repo. `.env.example` documents required vars; real secrets stay out of the repository.
6. **Verification before claims.** An integration is only `VERIFIED` when exercised with captured evidence (tests and/or captured live output); otherwise `NOT VERIFIED`.

## Completion rule

An external integration is not considered complete merely because an SDK adapter exists. Completion requires:

`DESIGNED → IMPLEMENTED → CONFIGURED → TESTED → VERIFIED → PRODUCTION-VERIFIED`

Production credentials, provider account configuration, domain/webhook registration, or other external actions may require project-owner assistance. Those are the only expected human blockers unless repository evidence reveals a new product/legal decision that cannot safely be inferred.

## Verification status

- Policy adopted and applied-state inspected 2026-09-10 (read-only).
- Deeper per-integration verification (live provider calls, webhook signature flows, Admin key-management round-trip) = `NOT VERIFIED` — future Phase 1 slices / production verification (`docs/PHASE1_PROGRESS.md` §3).
- `Cloudflare production deployment: NOT PRODUCTION-VERIFIED`.