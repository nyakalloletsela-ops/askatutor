# OpenCode handoff — 2026-09-23

This is the authoritative continuation snapshot for the current Learning Domain and Virtual Lab work. It describes the shared, intentionally dirty workspace. It does not claim production readiness. No commit was made for this handoff.

## First action and operating loop

Read the root `AGENTS.md`, this file, `docs/CURRENT_STATE.md`, `docs/BACKLOG.md`, `docs/DECISION_LOG.md`, and `docs/audits/LEARNING_DOMAIN_CASE_MATRIX_20260923.md`. Then inspect the current `git status` and relevant diffs before editing. Preserve all existing uncommitted changes, including files not listed as Learning Domain work below.

Continue in dependency order using:

**INSPECT → UNDERSTAND → PLAN → IMPLEMENT → TEST → REVIEW → VERIFY → DOCUMENT → CONTINUE**

After each task, reassess the repository and continue autonomously to the next safe task. Do not wait for a new prompt. Do not apply pending migrations to production or invent the decisions listed below.

## Current state

### Learning Domain

- `src/domain/learning/topic.ts` provides a pure topic/prerequisite graph model and validation. Topic persistence, author authority, and metadata-reader scope remain undecided.
- Learners can mark their own assignment complete through an authenticated use case and `complete_own_assignment` RPC. The migration is local and unapplied; no database runtime result is claimed.
- Assignment-submission ownership and grade-field protections are authored in a pending migration. Existing deletion/resubmission behavior remains unchanged pending policy.
- Notes and whiteboard snapshots have existing persistence paths. Whiteboard setup and snapshot read failures now propagate instead of appearing as an empty board; repository tests cover those errors.
- `LearningRecordRepository` remains an interface without implementation or wiring. There is no authoritative assessment, progress, or mastery system.

### Virtual Lab / Labs

- `/labs` contains the PhET/native-WebGL lab catalog; `/labs/simulation-lab` creates and runs AI-generated simulation definitions. Routes are authenticated and Labs-gated. External PhET provider access remains outside platform control.
- Lab definitions are explicitly saved by the learner. The server validates the definition, derives the owner from authenticated context, and the repository calls the prepared owner-scoped atomic RPC with a stable UUID retry key. Save errors remain visible and preserve the retry key. Library reopening loads the saved definition and resets execution state; it is not session resume.
- The simulation migration statically specifies one simulation plus version 1 in a transaction, owner/request idempotency, direct-write revocations, Labs/AI platform checks, owner-scoped access, input/payload bounds, and hardened function grants/search paths. The RPC's nested validation is still narrower than the complete application `SimulationSchema`; direct-RPC parity is the highest-priority source-level gap.
- `Scene2D` evaluates graph formulas with a bounded arithmetic parser instead of JavaScript compilation. Lab AI chat disallows caller-supplied system messages and checks both the Labs capability and the existing AI capability. It does not have durable history, usage accounting, lab-specific rate limits, or provider-retention verification.
- There is no durable lab execution session, interaction history, measurement/result record, reflection persistence, assessment attempt, completion, progress/mastery integration, LearningRecord link, tutor review, parent visibility, or offline/interruption recovery. A newer deterministic `src/domain/lab` mechanics/validation foundation is not connected to the Simulation Lab route.
- The old unsupported client-side “10 labs” counter was removed. No Free lab count, simulation count, AI limit, storage limit, duration, or reset period has been invented or enforced.

## Verification evidence

The latest recorded local verification (2026-09-23, before this documentation-only handoff edit) is:

