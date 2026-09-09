# AskATutorLive — Backlog

- **Work ID:** AT-0001
- **Status register:** This is the single register of real, accepted, or candidate work.
- **Rule:** Backlog entries are NOT implemented as a side effect of this audit. Beginning a backlog item requires an explicit, separate authorization (the item enters PLANNED → IN_PROGRESS).

Backlog entry fields: ID, title, category, description, reason, affected domain, dependencies, architectural impact, risk, priority, source/evidence, status.

---

## AT-0001 — Governance Installation & Baseline Architecture Audit

- **Category:** Governance / Process
- **Description:** Established the engineering-control system (`docs/`) and persisted the evidence-based baseline audit of the actual repository state.
- **Reason:** Requirements of the AT-0001 task.
- **Affected domain:** Repository-wide (engineering process).
- **Dependencies:** None.
- **Architectural impact:** None (no application architecture changed).
- **Risk:** Low.
- **Priority:** P0.
- **Source/evidence:** AT-0001 task brief; repository inspection.
- **Status:** COMPLETED — control docs persisted and consistency-checked (all six `docs/` files verified; governance invariants held: Assessment stays PROPOSED/UNACCEPTED, AT-0002 stays PLANNED, no fabricated ACCEPTED decisions). Not VERIFIED (control-system verification criteria not exercised).

---

## AT-0002 — Live Database Verification & RLS Isolation Confirmation

- **Category:** Security / Verification
- **Status:** `PARTIALLY VERIFIED` (resume, session 3). **Table-set definition:** the AT-0002 learner tables are Set A (`assignments`, `assignment_submissions`, `notes`, `session_records`, `simulations`) — Set B is the Category-2 / GAP-001..005 tracked set (`profiles`, `user_roles`, `tutor_subscriptions`, `tutor_courses`, `sessions`) and is NOT called "the 5 learner tables". The **applied schema, RLS policy definitions, helper functions, `app_role` enum, row/data-presence, and source↔applied reconciliation for the 5 learner tables (Set A) are recorded as VERIFIED live** (current-session production narrative, via authenticated Management API over HTTPS — read-only; **historical narrative evidence, no captured query-result artifacts stored in the repo**). The **definitive cross-learner (A vs B) runtime isolation test remains NOT VERIFIED / not executable** (production DB empty: `auth.users`=0; all 5 learner tables have 0 rows; no learner identities/records; creating test data is out-of-scope). Static/applied RLS model = PARTIALLY VERIFIED; current reproducible live evidence = NOT VERIFIED (no captured outputs); runtime cross-learner isolation = NOT VERIFIED / BLOCKED. **Not** COMPLETED, **not** fully VERIFIED. See Session History below.
- **Description:** Verify the live production Supabase state: whether migrations are applied, live table existence and row counts (especially `assignments`, `assignment_submissions`), and that RLS policies actually enforce the intended ownership boundary. Confirm Learner-A-vs-Learner-B isolation with cross-user checks.
- **Reason:** Live database/applied-migration/RLS state could not be verified from the repository alone (no DB connection string in the repo). This is the single largest unresolved security/isolation verification boundary identified in AT-0001.
- **Affected domain:** Database schema, RLS, identity/isolation.
- **Dependencies (remaining blocker):** definitive cross-learner **runtime isolation tests** require an authorized, populated test environment with **two authenticated learner identities (Learner A / B)** and controlled A/B-owned records (or explicit authorization to create test data in a non-production/empty-DB environment). Explicit re-authorization to resume.
- **Architectural impact:** Informational/verification only; expected to confirm or adjust current-state understanding. Does not itself change architecture.
- **Risk:** MEDIUM–residual — applied RLS policy *definitions* are verified owner/participant/admin-scoped, so the definition-level risk is largely retired; however **runtime** cross-learner enforcement is unexercised (empty DB), the primary remaining verification gap.
- **Priority:** P1 (recommended next work item; sole remaining segment is runtime cross-learner isolation pending a populated/authorized environment with two learner identities).
- **Source/evidence:** AT-0001 baseline audit (live-DB `UNKNOWN — REQUIRES VERIFICATION`); AT-0002 session 1 probes (BLOCKED); session 2 probes — REST data plane reachable, anon-denial on 5 learner tables → HTTP 200 `[]`; session 3 (this) — Management-API live queries recorded to verify: all 5 tables exist + RLS enabled; exact owner/participant/admin-scoped policies for SELECT/INSERT/UPDATE/DELETE; helpers `has_role`/`is_parent_of`/`can_access_classroom_room` + `app_role` enum `{admin,tutor,student,parent}` present; all 5 tables = 0 rows; `auth.users`=0, `user_roles`=0; source↔applied MATCH (`20260530152504`,`20260601045818`,`20260605061006`,`20260622125739`,`20260623113448`, helpers `20260518180453`/`20260522073549`/`20260622125739`). **Evidence classification:** the `docs/evidence/queries/*.sql` files are query definitions only (no captured output); `supabase_schema.json`/`supabase_schema.txt` are failed/error captures (`LegacyDeclarativeNotEnabledError`), NOT schema dumps; the session-3 claims above are historical live-verification narrative recorded in `docs/CURRENT_STATE.md`, not currently reproducible captured evidence. Raw pooler 5432 still unreachable; direct `db.*.supabase.co` does not resolve; no DB connection string/password in repo (Management API used instead). Keys legacy format (`sb_publishable_...` anon, `sb_secret_...` service role).
- **Session history:** (1) BLOCKED — no usable database/REST/local access; REST host unresolvable, pooler 5432 timed out. (2) PARTIAL — REST data plane reachable; anon-denial on learner-owned tables (empty `[]`, ambiguity unresolved); applied-schema/RLS/row-count BLOCKED (no DB path). (3) PARTIAL — applied-DB/RLS/row-count/reconciliation VERIFIED live via Management API; cross-learner A/B runtime isolation still NOT VERIFIED (empty DB, `auth.users`=0, no two identities).
- **Decision status:** `PARTIALLY VERIFIED`. To finish, operator must provide an authorized, populated test environment with two learner identities (+ controlled records) for the runtime cross-learner isolation, then re-authorize resume.

