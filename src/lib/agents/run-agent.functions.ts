import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAiEntitlement, supabaseEntitlementGateway } from "@/lib/ai-entitlement";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const InputSchema = z.object({
  role: z.enum(["tutor", "math", "diagram", "whiteboard", "notes"]),
  messages: z.array(MessageSchema).min(1).max(40),
});

export const runAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Single shared server-side entitlement gate (scope 'ai').
    await assertAiEntitlement(supabaseEntitlementGateway(supabase), userId, "ai");

    const { callAgent } = await import("./registry.server");
    const text = await callAgent(data.role, data.messages);
    return { text };
  });
