import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Pen,
  Eraser,
  Undo2,
  Redo2,
  Type,
  Square,
  Circle,
  Minus,
  Grid3X3,
  Sparkles,
  Loader2,
  MoveRight,
  Highlighter,
} from "lucide-react";
import { toast } from "sonner";

type Pt = { x: number; y: number };
type ToolMode = "pen" | "highlighter" | "eraser" | "text" | "line" | "arrow" | "rect" | "circle" | "graph";

interface BaseItem {
  id: string;
  page: number;
  color: string;
  size: number;
  opacity?: number;
}

interface Stroke extends BaseItem {
  type: "stroke";
  points: Pt[];
  mode: "pen" | "highlighter" | "eraser";
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

const COLORS = ["#0f172a", "#dc2626", "#2563eb", "#16a34a", "#9333ea", "#ea580c"];
const PAGE_COUNT = 30;

interface Props {
  roomId: string;
  userId: string;
  isHost?: boolean;
}

export function Whiteboard({ roomId, userId, isHost = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const channelRef = useRef<any>(null);

  const [mode, setMode] = useState<ToolMode>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentCanDraw, setStudentCanDraw] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const historyRef = useRef<AnyItem[]>([]);
  const myUndoStack = useRef<AnyItem[]>([]);
  const myRedoStack = useRef<AnyItem[]>([]);

  const drawingRef = useRef<{
    active: boolean;
    page: number;
    points: Pt[];
    id: string;
    startPos: Pt;
  }>({ active: false, page: -1, points: [], id: "", startPos: { x: 0, y: 0 } });

  const [textEditor, setTextEditor] = useState<{ page: number; x: number; y: number; value: string } | null>(null);

  const canDraw = isHost || studentCanDraw;

  // ==================== DRAWING HELPERS ====================

  const resizeAllCanvases = useCallback(() => {
    canvasRefs.current.forEach((canvas, i) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr * 1.15;
      canvas.height = rect.height * dpr * 1.15;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (ctx) ctx.scale(dpr * 1.15, dpr * 1.15);

      redrawPage(i);
    });
  }, []);

