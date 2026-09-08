import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * Update Platform Config
 *
 * Updates a platform configuration field.
 * Extracts the direct Supabase update from ConfigToggle.tsx and AiProviderSelect.tsx.
 */
export const updatePlatformConfig = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => z.object({ patch: z.any() }).parse(input))
  .handler(async ({ context, data }) => {
    await context.deps.platformConfig.update(data.patch);
  });