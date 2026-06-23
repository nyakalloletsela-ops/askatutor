## New subscription & payment model

**Students** subscribe to unlock platform features. They then pay tutors directly by entering a Tutor ID, in bulk for one or many lessons, calculated from the tutor's hourly rate. The platform takes a 5% commission from that payment — that 5% IS the tutor's "subscription" (no separate tutor plan, no fixed fee).

### Student subscription tiers (seeded)
| Plan | Unlocks |
|---|---|
| AI Tutor | AI tutor chat + AI tools |
| Find Tutors | Browse tutor directory, view profiles, book sessions |
| Labs | Interactive labs (`/labs`) |
| All Access | All of the above (bundle) |

A student can hold one or more plans. Gating reads `student_subscriptions` (status = approved/active, not expired) joined to `subscription_plans.feature_scope`.

### Tutor side (no fixed subscription)
- Remove the tutor plans group from admin & remove the tutor plan picker on the dashboard.
- All tutor features (whiteboard, AI tools, classroom, course uploads) stay free to use; the platform earns via the 5% commission already wired through `compute_commission_cents` — set the global commission rule to 5%.
- Tutors still need approval/role to receive bookings (existing flow).

### Bulk lesson payment via Tutor ID
New student-side flow at `/pay-tutor`:
1. Student enters a Tutor ID (UUID) or picks from past tutors.
2. App fetches tutor name + hourly rate via a public RPC.
3. Student picks number of lessons + lesson length (30/45/60/90 min) → total auto-calculated (`hourly_rate × hours × lessons`).
4. Submit creates a single `payment_intents` row (gross, 5% commission, tutor net) via existing payment flow (PayPal / manual). On success, credits N "prepaid lesson units" to the student⇄tutor pair so the student can book that many lessons without re-paying.

### Feature gates (frontend + serverFn)
| Route / action | Required scope |
|---|---|
| `/ai-tutor`, `/ai-tools` | `ai` |
| `/tutors`, `/tutor/$id`, `/book/$tutorId` | `find_tutors` |
| `/labs` | `labs` |
| `/pay-tutor` | `find_tutors` (must be subscribed to pay a tutor) |

If a signed-in student lacks the scope, render an inline "Subscribe to unlock" card linking to `/settings` (Plans tab) — no hard redirect.

### Schema changes (one migration)
- `subscription_plans.feature_scope text[]` — e.g. `{ai,find_tutors,labs}`.
- New table `prepaid_lessons (id, student_id, tutor_id, lessons_remaining, lesson_minutes, hourly_rate_cents, payment_intent_id, created_at)` with RLS: student & tutor can read their rows; only the payment flow inserts.
- RPC `get_tutor_pricing(_tutor uuid)` returning `(full_name, hourly_rate, currency)` — `SECURITY DEFINER`, callable by any authenticated user with an active `find_tutors` scope.
- RPC `student_has_scope(_scope text)` for gates.
- Seed: the four student plans above; deactivate existing tutor plans; ensure a global 5% commission rule.

### Files
- Migration (new tables / RPCs / seed).
- `src/lib/entitlements.functions.ts` (new) — `getMyScopes()`, `requireScope(scope)`.
- `src/hooks/use-entitlements.ts` (new) — wraps `getMyScopes` with React Query.
- `src/components/ScopeGate.tsx` (new) — renders children or the upsell card.
- `src/routes/_authenticated/pay-tutor.tsx` (new) — bulk pay form.
- `src/routes/_authenticated/admin.plans.tsx` — add `feature_scope` multi-select, hide tutor group.
- `src/routes/_authenticated/dashboard.tsx` — remove tutor plan UI; for students show held scopes + missing-plan CTAs.
- Wrap `/ai-tutor`, `/ai-tools`, `/labs`, `/tutors`, `/tutor.$id`, `/book.$tutorId` content in `<ScopeGate>`.
- Update `Navbar` / `HomeSections` copy to drop "no subscriptions required".

### Out of scope
- Refactoring `tutor_subscriptions` table (left in place, just unused by new flow).
- Stripe/Paddle integration (continues to ride existing PayPal/manual rails).
- Promo codes for the new plans (existing `promotions` table already covers it).