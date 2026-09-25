import { useState } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "../../../8-core-ux-navigation/ui/button";
import { toast } from "sonner";
import { whiteboardConvert } from "@/application/use-cases/whiteboard/convert";
import type { WhiteboardHandle } from "../canvas/Whiteboard";

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

      // Call the convert endpoint. It will throw an error indicating
      // that handwriting recognition is not implemented.
      await convert({ data: { imageDataUrl: dataUrl } });

      // If we reach here, the conversion succeeded (unexpected with current impl)
      toast.success("Conversion completed.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Conversion failed";
      if (msg.includes("not available") || msg.includes("not implemented")) {
        toast.error("Handwriting-to-LaTeX is not available. This feature requires a dedicated handwriting-math recognition implementation that does not depend on the platform AI Gateway.");
      } else {
        console.error("Convert failed", e);
        toast.error(msg);
      }
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
      title="Convert handwriting → clean digital text, equations and diagrams (not available)"
    >
      {busy ? (
        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
      ) : (
        <AlertCircle className="mr-1 h-3.5 w-3.5" />
      )}
      <span className="hidden xs:inline">{busy ? "Converting…" : "Convert"}</span>
    </Button>
  );
}