---

## Latent Financial-Integrity Risk — `startCheckout` / `routeCheckoutStart` caller-supplied `amountCents`

- **Category:** Security / Financial Integrity (LATENT)
- **Status:** RECORDED — **not fixed** in AT-0001.
- **Description:** `PaymentGateway.startCheckout` → `routeCheckoutStart` → `paypalCreateOrder` accepts caller-supplied `amountCents` with no server-side re-derivation. The dangerous client-amount path currently has **no caller in `src/`** and the `checkout.functions.ts` client-amount server function exists only in historical/forensic code (`docs/evidence/forensic/forensic_batch_2/`). The live main-repo flow (`create_bulk_lesson_intent`) re-derives gross/commission/net server-side and is server-authoritative.
- **Reason:** If this path were ever wired into `src/` unguarded, a client could set `amountCents` arbitrarily (client-authoritative price → payment under-charge). It is a latent risk, **not** an active exploit claim.
- **Affected domain:** Commerce / payments.
- **Dependencies:** None for recording. Fix would require server-side amount derivation before any activation.
- **Architectural impact:** Would need the amount to be derived server-side before activating this path.
- **Risk:** Latent — high if activated unguarded; currently not active.
- **Priority:** P2 (record; do not fix now).
- **Source/evidence:** Payment gateway adapter/router (`src/infrastructure/adapters/payment-gateway-adapter.ts`, `src/lib/payments/router.server.ts`); `docs/evidence/forensic/forensic_batch_2/src/lib/payments/checkout.functions.ts`; commerce audit (AT-0001).

---

## Reconciliation / Quarantine missing (commerce)