- `bun test tests/` — **118 passed, 0 failed, 725 assertions**.
- `bunx tsc --noEmit` — **exit 0, no TypeScript errors**.
- Targeted Learning Domain / Virtual Lab ESLint and Prettier checks — **exit 0**.
- `bun run build` — **exit 0**. It emitted existing TanStack `inputValidator()` deprecation, dependency chunk/directive, and SSR `THREE.Vector3` stub warnings.
- Full `bun run lint` — **exit 1**, 68 errors and 34 warnings across the repository and archived evidence; this is not a targeted Virtual Lab lint result.
- Full `bunx prettier --check .` — **not clean**, five Markdown files were reported. Targeted Learning Domain / Virtual Lab files and the case matrix passed before this handoff file was added.
- `git diff --check` — **exit 0**; Git printed LF-to-CRLF notices.

This handoff changes Markdown and `AGENTS.md` only; after formatting, run a targeted Prettier check and `git diff --check`. Do not repeat the unchanged full build/test cycle solely for these documentation edits.

## Evidence classification

### VERIFIED

- The local application test suite, TypeScript check, targeted lint/format checks, build, and diff check have the exact results above.
- Source shows owner-derived simulation identity at the server boundary, stable request UUID propagation, explicit save consent, fail-closed application entitlement checks, and bounded graph formula parsing.
- The local static migration contract tests assert the prepared RPC's key ownership, grants, schema bounds, version-1 insert, and idempotency structure.
- Historical read-only/non-production evidence is recorded in `docs/audits/AUDIT_REVALIDATION_20260923.md` and the AT-0005/AT-0002 records. Historical evidence must not be presented as a runtime result for the three new Learning Domain migrations.

### PARTIALLY VERIFIED

- Authorization and persistence improvements are source-reviewed and unit/static-contract tested, but the new assignment and simulation database functions have not been exercised against an active non-production database.
- Current Labs route gates, authenticated server functions, application entitlement checks, owner-scoped reads/deletes, and prepared database checks are visible in source. Cross-learner runtime behavior for these new paths has not been rerun.
- Atomicity, concurrent retries, function ACLs, `search_path`, RLS interaction, and rollback have static source evidence only for the new simulation migration.
- Production's previously observed subscriptions-disabled/open configuration is historical read-only evidence, not a Free-tier product decision.

### UNKNOWN

- Database runtime behavior for the pending assignment and simulation migrations; real learner/tutor/admin/anonymous route journeys; current applied grants/policies for these new functions; AI provider retention, effective rate/abuse controls, and billing/quota accounting.
- Session, measurement, result, reflection, assessment, completion, progress, mastery, tutor-review, parent-visibility, offline recovery, and version-history behavior beyond saved simulation definition version 1.
- Whether the current external/non-production project state or credentials have changed since the recorded audit. Recheck read-only environment state before planning any runtime step.

### BLOCKED

- The latest project record says the approved non-production Supabase project `rwpxaejhouunxlcibpou` is inactive and its migration endpoint times out; local Supabase CLI/Docker verification was unavailable. Production is active but must remain untouched. No runtime verification of the pending 2026-09-23 migrations is available from this workspace state.
- Production authorization is not present. Do not apply migrations, write test data, alter grants/RLS, or perform destructive operations in production.

## Migrations

| Migration                                                           | State                                                                                                                                                                                       | Why / next boundary                                                                                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `20260914120000_self_service_checkout_intent_finalize.sql`          | Historically applied and DB-verified on the dedicated non-production project as recorded in FC-003; production still records 73 applied versus 74 repository migrations in the latest audit | Do not apply to production. The live payment provider path remains separately blocked on sandbox credentials.                                   |
| `20260923110000_harden_assignment_submission_ownership.sql`         | Local source only; unapplied                                                                                                                                                                | New source is not runtime-verified; approved non-production was inactive. Submission delete/resubmit policy is also unresolved.                 |
| `20260923123000_secure_learner_assignment_completion.sql`           | Local source only; unapplied                                                                                                                                                                | New RPC authorization and grants need approved non-production runtime probes.                                                                   |
| `20260923140000_enforce_simulation_entitlement_and_atomic_save.sql` | Local source only; unapplied                                                                                                                                                                | Requires database allow/deny, ACL, RLS, rollback, same-key retry, and concurrency verification in approved non-production. No production apply. |

