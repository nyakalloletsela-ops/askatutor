import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Pen, Eraser, Trash2, Undo2, Redo2, Lock, Type, Sigma, Wand2, ChevronLeft, ChevronRight } from "lucide-react";
import { MathTools } from "@/components/MathTools";
import { useServerFn } from "@tanstack/react-start";
import { whiteboardConvert } from "@/lib/whiteboard-ai.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Pt = { x: number; y: number };
type Stroke = {
  type: "stroke";
  page: number;
  points: Pt[];
  color: string;
  size: number;
  mode: "pen" | "eraser";
  id: string;
};
type TextItem = {
  type: "text";
  page: number;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  id: string;
};
type ImageItem = {
  type: "image";
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  src: string;
  id: string;
};
type AnyItem = Stroke | TextItem | ImageItem;

type Msg =
  | AnyItem
  | { type: "clear"; page?: number }
  | { type: "undo"; id: string }
  | { type: "restore"; stroke: AnyItem }
  | { type: "update"; id: string; x: number; y: number; w?: number; h?: number }
  | { type: "perm"; studentCanDraw: boolean };

const COLORS = ["#0f172a", "#dc2626", "#2563eb", "#16a34a"];
const PAGE_COUNT = 5; // Managed directly for canvas rendering loops

export function Whiteboard({ roomId, userId, isHost = false }: { roomId: string; userId: string; isHost?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Changing history into a true state variable alongside a ref replica
  // allows internal drawing updates to remain ultra-fast while ensuring text/render layers re-evaluate.
  const [history, setHistory] = useState<AnyItem[]>([]);
  const historyRef = useRef<AnyItem[]>([]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(3);
  const [mode, setMode] = useState<"pen" | "eraser" | "text">("pen");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentCanDraw, setStudentCanDraw] = useState(false);
  const [mathOpen, setMathOpen] = useState(false);

  const [textEditor, setTextEditor] = useState<{
    page: number;
    x: number;
    y: number;
    value: string;
    editingId?: string;
  } | null>(null);

  const canDraw = isHost || studentCanDraw;
  const drawingRef = useRef({ active: false, page: -1, points: [] as Pt[], id: "" });

  const redrawPage = useCallback((page: number) => {
    const canvas = canvasRefs.current[page];
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    historyRef.current
      .filter((it): it is Stroke => it.page === page && it.type === "stroke")
      .forEach((s) => {
        ctx.save();
        ctx.globalCompositeOperation = s.mode === "eraser" ? "destination-out" : "source-over";
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        s.points.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
        ctx.restore();
      });
  }, []);

  const sizeCanvas = useCallback(
    (canvas: HTMLCanvasElement, pageIndex: number) => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx?.scale(dpr, dpr);
      redrawPage(pageIndex);
    },
    [redrawPage],
  );

  // Handle window resizing safely to avoid broken coordinate references
  useEffect(() => {
    const handleResize = () => {
      canvasRefs.current.forEach((canvas, idx) => {
        if (canvas) sizeCanvas(canvas, idx);
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sizeCanvas]);

  useEffect(() => {
    const channel = supabase.channel(`whiteboard:${roomId}`);
    channel
      .on("broadcast", { event: "draw" }, ({ payload }) => {
        const m = payload as Msg;
        if ("type" in m && m.type === "perm") {
          setStudentCanDraw(m.studentCanDraw);
        } else if ("type" in m && m.type === "clear") {
          setHistory((prev) => {
            const updated = m.page === undefined ? [] : prev.filter((h) => h.page !== m.page);
            // Queue microtask to let historical data state apply cleanly before firing rendering loop
            setTimeout(() => {
              m.page === undefined ? canvasRefs.current.forEach((_, idx) => redrawPage(idx)) : redrawPage(m.page);
            }, 0);
            return updated;
          });
        } else {
          if ("id" in m) {
            setHistory((prev) => {
              const idx = prev.findIndex((h) => h.id === m.id);
              let updated = [...prev];
              if (idx > -1) updated[idx] = m as AnyItem;
              else updated.push(m as AnyItem);

              if (m.type === "stroke") {
                setTimeout(() => redrawPage(m.page), 0);
              }
              return updated;
            });
          }
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, redrawPage]);

  const onPointerDown = (page: number) => (e: React.PointerEvent) => {
    if (!canDraw) return;

    const rect = canvasRefs.current[page]!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === "text") {
      setTextEditor({ page, x, y, value: "" });
      return;
    }

    drawingRef.current = {
      active: true,
      page,
      points: [{ x, y }],
      id: `${userId}-${Date.now()}`,
    };
  };

  const onPointerMove = (page: number) => (e: React.PointerEvent) => {
    if (!drawingRef.current.active || drawingRef.current.page !== page) return;

    const rect = canvasRefs.current[page]!.getBoundingClientRect();
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const prev = drawingRef.current.points[drawingRef.current.points.length - 1];
    drawingRef.current.points.push(p);

    const ctx = canvasRefs.current[page]!.getContext("2d")!;
    ctx.save();
    ctx.globalCompositeOperation = mode === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.restore();
  };

  const onPointerUp = () => {
    if (!drawingRef.current.active) return;
    const item: Stroke = {
      type: "stroke",
      page: drawingRef.current.page,
      points: [...drawingRef.current.points],
      id: drawingRef.current.id,
      color,
      size,
      mode: mode as "pen" | "eraser",
    };

    setHistory((prev) => [...prev, item]);
    channelRef.current?.send({ type: "broadcast", event: "draw", payload: item });
    drawingRef.current.active = false;
  };

  return (
    <div className="flex h-full flex-col bg-background" onPointerUp={onPointerUp}>
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 p-2">
        <div className="flex rounded-md border bg-background p-1">
          <Button size="sm" variant={mode === "pen" ? "default" : "ghost"} onClick={() => setMode("pen")}>
            <Pen className="h-4 w-4" />
          </Button>
          <Button size="sm" variant={mode === "eraser" ? "default" : "ghost"} onClick={() => setMode("eraser")}>
            <Eraser className="h-4 w-4" />
          </Button>
          <Button size="sm" variant={mode === "text" ? "default" : "ghost"} onClick={() => setMode("text")}>
            <Type className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn("h-6 w-6 rounded-full border", color === c && "ring-2 ring-primary")}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 px-2 border-l">
          <Slider value={[size]} min={1} max={20} onValueChange={([v]) => setSize(v)} className="w-24" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {isHost && (
            <div className="flex items-center gap-2 text-xs font-medium mr-4">
              <Lock className="h-3 w-3" /> Student Draw
              <Switch
                checked={studentCanDraw}
                onCheckedChange={(v) => {
                  setStudentCanDraw(v);
                  channelRef.current?.send({
                    type: "broadcast",
                    event: "draw",
                    payload: { type: "perm", studentCanDraw: v },
                  });
                }}
              />
            </div>
          )}
          <Button size="sm" variant="outline" onClick={() => setMathOpen(true)}>
            <Sigma className="mr-1 h-4 w-4" /> Math
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setHistory((prev) => prev.filter((h) => h.page !== currentPage - 1));
              setTimeout(() => redrawPage(currentPage - 1), 0);
              channelRef.current?.send({
                type: "broadcast",
                event: "draw",
                payload: { type: "clear", page: currentPage - 1 },
              });
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto bg-muted/20 p-4">
        {Array.from({ length: PAGE_COUNT }).map((_, i) => (
          <div
            key={i}
            className="relative mx-auto mb-8 bg-white shadow-lg border rounded-sm"
            style={{ width: "800px", height: "1100px" }}
          >
            <canvas
              ref={(el) => {
                if (el && canvasRefs.current[i] !== el) {
                  canvasRefs.current[i] = el;
                  sizeCanvas(el, i);
                }
              }}
              onPointerDown={onPointerDown(i)}
              onPointerMove={onPointerMove(i)}
              className="absolute inset-0 h-full w-full touch-none"
            />
            {textEditor && textEditor.page === i && (
              <div
                className="absolute z-10 p-2 bg-white border shadow-xl rounded"
                style={{ left: textEditor.x, top: textEditor.y }}
              >
                <textarea
                  autoFocus
                  className="p-1 border-none outline-none min-w-[100px] resize"
                  value={textEditor.value}
                  onChange={(e) => setTextEditor({ ...textEditor, value: e.target.value })}
                  onBlur={() => {
                    if (textEditor.value.trim()) {
                      const item: TextItem = {
                        type: "text",
                        page: textEditor.page,
                        x: textEditor.x,
                        y: textEditor.y,
                        text: textEditor.value,
                        color,
                        size: 16,
                        id: `text-${Date.now()}`,
                      };
                      setHistory((prev) => [...prev, item]);
                      channelRef.current?.send({ type: "broadcast", event: "draw", payload: item });
                    }
                    setTextEditor(null);
                  }}
                />
              </div>
            )}
            <div className="absolute top-2 right-2 text-[10px] text-muted-foreground uppercase selection:bg-transparent select-none">
              Page {i + 1}
            </div>

            {/* Text rendering layer triggers automatically upon structural changes to synchronized layout elements */}
            {history
              .filter((it): it is TextItem => it.type === "text" && it.page === i)
              .map((it) => (
                <div
                  key={it.id}
                  className="absolute pointer-events-none whitespace-pre select-none"
                  style={{ left: it.x, top: it.y, color: it.color, fontSize: it.size }}
                >
                  {it.text}
                </div>
              ))}
          </div>
        ))}
      </div>
      <MathTools open={mathOpen} onClose={() => setMathOpen(false)} />
    </div>
  );
}
