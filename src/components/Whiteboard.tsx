import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
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
  Sigma,
  Wand2,
  ImageIcon,
} from "lucide-react";
import { MathTools } from "@/components/MathTools";
import { useServerFn } from "@tanstack/react-start";
import { whiteboardConvert } from "@/lib/whiteboard-ai.functions";
import { toast } from "sonner";
import { Rnd } from "react-rnd"; // NEW: Drag and drop library

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
type ImageItem = {
  type: "image";
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
  src: string; // data URL
  id: string;
};
type AnyItem = Stroke | TextItem | ImageItem;

// NEW: Added UpdateMsg to sync dragging and resizing across the network
type ClearMsg = { type: "clear"; page?: number };
type UndoMsg = { type: "undo"; id: string };
type RestoreMsg = { type: "restore"; stroke: AnyItem };
type PermMsg = { type: "perm"; studentCanDraw: boolean };
type UpdateMsg = { type: "update"; id: string; changes: Partial<AnyItem> };
type Msg = Stroke | TextItem | ImageItem | ClearMsg | UndoMsg | RestoreMsg | PermMsg | UpdateMsg;

const COLORS = ["#0f172a", "#dc2626", "#2563eb", "#16a34a"];
const PAGE_COUNT = 100;

interface Props {
  roomId: string;
  userId: string;
  isHost?: boolean;
}

