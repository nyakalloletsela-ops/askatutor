# AskATutorLive — Master GAP REGISTER

## Category 1: Authentication & Account Lifecycle
**Status: YELLOW** — authentication foundation exists but critical gaps (password reset flow, account deletion, self-serve registration, OAuth completion, password change, suspension mechanism)

## Category 2: Roles, Permissions & Administration
**Status: 🔴 RED — PRODUCTION VERIFICATION BLOCKED**

### GAP-001: Incomplete role hierarchy coverage (P0)
- **Original finding**: Role checks exist for admin/tutor/student/parent but coverage is incomplete; some routes use direct DB queries instead of useAuth hook roles; RLS policies may not enforce all role boundaries
- **Evidence**: useAuth hook provides isAdmin/isTutor/isParent; but some route-level checks bypass the hook; RLS policies on profiles/sessions may have gaps
- **Remediation**: Added RLS policies for `profiles` and `user_roles` tables (migration `20260813090000_add_rls_profiles_user_roles_policies.sql`)
  - Users can read/update their own profile/role
  - Admins can read/update all profiles/roles
  - Standardized role check patterns
- **Code verification**: TypeScript typecheck passes; all admin routes have `beforeLoad` `checkIsAdmin()` guards
- **Local migration verification**: PASS — 6 Category 2 migration files exist in `supabase/migrations/`
- **Production database verification**: **BLOCKED** — cannot inspect actual Supabase RLS policies or confirm migrations applied
- **Live authorization tests**: **BLOCKED** — cannot run as different user roles (anonymous, student, tutor, parent, admin) without production Supabase access
- **Final status**: **REMEDIATED — PRODUCTION UNVERIFIED**

### GAP-002: Admin-only actions lack RLS enforcement (P1)
- **Original finding**: Admin-mediated actions (tutor creation, application approval) rely on service role or explicit admin checks; no RLS policy enforces admin-only at DB level for critical operations
- **Evidence**: tutor creation via admin API uses service role; no RLS policy restricting tutor_availability or user_roles to admins only
- **Remediation**: Added RLS policies for `tutor_subscriptions`, `tutor_courses`, `payment_intents`, `ledger_entries`, `site_content` tables (migration `20260814090000_add_rls_admin_operations_policies.sql`)
  - Admins can read/write all data for these tables
  - Students/tutors/anon can only access their own data or are denied
- **Code verification**: TypeScript typecheck passes
- **Local migration verification**: PASS — migration file `20260814090000_add_rls_admin_operations_policies.sql` exists
- **Production database verification**: **BLOCKED** — cannot inspect actual Supabase RLS policies or confirm migrations applied
- **Live authorization tests**: **BLOCKED** — cannot run actual authorization tests (student→admin denied, admin→authorized) without production Supabase access
- **Final status**: **REMEDIATED — PRODUCTION UNVERIFIED**

### GAP-003: No role-based API rate limiting or entitlement gates (P2)
- **Original finding**: No rate limiting or entitlement gates at API level beyond the book_session entitlement check; no per-role quota tracking visible
- **Evidence**: book_session has entitlement gate for 'find_tutors' scope; no other rate limiting or per-role quotas found
- **Remediation**: Added entitlement gates to `ensure_whiteboard`, `get_tutor_pricing`, `match_simulations`, `get_my_scopes` RPC functions (migration `20260814140000_add_rls_entitlement_gates_beyond_book_session.sql`)
  - RPCs now check `find_tutors` scope or admin role for access
  - Anonymous and unauthorized authenticated users are denied
- **Code verification**: TypeScript typecheck passes; RPCs compiled with new entitlement gates
- **Local migration verification**: PASS — migration file `20260814140000_add_rls_entitlement_gates_beyond_book_session.sql` exists
- **Production database verification**: **BLOCKED** — cannot confirm live entitlement gate enforcement against actual Supabase project
- **Live authorization tests**: **BLOCKED** — cannot run positive/negative authorization tests (find_tutors scope grant/deny, admin bypass) without production Supabase access
- **Final status**: **REMEDIATED — PRODUCTION UNVERIFIED**

### GAP-004: Tutor application role promotion missing validation (P2)
- **Original finding**: `approve_tutor_application` RPC promotes user to tutor role but no RLS policy or validation ensures the caller is actually an admin; no audit trail of role promotions
- **Evidence**: `approve_tutor_application` RPC exists; no visible RLS policy or admin check on the RPC itself
- **Remediation**: Added admin validation to `approve_tutor_application`, `reject_tutor_application`, `log_tutor_decision` RPC functions (migration `20260815090000_add_rls_tutor_app_promotion_validation.sql`)
  - Only users with `admin` role can approve/reject/log tutor decisions
  - EXECUTE revoked from anon; granted to authenticated only
- **Code verification**: TypeScript typecheck passes; RPCs have admin validation
- **Local migration verification**: PASS — migration file `20260815090000_add_rls_tutor_app_promotion_validation.sql` exists
- **Production database verification**: **BLOCKED** — cannot confirm live RPC admin validation against actual Supabase project
- **Live authorization tests**: **BLOCKED** — cannot run actual authorization tests (admin→SUCCESS, student/tutor→DENIED, role escalation attempts) without production Supabase access
- **Final status**: **REMEDIATED — PRODUCTION UNVERIFIED**

