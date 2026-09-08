import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * Get Admin Dashboard Data
 *
 * Loads all data needed for the admin home page:
 * tutor applications, active tutors, sessions, audit log.
 *
 * Extracts the embedded Supabase logic from AdminHome.tsx.
 */
export const getAdminDashboardData = createServerFn({ method: "GET" })
  .middleware([requireAppDependencies])
  .handler(async ({ context }) => {
    return context.deps.admin.getDashboardData();
  });

/**
 * Approve Tutor Application
 *
 * Approves a tutor application via RPC.
 */
export const approveTutorApplication = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        applicationId: z.string().uuid(),
        notes: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.admin.approveTutorApplication(data.applicationId, data.notes);
  });

/**
 * Reject Tutor Application
 *
 * Rejects a tutor application via RPC.
 */
export const rejectTutorApplication = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        applicationId: z.string().uuid(),
        notes: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.admin.rejectTutorApplication(data.applicationId, data.notes);
  });

/**
 * Log Tutor Decision
 *
 * Records an audit log entry for a tutor application decision.
 */
export const logTutorDecision = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        applicationIds: z.array(z.string().uuid()),
        action: z.string().min(1).max(100),
        notes: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.admin.logTutorDecision(data.applicationIds, data.action, data.notes);
  });
