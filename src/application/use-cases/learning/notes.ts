import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * List Notes
 *
 * Returns all notes for the current user.
 */
export const listNotes = createServerFn({ method: "GET" })
  .middleware([requireAppDependencies])
  .handler(async ({ context }) => {
    return context.deps.note.listForUser(context.userId);
  });

/**
 * Create Note
 *
 * Creates a new note for the current user.
 */
export const createNote = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        title: z.string().min(1).max(200),
        body: z.string().max(50000),
        kind: z.string().max(50).default("manual"),
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

/**
 * Delete Note
 *
 * Deletes a note owned by the current user.
 */
export const deleteNote = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => z.object({ noteId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await context.deps.note.delete(context.userId, data.noteId);
  });