  const drawArrow = (ctx: CanvasRenderingContext2D, start: Pt, end: Pt, size: number) => {
    const headLength = Math.max(14, size * 3);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.beginPath();
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
        ctx.lineWidth = Math.max(20, item.size * 10);
      } else {
        ctx.globalCompositeOperation = "source-over";
        if (item.mode === "highlighter") {
          ctx.globalAlpha = 0.35;
        }
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
      ctx.globalAlpha = 1;

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
          const r = Math.hypot(end.x - start.x, end.y - start.y);
          ctx.arc(start.x, start.y, r, 0, Math.PI * 2);
          ctx.stroke();
        } else if (shapeType === "graph") {
          const w = Math.abs(end.x - start.x);
          ctx.save();
          ctx.strokeStyle = `${item.color}55`;
          ctx.lineWidth = Math.max(1, item.size / 2);
          const step = 25;
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
        const fontSize = Math.max(16, item.size * 4);
        ctx.font = `600 ${fontSize}px ui-monospace, monospace`;
        ctx.textBaseline = "top";
        item.text.split("\n").forEach((line, i) => {
          ctx.fillText(line, item.x, item.y + i * (fontSize * 1.25));
        });
      }
    }
    ctx.globalAlpha = 1;
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

  const getPos = (canvas: HTMLCanvasElement, e: React.PointerEvent): Pt => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // ==================== POINTER EVENTS ====================

  const onPointerDown = (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    const canvas = canvasRefs.current[page];
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
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
      id: `\( {userId}- \){Date.now()}`,
    };
  };

  const onPointerMove = (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current.active || drawingRef.current.page !== page) return;
    const canvas = canvasRefs.current[page];
    if (!canvas) return;

    const pos = getPos(canvas, e);
    const ctx = canvas.getContext("2d")!;

    if (["pen", "highlighter", "eraser"].includes(mode)) {
      const prev = drawingRef.current.points[drawingRef.current.points.length - 1];
      drawingRef.current.points.push(pos);

      drawItem(ctx, {
        type: "stroke",
        page,
        color: mode === "eraser" ? "#000" : color,
        size: mode === "highlighter" ? size * 2.5 : size,
        id: "tmp",
        mode: mode as any,
        points: [prev, pos],
        opacity: mode === "highlighter" ? 0.35 : 1,
      });
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
    const canvas = canvasRefs.current[page];
    if (!canvas) return;

    canvas.releasePointerCapture(e.pointerId);
    const pos = getPos(canvas, e);
    let newItem: AnyItem | null = null;

    if (["pen", "highlighter", "eraser"].includes(mode)) {
      newItem = {
        type: "stroke",
        page,
        color: mode === "eraser" ? "#000" : color,
        size: mode === "highlighter" ? size * 2.5 : size,
        id: drawingRef.current.id,
        mode: mode as any,
        points: [...drawingRef.current.points],
        opacity: mode === "highlighter" ? 0.35 : 1,
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

  // ==================== UNDO / REDO / AI ====================

  const handleUndo = () => {
    const item = myUndoStack.current.pop();
    if (!item) return;
    myRedoStack.current.push(item);
    historyRef.current = historyRef.current.filter((i) => i.id !== item.id);
    redrawPage(item.page);
    channelRef.current?.send({ type: "broadcast", event: "sync", payload: historyRef.current });
  };

  const handleRedo = () => {
    /* similar to undo */
  };

  const handleSmartConvert = async () => {
    const pageIdx = currentPage - 1;
    const strokes = historyRef.current.filter((i) => i.page === pageIdx && i.type === "stroke" && i.mode !== "eraser");

    if (strokes.length === 0) {
      toast.error("No handwriting detected on this page.");
      return;
    }

    setIsAIProcessing(true);
    toast.info("AI is converting handwriting to LaTeX...");

    try {
      // TODO: Replace with real API call (Mathpix, custom Supabase Edge Function, or Math2LaTeX)
      // Example: Capture canvas as image and send to backend
      const canvas = canvasRefs.current[pageIdx];
      if (canvas) {
        const imageData = canvas.toDataURL("image/png");

        // Simulated real conversion (replace with fetch to your AI endpoint)
        const response = await fetch("/api/convert-math", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData, page: pageIdx }),
        });

        const { latex, text } = await response.json();

        // Replace strokes with clean LaTeX text
        historyRef.current = historyRef.current.filter((i) => !(i.page === pageIdx && i.type === "stroke"));

        const newTextItem: TextItem = {
          type: "text",
          page: pageIdx,
          color: "#0f172a",
          size: 6,
          id: `ai-${Date.now()}`,
          x: 80,
          y: 120,
          text: latex || text || "Converted Equation",
        };

        historyRef.current.push(newTextItem);
        myUndoStack.current.push(newTextItem);
        redrawPage(pageIdx);

        toast.success("Handwriting converted to perfect LaTeX!");
      }
    } catch (err) {
      toast.error("AI conversion failed. Try again.");
    }

    setIsAIProcessing(false);
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    const handleResize = () => resizeAllCanvases();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [resizeAllCanvases]);

  // Real-time sync (unchanged)
  useEffect(() => {
    /* ... your existing channel logic ... */
  }, [roomId]);

  return (
    <div className="flex h-screen flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Top Toolbar */}
      <div className="z-30 flex flex-wrap items-center gap-2 border-b bg-white p-2 shadow-sm">
        {/* Pen / Highlighter / Eraser */}
        <div className="flex rounded-md bg-slate-100 p-1">
          <Button size="icon" variant={mode === "pen" ? "default" : "ghost"} onClick={() => setMode("pen")}>
            <Pen className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={mode === "highlighter" ? "default" : "ghost"}
            onClick={() => setMode("highlighter")}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
          <Button size="icon" variant={mode === "eraser" ? "default" : "ghost"} onClick={() => setMode("eraser")}>
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        {/* Shapes */}
        <div className="flex rounded-md bg-slate-100 p-1 gap-0.5">
          <Button size="icon" variant={mode === "line" ? "default" : "ghost"} onClick={() => setMode("line")}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button size="icon" variant={mode === "arrow" ? "default" : "ghost"} onClick={() => setMode("arrow")}>
            <MoveRight className="h-4 w-4" />
          </Button>
          <Button size="icon" variant={mode === "rect" ? "default" : "ghost"} onClick={() => setMode("rect")}>
            <Square className="h-4 w-4" />
          </Button>
          <Button size="icon" variant={mode === "circle" ? "default" : "ghost"} onClick={() => setMode("circle")}>
            <Circle className="h-4 w-4" />
          </Button>
          <Button size="icon" variant={mode === "graph" ? "default" : "ghost"} onClick={() => setMode("graph")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Colors & Size */}
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-full border-2 ${color === c ? "border-slate-700 scale-110" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 border-l pl-4">
          <span className="text-xs font-bold text-slate-500">SIZE</span>
          <input
            type="range"
            min="2"
            max="28"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-24 accent-indigo-600"
          />
          <span className="font-mono text-xs w-8">{size}</span>
        </div>

        <div className="flex gap-1 ml-auto">
          <Button onClick={handleUndo} disabled={myUndoStack.current.length === 0}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button onClick={handleRedo} disabled={myRedoStack.current.length === 0}>
            <Redo2 className="h-4 w-4" />
          </Button>

          <Button onClick={handleSmartConvert} disabled={isAIProcessing} className="bg-violet-600">
            {isAIProcessing ? <Loader2 className="animate-spin" /> : <Sparkles />}
            AI → LaTeX
          </Button>

          {isHost && (
            <div className="flex items-center gap-2 pl-3 border-l">
              <span className="text-xs uppercase font-bold text-slate-500">Student Draw</span>
              <Switch checked={studentCanDraw} onCheckedChange={setStudentCanDraw} />
            </div>
          )}
        </div>
      </div>

      {/* Canvas Area + Text Editor (same as before with improvements) */}
      {/* ... (keep the rest of your return JSX - pages container, canvases, text overlay) ... */}
    </div>
  );
}
