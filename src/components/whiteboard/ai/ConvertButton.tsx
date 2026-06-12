import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import type { Editor } from "tldraw";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { whiteboardConvert } from "@/lib/whiteboard-ai.functions";
import { parseConversion, insertBlocksIntoEditor } from "./insertConversion";

export function ConvertButton({ editor }: { editor: Editor | null }) {
  const convert = useServerFn(whiteboardConvert);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!editor || busy) return;
    setBusy(true);
    try {
      // Export only the user's drawn shapes (handwriting/sketches) as PNG.
      const shapeIds = editor.getCurrentPageShapeIds();
      if (shapeIds.size === 0) {
        toast.info("Draw something first, then tap Convert.");
        return;
      }
      const { blob } = await editor.toImage([...shapeIds], {
        format: "png",
        background: true,
        padding: 24,
        scale: 1.5,
      });

      const dataUrl: string = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
      });

      const { text } = await convert({ data: { imageDataUrl: dataUrl } });
      const blocks = parseConversion(text);
      if (blocks.length === 0) {
        toast.error("Couldn't parse the AI output.");
        return;
      }

      // Delete original handwritten strokes – clean digital version replaces them.
      editor.deleteShapes([...shapeIds]);
      insertBlocksIntoEditor(editor, blocks);
      toast.success(`Converted ${blocks.length} block${blocks.length === 1 ? "" : "s"}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      className="h-7 px-2"
      onClick={run}
      disabled={busy || !editor}
      title="Convert handwriting → clean digital text, equations and diagrams"
    >
      {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1 h-3.5 w-3.5" />}
      {busy ? "Converting…" : "Convert to digital"}
    </Button>
  );
}
