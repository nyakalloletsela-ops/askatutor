# AskATutorLive — Phase 1 Entry Gate

- **Date:** 2026-09-10
- **Phase 0:** CLOSED WITH EXPLICIT FOLLOW-UPS (D-0006 accepted)
- **Status:** `PENDING HUMAN ACCEPTANCE`

## Purpose

Convert the two remaining Phase 1 entry decisions carried from ATD-0009 and ATD-0010 into explicit current decisions without silently promoting historical recommendations.

## Gate A — ATD-0009 Testing Strategy

### Current evidence

The repository currently uses Bun as its package manager/runtime and `bun:test` in the existing test suite. There is no `test` script in `package.json`. The historical ATD-0009 recommendation was Vitest for unit/integration and Playwright for E2E, but that recommendation is historical and was never accepted.

### Recommendation

**Adopt Bun's test runner as the unit/integration test runner for the current stack, and adopt Playwright for browser E2E testing.**

Rationale:
- preserves the already-implemented test runner instead of creating an unnecessary migration;
- aligns with the repository's existing Bun toolchain;
- gives the project a real browser E2E layer where one does not currently exist;
- permits a later migration if measured requirements justify it.

### Decision required

Human acceptance is required before this becomes an accepted architecture/tooling decision.

### Minimum Phase 1 acceptance criteria

- `package.json` exposes a deterministic `test` command;
- unit/integration tests run in CI;
- Playwright is installed/configured for E2E;
- at least one authenticated critical-path E2E test exists before the first production release;
- test commands and environments are documented;
- no claim of comprehensive coverage is made without measured evidence.

## Gate B — ATD-0010 Deployment Platform

### Current evidence

The repository contains a Cloudflare Workers deployment configuration (`wrangler.jsonc`) with `src/server.ts` as the Worker entry point. The application also contains Node/Vercel build options. Current GitHub/Vercel integration has produced deployment status checks, but a successful/pending deployment check does not establish that Vercel is the accepted production platform.

### Recommendation

**Adopt Cloudflare Workers as the primary production application runtime, with Supabase remaining the managed PostgreSQL/Auth/data platform.**

Vercel should remain an explicitly supported alternative/deployment target only if later verified and deliberately accepted; it should not become the production target merely because a Vercel integration exists.

Rationale:
- Cloudflare Workers is already the repository's explicit default runtime configuration;
- the server entry point and Wrangler configuration already express this deployment model;
- it avoids making CI/deployment status determine architecture;
- Supabase remains appropriately separated as the data/auth platform;
- a single primary production runtime reduces operational ambiguity.

### Decision required

Human acceptance is required before this becomes the current production deployment decision.

### Minimum Phase 1 acceptance criteria

- production Cloudflare account/project configuration is established;
- environment/secrets are configured without committing secrets;
- build/deploy pipeline is deterministic;
- authentication redirect/provider configuration is production-verified;
- database migrations and applied state are verified;
- health/smoke checks exist;
- rollback procedure is documented and tested;
- production verification is recorded separately from deployment success.

## Entry decision

Phase 1 remains **GATED** until both Gate A and Gate B receive explicit human acceptance.

The recommendations above do not constitute acceptance.

## Prohibited inference

Neither decision authorizes unrelated implementation. Learning, institutional membership, commerce reconciliation, financial-safety rules, authentication hardening, and other backlog items remain governed by their own decisions and work items.
