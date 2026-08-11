# Make AskATutorLive fully self-hosted and Lovable-free

Goal: the exported repo installs, builds, and deploys on your own infrastructure with no Lovable package, service, route, key, or branding required. Supabase stays exactly as it is.

## What is currently tied to Lovable (verified by inspection)

| Area | Current state |
| --- | --- |
| Build config | `vite.config.ts` uses `@lovable.dev/vite-tanstack-config` (bundles tanstackStart, react, tailwind, tsconfig-paths, cloudflare, component tagger) |
| Packages | `@lovable.dev/vite-tanstack-config`, `@lovable.dev/cloud-auth-js`, `@lovable.dev/email-js`, `@lovable.dev/webhooks-js` |
| Auth | `src/integrations/lovable/index.ts` wraps Google sign-in through Lovable OAuth; used by `src/routes/auth.tsx` |
| Email | `src/lib/email/provider.server.ts` posts into the Lovable Emails queue; queue/suppression/preview routes live under `src/routes/lovable/email/*`; `src/start.ts` whitelists `/lovable/*` |
| AI | `src/lib/ai/provider.server.ts` defaults to the Lovable AI Gateway with `LOVABLE_API_KEY`; admin UI lists "Lovable AI (default)" |
| Hosting | `wrangler.jsonc` + `src/server.ts` target Cloudflare Workers |
| Misc | hardcoded `askatutor.lovable.app` URLs, `bunfig.toml` allow-list entry, Lovable wording in generated Supabase clients |

## Decisions I am making (you skipped the questions)

- **Hosting: host-neutral.** `src/lib/server/platform.ts` stays the canonical handler. I add a plain Node entry (`server.mjs`, `bun run start`) that works on any VPS/Docker/Render/Fly host, plus a Vercel entry file and keep a Cloudflare entry that now points at *your* wrangler config. Nothing Lovable-specific.
- **AI: Gemini by default, provider still switchable.** Official Google endpoint via `GEMINI_API_KEY`; Groq and Ollama remain selectable in Admin → AI. The `lovable` provider branch is deleted.
- **Email: Resend, fully wired** (not a stub) — renders the existing React Email templates and sends via `RESEND_API_KEY` / `RESEND_FROM`. Lovable queue routes removed.
- **Clean now, not dual-mode.** No Lovable fallbacks left behind.

## Work plan

### 1. Build config de-Lovable
Rewrite `vite.config.ts` with the standard plugins directly: `tanstackStart`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-tsconfig-paths`, plus the existing `three`-SSR stub and `entities` aliases (both are app-specific, kept verbatim). Remove `@lovable.dev/*` from `package.json` and the `bunfig.toml` allow-list entry.

### 2. Auth
Replace the two `lovable.auth.signInWithOAuth("google", …)` call sites in `src/routes/auth.tsx` with `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: … } })`; delete `src/integrations/lovable/`. Google OAuth continues to work through your Supabase project's provider config.

### 3. Email
- Implement `sendViaResend()` for real: import the template from `src/lib/email-templates/`, render with `@react-email/render`, send via Resend REST (no SDK dependency needed), pass the idempotency key as a tag.
- Default `EMAIL_PROVIDER` to `resend`; keep an `smtp`-ready seam but no Lovable branch.
- Delete `src/routes/lovable/` and drop the `/lovable/*` bypass from `src/start.ts` (the `/email/unsubscribe` public route stays).

### 4. AI
Remove the `lovable` provider from `src/lib/ai/provider.server.ts`, `src/hooks/use-platform-config.ts`, and `src/components/admin/AiProviderSelect.tsx`; default becomes `gemini`. Existing DB-stored keys in `ai_provider_keys` keep working. No migration needed beyond a default-value update for `platform_config.ai_provider` rows still set to `lovable` (mapped to `gemini` at read time so no data loss).

### 5. Hosting entries + env
- Keep `src/server.ts` (Worker/edge fetch handler) since it is host-neutral, add `server.mjs` Node entry and `src/entry.vercel.ts`.
- Replace `wrangler.jsonc`'s Lovable app name with `askatutorlive`.
- Every URL from env: `PUBLIC_BASE_URL` / `VITE_PUBLIC_BASE_URL` with no `*.lovable.app` fallback; update the PayPal webhook comment and email base URLs.
- Rewrite `.env.example` for the self-hosted set only; strip `LOVABLE_API_KEY`.

### 6. Branding & docs
Grep the whole tree for `lovable` and remove remaining copy (error page, comments in generated Supabase clients get neutral wording where editable). Rewrite `MIGRATION.md` as `DEPLOYMENT.md`: install → env vars → `bun run build` → run/deploy on Node, Docker, Vercel, or Cloudflare.

### 7. Verify
`bun install`, `bun run build`, then load the app and exercise sign-in, a booking email path, and one AI call to confirm nothing regressed.

## Things you must supply after export

- `GEMINI_API_KEY` (or a Groq key / Ollama URL) — otherwise AI features return "not configured".
- `RESEND_API_KEY` + verified sender domain — otherwise transactional email is skipped with a logged warning.
- `SUPABASE_SERVICE_ROLE_KEY` — Lovable does not expose it; copy it from your Supabase project settings into your host's env.
- Google OAuth redirect URLs in Supabase updated to your production domain.

## Known tradeoff

The Lovable preview may lose Google sign-in (it relied on the Lovable OAuth shim) and the in-editor component tagger goes away. Email/AI keep working in preview once the corresponding keys are set. Everything else — routes, classroom, whiteboard, simulation lab, payments — is untouched.
