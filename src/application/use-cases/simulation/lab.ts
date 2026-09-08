import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";
import { assertAiEntitlement } from "@/application/services/entitlement-guard";
import type { AppDependencies } from "@/application/contracts/dependencies";

const ExplainSchema = z
  .object({
    definition: z.string().optional(),
    purpose: z.string().optional(),
    keyFacts: z.array(z.string()).max(8).optional(),
    misconceptions: z.array(z.string()).max(5).optional(),
  })
  .optional();

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
  coords: z
    .array(z.tuple([z.number(), z.number()]))
    .max(80)
    .optional(),
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
  characters: z
    .array(
      z.object({ name: z.string(), emoji: z.string().optional(), color: z.string().optional() }),
    )
    .max(6),
  dialogue: z.array(DialogueLineSchema).max(30),
  vocabulary: z
    .array(z.object({ term: z.string(), meaning: z.string() }))
    .max(20)
    .optional(),
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
  visualization: z
    .enum(["scene3d", "scene2d", "process", "timeline", "geo", "language"])
    .default("scene3d"),
  objects: z.array(ObjectSchema).max(60).default([]),
  connections: z.array(ConnectionSchema).max(80).default([]),
  rules: z.array(z.string()).default([]),
  timeline: z.number().positive().max(120).default(10),
  steps: z.array(ProcessStepSchema).max(20).optional(),
  events: z.array(TimelineEventSchema).max(40).optional(),
  geo: z
    .object({
      center: z.tuple([z.number(), z.number()]).optional(),
      zoom: z.number().min(0).max(20).optional(),
      regions: z.array(GeoRegionSchema).max(40).default([]),
    })
    .optional(),
  language: LanguageSceneSchema.optional(),
  graph2d: z
    .object({
      xLabel: z.string().optional(),
      yLabel: z.string().optional(),
      xMin: z.number().default(-10),
      xMax: z.number().default(10),
      yMin: z.number().default(-10),
      yMax: z.number().default(10),
      curves: z
        .array(
          z.object({
            label: z.string().optional(),
            color: z.string().optional(),
            expr: z.string(), // JS expression of x and t, e.g. "Math.sin(x + t)"
          }),
        )
        .max(6)
        .default([]),
      points: z
        .array(
          z.object({
            x: z.number(),
            y: z.number(),
            label: z.string().optional(),
            color: z.string().optional(),
          }),
        )
        .max(20)
        .default([]),
    })
    .optional(),
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
  Fill "objects" (â‰¤30). type âˆˆ {sphere,particle,cube,wall,plane,arrow,car,cell,nucleus,organ,atom,molecule,dna,axis,curve,node,flow}.
  Each object: position[x,y,z]âˆˆ[-15,15], optional velocity (number for x-axis or [vx,vy,vz]), radius, size, color (hex), label, fixed.
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
  if (
    /history|war|battle|revolution|empire|treaty|king|queen|century|world war|civil war/.test(text)
  ) {
    return {
      subject: "history",
      title: prompt.slice(0, 60) || "Historical timeline",
      summary: "A chronological visualization of key historical events.",
      tags: ["history", "timeline"],
      visualization: "timeline",
      objects: [],
      connections: [],
      rules: [],
      timeline: 10,
      events: [
        { date: "Start", title: "Background", description: "Set the historical context." },
        { date: "Event", title: "Main event", description: "The pivotal moment of the period." },
        { date: "Aftermath", title: "Consequences", description: "Long-term impact and outcomes." },
      ],
    };
  }
  if (
    /french|spanish|german|italian|japanese|chinese|vocab|restaurant|airport|hotel|interview|conversation|greeting|dialogue/.test(
      text,
    )
  ) {
    return {
      subject: "language",
      title: prompt.slice(0, 60) || "Language scene",
      summary: "An interactive dialogue scene for language practice.",
      tags: ["language", "dialogue"],
      visualization: "language",
      objects: [],
      connections: [],
      rules: [],
      timeline: 10,
      language: {
        setting: "A typical scenario",
        characters: [
          { name: "You", emoji: "ðŸ§‘", color: "#22d3ee" },
          { name: "Other", emoji: "ðŸ§‘â€ðŸ³", color: "#f472b6" },
        ],
        dialogue: [
          { speaker: 1, original: "Bonjour !", translation: "Hello!", lang: "fr" },
          {
            speaker: 0,
            original: "Bonjour, Ã§a va ?",
            translation: "Hello, how are you?",
            lang: "fr",
          },
          {
            speaker: 1,
            original: "TrÃ¨s bien, merci.",
            translation: "Very well, thank you.",
            lang: "fr",
          },
        ],
        vocabulary: [
          { term: "Bonjour", meaning: "Hello" },
          { term: "Merci", meaning: "Thank you" },
        ],
      },
    };
  }
  if (/tecton|continent|climate|ocean|geograph|country|population|region|map/.test(text)) {
    return {
      subject: "geography",
      title: prompt.slice(0, 60) || "Geographic overview",
      summary: "A geographic visualization with labelled regions.",
      tags: ["geography", "map"],
      visualization: "geo",
      objects: [],
      connections: [],
      rules: [],
      timeline: 10,
      geo: {
        center: [20, 0],
        zoom: 1,
        regions: [
          { name: "Region A", color: "#22d3ee", label: "A", pin: { lat: 40, lng: -100 } },
          { name: "Region B", color: "#f472b6", label: "B", pin: { lat: 10, lng: 30 } },
          { name: "Region C", color: "#facc15", label: "C", pin: { lat: -20, lng: 130 } },
        ],
      },
    };
  }
  if (/photosynthesis|mitosis|water cycle|cpu|algorithm|network packet|process|step/.test(text)) {
    return {
      subject: "process",
      title: prompt.slice(0, 60) || "Step-by-step process",
      summary: "Animated step-by-step breakdown.",
      tags: ["process", "animation"],
      visualization: "process",
      objects: [
        { type: "node", position: [-4, 1, 0], radius: 0.8, color: "#22c55e", label: "Input" },
        { type: "node", position: [0, 1, 0], radius: 0.8, color: "#f59e0b", label: "Process" },
        { type: "node", position: [4, 1, 0], radius: 0.8, color: "#06b6d4", label: "Output" },
      ],
      connections: [
        { from: 0, to: 1, type: "flow" },
        { from: 1, to: 2, type: "flow" },
      ],
      rules: ["flow_dynamics"],
      timeline: 10,
      steps: [
        {
          title: "Step 1: Input",
          description: "Initial conditions are set.",
          duration: 3,
          highlight: [0],
        },
        {
          title: "Step 2: Transformation",
          description: "The core process runs.",
          duration: 4,
          highlight: [1],
        },
        {
          title: "Step 3: Output",
          description: "The result is produced.",
          duration: 3,
          highlight: [2],
        },
      ],
    };
  }
  if (
    /derivative|integral|function|sin|cos|graph|plot|equation|inflation|supply|demand/.test(text)
  ) {
    return {
      subject: "math",
      title: prompt.slice(0, 60) || "Function plot",
      summary: "Live 2D graph with animated curve.",
      tags: ["math", "graph"],
      visualization: "scene2d",
      objects: [],
      connections: [],
      rules: [],
      timeline: 10,
      graph2d: {
        xLabel: "x",
        yLabel: "y",
        xMin: -10,
        xMax: 10,
        yMin: -3,
        yMax: 3,
        curves: [
          { label: "y = sin(x + t)", color: "#22d3ee", expr: "Math.sin(x + t)" },
          { label: "y = cos(x + t)", color: "#f472b6", expr: "Math.cos(x + t)" },
        ],
        points: [],
      },
    };
  }
  if (/cell|biology|blood|heart|organ|plant|dna|respiration/.test(text)) {
    return {
      subject: "biology",
      title: prompt.slice(0, 60) || "Biology system",
      visualization: "scene3d",
      summary: "A living-system process shown as animated cells and directional flows.",
      tags: ["biology", "system", "process"],
      objects: [
        {
          type: "cell",
          position: [-4, 1.2, 0],
          radius: 1.2,
          color: "#22c55e",
          label: "Input",
          velocity: [0.35, 0, 0],
        },
        {
          type: "organ",
          position: [0, 1.4, 0],
          radius: 1.6,
          color: "#ef4444",
          label: "System",
          fixed: true,
        },
        {
          type: "cell",
          position: [4, 1.2, 0],
          radius: 1.2,
          color: "#06b6d4",
          label: "Output",
          velocity: [-0.25, 0, 0],
        },
      ],
      connections: [
        { from: 0, to: 1, type: "flow" },
        { from: 1, to: 2, type: "flow" },
      ],
      rules: ["flow_dynamics", "growth_cycle"],
      timeline: 12,
    };
  }
  if (/chem|atom|molecule|bond|reaction|acid|base|electron|compound/.test(text)) {
    return {
      subject: "chemistry",
      title: prompt.slice(0, 60) || "Chemistry",
      visualization: "scene3d",
      summary: "Atoms and bonds as a dynamic molecular structure.",
      tags: ["chemistry", "molecule", "bonding"],
      objects: [
        {
          type: "atom",
          position: [-2, 1.2, 0],
          radius: 0.8,
          color: "#60a5fa",
          label: "A",
          velocity: [0.25, 0, 0],
        },
        {
          type: "atom",
          position: [0, 1.2, 0],
          radius: 0.6,
          color: "#f97316",
          label: "B",
          fixed: true,
        },
        {
          type: "atom",
          position: [2, 1.2, 0],
          radius: 0.8,
          color: "#a78bfa",
          label: "C",
          velocity: [-0.25, 0, 0],
        },
      ],
      connections: [
        { from: 0, to: 1, type: "bond" },
        { from: 1, to: 2, type: "bond" },
      ],
      rules: ["chemical_bonding", "orbital_motion"],
      timeline: 10,
    };
  }
  return {
    subject: "abstract",
    title: prompt.slice(0, 60) || "Concept map",
    visualization: "scene3d",
    summary: "A metaphor-based concept map with moving ideas.",
    tags: ["concept", "flow", "simulation"],
    objects: [
      {
        type: "sphere",
        position: [-4, 1, 0],
        radius: 0.8,
        color: "#7c3aed",
        label: "A",
        velocity: [1, 0, 0],
      },
      {
        type: "sphere",
        position: [0, 1, 0],
        radius: 0.8,
        color: "#06b6d4",
        label: "B",
        velocity: [0, 0, 1],
      },
      {
        type: "sphere",
        position: [4, 1, 0],
        radius: 0.8,
        color: "#22d3ee",
        label: "C",
        velocity: [-1, 0, 0],
      },
    ],
    connections: [
      { from: 0, to: 1, type: "flow" },
      { from: 1, to: 2, type: "flow" },
    ],
    rules: ["flow_dynamics"],
    timeline: 10,
  };
}

