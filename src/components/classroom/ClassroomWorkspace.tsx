import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PresencePanel } from "./PresencePanel";
import { ChatPanel } from "./ChatPanel";
import { AiAssistantPanel } from "./AiAssistantPanel";
import type { TldrawBoardHandle } from "./TldrawBoard";
import { Box, MessageSquare, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { toast } from "sonner";

const TldrawBoard = lazy(() => import("./TldrawBoard").then((m) => ({ default: m.TldrawBoard })));
const PhysicsOverlay = lazy(() =>
  import("./PhysicsOverlay").then((m) => ({ default: m.PhysicsOverlay })),
);

interface Props {
  roomId: string;
  userId: string;
  displayName: string;
  canEdit: boolean;
}

export function ClassroomWorkspace({ roomId, userId, displayName, canEdit }: Props) {
  const [whiteboardId, setWhiteboardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPhysics, setShowPhysics] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showLeft, setShowLeft] = useState(true);
  const boardRef = useRef<TldrawBoardHandle>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("ensure_whiteboard", { _room_id: roomId });
      if (cancelled) return;
      if (error) {
        setError(error.message);
        return;
      }
      setWhiteboardId(data as string);
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const insertToBoard = (text: string) => {
    if (!boardRef.current) return;
    boardRef.current.insertText(text);
    toast.success("Inserted onto board");
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Could not load whiteboard: {error}
      </div>
    );
  }

  return (
    <div
      className="grid h-full min-h-0 w-full gap-px bg-border"
      style={{
        gridTemplateColumns: `${showLeft ? "200px" : "0"} 1fr 320px`,
        gridTemplateRows: "1fr",
      }}
    >
      {/* LEFT — presence */}
      {showLeft && (
        <div className="min-h-0 overflow-hidden">
          <PresencePanel roomId={roomId} userId={userId} displayName={displayName} />
        </div>
      )}
      {!showLeft && <div />}

      {/* CENTER — toolbar + board (+ physics overlay) + chat */}
      <div className="flex min-h-0 flex-col bg-background">
        <div className="flex items-center gap-1 border-b bg-muted/40 px-2 py-1">
          <Button size="sm" variant="ghost" onClick={() => setShowLeft((s) => !s)}>
            {showLeft ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant={showPhysics ? "default" : "outline"}
            onClick={() => setShowPhysics((s) => !s)}
          >
            <Box className="mr-1 h-4 w-4" /> 3D Physics
          </Button>
          <Button
            size="sm"
            variant={showChat ? "default" : "outline"}
            onClick={() => setShowChat((s) => !s)}
          >
            <MessageSquare className="mr-1 h-4 w-4" /> Chat
          </Button>
          <span className="ml-auto text-xs text-muted-foreground">
            {canEdit ? "Editing enabled" : "View only"}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            {whiteboardId ? (
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading whiteboard…
                  </div>
                }
              >
                <TldrawBoard
                  ref={boardRef}
                  whiteboardId={whiteboardId}
                  userId={userId}
                  canEdit={canEdit}
                />
              </Suspense>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Connecting…
              </div>
            )}
          </div>
          {showPhysics && (
            <div className="h-[40%] min-h-[260px] border-t">
              <Suspense
                fallback={<div className="p-3 text-xs text-muted-foreground">Loading 3D…</div>}
              >
                <PhysicsOverlay />
              </Suspense>
            </div>
          )}
          {showChat && (
            <div className="h-[180px] border-t">
              <ChatPanel roomId={roomId} userId={userId} displayName={displayName} />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — AI */}
      <div className="min-h-0 overflow-hidden">
        <AiAssistantPanel
          roomId={roomId}
          defaultTutorMode={canEdit}
          onInsertToBoard={insertToBoard}
        />
      </div>
    </div>
  );
}
