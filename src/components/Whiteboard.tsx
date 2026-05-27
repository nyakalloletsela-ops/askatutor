import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Pen,
  Eraser,
  Trash2,
  ChevronUp,
  ChevronDown,
  Undo2,
  Redo2,
  Lock,
  Type,
  Square,
  Circle,
  Minus,
  Grid3X3,
  Sparkles,
  Settings2,
  MousePointer2,
} from "lucide-react";
import { toast } from "sonner";

type Pt = { x: number; y: number };

type ToolMode = "pen" | "eraser" | "text" | "line" | "rect" | "circle" | "graph";

type Stroke = {
  type: "stroke";
  page: number;
  points: Pt[];
  color: string;
  size: number;
  mode: "pen" | "eraser";
  id: string;
};

type Shape = {
  type: "shape";
  shapeType: "line" | "rect" | "circle" | "graph";
  page: number;
  start: Pt;
  end: Pt;
  color: string;
  size: number;
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

type AnyItem = Stroke | TextItem | Shape;
type Msg =
  | AnyItem
  | { type: "clear"; page?: number }
  | { type: "undo"; id: string }
  | { type: "restore"; stroke: AnyItem }
  | { type: "perm"; studentCanDraw: boolean };

const COLORS = ["#0f172a", "#dc2626", "#2563eb", "#16a34a", "#9333ea"];
const PAGE_COUNT = 50;

interface Props {
  roomId: string;
  userId: string;
  isHost?: boolean;
}

export function Whiteboard({ roomId, userId, isHost = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Drawing State
  const [mode, setMode] = useState<ToolMode>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentCanDraw, setStudentCanDraw] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // History & Undo/Redo
  const historyRef = useRef<AnyItem[]>([]);
  const myUndoStackRef = useRef<AnyItem[]>([]);
  const myRedoStackRef = useRef<AnyItem[]>([]);
  const [undoTick, setUndoTick] = useState(0);

  // Interaction State
  const drawingRef = useRef<{ active: boolean; page: number; start: Pt; current: Pt; id: string }>({
    active: false,
    page: -1,
    start: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    id: "",
  });
  const pointersRef = useRef<Map<number, Pt>>(new Map());
  const scrollStartRef = useRef<{ scrollTop: number; midY: number }>({ scrollTop: 0, midY: 0 });
  const [textEditor, setTextEditor] = useState<{ page: number; x: number; y: number; value: string } | null>(null);

  const canDraw = isHost || studentCanDraw;

  // ── Canvas Rendering Engine ────────────────────────────────

  const renderGraph = (ctx: CanvasRenderingContext2D, center: Pt, end: Pt, color: string) => {
    const radius = Math.abs(end.x - center.x);
    const step = 20;
    ctx.beginPath();
    ctx.strokeStyle = `${color}44`; // Faded grid
    ctx.lineWidth = 1;

    // Draw Grid
    for (let x = center.x - radius; x <= center.x + radius; x += step) {
      ctx.moveTo(x, center.y - radius);
      ctx.lineTo(x, center.y + radius);
    }
    for (let y = center.y - radius; y <= center.y + radius; y += step) {
      ctx.moveTo(center.x - radius, y);
      ctx.lineTo(center.x + radius, y);
    }
    ctx.stroke();

    // Draw Axes
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.moveTo(center.x - radius, center.y);
    ctx.lineTo(center.x + radius, center.y);
    ctx.moveTo(center.x, center.y - radius);
    ctx.lineTo(center.x, center.y + radius);
    ctx.stroke();
  };

  const renderItem = (item: AnyItem, context?: CanvasRenderingContext2D) => {
    const ctx = context || canvasRefs.current[item.page]?.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = item.type === "stroke" && item.mode === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = item.color;
    ctx.fillStyle = item.color;
    ctx.lineWidth = item.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (item.type === "stroke") {
      if (item.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(item.points[0].x, item.points[0].y);
      for (let i = 1; i < item.points.length; i++) {
        ctx.lineTo(item.points[i].x, item.points[i].y);
      }
      ctx.stroke();
    } else if (item.type === "shape") {
      const { start, end, shapeType } = item;
      ctx.beginPath();
      if (shapeType === "line") {
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      } else if (shapeType === "rect") {
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (shapeType === "circle") {
        const r = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        ctx.arc(start.x, start.y, r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (shapeType === "graph") {
        renderGraph(ctx, start, end, item.color);
      }
    } else if (item.type === "text") {
      const fontPx = Math.max(12, item.size * 5);
      ctx.font = `500 ${fontPx}px 'Fira Code', monospace`;
      ctx.textBaseline = "top";
      const lines = item.text.split("\n");
      lines.forEach((line, i) => ctx.fillText(line, item.x, item.y + i * fontPx * 1.2));
    }
  };

  const redrawPage = (page: number) => {
    const c = canvasRefs.current[page];
    const ctx = c?.getContext("2d");
    if (!ctx || !c) return;
    ctx.clearRect(0, 0, c.width, c.height);
    historyRef.current.filter((s) => s.page === page).forEach((item) => renderItem(item, ctx));
  };

  // ── AI Handlers ───────────────────────────────────────────

  const handleAIConversion = async () => {
    const pageIdx = currentPage - 1;
    const canvas = canvasRefs.current[pageIdx];
    if (!canvas) return;

    setIsProcessingAI(true);
    toast.info("AI Analyzing physics/math strokes...", { duration: 2000 });

    try {
      // 1. Capture Canvas
      const dataUrl = canvas.toDataURL("image/png");

      // 2. Mock API Call (e.g., to GPT-4o-vision or MathPix)
      await new Promise((res) => setTimeout(res, 1500));

      // Mock result: finding a messy 'F=ma' and turning it into clean text
      const mockResult = "F = m \u00B7 a\n\u03A3F = 0";

      // 3. Transform: Clear page and replace with clean text
      const cleanItem: TextItem = {
        type: "text",
        page: pageIdx,
        x: canvas.width / 4 / (window.devicePixelRatio || 1),
        y: canvas.height / 4 / (window.devicePixelRatio || 1),
        text: mockResult,
        color: color,
        size: 8,
        id: `ai-${Date.now()}`,
      };

      // In a real scenario, we might only delete strokes and keep existing shapes
      // For this demo, we append the clean version
      historyRef.current.push(cleanItem);
      sendItem(cleanItem);
      redrawPage(pageIdx);

      toast.success("Converted to Smart Notation");
    } catch (err) {
      toast.error("AI Conversion failed");
    } finally {
      setIsProcessingAI(false);
    }
  };

  // ── Input Handling ────────────────────────────────────────

  const getLocalPos = (canvas: HTMLCanvasElement, e: React.PointerEvent): Pt => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2) {
      drawingRef.current.active = false;
      const ys = [...pointersRef.current.values()].map((p) => p.y);
      scrollStartRef.current = {
        scrollTop: containerRef.current?.scrollTop ?? 0,
        midY: ys.reduce((a, b) => a + b, 0) / ys.length,
      };
      return;
    }

    if (!canDraw) return;
    const pos = getLocalPos(canvasRefs.current[page]!, e);

    if (mode === "text") {
      setTextEditor({ page, x: pos.x, y: pos.y, value: "" });
      return;
    }

    drawingRef.current = {
      active: true,
      page,
      start: pos,
      current: pos,
      id: `${userId}-${Date.now()}`,
    };
  };

  const onPointerMove = (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2) {
      const ys = [...pointersRef.current.values()].map((p) => p.y);
      const midY = ys.reduce((a, b) => a + b, 0) / ys.length;
      if (containerRef.current)
        containerRef.current.scrollTop = scrollStartRef.current.scrollTop - (midY - scrollStartRef.current.midY);
      return;
    }

    if (!drawingRef.current.active || drawingRef.current.page !== page) return;

    const pos = getLocalPos(canvasRefs.current[page]!, e);
    const ctx = canvasRefs.current[page]!.getContext("2d")!;

    if (mode === "pen" || mode === "eraser") {
      const lastPt = drawingRef.current.current;
      renderItem(
        {
          type: "stroke",
          page,
          points: [lastPt, pos],
          color: color,
          size: size,
          mode: mode as any,
          id: "temp",
        },
        ctx,
      );
      drawingRef.current.current = pos;
      // For real-time strokes, we usually collect points
      const currentHistory = myUndoStackRef.current.find((i) => i.id === drawingRef.current.id) as Stroke;
      if (currentHistory) currentHistory.points.push(pos);
      else {
        const newStroke: Stroke = {
          type: "stroke",
          page,
          points: [drawingRef.current.start, pos],
          color,
          size,
          mode: mode as any,
          id: drawingRef.current.id,
        };
        myUndoStackRef.current.push(newStroke);
      }
    } else {
      // Shape Preview (Visual only, cleared on redraw)
      redrawPage(page);
      renderItem(
        {
          type: "shape",
          shapeType: mode as any,
          page,
          start: drawingRef.current.start,
          end: pos,
          color,
          size,
          id: "preview",
        },
        ctx,
      );
    }
  };

  const onPointerUp = (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (!drawingRef.current.active) return;

    const pos = getLocalPos(canvasRefs.current[page]!, e);
    let finalItem: AnyItem | null = null;

    if (mode === "pen" || mode === "eraser") {
      finalItem = myUndoStackRef.current.find((i) => i.id === drawingRef.current.id) || null;
    } else if (["line", "rect", "circle", "graph"].includes(mode)) {
      finalItem = {
        type: "shape",
        shapeType: mode as any,
        page,
        start: drawingRef.current.start,
        end: pos,
        color,
        size,
        id: drawingRef.current.id,
      };
    }

    if (finalItem) {
      historyRef.current.push(finalItem);
      sendItem(finalItem);
      redrawPage(page);
    }

    drawingRef.current.active = false;
  };

  // ── Database / Broadcast Helpers ───────────────────────────

  const sendItem = (item: AnyItem) => {
    myUndoStackRef.current.push(item);
    myRedoStackRef.current = [];
    setUndoTick((t) => t + 1);
    channelRef.current?.send({ type: "broadcast", event: "draw", payload: item });

    supabase
      .from("whiteboard_strokes")
      .insert({
        room_id: roomId,
        stroke_id: item.id,
        user_id: userId,
        page: item.page,
        data: item as any,
      })
      .then();
  };

  useEffect(() => {
    const channel = supabase.channel(`whiteboard:${roomId}`);
    channel
      .on("broadcast", { event: "draw" }, ({ payload }) => {
        const m = payload as any;
        if (m.type === "clear") {
          historyRef.current = m.page === undefined ? [] : historyRef.current.filter((i) => i.page !== m.page);
          canvasRefs.current.forEach((_, i) => redrawPage(i));
        } else if (m.type === "perm") {
          setStudentCanDraw(m.studentCanDraw);
        } else {
          historyRef.current.push(m);
          renderItem(m);
        }
      })
      .subscribe();
    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
    };
  }, [roomId]);

  // ── Layout Components ─────────────────────────────────────

  const ToolButton = ({ m, icon: Icon, label }: { m: ToolMode; icon: any; label: string }) => (
    <Button
      size="sm"
      variant={mode === m ? "default" : "ghost"}
      onClick={() => setMode(m)}
      className="flex-1 md:flex-none justify-start px-2 md:px-3"
    >
      <Icon className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline text-xs">{label}</span>
    </Button>
  );

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden text-foreground">
      {/* Top Header - Desktop/Tablet */}
      <header className="z-20 flex items-center justify-between border-b bg-background/95 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none">Smart Whiteboard</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Physics & Math Pro
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isHost && (
            <div className="flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1">
              <span className="text-[11px] font-medium">{studentCanDraw ? "Class Open" : "Lecture Mode"}</span>
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
          <Button
            variant="default"
            size="sm"
            className="hidden md:flex gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700"
            onClick={handleAIConversion}
            disabled={isProcessingAI}
          >
            {isProcessingAI ? <Settings2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            AI Convert
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar Tools - Desktop */}
        <aside className="hidden md:flex w-16 flex-col items-center gap-4 border-r bg-muted/20 py-4">
          <div className="flex flex-col gap-2">
            {(["pen", "eraser", "text", "line", "rect", "circle", "graph"] as ToolMode[]).map((t) => (
              <Button
                key={t}
                size="icon"
                variant={mode === t ? "default" : "ghost"}
                onClick={() => setMode(t)}
                className="h-10 w-10"
              >
                {t === "pen" && <Pen className="h-5 w-5" />}
                {t === "eraser" && <Eraser className="h-5 w-5" />}
                {t === "text" && <Type className="h-5 w-5" />}
                {t === "line" && <Minus className="h-5 w-5" />}
                {t === "rect" && <Square className="h-5 w-5" />}
                {t === "circle" && <Circle className="h-5 w-5" />}
                {t === "graph" && <Grid3X3 className="h-5 w-5" />}
              </Button>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-3 pb-4">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full ring-offset-2 ${color === c ? "ring-2 ring-primary" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </aside>

        {/* Scrollable Canvas Area */}
        <main ref={containerRef} className="flex-1 overflow-y-auto bg-slate-100 p-4 md:p-8 space-y-8 scroll-smooth">
          {Array.from({ length: PAGE_COUNT }).map((_, i) => (
            <div key={i} className="relative mx-auto max-w-4xl shadow-2xl transition-transform hover:scale-[1.01]">
              <div className="absolute -left-12 top-0 hidden lg:block text-slate-400 font-mono text-sm">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-white shadow-sm sm:aspect-video md:aspect-[4/3]">
                <canvas
                  ref={(el) => {
                    canvasRefs.current[i] = el;
                    if (el) {
                      const dpr = window.devicePixelRatio || 1;
                      const rect = el.getBoundingClientRect();
                      if (el.width !== Math.floor(rect.width * dpr)) {
                        el.width = rect.width * dpr;
                        el.height = rect.height * dpr;
                        const ctx = el.getContext("2d");
                        if (ctx) ctx.scale(dpr, dpr);
                        redrawPage(i);
                      }
                    }
                  }}
                  className={`h-full w-full touch-none ${!canDraw ? "cursor-not-allowed" : mode === "text" ? "cursor-text" : "cursor-crosshair"}`}
                  onPointerDown={onPointerDown(i)}
                  onPointerMove={onPointerMove(i)}
                  onPointerUp={onPointerUp(i)}
                />
                {textEditor && textEditor.page === i && (
                  <textarea
                    autoFocus
                    className="absolute z-30 min-w-[120px] bg-transparent outline-none border-b border-primary resize-none font-mono"
                    style={{ left: textEditor.x, top: textEditor.y, color, fontSize: size * 4 }}
                    value={textEditor.value}
                    onChange={(e) => setTextEditor({ ...textEditor, value: e.target.value })}
                    onBlur={() => {
                      if (textEditor.value.trim()) {
                        const item: TextItem = {
                          type: "text",
                          page: i,
                          x: textEditor.x,
                          y: textEditor.y,
                          text: textEditor.value,
                          color,
                          size,
                          id: `t-${Date.now()}`,
                        };
                        historyRef.current.push(item);
                        sendItem(item);
                        redrawPage(i);
                      }
                      setTextEditor(null);
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </main>
      </div>

      {/* Mobile Toolbar - Bottom Fixed */}
      <div className="md:hidden border-t bg-background p-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <ToolButton m="pen" icon={Pen} label="Pen" />
          <ToolButton m="line" icon={Minus} label="Line" />
          <ToolButton m="rect" icon={Square} label="Rect" />
          <ToolButton m="graph" icon={Grid3X3} label="Graph" />
          <Button size="sm" variant="secondary" className="px-2" onClick={handleAIConversion}>
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              const p = currentPage - 1;
              historyRef.current = historyRef.current.filter((i) => i.page !== p);
              redrawPage(p);
              channelRef.current?.send({ type: "broadcast", event: "draw", payload: { type: "clear", page: p } });
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Floating Pagination & Quick Actions */}
      <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-full border bg-background/90 p-1 shadow-lg backdrop-blur">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={() => {
              const next = Math.max(1, currentPage - 1);
              containerRef.current?.children[next - 1]?.scrollIntoView();
              setCurrentPage(next);
            }}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className="text-[10px] font-bold w-8 text-center">{currentPage}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={() => {
              const next = Math.min(PAGE_COUNT, currentPage + 1);
              containerRef.current?.children[next - 1]?.scrollIntoView();
              setCurrentPage(next);
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
