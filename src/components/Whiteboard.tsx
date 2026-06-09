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
  src: string;
  id: string;
};
type AnyItem = Stroke | TextItem | ImageItem;

type ClearMsg = { type: "clear"; page?: number };
type UndoMsg = { type: "undo"; id: string };
type RestoreMsg = { type: "restore"; stroke: AnyItem };
type UpdateMsg = { type: "update"; id: string; x: number; y: number; w?: number; h?: number };
type PermMsg = { type: "perm"; studentCanDraw: boolean };
type Msg = Stroke | TextItem | ImageItem | ClearMsg | UndoMsg | RestoreMsg | UpdateMsg | PermMsg;

const COLORS = ["#0f172a", "#dc2626", "#2563eb", "#16a34a"];
const PAGE_COUNT = 100;

interface Props {
  roomId: string;
  userId: string;
  isHost?: boolean;
}

// SVG helpers
function parseSvgTexts(svgString: string): { original: string; current: string }[] {
  const matches: { original: string; current: string }[] = [];
  const regex = /<text[^>]*>([\s\S]*?)<\/text>/gi;
  let match;
  while ((match = regex.exec(svgString)) !== null) {
    const textContent = match[1].trim();
    if (textContent && !textContent.startsWith("<")) {
      matches.push({ original: textContent, current: textContent });
    }
  }
  return matches;
}

