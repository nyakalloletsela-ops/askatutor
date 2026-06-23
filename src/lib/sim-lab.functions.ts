import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ObjectSchema = z.object({
  type: z.string(),
  position: z.array(z.number()).length(3).optional(),
  velocity: z.union([z.number(), z.array(z.number()).length(3)]).optional(),
  mass: z.number().optional(),
  radius: z.number().optional(),
  size: z.union([z.number(), z.array(z.number()).length(3)]).optional(),
  color: z.string().optional(),
  label: z.string().optional(),
  fixed: z.boolean().optional(),
});

export const SimulationSchema = z.object({
  subject: z.string(),
  title: z.string(),
  objects: z.array(ObjectSchema).max(60),
  rules: z.array(z.string()).default([]),
  timeline: z.number().positive().max(120).default(10),
});

export type SimulationSchemaT = z.infer<typeof SimulationSchema>;

const SYSTEM_PROMPT = `You are the AskATutorLive Simulation Lab schema generator.
Convert any educational prompt into a strict JSON simulation schema.

RULES:
- Output ONLY a single valid JSON object. No prose, no markdown fences.
- Auto-detect "subject" (physics, biology, chemistry, math, economics, abstract, ...).
- Provide a short human "title".
- "objects" is an array (max 20) of primitives the renderer understands:
  type ∈ {"car","sphere","wall","particle","cube","plane","arrow"}.
  Each object MAY include: position [x,y,z], velocity (number along x OR [vx,vy,vz]),
  mass, radius, size (scalar or [w,h,d]), color (hex), label, fixed (bool).
- "rules" subset of: ["newton_second_law","collision_response","gravity","flow_dynamics"].
- "timeline" seconds (1-60).
- For unknown / abstract subjects, return 3-6 glowing labelled spheres with flow_dynamics.
- Keep coordinates in -20..20 range.`;

function fallbackSchema(prompt: string): SimulationSchemaT {
  return {
    subject: "abstract",
    title: prompt.slice(0, 60) || "Abstract simulation",
    objects: [
      { type: "sphere", position: [-4, 1, 0], radius: 0.8, color: "#7c3aed", label: "A", velocity: [1, 0, 0] },
      { type: "sphere", position: [0, 1, 0], radius: 0.8, color: "#06b6d4", label: "B", velocity: [0, 0, 1] },
      { type: "sphere", position: [4, 1, 0], radius: 0.8, color: "#22d3ee", label: "C", velocity: [-1, 0, 0] },
    ],
    rules: ["flow_dynamics"],
    timeline: 10,
  };
}

async function callGateway(path: string, body: unknown) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI is not configured");
  const res = await fetch(`https://ai.gateway.lovable.dev/v1${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("Too many requests — slow down.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    const txt = await res.text().catch(() => "");
    throw new Error(`AI error ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

async function assertLabsScope(supabase: any) {
  const { data, error } = await supabase.rpc("student_has_scope", { _scope: "labs" });
  if (error) return; // fail open on rpc error; UI gate enforces too
  if (!data) {
    // admins/tutors don't need scope — check roles
    const { data: roles } = await supabase.from("user_roles").select("role");
    const ok = (roles ?? []).some((r: { role: string }) => r.role === "admin" || r.role === "tutor");
    if (!ok) throw new Error("Labs subscription required");
  }
}

export const embedPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ text: z.string().min(1).max(4000) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertLabsScope(context.supabase);
    const json = (await callGateway("/embeddings", {
      model: "openai/text-embedding-3-small",
      input: data.text,
    })) as { data?: { embedding: number[] }[] };
    const emb = json.data?.[0]?.embedding;
    if (!emb) throw new Error("No embedding returned");
    return { embedding: emb };
  });

export const findSimilarSimulation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ embedding: z.array(z.number()).length(1536), minSimilarity: z.number().default(0.85) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("match_simulations", {
      query_embedding: data.embedding as unknown as string,
      match_count: 1,
      min_similarity: data.minSimilarity,
    });
    if (error) throw new Error(error.message);
    return { match: (rows && rows[0]) || null };
  });

export const generateSimulationSchema = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ prompt: z.string().min(2).max(2000) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertLabsScope(context.supabase);
    try {
      const json = (await callGateway("/chat/completions", {
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: data.prompt },
        ],
        response_format: { type: "json_object" },
      })) as { choices?: { message?: { content?: string } }[] };
      const raw = json.choices?.[0]?.message?.content ?? "";
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = SimulationSchema.safeParse(JSON.parse(cleaned));
      if (parsed.success) return { schema: parsed.data, fallback: false };
    } catch {
      // swallow and fall through
    }
    return { schema: fallbackSchema(data.prompt), fallback: true };
  });

export const saveSimulation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        prompt: z.string().min(1).max(2000),
        schema: SimulationSchema,
        embedding: z.array(z.number()).length(1536).nullable().optional(),
        thumbnailDataUrl: z.string().max(400_000).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const insert: any = {
      user_id: context.userId,
      prompt: data.prompt,
      subject: data.schema.subject,
      title: data.schema.title,
      schema_json: data.schema,
      embedding: data.embedding ? (data.embedding as unknown as string) : null,
      thumbnail_url: data.thumbnailDataUrl ?? null,
    };
    const { data: row, error } = await context.supabase
      .from("simulations")
      .insert(insert)
      .select("id, prompt, subject, title, schema_json, thumbnail_url, created_at")
      .single();
    if (error) throw new Error(error.message);
    return { simulation: row };
  });

export const listSimulations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ search: z.string().max(200).optional(), subject: z.string().max(60).optional() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("simulations")
      .select("id, prompt, subject, title, thumbnail_url, created_at, schema_json")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data.subject) q = q.eq("subject", data.subject);
    if (data.search) q = q.ilike("title", `%${data.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { simulations: rows ?? [] };
  });

export const deleteSimulation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("simulations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