### GAP-005: Parent role visibility incomplete (P3)
- **Original finding**: Parent role is referenced in useAuth hook and handle_new_user trigger but no dedicated parent-specific RLS policies or UI paths visible; parent capabilities ambiguous
- **Evidence**: handle_new_user assigns role='student' when _chosen != 'parent'; parent role mentioned but no parent-specific policies found
- **Remediation**: Added RLS policies for parent role (migration `20260815140000_add_rls_parent_role_policies.sql`)
  - Parents can read own profile, own role, view associated sessions
  - Parents cannot manage tutor subscriptions or courses
  - Parents cannot modify unrelated users or roles
- **Code verification**: TypeScript typecheck passes; RLS policies created
- **Local migration verification**: PASS — migration file `20260815140000_add_rls_parent_role_policies.sql` exists
- **Production database verification**: **BLOCKED** — cannot confirm live RLS policy enforcement against actual Supabase project
- **Live authorization tests**: **BLOCKED** — cannot run actual authorization tests (parent→own permitted data SUCCESS, parent→unrelated data DENIED, parent→admin operations DENIED) without production Supabase access
- **Final status**: **REMEDIATED — PRODUCTION UNVERIFIED**

### Category 2 Summary
- **Gaps**: 5 (GAP-001 through GAP-005)
- **Code remediations**: 6 migration files created
- **TypeScript verification**: PASS (no errors)
- **Local migration files**: 6/6 present in `supabase/migrations/`
- **Production database verification**: **BLOCKED** — actual runtime verification against deployed AskATutorLive system is unavailable
- **Live authorization tests**: **BLOCKED** — cannot test as different user roles without production Supabase access
- **`.env` project identity**: Consistent within repository (`bzjlhxmiwdkteqkzqasi`) but **NOT independently verified** against the deployed AskATutorLive production system
- **Network access**: Endpoint `https://bzjlhxmiwdkteqkzqasi.supabase.co` unreachable from this environment
- **Overall status**: **🔴 RED — PRODUCTION VERIFICATION BLOCKED**

### Migration Files
| Gap | Migration File | Size | Local Status | Production Status |
|-----|---------------|------|--------------|-------------------|
| GAP-001 | `20260813090000_add_rls_profiles_user_roles_policies.sql` | 2,609 bytes | **PRESENT** | **UNVERIFIED** |
| GAP-002 | `20260814090000_add_rls_admin_operations_policies.sql` | 5,925 bytes | **PRESENT** | **UNVERIFIED** |
| GAP-003 | `20260814140000_add_rls_entitlement_gates_beyond_book_session.sql` | 7,895 bytes | **PRESENT** | **UNVERIFIED** |
| GAP-004 | `20260815090000_add_rls_tutor_app_promotion_validation.sql` | 5,959 bytes | **PRESENT** | **UNVERIFIED** |
| GAP-005 | `20260815140000_add_rls_parent_role_policies.sql` | 5,787 bytes | **PRESENT** | **UNVERIFIED** |

### Production Target
- **Supabase Project**: `bzjlhxmiwdkteqkzqasi` (from AskATutorLive `.env`)
- **URL**: `https://bzjlhxmiwdkteqkzqasi.supabase.co`
- **Configuration**: `.env` file with SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY
- **Status**: **Project identity consistent within AskATutorLive repository but NOT independently verified against live Supabase project runtime**
- **Frontend**: Local development at `C:\Users\User\Documents\Projects\askatutor`

### Verification Method
- **TypeScript/typecheck**: `npx tsc --noEmit` — **PASS** (no errors)
- **Production build**: Vite build — **compiles successfully**
- **Migration files**: **6/6** present in `supabase/migrations/` (local)
- **Live runtime verification**: **BLOCKED** — actual runtime verification against deployed system not achievable in current environment
- **RLS policy inspection**: **BLOCKED** — cannot inspect actual production database policies
- **RPC function verification**: **BLOCKED** — cannot inspect actual RPC definitions or test authorization boundaries
- **Live authorization tests**: **BLOCKED** — cannot run positive/negative authorization tests as different user roles
- **Network connectivity**: Endpoint `https://bzjlhxmiwdkteqkzqasi.supabase.co` unreachable from this network environment

### Notes
- All original GAP REGISTER findings preserved
- No historical evidence deleted or overwritten
- Remediations follow existing migration conventions
- Security boundaries preserved (service role used only for admin operations, not user authorization)
- Client-side role checks treated as UX controls, never as security boundary
- RLS policies enforced server-side via Supabase
- **Code remediations are complete and verified locally, but production security model is unproven**
- **Status changed from YELLOW to RED due to production verification blocker**
- **Architectural note**: ZERO and AskATutorLive are separate projects; ZERO credentials must NOT be used for AskATutorLive verification