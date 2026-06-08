import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  roomId: z.string().min(1).max(120),
  mode: z.enum(["student", "tutor"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(40),
});

export const askClassroomAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Membership check via existing security-definer fn
    const { data: allowed, error: authErr } = await supabase.rpc(
      "can_access_classroom_room",
      { _room: data.roomId },
    );
    if (authErr || !allowed) throw new Error("Not a member of this room");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const studentSystem =
      "You are a STEM tutoring co-pilot for a STUDENT in a live classroom. " +
      "STRICT RULES: Never give the final numeric answer or the full worked solution. " +
      "Instead, ask one Socratic question at a time, point out the relevant concept, formula or next micro-step, and let the student do the calculation. " +
      "If asked directly for the answer, refuse politely and offer the next hint. " +
      "Math goes inside $$...$$. Keep replies under 120 words.";

    const tutorSystem =
      "You are a STEM tutoring co-pilot for a TUTOR in a live classroom. " +
      "Provide complete worked solutions, alternative approaches, quiz items, and grading rubrics. " +
      "When you produce a key result, end with a line: 'INSERT: <short text or $$LaTeX$$>' so the tutor can drop it onto the whiteboard. " +
      "Math goes inside $$...$$.";

    const system = data.mode === "tutor" ? tutorSystem : studentSystem;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: system }, ...data.messages],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limited — please wait a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please notify the admin.");
      throw new Error("AI service error");
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = json.choices?.[0]?.message?.content?.trim() ?? "";

    // Extract INSERT: suggestions for tutor mode
    const suggestions: { kind: "text"; value: string }[] = [];
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*INSERT:\s*(.+)$/i);
      if (m) suggestions.push({ kind: "text", value: m[1].trim() });
    }

    return { text, suggestions };
  });
