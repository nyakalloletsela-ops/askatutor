import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const toB64 = (u: Uint8Array) => {
  let s = "";
  for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
  return btoa(s);
};

interface PendingUpdate {
  t: number;
  u: Uint8Array;
}

/**
 * Records Yjs updates for a room into Supabase as timeline deltas.
 * Batches every 1000ms (merges multiple Y updates into one row).
 */
export function useRecorder(roomId: string, doc: Y.Doc, userId: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef<number>(0);
  const bufferRef = useRef<PendingUpdate[]>([]);
  const flushTimerRef = useRef<number | null>(null);
  const tickTimerRef = useRef<number | null>(null);

  const flush = async () => {
    const sid = sessionId;
    if (!sid) return;
    const items = bufferRef.current;
    if (items.length === 0) return;
    bufferRef.current = [];
    const merged = Y.mergeUpdates(items.map((i) => i.u));
    const tOffset = items[0].t;
    const { error } = await supabase.from("canvas_timeline_deltas").insert({
      session_id: sid,
      t_offset_ms: tOffset,
      delta_data: { u: toB64(merged) },
    });
    if (error) {
      // put items back so we can retry
      bufferRef.current = [...items, ...bufferRef.current];
      console.error("[recorder] flush failed", error);
    }
  };

  useEffect(() => {
    if (!isRecording || !sessionId) return;
    const onUpdate = (update: Uint8Array) => {
      bufferRef.current.push({ t: Date.now() - startTimeRef.current, u: update });
    };
    doc.on("update", onUpdate);
    // initial snapshot at t=0 so playback starts from current state
    bufferRef.current.push({ t: 0, u: Y.encodeStateAsUpdate(doc) });
    flushTimerRef.current = window.setInterval(() => void flush(), 1000);
    tickTimerRef.current = window.setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 250);
    return () => {
      doc.off("update", onUpdate);
      if (flushTimerRef.current) window.clearInterval(flushTimerRef.current);
      if (tickTimerRef.current) window.clearInterval(tickTimerRef.current);
      flushTimerRef.current = null;
      tickTimerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, sessionId, doc]);

  const start = async (title?: string) => {
    const { data, error } = await supabase
      .from("whiteboard_sessions")
      .insert({ room_id: roomId, started_by: userId, title: title ?? null })
      .select("id")
      .single();
    if (error || !data) {
      toast.error(error?.message ?? "Could not start recording");
      return;
    }
    startTimeRef.current = Date.now();
    bufferRef.current = [];
    setSessionId(data.id);
    setIsRecording(true);
    setElapsedMs(0);
    toast.success("Recording started");
  };

  const stop = async () => {
    setIsRecording(false);
    await flush();
    if (sessionId) {
      await supabase
        .from("whiteboard_sessions")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", sessionId);
      toast.success("Recording saved");
    }
    setSessionId(null);
  };

  return { isRecording, sessionId, elapsedMs, start, stop };
}
