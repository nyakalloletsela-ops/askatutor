import { useEffect, useState } from "react";
import type { Editor } from "tldraw";
import type { Awareness } from "y-protocols/awareness";

interface PeerState {
  id: number;
  name: string;
  color: string;
  x: number;
  y: number;
}

export function LiveCursors({ editor, awareness }: { editor: Editor | null; awareness: Awareness }) {
  const [peers, setPeers] = useState<PeerState[]>([]);

  // Push local cursor into awareness (throttled).
  useEffect(() => {
    if (!editor) return;
    let last = 0;
    const onPointer = () => {
      const now = performance.now();
      if (now - last < 33) return;
      last = now;
      const p = editor.inputs.currentPagePoint;
      const prev = awareness.getLocalState() ?? {};
      awareness.setLocalState({ ...prev, cursor: { x: p.x, y: p.y } });
    };
    const cleanup = editor.store.listen(() => {}, { source: "user", scope: "session" });
    const id = window.setInterval(onPointer, 50);
    return () => {
      window.clearInterval(id);
      cleanup();
    };
  }, [editor, awareness]);

  // Subscribe to remote awareness, project to screen on every camera/move.
  useEffect(() => {
    if (!editor) return;
    const recompute = () => {
      const out: PeerState[] = [];
      awareness.getStates().forEach((state, clientId) => {
        if (clientId === awareness.clientID) return;
        const u = state?.user as { id: string; name: string; color: string } | undefined;
        const c = state?.cursor as { x: number; y: number } | undefined;
        if (!u || !c) return;
        const s = editor.pageToScreen({ x: c.x, y: c.y });
        out.push({ id: clientId, name: u.name, color: u.color, x: s.x, y: s.y });
      });
      setPeers(out);
    };
    recompute();
    awareness.on("update", recompute);
    const unsubCam = editor.store.listen(recompute, { scope: "session" });
    return () => {
      awareness.off("update", recompute);
      unsubCam();
    };
  }, [editor, awareness]);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {peers.map((p) => (
        <div
          key={p.id}
          className="absolute -translate-x-0.5 -translate-y-0.5"
          style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2 L2 14 L6 10 L9 16 L11 15 L8 9 L14 9 Z" fill={p.color} stroke="white" strokeWidth="1" />
          </svg>
          <span
            className="ml-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow"
            style={{ backgroundColor: p.color }}
          >
            {p.name}
          </span>
        </div>
      ))}
    </div>
  );
}
