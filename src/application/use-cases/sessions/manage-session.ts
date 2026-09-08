import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * Cancel Session
 */
export const cancelSession = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        sessionId: z.string().min(1),
        reason: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.session.cancel(data.sessionId, data.reason);
  });

/**
 * Reschedule Session
 */
export const rescheduleSession = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        sessionId: z.string().min(1),
        newStart: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.session.reschedule(
      data.sessionId,
      new Date(data.newStart).toISOString(),
    );
  });

/**
 * Complete Session
 */
export const completeSession = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => z.object({ sessionId: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    await context.deps.session.complete(data.sessionId);
  });

/**
 * Get Lessons List
 *
 * Loads all sessions for the current user with participant names.
 */
export const getLessonsList = createServerFn({ method: "GET" })
  .middleware([requireAppDependencies])
  .handler(async ({ context }) => {
    return context.deps.session.listLessons();
  });
