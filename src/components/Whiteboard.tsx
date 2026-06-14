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
  src: string; // data URL
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
const MATH_HINT_RE = /\\(?:int|iint|iiint|oint|frac|sqrt|sum|prod|lim|begin|partial|nabla|vec|sin|cos|tan|log|ln|alpha|beta|gamma|theta|pi|infty|leq|geq|neq|rightarrow)|\b(?:int|iint|iiint|sqrt|sum|prod|lim)(?=_|\b)|[∫∑∏√∞≈≤≥≠±]/i;

function normalizeRecognizedMath(input: string): string {
  return input
    .replace(/^\$\$|\$\$$/g, "")
    .replace(/∫/g, "\\int ")
    .replace(/\biiint(?=_|\b)/g, "\\iiint")
    .replace(/\biint(?=_|\b)/g, "\\iint")
    .replace(/\bint(?=_|\b)/g, "\\int")
    .replace(/\blim(?=_|\b)/g, "\\lim")
    .replace(/\bsum(?=_|\b)/g, "\\sum")
    .replace(/\bprod(?=_|\b)/g, "\\prod")
    .replace(/∑/g, "\\sum ")
    .replace(/∏/g, "\\prod ")
    .replace(/√\s*\(?([^\n()]+)\)?/g, "\\sqrt{$1}")
    .replace(/∞/g, "\\infty")
    .replace(/≤/g, "\\leq")
    .replace(/≥/g, "\\geq")
    .replace(/≠/g, "\\neq")
    .replace(/≈/g, "\\approx")
    .replace(/±/g, "\\pm")
    .replace(/\s+d([a-zA-Z])\b/g, "\\,d$1")
    .trim();
}

interface Props {
  roomId: string;
  userId: string;
  /** When true the user is treated as the room host (tutor/admin) and can
   * toggle whether the other participant is allowed to draw. */
  isHost?: boolean;
}

// Helper to extract editable text nodes inside an SVG string safely without full DOM libraries
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

