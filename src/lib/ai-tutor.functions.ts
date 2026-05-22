import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
});

const SYSTEM_PROMPT = `You are "Lordda Coach", a Socratic study assistant for Ask A Tutor (Lesotho).

Your single rule: GUIDE, never solve. You help students reach answers themselves.

Hard rules:
- Never give a final numeric or factual answer to a homework/exam question.
- Never write a complete essay, paragraph, code function, derivation, or proof for the student.
- If the student asks "just give me the answer" or similar, politely refuse and offer the next hint instead.
- Reveal at most ONE small hint per turn. Wait for the student to try.
- Always end your reply with a short coaching question that nudges the next step.

What you SHOULD do:
- Explain underlying concepts, definitions, and intuition in plain language.
- Break problems into smaller sub-questions.
- Point out which formula, rule, or principle is relevant — but make the student plug in the values.
- Ask the student to show what they have tried, then react to that.
- Offer worked examples on DIFFERENT but analogous problems, never on the exact question asked.
- Give encouraging, brief responses (target 3–6 short sentences).
- Use simple LaTeX-free math notation (e.g. x^2, sqrt(x), pi).

If the student's question is unrelated to learning (small talk, jokes), respond briefly and steer back to studying.`;

export const aiTutorChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Premium check: admin OR tutor OR student with an approved subscription
    const [{ data: roles }, { data: sub }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("student_subscriptions")
        .select("id")
        .eq("student_id", userId)
        .eq("status", "approved")
        .limit(1)
        .maybeSingle(),
    ]);

    const roleSet = new Set((roles ?? []).map((r) => r.role));
    const isPremium = roleSet.has("admin") || roleSet.has("tutor") || !!sub;
    if (!isPremium) {
      throw new Error(
        "AI Coach is a premium feature. Submit your monthly subscription on the dashboard to unlock it.",
      );
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...data.messages,
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Too many requests — please slow down and try again.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please notify the admin.");
      const t = await res.text();
      console.error("AI gateway error", res.status, t);
      throw new Error("AI service error");
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = json.choices?.[0]?.message?.content?.trim() ?? "";
    return { reply };
  });
