## Reality check

What you described is a multi-month roadmap (landing, 12 AI tools, virtual labs, coding IDE, parent accounts, payments, forums, leaderboards, certificates, admin analytics, mobile bottom-nav, dark mode, etc.). Built all at once it would be shallow everywhere. I'll ship it in phases — each phase is **production-quality** before we move to the next — and you approve as we go.

The current app already has: auth (email + Google), student/tutor/admin roles, profiles, sessions, classroom (Jitsi + whiteboard + Lordda lab), bookings, M-Pesa/EcoCash subscriptions, AI tutor chat, free welcome lessons, reviews. We **build on that**, not replace it.

---

## Phase 1 — Brand + Landing (this turn, if approved)

Rebrand to **"Ask A Tutor Live — Lesotho's Smartest AI Learning Platform"** and ship a cinematic landing page.

- New design tokens in `src/styles.css`: deep blue / purple / cyan palette, glow accents, glassmorphism utility classes, dark-mode-first.
- New landing sections (all on `/`):
  1. **Hero** — animated gradient + floating equations/particles, headline "Master your coursework with Live Tutors + AI", 3 CTAs (Find a Tutor / Start Free / Explore Labs).
  2. **Trust strip** — animated counters (students, tutors, lessons, pass-rate ↑).
  3. **Levels** — Primary · High school · IGCSE · A-Level · Foundation · Undergraduate cards.
  4. **Subjects grid** — 12 STEM subjects with tutor counts (live from DB).
  5. **Features** — Live Tutoring, AI Homework, Virtual Labs, Coding Playground, Exam Prep, Analytics (6 cards, gradient + motion).
  6. **AI tools showcase** — preview of the 12 AI tools (real ones shipped in Phase 3).
  7. **How it works** — 3 steps.
  8. **Tutors carousel** — pulls live from `list_public_tutors`.
  9. **Testimonials + Final CTA + Footer**.
- Light/dark toggle in navbar, Framer Motion entrance + scroll animations, mobile-first layout.
- Update navbar logo + tagline; SEO `<title>` + meta on every route.

---

## Phase 2 — Mobile shell + Dashboards polish

- Bottom tab navigation on mobile (Home · Tutors · AI · Sessions · Profile).
- Premium student dashboard: progress rings, study streak, upcoming lessons, AI recommendations, achievements.
- Tutor dashboard upgrade: earnings card, availability calendar, ratings widget, student list.
- Tutor profile pages (`/tutor/$id`) — qualifications, intro video field, full reviews list, response time, "Book Trial" CTA.

---

## Phase 3 — AI Toolkit expansion

Use the existing Lovable AI Gateway. Ship as `/ai-tutor` tabbed workspace:
- Homework Solver, Formula Explainer, Quiz Generator, Flashcards, Lesson Summarizer, Study Planner, Exam Predictor, Note Generator, Research Assistant, Coding Assistant, Assignment Helper.
- Persisted history per user (Supabase table `ai_conversations`).
- Suggested prompts, streaming responses, voice input (Web Speech API).

---

## Phase 4 — Virtual Labs + Coding Playground

- Expand existing Lordda Lab into discipline picker: Physics (projectile, circuits), Chemistry (titration, reactions), Biology (cell, dissection), Engineering (statics, signals). 2D canvas simulations with experiment scoring + lab reports.
- Coding playground at `/code`: Monaco editor, Python (Pyodide in-browser), JS (eval sandbox), C++/Java via Piston API. AI assistant side-panel.

---

## Phase 5 — Community & Growth

Forums, study groups, leaderboard, referral codes, downloadable certificates, parent accounts, Stripe (intl) alongside M-Pesa/EcoCash, admin analytics dashboard, email reminders.

---

## What I'd push back on

- **"Like Khan Academy + Coursera + Duolingo + Notion"** — those are billion-dollar products built by hundreds of people. We'll make *yours* genuinely premium and African-first, not a clone of all five.
- **Zoom/Google Meet integration** — you already have Jitsi (free, no API keys, embedded). Adding Zoom needs a paid Zoom dev account. Recommend skipping unless you specifically need it.
- **Photorealistic 3D virtual labs** — true digital-twin simulations need Unity/Three.js + asset budget. Phase 4 ships polished 2D interactive sims (proven model — PhET uses this). 3D can come later.
- **Parent accounts** — large surface (linking, permissions, billing). Keep for Phase 5.

---

## Approve to start Phase 1?

If yes, I ship the full landing + rebrand in this turn (large but cohesive change). Then you review, and we go to Phase 2.

If you'd rather skip ahead (e.g. "do Phase 1 + Phase 3 AI tools first"), tell me which phases and I'll resequence.
