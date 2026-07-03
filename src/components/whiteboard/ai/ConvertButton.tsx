import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { whiteboardConvert } from "@/lib/whiteboard-ai.functions";
import { parseConversion, blocksToShapes } from "./insertConversion";
import type { WhiteboardHandle } from "../canvas/Whiteboard";
import type { Shape } from "../canvas/engine";

export function ConvertButton({ handle }: { handle: WhiteboardHandle | null }) {
  const convert = useServerFn(whiteboardConvert);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    const wb = handle;
    if (!wb) {
      toast.error("Whiteboard not ready yet.");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      let onlyHandwriting = true;
      let dataUrl = await wb.exportPng({ onlyHandwriting: true });
      if (!dataUrl) {
        onlyHandwriting = false;
        dataUrl = await wb.exportPng({ onlyHandwriting: false });
      }
      if (!dataUrl) {
        toast.info("Draw or add something first, then tap Convert.");
        return;
      }

      // Snapshot shapes BEFORE deletion so we can compute a safe insertion origin
      // that never overlaps existing (already-converted) content.
      const snapshot = wb.getShapes();
      const handwriting = snapshot.filter((s) => s.type === "pencil" || s.type === "highlighter");
      const others = snapshot.filter((s) => s.type !== "pencil" && s.type !== "highlighter");

      const { text } = await convert({ data: { imageDataUrl: dataUrl } });
      const blocks = parseConversion(text);
      if (blocks.length === 0) {
        console.warn("AI converter raw output:", text);
        toast.error("Couldn't parse the AI output. Try again.");
        return;
      }
      if (onlyHandwriting) {
        wb.deleteShapes(handwriting.map((s) => s.id));
      }

      // Place new blocks at the handwriting's top-left, but push them below any
      // already-converted content so nothing overwrites what's already there.
      const hwBounds = boundsOf(handwriting);
      const otherBounds = boundsOf(others);
      const originX = hwBounds ? hwBounds.x : 80;
      const originY = Math.max(
        hwBounds ? hwBounds.y : 80,
        otherBounds ? otherBounds.y + otherBounds.h + 32 : 80,
      );

      const shapes = blocksToShapes(blocks, { x: originX, y: originY });
      wb.addShapes(shapes);
      toast.success(`Converted ${blocks.length} block${blocks.length === 1 ? "" : "s"}.`);
    } catch (e) {
      console.error("Convert failed", e);
      toast.error(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      className="h-7 px-2 shrink-0"
      onClick={run}
      disabled={busy}
      title="Convert handwriting → clean digital text, equations and diagrams"
    >
      {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1 h-3.5 w-3.5" />}
      <span className="hidden xs:inline">{busy ? "Converting…" : "AI Convert"}</span>
    </Button>
  );
}
