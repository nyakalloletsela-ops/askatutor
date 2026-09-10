# AskATutorLive — Master Engineering Programme & Governance Protocol

- **Work ID:** AT-0001 (control-system baseline; AT-0002 tracked below)
- **Status:** IN_PROGRESS (control system installed and AT-0001 COMPLETED; AT-0002 = `VERIFIED WITH ACTIONABLE FINDINGS` — non-prod migration reproduction VERIFIED 73/73 (session 4) + cross-learner RUNTIME isolation VERIFIED on non-prod (session 5: 588 PASS / 40 BLOCKED / 0 FAIL) + **session-6 grant-gap remediation EXECUTED on non-prod `rwpxaejhouunxlcibpou`: minimal intended `sessions` GRANTs restored (`authenticated` arwd + `service_role` ALL, anon untouched), RLS unchanged, previously-blocked 40 re-run 40/40 PASS, full 628-case regression 628/628 PASS**; production applied-state PARTIALLY VERIFIED (historical narrative) and production OVER-grant flagged (anon arwdDxtm on learner tables) as an actionable prod-side finding — see Work Item Register / capability entry)
- **Type:** Engineering governance (process control), not an application architecture decision
- **Authority:** The governance model supplied with the AT-0001 task brief. Where the supplied Master Engineering Programme is referenced, it is authoritative for *engineering process*. It is NOT automatically authoritative for *application architecture decisions* (see Governance Rule below).

---

## 0. Purpose

This document is the permanent engineering-control specification for the AskATutorLive repository. It exists to prevent:

- context switching from destroying continuity
- abandoned implementations
- ghost features
- duplicate architectures
- demo-only systems being mistaken for production systems
- undocumented architectural changes
- stale documentation being treated as fact
- unsupported verification claims
- unfinished work being silently forgotten

The repository's *actual* state — as established by the AT-0001 baseline audit — is recorded in
`docs/CURRENT_STATE.md` and `docs/AUDIT_BASELINE_AT-0001.md`. **Evidence takes precedence over assumptions.**

---

## 1. Governance Rule (Roadmap ≠ Accepted Architecture)

A statement in this Master Plan's roadmap is a **programme map**, not a bound application-architecture decision.

Any specific architectural stance must be either:

1. backed by an `ACCEPTED` entry in `docs/DECISION_LOG.md`, **or**
2. explicitly labelled `PROPOSED`.

**In particular:**

> **Assessment architecture is `PROPOSED / UNACCEPTED` (bounded exception: D-0005).**
>
> The "dedicated assessment outcome consumed by Learning" direction discussed during the audit is a *proposed* architectural direction. It has **not** been accepted by explicit human decision and is **not** permission to implement. Only an explicit `ACCEPTED` entry in `docs/DECISION_LOG.md` authorizes implementation. **Superseded in part (2026-09-10):** D-0005 explicitly accepted the **bounded** learning/assessment target model (`topic_prerequisites`, typed `learner_assessments`, `learner_affective_reports`, `mastery_snapshots`, `learning_decisions`) as a design target; the remainder of the prior proposal (scoring service, learning-state heuristics, AI-graded mastery) stays `PROPOSED / UNACCEPTED`. Acceptance as a design target does **not** authorize implementation.

No roadmap phase implies authorization to implement.

---

## 2. Lifecycle / State Model

`DESIGNED` — planned/documented, not yet built.
`IMPLEMENTED` — source exists in the repository.
`APPLIED` — a migration/schema/config exists and is intended to be applied.
`TESTED` — a test asserts the behavior.
`VERIFIED` — confirmed by repository/runtime evidence.
`PRODUCTION-VERIFIED` — confirmed by current-session, tool-based evidence **from the actual production environment**.

Rules:

- Do not claim a higher state than the evidence supports.
- Source inspection yields at most `VERIFIED` (source-level). Live DB/applied-migration state remains `UNKNOWN — REQUIRES VERIFICATION` unless live evidence exists.
- `PRODUCTION-VERIFIED` requires current-session tool evidence from production. Repository/deployment config alone does **not** establish it.
- A migration file existing on disk is `APPLIED` intent only; whether it is reflected in the live database is `UNKNOWN — REQUIRES VERIFICATION` until verified live.
- `AI OUTPUT != EVIDENCE`. AI-generated content may be a coach artifact but is not authoritative learning evidence unless an accepted, implemented evidence model exists.

