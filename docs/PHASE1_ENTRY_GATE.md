# AskATutorLive — Phase 1 Entry Gate

- **Date:** 2026-09-10
- **Phase 0:** CLOSED WITH EXPLICIT FOLLOW-UPS (D-0006 accepted)
- **Status:** `ACCEPTED — PHASE 1 UNLOCKED`

## Purpose

Record the accepted Phase 1 foundation strategy carried from ATD-0009 and ATD-0010. The two recommendations are intentionally treated as one coherent foundation decision: **test deterministically, deploy on one explicit primary runtime, and preserve portability without allowing secondary tooling to define architecture.**

## Accepted Phase 1 Foundation Strategy

### Testing

**Accepted:**
- Bun's existing `bun:test` runner is the unit/integration test runner for the current stack.
- Playwright is the browser E2E framework.
- A deterministic `test` command and CI execution are required.
- Vitest is not adopted at this time; migration requires evidence-based justification.

### Deployment

**Accepted:**
- Cloudflare Workers is the primary production application runtime.
- Supabase remains the managed PostgreSQL/Auth/data platform.
- Vercel remains an alternative deployment target only and does not define the production architecture unless separately accepted later.

### Why these decisions are combined

Both decisions establish the Phase 1 delivery foundation around the repository's verified present state rather than introducing avoidable migrations or platform ambiguity. The testing strategy protects the existing Bun implementation while adding missing browser verification. The deployment strategy formalizes the already-present Cloudflare Workers runtime configuration while keeping Supabase as the data/auth boundary and Vercel as optional portability.

## Phase 1 Acceptance Criteria

The decisions are accepted, but acceptance does **not** mean the criteria below are already implemented or verified.

### Testing foundation

- [ ] `package.json` exposes a deterministic `test` command.
- [ ] Existing unit/integration tests run in CI.
- [ ] Playwright is installed/configured for E2E.
- [ ] At least one authenticated critical-path E2E test exists before the first production release.
- [ ] Test commands and environments are documented.
- [ ] Coverage claims are based on measured evidence.

### Deployment foundation

- [ ] Production Cloudflare account/project configuration is established.
- [ ] Environment/secrets are configured without committing secrets.
- [ ] Build/deploy pipeline is deterministic.
- [ ] Authentication provider/redirect configuration is production-verified.
- [ ] Database migrations and applied state are verified.
- [ ] Health/smoke checks exist.
- [ ] Rollback procedure is documented and tested.
- [ ] Production verification is recorded separately from deployment success.

## Boundaries

These decisions do not authorize unrelated implementation. Learning, institutional membership, commerce reconciliation, financial-safety rules, authentication hardening, AI provider/model-router expansion, and other backlog items remain governed by their own decisions and work items.

## Status semantics

**DECISION STATUS:** ACCEPTED  
**IMPLEMENTATION STATUS:** NOT YET VERIFIED  
**PRODUCTION STATUS:** NOT VERIFIED

The next work must proceed as controlled Phase 1 slices: INSPECT → IMPLEMENT → TEST → VERIFY → UPDATE STATE → NEXT.
