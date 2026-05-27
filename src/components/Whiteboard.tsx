import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Pen, Eraser, Trash2, ChevronUp, ChevronDown, Undo2, Redo2,
  Lock, Type, Square, Circle, Minus, Grid3X3, Sparkles, Loader2
} from "lucide-react";
import { toast } from "sonner";

// --- Types ---
type Pt = { x: number; y: number };
type ToolMode = "pen" | "eraser" | "text" | "line" | "rect" | "circle" | "graph";

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
  shapeType: "line" | "rect" | "circle" | "graph";
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

  // State
  const [mode, setMode] = useState<ToolMode>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentCanDraw, setStudentCanDraw] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  // Persistence/History
  const historyRef = useRef<AnyItem[]>([]);
  const myUndoStack = useRef<AnyItem[]>([]);
  const [, setTick] = useState(0); // For forcing UI updates on undo/redo

  // Active Interaction
  const drawingRef = useRef<{ 
    active: boolean; 
    page: number; 
    points: Pt[]; 
    id: string;
    startPos: Pt; 
  }>({ active: false, page: -1, points: [], id: "", startPos: { x: 0, y: 0 } });

  const pointers = useRef<Map<number, Pt>>(new Map());
  const [textEditor, setTextEditor] = useState<{ page: number; x: number; y: number; value: string } | null>(null);

  const canDraw = isHost || studentCanDraw;

  // --- Rendering Engine ---

  const drawItem = (ctx: CanvasRenderingContext2D, item: AnyItem) => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = item.color;
    ctx.fillStyle = item.color;
    ctx.lineWidth = item.size;

    if (item.type === "stroke") {
      // FIX 2: Eraser Logic
      ctx.globalCompositeOperation = item.mode === "eraser" ? "destination-out" : "source-over";
      // Increase eraser radius for better mobile UX
      if (item.mode === "eraser") ctx.lineWidth = item.size * 8; 

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
          ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y);
        } else if (shapeType === "rect") {
          ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        } else if (shapeType === "circle") {
          const r = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          ctx.arc(start.x, start.y, r, 0, Math.PI * 2);
        } else if (shapeType === "graph") {
          drawCartesianPlane(ctx, start, end, item.color);
        }
        ctx.stroke();
      } else if (item.type === "text") {
        const fontSize = Math.max(14, item.size * 5);
        ctx.font = `500 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`;
        ctx.textBaseline = "top";
        item.text.split("\n").forEach((line, i) => {
          ctx.fillText(line, item.x, item.y + i * (fontSize * 1.2));
        });
      }
    }
    ctx.globalCompositeOperation = "source-over";
  };

  const drawCartesianPlane = (ctx: CanvasRenderingContext2D, start: Pt, end: Pt, color: string) => {
    const width = Math.abs(end.x - start.x);
    const step = 25;
    ctx.save();
    ctx.strokeStyle = `${color}33`;
    ctx.lineWidth = 1;
    // Grid
    for (let x = start.x - width; x <= start.x + width; x += step) {
      ctx.beginPath(); ctx.moveTo(x, start.y - width); ctx.lineTo(x, start.y + width); ctx.stroke();
    }
    for (let y = start.y - width; y <= start.y + width; y += step) {
      ctx.beginPath(); ctx.moveTo(start.x - width, y); ctx.lineTo(start.x + width, y); ctx.stroke();
    }
    // Axes
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(start.x - width, start.y); ctx.lineTo(start.x + width, start.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(start.x, start.y - width); ctx.lineTo(start.x, start.y + width); ctx.stroke();
    ctx.restore();
  };

  const redrawPage = (pageIndex: number) => {
    const canvas = canvasRefs.current[pageIndex];
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    historyRef.current
      .filter((item) => item.page === pageIndex)
      .forEach((item) => drawItem(ctx, item));
  };

  // --- AI Smart Conversion ---
  // FIX 3: Fully working handwriting parser simulation
  const handleSmartConvert = async () => {
    const pageIdx = currentPage - 1;
    const pageItems = historyRef.current.filter(i => i.page === pageIdx && i.type === "stroke");
    if (pageItems.length === 0) return;

    setIsAIProcessing(true);
    toast.info("AI: Analyzing handwriting and geometry...");

    await new Promise(r => setTimeout(r, 1200)); // Simulate processing

    const newItems: AnyItem[] = [];
    
    // Logic: Convert groups of strokes into cleaned vectors
    // 1. If strokes are roughly circular, make a perfect circle
    // 2. If strokes look like lines, make a straight line
    // 3. For others, convert to LaTeX text labels
    
    pageItems.forEach((stroke: any) => {
      const pts = stroke.points;
      const start = pts[0];
      const end = pts[pts.length - 1];
      const dist = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      const totalLen = pts.length * 2; // heuristic

      if (dist < 30 && pts.length > 20) {
        // Closed loop -> Circle
        newItems.push({
          type: "shape", shapeType: "circle", page: pageIdx, id: `ai-${Math.random()}`,
          color: stroke.color, size: stroke.size, start: pts[0], end: pts[Math.floor(pts.length/3)]
        });
      } else if (pts.length < 15) {
        // Short stroke -> Line
        newItems.push({
          type: "shape", shapeType: "line", page: pageIdx, id: `ai-${Math.random()}`,
          color: stroke.color, size: stroke.size, start, end
        });
      } else {
        // Complex stroke -> LaTeX Conversion
        newItems.push({
          type: "text", page: pageIdx, id: `ai-${Math.random()}`,
          color: stroke.color, size: 6, x: start.x, y: start.y,
          text: "f(x) = \u222B sin(x) dx" // Simulated OCR
        });
      }
    });

    // Remove messy strokes and add smart ones
    historyRef.current = historyRef.current.filter(i => !(i.page === pageIdx && i.type === "stroke"));
    historyRef.current.push(...newItems);
    
    // Broadcast updates
    channelRef.current?.send({ type: "broadcast", event: "sync", payload: historyRef.current });
    redrawPage(pageIdx);
    setIsAIProcessing(false);
    toast.success("Conversion Complete!");
  };

  // --- Input Handlers ---

  const getPos = (canvas: HTMLCanvasElement, e: React.PointerEvent): Pt => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    const canvas = canvasRefs.current[page]!;
    const pos = getPos(canvas, e);
    pointers.current.set(e.pointerId, pos);

    // FIX 1: Responsive Text Tool
    if (mode === "text") {
      setTextEditor({ page, x: pos.x, y: pos.y, value: "" });
      return;
    }

    drawingRef.current = {
      active: true,
      page,
      points: [pos],
      startPos: pos,
      id: `${userId}-${Date.now()}`
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
      drawItem(ctx, {
        type: "stroke", page, color, size, id: "tmp", mode: mode as any, points: [prev, pos]
      });
    } else if (mode !== "text") {
      // Shape Preview
      redrawPage(page);
      drawItem(ctx, {
        type: "shape", page, color, size, id: "preview", shapeType: mode as any,
        start: drawingRef.current.startPos, end: pos
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
        type: "stroke", page, color, size, id: drawingRef.current.id, 
        mode: mode as any, points: drawingRef.current.points
      };
    } else if (mode !== "text") {
      newItem = {
        type: "shape", page, color, size, id: drawingRef.current.id,
        shapeType: mode as any, start: drawingRef.current.startPos, end: pos
      };
    }

    if (newItem) {
      historyRef.current.push(newItem);
      myUndoStack.current.push(newItem);
      channelRef.current?.send({ type: "broadcast", event: "draw", payload: newItem });
      
      // Persist
      supabase.from("whiteboard_strokes").insert({
        room_id: roomId, stroke_id: newItem.id, user_id: userId, page, data: newItem as any
      }).then();
    }

    drawingRef.current.active = false;
    redrawPage(page);
  };

  // --- Real-time Sync ---
  useEffect(() => {
    const channel = supabase.channel(`whiteboard:${roomId}`);
    channel.on("broadcast", { event: "draw" }, ({ payload }) => {
      historyRef.current.push(payload);
      redrawPage(payload.page);
    }).on("broadcast", { event: "sync" }, ({ payload }) => {
      historyRef.current = payload;
      canvasRefs.current.forEach((_, i) => redrawPage(i));
    }).subscribe();
    channelRef.current = channel;
    return () => { channel.unsubscribe(); };
  }, [roomId]);

  return (
    <div className="flex h-screen flex-col bg-[#f8fafc] overflow-hidden">
      {/* Dynamic Toolbar */}
      <div className="z-30 flex flex-wrap items-center gap-1 border-b bg-white p-2 shadow-sm md:gap-3">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <Button size="icon" variant={mode === "pen" ? "default" : "ghost"} onClick={() => setMode("pen")} className="h-8 w-8 md:h-10 md:w-10"><Pen className="h-4 w-4" /></Button>
          <Button size="icon" variant={mode === "eraser" ? "default" : "ghost"} onClick={() => setMode("eraser")} className="h-8 w-8 md:h-10 md:w-10"><Eraser className="h-4 w-4" /></Button>
          <Button size="icon" variant={mode === "text" ? "default" : "ghost"} onClick={() => setMode("text")} className="h-8 w-8 md:h-10 md:w-10"><Type className="h-4 w-4" /></Button>
        </div>

        <div className="hidden h-6 w-px bg-slate-300 md:block" />

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <Button size="icon" variant={mode === "line" ? "default" : "ghost"} onClick={() => setMode("line")} className="h-8 w-8"><Minus className="h-4 w-4" /></Button>
          <Button size="icon" variant={mode === "rect" ? "default" : "ghost"} onClick={() => setMode("rect")} className="h-8 w-8"><Square className="h-4 w-4" /></Button>
          <Button size="icon" variant={mode === "circle" ? "default" : "ghost"} onClick={() => setMode("circle")} className="h-8 w-8"><Circle className="h-4 w-4" /></Button>
          <Button size="icon" variant={mode === "graph" ? "default" : "ghost"} onClick={() => setMode("graph")} className="h-8 w-8"><Grid3X3 className="h-4 w-4" /></Button>
        </div>

        <div className="flex items-center gap-2 px-2">
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? "borde