## Unresolved product decisions

Do not encode defaults for any of these until recorded as product policy:

- Free Labs access and numeric limits: free labs/simulations, AI allowance, storage, duration, and reset periods.
- Existing saved-work access after entitlement expiry or downgrade; retention, expiry, export, sharing, and deletion rules.
- Tutor, parent, classroom teacher, and administrator visibility/review permissions for learner lab work; who may control classroom lab broadcasts.
- What constitutes a lab session, completion, valid measurement/result evidence, reflection visibility/consent/retention, offline recovery, and versioned edits.
- Assessment content, scoring authority, attempt/retake rules, and whether/how lab performance contributes to progress, mastery, or LearningRecord.
- Topic authoring and metadata-reader authority; assignment-submission deletion/resubmission policy.
- AI quota/accounting, lab-specific rate limits, abuse handling, durable chat/audit records, and provider privacy/retention.

## Remaining implementation gaps

1. Simulation RPC direct-call validation does not yet match the full nested Zod schema. Keep it bounded and fail-closed; do not add educational numeric limits that the application contract does not define.
2. The new assignment and simulation migrations need database-backed verification in approved non-production.
3. Virtual Lab currently saves reusable definitions, not execution sessions/results/reflections. Do not add those schemas until the relevant policy is decided.
4. No learning progress/mastery/assessment integration currently consumes lab activity. Design an integration seam only after its evidence contract is accepted; engineering must not choose mastery weights.
5. Full repository lint and full Markdown formatting remain red as recorded. Fix only issues that directly affect this Learning Domain work.

## Single highest-priority next engineering task

Close the direct-RPC schema-validation gap for `save_simulation_with_initial_version`: compare the full `SimulationSchema` with the database validator, implement matching structural/type checks that do not invent product limits, add focused source-contract tests, and update the matrix/backlog. Then run the existing Labs authorization, atomicity, rollback, retry, and concurrency probes against approved non-production when it is active. If runtime access is still blocked, continue to the next safe source-level Learning Domain task without waiting for a new prompt.

## Files present in the dirty workspace at initial handoff inspection

These entries are a preservation inventory, not a claim that this handoff created them. Existing edits and untracked files were retained. Re-run `git status --short` for the live authoritative status.

### Tracked modified files

- `.env.example`
- `docs/BACKLOG.md`
- `docs/CHANGE_LOG.md`
- `docs/CURRENT_STATE.md`
- `docs/DECISION_LOG.md`
- `src/application/contracts/dependencies.ts`
- `src/application/index.ts`
- `src/application/use-cases/discovery/book-session.ts`
- `src/application/use-cases/simulation/chat.ts`
- `src/application/use-cases/simulation/lab.ts`
- `src/domain/ports/index.ts`
- `src/domain/ports/simulation-repository.ts`
- `src/domain/ports/tutor-repository.ts`
- `src/infrastructure/di/index.ts`
- `src/infrastructure/repositories/classroom-repository.ts`
- `src/infrastructure/repositories/simulation-repository.ts`
- `src/infrastructure/repositories/tutor-repository.ts`
- `src/integrations/supabase/types.ts`
- `src/lib/lab-modules.ts`
- `src/presentation/domains/3-personalization-role-context/ScopeGate.tsx`
- `src/presentation/domains/3-personalization-role-context/hooks/use-entitlements.tsx`
- `src/presentation/domains/3-personalization-role-context/hooks/use-platform-config.tsx`
- `src/presentation/domains/5-classroom-live-workspace/LorddaLab.tsx`
- `src/presentation/domains/5-classroom-live-workspace/ThreeDLab.tsx`
- `src/presentation/domains/5-classroom-live-workspace/WebGLLab.tsx`
- `src/presentation/domains/5-classroom-live-workspace/classroom/ClassroomStage.tsx`
- `src/presentation/domains/5-classroom-live-workspace/lab3d/Scene2D.tsx`
- `src/presentation/domains/7-commerce-financial/payments/BulkLessonConfig.tsx`
- `src/routes/_authenticated/assignments.tsx`
- `src/routes/_authenticated/book.$tutorId.tsx`
- `src/routes/_authenticated/labs.tsx`
- `src/routes/_authenticated/labs_.simulation-lab.tsx`
- `src/routes/_authenticated/pay-tutor.tsx`
- `src/routes/checkout.success.tsx`
- `src/routes/tutor.$id.tsx`
- `src/routes/tutors.tsx`

