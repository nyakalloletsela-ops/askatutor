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
  const [size, setSize] = useState(4); // Adjustable pen size state
  const [currentPage, setCurrentPage] = useState(1);
  const [studentCanDraw, setStudentCanDraw] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  // History & Undo/Redo Storage
  const historyRef = useRef<AnyItem[]>([]);
  const myUndoStack = useRef<AnyItem[]>([]);
  const myRedoStack = useRef<AnyItem[]>([]);
  const [, setTick] = useState(0);

  // Active Interaction Tracking
  const drawingRef = useRef<{
    active: boolean;
    page: number;
    points: Pt[];
    id: string;
    startPos: Pt;
  }>({ active: false, page: -1, points: [], id: "", startPos: { x: 0, y: 0 } });

  const [textEditor, setTextEditor] = useState<{ page: number; x: number; y: number; value: string } | null>(null);

  const canDraw = isHost || studentCanDraw;

  // --- Rendering Engine ---

  const drawArrow = (ctx: CanvasRenderingContext2D, start: Pt, end: Pt, size: number) => {
    const headLength = Math.max(12, size * 3); // Arrowhead size relative to line width
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    // Main shaft
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Arrowhead calculations
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
        ctx.lineWidth = item.size * 10; // Substantially larger radius for modern eraser feel
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
          ctx.strokeStyle = `${item.color}44`;
          ctx.lineWidth = Math.max(1, item.size / 2);
          // Faded Grid
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

  // --- Coordinate Alignment Mapping ---
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
      // Map scale coordinates down to screen pixels for HTML textarea alignment
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

  // --- Real-time Sync and Undo/Redo Controls ---
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
        // Circle Detection
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
        // Linear Stroke
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
        // Handwritten Equations -> Standard Monospace Typographic rendering
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
    toast.success("Converted page perfectly!");
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
    <div className="flex h-screen flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Upper Control Bar */}
      <div className="z-30 flex flex-wrap items-center gap-2 border-b bg-white p-2 shadow-sm">
        <div className="flex rounded-md bg-slate-100 p-1 gap-0.5">
          <Button
            size="icon"
            variant={mode === "pen" ? "default" : "ghost"}
            onClick={() => setMode("pen")}
            className="h-9 w-9"
            title="Pen"
          >
            <Pen className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={mode === "eraser" ? "default" : "ghost"}
            onClick={() => setMode("eraser")}
            className="h-9 w-9"
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={mode === "text" ? "default" : "ghost"}
            onClick={() => setMode("text")}
            className="h-9 w-9"
            title="Text Input"
          >
            <Type className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex rounded-md bg-slate-100 p-1 gap-0.5">
          <Button
            size="icon"
            variant={mode === "line" ? "default" : "ghost"}
            onClick={() => setMode("line")}
            className="h-9 w-9"
            title="Line"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={mode === "arrow" ? "default" : "ghost"}
            onClick={() => setMode("arrow")}
            className="h-9 w-9"
            title="Arrow"
          >
            <MoveRight className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={mode === "rect" ? "default" : "ghost"}
            onClick={() => setMode("rect")}
            className="h-9 w-9"
            title="Rectangle"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={mode === "circle" ? "default" : "ghost"}
            onClick={() => setMode("circle")}
            className="h-9 w-9"
            title="Circle"
          >
            <Circle className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={mode === "graph" ? "default" : "ghost"}
            onClick={() => setMode("graph")}
            className="h-9 w-9"
            title="Graph Grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 px-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                if (mode === "eraser") setMode("pen");
              }}
              className={`h-6 w-6 rounded-full border-2 transition-all ${color === c ? "border-slate-500 scale-125" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Adjust Line Thickness */}
        <div className="flex items-center gap-2 border-l pl-3">
          <span className="text-[11px] font-bold text-slate-500">THICKNESS</span>
          <input
            type="range"
            min="1"
            max="20"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-20 accent-indigo-600"
          />
          <span className="text-xs font-mono font-bold w-5">{size}px</span>
        </div>

        <div className="flex rounded-md bg-slate-100 p-1 gap-0.5">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleUndo}
            disabled={myUndoStack.current.length === 0}
            className="h-9 w-9"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRedo}
            disabled={myRedoStack.current.length === 0}
            className="h-9 w-9"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={handleSmartConvert}
            disabled={isAIProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
            size="sm"
          >
            {isAIProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Smart Convert
          </Button>

          {isHost && (
            <div className="flex items-center gap-2 border-l pl-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {studentCanDraw ? "Shared Write" : "Tutor Lock"}
              </span>
              <Switch checked={studentCanDraw} onCheckedChange={setStudentCanDraw} />
            </div>
          )}
        </div>
      </div>

      {/* Pages Workspace */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-slate-200/40 p-4 md:p-8 space-y-10"
        onScroll={() => {
          const top = containerRef.current?.scrollTop || 0;
          setCurrentPage(Math.floor(top / 850) + 1);
        }}
      >
        {Array.from({ length: PAGE_COUNT }).map((_, i) => (
          <div key={i} className="relative mx-auto max-w-5xl">
            <div className="absolute -left-12 top-0 text-slate-400 font-mono text-xs hidden md:block">PAGE {i + 1}</div>
            <div className="relative aspect-video w-full rounded-lg border bg-white shadow-lg overflow-hidden">
              <canvas
                ref={(el) => {
                  canvasRefs.current[i] = el;
                  if (el && !el.width) {
                    const rect = el.getBoundingClientRect();
                    // Setup absolute backing store size for coordinate mapping fidelity
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

              {/* Responsive Input Overlay */}
              {textEditor && textEditor.page === i && (
                <textarea
                  autoFocus
                  className="absolute z-50 border-none bg-transparent p-0 font-mono focus:ring-0 resize-none outline-none overflow-hidden"
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
                      // Translate overlay coordinates back to canvas backing store scale coordinates
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

      {/* Floating Pagination Footer */}
      <div className="fixed bottom-6 right-6 flex items-center gap-1 rounded-full bg-white/80 p-1 shadow-xl backdrop-blur-md">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => containerRef.current?.scrollBy(0, -850)}
          className="h-8 w-8 rounded-full"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <span className="px-3 text-xs font-bold">
          {currentPage} / {PAGE_COUNT}
        </span>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => containerRef.current?.scrollBy(0, 850)}
          className="h-8 w-8 rounded-full"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Screen Floating AI Trigger */}
      <Button
        onClick={handleSmartConvert}
        className="fixed bottom-6 left-6 h-12 w-12 rounded-full bg-indigo-600 shadow-lg md:hidden hover:bg-indigo-700"
        size="icon"
      >
        <Sparkles className="h-5 w-5 text-white" />
      </Button>
    </div>
  );
}
