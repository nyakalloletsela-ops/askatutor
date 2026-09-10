# AskATutorLive

Online tutoring / learning platform being built on **TanStack Start (React 19 + Vite 7 / Nitro)** backed by **Supabase** (PostgreSQL + Auth), managed with **bun**.

> **Status note:** This project is under active development. `docs/CURRENT_STATE.md` and `docs/AUDIT_BASELINE_AT-0001.md` are the authoritative records of what is actually implemented and verified today. Do not treat the Phase-0 planning documents in `docs/architecture/` as descriptions of the current implementation.

## Verified technology (repository evidence)

- **Runtime/build:** bun (`bun.lock`, `bunfig.toml`), Vite build (`vite build`).
- **Framework:** TanStack Start — React 19, Vite 7, Nitro.
- **Backend / data:** Supabase (PostgreSQL via `supabase/migrations`, Supabase Auth via JWT `sub`, RLS). Roles `admin | tutor | student | parent`.
- **Deployment:** Cloudflare Workers default (`wrangler.jsonc`); Node (`build:node`) and Vercel (`build:vercel`) options. See `DEPLOYMENT.md`.

## Authoritative documentation

Everything under `docs/` is the engineering control system. Start here:

- `docs/MASTER_PLAN.md` — roadmap / phases.
- `docs/CURRENT_STATE.md` — authoritative record of current repository state (read this first).
- `docs/DECISION_LOG.md` — governance & architecture decision log.
- `docs/BACKLOG.md` — recorded gaps, risks and deferred work.
- `docs/PRODUCT_CONSTITUTION.md`, `docs/CONFIRMED_REQUIREMENTS.md` — product requirements.
- `docs/WORK_PROTOCOL.md` — working rules.
- `docs/CHANGE_LOG.md` — chronological change record.
- `docs/AUDIT_BASELINE_AT-0001.md` — baseline audit evidence.
- `DEPLOYMENT.md` — deployment reference.

Supporting documentation:

- `docs/architecture/` — Phase-0 planning/aspirational architecture proposals (HISTORICAL, not current authority).
- `docs/audits/` — current audit and verification artifacts.
- `docs/evidence/` — evidence bundles (`bundles/`), inspection SQL (`queries/`), forensic evidence (`forensic/`).
- `docs/archive/` — superseded governance (`* (2).md`) and generated/stale inventory snapshots.

## Repository orientation

1. Read `docs/CURRENT_STATE.md` for what exists and what is still unverified.
2. Read `docs/DECISION_LOG.md` for what is (and is not) an accepted decision.
3. Read `docs/BACKLOG.md` for recorded gaps and deferred work.
4. For deployment, read `DEPLOYMENT.md`.

## Development

```sh
bun install
bun dev        # local dev server
vite build     # production build (see package.json scripts)
```

There is no `test` script in `package.json`; the repository currently contains 3 test files run via `bun:test`. See `docs/CURRENT_STATE.md` for the verification status of build, typecheck and tests.