### Untracked files and additions present at inspection

- `audit-evidence/EMAIL_REFERENCE_AUDIT_20260913-092816.txt`
- `docs/audits/AUDIT_REVALIDATION_20260923.md`
- `docs/audits/AUDIT_VERIFICATION_QUEUE_20260914.md`
- `docs/audits/LEARNING_DOMAIN_CASE_MATRIX_20260923.md`
- `pnpm-lock.yaml`, `pnpm-workspace.yaml`
- `src/application/use-cases/commerce/initiate-checkout.ts`
- `src/application/use-cases/discovery/browse-tutors.ts`
- `src/application/use-cases/lab/validate.ts`
- `src/application/use-cases/learning/assignments.ts`
- `src/domain/lab/domains/physics/nbody-1d.ts`
- `src/domain/lab/engines/mechanics-1d.ts`
- `src/domain/lab/execution/fixed-step.ts`
- `src/domain/lab/experiment.ts`
- `src/domain/lab/expression.ts`
- `src/domain/lab/guards.ts`
- `src/domain/lab/knowledge.ts`
- `src/domain/lab/lab-definition.ts`
- `src/domain/lab/math-expression.ts`
- `src/domain/lab/model-class.ts`
- `src/domain/lab/pedagogy.ts`
- `src/domain/lab/validation.ts`
- `src/domain/learning/topic.ts`
- `src/domain/ports/assignment-repository.ts`
- `src/infrastructure/repositories/assignment-repository.ts`
- `src/integrations/supabase/client.public.server.ts`
- `src/presentation/domains/3-personalization-role-context/resolve-scope-access.ts`
- `supabase/migrations/20260914120000_self_service_checkout_intent_finalize.sql`
- `supabase/migrations/20260923110000_harden_assignment_submission_ownership.sql`
- `supabase/migrations/20260923123000_secure_learner_assignment_completion.sql`
- `supabase/migrations/20260923140000_enforce_simulation_entitlement_and_atomic_save.sql`
- `tests/assignment-repository.test.ts`
- `tests/classroom-repository.test.ts`
- `tests/lab-expression.test.ts`
- `tests/lab-math-expression.test.ts`
- `tests/lab-model-class.test.ts`
- `tests/lab-physics-nbody.test.ts`
- `tests/learning-topic.test.ts`
- `tests/scope-access.test.ts`
- `tests/simulation-entitlement.test.ts`
- `tests/simulation-repository.test.ts`
- `tests/simulation-rpc-migration.test.ts`

Three unusual root-level untracked artifacts were also present and preserved: `bject Name, Mode, Length` (a terminal `less` help capture), `ersUserDocumentsProjectsaskatutor` followed by a private-use glyph, and `t` followed by a private-use glyph and a Supabase-tree heading. The latter two begin with repeated historical Git output. Inspect them before any cleanup; they were not removed or treated as source.

### Handoff files added/updated in this continuation

- Added `AGENTS.md` as the shared Codex/OpenCode operating contract.
- Added this handoff record.
- Updated `docs/audits/LEARNING_DOMAIN_CASE_MATRIX_20260923.md` to remove the stale “not idempotent” statement and specify accurate retry/concurrency probes.
- Updated `docs/CURRENT_STATE.md`, `docs/BACKLOG.md`, and `docs/CHANGE_LOG.md` to point here, carry the single next task, and record this handoff.