- **Category:** DISCOVERY / NEW FEATURE (gap)
- **Status:** RECORDED — not fixed.
- **Description:** No automated reconciliation/quarantine job matches provider captures against intents/ledger, or flags orphaned/duplicate intents.
- **Reason:** Financial integrity gap identified in commerce audit.
- **Affected domain:** Commerce / ledger.
- **Risk:** Medium (orphan/duplicate detection absent).
- **Priority:** P3.
- **Source/evidence:** Commerce audit (AT-0001).

---

## AI quota enforcement missing / unused (`ai_token_limit_per_user`)

- **Category:** DISCOVERY / ARCHITECTURE CHANGE (gap)
- **Status:** RECORDED — not fixed.
- **Description:** `platform_config.ai_token_limit_per_user` exists (default 100000) and is configurable in admin UI, but no server-side code enforces it. No AI usage/token accounting table exists.
- **Reason:** Quotas/usage logging are incomplete per AI audit.
- **Affected domain:** AI.
- **Risk:** Medium (abuse/cost control absent).
- **Priority:** P3.
- **Source/evidence:** AI audit (AT-0001); `docs/audits/AUDITS_AI_QUOTA_DESIGN.md`.

---

## AI usage logging missing

- **Category:** DISCOVERY (gap)
- **Status:** RECORDED — not fixed.
- **Description:** No AI usage/token/cost/latency logging; no `ai_usage` table.
- **Reason:** Capacity planning and abuse detection impossible without usage logging.
- **Affected domain:** AI / operations.
- **Risk:** Medium.
- **Priority:** P3.
- **Source/evidence:** AI audit (AT-0001).

---

## AI retries/timeouts/moderation incomplete or missing

- **Category:** DISCOVERY (gap)
- **Status:** RECORDED — not fixed.
- **Description:** No automatic retry on transient provider failures; no request timeouts (no `AbortController`/signal on AI provider fetches); no input/output moderation.
- **Reason:** Robustness/safety gaps per AI audit.
- **Affected domain:** AI.
- **Risk:** Medium.
- **Priority:** P3.
- **Source/evidence:** AI audit (AT-0001).

---

## Structured output validation incomplete (AI tool quiz/flashcard JSON)

- **Category:** DISCOVERY (gap)
- **Status:** RECORDED — not fixed.
- **Description:** `aiToolRun` flashcard/quiz outputs request JSON via prompt but are not Zod-validated; malformed output could render raw.
- **Reason:** Structured validation incomplete for identified AI tool outputs.
- **Affected domain:** AI.
- **Risk:** Low–Medium.
- **Priority:** P4.
- **Source/evidence:** AI audit (AT-0001).

---

## `session_records.ai_summary` writer not found in `src/`

- **Category:** UNKNOWN
- **Status:** UNKNOWN — REQUIRES VERIFICATION.
- **Description:** `session_records.ai_summary` column exists and is displayed in the records UI, but no write-path is present in `src/`. Writer may be an external/Edge process not in this codebase.
- **Reason:** Potential AI-OUTPUT-as-EVIDENCE concern; needs verification of the writer and any downstream use.
- **Affected domain:** Learning evidence / AI.
- **Risk:** Medium (unverified AI-output-as-evidence).
- **Priority:** P2 (verify).
- **Source/evidence:** `src/routes/_authenticated/records.tsx`; `src/integrations/supabase/types.ts`; AI audit (AT-0001).

---

## `assessment_submissions` phantom table

- **Category:** DISCOVERY (ghost/dead resource)
- **Status:** RECORDED — not fixed, not deleted.
- **Description:** `assignment_submissions` table + RLS + triggers exist, but zero application consumers exist in the repository.
- **Reason:** Dead/ghost resource; documented so it is not mistaken for a live feature. Do not delete without explicit decision.
- **Affected domain:** Assessment / learning.
- **Risk:** Low (unused) but confusing.
- **Priority:** P4 (document/decide later).
- **Source/evidence:** Migration `20260530152504_*.sql`; `src/integrations/supabase/types.ts`; assessment/contradiction audits.

---

