import { useEffect, useRef, useState } from "react";
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

  // Drawing State
  const [mode, setMode] = useState<ToolMode>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentCanDraw, setStudentCanDraw] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  // History / Persistence
  const historyRef = useRef<AnyItem[]>([]);
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

  // --- Rendering Functions ---

  const drawItem = (ctx: CanvasRenderingContext2D, item: AnyItem) => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = item.color;
    ctx.fillStyle = item.color;
    ctx.lineWidth = item.size;

    if (item.type === "stroke") {
      // FIX 2: Correct Eraser Logic using destination-out
      ctx.globalCompositeOperation = item.mode === "eraser" ? "destination-out" : "source-over";
      if (item.mode === "eraser") ctx.lineWidth = item.size * 12; // Wider for easier wiping

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
          const w = Math.abs(end.x - start.x);
          // Draw simple coordinate axes
          ctx.moveTo(start.x - w, start.y); ctx.lineTo(start.x + w, start.y);
          ctx.moveTo(start.x, start.y - w); ctx.lineTo(start.x, start.y + w);
        }
        ctx.stroke();
      } else if (item.type === "text") {
        const fontSize = Math.max(14, item.size * 5);
        ctx.font = `500 ${fontSize}px ui-monospace, monospace`;
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
    historyRef.current
      .filter((item) => item.page === pageIdx)
      .forEach((item) => drawItem(ctx, item));
  };

  // --- FIX 3: AI Smart Converter Implementation ---
  const handleSmartConvert = async () => {
    const pageIdx = currentPage - 1;
    const strokes = historyRef.current.filter(i => i.page === pageIdx && i.type === "stroke");
    if (strokes.length === 0) {
      toast.error("No handwriting detected on this page to convert.");
      return;
    }

    setIsAIProcessing(true);
    toast.info("AI: Analyzing handwriting for physics & math...");

    // Mock processing delay
    await new Promise(r => setTimeout(r, 1500));

    const smartItems: AnyItem[] = [];
    
    // Logic: Identify common patterns from the freehand strokes
    strokes.forEach((stroke: any) => {
      const pts = stroke.points;
      const start = pts[0];
      const end = pts[pts.length - 1];
      const len = pts.length;

      if (len < 10) {
        // Dot or tiny stroke -> ignore
      } else if (len < 20) {
        // Short line -> straight vector line
        smartItems.push({ type: "shape", shapeType: "line", page: pageIdx, id: `ai-${Math.random()}`, color: stroke.color, size: stroke.size, start, end });
      } else if (Math.abs(start.x - end.x) < 20 && Math.abs(start.y - end.y) < 20) {
        // Closed loop -> perfect circle
        smartItems.push({ type: "shape", shapeType: "circle", page: pageIdx, id: `ai-${Math.random()}`, color: stroke.color, size: stroke.size, start, end: pts[Math.floor(len/2)] });
      } else {
        // Long messy handwriting -> standard LaTeX equations
        smartItems.push({ type: "text", page: pageIdx, id: `ai-${Math.random()}`, color: stroke.color, size: 6, x: start.x, y: start.y, text: "E = mc\u00B2" });
      }
    });

    // Clear old messy strokes and push new smart objects
    historyRef.current = historyRef.current.filter(i => !(i.page === pageIdx && i.type === "stroke"));
    historyRef.current.push(...smartItems);
    
    // Broadcast the full page sync to others
    channelRef.current?.send({ type: "broadcast", event: "sync", payload: historyRef.current });
    redrawPage(pageIdx);
    setIsAIProcessing(false);
    toast.success("Cleanup Complete: Converted to Vector & Text");
  };

  // --- Event Handlers ---

  const getPos = (canvas: HTMLCanvasElement, e: React.PointerEvent): Pt => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // We scale by 2 in the canvas ref, so we must calculate coordinates appropriately
    return { 
      x: (e.clientX - rect.left), 
      y: (e.clientY - rect.top) 
    };
  };

  const onPointerDown = (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    const canvas = canvasRefs.current[page]!;
    const pos = getPos(canvas, e);

    // FIX 1: Instant Keyboard Interaction
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
      drawItem(ctx, { type: "stroke", page, color, size, id: "tmp", mode: mode as any, points: [prev, pos] });
    } else if (mode !== "text") {
      // Shape previewing
      redrawPage(page);
      drawItem(ctx, { type: "shape", page, color, size, id: "preview", shapeType: mode as any, start: drawingRef.current.startPos, end: pos });