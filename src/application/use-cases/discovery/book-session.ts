import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * Get Tutor Profile
 *
 * Loads a tutor's public profile information for the booking page.
 */
export const getTutorProfile = createServerFn({ method: "GET" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => z.object({ tutorId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    return context.deps.tutor.getProfile(data.tutorId);
  });

/**
 * Get Tutor Availability
 *
 * Loads a tutor's availability windows, holidays, and busy slots
 * for the booking calendar.
 */
export const getTutorAvailability = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        tutorId: z.string().uuid(),
        from: z.string(),
        to: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    return context.deps.tutor.getAvailability(data.tutorId, data.from, data.to);
  });

/**
 * Book Session
 *
 * Creates one or more sessions via the book_session RPC.
 * Returns the created session IDs.
 */
export const bookSession = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        tutorId: z.string().uuid(),
        start: z.string(),
        durationMin: z.number().int().min(15).max(240),
        subject: z.string().max(120).optional(),
        isFree: z.boolean().default(false),
        recurrenceWeeks: z.number().int().min(1).max(52).default(1),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sessionIds = await context.deps.session.book({
      tutorId: data.tutorId,
      start: data.start,
      durationMin: data.durationMin,
      subject: data.subject ?? "General",
      isFree: data.isFree,
      recurrenceWeeks: data.recurrenceWeeks,
    });
    return { sessionIds };
  });

/**
 * Join Waitlist
 *
 * Adds the current student to the tutor's waitlist when no slots are available.
 */
export const joinWaitlist = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        tutorId: z.string().uuid(),
        subject: z.string().max(120).optional(),
        durationMin: z.number().int().min(15).max(240),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.session.joinWaitlist({
      studentId: context.userId,
      tutorId: data.tutorId,
      subject: data.subject ?? null,
      durationMin: data.durationMin,
    });
  });