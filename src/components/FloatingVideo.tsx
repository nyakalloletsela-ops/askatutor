import { useEffect, useRef, useState } from "react";
import { Minus, Move, Video, VideoOff, Maximize2 } from "lucide-react";
import { JitsiRoom } from "@/components/JitsiRoom";
import { Button } from "@/components/ui/button";

interface Props {
  roomId: string;
  displayName?: string;
  email?: string;
}

export function FloatingVideo({ roomId, displayName, email }: Props) {
  const [pos, setPos] = useState({ x: 16, y: 80 });
  const [size, setSize] = useState({ w: 320, h: 220 });
  const [minimized, setMinimized] = useState(false);
  const [hidden, setHidden] = useState(false);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
  const resizeRef = useRef<{ sx: number; sy: number; w: number; h: number } | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragRef.current) {
        setPos({
          x: Math.max(0, Math.min(window.innerWidth - 80, e.clientX - dragRef.current.dx)),
          y: Math.max(0, Math.min(window.innerHeight - 40, e.clientY - dragRef.current.dy)),
        });
      } else if (resizeRef.current) {
        const r = resizeRef.current;
        setSize({
          w: Math.max(200, r.w + (e.clientX - r.sx)),
          h: Math.max(140, r.h + (e.clientY - r.sy)),
        });
      }
    };
    const onUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  if (hidden) {
    return (
      <Button
        size="sm"
        onClick={() => setHidden(false)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Video className="mr-1 h-4 w-4" /> Show video
      </Button>
    );
  }

  return (
    <div
      className="fixed z-50 overflow-hidden rounded-lg border border-navy-foreground/30 bg-black shadow-2xl"
      style={{
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: minimized ? 36 : size.h,
      }}
    >
      <div
        className="flex h-9 cursor-move items-center justify-between bg-navy px-2 text-xs text-navy-foreground"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
        }}
      >
        <span className="flex items-center gap-1 font-medium">
          <Move className="h-3 w-3" /> Video
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized((m) => !m)}
            className="rounded p-1 hover:bg-navy-foreground/20"
            title={minimized ? "Expand" : "Minimize"}
          >
            {minimized ? <Maximize2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          </button>
          <button
            onClick={() => setHidden(true)}
            className="rounded p-1 hover:bg-navy-foreground/20"
            title="Hide"
          >
            <VideoOff className="h-3 w-3" />
          </button>
        </div>
      </div>
      {!minimized && (
        <>
          <div className="h-[calc(100%-36px)]">
            <JitsiRoom roomId={roomId} displayName={displayName} email={email} />
          </div>
          <div
            className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize bg-navy-foreground/40"
            style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              resizeRef.current = { sx: e.clientX, sy: e.clientY, w: size.w, h: size.h };
            }}
          />
        </>
      )}
    </div>
  );
}
