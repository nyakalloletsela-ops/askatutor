import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";
import { assertAiEntitlement } from "@/application/services/entitlement-guard";
import { AGENT_REGISTRY } from "@/application/agents/registry";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const InputSchema = z.object({
  role: z.enum(["tutor", "math", "diagram", "whiteboard", "notes"]),
  messages: z.array(MessageSchema).min(1).max(40),
});

export const runAgent = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { deps, userId } = context;

    // Single shared server-side entitlement gate (scope 'ai').
    await assertAiEntitlement(deps.entitlement, userId, "ai");

    const agent = AGENT_REGISTRY[data.role];
    const { text: reply } = await deps.aiGateway.chat({
      model: agent.model,
      temperature: agent.temperature,
      messages: [{ role: "system", content: agent.system }, ...data.messages],
    });
    return { text: reply };
  });
