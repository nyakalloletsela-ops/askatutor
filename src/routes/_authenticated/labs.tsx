import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { LorddaLab } from "@/components/LorddaLab";
import { ThreeDLab } from "@/components/ThreeDLab";
import { FlaskConical, Boxes, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  STUDENT_LAB_LIMIT,
  readViewedSlugs,
  recordViewedSlug,
} from "@/lib/lab-modules";

export const Route = createFileRoute("/_authenticated/labs")({
  component: LabsPage,
  head: () => ({
    meta: [
      { title: "Virtual STEM Labs — Ask A Tutor Live" },
      { name: "description", content: "60+ interactive science simulations — available in 2D (PhET) and immersive 3D." },
    ],
  }),
});

type Mode = "phet" | "3d";

function LabsPage() {
  const [mode, setMode] = useState<Mode>("phet");
  const { isAdmin, isTutor } = useAuth();
  const [viewed, setViewed] = useState<string[]>([]);

  // Students get capped access; tutors and admins are unlimited.
  const enforceLimit = !isAdmin && !isTutor;

  useEffect(() => { setViewed(readViewedSlugs()); }, []);

  const handleOpen = (slug: string) => {
    if (!enforceLimit) return;
    setViewed(recordViewedSlug(slug));
  };

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
          {enforceLimit
            ? `Free plan · ${viewed.length}/${STUDENT_LAB_LIMIT} experiments used`
            : "Unlimited access"}
        </span>
      </div>
      <div className="flex-1 overflow-hidden pb-16 md:pb-0">
        {mode === "phet" ? (
          <LorddaLab
            enforceLimit={enforceLimit}
            viewedSlugs={viewed}
            limit={STUDENT_LAB_LIMIT}
            onOpen={handleOpen}
          />
        ) : (
          <ThreeDLab
            enforceLimit={enforceLimit}
            viewedSlugs={viewed}
            limit={STUDENT_LAB_LIMIT}
            onOpen={handleOpen}
          />
        )}
      </div>
      {mode === "phet" && (
        <div className="flex shrink-0 items-center justify-center gap-1 border-t bg-muted/30 px-3 py-1.5 text-[10px] text-muted-foreground">
          <span>2D simulations by</span>
          <a
            href="https://phet.colorado.edu"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 underline hover:text-foreground"
          >
            PhET Interactive Simulations <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <span>· University of Colorado Boulder · CC BY 4.0</span>
        </div>
      )}
    </div>
  );
}
