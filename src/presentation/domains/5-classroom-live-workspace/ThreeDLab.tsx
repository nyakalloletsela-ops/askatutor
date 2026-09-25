import { useState } from "react";
import { Button } from "../8-core-ux-navigation/ui/button";
import { Boxes, RotateCw, ExternalLink } from "lucide-react";

const LAB_URL = "https://3dlab.bolt.host";

/**
 * 3D Virtual Lab — embeds the Lordda 3D Discovery Lab (70 interactive
 * modules across Math, Physics, Chemistry, Biology, Engineering).
 * Hosted externally at 3dlab.bolt.host.
 */
export function ThreeDLab() {
  const [key, setKey] = useState(0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 p-2">
        <Boxes className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Lordda 3D Discovery Lab</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          70 interactive modules · Math · Physics · Chemistry · Biology · Engineering
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setKey((k) => k + 1)}
            aria-label="Reload"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button asChild size="icon" variant="outline" aria-label="Open in new tab">
            <a href={LAB_URL} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
      <iframe
        key={key}
        src={LAB_URL}
        title="Lordda 3D Discovery Lab"
        loading="lazy"
        allow="fullscreen; autoplay; xr-spatial-tracking; accelerometer; gyroscope"
        className="flex-1 w-full border-0 bg-[#0a0a1a]"
      />
    </div>
  );
}
