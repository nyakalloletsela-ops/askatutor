import { useEffect, useState } from "react";
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

interface Room {
  doc: Y.Doc;
  awareness: Awareness;
  provider: SupabaseYjsProvider | null;
}

export function useYjsRoom(roomId: string, user: CollabUser) {
  const [status, setStatus] = useState<ProviderStatus>("connecting");

  // Lazy-create the Y.Doc + Awareness so they survive StrictMode double-mount.
  // The Supabase provider is wired up inside useEffect and recreated on roomId change.
  const [room] = useState<Room>(() => {
    const doc = new Y.Doc();
    const awareness = new Awareness(doc);
    awareness.setLocalState({ user, cursor: null });
    return { doc, awareness, provider: null };
  });

  useEffect(() => {
    setStatus("connecting");
    const provider = new SupabaseYjsProvider(roomId, room.doc, room.awareness, setStatus);
    room.provider = provider;
    return () => {
      provider.destroy();
      room.provider = null;
    };
  }, [roomId, room]);

  // Tear the doc down only when the component truly unmounts.
  useEffect(() => {
    return () => {
      room.awareness.destroy();
      room.doc.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep local user info fresh
  useEffect(() => {
    const prev = room.awareness.getLocalState() ?? {};
    room.awareness.setLocalState({ ...prev, user });
  }, [user.id, user.name, user.color, room]);

  return { doc: room.doc, awareness: room.awareness, status };
}
