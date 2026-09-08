import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * Send Classroom Chat Message
 *
 * Inserts a chat message into the classroom_chat table.
 * Extracts the direct Supabase insert from ClassroomChat.tsx.
 */
export const sendClassroomMessage = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        roomId: z.string().min(1).max(200),
        displayName: z.string().min(1).max(100),
        body: z.string().min(1).max(5000),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.classroom.sendChatMessage({
      roomId: data.roomId,
      userId: context.userId,
      displayName: data.displayName,
      body: data.body,
    });
  });
