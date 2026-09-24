# AskATutorLive shared engineering contract

This file is the shared operating contract for Codex and OpenCode. Start with `docs/OPEN_CODE_HANDOFF_20260923.md`, then read the current state, Learning Domain case matrix, backlog, and decision log it identifies.

## Required work loop

For each dependency-ordered task, follow:

**INSPECT → UNDERSTAND → PLAN → IMPLEMENT → TEST → REVIEW → VERIFY → DOCUMENT → CONTINUE**

After documenting one task, reassess the repository and continue to the next safe task without waiting for a new prompt. Stop only when all safe source-level work is exhausted or progress requires an unresolved product decision, external access, or explicit production authorization. Record the blocker and proceed with independent safe work where possible.

## Workspace and scope

- Inspect `git status` and relevant diffs before editing. This workspace may contain substantial uncommitted user work. Preserve it; do not reset, clean, overwrite, or delete unexplained files. Do not attribute existing changes to yourself without evidence.
- Work from the current Learning Domain and Virtual Lab evidence. Do not begin a broad repository audit unless the user asks.
- Do not add cosmetic refactors or broad cleanup. Keep implementation, tests, backlog, case matrix, current state, and changelog synchronized when they materially change.
- Do not apply pending migrations to production or perform destructive/irreversible production operations. Do not claim database behavior is verified from static inspection.
- Use an approved non-production environment for database runtime checks only when it is available and authorized. If unavailable, continue source-level work and mark runtime status blocked.
- Do not weaken authorization, RLS, validation, or tests to make checks pass. Run targeted verification after meaningful source changes; avoid repeating unchanged full checks.

## Product-policy boundaries

Do not invent Free-tier allowances, lab/AI quotas, storage or duration limits, reset periods, retention/expiry rules, tutor/parent/admin visibility, assessment attempt rules, mastery/completion rules, or how performance affects learning records. Record missing policy as an unresolved product decision. Keep code boundaries ready for later policy without guessing.

## Evidence and handoff

- Separate source/test verification from database runtime verification and production verification.
- Record exact commands and results, current migration state, unresolved decisions, blockers, remaining gaps, and one highest-priority next engineering task in `docs/CURRENT_STATE.md` and the focused handoff record.
- Keep continuing autonomously through safe, dependency-ordered work. A completed audit or one blocked task is not a reason to stop while other safe work remains.
