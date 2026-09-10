# AskATutorLive — Phase 1 Entry Acceptance

- **Date:** 2026-09-10
- **Decision:** ACCEPTED
- **Scope:** ATD-0009 + ATD-0010 as one coherent Phase 1 foundation strategy

## Accepted decision

The project will use the existing Bun toolchain as the basis for testing and Cloudflare Workers as the primary application runtime.

### ATD-0009 — Testing

- `bun:test` is the unit/integration test runner.
- Playwright is the browser E2E framework.
- A deterministic `test` command and CI execution are required.
- Vitest is not adopted unless later evidence justifies migration.

### ATD-0010 — Deployment

- Cloudflare Workers is the primary production application runtime.
- Supabase remains the managed PostgreSQL/Auth/data platform.
- Vercel remains an alternative target only; its CI/deployment status does not constitute production acceptance.

## Architectural rationale

This combined decision follows the verified repository rather than introducing unnecessary migrations. Bun and `bun:test` are already present; Cloudflare Workers is already the explicit runtime configuration. Playwright fills the missing browser-E2E layer, while the deployment decision establishes one clear primary runtime and preserves Vercel as a portability option.

## Important non-claims

Acceptance of these decisions does not mean the testing or deployment foundations are implemented, tested, verified, or production-verified. Those are Phase 1 engineering gates and must be evidenced separately.

It also does not authorize unrelated architecture or product decisions. Existing accepted decisions and their boundaries remain unchanged.

## Approval record

**Human decision:** Project owner directed the assistant to make the best architecture decision for AskATutorLive and explicitly authorized merging the ATD-0009/ATD-0010 recommendations where appropriate. The recommendations were therefore accepted as the combined Phase 1 foundation strategy above.
