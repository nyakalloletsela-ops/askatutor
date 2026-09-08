import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * List Classroom Files
 *
 * Lists files in a classroom's storage folder.
 */
export const listClassroomFiles = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z.object({ roomId: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    return context.deps.classroom.listFiles(data.roomId);
  });

/**
 * Get Classroom File URL
 *
 * Creates a signed URL for downloading a classroom file.
 */
export const getClassroomFileUrl = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z.object({ path: z.string().min(1) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const url = await context.deps.classroom.getFileUrl(data.path);
    return { url };
  });

/**
 * Delete Classroom File
 *
 * Removes a file from the classroom's storage.
 */
export const deleteClassroomFile = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z.object({ path: z.string().min(1) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.classroom.deleteFile(data.path);
  });