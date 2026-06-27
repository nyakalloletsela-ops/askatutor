/**
 * AI Provider Adapter (server-only)
 * ---------------------------------
 * Single seam between the app and whichever AI gateway/SDK is in use.
 *
 * TODAY:  Routes every call to the Lovable AI Gateway
 *         (https://ai.gateway.lovable.dev/v1, OpenAI-compatible).
 * LATER:  Set AI_PROVIDER=gemini and GEMINI_API_KEY to swap to Google
 *         Gemini directly (via @google/generative-ai). No call-site code
 *         changes — only this file changes.
 *
 * RULE: All app server code (sim-lab, sim-chat, ai-tutor, ai-tools,
 *       whiteboard, agents/registry, etc.) MUST call `aiChat()` /
 *       `aiEmbed()` here instead of `fetch("https://ai.gateway...")`.
 *
 * See MIGRATION.md for the off-platform swap recipe.
 */

export type AiContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string | AiContentPart[];
}

export interface AiChatOptions {
  model: string;
  messages: AiMessage[];
  temperature?: number;
  response_format?: { type: "json_object" };
  /** Extra OpenAI-compatible fields (tools, tool_choice, max_tokens, etc.). */
  extra?: Record<string, unknown>;
}

export interface AiChatResult {
  text: string;
  /** Raw OpenAI-compatible response body — use when you need choices/tool_calls. */
  raw: any;
}

export interface AiEmbedOptions {
  /** OpenAI-compatible id, e.g. "openai/text-embedding-3-small". */
  model: string;
  input: string | string[];
}

export class AiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

function provider(): "lovable" | "gemini" {
  return (process.env.AI_PROVIDER ?? "lovable").toLowerCase() === "gemini"
    ? "gemini"
    : "lovable";
}

// ---------------------------------------------------------------------------
// Lovable AI Gateway (default, OpenAI-compatible)
// ---------------------------------------------------------------------------

async function lovableChat(opts: AiChatOptions): Promise<AiChatResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new AiError("AI is not configured");

  const body: Record<string, unknown> = {
    model: opts.model,
    messages: opts.messages,
    ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
    ...(opts.response_format ? { response_format: opts.response_format } : {}),
    ...(opts.extra ?? {}),
  };

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Lovable-API-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) throw new AiError("Too many requests — slow down.", 429);
    if (res.status === 402) throw new AiError("AI credits exhausted.", 402);
    throw new AiError(`AI service error (${res.status}): ${detail.slice(0, 200)}`, res.status);
  }

  const raw = await res.json();
  const text =
    (raw as { choices?: { message?: { content?: string } }[] })
      .choices?.[0]?.message?.content?.trim() ?? "";
  return { text, raw };
}

async function lovableEmbed(opts: AiEmbedOptions): Promise<{ embedding: number[] }> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new AiError("AI is not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: { "Lovable-API-Key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ model: opts.model, input: opts.input }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new AiError("Too many requests — slow down.", 429);
    if (res.status === 402) throw new AiError("AI credits exhausted.", 402);
    throw new AiError(`AI embed error (${res.status})`, res.status);
  }
  const json = (await res.json()) as { data?: { embedding: number[] }[] };
  const embedding = json.data?.[0]?.embedding;
  if (!embedding) throw new AiError("No embedding returned");
  return { embedding };
}

// ---------------------------------------------------------------------------
// Gemini direct (activated on migration; STUB today)
// ---------------------------------------------------------------------------
//
// MIGRATION STEPS (do this OFF Lovable, in your Vercel/self-hosted repo):
//   1. `bun add @google/generative-ai`
//   2. Set env vars: AI_PROVIDER=gemini, GEMINI_API_KEY=...
//   3. Replace the two `geminiX` stubs below with real implementations.
//      The shape is intentionally already aligned with Gemini's SDK:
//        - chat:  GoogleGenerativeAI -> getGenerativeModel({ model })
//                 -> generateContent({ contents, generationConfig })
//        - embed: getGenerativeModel({ model: "text-embedding-004" })
//                 -> embedContent({ content })
//   4. Map our model ids -> Gemini ids in `mapModelToGemini()`.
//
// Nothing else in the codebase needs to change.

function mapModelToGemini(model: string): string {
  // App passes ids like "google/gemini-3-flash-preview", "google/gemini-2.5-flash",
  // "google/gemini-2.5-pro", "openai/text-embedding-3-small".
  if (model.startsWith("google/")) return model.slice("google/".length);
  // Fallback to a sensible default the free tier supports.
  return "gemini-2.5-flash";
}

async function geminiChat(_opts: AiChatOptions): Promise<AiChatResult> {
  // TODO on migration: import { GoogleGenerativeAI } from "@google/generative-ai"
  // and translate AiChatOptions -> generateContent input.
  void mapModelToGemini;
  throw new AiError(
    "Gemini provider not wired in this environment. See MIGRATION.md.",
  );
}

async function geminiEmbed(_opts: AiEmbedOptions): Promise<{ embedding: number[] }> {
  throw new AiError(
    "Gemini provider not wired in this environment. See MIGRATION.md.",
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function aiChat(opts: AiChatOptions): Promise<AiChatResult> {
  return provider() === "gemini" ? geminiChat(opts) : lovableChat(opts);
}

export async function aiEmbed(opts: AiEmbedOptions): Promise<{ embedding: number[] }> {
  return provider() === "gemini" ? geminiEmbed(opts) : lovableEmbed(opts);
}
