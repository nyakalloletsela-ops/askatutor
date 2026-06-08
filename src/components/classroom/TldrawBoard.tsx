import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import "tldraw/tldraw.css";
import { Tldraw, type Editor, type TLRecord, createShapeId, toRichText } from "tldraw";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TldrawBoardHandle {
  insertText: (value: string) => void;
}

interface Props {
  whiteboardId: string;
  userId: string;
  canEdit: boolean;
}

const MUTATION_DEBOUNCE_MS = 200;
const SNAPSHOT_INTERVAL_MS = 60_000;

export const TldrawBoard = forwardRef<TldrawBoardHandle, Props>(function TldrawBoard(
  { whiteboardId, userId, canEdit },
  ref,
) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const remoteApplyingRef = useRef(false);
  const pendingRef = useRef<{
    added: Record<string, TLRecord>;
    updated: Record<string, [TLRecord, TLRecord]>;
    removed: Record<string, TLRecord>;
  }>({ added: {}, updated: {}, removed: {} });
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);
  const lastSnapshotAtRef = useRef<string | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      insertText: (value: string) => {
        if (!editor) return;
        const id = createShapeId();
        const view = editor.getViewportPageBounds();
        editor.createShape({
          id,
          type: "text",
          x: view.midX - 100,
          y: view.midY,
          props: { richText: toRichText(value), w: 320, autoSize: false },
        });
      },
    }),
    [editor],
  );

  // Initial load: latest snapshot + replay mutations after it
  useEffect(() => {
    if (!editor) return;
    let cancelled = false;

    (async () => {
      const { data: snap } = await supabase
        .from("whiteboard_snapshots")
        .select("snapshot_data, created_at")
        .eq("whiteboard_id", whiteboardId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      remoteApplyingRef.current = true;
      try {
        if (snap?.snapshot_data) {
          try {
            editor.loadSnapshot(snap.snapshot_data as never);
          } catch (e) {
            console.warn("snapshot load failed", e);
          }
          lastSnapshotAtRef.current = snap.created_at;
        }

        let q = supabase
          .from("whiteboard_mutations")
          .select("mutation_type, mutation_payload, created_at")
          .eq("whiteboard_id", whiteboardId)
          .order("created_at", { ascending: true });
        if (lastSnapshotAtRef.current) q = q.gt("created_at", lastSnapshotAtRef.current);
        const { data: muts } = await q;
        if (cancelled) return;
        for (const m of muts ?? [])
          applyRemoteMutation(editor, m.mutation_type, (m.mutation_payload ?? {}) as Record<string, unknown>);
      } finally {
        remoteApplyingRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editor, whiteboardId]);

  // Listen for local changes → batch insert
  useEffect(() => {
    if (!editor || !canEdit) return;
    const unsub = editor.store.listen(
      (entry) => {
        if (remoteApplyingRef.current) return;
        if (entry.source !== "user") return;
        const p = pendingRef.current;
        for (const [id, rec] of Object.entries(entry.changes.added))
          p.added[id] = rec as TLRecord;
        for (const [id, tuple] of Object.entries(entry.changes.updated))
          p.updated[id] = tuple as [TLRecord, TLRecord];
        for (const [id, rec] of Object.entries(entry.changes.removed))
          p.removed[id] = rec as TLRecord;
        dirtyRef.current = true;
        if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
        flushTimerRef.current = setTimeout(flushPending, MUTATION_DEBOUNCE_MS);
      },
      { source: "user", scope: "document" },
    );
    return () => {
      unsub();
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, canEdit, whiteboardId, userId]);

  const flushPending = async () => {
    const p = pendingRef.current;
    const added = Object.values(p.added);
    const updated = Object.values(p.updated).map(([, next]) => next);
    const removedIds = Object.keys(p.removed);
    pendingRef.current = { added: {}, updated: {}, removed: {} };
    if (!added.length && !updated.length && !removedIds.length) return;

    const rows: Array<{ whiteboard_id: string; user_id: string; mutation_type: string; mutation_payload: Record<string, unknown> }> = [];
    if (added.length) rows.push({ whiteboard_id: whiteboardId, user_id: userId, mutation_type: "add", mutation_payload: { records: added as unknown as Record<string, unknown>[] } });
    if (updated.length) rows.push({ whiteboard_id: whiteboardId, user_id: userId, mutation_type: "update", mutation_payload: { records: updated as unknown as Record<string, unknown>[] } });
    if (removedIds.length) rows.push({ whiteboard_id: whiteboardId, user_id: userId, mutation_type: "remove", mutation_payload: { ids: removedIds } });

    const { error } = await supabase.from("whiteboard_mutations").insert(rows as never);
    if (error) console.warn("mutation insert failed", error.message);
  };

  // Subscribe to remote mutations
  useEffect(() => {
    if (!editor) return;
    const channel = supabase
      .channel(`wb:${whiteboardId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "whiteboard_mutations",
          filter: `whiteboard_id=eq.${whiteboardId}`,
        },
        (payload) => {
          const row = payload.new as {
            user_id: string;
            mutation_type: string;
            mutation_payload: Record<string, unknown>;
          };
          if (row.user_id === userId) return;
          remoteApplyingRef.current = true;
          try {
            applyRemoteMutation(editor, row.mutation_type, row.mutation_payload);
          } finally {
            remoteApplyingRef.current = false;
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [editor, whiteboardId, userId]);

  // Periodic snapshot (only if we have local edits)
  useEffect(() => {
    if (!editor || !canEdit) return;
    const interval = setInterval(async () => {
      if (!dirtyRef.current) return;
      if (typeof document !== "undefined" && document.hidden) return;
      dirtyRef.current = false;
      try {
        const snapshot = editor.getSnapshot();
        const { error } = await supabase
          .from("whiteboard_snapshots")
          .insert({ whiteboard_id: whiteboardId, snapshot_data: snapshot as never });
        if (error) console.warn("snapshot failed", error.message);
      } catch (e) {
        console.warn("snapshot serialize failed", e);
      }
    }, SNAPSHOT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [editor, whiteboardId, canEdit]);

  return (
    <div className="h-full w-full">
      <Tldraw
        onMount={(ed) => {
          setEditor(ed);
          ed.updateInstanceState({ isReadonly: !canEdit });
          if (!canEdit) toast.info("Read-only — only the tutor can edit this board");
        }}
      />
    </div>
  );
});

function applyRemoteMutation(editor: Editor, type: string, payload: Record<string, unknown>) {
  try {
    if (type === "add" || type === "update") {
      const records = (payload.records as TLRecord[] | undefined) ?? [];
      if (records.length) editor.store.mergeRemoteChanges(() => editor.store.put(records));
    } else if (type === "remove") {
      const ids = (payload.ids as string[] | undefined) ?? [];
      if (ids.length) editor.store.mergeRemoteChanges(() => editor.store.remove(ids as never));
    }
  } catch (e) {
    console.warn("apply remote mutation failed", e);
  }
}
