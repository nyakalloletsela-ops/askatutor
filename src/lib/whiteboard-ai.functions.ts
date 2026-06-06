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
      "You are an OCR engine specialised in mathematics, science and chemistry handwriting on whiteboards. " +
      "Look at the image and transcribe ALL handwritten content exactly. " +
      "For every mathematical or chemical equation, output it as LaTeX wrapped in $$...$$ on its own line. " +
      "For plain prose, output it as plain text. Preserve line breaks and reading order. " +
      "Do not add commentary, headers or explanations — output only the transcription.";

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
