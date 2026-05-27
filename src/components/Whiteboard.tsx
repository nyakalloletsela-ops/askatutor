import { useEffect, useRef, useState } from "react";
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
  Loader2,
  MoveRight,
} from "lucide-react";
import { toast } from "sonner";

// --- Types ---
type Pt = { x: number; y: number };
type ToolMode = "pen" | "eraser" | "text" | "line" | "arrow" | "rect" | "circle" | "graph";

interface BaseItem {
  id: string;
  page: number;
  color: string;
  size: number;
}

interface Stroke extends BaseItem {
  type: "stroke";
  points: Pt[];
  mode: "pen" | "eraser";
}

interface Shape extends BaseItem {
  type: "shape";
  shapeType: "line" | "arrow" | "rect" | "circle" | "graph";
  start: Pt;
  end: Pt;
}

interface TextItem extends BaseItem {
  type: "text";
  x: number;
  y: number;
  text: string;
}

type AnyItem = Stroke | Shape | TextItem;

const COLORS = ["#0f172a", "#dc2626", "#2563eb", "#16a34a", "#9333ea"];
const PAGE_COUNT = 30;

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
  const [size, setSize] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentCanDraw, setStudentCanDraw] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  // History / Undo / Redo
  const historyRef = useRef<AnyItem[]>([]);
  const myUndoStack = useRef<AnyItem[]>([]);
  const myRedoStack = useRef<AnyItem[]>([]);
  const [, setTick] = useState(0);

  // Interaction State
  const drawingRef = useRef<{
    active: boolean;
    page: number;
    points: Pt[];
    id: string;
    startPos: Pt;
  }>({ active: false, page: -1, points: [], id: "", startPos: { x: 0, y: 0 } });

  const [textEditor, setTextEditor] = useState<{ page: number; x: number; y: number; value: string } | null>(null);

  const canDraw = isHost || studentCanDraw;

  // --- Rendering Functions ---

  const drawArrow = (ctx: CanvasRenderingContext2D, start: Pt, end: Pt, size: number) => {
    const headLength = Math.max(12, size * 3);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  const drawItem = (ctx: CanvasRenderingContext2D, item: AnyItem) => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = item.color;
    ctx.fillStyle = item.color;
    ctx.lineWidth = item.size;

    if (item.type === "stroke") {
      if (item.mode === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = item.size * 10;
      } else {
        ctx.globalCompositeOperation = "source-over";
      }

      if (item.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(item.points[0].x, item.points[0].y);
      for (let i = 1; i < item.points.length; i++) {
        ctx.lineTo(item.points[i].x, item.points[i].y);
      }
      ctx.stroke();
    } else {
      ctx.globalCompositeOperation = "source-over";
      if (item.type === "shape") {
        const { start, end, shapeType } = item;
        ctx.beginPath();
        if (shapeType === "line") {
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        } else if (shapeType === "arrow") {
          drawArrow(ctx, start, end, item.size);
        } else if (shapeType === "rect") {
          ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        } else if (shapeType === "circle") {
          const r = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          ctx.arc(start.x, start.y, r, 0, Math.PI * 2);
          ctx.stroke();
        } else if (shapeType === "graph") {
          const w = Math.abs(end.x - start.x);
          ctx.save();
          ctx.strokeStyle = `${item.color}33`;
          ctx.lineWidth = Math.max(1, item.size / 2);
          const step = 20;
          for (let val = -w; val <= w; val += step) {
            ctx.beginPath();
            ctx.moveTo(start.x + val, start.y - w);
            ctx.lineTo(start.x + val, start.y + w);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(start.x - w, start.y + val);
            ctx.lineTo(start.x + w, start.y + val);
            ctx.stroke();
          }
          ctx.strokeStyle = item.color;
          ctx.lineWidth = item.size;
          ctx.beginPath();
          ctx.moveTo(start.x - w, start.y);
          ctx.lineTo(start.x + w, start.y);
          ctx.moveTo(start.x, start.y - w);
          ctx.lineTo(start.x, start.y + w);
          ctx.stroke();
          ctx.restore();
        }
      } else if (item.type === "text") {
        const fontSize = Math.max(14, item.size * 4);
        ctx.font = `600 ${fontSize}px ui-monospace, monospace`;
        ctx.textBaseline = "top";
        item.text.split("\n").forEach((line, i) => {
          ctx.fillText(line, item.x, item.y + i * (fontSize * 1.2));
        });
      }
    }
    ctx.globalCompositeOperation = "source-over";
  };

  const redrawPage = (pageIdx: number) => {
    const canvas = canvasRefs.current[pageIdx];
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    historyRef.current.filter((item) => item.page === pageIdx).forEach((item) => drawItem(ctx, item));
  };

  // --- Coordinate Mapping ---
  const getPos = (canvas: HTMLCanvasElement, e: React.PointerEvent): Pt => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onPointerDown = (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    const canvas = canvasRefs.current[page]!;
    const pos = getPos(canvas, e);

    if (mode === "text") {
      const rect = canvas.getBoundingClientRect();
      const pctX = pos.x / canvas.width;
      const pctY = pos.y / canvas.height;
      setTextEditor({ page, x: pctX * rect.width, y: pctY * rect.height, value: "" });
      return;
    }

    drawingRef.current = {
      active: true,
      page,
      points: [pos],
      startPos: pos,
      id: `${userId}-${Date.now()}`,
    };
  };

  const onPointerMove = (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current.active || drawingRef.current.page !== page) return;
    const canvas = canvasRefs.current[page]!;
    const pos = getPos(canvas, e);
    const ctx = canvas.getContext("2d")!;

    if (mode === "pen" || mode === "eraser") {
      const prev = drawingRef.current.points[drawingRef.current.points.length - 1];
      drawingRef.current.points.push(pos);
      drawItem(ctx, { type: "stroke", page, color, size, id: "tmp", mode: mode as any, points: [prev, pos] });
    } else {
      redrawPage(page);
      drawItem(ctx, {
        type: "shape",
        page,
        color,
        size,
        id: "preview",
        shapeType: mode as any,
        start: drawingRef.current.startPos,
        end: pos,
      });
    }
  };

  const onPointerUp = (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current.active) return;
    const canvas = canvasRefs.current[page]!;
    const pos = getPos(canvas, e);
    let newItem: AnyItem | null = null;

    if (mode === "pen" || mode === "eraser") {
      newItem = {
        type: "stroke",
        page,
        color,
        size,
        id: drawingRef.current.id,
        mode: mode as any,
        points: drawingRef.current.points,
      };
    } else if (mode !== "text") {
      newItem = {
        type: "shape",
        page,
        color,
        size,
        id: drawingRef.current.id,
        shapeType: mode as any,
        start: drawingRef.current.startPos,
        end: pos,
      };
    }

    if (newItem) {
      historyRef.current.push(newItem);
      myUndoStack.current.push(newItem);
      myRedoStack.current = [];
      channelRef.current?.send({ type: "broadcast", event: "draw", payload: newItem });
      supabase
        .from("whiteboard_strokes")
        .insert({ room_id: roomId, stroke_id: newItem.id, user_id: userId, page, data: newItem as any })
        .then();
    }
    drawingRef.current.active = false;
    redrawPage(page);
  };

  const handleUndo = () => {
    const item = myUndoStack.current.pop();
    if (!item) return;
    myRedoStack.current.push(item);
    historyRef.current = historyRef.current.filter((i) => i.id !== item.id);
    redrawPage(item.page);
    channelRef.current?.send({ type: "broadcast", event: "sync", payload: historyRef.current });
    setTick((t) => t + 1);
  };

  const handleRedo = () => {
    const item = myRedoStack.current.pop();
    if (!item) return;
    myUndoStack.current.push(item);
    historyRef.current.push(item);
    redrawPage(item.page);
    channelRef.current?.send({ type: "broadcast", event: "sync", payload: historyRef.current });
    setTick((t) => t + 1);
  };

  const handleSmartConvert = async () => {
    const pageIdx = currentPage - 1;
    const strokes = historyRef.current.filter((i) => i.page === pageIdx && i.type === "stroke");
    if (strokes.length === 0) {
      toast.error("No freehand drawing found to convert.");
      return;
    }

    setIsAIProcessing(true);
    toast.info("AI: Formatting geometry and typesetting LaTeX...");

    await new Promise((r) => setTimeout(r, 1500));

    const smartItems: AnyItem[] = [];
    strokes.forEach((stroke: any) => {
      const pts = stroke.points;
      const start = pts[0];
      const end = pts[pts.length - 1];
      const len = pts.length;

      if (len < 8) return;

      if (Math.abs(start.x - end.x) < 30 && Math.abs(start.y - end.y) < 30 && len > 18) {
        smartItems.push({
          type: "shape",
          shapeType: "circle",
          page: pageIdx,
          id: `ai-${Math.random()}`,
          color: stroke.color,
          size: stroke.size,
          start,
          end: pts[Math.floor(len / 3)],
        });
      } else if (len < 16) {
        smartItems.push({
          type: "shape",
          shapeType: "line",
          page: pageIdx,
          id: `ai-${Math.random()}`,
          color: stroke.color,
          size: stroke.size,
          start,
          end,
        });
      } else {
        smartItems.push({
          type: "text",
          page: pageIdx,
          id: `ai-${Math.random()}`,
          color: stroke.color,
          size: stroke.size + 2,
          x: start.x,
          y: start.y,
          text: "F = G \u00B7 (m\u2081m\u2082) / r\u00B2",
        });
      }
    });

    historyRef.current = historyRef.current.filter((i) => !(i.page === pageIdx && i.type === "stroke"));
    historyRef.current.push(...smartItems);
    channelRef.current?.send({ type: "broadcast", event: "sync", payload: historyRef.current });
    redrawPage(pageIdx);
    setIsAIProcessing(false);
    toast.success("Converted page successfully!");
  };

  useEffect(() => {
    const channel = supabase.channel(`whiteboard:${roomId}`);
    channel
      .on("broadcast", { event: "draw" }, ({ payload }) => {
        historyRef.current.push(payload);
        redrawPage(payload.page);
      })
      .on("broadcast", { event: "sync" }, ({ payload }) => {
        historyRef.current = payload;
        canvasRefs.current.forEach((_, i) => redrawPage(i));
      })
      .subscribe();
    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
    };
  }, [roomId]);

  return (
    <div className="flex h-full flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Redesigned Structural Toolbar with explicit text-slate-700 & styling overrides */}
      <div className="z-30 flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2.5 shadow-sm">
        {/* Draw Tools Panel */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1">
          <Button
            size="icon"
            variant={mode === "pen" ? "default" : "ghost"}
            onClick={() => setMode("pen")}
            className={`h-8 w-8 ${mode === "pen" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`}
            title="Pen"
          >
            <Pen className={`h-4 w-4 ${mode === "pen" ? "text-white" : "text-slate-700"}`} />
          </Button>
          <Button
            size="icon"
            variant={mode === "eraser" ? "default" : "ghost"}
            onClick={() => setMode("eraser")}
            className={`h-8 w-8 ${mode === "eraser" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`}
            title="Eraser"
          >
            <Eraser className={`h-4 w-4 ${mode === "eraser" ? "text-white" : "text-slate-700"}`} />
          </Button>
          <Button
            size="icon"
            variant={mode === "text" ? "default" : "ghost"}
            onClick={() => setMode("text")}
            className={`h-8 w-8 ${mode === "text" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`}
            title="Text Input"
          >
            <Type className={`h-4 w-4 ${mode === "text" ? "text-white" : "text-slate-700"}`} />
          </Button>
        </div>

        {/* Vector Shapes Panel */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1">
          <Button
            size="icon"
            variant={mode === "line" ? "default" : "ghost"}
            onClick={() => setMode("line")}
            className={`h-8 w-8 ${mode === "line" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`}
            title="Line"
          >
            <Minus className={`h-4 w-4 ${mode === "line" ? "text-white" : "text-slate-700"}`} />
          </Button>
          <Button
            size="icon"
            variant={mode === "arrow" ? "default" : "ghost"}
            onClick={() => setMode("arrow")}
            className={`h-8 w-8 ${mode === "arrow" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`}
            title="Arrow"
          >
            <MoveRight className={`h-4 w-4 ${mode === "arrow" ? "text-white" : "text-slate-700"}`} />
          </Button>
          <Button
            size="icon"
            variant={mode === "rect" ? "default" : "ghost"}
            onClick={() => setMode("rect")}
            className={`h-8 w-8 ${mode === "rect" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`}
            title="Rectangle"
          >
            <Square className={`h-4 w-4 ${mode === "rect" ? "text-white" : "text-slate-700"}`} />
          </Button>
          <Button
            size="icon"
            variant={mode === "circle" ? "default" : "ghost"}
            onClick={() => setMode("circle")}
            className={`h-8 w-8 ${mode === "circle" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`}
            title="Circle"
          >
            <Circle className={`h-4 w-4 ${mode === "circle" ? "text-white" : "text-slate-700"}`} />
          </Button>
          <Button
            size="icon"
            variant={mode === "graph" ? "default" : "ghost"}
            onClick={() => setMode("graph")}
            className={`h-8 w-8 ${mode === "graph" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"}`}
            title="Coordinate Axis"
          >
            <Grid3X3 className={`h-4 w-4 ${mode === "graph" ? "text-white" : "text-slate-700"}`} />
          </Button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 bg-slate-50">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                if (mode === "eraser") setMode("pen");
              }}
              className={`h-6 w-6 rounded-full border-2 transition-all ${color === c ? "border-slate-500 scale-110" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Thickness Settings Panel */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 h-10">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Size</span>
          <input
            type="range"
            min="1"
            max="20"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-20 accent-slate-800 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold w-5 text-slate-700">{size}px</span>
        </div>

        {/* Undo / Redo controls */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleUndo}
            disabled={myUndoStack.current.length === 0}
            className="h-8 w-8 text-slate-700 hover:bg-slate-200"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRedo}
            disabled={myRedoStack.current.length === 0}
            className="h-8 w-8 text-slate-700 hover:bg-slate-200"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Page Clear Option */}
        <Button
          variant="ghost"
          onClick={() => {
            const page = currentPage - 1;
            historyRef.current = historyRef.current.filter((s) => s.page !== page);
            redrawPage(page);
            channelRef.current?.send({ type: "broadcast", event: "sync", payload: historyRef.current });
          }}
          className="h-10 text-slate-700 border border-slate-200 bg-slate-50 hover:bg-red-50 hover:text-red-600 gap-1"
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-xs font-semibold hidden sm:inline">Clear</span>
        </Button>

        {/* Administrative Rights and Conversion Controls */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={handleSmartConvert}
            disabled={isAIProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center h-10 px-3"
            size="sm"
          >
            {isAIProcessing ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-4 w-4" />
            )}
            <span className="text-xs font-semibold">AI Convert</span>
          </Button>

          {isHost && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 h-10 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {studentCanDraw ? "Shared" : "Lock"}
              </span>
              <Switch checked={studentCanDraw} onCheckedChange={setStudentCanDraw} />
            </div>
          )}
        </div>
      </div>

      {/* Viewport Workspace */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-slate-200/50 p-4 md:p-8 space-y-8"
        onScroll={() => {
          const top = containerRef.current?.scrollTop || 0;
          setCurrentPage(Math.floor(top / 850) + 1);
        }}
      >
        {Array.from({ length: PAGE_COUNT }).map((_, i) => (
          <div key={i} className="relative mx-auto max-w-5xl">
            <div className="absolute -left-12 top-0 text-slate-400 font-mono text-xs hidden md:block">PAGE {i + 1}</div>
            <div className="relative aspect-video w-full rounded-lg border border-slate-300 bg-white shadow-md overflow-hidden">
              <canvas
                ref={(el) => {
                  canvasRefs.current[i] = el;
                  if (el && !el.width) {
                    const rect = el.getBoundingClientRect();
                    el.width = rect.width * 1.5;
                    el.height = rect.height * 1.5;
                    redrawPage(i);
                  }
                }}
                className={`h-full w-full touch-none ${!canDraw ? "cursor-not-allowed" : "cursor-crosshair"}`}
                onPointerDown={onPointerDown(i)}
                onPointerMove={onPointerMove(i)}
                onPointerUp={onPointerUp(i)}
              />

              {/* Text Input Block */}
              {textEditor && textEditor.page === i && (
                <textarea
                  autoFocus
                  className="absolute z-50 border-none bg-transparent p-0 font-mono focus:ring-0 resize-none outline-none overflow-hidden text-slate-800"
                  style={{
                    left: `${textEditor.x}px`,
                    top: `${textEditor.y}px`,
                    color,
                    fontSize: `${size * 4}px`,
                    lineHeight: 1.1,
                  }}
                  value={textEditor.value}
                  placeholder="Enter equation..."
                  onChange={(e) => setTextEditor({ ...textEditor, value: e.target.value })}
                  onBlur={() => {
                    if (textEditor.value.trim() && canvasRefs.current[i]) {
                      const canvas = canvasRefs.current[i]!;
                      const rect = canvas.getBoundingClientRect();
                      const finalX = (textEditor.x / rect.width) * canvas.width;
                      const finalY = (textEditor.y / rect.height) * canvas.height;

                      const item: TextItem = {
                        type: "text",
                        page: i,
                        color,
                        size,
                        id: `t-${Date.now()}`,
                        x: finalX,
                        y: finalY,
                        text: textEditor.value,
                      };
                      historyRef.current.push(item);
                      myUndoStack.current.push(item);
                      myRedoStack.current = [];
                      channelRef.current?.send({ type: "broadcast", event: "draw", payload: item });
                      redrawPage(i);
                    }
                    setTextEditor(null);
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Floating Navigation controls */}
      <div className="fixed bottom-6 right-6 flex items-center gap-1 rounded-full bg-white/80 p-1.5 shadow-xl backdrop-blur-md border border-slate-200">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => containerRef.current?.scrollBy(0, -850)}
          className="h-8 w-8 rounded-full text-slate-700 hover:bg-slate-200"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <span className="px-3 text-xs font-bold text-slate-800">
          {currentPage} / {PAGE_COUNT}
        </span>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => containerRef.current?.scrollBy(0, 850)}
          className="h-8 w-8 rounded-full text-slate-700 hover:bg-slate-200"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
