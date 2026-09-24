# AskATutorLive — Fresh Repository and Online Revalidation

- **Date:** 2026-09-23
- **Scope:** Fresh repository checks, read-only Supabase inspection, public-site HTTP checks, and PayPal sandbox reachability.
- **Safety:** No database writes, account changes, payment actions, or production configuration changes were performed.
- **Evidence limit:** This report records current-session evidence. Historical evidence remains historical unless rechecked here.

## Current state

AskATutorLive is a substantial TanStack Start / React / Vite / Nitro application backed by Supabase. The repository has 326 files under `src/`, 74 migration files, and five test files. Some domains use the Application → Domain port → Infrastructure boundary; 27 route/presentation files still matched a direct Supabase access search. The worktree was already substantially modified before this assessment; those changes were preserved.

The production website responds publicly, but this does not verify authenticated journeys, booking, payments, or the production deployment provider. The currently configured local Supabase URLs point to the **non-production** project, which is now **INACTIVE**.

## Verified in this session

- `bun test`: **75 passed, 0 failed** (613 assertions across 6 discovered files; Bun also finds a forensic duplicate test file).
- `bunx tsc --noEmit`: **0 errors** after the booking-route change.
- `bun run build`: **success** (Cloudflare/Nitro output); emitted existing TanStack `inputValidator()` deprecation notices and dependency bundling warnings.
- Booking route targeted ESLint: clean. Full lint: **109 findings (73 errors, 36 warnings)**; most include pre-existing `any` and hook issues, and the lint target includes forensic evidence copies.
- `git diff --check`: clean (Git reported line-ending normalization warnings only).
- Public site read-only GETs: `/`, `/tutors`, `/auth`, `/privacy` on `www.askatutorlive.com` returned HTTP 200. Apex `askatutorlive.com` returned HTTP 308. These are route availability checks, not interactive journey tests.
- PayPal sandbox API endpoint is network-reachable; an unauthenticated HEAD returned HTTP 403. No client ID, client secret, or webhook ID was present in either `.env` file or process/user/machine environment variables. No OAuth request or checkout was attempted.

## Live Supabase findings

- The connected Supabase service lists production `askatutorlive` (`bzjlhxmiwdkteqkzqasi`) as **ACTIVE_HEALTHY** and the documented non-production project `askatutorlive-at0002-nonprod` (`rwpxaejhouunxlcibpou`) as **INACTIVE**.
- Read-only migration listing works on production: **73 applied migrations**, ending with `20260815140000_add_rls_parent_role_policies`. The repository has **74** migration files; the newer local `20260914120000_self_service_checkout_intent_finalize.sql` is not in the production applied list. It remains unapplied to production.
- Listing migrations on the inactive non-production project timed out. No non-production applied-state or runtime test was possible in this session.
- Read-only exact row counts on production: `auth.users` = 1, `public.profiles` = 1, `public.user_roles` = 1; `sessions`, `session_records`, `assignments`, `assignment_submissions`, `notes`, `simulations`, and `payment_intents` = 0. This supersedes earlier current-state text claiming that production had zero users and zero profile/role rows. No row contents were read.
- RLS is enabled on the eight inspected tables (`profiles`, `user_roles`, `sessions`, `session_records`, `assignments`, `assignment_submissions`, `notes`, `simulations`). The database reports that `anon` has explicit all-privilege ACL entries on these tables, including SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, and TRIGGER privileges. The selected RLS policies target `public` and use identity/role predicates. **This establishes excessive grants and a security hardening risk; it does not by itself establish anonymous data disclosure.** No direct anonymous REST deny-case was run, and learner tables were empty at inspection time.
- Production Supabase security advisors reported: 4 functions with mutable `search_path`; 5 anonymous-executable `SECURITY DEFINER` functions; 36 authenticated-executable `SECURITY DEFINER` functions; the `vector` extension in `public`; and leaked-password protection disabled. These are findings for review, not proof each function is exploitable. No grants/functions/auth settings were changed.

## Partially verified

- Production schema, migration history, ACLs, table row counts, and advisor findings were directly queried through the Supabase connector. Runtime authorization is not established by catalog results, especially with one account and empty learner tables.
- The public site is live at the tested URLs, but no current browser interaction, authentication, booking, payment, or session journey was performed.
- Production migration state is one migration behind the repository. The non-production environment is inactive, so there is no available environment to validate that migration or run a current cross-user matrix.

## Unknown or blocked

- **BLOCKED:** Current non-production database runtime and migration history; project status is INACTIVE and the migration-list call timed out. Local `.env` and `.env.local` target that project.
- **BLOCKED:** PayPal sandbox authentication/checkout; credentials are absent across the inspected local environment locations. Sandbox network reachability alone does not verify credentials or provider behavior.
- **UNKNOWN:** Current authentication-provider configuration and actual login/session refresh behavior. One production auth user exists, but no credentials or safe test account were used.
- **UNKNOWN:** Current production deployment host/provider, automated deploys, DNS records, CI/CD, logging, and recovery. Only the deployed website's response was checked.
- **UNKNOWN:** Production runtime RLS behavior for non-empty learner records and direct anonymous REST behavior. Existing historical non-production isolation artifacts do not establish today's production behavior.

## Security and product priorities

1. Treat the production `anon` table grants and anonymous-executable `SECURITY DEFINER` functions as a high-priority security review. Preserve RLS; do not revoke or rewrite production grants/functions without a reviewed migration and non-production regression run.
2. Restore/approve an active non-production environment before applying the pending checkout migration or running anonymous/authenticated booking and isolation tests.
3. Reconcile the 73 applied production migrations with the 74 repository migrations; do not apply the checkout migration to production without its separately required authorization and payment verification.
4. Continue implementation that can be verified locally. Persistent assessment/mastery/learning records, payment reconciliation, AI quota enforcement, and operational monitoring remain product gaps per the source and current requirements.

## Work started

**AT-0009 — Booking route function-boundary conversion:** the booking page now invokes waitlist and email server functions through `useServerFn`. Email delivery failures no longer disappear silently; a saved booking remains successful and the learner receives a warning if confirmation mail fails. Source/type/build/test checks passed. **Browser/runtime verification is BLOCKED** by the inactive non-production project; no production write was attempted.

The PayPal environment example was also corrected to document the server-side `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_WEBHOOK_ID` variables, which the provider adapter reads.