export function Whiteboard({ roomId, userId, isHost = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const drawingRef = useRef<{
    active: boolean;
    page: number;
    points: Pt[];
    id: string;
  }>({ active: false, page: -1, points: [], id: "" });

  const pointersRef = useRef<Map<number, Pt>>(new Map());
  const scrollStartRef = useRef<{ scrollTop: number; midY: number }>({
    scrollTop: 0,
    midY: 0,
  });

  const historyRef = useRef<AnyItem[]>([]);

  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(3);
  const [mode, setMode] = useState<"pen" | "eraser" | "text">("pen");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentCanDraw, setStudentCanDraw] = useState(false);
  const canDraw = isHost || studentCanDraw;

  const [textEditor, setTextEditor] = useState<{
    page: number;
    x: number;
    y: number;
    value: string;
    editingId?: string;
  } | null>(null);
  const [textTick, setTextTick] = useState(0);
  const bumpText = useCallback(() => setTextTick((t) => t + 1), []);

  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [mathOpen, setMathOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape) and (max-height: 500px)");
    const apply = () => setToolbarCollapsed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const pages = useMemo(() => Array.from({ length: PAGE_COUNT }, (_, i) => i), []);

  const sizeCanvas = (canvas: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return false;
    const targetW = Math.floor(rect.width * dpr);
    const targetH = Math.floor(rect.height * dpr);
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
  }, []);

  useEffect(() => {
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
        if (s && (s.type === "stroke" || s.type === "text" || s.type === "image")) {
          historyRef.current.push(s);
          renderItem(s);
        }
      }
      bumpText();
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

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
  }, [roomId]);

  const persistStroke = (item: AnyItem) => {
    supabase
      .from("whiteboard_strokes")
      .insert({
        room_id: roomId,
        stroke_id: item.id,
        user_id: userId,
        page: item.page,
        data: item as any,
      })
      .then(({ error }) => {
        if (error) console.warn("whiteboard persist failed", error.message);
      });
  };

  const deletePersistedStroke = (strokeId: string) => {
    supabase.from("whiteboard_strokes").delete().eq("room_id", roomId).eq("stroke_id", strokeId).then();
  };

  const deletePersistedPage = (page: number) => {
    supabase.from("whiteboard_strokes").delete().eq("room_id", roomId).eq("page", page).then();
  };

  // NEW: Update persistent item state in DB for drags/resizes
  const updatePersistedItem = useCallback(
    (id: string, changes: Partial<AnyItem>) => {
      const itemIdx = historyRef.current.findIndex((i) => i.id === id);
      if (itemIdx === -1) return;

      const updatedItem = { ...historyRef.current[itemIdx], ...changes } as AnyItem;
      historyRef.current[itemIdx] = updatedItem;

      // Broadcast to peers
      channelRef.current?.send({ type: "broadcast", event: "draw", payload: { type: "update", id, changes } });

      // Save to DB
      supabase
        .from("whiteboard_strokes")
        .update({ data: updatedItem as any })
        .eq("room_id", roomId)
        .eq("stroke_id", id)
        .then();

      bumpText();
    },
    [roomId, bumpText],
  );

  const drawSegment = (page: number, a: Pt, b: Pt, c: string, sz: number, m: "pen" | "eraser") => {
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

  const renderText = (_t: TextItem) => {
    // Intentionally do nothing on canvas
  };

  const renderImage = (_it: ImageItem) => {
    // UPGRADE: Intentionally do nothing on canvas so image remains draggable HTML overlay
  };

  const renderItem = (item: AnyItem) => {
    if (item.type === "stroke") renderStroke(item);
    else if (item.type === "text") renderText(item);
    else renderImage(item);
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
      bumpText();
      return;
    }
    if (m.type === "undo") {
      const idx = historyRef.current.findIndex((s) => s.id === m.id);
      if (idx >= 0) {
        const [removed] = historyRef.current.splice(idx, 1);
        redrawPage(removed.page);
        if (removed.type === "text" || removed.type === "image") bumpText();
      }
      return;
    }
    if (m.type === "restore") {
      historyRef.current.push(m.stroke);
      renderItem(m.stroke);
      if (m.stroke.type === "text" || m.stroke.type === "image") bumpText();
      return;
    }
    if (m.type === "perm") {
      setStudentCanDraw(m.studentCanDraw);
      return;
    }
    // NEW: Handle incoming updates for drag/resize
    if (m.type === "update") {
      const idx = historyRef.current.findIndex((s) => s.id === m.id);
      if (idx >= 0) {
        historyRef.current[idx] = { ...historyRef.current[idx], ...m.changes } as AnyItem;
        bumpText();
      }
      return;
    }

    historyRef.current.push(m);
    renderItem(m);
    if (m.type === "text" || m.type === "image") bumpText();
  };

  const send = (m: Msg) => {
    channelRef.current?.send({ type: "broadcast", event: "draw", payload: m });
  };

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
      cancelActiveStroke();
      const ys = [...pointersRef.current.values()].map((p) => p.y);
      scrollStartRef.current = {
        scrollTop: containerRef.current?.scrollTop ?? 0,
        midY: ys.reduce((a, b) => a + b, 0) / ys.length,
      };
      return;
    }

    if (!canDraw) return;

    if (mode === "text") {
      const canvas = canvasRefs.current[page]!;
      const p = localPos(canvas, e.clientX, e.clientY);
      setTextEditor({ page, x: p.x, y: p.y, value: "" });
      return;
    }

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

    if (pointersRef.current.size >= 2) {
      e.preventDefault();
      const ys = [...pointersRef.current.values()].map((p) => p.y);
      const midY = ys.reduce((a, b) => a + b, 0) / ys.length;
      if (containerRef.current) {
        containerRef.current.scrollTop = scrollStartRef.current.scrollTop - (midY - scrollStartRef.current.midY);
      }
      return;
    }

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

  const commitText = useCallback(() => {
    if (!textEditor) return;
    const value = textEditor.value;
    if (textEditor.editingId) {
      const idx = historyRef.current.findIndex((s) => s.id === textEditor.editingId);
      if (idx >= 0) historyRef.current.splice(idx, 1);
      send({ type: "undo", id: textEditor.editingId });
      deletePersistedStroke(textEditor.editingId);
    }
    if (!value.trim()) {
      setTextEditor(null);
      bumpText();
      return;
    }
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
    sendItem(item);
    bumpText();
    setTextEditor(null);
  }, [textEditor, color, size, userId]);

  const placeImage = useCallback(
    (dataUrl: string, page: number) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRefs.current[page];
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const max = Math.min(rect.width, rect.height) * 0.6;
        const ratio = Math.min(max / img.naturalWidth, max / img.naturalHeight, 1);
        const w = img.naturalWidth * ratio;
        const h = img.naturalHeight * ratio;
        const x = Math.max(20, (rect.width - w) / 2);
        const y = 30;
        const item: ImageItem = {
          type: "image",
          page,
          x,
          y,
          w,
          h,
          src: dataUrl,
          id: `${userId}-i-${Date.now()}`,
        };
        historyRef.current.push(item);
        sendItem(item);
        bumpText(); // Trigger re-render to show image
      };
      img.src = dataUrl;
    },
    [userId],
  );

  useEffect(() => {
    if (!canDraw) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === "file" && it.type.startsWith("image/")) {
          const file = it.getAsFile();
          if (!file) continue;
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") {
              placeImage(result, currentPage - 1);
              toast.success("Image pasted to page " + currentPage);
            }
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [canDraw, currentPage, placeImage]);

  const convert = useServerFn(whiteboardConvert);
  const [converting, setConverting] = useState(false);

  const runOcr = async () => {
    const page = currentPage - 1;
    const canvas = canvasRefs.current[page];
    if (!canvas) return;
    setConverting(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const { text } = await convert({ data: { imageDataUrl: dataUrl } });
      if (!text) {
        toast.message("Nothing recognised on this page.");
        return;
      }
      const strokeIds = historyRef.current.filter((it) => it.page === page && it.type === "stroke").map((it) => it.id);
      historyRef.current = historyRef.current.filter((it) => !(it.page === page && it.type === "stroke"));
      redrawPage(page);
      strokeIds.forEach((id) => {
        send({ type: "undo", id });
        deletePersistedStroke(id);
      });
      const item: TextItem = {
        type: "text",
        page,
        x: 20,
        y: 20,
        text,
        color: "#0f172a",
        size: 4,
        id: `${userId}-ocr-${Date.now()}`,
      };
      historyRef.current.push(item);
      sendItem(item);
      bumpText();
      toast.success("Handwriting converted — click the equation to edit");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setConverting(false);
    }
  };

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

  const myUndoStackRef = useRef<AnyItem[]>([]);
  const myRedoStackRef = useRef<AnyItem[]>([]);
  const [undoTick, setUndoTick] = useState(0);

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
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 p-2 z-20">
        <Button size="sm" variant={mode === "pen" ? "default" : "outline"} onClick={() => setMode("pen")}>
          <Pen className="mr-1 h-4 w-4" /> Pen
        </Button>
        <Button size="sm" variant={mode === "eraser" ? "default" : "outline"} onClick={() => setMode("eraser")}>
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
            className={`h-7 w-7 rounded-full border-2 ${color === c ? "ring-2 ring-primary ring-offset-2" : ""}`}
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
            <span className="font-medium">{studentCanDraw ? "Student writing" : "Tutor writing"}</span>
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
        <Button size="sm" variant="outline" onClick={() => setMathOpen(true)} title="Math & Science tools">
          <Sigma className="mr-1 h-4 w-4" /> Math
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={runOcr}
          disabled={converting || !canDraw}
          title="Convert handwriting on this page to LaTeX & text (AI)"
        >
          <Wand2 className="mr-1 h-4 w-4" /> {converting ? "Converting…" : "AI convert"}
        </Button>
        <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs hover:bg-accent">
          <ImageIcon className="h-3.5 w-3.5" /> Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") placeImage(reader.result, currentPage - 1);
              };
              reader.readAsDataURL(file);
              e.target.value = "";
            }}
          />
        </label>
        <Button size="sm" variant="destructive" onClick={clearCurrent}>
          <Trash2 className="mr-1 h-4 w-4" /> Clear page
        </Button>
      </div>
      <MathTools open={mathOpen} onClose={() => setMathOpen(false)} />

      <div className="border-b bg-muted/20 px-3 py-1 text-[11px] text-muted-foreground">
        Draw: 1 finger · Scroll: 2 fingers · Drag/Zoom Elements · Paste: Ctrl/Cmd+V
      </div>

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
                      historyRef.current.filter((s) => s.page === i).forEach(renderItem);
                    }
                  }}
                  className={`absolute inset-0 h-full w-full ${mode === "text" ? "cursor-text" : "cursor-crosshair"}`}
                  style={{ touchAction: "none" }}
                  onPointerDown={onPointerDown(i)}
                  onPointerMove={onPointerMove(i)}
                  onPointerUp={onPointerUp(i)}
                  onPointerCancel={onPointerUp(i)}
                />

                {/* UPGRADED: Combined Interactive Elements Overlay */}
                <ItemOverlays
                  page={i}
                  items={historyRef.current.filter(
                    (s): s is TextItem | ImageItem => (s.type === "text" || s.type === "image") && s.page === i,
                  )}
                  tick={textTick}
                  canDraw={canDraw}
                  editingId={textEditor?.editingId}
                  onEdit={(it) => {
                    if (it.type === "text") {
                      setTextEditor({ page: it.page, x: it.x, y: it.y, value: it.text, editingId: it.id });
                    }
                  }}
                  onUpdate={updatePersistedItem}
                />

                {textEditor && textEditor.page === i && (
                  <div
                    className="absolute z-30 flex flex-col gap-1"
                    style={{ left: textEditor.x, top: textEditor.y }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <textarea
                      autoFocus
                      value={textEditor.value}
                      onChange={(e) => setTextEditor({ ...textEditor, value: e.target.value })}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          commitText();
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setTextEditor(null);
                        }
                      }}
                      placeholder="Type… Ctrl/Cmd+Enter to save, Esc to cancel"
                      rows={3}
                      className="min-h-[60px] min-w-[220px] resize rounded border border-primary/60 bg-white/95 px-2 py-1 outline-none ring-2 ring-primary/30"
                      style={{
                        color,
                        fontSize: Math.max(14, size * 5),
                        fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
                        lineHeight: 1.3,
                        touchAction: "auto",
                      }}
                    />
                    <div className="flex gap-1">
                      <Button size="sm" className="h-7 px-2" onClick={commitText}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setTextEditor(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// UPGRADED: ItemOverlays — Handles both Text and Images with
// react-rnd for dragging and resizing.
// ────────────────────────────────────────────────────────────

function ItemOverlays({
  page,
  items,
  tick,
  canDraw,
  editingId,
  onEdit,
  onUpdate,
}: {
  page: number;
  items: (TextItem | ImageItem)[];
  tick: number;
  canDraw: boolean;
  editingId?: string;
  onEdit: (item: TextItem | ImageItem) => void;
  onUpdate: (id: string, changes: Partial<AnyItem>) => void;
}) {
  void page;
  void tick;

  return (
    <>
      {items.map((it) => {
        if (it.id === editingId) return null;

        return (
          <Rnd
            key={it.id}
            position={{ x: it.x, y: it.y }}
            size={it.type === "image" ? { width: it.w, height: it.h } : undefined}
            disableDragging={!canDraw}
            enableResizing={canDraw && it.type === "image"}
            lockAspectRatio={it.type === "image"}
            onDragStop={(e, d) => onUpdate(it.id, { x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) => {
              if (it.type === "image") {
                onUpdate(it.id, {
                  w: parseFloat(ref.style.width),
                  h: parseFloat(ref.style.height),
                  ...position,
                });
              }
            }}
            bounds="parent"
            className="absolute z-20 group hover:ring-2 hover:ring-primary/30 rounded"
            onPointerDown={(e) => e.stopPropagation()} // Prevent canvas drawing while interacting
          >
            {it.type === "text" ? (
              <div
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onEdit(it);
                }}
                className="w-full h-full cursor-text"
                style={{
                  color: it.color,
                  fontSize: Math.max(14, it.size * 5),
                  fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
                  lineHeight: 1.3,
                }}
                title="Double click to edit, drag to move"
              >
                <KatexInline text={it.text} />
              </div>
            ) : (
              <img
                src={it.src}
                alt="Whiteboard Element"
                className="w-full h-full object-contain cursor-move"
                draggable={false}
              />
            )}
          </Rnd>
        );
      })}
    </>
  );
}

function KatexInline({ text }: { text: string }) {
  const parts = useMemo(() => text.split(/\$\$([\s\S]+?)\$\$/g), [text]);
  return (
    <>
      {parts.map((part, idx) => {
        if (idx % 2 === 1) {
          let html = "";
          try {
            html = katex.renderToString(part, {
              throwOnError: false,
              displayMode: true,
              output: "html",
            });
          } catch {
            html = `<code>$$${part}$$</code>`;
          }
          return <span key={idx} className="my-1 block" dangerouslySetInnerHTML={{ __html: html }} />;
        }
        return (
          <span key={idx} style={{ whiteSpace: "pre-wrap" }}>
            {part}
          </span>
        );
      })}
    </>
  );
}
