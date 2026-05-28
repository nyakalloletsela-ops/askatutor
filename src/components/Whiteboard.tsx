import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  PenTool,
  Eraser,
  Highlighter,
  Undo2,
  Redo2,
  Trash2,
  Sparkles,
  Minus,
  MoveRight,
  Square,
  Circle,
  Grid3X3,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Hand,
  Copy as CopyIcon,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { whiteboardConvert } from "@/lib/whiteboard-ai.functions";
import { toast } from "sonner";

// ----- Types -----

type Point = { x: number; y: number; p?: number };

type Tool =
  | "pen"
  | "highlighter"
  | "eraser"
  | "line"
  | "arrow"
  | "rect"
  | "circle"
  | "graph"
  | "pan";

interface Stroke {
  id: string;
  tool: Exclude<Tool, "pan">;
  color: string;
  width: number;
  page: number;
  points: Point[];
}

interface WhiteboardProps {
  roomId: string;
  userId: string;
  isHost: boolean;
}

const COLORS = [
  "#000000",
  "#ffffff",
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
  "#facc15",
];

// Logical canvas size in CSS pixels — fixed so coordinates sync across devices.
const BOARD_W = 1600;
const BOARD_H = 1000;

export function Whiteboard({ roomId, userId, isHost }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(4);
  const [eraserSize, setEraserSize] = useState(36);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [studentCanDraw, setStudentCanDraw] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Pan / zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Drawing state
  const strokesRef = useRef<Stroke[]>([]);
  const undoStackRef = useRef<string[]>([]); // local stroke ids the user can undo
  const redoStackRef = useRef<Stroke[]>([]);
  const currentRef = useRef<Stroke | null>(null);
  const lastPointRef = useRef<Point | null>(null);

  // Multi-touch tracking
  const pointersRef = useRef<Map<number, Point>>(new Map());
  const gestureRef = useRef<{
    active: boolean;
    startDist: number;
    startZoom: number;
    startMid: Point;
    startPan: { x: number; y: number };
  }>({ active: false, startDist: 0, startZoom: 1, startMid: { x: 0, y: 0 }, startPan: { x: 0, y: 0 } });

  const canDraw = isHost || studentCanDraw;

  // ----- Canvas setup -----
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = BOARD_W * dpr;
    canvas.height = BOARD_H * dpr;
    canvas.style.width = `${BOARD_W}px`;
    canvas.style.height = `${BOARD_H}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    redraw();
  }, []);

  useEffect(() => {
    setupCanvas();
  }, [setupCanvas]);

  // ----- Draw a stroke onto context -----
  const drawStroke = (ctx: CanvasRenderingContext2D, s: Stroke) => {
    if (s.page !== page) return;
    if (s.points.length === 0) return;
    ctx.save();
    ctx.strokeStyle = s.color;
    ctx.fillStyle = s.color;
    ctx.lineWidth = s.width;

    if (s.tool === "highlighter") ctx.globalAlpha = 0.25;
    if (s.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = s.width;
    }

    const pts = s.points;
    if (s.tool === "pen" || s.tool === "highlighter" || s.tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      if (pts.length === 1) {
        ctx.lineTo(pts[0].x + 0.01, pts[0].y + 0.01);
      } else {
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    } else if (s.tool === "line" && pts.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    } else if (s.tool === "arrow" && pts.length >= 2) {
      const a = pts[0], b = pts[pts.length - 1];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const h = Math.max(10, s.width * 3);
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - h * Math.cos(ang - Math.PI / 6), b.y - h * Math.sin(ang - Math.PI / 6));
      ctx.lineTo(b.x - h * Math.cos(ang + Math.PI / 6), b.y - h * Math.sin(ang + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    } else if (s.tool === "rect" && pts.length >= 2) {
      const a = pts[0], b = pts[pts.length - 1];
      ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
    } else if (s.tool === "circle" && pts.length >= 2) {
      const a = pts[0], b = pts[pts.length - 1];
      const r = Math.hypot(b.x - a.x, b.y - a.y);
      ctx.beginPath();
      ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
      ctx.stroke();
    } else if (s.tool === "graph" && pts.length >= 1) {
      const c = pts[0];
      const size = 240, step = 24;
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      for (let x = -size; x <= size; x += step) {
        ctx.beginPath();
        ctx.moveTo(c.x + x, c.y - size);
        ctx.lineTo(c.x + x, c.y + size);
        ctx.stroke();
      }
      for (let y = -size; y <= size; y += step) {
        ctx.beginPath();
        ctx.moveTo(c.x - size, c.y + y);
        ctx.lineTo(c.x + size, c.y + y);
        ctx.stroke();
      }
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x - size, c.y);
      ctx.lineTo(c.x + size, c.y);
      ctx.moveTo(c.x, c.y - size);
      ctx.lineTo(c.x, c.y + size);
      ctx.stroke();
    }
    ctx.restore();
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.restore();
    for (const s of strokesRef.current) {
      if (s.page === page) drawStroke(ctx, s);
    }
    if (currentRef.current && currentRef.current.page === page) {
      drawStroke(ctx, currentRef.current);
    }
  }, [page]);

  useEffect(() => {
    redraw();
  }, [page, redraw]);

  // ----- Reset on room change -----
  useEffect(() => {
    strokesRef.current = [];
    undoStackRef.current = [];
    redoStackRef.current = [];
    currentRef.current = null;
    setPage(0);
    setPageCount(1);
    redraw();
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ----- Load + realtime -----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("whiteboard_strokes")
        .select("stroke_id,page,data")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (!error && data) {
        const loaded: Stroke[] = data
          .map((r) => {
            const d = r.data as Stroke | null;
            if (!d) return null;
            return { ...d, id: r.stroke_id, page: r.page };
          })
          .filter((s): s is Stroke => !!s);
        strokesRef.current = loaded;
        const maxPage = loaded.reduce((m, s) => Math.max(m, s.page), 0);
        setPageCount(maxPage + 1);
        redraw();
      }
    })();

    const channel = supabase
      .channel(`wb-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "whiteboard_strokes", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const row = payload.new as { stroke_id: string; user_id: string; page: number; data: Stroke };
          if (row.user_id === userId) return;
          if (strokesRef.current.some((s) => s.id === row.stroke_id)) return;
          const s = { ...(row.data as Stroke), id: row.stroke_id, page: row.page };
          strokesRef.current.push(s);
          setPageCount((c) => Math.max(c, row.page + 1));
          redraw();
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "whiteboard_strokes", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const old = payload.old as { stroke_id?: string };
          if (!old?.stroke_id) return;
          strokesRef.current = strokesRef.current.filter((s) => s.id !== old.stroke_id);
          redraw();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [roomId, userId, redraw]);

  // ----- Persistence -----
  const persistStroke = async (s: Stroke) => {
    const { error } = await supabase.from("whiteboard_strokes").insert({
      room_id: roomId,
      stroke_id: s.id,
      user_id: userId,
      page: s.page,
      data: JSON.parse(JSON.stringify(s)),
    });
    if (error) console.warn("whiteboard insert", error.message);
  };

  const deleteStrokeRemote = async (id: string) => {
    await supabase.from("whiteboard_strokes").delete().eq("room_id", roomId).eq("stroke_id", id);
  };

  // ----- Coordinate helpers -----
  const toBoard = (clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = BOARD_W / rect.width;
    const sy = BOARD_H / rect.height;
    return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
  };

  // ----- Pointer handlers -----
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Two-finger gesture starts
    if (pointersRef.current.size >= 2) {
      currentRef.current = null;
      const [a, b] = Array.from(pointersRef.current.values());
      gestureRef.current = {
        active: true,
        startDist: Math.hypot(b.x - a.x, b.y - a.y),
        startZoom: zoom,
        startMid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        startPan: { ...pan },
      };
      redraw();
      return;
    }

    if (tool === "pan") return;
    if (!canDraw) {
      toast.message("Tutor has locked drawing");
      return;
    }

    const pt = toBoard(e.clientX, e.clientY);
    lastPointRef.current = pt;
    const isEraser = tool === "eraser";
    currentRef.current = {
      id: crypto.randomUUID(),
      tool: tool as Exclude<Tool, "pan">,
      color,
      width: isEraser ? eraserSize : width,
      page,
      points: [pt],
    };
    redraw();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (gestureRef.current.active && pointersRef.current.size >= 2) {
      const [a, b] = Array.from(pointersRef.current.values());
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const g = gestureRef.current;
      const newZoom = Math.min(4, Math.max(0.3, g.startZoom * (dist / g.startDist)));
      setZoom(newZoom);
      setPan({
        x: g.startPan.x + (mid.x - g.startMid.x),
        y: g.startPan.y + (mid.y - g.startMid.y),
      });
      return;
    }

    if (!currentRef.current) return;
    const pt = toBoard(e.clientX, e.clientY);
    // throttle by min distance
    const last = lastPointRef.current;
    if (last && Math.hypot(pt.x - last.x, pt.y - last.y) < 1.2) return;
    lastPointRef.current = pt;
    currentRef.current.points.push(pt);
    redraw();
  };

  const finishPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2 && gestureRef.current.active) {
      gestureRef.current.active = false;
    }
    if (!currentRef.current) return;
    if (pointersRef.current.size > 0) {
      // still other pointer down — drop the stroke
      currentRef.current = null;
      redraw();
      return;
    }
    const s = currentRef.current;
    currentRef.current = null;
    if (s.points.length === 0) return;
    strokesRef.current.push(s);
    undoStackRef.current.push(s.id);
    redoStackRef.current = [];
    redraw();
    void persistStroke(s);
  };

  // ----- Toolbar actions -----
  const undo = () => {
    const id = undoStackRef.current.pop();
    if (!id) return;
    const idx = strokesRef.current.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const [removed] = strokesRef.current.splice(idx, 1);
    redoStackRef.current.push(removed);
    redraw();
    void deleteStrokeRemote(id);
  };

  const redo = () => {
    const s = redoStackRef.current.pop();
    if (!s) return;
    strokesRef.current.push(s);
    undoStackRef.current.push(s.id);
    redraw();
    void persistStroke(s);
  };

  const clearPage = async () => {
    if (!isHost) {
      toast.error("Only the tutor can clear the board");
      return;
    }
    const ids = strokesRef.current.filter((s) => s.page === page).map((s) => s.id);
    strokesRef.current = strokesRef.current.filter((s) => s.page !== page);
    undoStackRef.current = undoStackRef.current.filter((id) => !ids.includes(id));
    redraw();
    if (ids.length === 0) return;
    await supabase
      .from("whiteboard_strokes")
      .delete()
      .eq("room_id", roomId)
      .eq("page", page);
  };

  // ----- AI Convert -----
  const runConvert = useServerFn(whiteboardConvert);
  const handleAIConvert = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsConverting(true);
    setAiResult(null);
    try {
      // Render current page on a clean white canvas at smaller size for upload
      const off = document.createElement("canvas");
      const maxW = 1400;
      const scale = Math.min(1, maxW / BOARD_W);
      off.width = Math.round(BOARD_W * scale);
      off.height = Math.round(BOARD_H * scale);
      const octx = off.getContext("2d")!;
      octx.fillStyle = "#ffffff";
      octx.fillRect(0, 0, off.width, off.height);
      octx.scale(scale, scale);
      for (const s of strokesRef.current) if (s.page === page) drawStroke(octx, s);
      const dataUrl = off.toDataURL("image/png");
      const res = await runConvert({ data: { imageDataUrl: dataUrl } });
      setAiResult(res.text || "(no text detected)");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI conversion failed";
      toast.error(msg);
    } finally {
      setIsConverting(false);
    }
  };

  // ----- Page nav -----
  const goPage = (n: number) => {
    if (n < 0) return;
    if (n >= pageCount) setPageCount(n + 1);
    setPage(n);
  };

  // ----- UI -----
  const toolBtn = (t: Tool, icon: React.ReactNode, label: string, active = tool === t) => (
    <button
      onClick={() => setTool(t)}
      title={label}
      aria-label={label}
      className={`p-2 rounded-md border text-sm flex items-center justify-center ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background hover:bg-muted border-border"
      }`}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex h-full w-full flex-col bg-slate-100">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b bg-white p-2 shadow-sm">
        {toolBtn("pen", <PenTool size={18} />, "Pen")}
        {toolBtn("highlighter", <Highlighter size={18} />, "Highlighter")}
        {toolBtn("eraser", <Eraser size={18} />, "Eraser")}
        {toolBtn("line", <Minus size={18} />, "Line")}
        {toolBtn("arrow", <MoveRight size={18} />, "Arrow")}
        {toolBtn("rect", <Square size={18} />, "Rectangle")}
        {toolBtn("circle", <Circle size={18} />, "Circle")}
        {toolBtn("graph", <Grid3X3 size={18} />, "Graph axes")}
        {toolBtn("pan", <Hand size={18} />, "Pan (or use two fingers)")}

        <div className="mx-1 h-7 w-px bg-border" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`color ${c}`}
              className={`h-7 w-7 rounded-full border-2 ${
                color === c ? "border-foreground scale-110" : "border-border"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-7 w-7 cursor-pointer rounded-md border border-border bg-transparent p-0"
            aria-label="Custom color"
          />
        </div>

        <div className="mx-1 h-7 w-px bg-border" />

        {/* Width */}
        {tool === "eraser" ? (
          <label className="flex items-center gap-2 text-xs text-slate-700">
            Eraser
            <input
              type="range"
              min={10}
              max={120}
              value={eraserSize}
              onChange={(e) => setEraserSize(Number(e.target.value))}
            />
            <span className="w-8 text-right tabular-nums">{eraserSize}</span>
          </label>
        ) : (
          <label className="flex items-center gap-2 text-xs text-slate-700">
            Size
            <input
              type="range"
              min={1}
              max={24}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
            <span className="w-8 text-right tabular-nums">{width}</span>
          </label>
        )}

        <div className="mx-1 h-7 w-px bg-border" />

        <button onClick={undo} title="Undo" className="rounded-md border border-border bg-background p-2 hover:bg-muted">
          <Undo2 size={18} />
        </button>
        <button onClick={redo} title="Redo" className="rounded-md border border-border bg-background p-2 hover:bg-muted">
          <Redo2 size={18} />
        </button>
        <button
          onClick={clearPage}
          title="Clear page (tutor)"
          className="rounded-md border border-border bg-background p-2 hover:bg-muted disabled:opacity-50"
          disabled={!isHost}
        >
          <Trash2 size={18} />
        </button>

        {isHost && (
          <button
            onClick={() => setStudentCanDraw((v) => !v)}
            title={studentCanDraw ? "Lock student drawing" : "Unlock student drawing"}
            className={`flex items-center gap-1 rounded-md p-2 text-sm text-white ${
              studentCanDraw ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {studentCanDraw ? <Unlock size={16} /> : <Lock size={16} />}
            <span className="hidden sm:inline">{studentCanDraw ? "Students can draw" : "Students locked"}</span>
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => goPage(page - 1)}
            disabled={page === 0}
            className="rounded-md border border-border bg-background p-2 hover:bg-muted disabled:opacity-40"
            title="Previous page"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-slate-700 tabular-nums">
            Page {page + 1} / {pageCount}
          </span>
          <button
            onClick={() => goPage(page + 1)}
            className="rounded-md border border-border bg-background p-2 hover:bg-muted"
            title="Next page"
          >
            <ChevronRight size={18} />
          </button>

          <button
            onClick={handleAIConvert}
            disabled={isConverting}
            className="ml-2 flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <Sparkles size={16} className={isConverting ? "animate-spin" : ""} />
            {isConverting ? "Converting…" : "AI Convert"}
          </button>
        </div>
      </div>

      {/* Board */}
      <div
        ref={wrapRef}
        className="relative flex-1 overflow-hidden bg-slate-200"
        style={{ touchAction: "none" }}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={finishPointer}
            onPointerCancel={finishPointer}
            onPointerLeave={(e) => {
              if (pointersRef.current.has(e.pointerId)) finishPointer(e);
            }}
            onContextMenu={(e) => e.preventDefault()}
            className="block bg-white shadow-xl ring-1 ring-slate-300"
            style={{
              touchAction: "none",
              cursor:
                tool === "pan"
                  ? "grab"
                  : tool === "eraser"
                    ? "cell"
                    : "crosshair",
            }}
          />
        </div>

        {!canDraw && (
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-rose-600/90 px-3 py-1 text-xs text-white shadow">
            Tutor has locked drawing
          </div>
        )}

        <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] text-white">
          Pinch to zoom · two fingers to pan · stylus & finger supported
        </div>
      </div>

      {/* AI result */}
      {aiResult !== null && (
        <div className="border-t bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800">AI transcription</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(aiResult);
                  toast.success("Copied");
                }}
                className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
              >
                <CopyIcon size={12} /> Copy
              </button>
              <button
                onClick={() => setAiResult(null)}
                className="rounded-md border border-border bg-background p-1 hover:bg-muted"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-xs text-slate-800">
            {aiResult}
          </pre>
          <p className="mt-1 text-[10px] text-slate-500">
            Equations are returned as LaTeX between $$…$$. Plain notes stay as text.
          </p>
        </div>
      )}
    </div>
  );
}

export default Whiteboard;
