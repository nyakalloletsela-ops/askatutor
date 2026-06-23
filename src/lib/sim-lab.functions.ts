import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ExplainSchema = z.object({
  definition: z.string().optional(),
  purpose: z.string().optional(),
  keyFacts: z.array(z.string()).max(8).optional(),
  misconceptions: z.array(z.string()).max(5).optional(),
}).optional();

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
  explain: ExplainSchema,
});

const ConnectionSchema = z.object({
  from: z.number().int().nonnegative(),
  to: z.number().int().nonnegative(),
  type: z.string().optional(),
  label: z.string().optional(),
});

const ProcessStepSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.number().min(0.5).max(20).optional(),
  highlight: z.array(z.number().int().nonnegative()).max(20).optional(),
});

const TimelineEventSchema = z.object({
  date: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.object({ lat: z.number(), lng: z.number(), label: z.string().optional() }).optional(),
});

const GeoRegionSchema = z.object({
  name: z.string(),
  color: z.string().optional(),
  value: z.number().optional(),
  label: z.string().optional(),
  coords: z.array(z.tuple([z.number(), z.number()])).max(80).optional(),
  pin: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

const DialogueLineSchema = z.object({
  speaker: z.number().int().nonnegative(),
  original: z.string(),
  translation: z.string().optional(),
  lang: z.string().optional(),
});

const LanguageSceneSchema = z.object({
  setting: z.string(),
  characters: z.array(z.object({ name: z.string(), emoji: z.string().optional(), color: z.string().optional() })).max(6),
  dialogue: z.array(DialogueLineSchema).max(30),
  vocabulary: z.array(z.object({ term: z.string(), meaning: z.string() })).max(20).optional(),
});

const QuizQuestionSchema = z.object({
  type: z.enum(["mcq", "tf", "short"]),
  question: z.string(),
  options: z.array(z.string()).max(6).optional(),
  answer: z.string(),
  explanation: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
});

export const SimulationSchema = z.object({
  subject: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  tags: z.array(z.string()).max(12).default([]),
  visualization: z.enum(["scene3d", "scene2d", "process", "timeline", "geo", "language"]).default("scene3d"),
  objects: z.array(ObjectSchema).max(60).default([]),
  connections: z.array(ConnectionSchema).max(80).default([]),
  rules: z.array(z.string()).default([]),
  timeline: z.number().positive().max(120).default(10),
  steps: z.array(ProcessStepSchema).max(20).optional(),
  events: z.array(TimelineEventSchema).max(40).optional(),
  geo: z.object({
    center: z.tuple([z.number(), z.number()]).optional(),
    zoom: z.number().min(0).max(20).optional(),
    regions: z.array(GeoRegionSchema).max(40).default([]),
  }).optional(),
  language: LanguageSceneSchema.optional(),
  graph2d: z.object({
    xLabel: z.string().optional(),
    yLabel: z.string().optional(),
    xMin: z.number().default(-10),
    xMax: z.number().default(10),
    yMin: z.number().default(-10),
    yMax: z.number().default(10),
    curves: z.array(z.object({
      label: z.string().optional(),
      color: z.string().optional(),
      expr: z.string(), // JS expression of x and t, e.g. "Math.sin(x + t)"
    })).max(6).default([]),
    points: z.array(z.object({ x: z.number(), y: z.number(), label: z.string().optional(), color: z.string().optional() })).max(20).default([]),
  }).optional(),
  quiz: z.array(QuizQuestionSchema).max(15).optional(),
});

export type SimulationSchemaT = z.infer<typeof SimulationSchema>;

const SYSTEM_PROMPT = `You are the AskATutorLive Universal Simulation Lab schema generator.
Convert ANY educational prompt (any subject, any level) into a strict JSON learning experience.

OUTPUT: a single valid JSON object only. No prose, no markdown.

CHOOSE the right "visualization" automatically:
- "scene3d": physics, biology structures, anatomy, astronomy, mechanical/engineering, chemistry molecules.
- "scene2d": math (graphs, functions, derivatives), statistics, economics curves (supply/demand), data viz.
- "process": step-by-step processes (photosynthesis, mitosis, CPU execution, water cycle, network packets, algorithms).
- "timeline": historical events, wars, revolutions, discoveries, biographies.
- "geo": geography, plate tectonics, climate, population, ocean currents, world systems.
- "language": vocabulary, conversations, role-play (restaurant, airport, job interview, greetings).

ALWAYS include: subject, title, short summary, tags (3-6).
ALWAYS include 3-6 auto-generated "quiz" questions mixing mcq/tf/short, scaled across difficulties, with answers + explanations.

PER VISUALIZATION:

scene3d / scene2d:
  Fill "objects" (≤30). type ∈ {sphere,particle,cube,wall,plane,arrow,car,cell,nucleus,organ,atom,molecule,dna,axis,curve,node,flow}.
  Each object: position[x,y,z]∈[-15,15], optional velocity (number for x-axis or [vx,vy,vz]), radius, size, color (hex), label, fixed.
  Add object "explain": {definition, purpose, keyFacts[], misconceptions[]} for the IMPORTANT objects so students can click them.
  "connections": [{from,to,type:"bond|force|flow|relationship",label}].
  "rules" subset of {newton_second_law,collision_response,gravity,flow_dynamics,orbital_motion,growth_cycle,chemical_bonding,graph_transform,market_flow,semantic_flow}.
  For scene2d math/economics also fill "graph2d": {xLabel,yLabel,xMin,xMax,yMin,yMax,curves:[{label,color,expr}],points:[{x,y,label,color}]} where expr is a JS expression in variables x and t (time seconds), e.g. "Math.sin(x+t)" or "Math.exp(-x)".

process:
  Fill "steps": [{title, description, duration_seconds, highlight:[objectIndexes]}]. Also fill "objects" so highlighted indexes refer to something visible.

timeline:
  Fill "events": [{date, title, description, location:{lat,lng,label}}] in chronological order.

geo:
  Fill "geo": {center:[lat,lng], zoom, regions:[{name, color, value, label, pin:{lat,lng}, coords:[[lng,lat],...]}]}. Use real coordinates.

language:
  Fill "language": {setting, characters:[{name,emoji,color}], dialogue:[{speaker:characterIndex, original, translation, lang:"fr|es|de|.."}], vocabulary:[{term,meaning}]}.

NEVER leave the visualization empty for its mode. If motion or change over time is meaningful, include it (velocities, curve expressions with t, step durations).`;

function fallbackSchema(prompt: string): SimulationSchemaT {
  const text = prompt.toLowerCase();
  if (/cell|biology|blood|heart|organ|plant|photosynthesis|dna|mitosis|respiration/.test(text)) {
    return {
      subject: "biology",
      title: prompt.slice(0, 60) || "Biology system simulation",
      summary: "A living-system process shown as animated cells and directional flows.",
      tags: ["biology", "system", "process"],
      objects: [
        { type: "cell", position: [-4, 1.2, 0], radius: 1.2, color: "#22c55e", label: "Input", velocity: [0.35, 0, 0] },
        { type: "organ", position: [0, 1.4, 0], radius: 1.6, color: "#ef4444", label: "System", fixed: true },
        { type: "cell", position: [4, 1.2, 0], radius: 1.2, color: "#06b6d4", label: "Output", velocity: [-0.25, 0, 0] },
        { type: "particle", position: [-2, 1, 1.8], radius: 0.35, color: "#fde047", label: "energy", velocity: [0.7, 0, -0.25] },
      ],
      connections: [{ from: 0, to: 1, type: "flow" }, { from: 1, to: 2, type: "flow" }],
      rules: ["flow_dynamics", "growth_cycle"],
      timeline: 12,
    };
  }
  if (/chem|atom|molecule|bond|reaction|acid|base|electron|compound/.test(text)) {
    return {
      subject: "chemistry",
      title: prompt.slice(0, 60) || "Chemistry interaction simulation",
      summary: "Atoms and bonds are represented as a dynamic molecular structure.",
      tags: ["chemistry", "molecule", "bonding"],
      objects: [
        { type: "atom", position: [-2, 1.2, 0], radius: 0.8, color: "#60a5fa", label: "A", velocity: [0.25, 0, 0] },
        { type: "atom", position: [0, 1.2, 0], radius: 0.6, color: "#f97316", label: "B", fixed: true },
        { type: "atom", position: [2, 1.2, 0], radius: 0.8, color: "#a78bfa", label: "C", velocity: [-0.25, 0, 0] },
      ],
      connections: [{ from: 0, to: 1, type: "bond" }, { from: 1, to: 2, type: "bond" }],
      rules: ["chemical_bonding", "orbital_motion"],
      timeline: 10,
    };
  }
  if (/math|equation|function|graph|calculus|geometry|vector|algebra|slope|parabola/.test(text)) {
    return {
      subject: "math",
      title: prompt.slice(0, 60) || "Mathematical transformation simulation",
      summary: "A mathematical relationship shown with axes, a changing curve, and labelled points.",
      tags: ["math", "graph", "transformation"],
      objects: [
        { type: "axis", position: [0, 0.05, 0], size: [9, 0.05, 9], color: "#94a3b8", label: "axes", fixed: true },
        { type: "curve", position: [-3, 1, 0], radius: 0.35, color: "#22d3ee", label: "f(x)", velocity: [0.6, 0, 0.2] },
        { type: "curve", position: [0, 2, 0], radius: 0.35, color: "#f472b6", label: "turning point", velocity: [0.15, 0, -0.35] },
        { type: "curve", position: [3, 1, 0], radius: 0.35, color: "#22d3ee", label: "x", velocity: [-0.45, 0, 0.25] },
      ],
      connections: [{ from: 1, to: 2, type: "relationship" }, { from: 2, to: 3, type: "relationship" }],
      rules: ["graph_transform", "flow_dynamics"],
      timeline: 10,
    };
  }
  if (/econom|market|supply|demand|price|inflation|trade|money|business/.test(text)) {
    return {
      subject: "economics",
      title: prompt.slice(0, 60) || "Economics flow simulation",
      summary: "Economic cause and effect shown as moving value flows between market nodes.",
      tags: ["economics", "market", "flow"],
      objects: [
        { type: "node", position: [-5, 1, 0], radius: 0.9, color: "#38bdf8", label: "Supply", fixed: true },
        { type: "flow", position: [-2, 1, 0], radius: 0.45, color: "#facc15", label: "price", velocity: [0.8, 0, 0] },
        { type: "node", position: [1.5, 1, 0], radius: 0.9, color: "#fb7185", label: "Demand", fixed: true },
        { type: "node", position: [5, 1, 0], radius: 0.9, color: "#34d399", label: "Equilibrium", fixed: true },
      ],
      connections: [{ from: 0, to: 2, type: "flow" }, { from: 2, to: 3, type: "flow" }],
      rules: ["market_flow", "flow_dynamics"],
      timeline: 12,
    };
  }
  return {
    subject: "abstract",
    title: prompt.slice(0, 60) || "Abstract simulation",
    summary: "A metaphor-based concept map with moving ideas and reusable knowledge links.",
    tags: ["concept", "flow", "simulation"],
    objects: [
      { type: "sphere", position: [-4, 1, 0], radius: 0.8, color: "#7c3aed", label: "A", velocity: [1, 0, 0] },
      { type: "sphere", position: [0, 1, 0], radius: 0.8, color: "#06b6d4", label: "B", velocity: [0, 0, 1] },
      { type: "sphere", position: [4, 1, 0], radius: 0.8, color: "#22d3ee", label: "C", velocity: [-1, 0, 0] },
    ],
    connections: [{ from: 0, to: 1, type: "flow" }, { from: 1, to: 2, type: "flow" }],
    rules: ["flow_dynamics"],
    timeline: 10,
  };
}

function toVectorLiteral(embedding: number[]) {
  return `[${embedding.map((n) => Number.isFinite(n) ? n.toFixed(8) : "0").join(",")}]`;
}

async function callGateway(path: string, body: unknown) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI is not configured");
  const res = await fetch(`https://ai.gateway.lovable.dev/v1${path}`, {
    method: "POST",
    headers: { "Lovable-API-Key": apiKey, "Content-Type": "application/json" },
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
    await assertLabsScope(context.supabase);
    const { data: rows, error } = await context.supabase.rpc("match_simulations", {
      query_embedding: toVectorLiteral(data.embedding),
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
      embedding: data.embedding ? toVectorLiteral(data.embedding) : null,
      thumbnail_url: data.thumbnailDataUrl ?? null,
      tags: data.schema.tags ?? [],
      processed: true,
      ai_schema_version: 2,
    };
    const { data: row, error } = await context.supabase
      .from("simulations")
      .insert(insert)
      .select("id, prompt, subject, title, schema_json, thumbnail_url, created_at, tags")
      .single();
    if (error) throw new Error(error.message);
    const saved = row as { id: string };
    await (context.supabase as any).from("simulation_versions").insert({
      simulation_id: saved.id,
      user_id: context.userId,
      schema_json: data.schema,
      prompt: data.prompt,
      version_number: 1,
    });
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
      .select("id, prompt, subject, title, thumbnail_url, created_at, schema_json, tags")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data.subject) q = q.eq("subject", data.subject);
    if (data.search) q = q.or(`title.ilike.%${data.search}%,prompt.ilike.%${data.search}%`);
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
