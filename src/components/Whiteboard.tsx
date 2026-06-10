import { useState } from "react";
import { Tldraw, Editor, createShapeId } from "@tldraw/tldraw";
import { MathTools } from "./MathTools"; // Ensure the path matches where you saved the file
import { Sigma } from "lucide-react";
import "@tldraw/tldraw/tldraw.css";

export default function WhiteboardCanvas() {
  // Store the active tldraw editor instance so we can inject shapes into it
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isMathToolsOpen, setIsMathToolsOpen] = useState(false);

  // Function to inject LaTeX text into the center of the user's current view
  const handleInsertLatex = (texString: string) => {
    if (!editor) return;

    // Get exactly where the user is currently looking on the infinite canvas
    const viewportCenter = editor.getViewportPageBounds().center;

    editor.createShapes([
      {
        id: createShapeId(),
        type: "text",
        x: viewportCenter.x - 100, // Offset slightly to center the text
        y: viewportCenter.y - 20,
        props: {
          text: texString,
          scale: 1.3,
        },
      },
    ]);

    // Automatically select the new shape so the user can immediately drag it
    const shapes = editor.getCurrentPageShapes();
    const newestShape = shapes[shapes.length - 1];
    if (newestShape) {
      editor.select(newestShape.id);
    }

    setIsMathToolsOpen(false);
  };

  // Function to inject Calculation text into the center of the user's current view
  const handleInsertText = (textString: string) => {
    if (!editor) return;

    const viewportCenter = editor.getViewportPageBounds().center;

    editor.createShapes([
      {
        id: createShapeId(),
        type: "text",
        x: viewportCenter.x - 100,
        y: viewportCenter.y - 20,
        props: {
          text: textString,
          scale: 1.1,
        },
      },
    ]);

    const shapes = editor.getCurrentPageShapes();
    const newestShape = shapes[shapes.length - 1];
    if (newestShape) {
      editor.select(newestShape.id);
    }

    setIsMathToolsOpen(false);
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-background">
      {/* FLOATING CONTROL OVERLAY */}
      {/* Positioned top-center so it doesn't block tldraw's native UI panels */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[50] flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-2 bg-background/95 backdrop-blur shadow-xl border px-3 py-1.5 rounded-full pointer-events-auto">
          <button
            onClick={() => setIsMathToolsOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-full"
          >
            <Sigma className="h-4 w-4" />
            <span>STEM Tools</span>
          </button>
        </div>
      </div>

      {/* THE TLDRAW ENGINE */}
      <div className="absolute inset-0 z-0">
        <Tldraw onMount={(editorInstance) => setEditor(editorInstance)} inferDarkMode={false} />
      </div>

      {/* THE MODAL (Hidden until button is clicked) */}
      <MathTools
        open={isMathToolsOpen}
        onClose={() => setIsMathToolsOpen(false)}
        onInsertLatex={handleInsertLatex}
        onInsertText={handleInsertText}
      />
    </div>
  );
}