// Helper to replace text nodes inside an SVG string
function updateSvgTexts(svgString: string, updates: { original: string; current: string }[]): string {
  let updated = svgString;
  updates.forEach((up) => {
    // Escapes match strings safely to replace exact textual targets
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
  const [textEditor, setTextEditor] = useState<{
    page: number;
    x: number;
    y: number;
    value: string;
    editingId?: string;
    isSvgMode?: boolean;
    svgFields?: { original: string; current: string }[];
  } | null>(null);

  // Bumped whenever text items change so the HTML overlay re-renders.
  const [textTick, setTextTick] = useState(0);
  const bumpText = useCallback(() => setTextTick((t) => t + 1), []);

  // Collapse the toolbar (handy in landscape on small screens).
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [mathOpen, setMathOpen] = useState(false);
  void toolbarCollapsed;

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
      .upsert(
        {
          room_id: roomId,
          stroke_id: item.id,
          user_id: userId,
          page: item.page,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: item as any,
        },
        { onConflict: "room_id,stroke_id" },
      )
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

  const renderText = (_t: TextItem) => {};
  const renderImage = (_it: ImageItem) => {};

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
        if (removed.type !== "stroke") bumpText();
      }
      return;
    }
    if (m.type === "restore") {
      historyRef.current.push(m.stroke);
      renderItem(m.stroke);
      if (m.stroke.type !== "stroke") bumpText();
      return;
    }
    if (m.type === "update") {
      const it = historyRef.current.find((s) => s.id === m.id);
      if (it && it.type !== "stroke") {
        it.x = m.x;
        it.y = m.y;
        if (it.type === "image" && m.w != null && m.h != null) {
          it.w = m.w;
          it.h = m.h;
        }
        bumpText();
      }
      return;
    }
    if (m.type === "perm") {
      setStudentCanDraw(m.studentCanDraw);
      return;
    }
    const existing = historyRef.current.findIndex((s) => s.id === m.id);
    if (existing >= 0) historyRef.current.splice(existing, 1, m);
    else historyRef.current.push(m);
    renderItem(m);
    if (m.type !== "stroke") bumpText();
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

    let finalValue = textEditor.value;

    // If we're operating inside visual SVG fields parsing layer, pack values back together
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
      id: `${userId}-t-${Date.now()}`,
    };
    historyRef.current.push(item);
    sendItem(item);
    bumpText();
    setTextEditor(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textEditor, color, size, userId]);

  // ── paste images from clipboard ────────────────────────────
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
        bumpText();
      };
      img.src = dataUrl;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ── AI: convert handwriting to LaTeX/text ──────────────────
  const convert = useServerFn(whiteboardConvert);
  const [converting, setConverting] = useState(false);
  const [convertingAll, setConvertingAll] = useState(false);

  // Helper parsing routine that splits the comprehensive AI response chunk into granular independent entities
  const unpackOcrResponse = (rawOcrText: string, startY: number, pageNum: number): AnyItem[] => {
    const parsedElements: AnyItem[] = [];
    let rollingY = startY;

    // Matches standard high-level markdown math structures or visual SVGs blocks
    const splittingRegex = /(\$\$[\s\S]+?\$\$)|(<svg[\s\S]*?<\/svg>)/gi;
    let trackIdx = 0;
    let matchObj;

    const pushTextOrFormulaNode = (rawString: string, isFormula: boolean) => {
      const content = rawString.replace(/^\s*(?:LaTeX|Math|Equation|Formula)\s*:\s*/i, "").trim();
      if (!content) return;
      const shouldRenderAsFormula =
        isFormula || (!content.includes("\n") && (MATH_HINT_RE.test(content) || (/=/.test(content) && /[0-9a-zA-Z)][+\-*/^_=]/.test(content))));
      const renderedText = shouldRenderAsFormula ? `$$${normalizeRecognizedMath(content)}$$` : content;
      parsedElements.push({
        type: "text",
        page: pageNum,
        x: 35,
        y: rollingY,
        text: renderedText,
        color: "#0f172a",
        size: 2,
        id: `${userId}-ai-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      });
      rollingY += shouldRenderAsFormula ? 85 : 45;
    };

    while ((matchObj = splittingRegex.exec(rawOcrText)) !== null) {
      if (matchObj.index > trackIdx) {
        pushTextOrFormulaNode(rawOcrText.slice(trackIdx, matchObj.index), false);
      }

      if (matchObj[1]) {
        // Encountered independent math formula segment block
        pushTextOrFormulaNode(matchObj[1], true);
      } else if (matchObj[2]) {
        // Encountered visual diagram SVG code block. Strip internal texts nodes out into standalone draggable elements
        const originalSvgStr = matchObj[2];
        let finalizedCleanSvg = originalSvgStr;
        const unlinkedLabelItems: AnyItem[] = [];

        const defaultSvgBaseX = 50;
        const defaultSvgBaseY = rollingY;

        try {
          const domParserInstance = new DOMParser();
          const svgDocument = domParserInstance.parseFromString(originalSvgStr, "image/svg+xml");
          const nativeTextNodes = svgDocument.querySelectorAll("text");

          nativeTextNodes.forEach((node) => {
            const innerString = node.textContent?.trim();
            if (innerString) {
              const svgLocalX = parseFloat(node.getAttribute("x") || "0");
              const svgLocalY = parseFloat(node.getAttribute("y") || "0");

              // Generate completely detached independent item structure object
              unlinkedLabelItems.push({
                type: "text",
                page: pageNum,
                x: defaultSvgBaseX + svgLocalX,
                // Offset slightly upward from native baseline for easier click manipulation bounds matching standard text layouts
                y: defaultSvgBaseY + svgLocalY - 10,
                text: innerString,
                color: "#0f172a",
                size: 2,
                id: `${userId}-ai-lbl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              });

              // Purge the structural text tag block from within the SVG graphic so it won't render locked inside
              node.parentNode?.removeChild(node);
            }
          });

          finalizedCleanSvg = new XMLSerializer().serializeToString(svgDocument);
        } catch (svgParseErr) {
          console.error("Failed unpacking nested internal text components from AI diagram element:", svgParseErr);
        }

        // Push clean visual layout geometric drawing box item
        parsedElements.push({
          type: "text",
          page: pageNum,
          x: defaultSvgBaseX,
          y: defaultSvgBaseY,
          text: finalizedCleanSvg,
          color: "#0f172a",
          size: 2,
          id: `${userId}-ai-svg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        });

        // Append the newly isolated, separate draggable labels right after the diagram base layer
        parsedElements.push(...unlinkedLabelItems);
        rollingY += 260; // Safe dynamic gap spacing block step down height assignment
      }
      trackIdx = splittingRegex.lastIndex;
    }

    if (trackIdx < rawOcrText.length) {
      pushTextOrFormulaNode(rawOcrText.slice(trackIdx), false);
    }

    return parsedElements;
  };

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

    // Unpack composite markup payload string into clear modular unlinked adjustable tokens array list
    const granularItems = unpackOcrResponse(text, nextY, page);
    granularItems.forEach((unpackedItem) => {
      historyRef.current.push(unpackedItem);
      sendItem(unpackedItem);
    });

    bumpText();
    return true;
  };

  const runOcr = async () => {
    const page = currentPage - 1;
    setConverting(true);
    try {
      const ok = await convertPage(page);
      if (!ok) toast.message("Nothing recognised on this page.");
      else toast.success("Converted — everything is now separately movable!");
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
        try {
          if (await convertPage(p)) converted += 1;
        } catch (err) {
          toast.error(`Page ${p + 1}: ${err instanceof Error ? err.message : "conversion failed"}`);
        }
      }
      if (converted > 0) {
        toast.success(`Converted ${converted} page${converted === 1 ? "" : "s"} — drag anything to reposition`);
      } else {
        toast.message("Nothing recognised.");
      }
    } finally {
      setConvertingAll(false);
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

  // ── undo / redo (per-user, owns own items only) ───────────
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

  const updateItem = (id: string, x: number, y: number, w?: number, h?: number) => {
    const it = historyRef.current.find((s) => s.id === id);
    if (!it || it.type === "stroke") return;
    it.x = x;
    it.y = y;
    if (it.type === "image" && w != null && h != null) {
      it.w = w;
      it.h = h;
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
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 p-2">
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
          disabled={converting || convertingAll || !canDraw}
          title="Convert handwriting on this page to LaTeX & text (AI)"
        >
          <Wand2 className="mr-1 h-4 w-4" /> {converting ? "Converting…" : "AI convert"}
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={runOcrAll}
          disabled={converting || convertingAll || !canDraw}
          title="Convert handwriting on every page in one click"
        >
          <Wand2 className="mr-1 h-4 w-4" />
          {convertingAll ? "Converting all…" : "Convert all"}
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
        Draw with one finger · scroll with two fingers · paste images with Ctrl/Cmd+V · {PAGE_COUNT} pages
      </div>

      {/* Changed layout overflow properties to ensure landscape-to-portrait orientation shifts do not trim strokes */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto overscroll-contain bg-muted/30"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Set explicit safe min-width context boundaries preventing responsive frame clipping */}
        <div className="mx-auto flex w-full min-w-[950px] flex-col gap-4 px-4 py-2">
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
                        value: it.text, // Keep entire SVG intact in value background
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
                  onMove={(id, x, y, w, h) => updateItem(id, x, y, w, h)}
                />

                {textEditor && textEditor.page === i && (
                  <div
                    className="absolute z-20 flex flex-col gap-2 rounded-lg border border-border bg-white p-3 shadow-xl ring-1 ring-black/5"
                    style={{ left: textEditor.x, top: textEditor.y }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    {textEditor.isSvgMode ? (
                      // ── NO CODE EDITING CONTAINER FOR SVGS ──
                      <div className="flex flex-col gap-3 min-w-[240px]">
                        <div className="text-xs font-semibold text-muted-foreground mb-1">Modify Diagram Values:</div>
                        {textEditor.svgFields && textEditor.svgFields.length > 0 ? (
                          textEditor.svgFields.map((field, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                Value {fIdx + 1}:
                              </span>
                              <input
                                type="text"
                                value={field.current}
                                onChange={(e) => {
                                  const updatedFields = [...(textEditor.svgFields || [])];
                                  updatedFields[fIdx].current = e.target.value;
                                  setTextEditor({ ...textEditor, svgFields: updatedFields });
                                }}
                                className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            </div>
                          ))
                        ) : (
                          // Fallback layout when SVG has shapes but no editable text nodes
                          <textarea
                            value={textEditor.value}
                            onChange={(e) => setTextEditor({ ...textEditor, value: e.target.value })}
                            className="min-h-[60px] text-xs font-mono border rounded p-1"
                          />
                        )}
                      </div>
                    ) : (
                      // ── STANDARD PLAIN TEXT AREA EDITOR ──
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
                    )}

                    <div className="flex gap-1 justify-end pt-1">
                      <Button size="sm" className="h-7 px-3 text-xs" onClick={commitText}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 text-xs"
                        onClick={() => setTextEditor(null)}
                      >
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
// TextOverlay
// ────────────────────────────────────────────────────────────
function TextOverlay({
  items,
  onEdit,
  onMove,
  canEdit,
}: {
  page: number;
  items: TextItem[];
  tick: number;
  onEdit: (item: TextItem) => void;
  onMove: (id: string, x: number, y: number) => void;
  canEdit: boolean;
}) {
  return (
    <>
      {items.map((it) => (
        <DraggableOverlay
          key={it.id}
          x={it.x}
          y={it.y}
          canDrag={canEdit}
          onCommit={(x, y) => onMove(it.id, x, y)}
          onClick={() => canEdit && onEdit(it)}
          className="absolute z-10 max-w-[90%] select-none rounded px-1 hover:bg-primary/5"
          style={{
            color: it.color,
            fontSize: Math.max(14, it.size * 5),
            fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
            lineHeight: 1.3,
          }}
          title={canEdit ? "Drag to move · click to edit" : ""}
        >
          <KatexInline text={it.text} />
        </DraggableOverlay>
      ))}
    </>
  );
}

function ImageOverlay({
  items,
  onMove,
  canEdit,
}: {
  page: number;
  items: ImageItem[];
  tick: number;
  onMove: (id: string, x: number, y: number, w?: number, h?: number) => void;
  canEdit: boolean;
}) {
  return (
    <>
      {items.map((it) => (
        <ResizableImage key={it.id} item={it} canEdit={canEdit} onCommit={onMove} />
      ))}
    </>
  );
}

function ResizableImage({
  item,
  canEdit,
  onCommit,
}: {
  item: ImageItem;
  canEdit: boolean;
  onCommit: (id: string, x: number, y: number, w?: number, h?: number) => void;
}) {
  const [pos, setPos] = useState({ x: item.x, y: item.y, w: item.w, h: item.h });
  useEffect(() => {
    setPos({ x: item.x, y: item.y, w: item.w, h: item.h });
  }, [item.x, item.y, item.w, item.h]);

  const dragRef = useRef<{ mode: "move" | "resize"; startX: number; startY: number; orig: typeof pos } | null>(null);

  const onPointerDown = (mode: "move" | "resize") => (e: React.PointerEvent) => {
    if (!canEdit) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, orig: { ...pos } };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    e.stopPropagation();
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const o = dragRef.current.orig;
    if (dragRef.current.mode === "move") {
      setPos({ ...o, x: o.x + dx, y: o.y + dy });
    } else {
      setPos({ ...o, w: Math.max(40, o.w + dx), h: Math.max(40, o.h + dy) });
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    e.stopPropagation();
    dragRef.current = null;
    onCommit(item.id, pos.x, pos.y, pos.w, pos.h);
  };

  return (
    <div
      className="absolute z-10 select-none rounded border border-transparent hover:border-primary/40"
      style={{ left: pos.x, top: pos.y, width: pos.w, height: pos.h, touchAction: "none" }}
      onPointerDown={onPointerDown("move")}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      title={canEdit ? "Drag to move · drag corner to resize" : ""}
    >
      <img src={item.src} alt="" draggable={false} className="pointer-events-none h-full w-full object-contain" />
      {canEdit && (
        <span
          onPointerDown={onPointerDown("resize")}
          className="absolute -bottom-1 -right-1 h-3 w-3 cursor-nwse-resize rounded-sm border border-primary bg-white"
        />
      )}
    </div>
  );
}

function DraggableOverlay({
  x,
  y,
  canDrag,
  onCommit,
  onClick,
  className,
  style,
  title,
  children,
}: {
  x: number;
  y: number;
  canDrag: boolean;
  onCommit: (x: number, y: number) => void;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  children: React.ReactNode;
}) {
  const [pos, setPos] = useState({ x, y });
  useEffect(() => setPos({ x, y }), [x, y]);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!canDrag) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (!dragRef.current.moved && Math.abs(dx) + Math.abs(dy) > 4) dragRef.current.moved = true;
    if (dragRef.current.moved) {
      e.stopPropagation();
      setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    e.stopPropagation();
    if (d.moved) onCommit(pos.x, pos.y);
    else onClick();
  };
  return (
    <div
      className={className}
      style={{ ...style, left: pos.x, top: pos.y, touchAction: "none", cursor: canDrag ? "grab" : "default" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      title={title}
    >
      {children}
    </div>
  );
}

function KatexInline({ text }: { text: string }) {
  const segments = useMemo(() => {
    const out: { kind: "text" | "tex" | "svg"; value: string }[] = [];
    const re = /(\$\$[\s\S]+?\$\$)|(<svg[\s\S]*?<\/svg>)/gi;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push({ kind: "text", value: text.slice(last, m.index) });
      if (m[1]) out.push({ kind: "tex", value: m[1].slice(2, -2) });
      else if (m[2]) out.push({ kind: "svg", value: m[2] });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ kind: "text", value: text.slice(last) });
    return out;
  }, [text]);

  return (
    <>
      {segments.map((seg, idx) => {
        if (seg.kind === "tex") {
          let html = "";
          try {
            html = katex.renderToString(seg.value, {
              throwOnError: false,
              displayMode: true,
              output: "html",
            });
          } catch {
            html = `<code>$$${seg.value}$$</code>`;
          }
          return <span key={idx} className="my-1 block" dangerouslySetInnerHTML={{ __html: html }} />;
        }
        if (seg.kind === "svg") {
          const safe = seg.value
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/\son\w+="[^"]*"/gi, "")
            .replace(/\son\w+='[^']*'/gi, "");
          return (
            <span
              key={idx}
              className="my-1 block max-w-full [&_svg]:max-w-full [&_svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: safe }}
            />
          );
        }
        return (
          <span key={idx} style={{ whiteSpace: "pre-wrap" }}>
            {seg.value}
          </span>
        );
      })}
    </>
  );
}
