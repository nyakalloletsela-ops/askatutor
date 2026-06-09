import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Pen, Eraser, Trash2, Type, Sigma, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { MathTools } from "@/components/MathTools";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

const COLORS = ["#0f172a", "#dc2626", "#2563eb", "#16a34a"];

export function Whiteboard({ roomId, userId, isHost = false }: { roomId: string; userId: string; isHost?: boolean }) {
  const [mode, setMode] = useState<"pen" | "eraser" | "text">("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(3);
  const [studentCanDraw, setStudentCanDraw] = useState(false);
  const [items, setItems] = useState<AnyItem[]>([]);
  const [mathOpen, setMathOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const channelRef = useRef<any>(null);
  const drawingRef = useRef({ active: false, points: [] as Pt[] });

  const canDraw = isHost || studentCanDraw;

  // Sync with Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`whiteboard:${roomId}`)
      .on("broadcast", { event: "draw" }, ({ payload }) => {
        if (payload.type === "perm") setStudentCanDraw(payload.canDraw);
        else if (payload.type === "clear") setItems([]);
        else setItems((prev) => [...prev, payload]);
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    items.forEach((item) => {
      if (item.type === "stroke") {
        ctx.globalCompositeOperation = item.mode === "eraser" ? "destination-out" : "source-over";
        ctx.strokeStyle = item.color;
        ctx.lineWidth = item.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        item.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }
    });
  }, [items]);

  useEffect(() => {
    draw();
  }, [draw]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!canDraw) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (mode === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const newItem: TextItem = {
          type: "text",
          page: 0,
          x: p.x,
          y: p.y,
          text,
          color,
          size: 16,
          id: Date.now().toString(),
        };
        setItems((prev) => [...prev, newItem]);
        channelRef.current?.send({ type: "broadcast", event: "draw", payload: newItem });
      }
      return;
    }

    drawingRef.current = { active: true, points: [p] };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawingRef.current.active || mode === "text") return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    drawingRef.current.points.push(p);

    // Immediate local feedback
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const onPointerUp = () => {
    if (!drawingRef.current.active) return;
    const newItem: Stroke = {
      type: "stroke",
      page: 0,
      points: drawingRef.current.points,
      color,
      size,
      mode: mode as any,
      id: Date.now().toString(),
    };
    setItems((prev) => [...prev, newItem]);
    channelRef.current?.send({ type: "broadcast", event: "draw", payload: newItem });
    drawingRef.current.active = false;
  };

  return (
    <div className="flex h-full flex-col bg-background overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 p-2 shrink-0">
        <Button size="sm" variant={mode === "pen" ? "default" : "outline"} onClick={() => setMode("pen")}>
          <Pen className="h-4 w-4" />
        </Button>
        <Button size="sm" variant={mode === "eraser" ? "default" : "outline"} onClick={() => setMode("eraser")}>
          <Eraser className="h-4 w-4" />
        </Button>
        <Button size="sm" variant={mode === "text" ? "default" : "outline"} onClick={() => setMode("text")}>
          <Type className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn("h-6 w-6 rounded-full border", color === c && "ring-2 ring-primary")}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {isHost && (
            <div className="flex items-center gap-2 text-xs font-medium">
              <Lock className="h-3.5 w-3.5" /> Student Can Draw
              <Switch
                checked={studentCanDraw}
                onCheckedChange={(v) => {
                  setStudentCanDraw(v);
                  channelRef.current?.send({ type: "broadcast", event: "draw", payload: { type: "perm", canDraw: v } });
                }}
              />
            </div>
          )}
          <Button size="sm" variant="outline" onClick={() => setMathOpen(true)}>
            <Sigma className="h-4 w-4 mr-1" /> Math
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setItems([]);
              channelRef.current?.send({ type: "broadcast", event: "draw", payload: { type: "clear" } });
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative bg-muted/20 p-4 overflow-auto flex justify-center">
        <div className="relative bg-white shadow-xl border rounded-sm" style={{ width: 800, height: 1000 }}>
          <canvas
            ref={canvasRef}
            width={800}
            height={1000}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className="absolute inset-0 touch-none cursor-crosshair"
          />
          {items
            .filter((it) => it.type === "text")
            .map((it: any) => (
              <div
                key={it.id}
                className="absolute pointer-events-none"
                style={{ left: it.x, top: it.y, color: it.color }}
              >
                {it.text}
              </div>
            ))}
        </div>
      </div>
      <MathTools open={mathOpen} onClose={() => setMathOpen(false)} />
    </div>
  );
}
