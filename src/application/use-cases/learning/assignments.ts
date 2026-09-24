import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * Record the learner's self-reported assignment completion.
 * Database authorization derives ownership from the authenticated session.
 */
export const completeOwnAssignment = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input: unknown) => z.object({ assignmentId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await context.deps.assignment.completeOwnAssignment(data.assignmentId);
    return { ok: true };
  });
