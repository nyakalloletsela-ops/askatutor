import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { SupabaseYjsProvider, type ProviderStatus } from "./supabase-yjs-provider";

export interface CollabUser {
  id: string;
  name: string;
  color: string;
}

export function hashColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return `hsl(${Math.abs(h) % 360} 70% 50%)`;
}

export function useYjsRoom(roomId: string, user: CollabUser) {
  const [status, setStatus] = useState<ProviderStatus>("connecting");
  const ref = useRef<{ doc: Y.Doc; awareness: Awareness; provider: SupabaseYjsProvider } | null>(null);

  if (ref.current === null) {
    const doc = new Y.Doc();
    const awareness = new Awareness(doc);
    awareness.setLocalState({ user, cursor: null });
    ref.current = {
      doc,
      awareness,
      provider: new SupabaseYjsProvider(roomId, doc, awareness, setStatus),
    };
  }

  useEffect(() => {
    return () => {
      ref.current?.provider.destroy();
      ref.current?.doc.destroy();
      ref.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // keep local user info fresh
  useEffect(() => {
    const aw = ref.current?.awareness;
    if (!aw) return;
    const prev = aw.getLocalState() ?? {};
    aw.setLocalState({ ...prev, user });
  }, [user.id, user.name, user.color]);

  return { doc: ref.current.doc, awareness: ref.current.awareness, status };
}
