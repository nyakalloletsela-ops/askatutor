import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

export const getMyAvailability = createServerFn({ method: "GET" })
  .middleware([requireAppDependencies])
  .handler(async ({ context }) => {
    return context.deps.tutor.getMyAvailability(context.userId);
  });

export const addAvailabilityWindow = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        weekday: z.number().int().min(0).max(6),
        start_min: z.number().int().min(0).max(1439),
        end_min: z.number().int().min(1).max(1440),
        timezone: z.string().min(1).max(50),
        buffer_minutes: z.number().int().min(0).max(120).default(0),
      })
      .refine((v) => v.end_min > v.start_min, {
        message: "End must be after start",
        path: ["end_min"],
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    return context.deps.tutor.addAvailabilityWindow(context.userId, data);
  });

export const updateAvailabilitySettings = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        timezone: z.string().min(1).max(50),
        buffer_minutes: z.number().int().min(0).max(120),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.tutor.updateAvailabilitySettings(context.userId, data);
  });

export const deleteAvailabilityWindow = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        windowId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.tutor.deleteAvailabilityWindow(data.windowId);
  });

export const copyAvailabilityDay = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        fromWeekday: z.number().int().min(0).max(6),
        toWeekday: z.number().int().min(0).max(6),
      })
      .refine((v) => v.fromWeekday !== v.toWeekday, {
        message: "Cannot copy to same day",
        path: ["toWeekday"],
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.tutor.copyAvailabilityDay(context.userId, data.fromWeekday, data.toWeekday);
  });
