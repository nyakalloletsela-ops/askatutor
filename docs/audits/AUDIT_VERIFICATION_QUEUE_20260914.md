# AskATutorLive — Repository-wide Verification Queue Audit (2026-09-14)

> **Type:** Read-only audit persisted into the control system — no files modified by the audit itself aside from this record.
> **Scope:** Repository-wide verification backlog audit. Identify every implemented/applied work item that still lacks proof of correctness; classify VERIFIED / PARTIALLY VERIFIED / TESTED-BUT-NOT-VERIFIED / BLOCKED / PRODUCTION-VERIFICATION-PENDING; separate DESIGNED / IMPLEMENTED / APPLIED / TESTED / VERIFIED / PRODUCTION-VERIFIED states; never upgrade to VERIFIED because tests pass.
> **Note:** Authority basis for the control-state update recorded in `docs/CURRENT_STATE.md` (NEXT ACTION), `docs/BACKLOG.md` (register note), and `docs/CHANGE_LOG.md` (AUDIT-0001). This record also documents the AT-0009 scope correction (2 of 3 remaining direct calls).
> **Evidence hierarchy applied:** repository source > applied DB/migrations > tests > control docs > archive. Cross-checks performed against `supabase/migrations/` (74 files), `src/routes/` (64 files), `tests/` (3 files + 1 forensic duplicate), env files, `supabase/config.toml`, git state, and the full control-doc set.

## 1. Executive verdict

| Dimension | Count |
|---|---|
| Work items in-scope (AT + FC + GAP + CF registers) | 28 |
| **VERIFIED** (in-repo + applied DB/test evidence) | 2 (AT-0002 non-prod leg; FC-003 non-prod leg) |
| **PARTIALLY VERIFIED** (evidence exists, ≥1 leg missing) | 7 (AT-0001, AT-0002 overall, AT-0004, AT-0005, AT-0006, AT-0007, AT-0008, FC-003) |
| **BLOCKED** (cannot verify, external prerequisite) | 4 (FC-004, AT-0008 runtime, all production verification, AT-0005 production apply) |
| IMPLEMENTED in-repo but **not runtime/browser-verified** | 3 (AT-0005, AT-0006, AT-0007) |
| RECORDED — not started | 13 (AT-0009, FC-001, FC-002, CF-001…CF-009) |

**The single dominant fact:** every implemented item since AT-0004 is verified at the in-repo and (where applicable) applied-non-prod-DB level, but **zero** of it has ever run in a real runtime, and production proves nothing beyond "narrative-only" applied-state. There is **no approved non-prod runtime** — this one missing artifact blocks 4 verification legs at once (AT-0006/0007 runtime smoke, AT-0008 runtime e2e, FC-004 PayPal sandbox e2e).

## 2. Master verification queue

| Item | State (evidence) | Held verification |
|---|---|---|
| AT-0001 — RLS/security audit baseline | COMPLETED (assessment); **not independently re-checked** | Independent re-check |
| AT-0002 — Security/RLS output verification | **VERIFIED on non-prod** (73/73 repro, isolation 588P/40B/0F, grant remediation 40/40+628/628); **PARTIAL on prod** (narrative only) | Production applied-state check; `anon` over-grant remediation |
| AT-0004 — Presentation foundation + build repair | VERIFIED in-repo (tsc 0, prettier, lint 112 baseline, build SUCCESS) + **committed** (3 commits) | Browser runtime smoke; prod |
| AT-0005 — Commerce checkout + migration | IMPLEMENTED + VERIFIED in-repo; DB leg VERIFIED non-prod (FC-003); uncommitted | Provider handshake (blocked); prod apply; commit |
| AT-0006 — Discovery browse/profile conversion | IMPLEMENTED + VERIFIED in-repo; uncommitted | Runtime smoke anon+auth; commit |
| AT-0007 — Public/anon dependency boundary | IMPLEMENTED + VERIFIED in-repo; uncommitted | Runtime smoke; commit |
| AT-0008 — Availability verification | **PARTIALLY VERIFIED** — applied non-prod contract confirmed (3 RPCs `auth_exec=true`); suite 35 pass | Runtime e2e (blocked); commit |
| FC-003 — migration apply non-prod | **DB-layer VERIFIED** on non-prod (5/5 behavior tests, rollback-clean) | Live provider leg (blocked); prod apply |
| FC-004 — PayPal sandbox e2e | **BLOCKED** (credentials absent; no non-prod runtime) | Sandbox transaction |
| AT-0009 — book route remainder | RECORDED; **in-repo confirms 2 of 3 calls still direct** (`joinWaitlistFn` at `book.$tutorId.tsx:470-472`, `notifyBookingEmails` at `:177`; `bookSession` already wrapped in `useServerFn` at `:94`) | Implementation + verification |
| FC-001 — Lovable scaffold removal | RECORDED — not started | Cut + verify |
| FC-002 — `APP_SHELL_PREFIXES` drift + review stub | RECORDED — not started | Fix + verify |
| CF-001/CF-002 — testing-framework + deploy-platform decisions | OPEN — **Phase 1 gates** | Human decision |
| CF-003…CF-009 — learning/legal/architecture follow-ups | OPEN (CF-010 closed) | — |

