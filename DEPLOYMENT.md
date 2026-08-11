# Deploying AskATutorLive

AskATutorLive is a self-contained TanStack Start (React 19 + Vite 7) app backed
by Supabase. It has no hosting-vendor runtime dependency: pick a target, set
environment variables, build, deploy.

---

## 1. Install

```bash
bun install          # or: npm install
cp .env.example .env # then fill in the values
```

## 2. Required environment variables

| Variable | Needed for |
| --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` | browser Supabase client |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | server functions, webhooks, email |
| `PUBLIC_BASE_URL`, `VITE_PUBLIC_BASE_URL` | absolute links in emails, PayPal returns |
| `AI_PROVIDER` + `GEMINI_API_KEY` / `GROQ_API_KEY` / `OLLAMA_BASE_URL` | AI tutor, tools, simulation lab, whiteboard OCR |
| `EMAIL_PROVIDER=resend` + `RESEND_API_KEY`, `EMAIL_FROM_DOMAIN` | booking / help / welcome emails |

Full list with comments: `.env.example`.

AI keys can alternatively be stored per provider in the `ai_provider_keys`
table through **Admin → AI**; database values take precedence over env vars.

## 3. Build

The server bundle target is selected by `NITRO_PRESET`:

```bash
NITRO_PRESET=node-server      bun run build   # VPS / Docker / Render / Fly
NITRO_PRESET=vercel           bun run build   # Vercel
bun run build                                 # default: cloudflare-module
```

## 4. Run / deploy

### Node or Docker

```bash
NITRO_PRESET=node-server bun run build
PORT=3000 bun run start          # scripts/start-node.mjs boots dist/server/index.mjs
```

Minimal Dockerfile:

```dockerfile
FROM oven/bun:1 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile && NITRO_PRESET=node-server bun run build

FROM oven/bun:1
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/scripts ./scripts
ENV PORT=3000
EXPOSE 3000
CMD ["bun", "run", "scripts/start-node.mjs"]
```

### Vercel

```bash
NITRO_PRESET=vercel bun run build && vercel deploy --prebuilt
```

Or set the build command to `NITRO_PRESET=vercel bun run build` in the Vercel
project settings and let it build on push. Add every env var above (the
`VITE_*` ones must exist at build time).

### Cloudflare Workers (your own account)

`wrangler.jsonc` is already configured (`main: src/server.ts`,
`nodejs_compat`). Rename `name` if you like, then:

```bash
bun run build && bunx wrangler deploy
```

## 5. Post-deploy checklist

- **Supabase Auth → URL configuration**: set Site URL and add
  `https://your-domain.com/**` plus `/dashboard` to the redirect allow-list, or
  Google sign-in will bounce.
- **Google provider**: enable it in Supabase Auth with your own OAuth client.
- **PayPal webhook**: point it at
  `https://your-domain.com/api/public/webhooks/paypal`.
- **Resend**: verify `EMAIL_FROM_DOMAIN` in Resend before real sends.
- Migrations in `supabase/migrations/` apply with the Supabase CLI
  (`supabase db push`) if you ever recreate the project.

## 6. Architecture notes

| Concern | File |
| --- | --- |
| Request handler (host-neutral) | `src/lib/server/platform.ts` |
| Worker/edge entry | `src/server.ts` |
| Node entry | `scripts/start-node.mjs` |
| AI provider adapter | `src/lib/ai/provider.server.ts` |
| Email provider adapter | `src/lib/email/provider.server.ts` (+ `enqueue.server.ts`) |
| Email templates | `src/lib/email-templates/` |

Adding another AI or email provider means one new branch in the matching
adapter — no other code changes.
