import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

const toB64 = (u: Uint8Array) => {
  let s = "";
  for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
  return btoa(s);
};
const fromB64 = (b: string) => {
  const bin = atob(b);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
};

export type ProviderStatus = "connecting" | "connected" | "disconnected";

export class SupabaseYjsProvider {
  channel: RealtimeChannel;
  status: ProviderStatus = "connecting";
  private docHandler: (u: Uint8Array, origin: unknown) => void;
  private awHandler: (changes: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => void;
  private onStatusChange?: (s: ProviderStatus) => void;

  constructor(
    public roomId: string,
    public doc: Y.Doc,
    public awareness: awarenessProtocol.Awareness,
    onStatusChange?: (s: ProviderStatus) => void,
  ) {
    this.onStatusChange = onStatusChange;
    this.channel = supabase.channel(`yjs:${roomId}`, {
      config: { broadcast: { self: false, ack: false } },
    });

    this.docHandler = (update, origin) => {
      if (origin === this) return;
      void this.channel.send({
        type: "broadcast",
        event: "y-update",
        payload: { u: toB64(update) },
      });
    };
    doc.on("update", this.docHandler);

    this.awHandler = ({ added, updated, removed }, origin) => {
      if (origin === "remote") return;
      const changed = [...added, ...updated, ...removed];
      const update = awarenessProtocol.encodeAwarenessUpdate(awareness, changed);
      void this.channel.send({
        type: "broadcast",
        event: "y-awareness",
        payload: { u: toB64(update) },
      });
    };
    awareness.on("update", this.awHandler);

    this.channel
      .on("broadcast", { event: "y-update" }, ({ payload }) => {
        try {
          Y.applyUpdate(doc, fromB64(payload.u as string), this);
        } catch {
          /* ignore */
        }
      })
      .on("broadcast", { event: "y-awareness" }, ({ payload }) => {
        try {
          awarenessProtocol.applyAwarenessUpdate(awareness, fromB64(payload.u as string), "remote");
        } catch {
          /* ignore */
        }
      })
      .on("broadcast", { event: "y-sync-request" }, () => {
        const state = Y.encodeStateAsUpdate(doc);
        void this.channel.send({
          type: "broadcast",
          event: "y-update",
          payload: { u: toB64(state) },
        });
        // also broadcast awareness so newcomers see existing cursors
        const aw = awarenessProtocol.encodeAwarenessUpdate(
          awareness,
          Array.from(awareness.getStates().keys()),
        );
        void this.channel.send({
          type: "broadcast",
          event: "y-awareness",
          payload: { u: toB64(aw) },
        });
      })
      .subscribe((s) => {
        if (s === "SUBSCRIBED") {
          this.setStatus("connected");
          void this.channel.send({ type: "broadcast", event: "y-sync-request", payload: {} });
        } else if (s === "CLOSED" || s === "CHANNEL_ERROR" || s === "TIMED_OUT") {
          this.setStatus("disconnected");
        }
      });
  }

  private setStatus(s: ProviderStatus) {
    if (this.status === s) return;
    this.status = s;
    this.onStatusChange?.(s);
  }

  destroy() {
    this.doc.off("update", this.docHandler);
    this.awareness.off("update", this.awHandler);
    awarenessProtocol.removeAwarenessStates(this.awareness, [this.doc.clientID], "local");
    void supabase.removeChannel(this.channel);
  }
}
