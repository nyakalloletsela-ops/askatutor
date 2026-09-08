import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

const ProviderSchema = z.enum(["groq", "gemini", "ollama"]);

async function assertAdmin(context: { deps: { user: { isAdmin: (id: string) => Promise<boolean> } }; userId: string }) {
  const isAdmin = await context.deps.user.isAdmin(context.userId);
  if (!isAdmin) throw new Error("Forbidden");
}

export const saveAiKey = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
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
    await context.deps.aiKey.upsert({
      provider: data.provider,
      apiKey: data.api_key ?? null,
      baseUrl: data.base_url ?? null,
      updatedBy: context.userId,
    });
    await context.deps.aiGateway.clearCache();
    return { ok: true };
  });

export const getAiKeyStatus = createServerFn({ method: "GET" })
  .middleware([requireAppDependencies])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [rows, env] = await Promise.all([
      context.deps.aiKey.list(),
      context.deps.aiKey.envKeyPresence(),
    ]);
    const byProvider = Object.fromEntries(rows.map((r) => [r.provider, r]));

    const groq = byProvider.groq as { api_key: string | null; base_url: string | null; updated_at: string | null } | undefined;
    const gemini = byProvider.gemini as { api_key: string | null; base_url: string | null; updated_at: string | null } | undefined;
    const ollama = byProvider.ollama as { api_key: string | null; base_url: string | null; updated_at: string | null } | undefined;

    return {
      groq: {
        hasKey: !!groq?.api_key || !!env.groq,
        fromEnv: !groq?.api_key && !!env.groq,
        updated_at: groq?.updated_at ?? null,
        base_url: groq?.base_url ?? null,
      },
      gemini: {
        hasKey: !!gemini?.api_key || !!env.gemini,
        fromEnv: !gemini?.api_key && !!env.gemini,
        updated_at: gemini?.updated_at ?? null,
        base_url: gemini?.base_url ?? null,
      },
      ollama: {
        hasKey: !!ollama?.base_url || !!env.ollamaBaseUrl,
        fromEnv: !ollama?.base_url && !!env.ollamaBaseUrl,
        updated_at: ollama?.updated_at ?? null,
        base_url: ollama?.base_url ?? env.ollamaBaseUrl,
      },
    };
  });

export const testAiProvider = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((i) => z.object({ provider: ProviderSchema }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    return context.deps.aiGateway.testProvider(data.provider);
  });