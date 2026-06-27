# AskATutorLive — Off-Platform Migration Guide

This codebase runs on Lovable today, but every Lovable-specific dependency
is isolated behind a small set of adapters. Migrating to your own
Vercel + Supabase + Gemini stack is **a one-file swap per concern**,
not a rewrite.

This guide is the playbook. Follow it in your own GitHub repo — **do not
run these steps inside the Lovable editor or the live preview will
break.**

---

## TL;DR migration day (~30 min)

1. **Export the repo** from Lovable to your GitHub account.
2. `bun add @google/generative-ai resend @react-email/render`
3. Set Vercel env vars (see `.env.example`).
4. Edit **three files**:
   - `src/lib/ai/provider.server.ts`  → fill in `geminiChat` / `geminiEmbed`
   - `src/lib/email/provider.server.ts` → fill in `sendViaResend`
   - Replace `src/server.ts` with the Vercel entry (snippet below)
5. Delete: `wrangler.jsonc`, `src/routes/lovable/`, `src/integrations/lovable/`
6. `vercel deploy` — done.

That's it. **No app/component/route code changes.**

---

## What stays the same

| Concern | Status |
| --- | --- |
| Supabase (DB, auth, storage, RLS, migrations, RPCs) | ✅ Keep as-is. Works identically off-Lovable. |
| TanStack Start, React 19, Vite, Tailwind v4, shadcn | ✅ Standard OSS. No changes. |
| All routes under `src/routes/_authenticated/` etc. | ✅ Untouched. |
| All components, hooks, libs | ✅ Untouched. |
| Email templates in `src/lib/email-templates/` | ✅ Untouched — both providers render the same React Email components. |
| AI prompts, models, system messages | ✅ Untouched. The adapter speaks the same OpenAI-compatible shape. |

## What changes (the entire migration surface)

```
src/lib/ai/provider.server.ts      ← swap implementation (1 file)
src/lib/email/provider.server.ts   ← swap implementation (1 file)
src/server.ts                      ← swap to host-native entry (1 file)
.env                               ← new vars (AI_PROVIDER, GEMINI_API_KEY, EMAIL_PROVIDER, RESEND_API_KEY)
package.json                       ← drop @lovable.dev/*, add @google/generative-ai + resend
wrangler.jsonc                     ← delete
src/routes/lovable/                ← delete (Lovable Emails queue routes)
src/integrations/lovable/          ← delete (Lovable OAuth shim)
```

That's the whole list.

---

## Step 1 — Repo prep (do BEFORE leaving Lovable)

Already done in this codebase:

- ✅ `src/lib/ai/provider.server.ts` — every AI call routes through `aiChat()` / `aiEmbed()`. Today: Lovable Gateway. Switch with `AI_PROVIDER=gemini`.
- ✅ `src/lib/email/provider.server.ts` — every transactional email routes through `sendTransactionalEmail()`. Today: Lovable Emails queue. Switch with `EMAIL_PROVIDER=resend`.
- ✅ `src/lib/server/platform.ts` — host-neutral `handleRequest(request)`. `src/server.ts` is a 10-line Cloudflare shim around it. Vercel/Node entries are equally thin.
- ✅ `.env.example` — documents every env var the app reads.

**Do not touch these files inside Lovable** unless you're fixing the adapter itself. Removing Lovable env vars or routes here will brick the live app.

---

## Step 2 — Export

In Lovable: Project → Settings → GitHub → "Transfer to GitHub" (or connect a repo). Clone locally.

---

## Step 3 — Install replacement packages

```bash
bun remove @lovable.dev/vite-tanstack-config @lovable.dev/email-js \
           @lovable.dev/webhooks-js @lovable.dev/cloud-auth-js \
           wrangler @cloudflare/workers-types
bun add @google/generative-ai resend
# Use plain @vitejs/plugin-react instead of the Lovable preset:
bun add -D @vitejs/plugin-react @tanstack/router-plugin @tailwindcss/vite
```

Then replace `@lovable.dev/vite-tanstack-config` in `vite.config.ts` with the standard TanStack Start preset (the Lovable preset only bundles the same plugins).

---

## Step 4 — Wire Gemini

Edit `src/lib/ai/provider.server.ts`. Replace the two `geminiChat` / `geminiEmbed` stubs:

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";

