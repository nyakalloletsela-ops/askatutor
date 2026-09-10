# AskATutorLive — External Integration Policy

- **Date:** 2026-09-10
- **Status:** ACCEPTED ENGINEERING POLICY
- **Scope:** Payments and all external providers/integrations

## Principle

AskATutorLive must not hard-code production provider choices, credentials, endpoints, or operational settings into learner/tutor product flows.

External integrations are platform capabilities. Their provider selection, enablement, mode, credentials reference, supported regions/currencies, and operational status must be controlled through secure administrative configuration and server-side integration boundaries.

## Required architecture

1. **Admin-controlled configuration**
   - Provider enablement and operational configuration belong in the Admin dashboard and the backing configuration model.
   - Secrets are never committed to source control and are never exposed to browser clients.
   - Secret values should be stored in an appropriate secret manager; the application database should store only a safe reference/identifier where possible.

2. **Provider-neutral application contracts**
   - Application/domain code depends on provider-neutral ports/contracts.
   - Provider SDKs and protocol details remain in Infrastructure/Integration adapters.
   - A provider must be replaceable without rewriting learner, tutor, commerce, or scheduling domain logic.

3. **Server-authoritative execution**
   - Amounts, commissions, entitlements, payment state, refunds, and other financial outcomes are determined server-side.
   - Client input is intent, never financial authority.
   - Webhooks are authenticated, idempotent, and reconciled against internal state.

4. **No silent provider activation**
   - A provider is disabled unless explicitly configured and enabled by an authorized administrator.
   - Missing credentials/configuration produces a controlled unavailable state, not a fallback that silently changes financial behavior.
   - Sandbox/live mode must be explicit.

5. **Operational observability**
   - Provider attempts, failures, retries, webhook events, reconciliation status, and configuration changes must be auditable without storing sensitive secret material in logs.

## Current payment application

The existing payment architecture already contains the intended direction: `payment_providers` stores provider configuration metadata, the server-side payment router selects configured providers, and the Admin Payments & Payouts area exposes a Providers section. This must be completed and hardened rather than replaced with hard-coded provider logic.

PayPal remains an integration adapter, not the platform's permanent payment architecture. Additional providers may be added behind the same contract when product, legal, regional, and operational requirements justify them.

## Applies beyond payments

The same pattern applies to:

- AI providers and model routing;
- email delivery;
- video/meeting providers;
- storage/media services;
- tax and currency services;
- identity/OAuth providers;
- analytics and observability services;
- future education/simulation integrations.

Each integration must have an explicit owner, configuration boundary, secret boundary, failure behavior, audit requirements, and verification evidence before production enablement.

## Completion rule

An external integration is not considered complete merely because an SDK adapter exists. Completion requires:

`DESIGNED → IMPLEMENTED → CONFIGURED → TESTED → VERIFIED → PRODUCTION-VERIFIED`

Production credentials, provider account configuration, domain/webhook registration, or other external actions may require project-owner assistance. Those are the only expected human blockers unless repository evidence reveals a new product/legal decision that cannot safely be inferred.