## `LearningRecordRepository` port unwired

- **Category:** DISCOVERY / PROPOSED (gap)
- **Status:** RECORDED — not implemented.
- **Description:** `src/domain/ports/learning.ts` defines `LearningRecordRepository` and `LearningStageEvidence`, but there is no implementation, no wiring into `AppDependencies`, and no consumer. Interface-only/unused.
- **Reason:** Learning/assessment backend is `PROPOSED / UNACCEPTED`; this port is aspirational, not implemented.
- **Affected domain:** Learning / assessment.
- **Risk:** None currently (unused); represents the proposed direction.
- **Priority:** P4 (blocked on architecture decision).
- **Source/evidence:** `src/domain/ports/learning.ts`; `src/application/contracts/dependencies.ts`; learning audit.

---

## Quiz scoring is client-side and ephemeral

- **Category:** DISCOVERY / PROPOSED (gap)
- **Status:** RECORDED — not fixed.
- **Description:** Simulation-lab quiz scoring is inline client render logic (`labs_.simulation-lab.tsx`); "Finish" resets state; no server call; no persisted attempt/score/completion. No assessment-result/attempt/mastery table exists.
- **Reason:** No authoritative assessment-result persistence currently exists.
- **Affected domain:** Assessment / learning.
- **Risk:** Assessment results not machine-readable; cannot feed mastery.
- **Priority:** P4 (blocked on assessment architecture decision).
- **Source/evidence:** Assessment audit (AT-0001); `labs_.simulation-lab.tsx`.

---

## Stale architecture documentation

- **Category:** DISCOVERY (documentation)
- **Status:** RECORDED — not deleted, not silently rewritten.
- **Description:** Several root-inventory/planning documents under `docs/archive/` are stale (reference deleted `src/components/`, `src/hooks/`, 9 deleted `*.functions.ts` shims; wrong file counts). `docs/audits/AUDITS_*` and `docs/audits/GAP_REGISTER.md` are substantially current. `README.md` was generic boilerplate (rewritten as an evidence-based entry document during the documentation restructuring — see `docs/CHANGE_LOG.md`).
- **Reason:** Stale documentation must not be treated as fact. Recorded in `CURRENT_STATE.md`/audit; existing files preserved as historical snapshots.
- **Affected domain:** Documentation.
- **Risk:** Low (misleading if treated as current).
- **Priority:** P4.
- **Source/evidence:** Documentation/code contradiction audit (AT-0001).

---

## Dead DB functions referencing nonexistent columns

- **Category:** DISCOVERY (dead code)
- **Status:** RECORDED — not fixed.
- **Description:** Migration `20260814140000_...` defines `check_session_eligibility` / `mark_beyond_book_session` that reference a `tutor_subscriptions.user_id` column that does not exist (table has `tutor_id`) and a `user_metadata` table not otherwise required. Inert/dead (no callers found).
- **Reason:** Dead/misleading DB objects documented; do not fix/delete without explicit decision.
- **Affected domain:** Commerce/entitlements (DB).
- **Risk:** Low (inert) but misleading.
- **Priority:** P4.
- **Source/evidence:** Commerce audit (AT-0001); `20260814140000_*.sql`.

---

## RLS automated verification absent

- **Category:** DISCOVERY / ARCHITECTURE CHANGE (gap)
- **Status:** RECORDED — not fixed.
- **Description:** RLS policies exist at source, but there is no automated RLS/authorization test suite and no IDOR/assessment-data RLS coverage. Only ad-hoc `.sql` audit scripts exist.
- **Reason:** Quality/security testing incomplete.
- **Affected domain:** Security / quality.
- **Risk:** Medium (no automated re-verification; applied RLS policy *definitions* verified live via AT-0002 as recorded session-3 narrative — current reproducible live evidence NOT VERIFIED — and runtime cross-learner isolation still unexercised).
- **Priority:** P2 (tie to AT-0002 live verification).
- **Source/evidence:** Quality/security audit (AT-0001); test suite (only 3 files).
