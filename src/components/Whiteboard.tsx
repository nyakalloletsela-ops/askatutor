import React, { useEffect, useRef, useState } from "react";
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
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

type Point = {
  x: number;
  y: number;
  pressure?: number;
};

type Tool =
  | "pen"
  | "highlighter"
  | "eraser"
  | "line"
  | "arrow"
  | "rect"
  | "circle"
  | "graph";

interface Stroke {
  id: string;
  tool: Tool;
  color: string;
  width: number;
  page: number;
  points: Point[];
}

const COLORS = [
  "#000000",
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
];

const PAGE_COUNT = 20;

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function AdvancedAIWhiteboard() {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(4);

  const [zoom, setZoom] = useState(1);

  const [studentCanDraw, setStudentCanDraw] = useState(true);

  const [isConverting, setIsConverting] = useState(false);

  const [spacePressed, setSpacePressed] = useState(false);

  const [isPanning, setIsPanning] = useState(false);

  const [pan, setPan] = useState({
    x: 0,
    y: 0,
  });

  const historyRef = useRef<Stroke[]>([]);
  const undoRef = useRef<Stroke[]>([]);
  const redoRef = useRef<Stroke[]>([]);

  const drawingRef = useRef({
    active: false,
    page: 0,
    points: [] as Point[],
  });

  const panStartRef = useRef({
    x: 0,
    y: 0,
  });

  // ======================================================
  // KEYBOARD EVENTS
  // ======================================================

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpacePressed(true);
      }
    };

    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // ======================================================
  // CANVAS SETUP
  // ======================================================

  const resizeCanvas = (canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.scale(dpr, dpr);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  };

  const getCtx = (canvas: HTMLCanvasElement) => {
    return canvas.getContext("2d")!;
  };

  useEffect(() => {
    canvasRefs.current.forEach((canvas) => {
      if (!canvas) return;

      resizeCanvas(canvas);
    });

    const handleResize = () => {
      canvasRefs.current.forEach((canvas, index) => {
        if (!canvas) return;

        resizeCanvas(canvas);

        redrawPage(index);
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ======================================================
  // HELPERS
  // ======================================================

  const getPoint = (
    canvas: HTMLCanvasElement,
    e: React.PointerEvent
  ): Point => {
    const rect = canvas.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
    };
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point
  ) => {
    const headLength = 12;

    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.beginPath();

    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(end.x, end.y);

    ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    );

    ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    );

    ctx.closePath();

    ctx.fill();
  };

  // ======================================================
  // DRAW STROKE
  // ======================================================

  const drawStroke = (
    ctx: CanvasRenderingContext2D,
    stroke: Stroke
  ) => {
    ctx.save();

    const points = stroke.points;

    if (points.length < 2) {
      ctx.restore();
      return;
    }

    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.width;

    // HIGHLIGHTER

    if (stroke.tool === "highlighter") {
      ctx.globalAlpha = 0.25;
    }

    // ERASER

    if (stroke.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";

      ctx.lineWidth = Math.max(20, stroke.width * 6);
    }

    // PEN / HIGHLIGHTER / ERASER

    if (
      stroke.tool === "pen" ||
      stroke.tool === "highlighter" ||
      stroke.tool === "eraser"
    ) {
      ctx.beginPath();

      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      ctx.stroke();
    }

    // LINE

    if (stroke.tool === "line") {
      ctx.beginPath();

      ctx.moveTo(points[0].x, points[0].y);

      ctx.lineTo(points[1].x, points[1].y);

      ctx.stroke();
    }

    // ARROW

    if (stroke.tool === "arrow") {
      drawArrow(ctx, points[0], points[1]);
    }

    // RECTANGLE

    if (stroke.tool === "rect") {
      ctx.strokeRect(
        points[0].x,
        points[0].y,
        points[1].x - points[0].x,
        points[1].y - points[0].y
      );
    }

    // CIRCLE

    if (stroke.tool === "circle") {
      const radius = Math.hypot(
        points[1].x - points[0].x,
        points[1].y - points[0].y
      );

      ctx.beginPath();

      ctx.arc(points[0].x, points[0].y, radius, 0, Math.PI * 2);

      ctx.stroke();
    }

    // GRAPH GRID

    if (stroke.tool === "graph") {
      const center = points[0];

      const size = 200;

      const step = 20;

      ctx.strokeStyle = "#d1d5db";

      ctx.lineWidth = 1;

      for (let x = -size; x <= size; x += step) {
        ctx.beginPath();

        ctx.moveTo(center.x + x, center.y - size);

        ctx.lineTo(center.x + x, center.y + size);

        ctx.stroke();
      }

      for (let y = -size; y <= size; y += step) {
        ctx.beginPath();

        ctx.moveTo(center.x - size, center.y + y);

        ctx.lineTo(center.x + size, center.y + y);

        ctx.stroke();
      }

      ctx.strokeStyle = "#000";

      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.moveTo(center.x - size, center.y);

      ctx.lineTo(center.x + size, center.y);

      ctx.moveTo(center.x, center.y - size);

      ctx.lineTo(center.x, center.y + size);

      ctx.stroke();
    }

    ctx.restore();
  };

  // ======================================================
  // REDRAW PAGE
  // ======================================================

  const redrawPage = (page: number) => {
    const canvas = canvasRefs.current[page];

    if (!canvas) return;

    const ctx = getCtx(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    historyRef.current
      .filter((stroke) => stroke.page === page)
      .forEach((stroke) => drawStroke(ctx, stroke));
  };

  // ======================================================
  // POINTER DOWN
  // ======================================================

  const handlePointerDown =
    (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
      // RIGHT CLICK PAN

      if (e.button === 2 || spacePressed) {
        setIsPanning(true);

        panStartRef.current = {
          x: e.clientX - pan.x,
          y: e.clientY - pan.y,
        };

        return;
      }

      // TWO FINGER TOUCH NAVIGATION

      if (e.pointerType === "touch" && e.isPrimary === false) {
        return;
      }

      if (!studentCanDraw) return;

      const canvas = canvasRefs.current[page];

      if (!canvas) return;

      canvas.setPointerCapture(e.pointerId);

      const point = getPoint(canvas, e);

      drawingRef.current = {
        active: true,
        page,
        points: [point],
      };
    };

  // ======================================================
  // POINTER MOVE
  // ======================================================

  const handlePointerMove =
    (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
      // PAN

      if (isPanning) {
        setPan({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        });

        return;
      }

      if (!drawingRef.current.active) return;

      if (drawingRef.current.page !== page) return;

      const canvas = canvasRefs.current[page];

      if (!canvas) return;

      const ctx = getCtx(canvas);

      const point = getPoint(canvas, e);

      drawingRef.current.points.push(point);

      redrawPage(page);

      drawStroke(ctx, {
        id: "preview",
        tool,
        color,
        width,
        page,
        points: drawingRef.current.points,
      });
    };

  // ======================================================
  // POINTER UP
  // ======================================================

  const handlePointerUp =
    (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isPanning) {
        setIsPanning(false);

        return;
      }

      if (!drawingRef.current.active) return;

      const stroke: Stroke = {
        id: crypto.randomUUID(),
        tool,
        color,
        width,
        page,
        points: drawingRef.current.points,
      };

      historyRef.current.push(stroke);

      undoRef.current.push(stroke);

      redoRef.current = [];

      drawingRef.current.active = false;

      redrawPage(page);
    };

  // ======================================================
  // UNDO
  // ======================================================

  const handleUndo = () => {
    const last = undoRef.current.pop();

    if (!last) return;

    redoRef.current.push(last);

    historyRef.current = historyRef.current.filter(
      (stroke) => stroke.id !== last.id
    );

    redrawPage(last.page);
  };

  // ======================================================
  // REDO
  // ======================================================

  const handleRedo = () => {
    const last = redoRef.current.pop();

    if (!last) return;

    historyRef.current.push(last);

    undoRef.current.push(last);

    redrawPage(last.page);
  };

  // ======================================================
  // CLEAR
  // ======================================================

  const handleClear = () => {
    historyRef.current = [];

    canvasRefs.current.forEach((_, index) => {
      redrawPage(index);
    });
  };

  // ======================================================
  // AI CONVERTER
  // ======================================================

  const handleAIConvert = async () => {
    setIsConverting(true);

    try {
      const canvas = canvasRefs.current[0];

      if (!canvas) return;

      const image = canvas.toDataURL("image/png");

      // Replace with backend API

      console.log(image);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(
        "AI Recognition Complete\n\nExample Output:\n\n\\\\frac{a+b}{c}"
      );
    } catch (error) {
      console.error(error);

      alert("AI conversion failed");
    }

    setIsConverting(false);
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="h-screen w-full flex flex-col bg-slate-100 overflow-hidden">
      {/* ================================================= */}
      {/* TOOLBAR */}
      {/* ================================================= */}

      <div className="flex flex-wrap items-center gap-2 p-3 bg-white border-b shadow-sm z-20">
        {/* PEN */}

        <button
          onClick={() => setTool("pen")}
          className={`p-2 rounded ${
            tool === "pen"
              ? "bg-blue-600 text-white"
              : "bg-slate-100 hover:bg-slate-200"
          }`}
        >
          <PenTool size={18} />
        </button>

        {/* HIGHLIGHTER */}

        <button
          onClick={() => setTool("highlighter")}
          className={`p-2 rounded ${
            tool === "highlighter"
              ? "bg-yellow-500 text-white"
              : "bg-slate-100 hover:bg-slate-200"
          }`}
        >
          <Highlighter size={18} />
        </button>

        {/* ERASER */}

        <button
          onClick={() => setTool("eraser")}
          className={`p-2 rounded ${
            tool === "eraser"
              ? "bg-red-500 text-white"
              : "bg-slate-100 hover:bg-slate-200"
          }`}
        >
          <Eraser size={18} />
        </button>

        {/* LINE */}

        <button
          onClick={() => setTool("line")}
          className="p-2 rounded bg-slate-100 hover:bg-slate-200"
        >
          <Minus size={18} />
        </button>

        {/* ARROW */}

        <button
          onClick={() => setTool("arrow")}
          className="p-2 rounded bg-slate-100 hover:bg-slate-200"
        >
          <MoveRight size={18} />
        </button>

        {/* RECT */}

        <button
          onClick={() => setTool("rect")}
          className="p-2 rounded bg-slate-100 hover:bg-slate-200"
        >
          <Square size={18} />
        </button>

        {/* CIRCLE */}

        <button
          onClick={() => setTool("circle")}
          className="p-2 rounded bg-slate-100 hover:bg-slate-200"
        >
          <Circle size={18} />
        </button>

        {/* GRAPH */}

        <button
          onClick={() => setTool("graph")}
          className="p-2 rounded bg-slate-100 hover:bg-slate-200"
        >
          <Grid3X3 size={18} />
        </button>

        {/* COLORS */}

        <div className="flex items-center gap-2 ml-3">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 ${
                color === c
                  ? "border-black scale-110"
                  : "border-transparent"
              }`}
              style={{
                backgroundColor: c,
              }}
            />
          ))}
        </div>

        {/* WIDTH */}

        <div className="flex items-center gap-2 ml-4">
          <input
            type="range"
            min="1"
            max="20"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />

          <span className="text-sm font-medium">
            {width}px
          </span>
        </div>

        {/* UNDO */}

        <button
          onClick={handleUndo}
          className="p-2 rounded bg-slate-100 hover:bg-slate-200 ml-4"
        >
          <Undo2 size={18} />
        </button>

        {/* REDO */}

        <button
          onClick={handleRedo}
          className="p-2 rounded bg-slate-100 hover:bg-slate-200"
        >
          <Redo2 size={18} />
        </button>

        {/* CLEAR */}

        <button
          onClick={handleClear}
          className="p-2 rounded bg-slate-100 hover:bg-slate-200"
        >
          <Trash2 size={18} />
        </button>

        {/* LOCK */}

        <button
          onClick={() =>
            setStudentCanDraw(!studentCanDraw)
          }
          className={`p-2 rounded ml-4 ${
            studentCanDraw
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {studentCanDraw ? (
            <Unlock size={18} />
          ) : (
            <Lock size={18} />
          )}
        </button>

        {/* AI */}

        <button
          onClick={handleAIConvert}
          disabled={isConverting}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Sparkles
            className={isConverting ? "animate-spin" : ""}
            size={18}
          />

          AI Convert
        </button>
      </div>

      {/* ================================================= */}
      {/* BOARD */}
      {/* ================================================= */}

      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 md:p-8 space-y-8"
        onWheel={(e) => {
          if (e.ctrlKey) {
            e.preventDefault();

            setZoom((prev) => {
              const next =
                e.deltaY > 0
                  ? prev - 0.1
                  : prev + 0.1;

              return Math.min(Math.max(next, 0.5), 3);
            });
          }
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "top center",
          }}
        >
          {Array.from({ length: PAGE_COUNT }).map((_, i) => (
            <div
              key={i}
              className="relative max-w-6xl mx-auto mb-8"
            >
              {/* PAGE LABEL */}

              <div className="absolute -left-12 top-0 hidden md:block text-xs text