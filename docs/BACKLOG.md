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
- **Status:** `VERIFIED WITH ACTIONABLE FINDINGS` (final, post session 6; see Session History (1)–(6) and Decision Status below) → **session 5: NON-production cross-learner RUNTIME isolation = EXECUTED and VERIFIED (588 PASS / 40 BLOCKED / 0 FAIL)**. **Table-set definition:** the AT-0002 learner tables are Set A (`assignments`, `assignment_submissions`, `notes`, `session_records`, `simulations`) — Set B is the Category-2 / GAP-001..005 tracked set (`profiles`, `user_roles`, `tutor_subscriptions`, `tutor_courses`, `sessions`) and is NOT called "the 5 learner tables". **Production applied-state** (applied schema, RLS policy definitions, helper functions, `app_role` enum, row/data-presence, source↔applied reconciliation for Set A) = recorded VERIFIED live as **session-3 historical narrative** (authenticated Management API over HTTPS — read-only; no captured in-repo artifacts). **Session 4: `NON-production migration reproduction = VERIFIED`** — the repository's **73 migrations applied 73/73** to the dedicated hosted non-prod project `askatutorlive-at0002-nonprod` (ref `rwpxaejhouunxlcibpou`, eu-west-1, Postgres 17; same org, production untouched) via the Management API migrations endpoint (CLI `db push` network-blocked on this host), with **captured** schema/RLS/auth reconcile evidence (session-local Temp artifacts; two documented deltas: `storage.objects` seeding and migration-history `version` representation — see CURRENT_STATE Isolation Findings → Session 4). **Session 5 (this): runtime cross-learner isolation EXECUTED on the non-prod project** — populated 20 learners + 1 admin + 3 tutors + 1 parent and controlled per-learner records across all Set-A tables, then ran a 628-case authorization harness (positive controls, cross-learner read matrix, cross-learner write INSERT/UPDATE/DELETE with post-state DB verification, IDOR read/update/delete, RPC role boundaries, role escalation, anonymous): **588 PASS / 40 BLOCKED / 0 FAIL** — no cross-learner read, no cross-learner write, no IDOR mutation succeeded; only DENIED/4xx/0-row outcomes; DB state unchanged after every attack. The 40 BLOCKED are the `sessions` table (empty `relacl` → 403 for every REST role incl. `service_role`; fail-closed functional gap, not leakage). Also grantless: `profiles`, `user_roles`, `classroom_chat`, `messages`, `subjects`, `forum_posts`, `tutor_applications`, ~20 tables total; `session_records` SELECT is 403 for `authenticated` (read policy references grantless `sessions`) though plain POST INSERT works. **Open items (separately authorized): (1) grant-gap remediation** — GRANT intended `/rest/v1` privileges per the migration source of truth, then re-run the harness; (2) optionally re-run the same matrix against **production** once populated. **Session 6 (this): NON-production `sessions` grant-gap remediation = EXECUTED and VERIFIED (separately authorized)** — minimal intended `public.sessions` GRANTs restored (`authenticated` = arwd, `service_role` = ALL, `anon`/`postgres` untouched; RLS unchanged; only `sessions.relacl` changed); previously-blocked 40 `sessions` REST cases = **40/40 PASS**; full 628-case regression = **628/628 PASS**; `session_records` SELECT/rep-INSERT restored; residue 0. Remaining actionable findings: `profiles`/`user_roles` + ~18 sibling empty-`relacl` tables (`42501` on the two `sessions` INSERT WITH CHECK policies and `book_session` via `profiles`); production `anon` over-grant (`arwdDxtm`) — see Findings. Production zero-touch maintained; non-prod RLS never weakened. See Session History below.
- **Description:** Verify the live production Supabase state: whether migrations are applied, live table existence and row counts (especially `assignments`, `assignment_submissions`), and that RLS policies actually enforce the intended ownership boundary. Confirm Learner-A-vs-Learner-B isolation with cross-user checks.
- **Reason:** Live database/applied-migration/RLS state could not be verified from the repository alone (no DB connection string in the repo). This is the single largest unresolved security/isolation verification boundary identified in AT-0001.
- **Affected domain:** Database schema, RLS, identity/isolation.
- **Dependencies (remaining blocker):** cross-learner runtime isolation for the grant-bearing learner tables is DONE (session 5, non-prod) and the `sessions` REST grant gap is REMEDIATED (session 6, non-prod). Remaining dependencies are authorization for: (1) the **residual grant-gap remediation** (non-prod `profiles`/`user_roles` + ~18 sibling empty-`relacl` tables — `42501` on the two `sessions` INSERT WITH CHECK policies and `book_session` via `profiles`) and the **production `anon` over-grant REVOKE/investigation** (`arwdDxtm` on `sessions`/`profiles`/`session_records`/`user_roles`), and (2) optionally re-running the session-5 matrix against **production** once production is populated.
- **Architectural impact:** Informational/verification only; expected to confirm or adjust current-state understanding. Does not itself change architecture.
- **Risk:** MEDIUM–residual — applied RLS policy *definitions* are verified owner/participant/admin-scoped, and **runtime** cross-learner enforcement is now VERIFIED for the grant-bearing learner tables on non-prod (session 5), with the **`sessions` grant gap REMEDIATED and re-verified** (session 6: 40/40 + 628/628 PASS). Residual: `profiles`/`user_roles` + ~18 sibling empty-`relacl` tables remain REST-inaccessible to every role (fail-closed functional gap; `42501` on session INSERT/`book_session`), the production anchor over-grants `anon`, and production runtime remains unexercised (empty DB).
- **Priority:** P1 (recommended next work items, each separately authorized: residual grant-gap remediation for `profiles`/`user_roles` + ~18 sibling empty-`relacl` tables; production `anon` over-grant REVOKE/investigation; optional re-run of the runtime matrix against production once populated).
- **Source/evidence:** AT-0001 baseline audit (live-DB `UNKNOWN — REQUIRES VERIFICATION`); AT-0002 session 1 probes (BLOCKED); session 2 probes — REST data plane reachable, anon-denial on 5 learner tables → HTTP 200 `[]`; session 3 — Management-API live queries recorded to verify (production): all 5 tables exist + RLS enabled; exact owner/participant/admin-scoped policies for SELECT/INSERT/UPDATE/DELETE; helpers `has_role`/`is_parent_of`/`can_access_classroom_room` + `app_role` enum `{admin,tutor,student,parent}` present; all 5 tables = 0 rows; `auth.users`=0, `user_roles`=0; source↔applied MATCH (`20260530152504`,`20260601045818`,`20260605061006`,`20260622125739`,`20260623113448`, helpers `20260518180453`/`20260522073549`/`20260622125739`); session 4 (this) — non-prod reproduction: dedicated hosted non-prod project created (`rwpxaejhouunxlcibpou`); Management API migrations endpoint (CLI `db push` network-blocked — pooler resolves to IPv6 the CLI rejects; direct host unresolvable); reset + spaced replay applied all **73 migrations 73/73 in lexical order**; applied-history = exactly the 73 repo filenames; reconcile captured (61 RLS-enabled tables incl. Set A/B; enums incl. `app_role`; functions/ACLs; auth baseline email-confirmation-on, 0 users, 0 objects); deltas: `storage.objects` pre-seeded policies dropped pre-replay, API-assigned `version` timestamps vs CLI filename-prefix. **Evidence classification:** the `docs/evidence/queries/*.sql` files are query definitions only (no captured output); `supabase_schema.json`/`supabase_schema.txt` are failed/error captures (`LegacyDeclarativeNotEnabledError`), NOT schema dumps; session-3 claims are historical live-verification narrative in `docs/CURRENT_STATE.md`; session-4 non-prod evidence is captured current-session artifacts under `%LOCALAPPDATA%\Temp\opencode\at0002-*` (not committed). Raw pooler 5432 still unreachable; direct `db.*.supabase.co` does not resolve; no DB connection string/password in repo (Management API used instead; production `.env`/`config.toml` untouched). Keys legacy format (`sb_publishable_...` anon, `sb_secret_...` service role). **Session 6 (this) — non-prod grant-gap remediation evidence (captured, session-local `%LOCALAPPDATA%\Temp\opencode\at0002-runtime\`, not committed):** `grant-state-before.json`/`grant-state-after.json` (`sessions.relacl` EMPTY → `{postgres=arwdDxtm/postgres,authenticated=arwd/postgres,service_role=arwdDxtm/postgres}`; `has_table_privilege` authenticated=True/service_role=True/anon=False); `rls-diff-after-remediation.json` (policies/functions/schema_usage/default_acl byte-identical; only `sessions.relacl` changed); `remediation-record.json`; `ev-smoke-after.json` (11/11 PASS); `ev-blocked-40-rerun.json` (**40/40 PASS** on the exact blocked-40 set); `ev-phase6-rerun.json` (**628/628 PASS**, residue 0); `rerun-blocked-40.ps1`/`regress-full.ps1`/`smoke-after.ps1` harnesses. `profiles` discovery: `42501 permission denied for table profiles` (hint `GRANT SELECT ON public.profiles TO authenticated;`) on non-admin session INSERT/`book_session` — out of scope, recorded as actionable finding. Production `anon` over-grant (`arwdDxtm` on `sessions`/`profiles`/`session_records`/`user_roles`) read-anchored from the production anchor — recorded as actionable finding.
- **Session history:** (1) BLOCKED — no usable database/REST/local access; REST host unresolvable, pooler 5432 timed out. (2) PARTIAL — REST data plane reachable; anon-denial on learner-owned tables (empty `[]`, ambiguity unresolved); applied-schema/RLS/row-count BLOCKED (no DB path). (3) PARTIAL — production applied-DB/RLS/row-count/reconciliation VERIFIED live via Management API (historical narrative); cross-learner A/B runtime isolation still NOT VERIFIED (empty DB, `auth.users`=0, no two identities). (4) PARTIAL → non-prod reproduction DONE — repository's 73 migrations applied 73/73 to dedicated hosted non-prod `rwpxaejhouunxlcibpou` (captured evidence); production untouched. (5) RUNTIME VERIFIED ON NON-PROD — populated 25 principals (20 learners/1 admin/3 tutors/1 parent) + controlled Set-A records; 628-case authorization harness → **588 PASS / 40 BLOCKED / 0 FAIL**; no cross-learner read/write/IDOR succeeded (DB state verified); 40 BLOCKED = `sessions` empty-`relacl` 403s; ~20 empty-`relacl` tables recorded. (6) SESSIONS GRANT GAP REMEDIATED ON NON-PROD (separately authorized) — minimal intended `GRANT SELECT,INSERT,UPDATE,DELETE ON public.sessions TO authenticated` + `GRANT ALL ON public.sessions TO service_role` applied via Management API query; RLS untouched (before/after: only `sessions.relacl` changed); 11-case functional smoke 11/11 PASS; previously-blocked 40 = **40/40 PASS**; full 628-case regression (`regress-full.ps1`) = **628/628 PASS** (zero PASS→FAIL flips); `session_records` SELECT rep + representation-INSERT (201) restored; residue 0. Production zero-touch maintained; non-prod RLS never weakened.
- **Decision status:** `VERIFIED WITH ACTIONABLE FINDINGS`. Non-prod migration reproduction VERIFIED (73/73, captured); non-prod **runtime cross-learner isolation VERIFIED** for all grant-bearing learner tables (588 PASS / 40 BLOCKED / 0 FAIL, captured); **`sessions` grant-gap remediation VERIFIED on non-prod (session 6: blocked 40 → 40/40 PASS; 628-case regression → 628/628 PASS; RLS unchanged)**. Remaining actionable findings (separate authorized remediation): residual fail-closed grant gaps (`profiles`/`user_roles` + ~18 empty-`relacl` tables — `42501` on the two `sessions` INSERT WITH CHECK policies and `book_session` via `profiles`) and the production `anon` over-grant (`arwdDxtm`); optionally re-run the matrix against production once populated.

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
- **Risk:** Medium (no automated re-verification; applied RLS policy *definitions* verified live via AT-0002 as recorded session-3 narrative — current reproducible live evidence NOT VERIFIED — though the non-prod RUNTIME cross-learner harness (session 5) now provides captured behavioral evidence; the harness itself is Temp-dir, not committed/automated).
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

| ID | Item | Type | Owner / phase | Status |
|---|---|---|---|---|
| CF-001 | ATD-0009 — testing framework decision (UN-001; TR-008) | Product/engineering decision | Phase 1 **gate** | OPEN — blocks Phase 1 start |
| CF-002 | ATD-0010 — deployment platform decision (UN-002; TR-009) | Product/engineering decision | Phase 1 **gate** | OPEN — blocks Phase 1 start |
| CF-003 | Learning-design §21 acceptance list (vocabulary, item sets, affective signal set, diagnosis mapping, mastery semantics, decision-autonomy) + INST-DEC-6/7/8/9 | Product/learning + legal decisions | Phase 4–6 backbone prep | OPEN |
| CF-004 | INST-DEC-2/3 acceptance (product); INST-DEC-4/10 resolve at engineering time | Architecture decisions | Design follow-up | OPEN |
| CF-005 | UN-003 PhET scope (Phase 6); UN-004/UN-005 video/voice recording limits (Phase 3); UN-006 institution link flow (Phase 8) | Future implementation | Phase-locked | OPEN — NOT before its phase |
| CF-006 | AI Gateway / Model Router (Phase 5) | Future implementation | Phase 5 | OPEN (centralised `AiGateway` verified present; router component not built) |
| CF-007 | N-instructor (multiple-instructor) support | Future implementation | unassigned | OPEN (zero `instructor` matches in `src/`; HISTORICAL/PLANNED) |
| CF-008 | ATD-0011 auth-provider **production configuration** (D-0003 scope); AT-0002 residuals (production `anon` over-grant `arwdDxtm`, optional production runtime matrix once populated); affective retention/legal posture | Production verification | operational / legal | OPEN |
| CF-009 | `session_records.ai_summary` writer | Evidence-resolvable | verification | OPEN (see P2 entry above) |
| CF-010 | MASTER_PLAN §1 vs D-0005 alignment; stale archive preservation | Doc reconciliation | this exercise / P4 | CLOSED (aligned here) / PRESERVED |
