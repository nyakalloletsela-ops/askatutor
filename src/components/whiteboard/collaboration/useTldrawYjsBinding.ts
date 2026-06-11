import { useEffect } from "react";
import type { Editor, TLRecord } from "tldraw";
import * as Y from "yjs";

/**
 * Two-way binding between a tldraw Editor's document store and a Yjs map.
 * Y.Map<recordId, TLRecord>. Remote and local changes never echo back.
 */
export function useTldrawYjsBinding(editor: Editor | null, doc: Y.Doc) {
  useEffect(() => {
    if (!editor) return;
    const yRecords = doc.getMap<TLRecord>("tl-records");

    // 1) Seed: if Y has data and local store is "empty user content", load Y -> store.
    //    If Y is empty but local store has user content, push local -> Y so peers see it.
    const yIsEmpty = yRecords.size === 0;
    const allLocal = editor.store.allRecords().filter((r) => r.typeName === "shape" || r.typeName === "asset");
    if (yIsEmpty && allLocal.length > 0) {
      doc.transact(() => {
        for (const r of allLocal) yRecords.set(r.id, r);
      }, "init-local");
    } else if (!yIsEmpty) {
      const toPut: TLRecord[] = [];
      yRecords.forEach((r) => toPut.push(r));
      editor.store.mergeRemoteChanges(() => {
        editor.store.put(toPut);
      });
    }

    // 2) Local -> Y
    const unsubStore = editor.store.listen(
      ({ changes }) => {
        doc.transact(() => {
          for (const rec of Object.values(changes.added) as TLRecord[]) {
            if (rec.typeName === "shape" || rec.typeName === "asset") yRecords.set(rec.id, rec);
          }
          for (const entry of Object.values(changes.updated) as [TLRecord, TLRecord][]) {
            const rec = entry[1];
            if (rec.typeName === "shape" || rec.typeName === "asset") yRecords.set(rec.id, rec);
          }
          for (const rec of Object.values(changes.removed) as TLRecord[]) {
            if (rec.typeName === "shape" || rec.typeName === "asset") yRecords.delete(rec.id);
          }
        }, "local");
      },
      { source: "user", scope: "document" },
    );

    // 3) Y -> Local
    const yObserver = (event: Y.YMapEvent<TLRecord>, tx: Y.Transaction) => {
      if (tx.origin === "local") return;
      const toPut: TLRecord[] = [];
      const toRemove: TLRecord["id"][] = [];
      event.changes.keys.forEach((change, key) => {
        if (change.action === "delete") toRemove.push(key as TLRecord["id"]);
        else {
          const rec = yRecords.get(key);
          if (rec) toPut.push(rec);
        }
      });
      editor.store.mergeRemoteChanges(() => {
        if (toPut.length) editor.store.put(toPut);
        if (toRemove.length) editor.store.remove(toRemove);
      });
    };
    yRecords.observe(yObserver);

    return () => {
      unsubStore();
      yRecords.unobserve(yObserver);
    };
  }, [editor, doc]);
}