function updateSvgTexts(svgString: string, updates: { original: string; current: string }[]): string {
  let updated = svgString;
  updates.forEach((up) => {
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(<text[^>]*>)\\s*${escapeRegExp(up.original)}\\s*(<\/text>)`, "gi");
    updated = updated.replace(regex, `$1${up.current}$2`);
  });
  return updated;
}

export function Whiteboard({ roomId, userId, isHost = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const drawingRef = useRef<{ active: boolean; page: number; points: Pt[]; id: string }>({
    active: false,
    page: -1,
    points: [],
    id: "",
  });

  const pointersRef = useRef<Map<number, Pt>>(new Map());
  const scrollStartRef = useRef<{ scrollTop: number; midY: number }>({ scrollTop: 0, midY: 0 });

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
    isSvgMode?: boolean;
    svgFields?: { original: string; current: string }[];
  } | null>(null);

  const [textTick, setTextTick] = useState(0);
  const bumpText = useCallback(() => setTextTick((t) => t + 1), []);

  const [mathOpen, setMathOpen] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertingAll, setConvertingAll] = useState(false);

  const pages = useMemo(() => Array.from({ length: PAGE_COUNT }, (_, i) => i), []);

  // Canvas sizing & drawing
  const sizeCanvas = (canvas: HTMLCanvasElement): boolean => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;

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

  const redrawPage = useCallback((page: number) => {
    const canvas = canvasRefs.current[page];
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    historyRef.current
      .filter((item): item is Stroke => item.page === page && item.type === "stroke")
      .forEach((stroke) => {
        for (let i = 1; i < stroke.points.length; i++) {
          const a = stroke.points[i - 1];
          const b = stroke.points[i];
          ctx.globalCompositeOperation = stroke.mode === "eraser" ? "destination-out" : "source-over";
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.size;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      });
  }, []);

  const redrawAll = useCallback(() => {
    canvasRefs.current.forEach((canvas, i) => {
      if (canvas) {
        sizeCanvas(canvas);
        redrawPage(i);
      }
    });
    bumpText();
  }, [redrawPage, bumpText]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => redrawAll();
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(redrawAll, 150);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [redrawAll]);

  // Load persisted strokes
  useEffect(() => {
    historyRef.current = [];
    myUndoStackRef.current = [];
    myRedoStackRef.current = [];
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
        const item = row.data;
        if (item && ["stroke", "text", "image"].includes(item.type)) {
          historyRef.current.push(item);
        }
      }

      setTimeout(redrawAll, 100);
    })();

    return () => {
      cancelled = true;
    };
  }, [roomId, redrawAll]);

  // Realtime subscription
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
  }, [roomId, isHost, studentCanDraw]);

  // Persistence
  const persistStroke = (item: AnyItem) => {
    supabase
      .from("whiteboard_strokes")
      .upsert(
        {
          room_id: roomId,
          stroke_id: item.id,
          user_id: userId,
          page: item.page,
          data: item as any,
        },
        { onConflict: "room_id,stroke_id" },
      )
      .then(({ error }) => {
        if (error) console.warn("whiteboard persist failed", error.message);
      });
  };

  const deletePersistedStroke = (strokeId: string) => {
    supabase.from("whiteboard_strokes").delete().eq("room_id", roomId).eq("stroke_id", strokeId);
  };

  const deletePersistedPage = (page: number) => {
    supabase.from("whiteboard_strokes").delete().eq("room_id", roomId).eq("page", page);
  };

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

  const renderItem = (item: AnyItem) => {
    if (item.type === "stroke") {
      for (let i = 1; i < item.points.length; i++) {
        drawSegment(item.page, item.points[i - 1], item.points[i], item.color, item.size, item.mode);
      }
    }
  };

  const applyMessage = (m: Msg) => {
    if (m.type === "clear") {
      if (m.page == null) {
        historyRef.current = [];
        canvasRefs.current.forEach((c) => c?.getContext("2d")?.clearRect(0, 0, c.width, c.height));
      } else {
        historyRef.current = historyRef.current.filter((s) => s.page !== m.page);
        redrawPage(m.page);
      }
      bumpText();
      return;
    }

    if (m.type === "undo") {
      const idx = historyRef.current.findIndex((s) => s.id === m.id);
      if (idx >= 0) {
        const [removed] = historyRef.current.splice(idx, 1);
        redrawPage(removed.page);
      }
      bumpText();
      return;
    }

    if (m.type === "restore") {
      historyRef.current.push(m.stroke);
      renderItem(m.stroke);
      bumpText();
      return;
    }

    if (m.type === "update") {
      const it = historyRef.current.find((s) => s.id === m.id);
      if (it && it.type !== "stroke") {
        it.x = m.x;
        it.y = m.y;
        if (it.type === "image" && m.w != null && m.h != null) {
          (it as ImageItem).w = m.w;
          (it as ImageItem).h = m.h;
        }
        bumpText();
      }
      return;
    }

    if (m.type === "perm") {
      setStudentCanDraw(m.studentCanDraw);
      return;
    }

    // New or replace item
    const existingIdx = historyRef.current.findIndex((s) => s.id === m.id);
    if (existingIdx >= 0) {
      historyRef.current[existingIdx] = m;
    } else {
      historyRef.current.push(m);
    }

    if (m.type === "stroke") renderItem(m);
    if (m.type !== "stroke") bumpText();
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
      setTextEditor({ page, x: p.x, y: p.y, value: "", isSvgMode: false });
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
      id: `\( {userId}- \){Date.now()}`,
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

    let finalValue = textEditor.value;
    if (textEditor.isSvgMode && textEditor.svgFields) {
      finalValue = updateSvgTexts(textEditor.value, textEditor.svgFields);
    }

    if (textEditor.editingId) {
      const idx = historyRef.current.findIndex((s) => s.id === textEditor.editingId);
      if (idx >= 0) historyRef.current.splice(idx, 1);
      send({ type: "undo", id: textEditor.editingId });
      deletePersistedStroke(textEditor.editingId);
    }

    if (!finalValue.trim()) {
      setTextEditor(null);
      bumpText();
      return;
    }

    const item: TextItem = {
      type: "text",
      page: textEditor.page,
      x: textEditor.x,
      y: textEditor.y,
      text: finalValue,
      color,
      size,
      id: `\( {userId}-t- \){Date.now()}`,
    };

    historyRef.current.push(item);
    sendItem(item);
    bumpText();
    setTextEditor(null);
  }, [textEditor, color, size, userId, bumpText]);

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
          id: `\( {userId}-i- \){Date.now()}`,
        };
        historyRef.current.push(item);
        sendItem(item);
        bumpText();
      };
      img.src = dataUrl;
    },
    [userId, bumpText],
  );

  // Paste handler
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
            if (typeof reader.result === "string") {
              placeImage(reader.result, currentPage - 1);
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

  // AI Conversion
  const convert = useServerFn(whiteboardConvert);

  const convertPage = async (page: number): Promise<boolean> => {
    const canvas = canvasRefs.current[page];
    if (!canvas) return false;
    const hasStrokes = historyRef.current.some((it) => it.page === page && it.type === "stroke");
    if (!hasStrokes) return false;

    const dataUrl = canvas.toDataURL("image/png");
    const { text } = await convert({ data: { imageDataUrl: dataUrl } });
    if (!text) return false;

    const strokeIds = historyRef.current.filter((it) => it.page === page && it.type === "stroke").map((it) => it.id);

    historyRef.current = historyRef.current.filter((it) => !(it.page === page && it.type === "stroke"));
    redrawPage(page);

    strokeIds.forEach((id) => {
      send({ type: "undo", id });
      deletePersistedStroke(id);
    });

    const existing = historyRef.current.filter(
      (it): it is TextItem | ImageItem => it.page === page && (it.type === "text" || it.type === "image"),
    );

    let nextY = 16;
    for (const it of existing) {
      const bottom = it.type === "image" ? it.y + it.h : it.y + 80;
      if (bottom + 8 > nextY) nextY = bottom + 8;
    }

    const item: TextItem = {
      type: "text",
      page,
      x: 16,
      y: nextY,
      text,
      color: "#0f172a",
      size: 2,
      id: `\( {userId}-ocr- \){Date.now()}-${page}`,
    };

    historyRef.current.push(item);
    sendItem(item);
    bumpText();
    return true;
  };

  const runOcr = async () => {
    const page = currentPage - 1;
    setConverting(true);
    try {
      const ok = await convertPage(page);
      if (!ok) toast.message("Nothing recognised on this page.");
      else toast.success("Converted — drag to move, click to edit");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setConverting(false);
    }
  };

  const runOcrAll = async () => {
    const pagesWithInk = Array.from(
      new Set(historyRef.current.filter((it) => it.type === "stroke").map((it) => it.page)),
    ).sort((a, b) => a - b);

    if (pagesWithInk.length === 0) {
      toast.message("No handwriting to convert.");
      return;
    }

    setConvertingAll(true);
    let converted = 0;
    try {
      for (const p of pagesWithInk) {
        if (await convertPage(p)) converted++;
      }
      if (converted > 0) {
        toast.success(`Converted \( {converted} page \){converted === 1 ? "" : "s"}`);
      } else {
        toast.message("Nothing recognised.");
      }
    } finally {
      setConvertingAll(false);
    }
  };

  // Scroll page detection
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

  // Undo / Redo
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
    if (idx >= 0) historyRef.current.splice(idx, 1);
    redrawPage(item.page);
    send({ type: "undo", id: item.id });
    deletePersistedStroke(item.id);
    setUndoTick((t) => t + 1);
    bumpText();
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
    bumpText();
  };

  const updateItem = (id: string, x: number, y: number, w?: number, h?: number) => {
    const it = historyRef.current.find((s) => s.id === id);
    if (!it || it.type === "stroke") return;
    it.x = x;
    it.y = y;
    if (it.type === "image" && w != null && h != null) {
      (it as ImageItem).w = w;
      (it as ImageItem).h = h;
    }
    send({ type: "update", id, x, y, w, h });
    persistStroke(it);
    bumpText();
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
    bumpText();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 p-2">
        {/* ... all your toolbar buttons (unchanged) ... */}
        <Button size="sm" variant={mode === "pen" ? "default" : "outline"} onClick={() => setMode("pen")}>
          <Pen className="mr-1 h-4 w-4" /> Pen
        </Button>
        <Button size="sm" variant={mode === "eraser" ? "default" : "outline"} onClick={() => setMode("eraser")}>
          <Eraser className="mr-1 h-4 w-4" /> Eraser
        </Button>
        <Button size="sm" variant={mode === "text" ? "default" : "outline"} onClick={() => setMode("text")}>
          <Type className="mr-1 h-4 w-4" /> Text
        </Button>

        {/* Colors, size slider, undo/redo, page navigation, host controls, AI buttons, etc. */}
        {/* (Copy the full toolbar from your original code - it's unchanged) */}

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
            />
          </label>
        )}
        {/* ... rest of toolbar ... */}
      </div>

      <MathTools open={mathOpen} onClose={() => setMathOpen(false)} />

      <div className="border-b bg-muted/20 px-3 py-1 text-[11px] text-muted-foreground">
        Draw with one finger · scroll with two fingers · paste images with Ctrl/Cmd+V · {PAGE_COUNT} pages
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
                  }}
                  className={`absolute inset-0 h-full w-full ${mode === "text" ? "cursor-text" : "cursor-crosshair"}`}
                  style={{ touchAction: "none" }}
                  onPointerDown={onPointerDown(i)}
                  onPointerMove={onPointerMove(i)}
                  onPointerUp={onPointerUp(i)}
                  onPointerCancel={onPointerUp(i)}
                />

                <TextOverlay
                  page={i}
                  items={historyRef.current.filter(
                    (s): s is TextItem => s.type === "text" && s.page === i && (textEditor?.editingId ?? "") !== s.id,
                  )}
                  tick={textTick}
                  canEdit={canDraw}
                  onMove={(id, x, y) => updateItem(id, x, y)}
                  onEdit={(it) => {
                    const hasSvg = it.text.toLowerCase().includes("<svg");
                    if (hasSvg) {
                      const parsedFields = parseSvgTexts(it.text);
                      setTextEditor({
                        page: it.page,
                        x: it.x,
                        y: it.y,
                        value: it.text,
                        editingId: it.id,
                        isSvgMode: true,
                        svgFields: parsedFields,
                      });
                    } else {
                      setTextEditor({
                        page: it.page,
                        x: it.x,
                        y: it.y,
                        value: it.text,
                        editingId: it.id,
                        isSvgMode: false,
                      });
                    }
                  }}
                />

                <ImageOverlay
                  page={i}
                  items={historyRef.current.filter((s): s is ImageItem => s.type === "image" && s.page === i)}
                  tick={textTick}
                  canEdit={canDraw}
                  onMove={updateItem}
                />

                {/* Text Editor Overlay */}
                {textEditor && textEditor.page === i && (
                  /* Your editor JSX remains unchanged */
                  <div
                    className="absolute z-20 flex flex-col gap-2 rounded-lg border border-border bg-white p-3 shadow-xl ring-1 ring-black/5"
                    style={{ left: textEditor.x, top: textEditor.y }}
                  >
                    {/* ... editor content ... */}
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

/* Keep all overlay components (TextOverlay, ImageOverlay, ResizableImage, DraggableOverlay, KatexInline) exactly as in your last message */
