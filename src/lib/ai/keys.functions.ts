import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ProviderSchema = z.enum(["groq", "gemini", "ollama"]);

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Forbidden");
}

export const saveAiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        provider: ProviderSchema,
        api_key: z.string().max(500).optional().nullable(),
        base_url: z.string().max(500).optional().nullable(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("ai_provider_keys").upsert(
      {
        provider: data.provider,
        api_key: data.api_key ?? null,
        base_url: data.base_url ?? null,
        updated_by: context.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider" },
    );
    if (error) throw new Error(error.message);
    const { clearAiProviderCache } = await import("./provider.server");
    clearAiProviderCache();
    return { ok: true };
  });

export const getAiKeyStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("ai_provider_keys")
      .select("provider, api_key, base_url, updated_at");
    const rows = (data ?? []) as { provider: string; api_key: string | null; base_url: string | null; updated_at: string }[];
    const byProvider = Object.fromEntries(rows.map((r) => [r.provider, r]));
    const env = {
      groq: !!process.env.GROQ_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      ollama: !!process.env.OLLAMA_BASE_URL,
    };
    return {
      groq: {
        hasKey: !!byProvider.groq?.api_key || env.groq,
        fromEnv: !byProvider.groq?.api_key && env.groq,
        updated_at: byProvider.groq?.updated_at ?? null,
        base_url: byProvider.groq?.base_url ?? null,
      },
      gemini: {
        hasKey: !!byProvider.gemini?.api_key || env.gemini,
        fromEnv: !byProvider.gemini?.api_key && env.gemini,
        updated_at: byProvider.gemini?.updated_at ?? null,
        base_url: byProvider.gemini?.base_url ?? null,
      },
      ollama: {
        hasKey: !!byProvider.ollama?.base_url || env.ollama,
        fromEnv: !byProvider.ollama?.base_url && env.ollama,
        updated_at: byProvider.ollama?.updated_at ?? null,
        base_url: byProvider.ollama?.base_url ?? (env.ollama ? process.env.OLLAMA_BASE_URL! : null),
      },
    };
  });

export const testAiProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ provider: ProviderSchema }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { getProviderCreds } = await import("./provider.server");
    const creds = await getProviderCreds(data.provider);
    try {
      if (data.provider === "groq") {
        if (!creds.api_key) return { ok: false, error: "No Groq API key configured" };
        const r = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { Authorization: `Bearer ${creds.api_key}` },
        });
        if (!r.ok) return { ok: false, error: `Groq: ${r.status} ${await r.text().catch(() => "")}`.slice(0, 200) };
        return { ok: true, message: "Groq reachable" };
      }
      if (data.provider === "gemini") {
        if (!creds.api_key) return { ok: false, error: "No Gemini API key configured" };
        const r = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/models", {
          headers: { Authorization: `Bearer ${creds.api_key}` },
        });
        if (!r.ok) return { ok: false, error: `Gemini: ${r.status} ${await r.text().catch(() => "")}`.slice(0, 200) };
        return { ok: true, message: "Gemini reachable" };
      }
      // ollama
      const base = (creds.base_url ?? "").replace(/\/+$/, "");
      if (!base) return { ok: false, error: "No Ollama base URL configured" };
      const r = await fetch(`${base}/api/tags`);
      if (!r.ok) return { ok: false, error: `Ollama: ${r.status}` };
      return { ok: true, message: "Ollama reachable" };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Network error" };
    }
  });
