import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * Save to Notes
 *
 * Saves content (e.g., AI output) to the user's notes.
 * Extracts the direct Supabase insert from SaveToNotes.tsx.
 */
export const saveToNotes = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        title: z.string().min(1).max(200),
        body: z.string().min(1).max(50000),
        kind: z.string().max(50).default("ai"),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.note.create({
      userId: context.userId,
      title: data.title,
      body: data.body,
      kind: data.kind,
    });
  });
