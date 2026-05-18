import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Pen, Eraser, Trash2 } from "lucide-react";

type Stroke = {
  type: "stroke";
  points: { x: number; y: number }[];
  color: string;
  size: number;
  mode: "pen" | "eraser";
  id: string;
};
type ClearMsg = { type: "clear" };
type Msg = Stroke | ClearMsg;

const COLORS = ["#0f172a", "#dc2626", "#2563eb", "#16a34a"];

interface Props {
  roomId: string;
  userId: string;
}

export function Whiteboard({ roomId, userId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const drawingRef = useRef<{
    active: boolean;
    points: { x: number; y: number }[];
    id: string;
  }>({ active: false, points: [], id: "" });

  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(3);
  const [mode, setMode] = useState<"pen" | "eraser">("pen");

  // resize canvas to container
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      const ctx = canvas.getContext("2d");
      ctx?.scale(dpr, dpr);
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // realtime broadcast channel
  useEffect(() => {
    const channel = supabase.channel(`whiteboard:${roomId}`, {
      config: { broadcast: { self: false } },
    });
    channel
      .on("broadcast", { event: "draw" }, ({ payload }) => {
        applyMessage(payload as Msg);
      })
      .subscribe();
    channelRef.current = channel;
    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [roomId]);

  const drawSegment = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    c: string,
    sz: number,
    m: "pen" | "eraser",
  ) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = m === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = c;
    ctx.lineWidth = sz;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };

  const applyMessage = (m: Msg) => {
    if (m.type === "clear") {
      const ctx = canvasRef.current?.getContext("2d");
      const c = canvasRef.current;
      if (ctx && c) ctx.clearRect(0, 0, c.width, c.height);
      return;
    }
    for (let i = 1; i < m.points.length; i++) {
      drawSegment(m.points[i - 1], m.points[i], m.color, m.size, m.mode);
    }
  };

  const send = (m: Msg) => {
    channelRef.current?.send({ type: "broadcast", event: "draw", payload: m });
  };

  const pos = (e: PointerEvent | React.PointerEvent | TouchEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const p = "touches" in e ? (e as TouchEvent).touches[0] : (e as PointerEvent);
    return { x: p.clientX - rect.left, y: p.clientY - rect.top };
  };

  const start = (e: React.PointerEvent | React.TouchEvent) => {
    e.preventDefault();
    drawingRef.current = {
      active: true,
      points: [pos(e.nativeEvent)],
      id: `${userId}-${Date.now()}`,
    };
  };

  const move = (e: React.PointerEvent | React.TouchEvent) => {
    if (!drawingRef.current.active) return;
    e.preventDefault();
    const p = pos(e.nativeEvent);
    const prev = drawingRef.current.points[drawingRef.current.points.length - 1];
    drawingRef.current.points.push(p);
    drawSegment(prev, p, color, size, mode);
  };

  const end = (e: React.PointerEvent | React.TouchEvent) => {
    if (!drawingRef.current.active) return;
    e.preventDefault();
    drawingRef.current.active = false;
    if (drawingRef.current.points.length > 1) {
      send({
        type: "stroke",
        points: drawingRef.current.points,
        color,
        size,
        mode,
        id: drawingRef.current.id,
      });
    }
    drawingRef.current.points = [];
  };

  const clear = () => {
    const ctx = canvasRef.current?.getContext("2d");
    const c = canvasRef.current;
    if (ctx && c) ctx.clearRect(0, 0, c.width, c.height);
    send({ type: "clear" });
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
          className="w-24"
        />
        <span className="text-xs text-muted-foreground">{size}px</span>
        <div className="ml-auto" />
        <Button size="sm" variant="destructive" onClick={clear}>
          <Trash2 className="mr-1 h-4 w-4" /> Clear
        </Button>
      </div>
      <div ref={containerRef} className="no-touch-scroll relative flex-1 bg-white">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full cursor-crosshair"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
    </div>
  );
}
