import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requirePublicDependencies } from "@/integrations/auth/app-dependencies";

/**
 * Browse Tutors
 *
 * Returns the public tutor listing with optional server-side filtering
 * by subject and name search. Replaces the previous direct Supabase
 * RPC call in the /tutors route.
 */
export const browseTutors = createServerFn({ method: "GET" })
  .middleware([requirePublicDependencies])
  .inputValidator((input) =>
    z
      .object({
        subject: z.string().max(120).optional(),
        search: z.string().max(200).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const all = await context.deps.tutor.listPublicTutors();

    let results = all;

    if (data.subject) {
      results = results.filter((t) => (t.subjects ?? []).includes(data.subject!));
    }

    if (data.search) {
      const q = data.search.toLowerCase();
      results = results.filter((t) => (t.full_name ?? "").toLowerCase().includes(q));
    }

    return results;
  });
