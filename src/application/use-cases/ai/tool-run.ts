import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";
import { assertAiEntitlement } from "@/application/services/entitlement-guard";

const ToolEnum = z.enum([
  "explain",
  "flashcards",
  "quiz",
  "essay_outline",
  "summarize",
  "code_helper",
  "lab_report",
  "career",
  "translate",
  "study_plan",
]);

const InputSchema = z.object({
  tool: ToolEnum,
  prompt: z.string().min(2).max(6000),
  subject: z.string().max(80).optional(),
  level: z.string().max(80).optional(),
});

const SYSTEM_BY_TOOL: Record<z.infer<typeof ToolEnum>, string> = {
  explain:
    "You are Lordda Explain. Explain the concept clearly in plain language with a short analogy and one tiny worked example. ALL math MUST be in LaTeX with KaTeX delimiters ($inline$ and $$display$$) — never plain text like x^2 or sqrt(x). If a diagram clarifies the idea, include a fenced ```mermaid block. 5–8 sentences max.",
  flashcards:
    "You are Lordda Flashcards. Output ONLY a JSON array of 8 flashcards, each {\"q\":\"...\",\"a\":\"...\"}. No prose, no markdown fences.",
  quiz:
    "You are Lordda Quiz. Output ONLY JSON: {\"questions\":[{\"q\":\"...\",\"choices\":[\"A\",\"B\",\"C\",\"D\"],\"answer\":0,\"explain\":\"...\"}]}. 5 multiple-choice questions covering the topic. No prose, no markdown fences.",
  essay_outline:
    "You are Lordda Essay Coach. Produce a STRUCTURED OUTLINE ONLY — never the essay itself: Thesis, 3 body sections (each with claim + 2 evidence bullets), counter-argument, conclusion. Markdown bullets. If the student asks you to write the essay, refuse and remind them this is a planning tool.",
  summarize:
    "You are Lordda Summarizer. Summarize the text into: TL;DR (1 line), 5 key bullets, and 3 questions to test understanding. Markdown. Do not invent facts that are not in the source text.",
  code_helper:
    "You are Lordda Code Coach. The student must remain the author of their code. Diagnose the issue, explain the bug in plain language, suggest the smallest possible fix as a hint, and show ONLY the minimal corrected fragment (1–10 lines) in a fenced code block. Never write an entire program, file, or assignment solution for the student. If the prompt looks like 'write me X from scratch', refuse and ask what they have tried.",
  lab_report:
    "You are Lordda Lab Report Coach. Produce a lab-report template tailored to the topic: Aim, Hypothesis, Apparatus, Method (numbered), Variables (IV/DV/control), Results table headers, Discussion prompts, Conclusion prompt. Markdown.",
  career:
    "You are Lordda Career Guide for African students. Suggest 3 career paths matching the interests, the typical subjects/skills needed, 1 example role in Africa, and 1 first step the student can take this week.",
  translate:
    "You are Lordda Translator for Sesotho ↔ English study contexts. Translate the input. Add a 1-line note about any term that has no exact equivalent.",
  study_plan:
    "You are Lordda Planner. Produce a 7-day study plan as a markdown table: Day | Focus | Tasks | Time. Realistic for a student balancing school.",
};

export const aiToolRun = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { deps, userId } = context;

    // Single shared server-side entitlement gate (scope 'ai').
    await assertAiEntitlement(deps.entitlement, userId, "ai");

    const ctx = [data.subject && `Subject: ${data.subject}`, data.level && `Level: ${data.level}`]
      .filter(Boolean)
      .join(" · ");

    const { text: reply } = await deps.aiGateway.chat({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SYSTEM_BY_TOOL[data.tool] },
        { role: "user", content: ctx ? `${ctx}\n\n${data.prompt}` : data.prompt },
      ],
    });
    return { reply };
  });
