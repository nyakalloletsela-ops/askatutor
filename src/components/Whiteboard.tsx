import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Pen, Eraser, Trash2, ChevronUp, ChevronDown, Undo2, Redo2,
  ChevronsUp, ChevronsDown, Lock,
} from "lucide-react";

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
type ClearMsg = { type: "clear"; page?: number };
type UndoMsg = { type: "undo"; id: string };
type RestoreMsg = { type: "restore"; stroke: Stroke };
type PermMsg = { type: "perm"; studentCanDraw: boolean };
type Msg = Stroke | ClearMsg | UndoMsg | RestoreMsg | PermMsg;

const COLORS = ["#0f172a", "#dc2626", "#2563eb", "#16a34a"];
const PAGE_COUNT = 100;

interface Props {
  roomId: string;
  userId: string;
  /** When true the user is treated as the room host (tutor/admin) and can
   *  toggle whether the other participant is allowed to draw. */
  isHost?: boolean;
}

export function Whiteboard({ roomId, userId, isHost = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // active drawing state
  const drawingRef = useRef<{
    active: boolean;
    page: number;
    points: Pt[];
    id: string;
  }>({ active: false, page: -1, points: [], id: "" });

  // multi-touch tracking for 2-finger scroll
  const pointersRef = useRef<Map<number, Pt>>(new Map());
  const scrollStartRef = useRef<{ scrollTop: number; midY: number }>({
    scrollTop: 0,
    midY: 0,
  });

  // remember all strokes so we can redraw on resize
  const historyRef = useRef<Stroke[]>([]);

  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(3);
  const [mode, setMode] = useState<"pen" | "eraser">("pen");
  const [currentPage, setCurrentPage] = useState(1);
  // Tutor controls whether the student can draw. Default: only host draws.
  const [studentCanDraw, setStudentCanDraw] = useState(false);
  const canDraw = isHost || studentCanDraw;
  // Collapse the toolbar (handy in landscape on small screens).
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape) and (max-height: 500px)");
    const apply = () => setToolbarCollapsed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const pages = useMemo(() => Array.from({ length: PAGE_COUNT }, (_, i) => i), []);

  // ── canvas sizing (per page) ────────────────────────────────
  const sizeCanvas = (canvas: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return false;
    const targetW = Math.floor(rect.width * dpr);
    const targetH = Math.floor(rect.height * dpr);
    // Skip if already sized — assigning width/height clears the canvas
    if (canvas.width === targetW && canvas.height === targetH) return false;
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    return true;
  };


  useEffect(() => {
    const onResize = () => {
      canvasRefs.current.forEach((c) => c && sizeCanvas(c));
      // redraw history
      historyRef.current.forEach(renderStroke);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── realtime ────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase.channel(`whiteboard:${roomId}`, {
      config: { broadcast: { self: false } },
    });
    channel
      .on("broadcast", { event: "draw" }, ({ payload }) => applyMessage(payload as Msg))
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && isHost) {
          channel.send({
            type: "broadcast",
            event: "draw",
            payload: { type: "perm", studentCanDraw } as PermMsg,
          });
        }
      });
    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // ── drawing helpers ────────────────────────────────────────
  const drawSegment = (
    page: number,
    a: Pt,
    b: Pt,
    c: string,
    sz: number,
    m: "pen" | "eraser",
  ) => {
    const ctx = canvasRefs.current[page]?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = m === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = c;
    ctx.lineWidth = sz;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };

  const renderStroke = (s: Stroke) => {
    for (let i = 1; i < s.points.length; i++) {
      drawSegment(s.page, s.points[i - 1], s.points[i], s.color, s.size, s.mode);
    }
  };

  const redrawPage = (page: number) => {
    const c = canvasRefs.current[page];
    const ctx = c?.getContext("2d");
    if (!ctx || !c) return;
    ctx.clearRect(0, 0, c.width, c.height);
    historyRef.current.filter((s) => s.page === page).forEach(renderStroke);
  };

  const applyMessage = (m: Msg) => {
    if (m.type === "clear") {
      if (m.page == null) {
        canvasRefs.current.forEach((c) => {
          const ctx = c?.getContext("2d");
          if (ctx && c) ctx.clearRect(0, 0, c.width, c.height);
        });
        historyRef.current = [];
      } else {
        const c = canvasRefs.current[m.page];
        const ctx = c?.getContext("2d");
        if (ctx && c) ctx.clearRect(0, 0, c.width, c.height);
        historyRef.current = historyRef.current.filter((s) => s.page !== m.page);
      }
      return;
    }
    if (m.type === "undo") {
      const idx = historyRef.current.findIndex((s) => s.id === m.id);
      if (idx >= 0) {
        const [removed] = historyRef.current.splice(idx, 1);
        redrawPage(removed.page);
      }
      return;
    }
    if (m.type === "restore") {
      historyRef.current.push(m.stroke);
      renderStroke(m.stroke);
      return;
    }
    if (m.type === "perm") {
      setStudentCanDraw(m.studentCanDraw);
      return;
    }
    historyRef.current.push(m);
    renderStroke(m);
  };

  const send = (m: Msg) => {
    channelRef.current?.send({ type: "broadcast", event: "draw", payload: m });
  };

  // ── pointer/touch routing ──────────────────────────────────
  const localPos = (canvas: HTMLCanvasElement, clientX: number, clientY: number): Pt => {
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const cancelActiveStroke = () => {
    drawingRef.current.active = false;
    drawingRef.current.points = [];
    drawingRef.current.page = -1;
  };

  const onPointerDown = (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2) {
      // switch to 2-finger scroll mode — abort any in-progress stroke
      cancelActiveStroke();
      const ys = [...pointersRef.current.values()].map((p) => p.y);
      scrollStartRef.current = {
        scrollTop: containerRef.current?.scrollTop ?? 0,
        midY: ys.reduce((a, b) => a + b, 0) / ys.length,
      };
      return;
    }

    // single touch / mouse — start drawing
    if (e.pointerType !== "touch") {
      (e.target as Element).setPointerCapture?.(e.pointerId);
    }
    e.preventDefault();
    const canvas = canvasRefs.current[page]!;
    drawingRef.current = {
      active: true,
      page,
      points: [localPos(canvas, e.clientX, e.clientY)],
      id: `${userId}-${Date.now()}`,
    };
  };

  const onPointerMove = (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // 2-finger scroll
    if (pointersRef.current.size >= 2) {
      e.preventDefault();
      const ys = [...pointersRef.current.values()].map((p) => p.y);
      const midY = ys.reduce((a, b) => a + b, 0) / ys.length;
      if (containerRef.current) {
        containerRef.current.scrollTop =
          scrollStartRef.current.scrollTop - (midY - scrollStartRef.current.midY);
      }
      return;
    }

    // drawing
    if (!drawingRef.current.active || drawingRef.current.page !== page) return;
    e.preventDefault();
    const canvas = canvasRefs.current[page]!;
    const p = localPos(canvas, e.clientX, e.clientY);
    const prev = drawingRef.current.points[drawingRef.current.points.length - 1];
    drawingRef.current.points.push(p);
    drawSegment(page, prev, p, color, size, mode);
  };

  const onPointerUp = (page: number) => (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (!drawingRef.current.active || drawingRef.current.page !== page) return;
    if (drawingRef.current.points.length > 1) {
      const stroke: Stroke = {
        type: "stroke",
        page,
        points: drawingRef.current.points,
        color,
        size,
        mode,
        id: drawingRef.current.id,
      };
      historyRef.current.push(stroke);
      sendStroke(stroke);
    }
    drawingRef.current.active = false;
    drawingRef.current.points = [];
    drawingRef.current.page = -1;
  };

  // Track which page is "current" while scrolling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const top = el.scrollTop + el.clientHeight / 3;
      let found = 1;
      for (let i = 0; i < canvasRefs.current.length; i++) {
        const c = canvasRefs.current[i];
        if (!c) continue;
        const wrap = c.parentElement!;
        if (wrap.offsetTop <= top) found = i + 1;
        else break;
      }
      setCurrentPage(found);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goToPage = (n: number) => {
    const p = Math.max(1, Math.min(PAGE_COUNT, n));
    const c = canvasRefs.current[p - 1];
    c?.parentElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── undo / redo (per-user, owns own strokes only) ───────────
  const myUndoStackRef = useRef<Stroke[]>([]); // own strokes in order
  const myRedoStackRef = useRef<Stroke[]>([]); // undone strokes ready to redo
  const [undoTick, setUndoTick] = useState(0);

  // patch send to track own strokes
  const sendStroke = (stroke: Stroke) => {
    myUndoStackRef.current.push(stroke);
    myRedoStackRef.current = [];
    setUndoTick((t) => t + 1);
    send(stroke);
  };

  const undo = () => {
    const stroke = myUndoStackRef.current.pop();
    if (!stroke) return;
    myRedoStackRef.current.push(stroke);
    const idx = historyRef.current.findIndex((s) => s.id === stroke.id);
    if (idx >= 0) {
      historyRef.current.splice(idx, 1);
      redrawPage(stroke.page);
    }
    send({ type: "undo", id: stroke.id });
    setUndoTick((t) => t + 1);
  };

  const redo = () => {
    const stroke = myRedoStackRef.current.pop();
    if (!stroke) return;
    myUndoStackRef.current.push(stroke);
    historyRef.current.push(stroke);
    renderStroke(stroke);
    send({ type: "restore", stroke });
    setUndoTick((t) => t + 1);
  };

  const clearCurrent = () => {
    const page = currentPage - 1;
    const c = canvasRefs.current[page];
    const ctx = c?.getContext("2d");
    if (ctx && c) ctx.clearRect(0, 0, c.width, c.height);
    historyRef.current = historyRef.current.filter((s) => s.page !== page);
    myUndoStackRef.current = myUndoStackRef.current.filter((s) => s.page !== page);
    myRedoStackRef.current = myRedoStackRef.current.filter((s) => s.page !== page);
    setUndoTick((t) => t + 1);
    send({ type: "clear", page });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 p-2">
        <Button
          size="sm"
          variant={mode === "pen" ? "default" : "outline"}
          onClick={() => setMode("pen")}
        >
          <Pen className="mr-1 h-4 w-4" /> Pen
        </Button>
        <Button
          size="sm"
          variant={mode === "eraser" ? "default" : "outline"}
          onClick={() => setMode("eraser")}
        >
          <Eraser className="mr-1 h-4 w-4" /> Eraser
        </Button>
        <div className="mx-1 h-6 w-px bg-border" />
        {COLORS.map((c) => (
          <button
            key={c}
            aria-label={`color ${c}`}
            onClick={() => {
              setColor(c);
              setMode("pen");
            }}
            className={`h-7 w-7 rounded-full border-2 ${
              color === c ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
            style={{ backgroundColor: c, borderColor: "white" }}
          />
        ))}
        <div className="mx-1 h-6 w-px bg-border" />
        <input
          type="range"
          min={1}
          max={20}
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-20"
        />
        <span className="text-xs text-muted-foreground">{size}px</span>
        <div className="mx-1 h-6 w-px bg-border" />
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={undo}
          disabled={myUndoStackRef.current.length === 0}
          aria-label="Undo"
          title="Undo"
          data-undo-tick={undoTick}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={redo}
          disabled={myRedoStackRef.current.length === 0}
          aria-label="Redo"
          title="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-6 w-px bg-border" />
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => goToPage(currentPage - 1)}
            aria-label="Previous page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className="text-xs tabular-nums text-muted-foreground">
            {currentPage}/{PAGE_COUNT}
          </span>
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => goToPage(currentPage + 1)}
            aria-label="Next page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <div className="ml-auto" />
        <Button size="sm" variant="destructive" onClick={clearCurrent}>
          <Trash2 className="mr-1 h-4 w-4" /> Clear page
        </Button>
      </div>

      {/* Hint */}
      <div className="border-b bg-muted/20 px-3 py-1 text-[11px] text-muted-foreground">
        Draw with one finger · scroll with two fingers · {PAGE_COUNT} pages
      </div>

      {/* Pages — scrollable container */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-y-auto overscroll-contain bg-muted/30"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="mx-auto flex w-full flex-col gap-4 px-2 py-2">
          {pages.map((i) => (
            <div key={i} className="relative">
              <div
                className="relative w-full overflow-hidden rounded-md border bg-white shadow-sm"
                style={{ height: "calc(100vh - 180px)", minHeight: 400 }}
              >
                <span className="pointer-events-none absolute right-2 top-1 z-10 text-[10px] text-muted-foreground/70">
                  Page {i + 1}
                </span>
                <canvas
                  ref={(el) => {
                    canvasRefs.current[i] = el;
                    if (el && sizeCanvas(el)) {
                      historyRef.current
                        .filter((s) => s.page === i)
                        .forEach(renderStroke);
                    }
                  }}
                  className="absolute inset-0 h-full w-full cursor-crosshair"
                  style={{ touchAction: "none" }}
                  onPointerDown={onPointerDown(i)}
                  onPointerMove={onPointerMove(i)}
                  onPointerUp={onPointerUp(i)}
                  onPointerCancel={onPointerUp(i)}
                />

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