---

## 3. Roadmap Phases (Programme Map)

The phases below are the programme map supplied with the task. They are **programme phases**, not automatically accepted application-architecture decisions. Phase-specific architecture must satisfy the Governance Rule (Section 1).

> NOTE: The AT-0001 baseline audit (docs/CURRENT_STATE.md, docs/AUDIT_BASELINE_AT-0001.md) MUST be consulted to determine where the repository *actually* sits relative to these phases. Do not assume the repository is at a phase merely because the roadmap lists it. See `ROADMAP POSITION` in the baseline audit.

Phases 0–19 (as supplied):

- **0** — Governance & baseline establishment (this work; AT-0001). The historical Phase 0 documentation exercise (AT-0000) was closed by exit-gate assessment via AT-0003 (`docs/DECISION_LOG.md` → D-0006: verdict `CLOSED WITH EXPLICIT FOLLOW-UPS`, pending human acceptance); the archived 0–19 roadmap (`docs/archive/MASTER_PLAN (2).md`) remains provenance.
- **1** — Foundations & repository consolidation.
- **2** — Identity, authentication & authorization baseline.
- **3** — Learner isolation & multi-user security.
- **4** — Learning backbone (Activity / Evidence / Mastery distinction).
- **5** — Assessment & outcomes.
- **6** — Mastery & progression.
- **7** — AI gateway hardening (quotas, logging, retries, timeouts, moderation).
- **8** — Commerce & financial integrity.
- **9** — Trust, safety & privacy.
- **10** — Audit & operations.
- **11** — Quality & security testing.
- **12** — Performance & scale.
- **13** — Deployment & production verification.
- **14** — Continuous improvement.
- **15** — Recommended/intervention layer.
- **16** — Content & curriculum.
- **17** — Communication & tutoring.
- **18** — Recommendation/intervention (advanced).
- **19** — Future/expansion roadmap.

> The exact official phase list supplied in the task overrides this summary if a discrepancy exists; this summary preserves the 0–19 programme structure.

---

## 4. Work Item Register

Permanent work IDs use the format `AT-####`.

