import { useEffect, useMemo, useRef, useState } from "react";
import { Tldraw, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import * as Y from "yjs";
import { Play, Pause, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useTldrawYjsBinding } from "../collaboration/useTldrawYjsBinding";

const fromB64 = (b: string) => {
  const bin = atob(b);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
};

interface DeltaRow {
  t_offset_ms: number;
  delta_data: { u: string };
}

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

const SPEEDS = [1, 1.5, 2, 4];

export function PlaybackPlayer({ sessionId }: { sessionId: string }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [deltas, setDeltas] = useState<DeltaRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentMs, setCurrentMs] = useState(0);
  const [docVersion, setDocVersion] = useState(0); // force re-mount when scrubbing back
  const doc = useMemo(() => new Y.Doc(), [docVersion]);

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const appliedIdxRef = useRef(0);

  useTldrawYjsBinding(editor, doc);

  // Lock canvas to read-only
  useEffect(() => {
    if (!editor) return;
    editor.updateInstanceState({ isReadonly: true });
  }, [editor]);

  // Fetch deltas
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("canvas_timeline_deltas")
        .select("t_offset_ms, delta_data")
        .eq("session_id", sessionId)
        .order("t_offset_ms", { ascending: true });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      setDeltas((data as DeltaRow[]) ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const totalMs = deltas && deltas.length ? deltas[deltas.length - 1].t_offset_ms : 0;

  // Apply all deltas up to a given time (used after rewind)
  const applyUpTo = (targetMs: number) => {
    if (!deltas) return;
    while (appliedIdxRef.current < deltas.length && deltas[appliedIdxRef.current].t_offset_ms <= targetMs) {
      const row = deltas[appliedIdxRef.current];
      try {
        Y.applyUpdate(doc, fromB64(row.delta_data.u));
      } catch (e) {
        console.error("[playback] applyUpdate failed", e);
      }
      appliedIdxRef.current++;
    }
  };

  // Playback loop
  useEffect(() => {
    if (!playing || !deltas) return;
    lastTickRef.current = performance.now();
    const tick = (now: number) => {
      const dt = (now - lastTickRef.current) * speed;
      lastTickRef.current = now;
      const next = currentMsRef.current + dt;
      currentMsRef.current = next;
      applyUpTo(next);
      setCurrentMs(next);
      if (next >= totalMs && appliedIdxRef.current >= deltas.length) {
        setPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, deltas, speed, totalMs]);

  const currentMsRef = useRef(0);
  useEffect(() => {
    currentMsRef.current = currentMs;
  }, [currentMs]);

  const restart = () => {
    setPlaying(false);
    appliedIdxRef.current = 0;
    currentMsRef.current = 0;
    setCurrentMs(0);
    setDocVersion((v) => v + 1); // fresh empty Y.Doc → empty canvas
  };

  const scrub = (val: number) => {
    if (!deltas) return;
    // If scrubbing back, reset doc and replay from 0
    if (val < currentMsRef.current) {
      appliedIdxRef.current = 0;
      setDocVersion((v) => v + 1);
      // Defer apply to next render so binding uses new doc
      requestAnimationFrame(() => {
        applyUpTo(val);
        currentMsRef.current = val;
        setCurrentMs(val);
      });
    } else {
      applyUpTo(val);
      currentMsRef.current = val;
      setCurrentMs(val);
    }
  };

  if (error) {
    return <div className="p-6 text-sm text-destructive">Failed to load recording: {error}</div>;
  }
  if (!deltas) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading recording…
      </div>
    );
  }
  if (deltas.length === 0) {
    return <div className="p-6 text-sm text-muted-foreground">No deltas saved for this recording.</div>;
  }

  return (
    <div className="relative h-full w-full">
      <Tldraw key={docVersion} persistenceKey={undefined} onMount={(ed) => setEditor(ed)} />
      <div className="pointer-events-auto absolute bottom-4 left-1/2 z-50 flex w-[min(640px,92vw)] -translate-x-1/2 items-center gap-3 rounded-full border bg-background/95 px-4 py-2 shadow-lg backdrop-blur">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={restart} aria-label="Restart">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <span className="w-12 text-right font-mono text-xs tabular-nums">{fmt(currentMs)}</span>
        <Slider
          value={[Math.min(currentMs, totalMs)]}
          min={0}
          max={Math.max(totalMs, 1)}
          step={50}
          onValueChange={(v) => scrub(v[0])}
          className="flex-1"
        />
        <span className="w-12 font-mono text-xs tabular-nums text-muted-foreground">{fmt(totalMs)}</span>
        <div className="flex items-center gap-1 border-l pl-2">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                speed === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
