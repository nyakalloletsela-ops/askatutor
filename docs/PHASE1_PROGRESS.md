# AskATutorLive — Phase 1 Progress Record (Quality Foundation)

- **Phase:** 1 — Foundation (deterministic testing foundation).
- **Branch:** `opencode/phase0-work`.
- **Date:** 2026-09-10.
- **Type:** Current-session progress record, evidence-based, governed by the AT-0001 control system.
- **Phase-1 gating decisions (resolved 2026-09-10):** the combined foundation strategy recorded in `docs/PHASE1_ACCEPTANCE.md` / `docs/PHASE1_ENTRY_GATE.md`, and recorded in the decision log as **D-0007 (ATD-0009)** and **D-0008 (ATD-0010)** — `bun:test` for unit/integration, Playwright for E2E (setup still separately authorized), deterministic `bun test`, CI quality verification, no Vitest; Cloudflare Workers primary runtime, Supabase for Postgres/Auth, provider-neutral external integrations via secure Admin/server-side config. These close Phase-1 gate G-10 (`docs/CURRENT_STATE.md`).
- **Status classifications:** `IMPLEMENTED` / `APPLIED` / `TESTED` / `VERIFIED` / `PRODUCTION-VERIFIED` are only claimed with evidence. Anything not exercised here is `NOT VERIFIED`; anything needing GitHub/cloud access is `EXECUTION NOT VERIFIED`.

---

## 1. Execution record (this slice)

### 1.1 Test command wired into `package.json`
- `"test": "bun test"` added to `scripts`. Verified `git diff 137e868 package.json` shows **only** the added `test` line (no dependency drift).

### 1.2 Full test suite executed deterministically
- Command: `bun test` (Bun v1.3.14). Result: **35 pass / 0 fail / 0 skip, exit code 0** (43 `expect()` calls).
- Suite = 3 canonical unit-test files (`tests/ai-entitlement.test.ts`, `tests/room-access.test.ts`, `tests/webhook-actions.test.ts`) plus the duplicate archival copy under `docs/evidence/forensic/forensic_batch_2/tests/`. Pure-function tests (entitlement fail-closed, `resolveRoomMembership` fail-closed, PayPal webhook action routing).
- PowerShell stderr banner (`bun : ...`) is the native-command wrapper artifact, not a failure (exit 0, 0 fail).

### 1.3 Typecheck
- Command: `bunx tsc --noEmit` → **exit 0 (pass)** under the strict `tsconfig.json` (noEmit, Bundler).

### 1.4 Lint — baseline recorded (NOT green, pre-existing)
- Command: `bun run lint` (`eslint .`) → **4755 problems (4719 errors, 36 warnings), 4662 errors auto-fixable; exit 1**.
- Root cause: pre-existing repo-wide prettier drift (single-quote source vs `plugin:prettier/recommended` double-quote default), plus the archived forensic copy `docs/evidence/forensic/forensic_batch_2/**` under `eslint .`. Not introduced by this slice.
- Decision: lint is a **non-blocking CI diagnostic** (CF-011) until the baseline is resolved; it is not a hard gate (would be red on every run).

### 1.5 Playwright / E2E — not installed (blocked requirement)
- No `@playwright/test` in deps/lockfile; no `playwright.config.*`; only historical references in `docs/archive/askatutor-tree.txt`.
- A useful first E2E test needs a real identity/seed path (app routes are Supabase-auth-gated via `/auth` + `_authenticated` layout), plus `@playwright/test` + browser binaries (network install).
- Decision: **do not force-install or fabricate**; recorded as CF-012.

### 1.6 CI workflow added
- `.github/workflows/quality.yml`: hard gates = `bun install --frozen-lockfile` → `bun test` → `bunx tsc --noEmit` (Bun pinned `1.3.14`). `lint` and `build` run as **non-blocking diagnostics** (baseline-red and env/secrets-dependent respectively).
- **`CI EXECUTION: NOT VERIFIED`** — workflow never run on GitHub (CF-013).

### 1.7 Stream reconciliation (remote parallel Phase 1 work)
- The remote branch already contained a parallel Phase 1 stream (commits `3d9ef35..a859ad4`) that recorded Phase 1 acceptance (`docs/PHASE1_ACCEPTANCE.md`, `docs/PHASE1_ENTRY_GATE.md`, `docs/PHASE0_ACCEPTANCE.md`), added `"test": "bun test"`, a CI workflow, and policy/progress docs.
- That stream also left a **dependency-manifest regression**: `@radix-ui/react-dropdown-menu` removed (still imported by `src/presentation/domains/8-core-ux-navigation/ui/dropdown-menu.tsx:4`), `@radix-ui/react-dialog` downgraded `^1.1.15`→`^1.1.12`, `@radix-ui/react-tooltip` bumped `^1.2.8`→`^2.2.8`, with `bun.lock` **not updated** (frozen-lockfile CI would fail).
- This slice restores the manifest to exactly base + `test` script, reconciles the CI gate to a green-able set, and records the decisions in `docs/DECISION_LOG.md` (D-0007/D-0008) with cross-references to the acceptance docs.

---

## 2. Status summary (evidence-classified)

| Item | Status | Evidence |
|---|---|---|
| Test command (`bun test`) in `package.json` | IMPLEMENTED | `git diff 137e868 package.json` = 1 added line |
| Full unit suite | TESTED — 35 pass / 0 fail / 0 skip, exit 0 | `bun test`, 2026-09-10 |
| Typecheck (`bunx tsc --noEmit`) | TESTED — 0 errors | exit 0, strict tsconfig |
| Lint (`bun run lint`) | NOT GREEN — 4755 problems (pre-existing baseline); non-blocking CI diagnostic | CF-011 |
| Playwright / E2E | NOT IMPLEMENTED — setup blocked/follow-up | CF-012 |
| CI workflow | IMPLEMENTED — EXECUTION **NOT VERIFIED** | CF-013 |
| CI execution on GitHub | NOT VERIFIED | requires GitHub runner |
| Dependency manifest vs base | RESTORED — base deps + `test` | diff check |
| Production verification of any gate | NOT VERIFIED | no production evidence this slice |

---

## 3. Carried-forward follow-ups (Phase 1)

| ID | Item | Status |
|---|---|---|
| CF-011 | Lint baseline enforceability: prettier single/double-quote drift + `docs/evidence/forensic/**` ignore decision; then promote lint to a hard CI gate | OPEN |
| CF-012 | Playwright E2E: authorize `@playwright/test` devDep + browser install + non-auth E2E target/seed path; run headless | OPEN — requires separate authorization |
| CF-013 | CI EXECUTION: run `.github/workflows/quality.yml` on GitHub and record green/red | OPEN — requires GitHub runner access |

---

## 4. Scope boundaries honoured

- No production source-code change (only `package.json` script line + docs + workflow).
- No dependency added/removed/version-changed vs base; lockfile untouched (restored drift removed).
- No eslint config change; no mass formatting of unrelated files.
- No fabricated test/CI claims: anything not run/exercised is `NOT VERIFIED`.
- Payments/ledger/AI-entry-point behaviour untouched.