- **`AT-0001` — Governance Installation & Baseline Architecture Audit** (COMPLETED — control docs installed and baseline persisted; not VERIFIED).
- **`AT-0002` — Live Database Verification & RLS Isolation Confirmation** (`VERIFIED WITH ACTIONABLE FINDINGS`. Production applied-state: PARTIALLY VERIFIED via source/migration RLS evidence + recorded session-3 live narrative (historical, no captured in-repo artifacts). Session 4: **non-production migration reproduction VERIFIED** — the repository's 73 migrations applied 73/73 to dedicated hosted non-prod `askatutorlive-at0002-nonprod` (ref `rwpxaejhouunxlcibpou`), schema/RLS reconciled with captured evidence (see capability entry). **Session 5: cross-learner (A vs B) RUNTIME isolation EXECUTED and VERIFIED on non-prod (588 PASS / 40 BLOCKED / 0 FAIL)** — no cross-learner read/write/IDOR succeeded via REST; DB-state verified after every attack. **Session 6: grant-gap remediation EXECUTED on non-prod `rwpxaejhouunxlcibpou`** — minimal intended `public.sessions` GRANTs restored (`authenticated` = arwd, `service_role` = ALL, `anon` untouched), RLS unchanged (before/after diff: policies/functions/schema_usage/default_acl identical; only `sessions.relacl` changed); previously blocked 40 re-run = **40/40 PASS**; full 628-case regression = **628/628 PASS**; `session_records` SELECT and representation-INSERT rep paths restored (201). **Remaining actionable findings:** `profiles`/`user_roles` and ~20 sibling tables stay empty-`relacl` in non-prod (`42501` on direct `sessions` INSERT / `book_session` RPC via `profiles`), and the production anchor over-grants `anon` arwdDxtm on learner tables — both require separate authorized remediation. See capability entry below).

IDs are never casually reused. Each new meaningful piece of work receives a new permanent ID assigned in `docs/BACKLOG.md` and tracked in `docs/CURRENT_STATE.md`.

- **`AT-0003` — Phase 0 (AT-0000) Exit-Gate Closure Assessment** (documentation-only; assessment COMPLETED — the recommended verdict `CLOSED WITH EXPLICIT FOLLOW-UPS` is recorded in `docs/DECISION_LOG.md` → D-0006, **pending human acceptance**). Exit gates: 9/10 VERIFIED; the sole NOT-VERIFIED gate = the Phase-1 gating decisions ATD-0009 (testing framework) / ATD-0010 (deployment platform), which block Phase 1 start only. Carried-forward registers recorded in `docs/BACKLOG.md` (CF-001..CF-010: product-owner decisions, phase-locked implementation, production verification). Does **not** authorise Phase 1 or any implementation.

---

## 5. AT-0002 Capability Entry (verification outcome)

**Work ID:** AT-0002
**Capability affected:** Learner isolation & multi-user security (Phases 2–3); applied database / RLS state.

- **Previous status:** `UNKNOWN — REQUIRES VERIFICATION` → `BLOCKED` (session 1) → `PARTIALLY VERIFIED` (session 2) → `PARTIALLY VERIFIED` (session 3, applied-DB segments VERIFIED) → `PARTIALLY VERIFIED` (session 4, non-prod migration reproduction VERIFIED) → **session 5: NON-prod cross-learner RUNTIME isolation VERIFIED (588 PASS / 40 BLOCKED / 0 FAIL)** → **session 6: grant-gap remediation EXECUTED on non-prod (blocked 40 → 40/40 PASS; 628-case regression → 628/628 PASS)**.
- **New status:** `VERIFIED WITH ACTIONABLE FINDINGS`. Production applied-state (Set A: applied schema + RLS policy definitions + row-presence) = `PARTIALLY VERIFIED` via source/migration evidence + recorded session-3 live narrative (no captured in-repo artifacts). **Session 4: non-production migration reproduction = `VERIFIED`** — the repository's 73 migrations were applied 73/73, in strict lexicographic order, to the dedicated hosted non-prod project `askatutorlive-at0002-nonprod` (ref `rwpxaejhouunxlcibpou`, org of production, eu-west-1, Postgres 17) via the Management API migrations endpoint (CLI `db push` network-blocked on this host), with captured schema/RLS/auth reconciliation evidence (session-local Temp-dir artifacts, not committed). Production remains untouched. Two documented deltas: `storage.objects` seeding (fresh-project dashboard policies dropped pre-replay so the 73 files create their own) and migration-history `version` representation (API server timestamps vs CLI filename-prefix). **Session 5: NON-PRODUCTION cross-learner RUNTIME isolation = `VERIFIED`** — populated the non-prod project with 20 learners + 1 admin + 3 tutors + 1 parent and controlled per-learner records across `notes`/`simulations`/`assignments`/`assignment_submissions`/`session_records`, then ran a 628-case REST authorization harness (positive controls; cross-learner read matrix; cross-learner write INSERT/UPDATE/DELETE with post-attack DB-state verification; IDOR read/update/delete; RPC role boundaries; role escalation; anonymous): **588 PASS / 40 BLOCKED / 0 FAIL**. No cross-learner read or write succeeded and no IDOR mutation altered any row (owner- and DB-verified). **Actionable non-security finding (fail-closed, requires separate authorization):** ~20 tables (`sessions`, `profiles`, `user_roles`, `classroom_chat`, `messages`, `subjects`, `forum_posts`, `tutor_applications`, …) carry an **empty `relacl` → 403 `permission denied` for every REST role including `service_role`**; `session_records` SELECT is 403 for `authenticated` because its read policy references the grantless `sessions`. **Session 6: the `sessions` grant gap was REMEDIATED on non-prod (separately authorized) and VERIFIED** — minimal intended `public.sessions` GRANTs restored (`authenticated` = arwd, `service_role` = ALL, `anon`/`postgres` untouched), RLS unchanged (diff: policies/functions/schema_usage/default_acl identical; only `sessions.relacl` changed); previously-blocked 40 `sessions` REST cases re-run = **40/40 PASS**; full 628-case regression (`regress-full.ps1`) = **628/628 PASS**; `session_records` SELECT rep + representation-INSERT (201) restored. **Remaining actionable findings (out of scope, separate authorization):** `profiles`/`user_roles` + ~18 siblings still empty-`relacl` in non-prod (`42501 permission denied for table profiles` on the two `sessions` INSERT WITH CHECK policies and `book_session` — grant-gap class, not leakage); production anchor over-grants `anon` arwdDxtm on `sessions`/`profiles`/`session_records`/`user_roles` (anonymous read exposure of learner data -> separate prod-side investigation/REVOKE).
- **Evidence (recorded session 3, live PRODUCTION applied DB via authenticated Management API over HTTPS — read-only, no secrets exposed; historical narrative, NOT captured output):** all 5 learner tables (Set A) exist with RLS enabled; exact owner/participant/admin-scoped policies verified for SELECT/INSERT/UPDATE/DELETE; RLS helpers (`has_role`,`is_parent_of`,`can_access_classroom_room`) + `app_role` enum `{admin,tutor,student,parent}` present; all 5 tables have 0 rows; `auth.users`=0; source↔applied policy MATCH. (Session-2 evidence preserved: REST data plane reachable; anon/probe → HTTP 200 `[]`.) `docs/evidence/queries/*.sql` = query definitions only; `supabase_schema.json`/`.txt` = error captures (`LegacyDeclarativeNotEnabledError`), not valid schema dumps. **Evidence (session 4, NON-prod migration reproduction, CAPTURED current-session, session-local Temp artifacts `%LOCALAPPDATA%\Temp\opencode\at0002-*`, not committed):** 73 migrations applied 73/73 to `rwpxaejhouunxlcibpou` in lexical order via Management API migrations endpoint; applied history = exactly the 73 repo filenames; 61 public tables all RLS-enabled; Set A + Set B present; enums/functions/ACLs/auth baseline verified; two deltas documented (`storage.objects` seeding, `version` representation). **Evidence (session 5, NON-prod RUNTIME authorization harness, CAPTURED — `%LOCALAPPDATA%\Temp\opencode\at0002-runtime\phase6-v2.ps1` + `ev-phase6-final.json`):** populated 25 principals (20 learners/1 admin/3 tutors/1 parent) + controlled Set-A records; 628 test cases → **588 PASS / 40 BLOCKED / 0 FAIL**; per-step counts (2=80P/20B, 3=80P/20B, 4=95P, 5=300P, 6=12P, 7=5P, 8=16P); `grants-acl` output / `policy-export.json` showing ~20 empty-`relacl` tables. **Evidence (session 6, NON-prod grant-gap remediation, CAPTURED — `%LOCALAPPDATA%\Temp\opencode\at0002-runtime\grant-state-before.json`/`grant-state-after.json`, `remediation-record.json`, `rls-diff-after-remediation.json`, `ev-smoke-after.json`, `ev-blocked-40-rerun.json`, `ev-phase6-rerun.json`):** minimal `GRANT SELECT,INSERT,UPDATE,DELETE ON public.sessions TO authenticated; GRANT ALL ON public.sessions TO service_role` applied via Management API query (isolated to non-prod ref); before/after diff = only `sessions.relacl` changed (`EMPTY` -> `{postgres=arwdDxtm/postgres,authenticated=arwd/postgres,service_role=arwdDxtm/postgres}`); policies/functions/schema_usage/default_acl byte-identical; `has_table_privilege`: authenticated sel/ins/upd/del True, service_role True, anon False; RLS enabled unchanged; population/regression residue 0.
- **Tests (session 5, NON-prod runtime, CAPTURED — `%LOCALAPPDATA%\Temp\opencode\at0002-runtime\phase6-v2.ps1`, `ev-phase6-final.json`):** populated non-prod `rwpxaejhouunxlcibpou` (25 principals: 20 learners/1 admin/3 tutors/1 parent; Set-A records per learner); 628 REST test cases → **588 PASS / 40 BLOCKED / 0 FAIL**. Step coverage: positive controls (80 PASS/20 BLOCKED), cross-learner READ isolation (80 PASS/20 BLOCKED — zero foreign rows), cross-learner WRITE (95 PASS — INSERT-as-other/UPDATE-reassign/DELETE-other all denied, DB unchanged), IDOR read/update/delete (300 PASS — GET/PATCH/DELETE on foreign ids denied, rows/titles unchanged), RPC role boundaries (12 PASS), role escalation (5 PASS), anonymous (16 PASS). 40 BLOCKED = `sessions` REST 403 (empty `relacl`). Sessions 2–3 tests recorded as narrative (not captured artifacts): table/RLS-enablement catalog check; `pg_policies` for all 5 tables; column schema; declared FKs; helper-function presence; `app_role` enum; `COUNT(*)`; `auth.users`/`user_roles` counts. Service-role not used as RLS evidence. **Tests (session 6, NON-prod, CAPTURED — `%LOCALAPPDATA%\Temp\opencode\at0002-runtime\rerun-blocked-40.ps1` → `ev-blocked-40-rerun.json`, `regress-full.ps1` → `ev-phase6-rerun.json`, `smoke-after.ps1` → `ev-smoke-after.json`):** 11-case functional smoke (owner READ 200, owner-only listing, foreign READ 200+0, foreign INSERT/DELETE blocked 403, foreign UPDATE unchanged, session_records rep-INSERT 201 in demo room, demo/member/non-member reads) = 11/11 PASS; exact previously-blocked 40 `sessions` REST cases = 40/40 PASS; byte-copy of the session-5 628-case regression (curl helper replaced by Invoke-WebRequest) = **628/628 PASS** with zero PASS->FAIL flips; post-regression residue = 0 (`sessions` residue keyed on `subject='IDOR-TEST-AT0002'`; no `title` column).
- **Verification level:** Production applied-state (Set A: applied schema + RLS policy definitions + row-presence) = `PARTIALLY VERIFIED` — source/migration RLS evidence plus recorded session-3 live narrative (no captured in-repo artifacts). **Non-production migration reproduction (session 4) = `VERIFIED`** — 73/73 migrations applied to `rwpxaejhouunxlcibpou` with captured evidence (61 RLS-enabled tables incl. Set A/B, enums, functions/ACLs, auth baseline: email-confirmation-on, 0 users, 0 objects; applied-history = exactly the 73 repo filenames). **Non-production cross-learner RUNTIME isolation (session 5) = `VERIFIED`** — 588 PASS / 40 BLOCKED / 0 FAIL on populated non-prod; no foreign read/write/IDOR mutation. **Session-6 `sessions` grant-gap remediation = `VERIFIED`** — non-prod `sessions` restored to intended grants, blocked 40 = 40/40 PASS, 628-case regression = 628/628 PASS (captured). Application-boundary runtime behavior and production runtime behavior = `NOT VERIFIED`. `PRODUCTION-VERIFIED` is **not** claimed for any environment: production results are session-3 narrative; runtime evidence is from non-production.
- **Remaining uncertainty:** (1) **grant-gap remediation** outcome — **REDUCED (session 6): the `sessions` gap was remediated and re-verified on non-prod (blocked-40 → 40/40 PASS; 628-case regression → 628/628 PASS)**; remaining drift = `profiles`/`user_roles` and ~18 sibling empty-`relacl` tables (non-prod `42501 permission denied for table profiles` on the two `sessions` INSERT WITH CHECK policies and `book_session` via `profiles`), plus the production `anon` over-grant (`arwdDxtm` on `sessions`/`profiles`/`session_records`/`user_roles`) — both require separate, authorized remediation; (2) **production** runtime enforcement remains `UNKNOWN — REQUIRES VERIFICATION` (empty DB, zero identities, out-of-scope to create data there) — re-run the same session-5 matrix against production once it is populated and authorized.
- **Dependencies:** (1) explicit authorization for the **remaining grant-gap remediation** (non-prod `profiles`/`user_roles` + ~18 sibling empty-`relacl` tables; production `anon` over-grant REVOKE investigation) — the `sessions` gap (formerly dependency 1) is now remediated and closed; (2) optionally, a populated/authorized test phase against **production** to re-execute the runtime matrix there. The non-prod project `rwpxaejhouunxlcibpou` remains available for re-verification.
- **Next required work:** Execute the separately-authorized **remaining grant-gap remediation** (non-prod `profiles`/`user_roles` + ~18 sibling empty-`relacl` tables — `42501` on the two `sessions` INSERT WITH CHECK policies and `book_session`; production `anon` over-grant REVOKE investigation) and re-run the session-5 harness after each change; optionally repeat the runtime matrix against production once populated.

---

## 6. Authority & Change Control

- Document changes to engineering process are made here (MASTER_PLAN.md) and in `docs/WORK_PROTOCOL.md`.
- Application architecture decisions are recorded in `docs/DECISION_LOG.md`. Only explicit human acceptance produces `ACCEPTED`.
- This master plan is a process control document. It does not approve any application implementation by itself.
