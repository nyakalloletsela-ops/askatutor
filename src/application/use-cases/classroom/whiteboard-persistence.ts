import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * Load Whiteboard Snapshot
 *
 * Ensures the whiteboard exists (via RPC) and loads the most recent snapshot.
 */
export const loadWhiteboard = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => z.object({ roomId: z.string().min(1) }).parse(input))
  .handler(async ({ context, data }) => {
    return context.deps.classroom.loadWhiteboard(data.roomId);
  });

/**
 * Save Whiteboard Snapshot
 *
 * Saves the current whiteboard state as a new snapshot.
 */
export const saveWhiteboard = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        roomId: z.string().min(1),
        snapshotData: z.record(z.unknown()).transform((v) => v as any),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.classroom.saveWhiteboard(data.roomId, data.snapshotData);
  });
