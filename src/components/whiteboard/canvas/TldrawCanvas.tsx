import { useState } from "react";
import { Tldraw, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import { useYjsRoom, hashColor, type CollabUser } from "../collaboration/useYjsRoom";
import { useTldrawYjsBinding } from "../collaboration/useTldrawYjsBinding";
import { LiveCursors } from "../collaboration/cursors";
import { RecordingBar } from "../timeline/RecordingBar";
import { ConvertButton } from "../ai/ConvertButton";

interface Props {
  roomId: string;
  userId: string;
  userName: string;
  canRecord?: boolean;
}

export function TldrawCanvas({ roomId, userId, userName, canRecord = true }: Props) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const user: CollabUser = { id: userId, name: userName, color: hashColor(userId) };
  const { doc, awareness, status } = useYjsRoom(roomId, user);

  useTldrawYjsBinding(editor, doc);

  return (
    <div className="relative h-full w-full min-h-[400px]">
      <Tldraw
        persistenceKey={`atl-${roomId}`}
        onMount={(ed) => {
          setEditor(ed);
          ed.user.updateUserPreferences({ name: userName, color: user.color });
        }}
      />
      <LiveCursors editor={editor} awareness={awareness} />

      <div className="pointer-events-auto absolute left-2 top-12 z-50 flex items-center gap-2 sm:top-2 sm:left-[12rem]">
        <ConvertButton editor={editor} />
      </div>

      {canRecord && <RecordingBar roomId={roomId} userId={userId} doc={doc} />}
      <div className="pointer-events-none absolute right-2 top-2 z-50 rounded-full bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground shadow">
        {status === "connected" ? "● Live" : status === "connecting" ? "● Connecting…" : "● Offline"}
      </div>
    </div>
  );
}