## 3. Blocked verification queue

| Item | Blocker (verified this audit) | Prerequisite to re-open |
|---|---|---|
| FC-004 PayPal sandbox e2e | `payment_providers.paypal` `is_enabled=false`; **no `PAYPAL_*` env anywhere** (`.env` sweep: 5 SUPABASE keys only); `.env.example` claims "No env vars required" — implementation reads env only | Sandbox creds (client id/secret + webhook id) **+** non-prod runtime + provider enabled |
| AT-0008 (and AT-0006/AT-0007) runtime smoke | No approved non-prod runtime; `.env`/`config.toml` pinned to **production** `bzjlhxmiwdkteqkzqasi` | Same runtime pivot (shared with FC-004) + test users |
| All production verification | Outbound 5432 to pooler times out; **no DB password in repo**; REST anon-probes can't distinguish denial vs empty rows; no captured artifacts | Human-secured prod access + artifact capture |
| AT-0005 production migration apply | Requires authorization + live provider test first | FC-004 unblocked |

## 4. Security / access-control queue

| Item | Status | Evidence |
|---|---|---|
| GAP-001 role hierarchy | Remediated in code+migration (`20260813090000` present, part of 74 applied non-prod); **PRODUCTION UNVERIFIED** | GAP_REGISTER Cat.2 RED |
| GAP-002 admin RLS enforcement | Migration PRESENT (`20260814090000`) — applied non-prod in the 74; **prod unverified** | ditto |
| GAP-003/004/005 (rate-limit gates, tutor-app validation, parent visibility) | Migrations PRESENT on disk (all five confirmed `2026081*.sql`) — **never verified outside the migration set**; GAP-003 P2 note: `ai_token_limit_per_user` exists **only** in generated `types.ts` — no enforcement table (`ai_usage`) or code | Migration files verified present; runtime never exercised |
| AT-0002 residual: `profiles`/`user_roles` + ~18 empty-`relacl` tables (42501) | Remains open; sidestepped for Discovery via PUBLIC RPC surface | AT-0007 note |
| Production `anon` over-grant (`arwdDxtm` on learner tables) | Actionable finding; **not remediated** | AT-0002 finding |
| `sessions` grant-gap | **CLOSED** — remediated + re-verified (40/40 + 628/628) on non-prod | AT-0002 session 6 |

## 5. Database / migration verification queue

- **Non-prod applied state: VERIFIED.** 74/74 applied to `rwpxaejhouunxlcibpou`; FC-003 pre/post/rollback evidence captured; the 74th (`20260914120000`, self-service checkout finalize: restore `authenticated` EXECUTE on `create_bulk_lesson_intent` + idempotent `prepaid_lessons` credit) verified with 5/5 idempotency tests.
- **Missed check (recommended):** no checksum/`version`-parity reconciliation of the whole 74-set vs repo — worth a read-only Management API `migrations` list diff.
- **Production: PARTIALLY VERIFIED — narrative only** (session-3 historical schema/RLS match; no artifacts). Same for all Category-2 RLS migrations (GAP-001…005).
- No `ai_usage`/quota table exists anywhere — AI quota tracking is un-implemented, not merely unverified.

## 6. Presentation / route-conversion verification queue

Route inventory (`src/routes/`, 64 files): 2 layouts, 3 API/webhook handlers, 16 PUBLIC, 28 AUTHENTICATED, 15 ADMIN. Of 59 route components: **12 CONVERTED, 26 DIRECT, 8 PARTIAL, 13 N/A**; **32 files import supabase client directly**.

- **AT-0006 done:** `tutors.tsx` → `browseTutors`; `tutor.$id.tsx` → `getTutorProfile`/`getTutorReviews` (verified: `client.public.server.ts`, `browse-tutors.ts` present; direct supabase client removed from `tutor.$id.tsx`).
- **AT-0007 done:** 3 public fns now `[requirePublicDependencies]` with anon-safe repo (`book-session.ts:13-18,25-37`); booking/availability stay `[requireAppDependencies]`.
- **AT-0009 — corrected scope (direct code inspection):** `book.$tutorId.tsx` already wraps `bookSession` in `useServerFn` (`:94`); **remaining direct calls are `joinWaitlistFn` (`:470-472`) and `notifyBookingEmails` (`:177`) — 2 of 3, not 3**. Control docs corrected accordingly.
- Next unconverted: ~26 DIRECT + 8 PARTIAL authenticated/admin routes (dashboard, admin), gated on `requireAppDependencies` anon-gap resolution (already fixed only for public fns).
- AT-0004 trust pages/browser execution: never browser-smoked.

## 7. Integration / external-service queue

| Integration | Status |
|---|---|
| PayPal | **BLOCKED** (FC-004). Doc/impl mismatch recorded: `.env.example` says DB-configured, code reads env. |
| Email | Infra present (`src/lib/email/*`, `email-service-adapter`, suppression repo); **runtime unproven**; `notifyBookingEmails` currently callable client-side (AT-0009) |
| AI Gateway | Centralised gateway confirmed (`ai-gateway-adapter.ts`, `run-agent`/`tool-run`/`tutor-chat`); **model-router not built** (CF-006); **quota enforcement absent**; `ai-entitlement.test.ts` covers gate logic (13 cases, fail-closed verified in code review) |
| CI | **Absent** — no `.github`, no gitlab/circle config; no automated verification gate exists |