async function geminiChat(opts: AiChatOptions): Promise<AiChatResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError("GEMINI_API_KEY missing");
  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({ model: mapModelToGemini(opts.model) });

  // Translate OpenAI-style messages -> Gemini contents
  const system = opts.messages.find((m) => m.role === "system");
  const contents = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: typeof m.content === "string"
        ? [{ text: m.content }]
        : m.content.map((p) =>
            p.type === "text"
              ? { text: p.text }
              : { inlineData: parseDataUrl(p.image_url.url) },
          ),
    }));

  const result = await model.generateContent({
    contents,
    systemInstruction: system?.content as string | undefined,
    generationConfig: {
      temperature: opts.temperature,
      ...(opts.response_format?.type === "json_object"
        ? { responseMimeType: "application/json" }
        : {}),
    },
  });
  const text = result.response.text();
  return { text, raw: result.response };
}

async function geminiEmbed(opts: AiEmbedOptions): Promise<{ embedding: number[] }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError("GEMINI_API_KEY missing");
  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({ model: "text-embedding-004" });
  const input = Array.isArray(opts.input) ? opts.input[0] : opts.input;
  const r = await model.embedContent(input);
  return { embedding: r.embedding.values };
}

function parseDataUrl(url: string) {
  const m = /^data:([^;]+);base64,(.+)$/.exec(url);
  if (!m) throw new AiError("Invalid image data URL");
  return { mimeType: m[1], data: m[2] };
}
```

> ⚠️ **Embedding dimension change.** Lovable used OpenAI `text-embedding-3-small` (1536d). Gemini `text-embedding-004` is 768d. If you keep the existing `simulations.embedding` pgvector column at 1536d, you must either (a) zero-pad, (b) re-create the column as `vector(768)` and re-embed, or (c) keep a separate OpenAI key just for embeddings. The sim-lab semantic search will not work correctly until you decide.

Set `AI_PROVIDER=gemini` and `GEMINI_API_KEY=...` in Vercel env.

---

## Step 5 — Wire Resend

Edit `src/lib/email/provider.server.ts`. Replace the `sendViaResend` stub with the snippet already in the TODO comment.

Set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY=...`, `RESEND_FROM="Ask A Tutor <notify@yourdomain.com>"`.

Then delete:
- `src/routes/lovable/email/` (queue, suppression, preview)
- `supabase/migrations/*email_send*` cron jobs (or leave them disabled)

---

## Step 6 — Vercel server entry

Replace `src/server.ts` with `src/app/[[...all]]/route.ts`:

```ts
import { handleRequest } from "@/lib/server/platform";
export const runtime = "edge";
export const GET    = (req: Request) => handleRequest(req);
export const POST   = (req: Request) => handleRequest(req);
export const PUT    = (req: Request) => handleRequest(req);
export const DELETE = (req: Request) => handleRequest(req);
export const PATCH  = (req: Request) => handleRequest(req);
export const OPTIONS = (req: Request) => handleRequest(req);
```

Delete `wrangler.jsonc`. Add `vercel.json` if you want region/runtime overrides.

---

## Step 7 — Auth shim

`src/integrations/lovable/index.ts` is a thin OAuth wrapper around Supabase that Lovable's preview uses. Off-platform, call Supabase auth directly:

```ts
// before:
await lovable.auth.signInWithOAuth("google", { redirect_uri: ... });
// after:
await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: ... } });
```

Grep for `from "@/integrations/lovable"` — there are ~1-2 call sites.

---

## Step 8 — Smoke test

```bash
bun run dev
# Hit: /, /auth, /dashboard, /labs/simulation-lab (run a prompt), /classroom/$id, send a booking email
```

If something breaks, **it's almost always an env var**. Check Vercel logs for `AI is not configured` / `EMAIL_PROVIDER=resend but adapter not wired`.

---

## Adapter contract reference

### `aiChat(opts)`
```ts
{
  model: string,            // "google/gemini-2.5-flash" etc. — mapped to provider's id
  messages: AiMessage[],    // OpenAI-style with multimodal content parts
  temperature?: number,
  response_format?: { type: "json_object" },
  extra?: Record<string, unknown>,   // passed through for OpenAI-compat fields
}
=> { text: string, raw: any }
```

### `aiEmbed(opts)`
```ts
{ model: string, input: string | string[] }
=> { embedding: number[] }
```

### `sendTransactionalEmail(payload)`
```ts
{
  templateName: string,             // matches file in src/lib/email-templates/
  recipientEmail: string,
  idempotencyKey: string,
  templateData: Record<string, unknown>,
}
=> void
```

Adding a third provider (Anthropic, Ollama, AWS SES) means adding one branch in the adapter — no other code changes.
