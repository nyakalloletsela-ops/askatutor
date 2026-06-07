import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  imageDataUrl: z
    .string()
    .min(40)
    .max(8_000_000)
    .regex(/^data:image\/(png|jpeg|webp);base64,/, "Must be a base64 data URL"),
});

export const whiteboardConvert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => Input.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const system =
      "You are an OCR + digitiser for whiteboards used in mathematics, science and chemistry tutoring. " +
      "Reproduce the page as a clean, polished digital version with ZERO handwritten elements remaining. Strict rules:\n" +
      "1. Plain handwriting → output as plain text, preserving line breaks and reading order.\n" +
      "2. Equations / formulas / chemical reactions → output as LaTeX wrapped in $$...$$ on its own line.\n" +
      "3. Diagrams, sketches, graphs, shapes, arrows, chemistry apparatus, geometric figures → REDRAW them as inline SVG using `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 W H\" width=\"W\" height=\"H\">…</svg>`. " +
      "Use smooth precise lines (stroke=\"#0f172a\", stroke-width=\"2\", fill=\"none\" unless a shape is filled). Preserve the original proportions and any labels — put labels INSIDE the SVG with <text> elements. " +
      "CRITICAL: do NOT replace a visual drawing with a written description or a name — every diagram must remain a visual diagram.\n" +
      "4. Preserve reading order: interleave text, $$LaTeX$$ blocks and <svg> blocks exactly where they appear on the board.\n" +
      "5. Do NOT add commentary, headings, code fences or explanations — output only the digitised content.";

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              { type: "text", text: "Transcribe this whiteboard." },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Too many requests — please slow down.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please notify the admin.");
      throw new Error("AI service error");
    }
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = json.choices?.[0]?.message?.content?.trim() ?? "";
    return { text };
  });
