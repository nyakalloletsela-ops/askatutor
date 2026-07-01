/**
 * AI Provider Adapter (server-only)
 * ---------------------------------
 * Single seam between the app and whichever AI gateway/SDK is in use.
 *
 * Provider resolution order (first non-empty wins):
 *   1. process.env.AI_PROVIDER  (deploy-time override, e.g. Vercel)
 *   2. platform_config.ai_provider  (admin global switch, DB-driven)
 *   3. "lovable"  (default while running on Lovable)
 *
 * Supported providers (all OpenAI-compatible endpoints):
 *   - lovable  -> Lovable AI Gateway         (LOVABLE_API_KEY)
 *   - groq     -> https://api.groq.com/openai (GROQ_API_KEY)
 *   - gemini   -> Google Generative Language (GEMINI_API_KEY)
 *   - ollama   -> self-hosted Ollama          (OLLAMA_BASE_URL, no key)
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
  raw: any;
}

export interface AiEmbedOptions {
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

type Provider = "lovable" | "groq" | "gemini" | "ollama";

// ---------------------------------------------------------------------------
// Provider selection (cached, DB-backed, env override)
// ---------------------------------------------------------------------------

let _cached: { value: Provider; expires: number } | null = null;
const CACHE_MS = 30_000;

async function resolveProvider(): Promise<Provider> {
  const envChoice = (process.env.AI_PROVIDER ?? "").toLowerCase();
  if (envChoice === "lovable" || envChoice === "groq" || envChoice === "gemini" || envChoice === "ollama") {
    return envChoice as Provider;
  }
  const now = Date.now();
  if (_cached && _cached.expires > now) return _cached.value;
  let value: Provider = "lovable";
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("platform_config")
      .select("ai_provider")
      .eq("id", 1)
      .maybeSingle();
    const v = ((data as { ai_provider?: string } | null)?.ai_provider ?? "lovable").toLowerCase();
    if (v === "groq" || v === "gemini" || v === "ollama" || v === "lovable") value = v;
  } catch {
    // fall through to lovable default
  }
  _cached = { value, expires: now + CACHE_MS };
  return value;
}

/** Invalidate the cached provider (call after admin updates the setting). */
export function clearAiProviderCache() {
  _cached = null;
}

// ---------------------------------------------------------------------------
// Model id mapping — app passes ids like "google/gemini-2.5-flash".
// Each provider gets a strip/rename step to a name it understands.
// ---------------------------------------------------------------------------

function stripVendor(model: string): string {
  const i = model.indexOf("/");
  return i >= 0 ? model.slice(i + 1) : model;
}

function mapModel(provider: Provider, model: string): string {
  const bare = stripVendor(model);
  switch (provider) {
    case "lovable":
      return model; // gateway wants the full "vendor/model" id
    case "gemini":
      // Google's OpenAI-compat endpoint expects e.g. "gemini-2.5-flash"
      return bare.startsWith("gemini-") ? bare : "gemini-2.5-flash";
    case "groq":
      // Groq only serves its own model catalog; map anything else to a sane default.
      if (bare.startsWith("llama") || bare.startsWith("mixtral") || bare.startsWith("gemma")) return bare;
      return "llama-3.3-70b-versatile";
    case "ollama":
      // e.g. "llama3.1", "qwen2.5", "phi3"; strip vendor prefix if any
      return bare;
  }
}

// ---------------------------------------------------------------------------
// OpenAI-compatible transport (shared by all four providers)
// ---------------------------------------------------------------------------

interface Endpoint {
  chat: string;
  embed: string;
  headers: Record<string, string>;
}

function endpointFor(provider: Provider): Endpoint {
  switch (provider) {
    case "lovable": {
      const key = process.env.LOVABLE_API_KEY;
      if (!key) throw new AiError("AI is not configured (LOVABLE_API_KEY missing)");
      return {
        chat: "https://ai.gateway.lovable.dev/v1/chat/completions",
        embed: "https://ai.gateway.lovable.dev/v1/embeddings",
        headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
      };
    }
    case "groq": {
      const key = process.env.GROQ_API_KEY;
      if (!key) throw new AiError("Groq is selected but GROQ_API_KEY is not set");
      return {
        chat: "https://api.groq.com/openai/v1/chat/completions",
        embed: "https://api.groq.com/openai/v1/embeddings",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      };
    }
    case "gemini": {
      const key = process.env.GEMINI_API_KEY;
      if (!key) throw new AiError("Gemini is selected but GEMINI_API_KEY is not set");
      return {
        chat: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        embed: "https://generativelanguage.googleapis.com/v1beta/openai/embeddings",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      };
    }
    case "ollama": {
      const base = (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(/\/+$/, "");
      return {
        chat: `${base}/v1/chat/completions`,
        embed: `${base}/v1/embeddings`,
        headers: { "Content-Type": "application/json" },
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function aiChat(opts: AiChatOptions): Promise<AiChatResult> {
  const provider = await resolveProvider();
  const ep = endpointFor(provider);

  const body: Record<string, unknown> = {
    model: mapModel(provider, opts.model),
    messages: opts.messages,
    ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
    ...(opts.response_format ? { response_format: opts.response_format } : {}),
    ...(opts.extra ?? {}),
  };

  const res = await fetch(ep.chat, {
    method: "POST",
    headers: ep.headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) throw new AiError("Too many requests — slow down.", 429);
    if (res.status === 402) throw new AiError("AI credits exhausted.", 402);
    if (res.status === 401 || res.status === 403)
      throw new AiError(`AI provider "${provider}" rejected the key. Check your API key in Admin → AI.`, res.status);
    throw new AiError(`AI service error (${res.status}): ${detail.slice(0, 200)}`, res.status);
  }

  const raw = await res.json();
  const text =
    (raw as { choices?: { message?: { content?: string } }[] })
      .choices?.[0]?.message?.content?.trim() ?? "";
  return { text, raw };
}

export async function aiEmbed(opts: AiEmbedOptions): Promise<{ embedding: number[] }> {
  const provider = await resolveProvider();
  const ep = endpointFor(provider);

  const res = await fetch(ep.embed, {
    method: "POST",
    headers: ep.headers,
    body: JSON.stringify({ model: mapModel(provider, opts.model), input: opts.input }),
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
