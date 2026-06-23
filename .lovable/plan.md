# AskATutorLive — End-to-End Redesign Plan

Big scope. I'll break it into shippable phases so each one is testable on its own. We've already done Dashboard Phases 1–4 (shell, student home, tutor home, admin home + audit log + bulk actions + expanded application). This plan covers what you just listed.

---

## Phase A — Homepage (Priority 1)

Goal: visitor understands the platform in 5s, books in <10s.

Sections (in order):
1. Hero — value prop headline, subhead, primary CTA "Find a Tutor", secondary "Become a Tutor", trust strip (students taught, tutors, avg rating, countries).
2. Quick search bar — subject + level + language, jumps straight to discovery.
3. Subject categories — icon grid (Math, Sciences, Languages, Coding, Test Prep, Music, Business…).
4. Featured tutors carousel — pulls from `list_public_tutors()` where `is_featured=true`, shows photo/rating/price/Instant Join.
5. How it works — 3 steps (Search → Book → Join).
6. Why AskATutorLive — interactive classroom, AI tools, pay-as-you-go, Africa-first payments.
7. Success stories — testimonials (seeded copy + photos).
8. Pricing snapshot — free trial minutes, hourly range, subscription teaser.
9. FAQ accordion (10 Qs).
10. Final CTA — "Start learning in under 10 seconds".
11. Footer with trust badges.

Files: `src/routes/index.tsx` rebuilt; new components in `src/components/home/*`.

---

## Phase B — Tutor Discovery (Priority 2)

- New `/tutors` route with filter sidebar: subject, language, price range, rating, availability now, country.
- Tutor card: photo, name, ⭐ rating + review count, subjects (chips), languages, years experience, hourly price, "Available now" green badge (derived from availability + no current session), "Instant Join" (creates demo room or books next slot).
- Sort: relevance, price asc/desc, rating, most booked.
- Pagination / infinite scroll.
- Data source: `list_public_tutors()` extended (add languages, experience_years, available_now). Add RPC `list_tutors_filtered(...)`.

---

## Phase C — Tutor Profile (Priority 3)

`/tutors/$tutorId`:
- Hero: avatar, name, headline, rating, response time, "Book Trial" + "Book Now".
- Tabs/sections: About (bio), Intro video, Qualifications & Certifications, Subjects & Levels, Reviews (paginated), Availability calendar (week view with bookable slots), Pricing & Packages.
- Sticky booking card on desktop.

---

## Phase D — Booking System (Priority 4)

Single-page wizard, 3 steps max:
1. Pick slot (calendar with `get_tutor_availability_public` + `get_tutor_busy_slots`).
2. Pay (Phase F providers).
3. Confirm + Join link.

No account? Allow guest start, account creation collapses into payment step (email + password inline).

---

## Phase E — Classroom Experience (Priority 5)

Upgrades to `/classroom/$roomId`:
- Floating video PiP: draggable, resizable (corner handle), minimize to thumbnail.
- Whiteboard full-screen toggle (already exists? confirm).
- Mobile layout: bottom toolbar, swipeable panels (Video / Whiteboard / Chat / Notes).
- AI panel: Notes (summary), Translator (target language), Solver (problem → step-by-step). Hooks to Lovable AI Gateway.
- Tools dock: screen share, file share, raise hand, reactions.

---

## Phase F — Payments (Priority 6)

- Stripe seamless for cards (recommended path).
- Africa methods via Paystack or Flutterwave connector for M-Pesa, EcoCash, Airtel, Orange, Bank Transfer. (Requires a connector; will request keys when we get to this phase.)
- Wallet model: top up minutes, sessions debit wallet. Schema: `wallets`, `wallet_transactions`.

---

## Phase G — Notifications (Priority 7)

Channels: Email (Resend already), SMS + WhatsApp (Twilio or GatewayAPI connector), Push (web push).
Events: booking created/cancelled/rescheduled, 24h + 1h reminders, payment receipt, homework due, new message.
User preferences page to opt in/out per channel per event.

---

## Phase H — AI Features (Priority 8)

Powered by Lovable AI Gateway (google/gemini-2.5-flash default; pro for heavy tasks).
- Student: Explain, Quiz, Summarize, Translate.
- Tutor: Lesson plan, Assignment, Auto-grade, Test generator.
- Admin: Churn risk, struggling students, top tutors, weekly report.

---

## Phase I — Speed Obsession (Priority 9)

- Route prefetch on hover.
- Image: `loading="lazy"`, responsive sizes, WebP.
- `list_public_tutors` cached via React Query with `staleTime: 60s`.
- Skeletons everywhere, optimistic UI for booking.
- Bundle audit, code-split heavy routes (classroom, admin).
- Target: Homepage LCP < 1.5s, Find Tutor → Book Class < 10s.

---

## Suggested order (one phase per turn)

A → B → C → D → I (speed pass on the funnel) → E (classroom) → F (payments) → G (notifications) → H (AI).

---

## What I need from you

1. Confirm the order above, or reshuffle.
2. **Phase A first?** I'll start with the Homepage rebuild — that's the highest-leverage single change and unblocks the discovery funnel.
3. For Africa payments (Phase F): do you already have Paystack or Flutterwave accounts? They cover M-Pesa/EcoCash/Airtel/Orange/Bank Transfer in one integration.
4. For SMS/WhatsApp (Phase G): Twilio or another provider?

Approve and I'll start Phase A.
