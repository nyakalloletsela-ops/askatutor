import type {
  AiGateway,
  AiChatOptions,
  AiChatResult,
  AiEmbedOptions,
  AiEmbedResult,
  AiProviderTestResult,
} from "@/application/contracts/ai";

/**
 * AiGateway adapter — bridges the AiGateway contract to the existing
 * provider.server.ts infrastructure.
 *
 * All provider selection, model mapping, credential resolution, and
 * transport logic lives in @/lib/ai/provider.server. This adapter
 * delegates to it, satisfying the contract boundary.
 */
export function createAiGateway(): AiGateway {
  return {
    async chat(opts: AiChatOptions): Promise<AiChatResult> {
      const { aiChat } = await import("@/lib/ai/provider.server");
      return aiChat(opts);
    },

    async embed(opts: AiEmbedOptions): Promise<AiEmbedResult> {
      const { aiEmbed } = await import("@/lib/ai/provider.server");
      return aiEmbed(opts);
    },

    async testProvider(provider: "groq" | "gemini" | "ollama"): Promise<AiProviderTestResult> {
      const { getProviderCreds } = await import("@/lib/ai/provider.server");
      const creds = await getProviderCreds(provider);
      try {
        if (provider === "groq") {
          if (!creds.api_key) return { ok: false, error: "No Groq API key configured" };
          const r = await fetch("https://api.groq.com/openai/v1/models", {
            headers: { Authorization: `Bearer ${creds.api_key}` },
          });
          if (!r.ok) return { ok: false, error: `Groq: ${r.status} ${await r.text().catch(() => "")}`.slice(0, 200) };
          return { ok: true, message: "Groq reachable" };
        }
        if (provider === "gemini") {
          if (!creds.api_key) return { ok: false, error: "No Gemini API key configured" };
          const r = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/models", {
            headers: { Authorization: `Bearer ${creds.api_key}` },
          });
          if (!r.ok) return { ok: false, error: `Gemini: ${r.status} ${await r.text().catch(() => "")}`.slice(0, 200) };
          return { ok: true, message: "Gemini reachable" };
        }
        const base = (creds.base_url ?? "").replace(/\/+$/, "");
        if (!base) return { ok: false, error: "No Ollama base URL configured" };
        const r = await fetch(`${base}/api/tags`);
        if (!r.ok) return { ok: false, error: `Ollama: ${r.status}` };
        return { ok: true, message: "Ollama reachable" };
      } catch (e: any) {
        return { ok: false, error: e?.message ?? "Network error" };
      }
    },

    async clearCache(): Promise<void> {
      const { clearAiProviderCache } = await import("@/lib/ai/provider.server");
      clearAiProviderCache();
    },
  };
}
