import type {
  AiKeyRepository,
  AiKeyRow,
  AiKeyUpsertInput,
  EnvKeyPresence,
} from "@/domain/ports/ai-key-repository";

/**
 * Supabase-backed AiKeyRepository. Provider credentials live in
 * `ai_provider_keys` (service-role client); environment fallback presence is
 * read here (Infrastructure) rather than in the Application layer.
 */
export class SupabaseAiKeyRepository implements AiKeyRepository {
  async upsert(input: AiKeyUpsertInput): Promise<void> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("ai_provider_keys")
      .upsert(
        {
          provider: input.provider,
          api_key: input.apiKey,
          base_url: input.baseUrl,
          updated_by: input.updatedBy,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider" },
      );
    if (error) throw new Error(error.message);
  }

  async list(): Promise<AiKeyRow[]> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("ai_provider_keys")
      .select("provider, api_key, base_url, updated_at");
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as AiKeyRow[];
  }

  envKeyPresence(): Promise<EnvKeyPresence> {
    return Promise.resolve({
      groq: process.env.GROQ_API_KEY ?? null,
      gemini: process.env.GEMINI_API_KEY ?? null,
      ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? null,
    });
  }
}