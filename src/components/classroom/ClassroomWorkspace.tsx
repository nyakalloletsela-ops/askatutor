import { lazy, Suspense, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const TldrawBoard = lazy(() => import("./TldrawBoard").then((m) => ({ default: m.TldrawBoard })));

interface Props {
  roomId: string;
  userId: string;
  canEdit: boolean;
}

export function ClassroomWorkspace({ roomId, userId, canEdit }: Props) {
  const [whiteboardId, setWhiteboardId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="h-full w-full">
      {whiteboardId ? (
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading whiteboard…
            </div>
          }
        >
          <TldrawBoard whiteboardId={whiteboardId} userId={userId} canEdit={canEdit} />
        </Suspense>
      ) : error ? (
        <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
          Whiteboard unavailable for this room ({error}).
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Connecting…
        </div>
      )}
    </div>
  );
}
