# AskATutorLive — Backlog

- **Work ID:** AT-0001
- **Status register:** This is the single register of real, accepted, or candidate work.
- **Rule:** Backlog entries are NOT implemented as a side effect of this audit. Beginning a backlog item requires an explicit, separate authorization (the item enters PLANNED → IN_PROGRESS).
- **Verification-queue snapshot (2026-09-14):** every item's verification state (VERIFIED / PARTIALLY VERIFIED / BLOCKED / PRODUCTION-VERIFICATION-PENDING) is inventoried authoritatively in `docs/audits/AUDIT_VERIFICATION_QUEUE_20260914.md` (CHANGE_LOG → AUDIT-0001); the keystone prerequisite `APPROVED NON-PRODUCTION RUNTIME + TEST USERS` remains **BLOCKED / NOT AVAILABLE**. That audit upgrades no status to VERIFIED.

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
- **Status:** `VERIFIED WITH ACTIONABLE FINDINGS` (final, post session 6; see Session History (1)–(6) and Decision Status below) → **session 5: NON-production cross-learner RUNTIME isolation = EXECUTED and VERIFIED (588 PASS / 40 BLOCKED / 0 FAIL)**. **Table-set definition:** the AT-0002 learner tables are Set A (`assignments`, `assignment_submissions`, `notes`, `session_records`, `simulations`) — Set B is the Category-2 / GAP-001..005 tracked set (`profiles`, `user_roles`, `tutor_subscriptions`, `tutor_courses`, `sessions`) and is NOT called "the 5 learner tables". **Production applied-state** (applied schema, RLS policy definitions, helper functions, `app_role` enum, row/data-presence, source↔applied reconciliation for Set A) = recorded VERIFIED live as **session-3 historical narrative** (authenticated Management API over HTTPS — read-only; no captured in-repo artifacts). **Session 4: `NON-production migration reproduction = VERIFIED`** — the repository's **73 migrations applied 73/73** to the dedicated hosted non-prod project `askatutorlive-at0002-nonprod` (ref `rwpxaejhouunxlcibpou`, eu-west-1, Postgres 17; same org, production untouched) via the Management API migrations endpoint (CLI `db push` network-blocked on this host), with **captured** schema/RLS/auth reconcile evidence (session-local Temp artifacts; two documented deltas: `storage.objects` seeding and migration-history `version` representation — see CURRENT_STATE Isolation Findings → Session 4). **Session 5 (this): runtime cross-learner isolation EXECUTED on the non-prod project** — populated 20 learners + 1 admin + 3 tutors + 1 parent and controlled per-learner records across all Set-A tables, then ran a 628-case authorization harness (positive controls, cross-learner read matrix, cross-learner write INSERT/UPDATE/DELETE with post-state DB verification, IDOR read/update/delete, RPC role boundaries, role escalation, anonymous): **588 PASS / 40 BLOCKED / 0 FAIL** — no cross-learner read, no cross-learner write, no IDOR mutation succeeded; only DENIED/4xx/0-row outcomes; DB state unchanged after every attack. The 40 BLOCKED are the `sessions` table (empty `relacl` → 403 for every REST role incl. `service_role`; fail-closed functional gap, not leakage). Also grantless: `profiles`, `user_roles`, `classroom_chat`, `messages`, `subjects`, `forum_posts`, `tutor_applications`, ~20 tables total; `session_records` SELECT is 403 for `authenticated` (read policy references grantless `sessions`) though plain POST INSERT works. **Open items (separately authorized): (1) grant-gap remediation** — GRANT intended `/rest/v1` privileges per the migration source of truth, then re-run the harness; (2) optionally re-run the same matrix against **production** once populated. **Session 6 (this): NON-production `sessions` grant-gap remediation = EXECUTED and VERIFIED (separately authorized)** — minimal intended `public.sessions` GRANTs restored (`authenticated` = arwd, `service_role` = ALL, `anon`/`postgres` untouched; RLS unchanged; only `sessions.relacl` changed); previously-blocked 40 `sessions` REST cases = **40/40 PASS**; full 628-case regression = **628/628 PASS**; `session_records` SELECT/rep-INSERT restored; residue 0. Remaining actionable findings: `profiles`/`user_roles` + ~18 sibling empty-`relacl` tables (`42501` on the two `sessions` INSERT WITH CHECK policies and `book_session` via `profiles`); production `anon` over-grant (`arwdDxtm`) — see Findings. Production zero-touch maintained; non-prod RLS never weakened. See Session History below.
- **Description:** Verify the live production Supabase state: whether migrations are applied, live table existence and row counts (especially `assignments`, `assignment_submissions`), and that RLS policies actually enforce the intended ownership boundary. Confirm Learner-A-vs-Learner-B isolation with cross-user checks.
- **Reason:** Live database/applied-migration/RLS state could not be verified from the repository alone (no DB connection string in the repo). This is the single largest unresolved security/isolation verification boundary identified in AT-0001.
- **Affected domain:** Database schema, RLS, identity/isolation.
- **Dependencies (remaining blocker):** cross-learner runtime isolation for the grant-bearing learner tables is DONE (session 5, non-prod) and the `sessions` REST grant gap is REMEDIATED (session 6, non-prod). Remaining dependencies are authorization for: (1) the **residual grant-gap remediation** (non-prod `profiles`/`user_roles` + ~18 sibling empty-`relacl` tables — `42501` on the two `sessions` INSERT WITH CHECK policies and `book_session` via `profiles`) and the **production `anon` over-grant REVOKE/investigation** (`arwdDxtm` on `sessions`/`profiles`/`session_records`/`user_roles`), and (2) optionally re-running the session-5 matrix against **production** once production is populated.
- **Architectural impact:** Informational/verification only; expected to confirm or adjust current-state understanding. Does not itself change architecture.
- **Risk:** MEDIUM–residual — applied RLS policy _definitions_ are verified owner/participant/admin-scoped, and **runtime** cross-learner enforcement is now VERIFIED for the grant-bearing learner tables on non-prod (session 5), with the **`sessions` grant gap REMEDIATED and re-verified** (session 6: 40/40 + 628/628 PASS). Residual: `profiles`/`user_roles` + ~18 sibling empty-`relacl` tables remain REST-inaccessible to every role (fail-closed functional gap; `42501` on session INSERT/`book_session`), the production anchor over-grants `anon`, and production runtime remains unexercised (empty DB).
- **Priority:** P1 (recommended next work items, each separately authorized: residual grant-gap remediation for `profiles`/`user_roles` + ~18 sibling empty-`relacl` tables; production `anon` over-grant REVOKE/investigation; optional re-run of the runtime matrix against production once populated).
- **Source/evidence:** AT-0001 baseline audit (live-DB `UNKNOWN — REQUIRES VERIFICATION`); AT-0002 session 1 probes (BLOCKED); session 2 probes — REST data plane reachable, anon-denial on 5 learner tables → HTTP 200 `[]`; session 3 — Management-API live queries recorded to verify (production): all 5 tables exist + RLS enabled; exact owner/participant/admin-scoped policies for SELECT/INSERT/UPDATE/DELETE; helpers `has_role`/`is_parent_of`/`can_access_classroom_room` + `app_role` enum `{admin,tutor,student,parent}` present; all 5 tables = 0 rows; `auth.users`=0, `user_roles`=0; source↔applied MATCH (`20260530152504`,`20260601045818`,`20260605061006`,`20260622125739`,`20260623113448`, helpers `20260518180453`/`20260522073549`/`20260622125739`); session 4 (this) — non-prod reproduction: dedicated hosted non-prod project created (`rwpxaejhouunxlcibpou`); Management API migrations endpoint (CLI `db push` network-blocked — pooler resolves to IPv6 the CLI rejects; direct host unresolvable); reset + spaced replay applied all **73 migrations 73/73 in lexical order**; applied-history = exactly the 73 repo filenames; reconcile captured (61 RLS-enabled tables incl. Set A/B; enums incl. `app_role`; functions/ACLs; auth baseline email-confirmation-on, 0 users, 0 objects); deltas: `storage.objects` pre-seeded policies dropped pre-replay, API-assigned `version` timestamps vs CLI filename-prefix. **Evidence classification:** the `docs/evidence/queries/*.sql` files are query definitions only (no captured output); `supabase_schema.json`/`supabase_schema.txt` are failed/error captures (`LegacyDeclarativeNotEnabledError`), NOT schema dumps; session-3 claims are historical live-verification narrative in `docs/CURRENT_STATE.md`; session-4 non-prod evidence is captured current-session artifacts under `%LOCALAPPDATA%\Temp\opencode\at0002-*` (not committed). Raw pooler 5432 still unreachable; direct `db.*.supabase.co` does not resolve; no DB connection string/password in repo (Management API used instead; production `.env`/`config.toml` untouched). Keys legacy format (`sb_publishable_...` anon, `sb_secret_...` service role). **Session 6 (this) — non-prod grant-gap remediation evidence (captured, session-local `%LOCALAPPDATA%\Temp\opencode\at0002-runtime\`, not committed):** `grant-state-before.json`/`grant-state-after.json` (`sessions.relacl` EMPTY → `{postgres=arwdDxtm/postgres,authenticated=arwd/postgres,service_role=arwdDxtm/postgres}`; `has_table_privilege` authenticated=True/service_role=True/anon=False); `rls-diff-after-remediation.json` (policies/functions/schema_usage/default_acl byte-identical; only `sessions.relacl` changed); `remediation-record.json`; `ev-smoke-after.json` (11/11 PASS); `ev-blocked-40-rerun.json` (**40/40 PASS** on the exact blocked-40 set); `ev-phase6-rerun.json` (**628/628 PASS**, residue 0); `rerun-blocked-40.ps1`/`regress-full.ps1`/`smoke-after.ps1` harnesses. `profiles` discovery: `42501 permission denied for table profiles` (hint `GRANT SELECT ON public.profiles TO authenticated;`) on non-admin session INSERT/`book_session` — out of scope, recorded as actionable finding. Production `anon` over-grant (`arwdDxtm` on `sessions`/`profiles`/`session_records`/`user_roles`) read-anchored from the production anchor — recorded as actionable finding.
- **Session history:** (1) BLOCKED — no usable database/REST/local access; REST host unresolvable, pooler 5432 timed out. (2) PARTIAL — REST data plane reachable; anon-denial on learner-owned tables (empty `[]`, ambiguity unresolved); applied-schema/RLS/row-count BLOCKED (no DB path). (3) PARTIAL — production applied-DB/RLS/row-count/reconciliation VERIFIED live via Management API (historical narrative); cross-learner A/B runtime isolation still NOT VERIFIED (empty DB, `auth.users`=0, no two identities). (4) PARTIAL → non-prod reproduction DONE — repository's 73 migrations applied 73/73 to dedicated hosted non-prod `rwpxaejhouunxlcibpou` (captured evidence); production untouched. (5) RUNTIME VERIFIED ON NON-PROD — populated 25 principals (20 learners/1 admin/3 tutors/1 parent) + controlled Set-A records; 628-case authorization harness → **588 PASS / 40 BLOCKED / 0 FAIL**; no cross-learner read/write/IDOR succeeded (DB state verified); 40 BLOCKED = `sessions` empty-`relacl` 403s; ~20 empty-`relacl` tables recorded. (6) SESSIONS GRANT GAP REMEDIATED ON NON-PROD (separately authorized) — minimal intended `GRANT SELECT,INSERT,UPDATE,DELETE ON public.sessions TO authenticated` + `GRANT ALL ON public.sessions TO service_role` applied via Management API query; RLS untouched (before/after: only `sessions.relacl` changed); 11-case functional smoke 11/11 PASS; previously-blocked 40 = **40/40 PASS**; full 628-case regression (`regress-full.ps1`) = **628/628 PASS** (zero PASS→FAIL flips); `session_records` SELECT rep + representation-INSERT (201) restored; residue 0. Production zero-touch maintained; non-prod RLS never weakened.
- **Decision status:** `VERIFIED WITH ACTIONABLE FINDINGS`. Non-prod migration reproduction VERIFIED (73/73, captured); non-prod **runtime cross-learner isolation VERIFIED** for all grant-bearing learner tables (588 PASS / 40 BLOCKED / 0 FAIL, captured); **`sessions` grant-gap remediation VERIFIED on non-prod (session 6: blocked 40 → 40/40 PASS; 628-case regression → 628/628 PASS; RLS unchanged)**. Remaining actionable findings (separate authorized remediation): residual fail-closed grant gaps (`profiles`/`user_roles` + ~18 empty-`relacl` tables — `42501` on the two `sessions` INSERT WITH CHECK policies and `book_session` via `profiles`) and the production `anon` over-grant (`arwdDxtm`); optionally re-run the matrix against production once populated.

---

## Latent Financial-Integrity Risk — `startCheckout` / `routeCheckoutStart` caller-supplied `amountCents`

- **Category:** Security / Financial Integrity (LATENT)
- **Status:** RECORDED — **MITIGATED ON THE LIVE PATH (AT-0005), forensic code still present.** The live `startCheckout` path was activated in AT-0005 **behind a server-authoritative use-case only** (`src/application/use-cases/commerce/initiate-checkout.ts`): the client sends only `{tutorId, lessons, lessonMinutes}` (zod-validated) and `create_bulk_lesson_intent` re-derives gross/commission/net server-side; the use-case passes the server-derived amount to `PaymentGateway.startCheckout`. The dangerous client-amount variant (`checkout.functions.ts` + `PayButton.tsx`) exists **only** in historical/forensic code (`docs/evidence/forensic/forensic_batch_2/`) and must **never be resurrected into `src/`**.
- **Description:** `PaymentGateway.startCheckout` → `routeCheckoutStart` → `paypalCreateOrder` accepts caller-supplied `amountCents` with no server-side re-derivation. The dangerous client-amount path has **no caller in `src/`** (the only live caller is the AT-0005 `initiateCheckout` use-case, which supplies a server-derived amount). The `checkout.functions.ts` client-amount server function exists only in historical/forensic code (`docs/evidence/forensic/forensic_batch_2/`).
- **Reason:** A non-server-authoritative caller wired in the future could let a client set `amountCents` arbitrarily (client-authoritative price → payment under-charge). Mitigated on the live path; the invariant is still structural, not enforced by the gateway itself.
- **Affected domain:** Commerce / payments.
- **Dependencies:** None for recording. A full fix would require the gateway/route to re-derive or validate the amount regardless of caller.
- **Architectural impact:** Amount must always be derived server-side before any activation; any new `startCheckout` caller must follow the AT-0005 pattern.
- **Risk:** Latent — mitigated on the live path; structural hardening (gateway-level re-derivation/validation) still recommended.
- **Priority:** P2 (record; structural hardening remains a separate authorized item).
- **Source/evidence:** Payment gateway adapter/router (`src/infrastructure/adapters/payment-gateway-adapter.ts`, `src/lib/payments/router.server.ts`); `src/application/use-cases/commerce/initiate-checkout.ts` (AT-0005); `docs/evidence/forensic/forensic_batch_2/src/lib/payments/checkout.functions.ts`; commerce audit (AT-0001).

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
- **Description:** `platform_config.ai_token_limit_per_user` exists (default 100000) and is configurable in admin UI, which labels it an approximate monthly budget per user. Production was read-only checked at 100000 on 2026-09-23. No server-side code enforces it and no AI usage/token accounting table or ledger was found. Do not implement an arbitrary counter until token units, period/reset, provider usage treatment, concurrency, failures/retries, paid-role treatment, and exhaustion behavior are defined.
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

## `assignment_submissions` table has no application workflow

- **Category:** DISCOVERY / IMPLEMENTATION GAP.
- **Status:** RECORDED — schema exists; workflow not implemented.
- **Description:** The `assignment_submissions` table, RLS, triggers, and generated types exist, but no application consumer/workflow was found in the repository.
- **Reason:** Distinguish persistence from user-facing submission/review behavior; retain the schema while its intended workflow is evaluated.
- **Affected domain:** Assessment / learning.
- **Risk:** Low (unused) but confusing.
- **Priority:** P2 (learning workflow gap; align with AT-0011).
- **Source/evidence:** Migration `20260530152504_*.sql`; `src/integrations/supabase/types.ts`; assessment/contradiction audits.

---

## `LearningRecordRepository` port unwired

- **Category:** DISCOVERY / PROPOSED (gap)
- **Status:** RECORDED — not implemented.
- **Description:** `src/domain/ports/learning.ts` defines `LearningRecordRepository` and `LearningStageEvidence`, but there is no implementation, no wiring into `AppDependencies`, and no consumer. Interface-only/unused.
- **Reason:** The bounded learning/assessment target model is accepted in D-0005 but not implemented; the port remains an unused placeholder and does not define the accepted persistence contract.
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
- **Risk:** Medium (no automated re-verification; applied RLS policy _definitions_ verified live via AT-0002 as recorded session-3 narrative — current reproducible live evidence NOT VERIFIED — though the non-prod RUNTIME cross-learner harness (session 5) now provides captured behavioral evidence; the harness itself is Temp-dir, not committed/automated).
- **Priority:** P2 (tie to AT-0002 live verification).
- **Source/evidence:** Quality/security audit (AT-0001); test suite (only 3 files).

---

## AT-0003 — Phase 0 (AT-0000) Exit-Gate Closure Assessment

- **Category:** Governance / Process (documentation-only)
- **Description:** Evidence-based exit-gate assessment of the historical Phase 0 exercise (AT-0000). Produced a 10-gate closure table (9 VERIFIED; the sole NOT-VERIFIED gate = Phase-1 gating decisions ATD-0009/ATD-0010), classified every unresolved Phase-0 item into A/B/C/D/E categories, and recorded the recommended verdict `CLOSED WITH EXPLICIT FOLLOW-UPS` (`docs/DECISION_LOG.md` → D-0006, **pending human acceptance**).
- **Reason:** The archived Phase 0 record carried status `COMPLETE-PENDING-REVIEW` (awaiting reviewer approval for COMPLETE); this exercise supplies the evidence and the recommendation for that review. Phase 1 must not start until ATD-0009/ATD-0010 resolve (archive phase dependency).
- **Affected domain:** Engineering process / governance (docs only).
- **Dependencies:** None (uses present-state evidence from AT-0001/AT-0002).
- **Architectural impact:** None (no application architecture changed or accepted).
- **Risk:** Low.
- **Priority:** P0 (closure).
- **Source/evidence:** `docs/archive/MASTER_PLAN (2).md`, `docs/archive/CURRENT_STATE (2).md`, repo git history, AT-0001 baseline audit, AT-0002 sessions 4–6, `docs/architecture/INSTITUTIONAL_LEARNER_DESIGN.md` (§14), `docs/architecture/LEARNING_ASSESSMENT_DESIGN.md` (§21).
- **Status:** COMPLETED (as an assessment — the verdict remains PENDING HUMAN ACCEPTANCE; acceptance is the reviewer's act, not auto-applied). Not VERIFIED (no independent re-check performed).

### Phase 0 carried-forward registers (from AT-0003 — separately owned; none blocks Phase 0 completeness)

| ID     | Item                                                                                                                                                                                                                  | Type                               | Owner / phase           | Status                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| CF-001 | ATD-0009 — testing framework decision (UN-001; TR-008)                                                                                                                                                                | Product/engineering decision       | Phase 1 **gate**        | OPEN — blocks Phase 1 start                                                 |
| CF-002 | ATD-0010 — deployment platform decision (UN-002; TR-009)                                                                                                                                                              | Product/engineering decision       | Phase 1 **gate**        | OPEN — blocks Phase 1 start                                                 |
| CF-003 | Learning-design §21 acceptance list (vocabulary, item sets, affective signal set, diagnosis mapping, mastery semantics, decision-autonomy) + INST-DEC-6/7/8/9                                                         | Product/learning + legal decisions | Phase 4–6 backbone prep | OPEN                                                                        |
| CF-004 | INST-DEC-2/3 acceptance (product); INST-DEC-4/10 resolve at engineering time                                                                                                                                          | Architecture decisions             | Design follow-up        | OPEN                                                                        |
| CF-005 | UN-003 PhET scope (Phase 6); UN-004/UN-005 video/voice recording limits (Phase 3); UN-006 institution link flow (Phase 8)                                                                                             | Future implementation              | Phase-locked            | OPEN — NOT before its phase                                                 |
| CF-006 | AI Gateway / Model Router (Phase 5)                                                                                                                                                                                   | Future implementation              | Phase 5                 | OPEN (centralised `AiGateway` verified present; router component not built) |
| CF-007 | N-instructor (multiple-instructor) support                                                                                                                                                                            | Future implementation              | unassigned              | OPEN (zero `instructor` matches in `src/`; HISTORICAL/PLANNED)              |
| CF-008 | ATD-0011 auth-provider **production configuration** (D-0003 scope); AT-0002 residuals (production `anon` over-grant `arwdDxtm`, optional production runtime matrix once populated); affective retention/legal posture | Production verification            | operational / legal     | OPEN                                                                        |
| CF-009 | `session_records.ai_summary` writer                                                                                                                                                                                   | Evidence-resolvable                | verification            | OPEN (see P2 entry above)                                                   |
| CF-010 | MASTER_PLAN §1 vs D-0005 alignment; stale archive preservation                                                                                                                                                        | Doc reconciliation                 | this exercise / P4      | CLOSED (aligned here) / PRESERVED                                           |

---

## AT-0004 — Presentation Foundation, Public Trust Pages & Build Repair

- **Category:** Presentation / engineering (branch work + verification + tooling repair)
- **Description:** On branch `presentation/public-trust-pages` (vs `origin/main` `404ea77`): (1) merged `origin/main` into the branch, resolving terms/privacy/footer conflicts with branch shell + main content (HEAD `31dc916`); (2) implemented and verified the public trust pages (`about.tsx`, `contact.tsx`, `privacy.tsx`, `terms.tsx`) and the shared navigation foundation (`navigation-visibility`, `AppShell`, `Navbar`, `MobileTabBar`, `CommandPalette`, auth/role boundaries) — all committed on the branch; (3) corrected the Windows build (`cross-env`; `pnpm build` → SUCCESS); (4) fixed the `__root.tsx` `ErrorComponent` typing (`tsc` 0 errors) and regenerated `routeTree.gen.ts` for the trust-page routes; (5) applied repo-wide prettier normalization (474 prior violations → `prettier --check .` clean); (6) produced an evidence-based classification of the entire working tree (263 formatting-only + 9 substantive modified + 4 created audit artifacts + 2 untracked pnpm files); (7) committed the change set in two commits (13 substantive + 263 formatting-only; pnpm lockfiles excluded per D-0007).
- **Reason:** Deliver the public trust pages and a consistent presentation/navigation foundation; repair Windows build/type failures; make formatting state verifiably clean before commit.
- **Affected domain:** Presentation (navigation), public routes, build scripts, repository formatting.
- **Dependencies:** None (branch work; merge of `origin/main` completed).
- **Architectural impact:** Navigation ownership centralized (`navigation-visibility` shared rules; Navbar null on app-shell routes; MobileTabBar null on immersive/app-shell). No new application-architecture decision accepted (D-0007 is engineering/process only).
- **Risk:** Low — verification all green (tsc/prettier/build); lint baseline unchanged (112 known problems = technical debt). Residual: package-manager split and ineffective `entities` override (D-0007).
- **Priority:** P1 (commit the verified change set — DONE).
- **Source/evidence:** `docs/CURRENT_STATE.md` → AT-0004; `docs/CHANGE_LOG.md` → AT-0004; `docs/DECISION_LOG.md` → D-0007; `audit-evidence/working-tree-classification.json` (+`classify-worktrees.mjs`, `verify-quoted-docs.mjs`).
- **Status:** COMPLETED — implemented, verified, classified, and committed in two commits (13 substantive + 263 formatting-only). `pnpm-lock.yaml`/`pnpm-workspace.yaml` excluded from the commit (D-0007: bun authoritative workflow; pnpm NOT adopted). Follow-ups from D-0007: `entities@4.5.0` pin **RESOLVED — NOT REQUIRED, dead `pnpm.overrides` removed from `package.json`**; clean Bun install verified (822 packages, tsc 0, prettier clean, lint 112 baseline, build SUCCESS). Package-manager unification remains an open human decision.

---

## AT-0005 — Auth/Origin Verification (`localhost:3000`) & Self-Service Checkout Enablement

- **Category:** Verification / Security + Commerce (slice)
- **Description:** (1) Evidence-classified the `localhost:3000`/Lovable scaffold code as **INERT/DEPRECATED** (`previewAuthStorage.ts` activates only under a project-UUID host + framed window + editor-origin match; dev runs at 8080; dev server smoke-tested HTTP 200 on `/`, `/auth`, `/reset-password`, `/tutors`, `/dashboard` with no port-3000 or Supabase-ref leakage in SSR HTML) — **no auth code change made**. (2) Wired the previously-latent `PaymentGateway.startCheckout` behind a **server-authoritative** use-case (`src/application/use-cases/commerce/initiate-checkout.ts` + `getCheckoutState`), consuming `create_bulk_lesson_intent` (server-derived amount) with return/cancel URLs rooted at `PUBLIC_BASE_URL || VITE_PUBLIC_BASE_URL || request origin`; updated `pay-tutor.tsx` to redirect via the approval URL and rewrote `checkout.success.tsx` as an authoritative state page (`/checkout/success`, `validateSearch({intent})`, 5 s refetch, server-confirmed amount/states); `BulkLessonConfig.tsx` copy/button updated. (3) Authored migration `20260914120000_self_service_checkout_intent_finalize.sql` fixing two SQL blockers: restored the `authenticated` EXECUTE grant on `create_bulk_lesson_intent` (lost in the 2026-08-12 hardening) and made `finalize_payment_succeeded` credit `prepaid_lessons` for `kind='bulk_lessons'` intents (previously only admin-only `confirm_bulk_lesson_intent` did).
- **Reason:** Instrument the dormant commerce engine for student self-service payments without re-opening the client-amount risk; resolve the two migration-level blockers for the self-service path; deliver an evidence-recorded verdict for the outstanding `localhost:3000`/Lovable audit question.
- **Affected domain:** Commerce (checkout), auth investigation (no change), Supabase migrations.
- **Dependencies:** None for implementation. Applying the migration to an environment requires separate authorization + mandatory migration verification.
- **Architectural impact:** `startCheckout` gains its first live caller (server-authoritative); no gateway/router architecture changed. New migration affects `create_bulk_lesson_intent` grants and `finalize_payment_succeeded` behavior.
- **Risk:** Low in-repo (tsc 0, prettier clean, eslint clean on changed files, lint 112 baseline unchanged, build SUCCESS). Not `PRODUCTION-VERIFIED` (no live PayPal execution; migration not applied).
- **Priority:** P1 (implemented + verified in-repo). Remaining separately-authorized steps: apply+verify migration to the target DB; live provider sandbox test; commit decision.
- **Source/evidence:** `docs/CURRENT_STATE.md` → AT-0005; `docs/CHANGE_LOG.md` → AT-0005; `docs/DECISION_LOG.md` → D-0008; git origin for `previewAuthStorage.ts` (`4c74239`) and the Lovable-removal commit `59710c5` (2026-08-12).
- **Status:** IMPLEMENTED + VERIFIED (in-repo, uncommitted). **No commit made** — commit only on explicit instruction; `pnpm-lock.yaml`/`pnpm-workspace.yaml` remain untracked/excluded.

---

## Follow-up candidates (AT-0005 residue — each requires separate authorization)

### FC-001 — Lovable/preview scaffold removal (incl. `localhost:3000` references)

- **Category:** Cleanup / Legacy removal
- **Description:** Remove or quarantine the deprecated Lovable-era scaffold artifacts and `localhost:3000` references: `previewAuthStorage.ts` (added `4c74239`; DEPRECATED per D-0008), the generated-file headers with no generator manifest, and the `localhost:3000`/`PORT=3000` fallbacks in `scripts/start-node.mjs`/`.env.example`/`DEPLOYMENT.md`. App must not depend on port 3000.
- **Reason:** Legacy integration support is inert but present; D-0008 classifies it DEPRECATED; removal reduces confusion and audit surface.
- **Risk:** Low (inert).
- **Priority:** P3.
- **Status:** RECORDED — not started.

### FC-002 — Navigation-visibility dot/slash drift and `whiteboard-review` stub

- **Category:** Documentation / Navigation debt
- **Description:** `APP_SHELL_PREFIXES` uses dot-form `/checkout.success` while the actual routes are slash-form `/checkout/success` (reproduced in AT-0005; real drift, no functional match). `whiteboard-review/$sessionId` remains a stub ("Recording playback is being upgraded").
- **Reason:** Prevent future navigation/ownership confusion and finish the review surface.
- **Risk:** Low.
- **Priority:** P3.
- **Status:** RECORDED — not started.

### FC-003 — Apply + verify the AT-0005 migration on the target database

- **Description:** Apply `20260914120000_self_service_checkout_intent_finalize.sql` to the chosen environment (non-prod first, then production by authorization) and verify: `create_bulk_lesson_intent` is executable by `authenticated`, and a completed bulk capture credits `prepaid_lessons` exactly once (idempotency).
- **Reason:** The migration is authored but unapplied; the self-service checkout slice depends on it.
- **Risk:** Medium (financial correctness) — warranting a live non-prod test before production.
- **Priority:** P1.
- **Status:** **COMPLETED on non-prod — VERIFIED at the DB layer (classified `PARTIALLY VERIFIED`); LIVE provider path BLOCKED on sandbox credentials.** Production application NOT performed (no authorization). NO commit made.
- **Execution (2026-09-14, non-prod `rwpxaejhouunxlcibpou` `askatutorlive-at0002-nonprod`, eu-west-1):**
  - **Pre-apply proof (the bug):** `create_bulk_lesson_intent` proacl = `{postgres=X/postgres}` — no role could EXECUTE it; `finalize_payment_succeeded` proacl = `{postgres=X/postgres,service_role=X/postgres}`; applied history = 73; the only repo migration newer than applied was `20260914120000_self_service_checkout_intent_finalize.sql`.
  - **Apply:** Management API `POST /v1/projects/{ref}/database/migrations` with the verbatim file bytes (`query`), `name = 20260914120000_self_service_checkout_intent_finalize.sql`, `rollback` = prior function definition + old grant state (captured at `%LOCALAPPDATA%\Temp\opencode\fc003-rollback.sql`). Recorded as version `20260914073900`; applied count 73 → 74. (The API auto-assigns a per-second server timestamp as `version`.)
  - **Post-apply:** `create_bulk_lesson_intent` proacl = `{postgres=X/postgres,authenticated=X/postgres}` (`has_function_privilege`: authenticated true, anon false); `finalize_payment_succeeded` unchanged (service_role only); function body contains the `bulk_lessons` branch → `prepaid_lessons` credit; RLS policy counts unchanged (payment_intents 3, payment_attempts 1, prepaid_lessons 1, ledger_entries 2).
  - **DB behavior tests (5/5 PASS; single transactional batch; ROLLBACK → zero residue):** (1) student s001 → intent pending, gross 25000¢, commission 3750¢ (gold 15%), net 21250¢, USD, method online, metadata `{kind:bulk_lessons,lessons:5,lesson_minutes:60}`, student = caller; (2) `create_bulk_lesson_intent(uuid,int,int,text)` has **no amount parameter** — server re-derives the amount (50×100×(60/60)×5 = 25000); (3) `finalize_payment_succeeded` called twice → ledger 2 rows, `prepaid_lessons` 1 row, idempotent, status `succeeded`, provider_ref `sandbox:fc003-capture-A` (first call wins), prepaid row = 5/5 lessons / 60 min / hourly_rate_cents 5000 / USD / intent-linked; (4) s002 without scope → rejected `Find Tutors subscription required`; (5) `SET ROLE authenticated` → `permission denied for function finalize_payment_succeeded` (service_role boundary intact). Post-rollback residue: leftover users/intents/assignments/prepaid/ledger = 0.
  - **LIVE provider path BLOCKED:** `payment_providers` row `paypal` is `is_enabled=false`, `credentials_ref=PAYPAL`, and no `PAYPAL_*` env vars exist on the host → no live PayPal sandbox checkout test was possible. The migration's DB layer is VERIFIED; the end-to-end provider handshake is NOT VERIFIED.
  - **Regression (Phase 7, all at baseline):** `bunx tsc --noEmit` 0; `bunx prettier --check .` clean; `bun run lint` 112 (74 err / 38 warn — unchanged); `bun run build` SUCCESS.
- **Not claimed:** `PRODUCTION-VERIFIED`; production apply; live-provider end-to-end; any manual "payment succeeded" fabrication. Remaining production apply requires separate authorization + a live provider test per AT-0005 NEXT ACTION.

### FC-004 — PayPal SANDBOX configuration + end-to-end checkout verification

- **Category:** Controlled verification (payment provider) — NO redesign, NO application-code change, NO production work.
- **Description:** Determine whether the EXISTING AT-0005 checkout implementation can complete ONE genuine PayPal SANDBOX transaction in the designated NON-PRODUCTION environment (`rwpxaejhouunxlcibpou`), through the existing `/pay-tutor → initiateCheckout → create_bulk_lesson_intent → PaymentGateway.startCheckout → PayPal sandbox → return/webhook → finalize_payment_succeeded → prepaid_lessons → /checkout/success` flow.
- **Status:** **BLOCKED — SANDBOX CREDENTIALS UNAVAILABLE.** No checkout was initiated; no provider transaction occurred; NO code change, NO configuration change, NO database change, NO commit.
- **Evidence (2026-09-14, FC-004 Phase 1–3):**
  - **Provider row (non-prod read-only):** `payment_providers.paypal` = `is_enabled=false`, `mode=sandbox`, `credentials_ref=PAYPAL`, `priority=10`. Table has no secret columns (`config` jsonb is empty for paypal); credentials are resolved **only** from process env by `paypal.server.ts readCreds()` (`${ref}_CLIENT_ID` / `${ref}_CLIENT_SECRET` / `${ref}_WEBHOOK_ID`).
  - **Env sweep (process/user/machine + `.env`/`.env.local`/`.env.example`):** `PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET`/`PAYPAL_WEBHOOK_ID`/`PAYPAL_ENVIRONMENT` = ABSENT everywhere. `.env.local` empty; `.env` contains only Supabase + keys.
  - **Runtime wiring (additional blocker):** the app runtime `.env` points `SUPABASE_URL`/`VITE_SUPABASE_URL` at **PRODUCTION** `bzjlhxmiwdkteqkzqasi`; there is NO non-prod runtime (no `.env` for `rwpxaejhouunxlcibpou`, no Vercel project linked). Initiating a real checkout with the existing runtime would write `payment_intents` to **production** — prohibited. Even with sandbox credentials, execution requires an approved non-prod runtime pivot that does not exist.
  - **Sandbox endpoint:** `api-m.sandbox.paypal.com` responds at the TLS/app layer (unauthenticated HEAD → 403 is expected PayPal behavior; not a network failure); the code's `baseUrl('sandbox')` is correct (`https://api-m.sandbox.paypal.com`).
  - **Doc/impl mismatch (recorded, NOT a code change):** `.env.example` documents PayPal as "Configured in the database (payment_providers table). No env vars required," but the implementation reads `PAYPAL_*` env vars only. The DB is a reference store (`credentials_ref`), not a secret store.
  - **Architecture map (source-verified):** `pay-tutor.tsx` → `initiateCheckout` (POST, zod `{tutorId,lessons,lessonMinutes}`, no amount) → `create_bulk_lesson_intent` RPC (server-derived amount) → `paymentGateway.startCheckout` = `routeCheckoutStart` (`router.server.ts`) selecting `is_enabled=true` + `credentials_ref` providers only → `paypalCreateOrder` → approval URL; return `GET /api/checkout/return` captures (`paypalCaptureOrder`/`paypalGetOrder`) and calls `finalizeCapture` (RPC `finalize_payment_succeeded`, service_role) when `status === "COMPLETED"`; webhook `POST /api/public/webhooks/paypal` verifies signature (`paypalVerifyWebhook`, `PAYPAL_WEBHOOK_ID`) then maps events (`PAYPAL.CAPTURE.COMPLETED` → finalize; refund/reversed → refund; denied/declined → mark_failed; `CHECKOUT.ORDER.APPROVED` → ignore); success page `getCheckoutState` reads authoritative RLS-owned intent state.
  - **Regression:** `bunx tsc --noEmit` 0; `bunx prettier --check .` clean; `bun run lint` 112 (74 err / 38 warn — baseline unchanged); `bun run build` SUCCESS; `git diff --check` clean. No source/database/config change made.
- **Not claimed:** sandbox end-to-end `VERIFIED`; any provider transaction; any amount/status evidence from PayPal; `PRODUCTION-VERIFIED`.
- **Prerequisite to re-open (one combined human action):** provision PayPal **sandbox** REST app credentials (client id/secret) + a sandbox webhook id and set them in the environment of an **approved non-prod runtime** (pivoted `SUPABASE_URL` → `rwpxaejhouunxlcibpou`), enable `payment_providers.paypal` in non-prod, then re-run FC-004.

---

## AT-0006 — Discovery vertical slice: `/tutors` browse + `/tutor/$id` profile → application use-case boundary

- **Category:** DISCOVERY / ARCHITECTURE REMEDIATION (gap fix, in progress)
- **Status:** IMPLEMENTED + VERIFIED (in-repo, uncommitted). No commit — commit only on explicit instruction.
- **Description:** First two vertical slices recommended by the ARCHITECTURE-TO-IMPLEMENTATION GAP REPORT. (1) `/tutors` browse converted from `supabase.rpc("list_public_tutors")` in the browser to `browseTutors` server use-case + `useQuery`; (2) `/tutor/$id` profile converted from two direct Supabase browser queries to `getTutorProfile` + `getTutorReviews` server use-cases + `useQuery`; `TutorProfile` port extended to full public 9-field shape; `getProfile` repo now fetches a single profile with computed `avg_rating`/`review_count` (eliminating the wasteful "fetch ALL tutors, filter client-side" pattern); reviews served via new `listTutorReviews` port method. `supabase` direct client import removed from `tutor.$id.tsx`. No DB/security/behavior change.
- **Reason:** The presentation layer must route through the established application use-case boundary (UI → Application Use Case → Domain Port → Infrastructure Repository → Database) rather than direct `supabase` client calls, per the architecture.
- **Affected domain:** Discovery (presentation + application + domain ports + infrastructure repository).
- **Dependencies:** None for implementation. The systemic anon-access issue (BLOCKING on logged-out visitors) would require a public/anon-capable middleware before these public pages can be relied on by anonymous users.
- **Architectural impact:** Positive — two more routes now pass through the established port/repository boundary; `TutorProfile` port type is now rich enough for both the profile page and the booking page; reviews are now fetched server-side (removing the `tutor_reviews` table's direct browser-surface exposure).
- **Risk:** Low in-repo (tsc 0, prettier clean, eslint clean on changed files, lint 112 baseline unchanged, build SUCCESS). Not browser-executed end-to-end. Not `PRODUCTION-VERIFIED`.
- **Priority:** P2 (implemented, needs runtime testing, then commit decision).
- **Source/evidence:** `docs/CURRENT_STATE.md` → AT-0006; `docs/CHANGE_LOG.md` → AT-0006; `docs/BACKLOG.md` (this entry).
- **Known open issue (systemic, pre-existing):** `requireAppDependencies` → `requireSupabaseAuth` requires a Bearer token; `attachSupabaseAuth` attaches one only when a session exists — so **logged-out visitors cannot call the converted server functions**. The pre-conversion browser-direct `supabase.rpc` path worked for anon (public RPC + RLS-open tables). A public/anon-capable server-fn middleware is required before these pages work for anonymous visitors. This affects all existing `[requireAppDependencies]` public-server-fn consumers including the new `browseTutors`/`getTutorProfile`/`getTutorReviews`.
- **Remaining (each separately authorized):** approximately 25 authenticated routes still use direct Supabase client; the next recommended slice is the Discovery booking route (`/book/$tutorId`), followed by dashboard, then admin.

---

## AT-0007 — Public/anon-capable Dependency Boundary for the Discovery server functions

- **Category:** DISCOVERY / ARCHITECTURE REMEDIATION (gap fix, in progress)
- **Status:** IMPLEMENTED + VERIFIED (in-repo, uncommitted). No commit — commit only on explicit instruction.
- **Description:** Resolves the AT-0006 systemic open issue (logged-out visitors could not call `browseTutors`/`getTutorProfile`/`getTutorReviews` — they required a Bearer token via `requireAppDependencies` → `requireSupabaseAuth`). Adds a server-side anon-role client (`supabaseAnon` in `client.public.server.ts`) and widens the pre-existing `buildPublicDependencies()` to provide the `tutor` repository wired to that anon client, so the three public Discovery server functions run through the already-established `requirePublicDependencies` middleware. Data paths made anon-safe: `getProfile` → PUBLIC-granted `list_public_tutors` RPC; `listTutorReviews` → PUBLIC-granted `tutor_reviews_public` view. Booking/availability fns remain `[requireAppDependencies]`. No DB/RLS/migration change.
- **Reason:** Public discovery pages must work for logged-out visitors while authenticated operations (booking, payments, dashboards) stay protected; the public data surface must be the sanctioned PUBLIC-granted RPC/view surfaces, not the authenticated-only `profiles`/`tutor_reviews` tables.
- **Affected domain:** Discovery (application + infrastructure + integrations).
- **Dependencies:** None for implementation.
- **Architectural impact:** Positive — one shared public middleware boundary now covers both the help form and public Discovery reads; RLS security model untouched and preserved (`anon` role + PUBLIC grants; `buildPublicDependencies` still fails closed on every capability not explicitly provided).
- **Risk:** Low in-repo (tsc 0, prettier clean, eslint clean on changed files, lint baseline unaffected, build SUCCESS). Not browser-executed end-to-end. Anonymous + authenticated runtime smoke test pending (requires a non-prod runtime).
- **Priority:** P2 (implemented, needs runtime testing, then commit decision).
- **Source/evidence:** `docs/CURRENT_STATE.md` → AT-0007; `docs/CHANGE_LOG.md` → AT-0007; `docs/BACKLOG.md` (this entry).
- **Known open issues (each separately authorized):** `profiles` REST grant-gap remains (pre-existing AT-0002; sidestepped for Discovery); availability RPCs may lack authenticated EXECUTE grants (booking may 42501 — pre-existing, untested); `getProfile` fetch-all-then-filter on `list_public_tutors` (possible future targeted public RPC).

---

## AT-0008 — Read-only verification of the tutor-availability capability

- **Category:** DISCOVERY / VERIFICATION (read-only, complete)
- **Status:** COMPLETE — VERDICT **PARTIALLY VERIFIED** (application path structurally confirmed + applied non-prod DB contract confirmed; runtime NOT exercised). No commit — commit only on explicit instruction.
- **Description:** Read-only verification of `getTutorAvailability` for authenticated users. Traced the full path (`/book/$tutorId` → `getTutorAvailability` (`[requireAppDependencies]`, zod `{tutorId,from,to}`) → `SupabaseTutorRepository.getAvailability` → 3 parallel SECURITY DEFINER RPCs) and confirmed via APPLIED non-prod (`rwpxaejhouunxlcibpou`, read-only Management API) evidence that authenticated EXECUTE is present on all three availability RPCs (`auth_exec=true`, `anon_exec=false`, `svc_exec=false`, owner postgres, SECURITY DEFINER) and that RLS is correct and fail-closed for anon (no anon SELECT/INSERT/UPDATE/DELETE policies; anon EXECUTE revoked twice Aug-12). **Resolves the AT-0007 open issue** — the "availability RPCs may 42501 for authenticated users" hypothesis is refuted; no grant gap, no migration required. No code changed.
- **Reason:** Close out the AT-0007 DB-grant hypothesis before authoring any DB or routing change; confirm the availability DB contract exists in the applied database (not just migration history).
- **Affected domain:** Discovery (verified only).
- **Dependencies:** None.
- **Architectural impact:** None (no code changed). Confirms the application boundary is already correct (UI → authenticated server fn → use case → port → infra → DB).
- **Risk:** None introduced (read-only; no production writes; token held in memory only).
- **Priority:** P2 (closed; runtime smoke test still pending an approved non-prod runtime with a test user).
- **Source/evidence:** `docs/CURRENT_STATE.md` → AT-0008; `docs/CHANGE_LOG.md` → AT-0008; `docs/BACKLOG.md` (this entry).
- **Known open issues (each separately authorized):** authenticated runtime end-to-end smoke test pending non-prod runtime + test user; `/book/$tutorId` conversion of the remaining direct calls `joinWaitlist`/`notifyBookingEmails` (2 of 3 — `bookSession` is already wrapped in `useServerFn` at `book.$tutorId.tsx:94`) → AT-0009; `svc_exec=false` on availability RPCs noted (no service-role path today, observation only).

---

## Virtual Lab / Simulation-Lab remediation candidates (from the Virtual Lab + Learning Domain architecture audit, 2026-09-15)

- **Register note:** These entries translate audit findings **F1–F8** of the read-only Virtual Lab + Learning Domain architecture audit (report + evidence: `%LOCALAPPDATA%\Temp\opencode\lab-learning-audit-REPORT.md` / `lab-learning-audit.EVIDENCE.json`) into candidate remediation work. Every entry begins as **PROPOSED**; none is IMPLEMENTED, TESTED, VERIFIED, or PRODUCTION-VERIFIED. Beginning any item requires the same explicit, separate authorization as any other backlog entry (PROPOSED → PLANNED → IN_PROGRESS). No architecture decision was accepted or changed by this registration (D-0005 and the Learning Domain status are untouched). Findings F9–F11 are INFO/positive (no remediation registered); F12–F15 already have one-to-one BACKLOG entries and are explicitly not duplicated here.

### LAB-0001 — Labs entitlement gate and saved-simulation integrity (audit F1)

- **Category:** SECURITY — entitlement enforcement and persistence integrity.
- **Status:** APPLICATION FIXES IMPLEMENTED / MIGRATION STATICALLY REVIEWED / DATABASE VERIFICATION BLOCKED.
- **Description:** `embedPrompt`, `findSimilarSimulation`, `generateSimulationSchema`, save, and Simulation Lab AI chat are authenticated and entitlement-gated. Chat requires the existing Labs route scope plus its existing AI scope and rejects caller-supplied `system` messages. Save now requires explicit learner action. Repository save calls an authenticated `SECURITY INVOKER` RPC wrapper backed by a private `SECURITY DEFINER` helper with empty `search_path`; the helper checks AI/Labs/open-mode/privileged access, derives owner from `auth.uid()`, validates bounded schema structure, and atomically inserts simulation plus version 1. A per-owner request UUID makes retries/concurrent duplicate requests idempotent. The migration revokes direct table INSERT, simulation UPDATE, and version INSERT/UPDATE/DELETE, and pins the role/scope and classroom-room membership definer helpers. Similarity lookup becomes invoker-secure with bounded parameters. It remains unapplied, so the current database still has the previous owner-scoped direct-write behavior. `listSimulations`/`deleteSimulation` remain owner-scoped and ungated while saved-work access after expiry is unresolved.
- **Reason:** Billing/enforcement integrity: premium content (AI-generated lab schemas) must not be reachable by unentitled callers at the server boundary; the repository's enforcement model is server-authoritative fail-closed (entitlement-guard architecture, D-0003).
- **Affected domain:** Simulation Lab (application use-case boundary) / entitlement / billing.
- **Affected components:** `src/application/use-cases/simulation/lab.ts`, `src/application/use-cases/simulation/chat.ts`, `src/routes/_authenticated/labs_.simulation-lab.tsx`, both catalog renderers, simulation repository and Supabase types.
- **Evidence:** `src/application/use-cases/simulation/lab.ts`; `src/application/use-cases/simulation/chat.ts`; `src/infrastructure/repositories/simulation-repository.ts`; `tests/simulation-entitlement.test.ts`; `tests/simulation-repository.test.ts`; `tests/simulation-rpc-migration.test.ts`; migration `20260923140000...`; `docs/audits/LEARNING_DOMAIN_CASE_MATRIX_20260923.md`. Application gates, explicit save state, RPC wiring, retry key propagation, role/scope helper hardening and static migration contract are locally tested. The migration, grants, RLS, conflict behavior, and rollback have not been applied/runtime-tested because approved non-production is inactive.
- **Dependencies:** Runtime allow/deny, concurrent-retry and rollback exercise requires active approved non-production. Existing-simulation expiry policy remains a product decision. Labs free access and quota semantics remain a product decision; the unsupported browser cap was removed. Application update/history UI is not implemented; direct mutation is revoked in the prepared migration until a versioned edit policy exists.
- **Architectural impact:** New simulation creation has fail-closed application and prepared database entitlement boundaries; the atomic authenticated RPC prevents a simulation without version 1 and deduplicates retries. Owner RLS remains authoritative for list/delete; saved-work expiry is still a product decision. Prepared migration preserves version history by blocking independent mutation.
- **Risk:** Medium now — RLS owner-isolation (F11) limits exposure to the caller's own rows, so this is an enforcement/billing gap, not a cross-user leak; it compounds if a CR-043 (sharing) surface lands unaddressed.
- **Priority:** P2.
- **Acceptance criteria:** After migration, new-save creation denies missing/expired Labs scope through the app and RPC, direct table inserts and unversioned updates are denied, valid saves derive owner from authenticated context, identical retries return one object/version, and simulation/version 1 persist or roll back together. Runtime verify list/delete owner isolation and grants. Decide existing-save expiry behavior before gating list/delete. Chat continues requiring both currently existing boundaries.
- **Test requirements:** `tests/simulation-entitlement.test.ts` covers missing/expired scope, Labs+AI chat gates, open mode/tutor bypass, server identity, and configuration failure; `tests/simulation-repository.test.ts` covers idempotency key RPC wiring and error propagation; `tests/simulation-rpc-migration.test.ts` statically asserts privilege/transaction/idempotency contract. Real rollback, RLS and concurrent request outcomes require non-production probes.
- **Current source gap / next engineering task:** RPC validation is narrower than the complete nested `SimulationSchema`; an authenticated direct RPC caller can still persist some malformed nested values. Add matching structural/type validation and focused static contract tests without adding product-defined simulation limits, then continue to LAB-0010 runtime probes when approved non-production is available.
- **Verification requirements:** in-repo (tsc/lint/build) + runtime exercise against a non-prod runtime with one entitled and one unentitled user (runtime leg still blocked — see `docs/audits/AUDIT_VERIFICATION_QUEUE_20260914.md` keystone).
- **Relationship to existing architecture/decisions:** distinct from GAP-003 (DB/RPC-level gates for similarity lookup in migration `20260814140000`); LAB-0001 covers saved-simulation application and table-write boundaries.

### LAB-0009 — Durable Virtual Lab session and learning-evidence lifecycle

- **Category:** LEARNING DOMAIN — lifecycle/persistence gap.
- **Status:** MISSING PRODUCT DECISIONS; no session/result/reflection schema should be authored yet.
- **Description:** Current Labs persist only reusable simulation definitions. Execution state, interaction history, measurements/results, reflection, quiz attempts, completion, progress, mastery, tutor review, and parent visibility have no durable path. A library load resets execution state. The `LearningRecordRepository` is not wired and D-0005 does not set these evidence semantics.
- **Reason:** Treat Virtual Lab as first-class learning activity without inventing assessment, mastery, privacy, retention, sharing, or role-access rules.
- **Affected domain:** Virtual Lab, Learning Records, Assessment, Progress, Mastery, Privacy, Entitlements.
- **Evidence:** `docs/audits/LEARNING_DOMAIN_CASE_MATRIX_20260923.md`; `src/routes/_authenticated/labs_.simulation-lab.tsx`; `src/domain/lab`; `src/domain/ports/learning.ts`; `docs/DECISION_LOG.md` D-0005.
- **Dependencies:** Product decisions for what constitutes a lab session/completion, result evidence, measurements/provenance, reflection consent/retention, generated quiz authority/attempts, progress/mastery contribution, tutor review/parent visibility, session recovery, sharing and deletion. Free Labs access/quota and saved-work expiry are separate decisions.
- **Acceptance criteria:** After policy is accepted, implement owned durable session lifecycle and resume; immutable version/history semantics; reviewed assessment/result path if authorized; explicit reflection privacy; LearningRecord/progress integration without assigning mastery weights in engineering; and role/entitlement isolation with audit and deletion behavior.
- **Priority:** P1 after policy decisions.

### LAB-0010 — Virtual Lab database runtime verification

- **Category:** VERIFICATION — Supabase RLS/RPC/grant behavior.
- **Status:** BLOCKED — migration unapplied and approved non-production is unavailable.
- **Description:** Run the allow/deny matrix for anonymous, Free/no-scope, entitled learner, expired scope, second learner, tutor, and admin. Verify direct INSERT/UPDATE/version mutation denial, owner-only reads/deletes, RPC atomic rollback, same-key retry/concurrency, function ACL, helper schema exposure, invoker similarity lookup, and version-1 integrity. Never run these writes against production.
- **Evidence:** Prepared but unapplied migration `20260923140000_enforce_simulation_entitlement_and_atomic_save.sql`; static test `tests/simulation-rpc-migration.test.ts`.
- **Dependencies:** Approved active non-production Supabase project and an authorized migration apply window.
- **Priority:** P1 when the environment is available.

### LAB-0002 — `new Function` expression evaluation in `Scene2D.tsx` (audit F2)

- **Category:** DISCOVERY / SECURITY — client-side code-eval risk (proposed remediation).
- **Status:** IMPLEMENTED / UNIT TESTED / TYPECHECKED; browser rendering remains untested.
- **Description:** Replaced dynamic compilation with the bounded parser/evaluator in `src/domain/lab/math-expression.ts`. It supports arithmetic in `x` and `t`, `Math.PI`/`Math.E`, and explicit Math functions; unsupported globals, prototype access, property indexing, assignment, long input, and excessive nesting fail closed. Simulation Lab schema validation caps formula length and the generation prompt describes the grammar.
- **Reason:** Defense-in-depth before any sharing surface; persisted `schema_json` content becomes cross-user content at CR-043 time.
- **Affected domain:** Simulation Lab (2D renderer), client security.
- **Affected components:** `src/presentation/domains/5-classroom-live-workspace/lab3d/Scene2D.tsx` (`safeEval`, `new Function`); `schema_json` expressions persisted via `saveSimulation`.
- **Evidence:** `src/presentation/domains/5-classroom-live-workspace/lab3d/Scene2D.tsx`; `src/domain/lab/math-expression.ts`; `tests/lab-math-expression.test.ts`; audit F2; CR-043 (`docs/CONFIRMED_REQUIREMENTS.md` §7.1, Phase 7).
- **Dependencies:** None for source implementation. Formula syntax outside the explicit grammar is unsupported; browser visual regression should be run when a suitable authenticated app runtime is available.
- **Architectural impact:** None (contained change); keeps `schema_json` expressions a render-only data format rather than executable code.
- **Risk:** Low today (self-only); MEDIUM once sharing (CR-043) exists if unaddressed.
- **Priority:** P3.
- **Acceptance criteria:** `safeEval` no longer uses `new Function`/`eval`; supported math expressions evaluate; unknown/unsafe constructs fail closed (no execution). COMPLETE at source/unit level.
- **Test requirements:** `tests/lab-math-expression.test.ts` covers supported grammar, prototype/global escapes, bounds and non-finite results.
- **Verification requirements:** in-repo (tsc/lint/build) + browser render regression of representative saved schemas when a runtime is available.
- **Relationship to existing architecture/decisions:** no existing entry covers client code-eval; not a duplicate.

### LAB-0003 — Prompt↔schema contract mismatch: step durations silently dropped (audit F3)

- **Category:** DISCOVERY / CORRECTNESS — AI prompt vs zod contract drift (proposed remediation).
- **Status:** PROPOSED — not started, not implemented.
- **Description:** `SYSTEM_PROMPT` (`lab.ts:177`) instructs the model to emit `"steps: [{title, description, duration_seconds, highlight...}]"` but `ProcessStepSchema` (`lab.ts:36-41`) validates `duration` — zod strips the unknown `duration_seconds` key, so AI-supplied per-step durations are **silently discarded** and `ProcessView` always falls back to the default 3 s (`ProcessView.tsx:33`). Generation intent and renderer behavior drift without any error.
- **Reason:** Silent loss of AI-intended presentation data degrades the generated-lab quality contract.
- **Affected domain:** Simulation Lab (generation → render contract), AI schema validation.
- **Affected components:** `src/application/use-cases/simulation/lab.ts` (`SYSTEM_PROMPT`, `ProcessStepSchema`), `src/presentation/domains/5-classroom-live-workspace/lab3d/ProcessView.tsx`.
- **Evidence:** `lab.ts:177` (`duration_seconds`), `lab.ts:36-41` (`duration` validated), `ProcessView.tsx:33` (default 3 s); audit F3.
- **Dependencies:** None for registration.
- **Architectural impact:** None (contract alignment only).
- **Risk:** Low–medium (silent cosmetic drift; no security impact).
- **Priority:** P3.
- **Acceptance criteria:** a persisted schema step carrying `duration_seconds` is honored by the renderer (or the prompt stops advertising it); nothing is silently dropped.
- **Test requirements:** zod round-trip test for both key spellings + renderer behavior test.
- **Verification requirements:** in-repo + runtime render check when available.
- **Relationship to existing architecture/decisions:** unrelated to the assessment backend; no existing entry covers the prompt↔schema contract. Not a duplicate.

### LAB-0004 — UTF-8 corruption in `lab.ts` prompt/language literals (audit F4)

- **Category:** DISCOVERY / CODE HYGIENE — byte-level encoding corruption (proposed remediation).
- **Status:** PROPOSED — not started, not implemented.
- **Description:** Byte-verified mojibake in `lab.ts`: `≤` stored as `C3 A2 E2 80 B0 C2 A4` ("â‰¤") and `∈` as `C3 A2 CB 86 CB 86` ("âˆˆ") at `lab.ts:169-170`; language-fallback emojis are corrupted multi-byte garbage at `lab.ts:230-231,237,243`. These literals feed the AI **system prompt** verbatim (degrades generation) and render as visible mojibake in `LanguageView`.
- **Reason:** Data integrity of shipped literals; recorded as an observed defect with the byte cause verified (the fix — re-save as clean UTF-8 — is the registered remediation; the corruption's origin is not assumed).
- **Affected domain:** Simulation Lab (prompt construction, language renderer).
- **Affected components:** `src/application/use-cases/simulation/lab.ts` (`SYSTEM_PROMPT` + fallback literals), `src/presentation/domains/5-classroom-live-workspace/lab3d/LanguageView.tsx`.
- **Evidence:** byte-level hexdump of `lab.ts:169-170` / `230-243` (captured in audit evidence — see audit report §5); audit F4.
- **Dependencies:** None for registration.
- **Architectural impact:** None.
- **Risk:** Low (visible quality + prompt-quality degradation; no security impact).
- **Priority:** P3.
- **Acceptance criteria:** the file is clean UTF-8; `≤`/`∈`/emojis render and transmit correctly; no unrelated text changes.
- **Test requirements:** encoding check (byte-level assertion or grep for the corrupted byte sequences) during verification.
- **Verification requirements:** in-repo diff review (`git diff --check` clean; byte inspection) + visual render when a runtime is available.
- **Relationship to existing architecture/decisions:** no existing entry; not a duplicate.

### LAB-0005 — Base64 thumbnails in the table + heavy `listSimulations` payload (audit F5)

- **Category:** DISCOVERY / PERFORMANCE & DATA MODEL (proposed remediation).
- **Status:** PROPOSED — not started, not implemented.
- **Description:** `SaveSimulationInput.thumbnailUrl` stores a JPEG **data URL** (zod `≤ 400_000` chars in `lab.ts`) directly into `simulations.thumbnail_url` text; no Supabase Storage bucket is used even though the owner-RLS `simulation_assets` table (`20260623121121`) exists unused. `listSimulations` returns the full `schema_json` (incl. quiz + explanations) for up to 50 rows on **every** library refresh (`simulation-repository.ts:66-74`) — payload-heavy and with no pagination; the fixed 50-row limit also caps reachable saved labs.
- **Reason:** Library-listing wire weight and a dormant migration (`simulation_assets`) that the thumbnail feature was presumably intended to use.
- **Affected domain:** Simulation Lab (persistence + library listing), performance.
- **Affected components:** `src/domain/ports/simulation-repository.ts` (`SaveSimulationInput.thumbnailUrl`), `src/application/use-cases/simulation/lab.ts` (zod `thumbnailDataUrl`), `src/infrastructure/repositories/simulation-repository.ts` (`listSimulations` select/limit), `src/routes/_authenticated/labs_.simulation-lab.tsx` (library UI).
- **Evidence:** `simulation-repository.ts:66-74`; migration `20260623121121` (`simulation_assets`); audit F5.
- **Dependencies:** A Storage-vs-`simulation_assets` decision for the asset model; CR-043 (sharing) is the natural trigger for a richer asset model.
- **Architectural impact:** Data-modeling choice (Storage objects vs `simulation_assets` table) requiring a deliberate decision; potentially retires the dormant `simulation_assets` surface (cf. F13 entry).
- **Risk:** Low–medium (payload grows with schema richness; no security impact).
- **Priority:** P3.
- **Acceptance criteria:** the library-list payload excludes heavy fields (or becomes selectable/paginated); thumbnails resolve from Storage/`simulation_assets` instead of inline data URLs; no regression in the generation→save flow.
- **Test requirements:** payload-size test for list vs detail; storage/asset write + read-back test.
- **Verification requirements:** in-repo + DB/storage behavior on a non-prod environment when authorized.
- **Relationship to existing architecture/decisions:** distinct from the `assignment_submissions`/`simulation_assets` phantom-table entry (F13, P4) — LAB-0005 is a remediation proposal for the thumbnail/assets path; not a duplicate of it.

### LAB-0006 — Rules-taxonomy vs physics-engine mismatch; wall-clock in `stepSim` (audit F6)

- **Category:** DISCOVERY / CORRECTNESS — declared-vs-implemented physics (proposed remediation).
- **Status:** PROPOSED — not started, not implemented.
- **Description:** `SYSTEM_PROMPT` advertises `newton_second_law` in the allowed rules set, but `stepSim` (`physics.ts`) never implements it — a silent no-op if the model emits it. `stepSim` also mixes wall-clock `performance.now()` time with dt-integrated steps, so orbital/flow motion amplitude varies with FPS.
- **Reason:** Generated-lab fidelity: the renderer must honor its own advertised rule taxonomy and advance on a deterministic sim clock.
- **Affected domain:** Simulation Lab (physics engine / 3D renderer).
- **Affected components:** `src/application/use-cases/simulation/lab.ts` (`SYSTEM_PROMPT` rules set), `src/presentation/domains/5-classroom-live-workspace/lab3d/physics.ts` (`stepSim`, `performance.now()`).
- **Evidence:** `lab.ts:177` (rules set), `physics.ts` `stepSim` (no `newton_second_law` branch) / `performance.now()`; audit F6.
- **Dependencies:** None for registration.
- **Architectural impact:** None (engine-internal).
- **Risk:** Low (cosmetic/physics-fidelity only).
- **Priority:** P4.
- **Acceptance criteria:** the advertised rule set equals the implemented rule set (or the prompt is trimmed); `stepSim` advances on sim-clock dt.
- **Test requirements:** unit test per advertised rule + a determinism (FPS-independence) test.
- **Verification requirements:** in-repo + visual regression when a runtime is available.
- **Relationship to existing architecture/decisions:** no existing entry; not a duplicate.

### LAB-0007 — Duplicated generate+save pipeline and auto-save race (audit F7)

- **Category:** DISCOVERY / ROBUSTNESS — duplicated paths & double-fire (proposed remediation).
- **Status:** PROPOSED — not started, not implemented.
- **Description:** `labs_.simulation-lab.tsx:153-257` duplicates the generate→thumbnail→save pipeline in `handleGenerate` and `generateAnyway`; the `setTimeout(600)` auto-save has no lock, so a rapid second generate can double-write. Generation failure between `findSimilar` and `genFn` silently degrades to no schema (embedding errors swallowed) with no user feedback.
- **Reason:** Reduce duplicated control flow, rule out double-write/races on the save path, and surface generation failures.
- **Affected domain:** Simulation Lab (client flow).
- **Affected components:** `src/routes/_authenticated/labs_.simulation-lab.tsx` (`handleGenerate`, `generateAnyway`, auto-save `setTimeout(600)`).
- **Evidence:** `labs_.simulation-lab.tsx:153-257`; audit F7.
- **Dependencies:** None for registration.
- **Architectural impact:** None.
- **Risk:** Low (potential duplicate persisted rows under rapid interaction; no security impact).
- **Priority:** P4.
- **Acceptance criteria:** a single generate→save path; auto-save cannot double-fire (lock/idempotency); generation errors surface user feedback.
- **Test requirements:** component-level interaction test where a rapid double-generate produces exactly one save.
- **Verification requirements:** in-repo + browser interaction when a runtime is available.
- **Relationship to existing architecture/decisions:** no existing entry; not a duplicate.

### LAB-0008 — Dead/inert presentation surface: `ThreeDLab` unreferenced, `LorddaLab` classroom sync dormant (audit F8)

- **Category:** DISCOVERY / DEAD CODE & INTENT — wire-or-remove decision needed (proposed remediation).
- **Status:** PROPOSED — not started, not implemented.
- **Description:** `ThreeDLab.tsx` (external 3D iframe embed) is referenced by no route — `/labs` uses `LorddaLab` (PhET) + `WebGLLab`. `LorddaLab`'s classroom realtime sync (`lab:${roomId}` presence/broadcast, ~90 lines) is dormant: no caller passes `roomId` (`labs.tsx:93`). The external-lab embed respects CR-055 (no undocumented API assumptions), but the sync guarantees it advertises are never exercised.
- **Reason:** Distinguish intentional scaffolding from dead code and record a wire/deprecate decision, consistent with the repository's "preserve/decide, don't silently delete" practice.
- **Affected domain:** Simulation Lab (presentation), Phase-6/7 external-lab intent.
- **Affected components:** `src/presentation/domains/5-classroom-live-workspace/{ThreeDLab,LorddaLab,WebGLLab}.tsx`, `src/routes/_authenticated/labs.tsx`.
- **Evidence:** `labs.tsx:93` (LorddaLab rendered without `roomId`); `ThreeDLab.tsx` unreferenced by any route; audit F8; CR-055 (`docs/CONFIRMED_REQUIREMENTS.md` §8.1, Phase 6).
- **Dependencies:** Product decision on 3D-lab embedding and classroom-sync scope (Phase-6/7 external-lab requirements).
- **Architectural impact:** None unless the sync/embed is wired; then a decision to exercise `lab:${roomId}`.
- **Risk:** Low (inert code; misleading capability claims if treated as live).
- **Priority:** P4.
- **Acceptance criteria:** an explicit recorded decision per surface — wire (with `roomId` plumbed and sync tested) or deprecate/remove; no orphaned claim of a "sync" capability.
- **Test requirements:** route/import-reference traversal (no hidden imports) and, if wired, a presence/broadcast smoke test.
- **Verification requirements:** in-repo (route/import graph) + runtime when available.
- **Relationship to existing architecture/decisions:** distinct from the "Stale architecture documentation" BACKLOG entry (P4 — that item is about `docs/archive/`); no code-level entry covers `ThreeDLab`/`LorddaLab`. Not a duplicate.

### AT-0009 — Complete booking server-function adapters and report email failures

- **Category:** APPLICATION BOUNDARY / ROBUSTNESS.
- **Status:** IMPLEMENTED; source and build verified; browser/runtime verification BLOCKED.
- **Description:** Wrap `joinWaitlist` and `notifyBookingEmails` with TanStack `useServerFn` in the authenticated booking route, matching the existing `bookSession` call. Preserve a successful session booking when confirmation-email delivery fails, but show the learner a warning instead of silently swallowing failures. Remove the stale `any` cast and repair the route's hook dependencies.
- **Reason:** Keep UI-to-server-function calls consistent and make booking/email outcomes truthful without creating duplicate bookings on email failure.
- **Affected domain/components:** Discovery booking; `src/routes/_authenticated/book.$tutorId.tsx`.
- **Dependencies:** Approved active non-production runtime and a test identity for browser end-to-end verification.
- **Architectural impact:** Uses the existing authenticated Application server-function boundary; no database or authorization changes.
- **Risk:** Low source-level change; runtime behavior remains unverified.
- **Priority:** P2.
- **Evidence:** `docs/audits/AUDIT_REVALIDATION_20260923.md`; `bun test` 75/0; `bunx tsc --noEmit` 0; route ESLint clean; `bun run build` success.
- **Acceptance criteria:** booking/waitlist/email calls are invoked through `useServerFn`; email failures are user-visible without reporting a saved booking as failed; local tests/typecheck/build pass; browser verification when non-production is available.
- **Next:** Re-run the booking/waitlist journey against an approved active non-production project. The current `rwpxaejhouunxlcibpou` project is INACTIVE.

### AT-0010 — Correct PayPal environment-variable setup example

- **Category:** CONFIGURATION DOCUMENTATION.
- **Status:** COMPLETED; source verified.
- **Description:** Update `.env.example` to document `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_WEBHOOK_ID`; clarify that `payment_providers.mode` and `credentials_ref` select the environment-variable prefix.
- **Reason:** The previous example said PayPal required no environment variables, while `paypal.server.ts` resolves credentials exclusively from server environment variables.
- **Affected domain/components:** Payment provider setup; `.env.example`.
- **Dependencies:** None for the documentation correction. A real sandbox checkout still requires credentials and an active approved non-production runtime.
- **Architectural impact:** None.
- **Risk:** Low; no credential values added.
- **Priority:** P2.
- **Evidence:** Source inspection of `src/lib/payments/paypal.server.ts`; live PayPal sandbox endpoint HTTP 403 unauthenticated; credential-presence checks returned absent.
- **Acceptance criteria:** Example accurately names required server-side variables and does not imply that database config contains secrets.

### AT-0011 — Learning Domain discovery and graph foundation

- **Category:** LEARNING DOMAIN / DISCOVERY AND DOMAIN MODEL.
- **Status:** IN PROGRESS; evidence matrix and Free-tier audit expanded; topic/prerequisite graph, assignment completion path, simulation save gate/atomicity, and whiteboard persistence error handling implemented in source and locally tested; confirmed initial difficulty/reflection flow audited as absent; three database migrations authored but unapplied/runtime-unverified; **whiteboard OCR decoupled from platform AI Gateway**.
- **Description:** Map the complete learning-domain case space against confirmed requirements, accepted decisions, implementation, schema/policies, and tests. Implement only foundations supported by accepted semantics; keep unresolved product rules explicit.
- **Scope completed so far:** `docs/audits/LEARNING_DOMAIN_CASE_MATRIX_20260923.md` classifies every case, records Free behavior and decisions, traces learning-object lifecycles, distinguishes the client-side quiz from persisted assessment, and records the confirmed but absent first-three-lessons difficulty/reflection flow; pure topic/prerequisite graph model and validation; learner completion RPC path for assigned work (student role, own assignment, status-only, idempotent); route entitlement gates fail closed on config/scope lookup errors; Labs entitlement guard for new saves; atomic simulation/version save RPC with prepared direct-insert revocation and RPC entitlement checks; typed AI gateway request boundary; whiteboard setup/read error propagation; assignment-submission RLS hardening; **whiteboard OCR/Convert decoupled from platform AI Gateway — `whiteboardConvert` no longer calls `assertAiEntitlement` or `aiGateway.chat()`, returns clear error; `ConvertButton` handles gracefully; `tests/whiteboard-ai-independence.test.ts` added (12 tests)**.
- **Evidence:** D-0005; `docs/CONFIRMED_REQUIREMENTS.md`; `docs/PRODUCT_CONSTITUTION.md`; `docs/architecture/LEARNING_ASSESSMENT_DESIGN.md`; current source/migrations/types/tests inspection.
- **Product decisions that remain open:** assessment instrument content and attempt/retake rules; definition/count of a “lesson” for the mandatory initial interaction; affective-data instrument/consent/retention; mastery validity; Free lab allowance and AI budget semantics; parent visibility; content entitlements; topic authoring and metadata-reader authority; whether existing saved simulations stay available after expiry; `simLabChat` scope.
- **Dependencies:** Approved active non-production Supabase environment and test identities for DB/RLS runtime verification. No production database changes are in scope.
- **Priority:** P1 — foundational learning-state gap.
- **Verification:** Full `bun test tests/` → 101 pass / 0 fail / 653 assertions; `bunx tsc --noEmit` → 0 errors; targeted ESLint and Prettier pass; `bun run build` succeeds; `git diff --check` → clean (line-ending warnings only). Build emits existing `inputValidator()` deprecations and dependency bundle warnings. Database migration/policy behavior is source-reviewed only; apply and allow/deny probes remain pending until approved non-production is active. Supabase CLI/Docker and the documented non-production project remain unavailable.
- **Next:** Continue independent implementation that does not require a product choice. Topic persistence/read policy is gated on topic author and metadata-reader authority; assessment persistence is gated on instrument/attempt/retake rules; Free quota ledgers are gated on allowance/accounting semantics; database migrations remain pending approved non-production. Resume those exact items when decisions or the required environment become available.
