import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * Create Forum Post
 *
 * Creates a new forum post or reply.
 */
export const createForumPost = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        title: z.string().max(200).optional(),
        body: z.string().min(1).max(10000),
        subject: z.string().max(100).optional(),
        parentId: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.moderation.createPost({
      userId: context.userId,
      title: data.title ?? null,
      body: data.body,
      subject: data.subject ?? null,
      parentId: data.parentId ?? null,
    });
  });