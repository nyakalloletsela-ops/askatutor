import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * Send Message
 *
 * Sends a direct message to another user.
 */
export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z
      .object({
        receiverId: z.string().uuid(),
        body: z.string().min(1).max(5000),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await context.deps.message.send({
      senderId: context.userId,
      recipientId: data.receiverId,
      body: data.body,
    });
  });