## 8. Production verification queue

Everything is PARTIALLY VERIFIED-at-best or blocked: applied-state 74/74 (narrative), GAP-001…005 prod RLS inspection, prod `anon` over-grant remediation+reverify, prod runtime smoke of AT-0004…0008 behavior, live PayPal checkout, prod apply of the 74th migration. **No production artifact exists in `docs/evidence/` (158 files, ~3.0 MB — all non-prod/forensic).**

## 9. False-completion flags

1. **AT-0000/AT-0003 "CLOSED"** — verdicts self-assigned by the same process; **PENDING HUMAN ACCEPTANCE** (the reviewer's act, per BACKLOG:225). Not a false claim, but not independently verified.
2. **AT-0002 headline "VERIFIED"** — strictly true for **non-prod only**; production leg is narrative. The label risks being read as production-verified.
3. **FC-003 "COMPLETED — PARTIALLY VERIFIED"** — 'completed' × 'partial' reads as contradictory; the live provider + prod legs are untouched.
4. **GAP-001 "REMEDIATED — PRODUCTION UNVERIFIED"** vs GAP_REGISTER table "UNVERIFIED" — consistent, but "remediated" is only proven on non-prod/in-repo.
5. **"35 tests pass"** — asserted with no in-repo test *file* documenting the exact count; the 3 tracked test files cover pre-existing paths (ai-entitlement, room-access, webhook-actions). **No automated tests exist for the discovery server-fns, commerce use-cases, or checkout** — all new-slice verification is manual/DB-level.
6. **AT-0007 "availability RPCs may 42501"** — refuted by AT-0008; recorded as resolved (correctly closed in BACKLOG).

## 10. Duplicates & stale items

- **Single shared prerequisite** duplicating across 4 items: "non-prod runtime + test user" appears in AT-0006, AT-0007, AT-0008, FC-004 — one keystone (see §11).
- **One item, three refs:** `profiles` REST grant-gap appears in AT-0002 residual, AT-0007 known-open, CF-008.
- **Merge candidates:** "single-tutor targeted public RPC" (AT-0008) ≡ "`getProfile` fetch-all-then-filter" (AT-0007). Same item.
- **Stale:** `AUDIT_BASELINE_AT-0001.md` predates GAP-002…005 migrations — its role-hierarchy section is superseded; `20260811090000_29d8fece-…sql` (UUID-named, Lovable-era) sits applied with no provenance note.
- AT-0009 scope in docs exceeded code reality (§6) — corrected to "2 of 3" in this audit persist.

## 11. Recommended verification order

1. **NEXT VERIFICATION JOB:** Non-prod runtime pivot + test users + PayPal sandbox creds (human gate).
   **WHY:** one action unblocks FC-004, AT-0008 runtime, AT-0006/0007 smoke (4 legs).
   **REQUIRED EVIDENCE:** a `.env`/config targetting `rwpxaejhouunxlcibpou`; ≥2 test users; sandbox `PAYPAL_*` vars; `payment_providers.paypal is_enabled=true` (non-prod only).
   **UNLOCKS:** everything below.
2. Read-only Migration-parity diff (74 versions + checksums, non-prod) — minutes, high confidence; hardens every DB-verified claim.
3. AT-0008 runtime e2e → AT-0006/0007 anon+auth smoke → FC-004 sandbox checkout (dependency order).
4. Add automated tests for discovery/commerce/checkout paths (closes §9.5).
5. Production: apply 74th migration after live-provider pass; re-probe RLS; remediate `anon` over-grant; **store captured artifacts in `docs/evidence/`**.
6. Close CF-001/CF-002 (Phase-1 gates), then AT-0009.

## 12. Project-state conclusions

The audit changes no system behavior — this record is the persistent statement. Confirmed: all registered statuses are accurate as conventionally classified, but the estate is **top-heavy on "in-repo/DB-level verified"** and **zero on runtime/production**. The corrected AT-0009 scope (2 of 3), the `ai_usage`/quota gap, the missing CI gate, and the absence of tests for new slices are the actionable facts. No commits made; working tree unchanged by the audit (10 modified + untracked AT-0005/0006/0007/0008 artifacts + excluded `pnpm-*`).

**Classifications preserved (do not upgrade):** FC-004 = BLOCKED (PayPal sandbox credentials + approved non-prod runtime + provider enablement); AT-0008 = PARTIALLY VERIFIED (DB contract + application path verified; runtime still blocked; `42501` hypothesis refuted); AT-0006/AT-0007 = structurally verified in-repo, runtime smoke pending the non-prod runtime; AT-0005 = in-repo + non-prod DB evidence exists, provider handshake + production verification pending/blocked. Nothing is upgraded to VERIFIED or PRODUCTION-VERIFIED by the existence of this audit.