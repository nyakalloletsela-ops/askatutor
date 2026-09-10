# Payment Security Audit — Multi-Provider Foundation

**Date:** 2026-09-10  
**Branch:** `opencode/phase1-payment-hardening`  
**Scope:** PayPal foundation plus planned bank transfer, M-Pesa and EcoCash provider administration.

## Verdict

**NOT READY for additional live payment providers.**

The existing payment architecture has useful security foundations — provider configuration is database-backed, provider SDK work is kept server-side, ledger writes use restricted RPCs, and PayPal webhook failures now return 5xx so the provider can retry. However, the provider administration/data boundary needs hardening before more financial providers are introduced.

## Evidence

- `payment_providers` contains provider operational metadata plus a `config jsonb` column. The original table grants SELECT to authenticated users and has a broad authenticated read policy. This is too permissive for a table that may later contain sensitive provider configuration. The same migration gives service-role access for infrastructure operations.
- The payment gateway adapter reads provider configuration through `supabaseAdmin`, confirming that ordinary browser clients do not need provider infrastructure configuration to execute payment processing.
- The admin Payments & Payouts page currently reads `payment_providers` directly from the browser and currently uses `select("*")`. This is an unnecessary data-exposure boundary even though the page itself is admin-gated.
- Provider mutations from the admin page currently use direct authenticated table INSERT/UPDATE operations. RLS restricts these operations to admins, which is useful, but financial-provider configuration changes should ultimately have an explicit server-side command boundary and audit trail.
- `credentials_ref` is intended to be a non-secret reference/prefix. Actual provider secrets are intended to remain in backend/project secrets. Raw secrets must never be stored in or returned from `payment_providers`.
- `finalize_payment_succeeded`, `refund_payment`, and `mark_payment_failed` are restricted server-side financial operations. Finalization is row-locked and idempotent for an already-succeeded intent.

## Required security contract

### 1. Secret isolation

- Browser must never receive provider API secrets, signing secrets, private keys, access tokens, passwords, or arbitrary provider `config`.
- `payment_providers.config` must not be readable by authenticated browser clients.
- `credentials_ref` may identify a secret namespace/prefix but must never contain the secret itself.
- Provider adapters resolve secrets only inside server/infrastructure boundaries.

### 2. Provider administration

Provider administration must enforce:

1. authenticated session;
2. server-side admin authorization;
3. input validation and normalization;
4. explicit sandbox/live mode;
5. explicit enable/disable state;
6. safe operational fields only in browser responses;
7. audit record for security-sensitive changes;
8. no raw secret values in application logs or audit logs.

### 3. Financial authority

The browser may request an operation but cannot authoritatively declare:

- payment succeeded;
- refund completed;
- payout completed;
- entitlement purchased;
- balance credited.

Those outcomes require trusted server-side verification and atomic financial state transitions.

### 4. Idempotency and replay resistance

Every provider implementation must define how duplicate requests/events are handled. Provider retries must be safe. A repeated success event must not create a second ledger credit.

### 5. Webhook verification

Every provider with callbacks/webhooks must implement provider-specific authenticity verification before any financial action. Unsupported, malformed, invalid-signature, duplicate/already-processed, and transient-processing cases must be deliberately classified rather than falling through to an unconditional success response.

### 6. Payout security

Payouts are a separate financial boundary from incoming payments. A future bank/M-Pesa/EcoCash payout integration must not rely on an admin entering a reference and clicking “Mark paid” as proof that money moved. Where provider APIs support transfer verification, the provider result must be verified server-side. Manual/offline payout workflows must remain explicitly manual and auditable.

## Provider-neutral contract

All future providers should implement the same application-facing concepts:

- provider identity and capabilities;
- checkout/payment initiation;
- payment status lookup;
- webhook authenticity verification;
- webhook event normalization;
- payment finalization/refund/failure actions;
- payout initiation/status where supported;
- provider-specific idempotency strategy;
- provider-specific error classification.

Provider-specific SDK/protocol details belong in infrastructure adapters. Application/domain code must not branch on PayPal/M-Pesa/EcoCash/bank-specific protocol details.

## Planned providers

| Provider | Direction | Status | Decision |
|---|---|---|---|
| PayPal | Incoming | Existing | Hardened webhook retry semantics; continue security verification |
| Bank transfer | Incoming / payout | Planned | Bank not selected yet; Standard Lesotho Bank vs FNB is UNKNOWN — REQUIRES VERIFICATION |
| M-Pesa | Incoming / potentially payout | Planned | API/product availability and merchant requirements in target market UNKNOWN — REQUIRES VERIFICATION |
| EcoCash | Incoming / potentially payout | Planned | API/product availability and merchant requirements in target market UNKNOWN — REQUIRES VERIFICATION |

No provider should be marked live until its own DESIGNED → IMPLEMENTED → CONFIGURED → TESTED → VERIFIED → PRODUCTION-VERIFIED evidence exists.

## Immediate implementation slice

Before adding any new provider adapter:

1. restrict `payment_providers` browser read access to safe operational fields;
2. prevent browser access to the arbitrary `config` column;
3. keep provider processing on service-role/server infrastructure paths;
4. preserve admin RLS authorization for provider mutations;
5. add focused regression tests proving non-admins cannot read/write provider administration and browser-facing provider data excludes `config`;
6. then introduce a provider-administration command boundary/audit trail before enabling live-provider configuration.

## Current state

**VERIFIED:** PayPal route now returns 500 on downstream processing failure; local focused + full Bun suite is 39/39 passing according to the latest user-supplied test evidence.  
**IMPLEMENTED:** Provider configuration table, provider router, service-role payment finalization RPCs.  
**PARTIAL:** Provider admin/browser data boundary and provider-change auditability.  
**UNKNOWN — REQUIRES VERIFICATION:** Production database privileges/policies after deployment; production secret storage; provider onboarding/API requirements for the planned Lesotho payment methods.
