import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { LorddaLab } from "@/components/LorddaLab";
import { ThreeDLab } from "@/components/ThreeDLab";
import { FlaskConical, Boxes } from "lucide-react";

export const Route = createFileRoute("/labs")({
  component: LabsPage,
  head: () => ({
    meta: [
      { title: "Virtual STEM Labs — Ask A Tutor Live" },
      { name: "description", content: "Choose between 60+ PhET 2D simulations and our immersive 3D virtual labs in Physics, Chemistry and Biology." },
      { property: "og:title", content: "Virtual STEM Labs — Ask A Tutor Live" },
      { property: "og:description", content: "PhET simulations and 3D immersive labs for African STEM learners." },
    ],
  }),
});

type Mode = "phet" | "3d";

function LabsPage() {
  const [mode, setMode] = useState<Mode>("phet");

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex shrink-0 items-center gap-2 border-b bg-background px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lab type</span>
        <div className="ml-1 flex rounded-lg border border-border/60 p-0.5">
          <button
            onClick={() => setMode("phet")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "phet" ? "bg-aurora text-white shadow-glow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" /> PhET (2D)
          </button>
          <button
            onClick={() => setMode("3d")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "3d" ? "bg-aurora text-white shadow-glow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Boxes className="h-3.5 w-3.5" /> 3D Virtual Labs
          </button>
        </div>
        <span className="ml-auto hidden text-[11px] text-muted-foreground sm:inline">
          {mode === "phet" ? "60+ proven interactive simulations" : "Immersive 3D — drag, zoom and explore"}
        </span>
      </div>
      <div className="flex-1 overflow-hidden pb-16 md:pb-0">
        {mode === "phet" ? <LorddaLab /> : <ThreeDLab />}
      </div>
    </div>
  );
}