async function callGateway(aiGateway: AppDependencies["aiGateway"], path: string, body: any) {
  if (path === "/chat/completions") {
    const { raw } = await aiGateway.chat({
      model: body.model,
      messages: body.messages,
      temperature: body.temperature,
      response_format: body.response_format,
    });
    return raw;
  }
  if (path === "/embeddings") {
    const { embedding } = await aiGateway.embed({ model: body.model, input: body.input });
    return { data: [{ embedding }] };
  }
  throw new Error(`Unsupported AI path: ${path}`);
}

async function assertLabsScope(deps: AppDependencies, userId: string) {
  // Fail closed: admins/tutors pass via role; students need the 'labs' scope.
  // Any config/role/scope read error denies rather than allows.
  await assertAiEntitlement(deps.entitlement, userId, "labs");
}

export const embedPrompt = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((i: unknown) => z.object({ text: z.string().min(1).max(4000) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertLabsScope(context.deps, context.userId);
    const json = (await callGateway(context.deps.aiGateway, "/embeddings", {
      model: "openai/text-embedding-3-small",
      input: data.text,
    })) as { data?: { embedding: number[] }[] };
    const emb = json.data?.[0]?.embedding;
    if (!emb) throw new Error("No embedding returned");
    return { embedding: emb };
  });

export const findSimilarSimulation = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((i: unknown) =>
    z
      .object({
        embedding: z.array(z.number()).length(1536),
        minSimilarity: z.number().default(0.85),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertLabsScope(context.deps, context.userId);
    const match = await context.deps.simulation.findSimilar(data.embedding, data.minSimilarity);
    return { match };
  });

export const generateSimulationSchema = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((i: unknown) => z.object({ prompt: z.string().min(2).max(2000) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertLabsScope(context.deps, context.userId);
    try {
      const json = (await callGateway(context.deps.aiGateway, "/chat/completions", {
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: data.prompt },
        ],
        response_format: { type: "json_object" },
      })) as { choices?: { message?: { content?: string } }[] };
      const raw = json.choices?.[0]?.message?.content ?? "";
      const cleaned = raw
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      const parsed = SimulationSchema.safeParse(JSON.parse(cleaned));
      if (parsed.success) return { schema: parsed.data, fallback: false };
    } catch {
      // swallow and fall through
    }
    return { schema: fallbackSchema(data.prompt), fallback: true };
  });

export const saveSimulation = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
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
    const simulation = await context.deps.simulation.save({
      userId: context.userId,
      prompt: data.prompt,
      subject: data.schema.subject,
      title: data.schema.title,
      schema: data.schema,
      embedding: data.embedding ?? null,
      thumbnailUrl: data.thumbnailDataUrl ?? null,
      tags: data.schema.tags ?? [],
    });
    return { simulation };
  });

export const listSimulations = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((i: unknown) =>
    z
      .object({ search: z.string().max(200).optional(), subject: z.string().max(60).optional() })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const simulations = await context.deps.simulation.list({
      search: data.search,
      subject: data.subject,
    });
    return { simulations };
  });

export const deleteSimulation = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await context.deps.simulation.delete(data.id);
    return { ok: true };
  });
