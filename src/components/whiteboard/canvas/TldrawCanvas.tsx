import { useEffect, useState } from "react";
import { Tldraw, type Editor } from "tldraw";
import "tldraw/tldraw.css";
import { useYjsRoom, hashColor, type CollabUser } from "../collaboration/useYjsRoom";
import { useTldrawYjsBinding } from "../collaboration/useTldrawYjsBinding";
import { LiveCursors } from "../collaboration/cursors";
import { ConvertButton } from "../ai/ConvertButton";
import { Button } from "@/components/ui/button";
import { Grid3x3, CircleDot, Eye } from "lucide-react";
import * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";

export interface SharedRoom {
  doc: Y.Doc;
  awareness: Awareness;
}

interface Props {
  roomId: string;
  userId: string;
  userName: string;
  /** Optional externally-owned Yjs room. When provided, this canvas does NOT create its own. */
  room?: SharedRoom;
  /** Show the friendly empty-state hint until the user draws something. */
  showEmptyHint?: boolean;
}

export function TldrawCanvas({ roomId, userId, userName, room: externalRoom, showEmptyHint = true }: Props) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const user: CollabUser = { id: userId, name: userName, color: hashColor(userId) };

  // Always call useYjsRoom (hook order must be stable). If caller passes a room, ignore ours.
  const internal = useYjsRoom(roomId, user);
  const doc = externalRoom?.doc ?? internal.doc;
  const awareness = externalRoom?.awareness ?? internal.awareness;

  useTldrawYjsBinding(editor, doc);

  const [gridMode, setGridMode] = useState<"off" | "grid" | "dots">("off");
  const [hasContent, setHasContent] = useState(false);

  // Force light colour scheme + grid mode, watch for emptiness.
  useEffect(() => {
    if (!editor) return;
    editor.user.updateUserPreferences({ colorScheme: "light", name: userName, color: user.color });
    editor.updateInstanceState({ isGridMode: gridMode !== "off" });

    const check = () => setHasContent(editor.getCurrentPageShapeIds().size > 0);
    check();
    const unsub = editor.store.listen(check, { scope: "document" });
    return () => unsub();
  }, [editor, gridMode, userName, user.color]);

  const cycleGrid = () => setGridMode((m) => (m === "off" ? "grid" : m === "grid" ? "dots" : "off"));
  const GridIcon = gridMode === "dots" ? CircleDot : gridMode === "grid" ? Grid3x3 : Eye;

  return (
    <div className="relative h-full w-full min-h-[400px] overflow-hidden rounded-xl border bg-white shadow-sm">
      <div
        className={
          gridMode === "dots"
            ? "absolute inset-0 [background-image:radial-gradient(circle,#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none"
            : ""
        }
      />
      <Tldraw
        persistenceKey={`atl-${roomId}`}
        onMount={(ed) => {
          setEditor(ed);
          ed.user.updateUserPreferences({ name: userName, color: user.color, colorScheme: "light" });
        }}
      />
      <LiveCursors editor={editor} awareness={awareness} />

      {/* Friendly empty-state hint */}
      {showEmptyHint && !hasContent && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="pointer-events-none max-w-sm rounded-2xl border border-dashed bg-white/60 px-6 py-5 text-center shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-foreground">Your whiteboard is ready</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start teaching by drawing, writing notes, or uploading content.
            </p>
          </div>
        </div>
      )}

      {/* Floating top-center toolbelt: grid toggle + AI convert */}
      <div className="pointer-events-auto absolute left-1/2 top-2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-full border bg-background/90 px-1.5 py-1 shadow backdrop-blur">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={cycleGrid}
          title={`Grid: ${gridMode}`}
        >
          <GridIcon className="mr-1 h-3.5 w-3.5" />
          {gridMode === "off" ? "Plain" : gridMode === "grid" ? "Grid" : "Dots"}
        </Button>
        <span className="h-4 w-px bg-border" />
        <ConvertButton editor={editor} />
      </div>
    </div>
  );
}
