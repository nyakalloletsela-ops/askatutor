import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Pen, Eraser, Trash2, ChevronUp, ChevronDown, Undo2, Redo2,
  Lock, Type,
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
type AnyItem = Stroke | TextItem;
type ClearMsg = { type: "clear"; page?: number };
type UndoMsg = { type: "undo"; id: string };
type RestoreMsg = { type: "restore"; stroke: AnyItem };
type PermMsg = { type: "perm"; studentCanDraw: boolean };
type Msg = Stroke | TextItem | ClearMsg | UndoMsg | RestoreMsg | PermMsg;


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

  // remember all items so we can redraw on resize
  const historyRef = useRef<AnyItem[]>([]);

  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(3);
  const [mode, setMode] = useState<"pen" | "eraser" | "text">("pen");
  const [currentPage, setCurrentPage] = useState(1);
  // Tutor controls whether the student can draw. Default: only host draws.
  const [studentCanDraw, setStudentCanDraw] = useState(false);
  const canDraw = isHost || studentCanDraw;
  // inline text editor state
  const [textEditor, setTextEditor] = useState<
    { page: number; x: number; y: number; value: string } | null
  >(null);
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
      historyRef.current.forEach(renderItem);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── load persisted strokes & RESET when room changes ──────────
  useEffect(() => {
    // Clear local state so switching between student rooms doesn't bleed
    // previous content / undo history into the new room.
    historyRef.current = [];
    myUndoStackRef.current = [];
    myRedoStackRef.current = [];
    canvasRefs.current.forEach((c) => {
      const ctx = c?.getContext("2d");
      if (ctx && c) ctx.clearRect(0, 0, c.width, c.height);
    });
    setTextEditor(null);
    setUndoTick((t) => t + 1);

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("whiteboard_strokes")
        .select("data")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });
      if (cancelled || !data) return;
      for (const row of data as Array<{ data: AnyItem }>) {
        const s = row.data;
        if (s && (s.type === "stroke" || s.type === "text")) {
          historyRef.current.push(s);
          renderItem(s);
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);


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

  // ── persistence helpers ───────────────────────────────────
  const persistStroke = (item: AnyItem) => {
    supabase
      .from("whiteboard_strokes")
      .insert({
        room_id: roomId,
        stroke_id: item.id,
        user_id: userId,
        page: item.page,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: item as any,
      })
      .then(({ error }) => {
        if (error) console.warn("whiteboard persist failed", error.message);
      });
  };

  const deletePersistedStroke = (strokeId: string) => {
    supabase
      .from("whiteboard_strokes")
      .delete()
      .eq("room_id", roomId)
      .eq("stroke_id", strokeId)
      .then(() => undefined);
  };
  const deletePersistedPage = (page: number) => {
    supabase
      .from("whiteboard_strokes")
      .delete()
      .eq("room_id", roomId)
      .eq("page", page)
      .then(() => undefined);
  };

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

  const renderText = (t: TextItem) => {
    const ctx = canvasRefs.current[t.page]?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "source-over";
    const fontPx = Math.max(12, t.size * 5);
    ctx.font = `${fontPx}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = t.color;
    ctx.textBaseline = "top";
    const lines = t.text.split("\n");
    lines.forEach((line, i) => ctx.fillText(line, t.x, t.y + i * fontPx * 1.2));
  };

  const renderItem = (item: AnyItem) => {
    if (item.type === "stroke") renderStroke(item);
    else renderText(item);
  };

  const redrawPage = (page: number) => {
    const c = canvasRefs.current[page];
    const ctx = c?.getContext("2d");
    if (!ctx || !c) return;
    ctx.clearRect(0, 0, c.width, c.height);
    historyRef.current.filter((s) => s.page === page).forEach(renderItem);
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
      renderItem(m.stroke);
      return;
    }
    if (m.type === "perm") {
      setStudentCanDraw(m.studentCanDraw);
      return;
    }
    // stroke or text
    historyRef.current.push(m);
    renderItem(m);
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

    if (!canDraw) return; // student without permission can only view + scroll

    // text mode: open inline editor at click position
    if (mode === "text") {
      const canvas = canvasRefs.current[page]!;
      const p = localPos(canvas, e.clientX, e.clientY);
      setTextEditor({ page, x: p.x, y: p.y, value: "" });
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

    // drawing (pen/eraser only)
    if (mode === "text") return;
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
    if (mode === "text") return;
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
      sendItem(stroke);
    }
    drawingRef.current.active = false;
    drawingRef.current.points = [];
    drawingRef.current.page = -1;
  };

  const commitText = () => {
    if (!textEditor) return;
    const value = textEditor.value.trim();
    if (!value) { setTextEditor(null); return; }
    const item: TextItem = {
      type: "text",
      page: textEditor.page,
      x: textEditor.x,
      y: textEditor.y,
      text: value,
      color,
      size,
      id: `${userId}-t-${Date.now()}`,
    };
    historyRef.current.push(item);
    renderText(item);
    sendItem(item);
    setTextEditor(null);
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

  // ── undo / redo (per-user, owns own items only) ───────────
  const myUndoStackRef = useRef<AnyItem[]>([]);
  const myRedoStackRef = useRef<AnyItem[]>([]);
  const [undoTick, setUndoTick] = useState(0);

  // patch send to track own items
  const sendItem = (item: AnyItem) => {
    myUndoStackRef.current.push(item);
    myRedoStackRef.current = [];
    setUndoTick((t) => t + 1);
    send(item);
    persistStroke(item);
  };

  const undo = () => {
    const item = myUndoStackRef.current.pop();
    if (!item) return;
    myRedoStackRef.current.push(item);
    const idx = historyRef.current.findIndex((s) => s.id === item.id);
    if (idx >= 0) {
      historyRef.current.splice(idx, 1);
      redrawPage(item.page);
    }
    send({ type: "undo", id: item.id });
    deletePersistedStroke(item.id);
    setUndoTick((t) => t + 1);
  };

  const redo = () => {
    const item = myRedoStackRef.current.pop();
    if (!item) return;
    myUndoStackRef.current.push(item);
    historyRef.current.push(item);
    renderItem(item);
    send({ type: "restore", stroke: item });
    persistStroke(item);
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
    deletePersistedPage(page);
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
        <Button
          size="sm"
          variant={mode === "text" ? "default" : "outline"}
          onClick={() => setMode("text")}
          title="Type with keyboard"
        >
          <Type className="mr-1 h-4 w-4" /> Text
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
        {isHost && (
          <label className="flex items-center gap-2 rounded-md border bg-background px-2 py-1 text-xs">
            {studentCanDraw ? (
              <Pen className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="font-medium">
              {studentCanDraw ? "Student writing" : "Tutor writing"}
            </span>
            <Switch
              checked={studentCanDraw}
              onCheckedChange={(v) => {
                setStudentCanDraw(v);
                send({ type: "perm", studentCanDraw: v });
              }}
              aria-label="Toggle who can write"
            />
          </label>
        )}
        {!isHost && !studentCanDraw && (
          <span className="flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Tutor is writing
          </span>
        )}
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
                        .forEach(renderItem);
                    }
                  }}
                  className={`absolute inset-0 h-full w-full ${mode === "text" ? "cursor-text" : "cursor-crosshair"}`}
                  style={{ touchAction: "none" }}
                  onPointerDown={onPointerDown(i)}
                  onPointerMove={onPointerMove(i)}
                  onPointerUp={onPointerUp(i)}
                  onPointerCancel={onPointerUp(i)}
                />
                {textEditor && textEditor.page === i && (
                  <textarea
                    autoFocus
                    value={textEditor.value}
                    onChange={(e) => setTextEditor({ ...textEditor, value: e.target.value })}
                    onBlur={commitText}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        commitText();
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        setTextEditor(null);
                      }
                    }}
                    placeholder="Type… Enter to commit, Shift+Enter for newline, Esc to cancel"
                    className="absolute z-20 min-w-[140px] resize rounded border border-primary/60 bg-white/95 px-1 py-0.5 outline-none ring-2 ring-primary/30"
                    style={{
                      left: textEditor.x,
                      top: textEditor.y,
                      color,
                      fontSize: Math.max(12, size * 5),
                      fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
                      lineHeight: 1.2,
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

