import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/Navbar";
import { ScopeGate } from "@/components/ScopeGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Play, Pause, RotateCcw, Sparkles, Trash2, Maximize2, Loader2, Search,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { SimScene } from "@/components/lab3d/SimScene";
import {
  embedPrompt, findSimilarSimulation, generateSimulationSchema,
  saveSimulation, listSimulations, deleteSimulation,
  type SimulationSchemaT,
} from "@/lib/sim-lab.functions";
import * as THREE from "three";

export const Route = createFileRoute("/_authenticated/labs/3d-ai-lab")({
  component: () => <ScopeGate scope="labs"><Lab3DPage /></ScopeGate>,
  head: () => ({
    meta: [
      { title: "3D AI Lab — Ask A Tutor Live" },
      { name: "description", content: "Turn any learning prompt into a live 3D simulation. Save and remix your reusable knowledge universe." },
    ],
  }),
});

type LibraryItem = {
  id: string;
  prompt: string;
  subject: string | null;
  title: string | null;
  thumbnail_url: string | null;
  created_at: string;
  schema_json: SimulationSchemaT;
};

function Lab3DPage() {
  const embedFn = useServerFn(embedPrompt);
  const findFn = useServerFn(findSimilarSimulation);
  const genFn = useServerFn(generateSimulationSchema);
  const saveFn = useServerFn(saveSimulation);
  const listFn = useServerFn(listSimulations);
  const delFn = useServerFn(deleteSimulation);

  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [schema, setSchema] = useState<SimulationSchemaT | null>(null);
  const [playing, setPlaying] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [timeScale, setTimeScale] = useState(1);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState<string>("");
  const [match, setMatch] = useState<LibraryItem | null>(null);
  const [pendingEmbedding, setPendingEmbedding] = useState<number[] | null>(null);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneWrapRef = useRef<HTMLDivElement>(null);

  async function refreshLibrary() {
    try {
      const { simulations } = await listFn({ data: { search: search || undefined, subject: subject || undefined } });
      setLibrary((simulations ?? []) as LibraryItem[]);
    } catch (e: any) {
      // silent
    }
  }

  useEffect(() => { refreshLibrary(); /* eslint-disable-next-line */ }, []);

  async function handleGenerate(forceNew = false) {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    try {
      let embedding: number[] | null = null;
      try {
        const e = await embedFn({ data: { text: prompt } });
        embedding = e.embedding;
      } catch { /* skip similarity */ }

      if (embedding && !forceNew) {
        try {
          const { match: m } = await findFn({ data: { embedding, minSimilarity: 0.85 } });
          if (m) {
            setMatch(m as unknown as LibraryItem);
            setPendingEmbedding(embedding);
            setBusy(false);
            return;
          }
        } catch { /* ignore */ }
      }

      const { schema: gen, fallback } = await genFn({ data: { prompt } });
      if (fallback) toast.warning("AI returned an unexpected shape — showing a safe fallback scene.");
      setSchema(gen as SimulationSchemaT);
      setResetKey((k) => k + 1);
      setPlaying(true);

      // capture thumbnail after a short render delay
      setTimeout(async () => {
        let thumb: string | null = null;
        try {
          const gl = glRef.current;
          if (gl) {
            gl.render(gl.getRenderTarget() as any, gl.getRenderTarget() as any); // noop ensure
            thumb = gl.domElement.toDataURL("image/jpeg", 0.5);
            if (thumb && thumb.length > 350_000) thumb = null;
          }
        } catch { thumb = null; }
        try {
          await saveFn({ data: { prompt, schema: gen, embedding, thumbnailDataUrl: thumb } });
          toast.success("Saved to your library");
          refreshLibrary();
        } catch (e: any) {
          toast.error(e?.message ?? "Could not save");
        }
      }, 600);
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function loadFromLibrary(item: LibraryItem) {
    setSchema(item.schema_json);
    setPrompt(item.prompt);
    setResetKey((k) => k + 1);
    setPlaying(true);
  }

  async function loadMatched() {
    if (!match) return;
    setSchema(match.schema_json);
    setResetKey((k) => k + 1);
    setPlaying(true);
    setMatch(null);
    setPendingEmbedding(null);
  }

  async function generateAnyway() {
    if (!match) return;
    setMatch(null);
    const emb = pendingEmbedding;
    setPendingEmbedding(null);
    // bypass similarity check by passing through embedding
    setBusy(true);
    try {
      const { schema: gen, fallback } = await genFn({ data: { prompt } });
      if (fallback) toast.warning("Using a safe fallback scene.");
      setSchema(gen as SimulationSchemaT);
      setResetKey((k) => k + 1);
      setPlaying(true);
      setTimeout(async () => {
        const thumb = glRef.current?.domElement.toDataURL("image/jpeg", 0.5) ?? null;
        await saveFn({ data: { prompt, schema: gen, embedding: emb, thumbnailDataUrl: thumb && thumb.length < 350_000 ? thumb : null } });
        refreshLibrary();
      }, 600);
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(id: string) {
    if (!confirm("Delete this simulation?")) return;
    try {
      await delFn({ data: { id } });
      setLibrary((l) => l.filter((x) => x.id !== id));
    } catch (e: any) {
      toast.error(e?.message ?? "Delete failed");
    }
  }

  async function goFullscreen() {
    if (!sceneWrapRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await sceneWrapRef.current.requestFullscreen();
  }

  const subjects = Array.from(new Set(library.map((l) => l.subject).filter(Boolean))) as string[];

  return (
    <div className="flex h-screen flex-col bg-[#0b1020] text-white">
      <Navbar />
      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[300px_1fr_320px]">
        {/* LEFT — prompt */}
        <aside className="hidden flex-col gap-3 border-r border-white/5 bg-black/30 p-4 md:flex">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-violet-400" /> 3D AI Lab
          </div>
          <p className="text-xs text-white/60">Describe a scenario or question and the AI will build a live 3D simulation.</p>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A 1200kg car hits a wall at 20 m/s — show Newton's 2nd law"
            className="min-h-[140px] resize-none bg-black/40 text-white placeholder:text-white/40"
          />
          <Button onClick={() => handleGenerate(false)} disabled={busy || !prompt.trim()} className="w-full">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate
          </Button>
          {schema && (
            <div className="rounded border border-white/10 bg-black/30 p-2 text-[11px] text-white/70">
              <div className="font-semibold text-white">{schema.title}</div>
              <div>Subject: {schema.subject}</div>
              <div>Objects: {schema.objects.length}</div>
              <div>Rules: {schema.rules.join(", ") || "—"}</div>
            </div>
          )}
        </aside>

        {/* CENTER — scene */}
        <main ref={sceneWrapRef} className="relative overflow-hidden">
          <SimScene
            schema={schema}
            playing={playing}
            resetKey={resetKey}
            timeScale={timeScale}
            onCanvasReady={(gl) => { glRef.current = gl; }}
          />
          {/* mobile prompt */}
          <div className="absolute left-3 right-3 top-3 z-10 flex gap-2 md:hidden">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a scenario…"
              className="bg-black/60 text-white placeholder:text-white/50"
            />
            <Button size="sm" onClick={() => handleGenerate(false)} disabled={busy || !prompt.trim()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </Button>
          </div>
          {/* controls */}
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-2 backdrop-blur">
            <Button size="icon" variant="ghost" onClick={() => setPlaying((p) => !p)} className="h-8 w-8 text-white hover:bg-white/10">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setResetKey((k) => k + 1)} className="h-8 w-8 text-white hover:bg-white/10">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <input
              type="range" min={0} max={3} step={0.1}
              value={timeScale}
              onChange={(e) => setTimeScale(parseFloat(e.target.value))}
              className="w-32 accent-violet-400"
              aria-label="Time scale"
            />
            <span className="text-[10px] text-white/60">{timeScale.toFixed(1)}×</span>
            <Button size="icon" variant="ghost" onClick={goFullscreen} className="h-8 w-8 text-white hover:bg-white/10">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
          {!schema && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
              <div className="rounded-2xl border border-white/10 bg-black/40 px-6 py-4 text-white/70 backdrop-blur">
                <Sparkles className="mx-auto mb-2 h-6 w-6 text-violet-400" />
                <div className="text-sm">Describe a scenario to build a live 3D simulation.</div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT — library */}
        <aside className="hidden flex-col border-l border-white/5 bg-black/30 md:flex">
          <div className="border-b border-white/5 p-3">
            <div className="mb-2 text-sm font-semibold">Library</div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && refreshLibrary()}
                onBlur={refreshLibrary}
                placeholder="Search title…"
                className="h-8 bg-black/40 pl-7 text-xs text-white placeholder:text-white/40"
              />
            </div>
            {subjects.length > 0 && (
              <select
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setTimeout(refreshLibrary, 0); }}
                className="mt-2 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs"
              >
                <option value="">All subjects</option>
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {library.length === 0 ? (
              <div className="p-6 text-center text-xs text-white/50">No simulations yet</div>
            ) : (
              library.map((it) => (
                <div key={it.id} className="group mb-2 flex gap-2 rounded border border-white/10 bg-black/30 p-2 hover:border-violet-400/50">
                  <button onClick={() => loadFromLibrary(it)} className="flex flex-1 items-start gap-2 text-left">
                    {it.thumbnail_url ? (
                      <img src={it.thumbnail_url} alt="" className="h-12 w-16 rounded object-cover" />
                    ) : (
                      <div className="h-12 w-16 rounded bg-gradient-to-br from-violet-500/40 to-cyan-500/40" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold">{it.title || it.prompt.slice(0, 40)}</div>
                      <div className="truncate text-[10px] text-white/50">{it.subject ?? "—"}</div>
                    </div>
                  </button>
                  <button onClick={() => removeItem(it.id)} className="opacity-0 transition-opacity group-hover:opacity-100" aria-label="Delete">
                    <Trash2 className="h-3.5 w-3.5 text-white/60 hover:text-red-400" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      <Dialog open={!!match} onOpenChange={(o) => !o && setMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Similar simulation found</DialogTitle>
            <DialogDescription>
              "{match?.title}" looks similar to your prompt. Load it, or generate a brand-new simulation?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={generateAnyway}>Generate new</Button>
            <Button onClick={loadMatched}>Load existing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
