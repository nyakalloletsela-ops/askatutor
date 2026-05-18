import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FlaskConical, Atom, TestTube, Zap, RotateCw } from "lucide-react";

type Module = {
  id: string;
  name: string;
  subject: "Physics" | "Chemistry";
  url: string;
  icon: React.ReactNode;
  description: string;
};

const MODULES: Module[] = [
  {
    id: "circuit",
    name: "Circuit Construction Kit",
    subject: "Physics",
    url: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html",
    icon: <Zap className="h-4 w-4" />,
    description: "Build DC circuits with resistors, bulbs, batteries, and switches.",
  },
  {
    id: "forces",
    name: "Forces & Motion",
    subject: "Physics",
    url: "https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html",
    icon: <Atom className="h-4 w-4" />,
    description: "Push objects, apply friction, and visualise forces.",
  },
  {
    id: "ph",
    name: "pH Scale Lab",
    subject: "Chemistry",
    url: "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html",
    icon: <TestTube className="h-4 w-4" />,
    description: "Mix acids and bases and explore the pH scale.",
  },
  {
    id: "balancing",
    name: "Balancing Chemical Equations",
    subject: "Chemistry",
    url: "https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_en.html",
    icon: <FlaskConical className="h-4 w-4" />,
    description: "Practice balancing common chemical reactions.",
  },
];

export function LorddaLab() {
  const [selected, setSelected] = useState<Module | null>(MODULES[0]);
  const [key, setKey] = useState(0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 p-2">
        <FlaskConical className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-navy">Lordda Virtual Lab</span>
        <div className="ml-auto flex items-center gap-2">
          <Select
            value={selected?.id ?? ""}
            onValueChange={(v) => {
              const m = MODULES.find((m) => m.id === v) ?? null;
              setSelected(m);
              setKey((k) => k + 1);
            }}
          >
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Choose a lab module" />
            </SelectTrigger>
            <SelectContent>
              {MODULES.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <span className="flex items-center gap-2">
                    {m.icon} {m.name} <span className="text-xs text-muted-foreground">({m.subject})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="icon" variant="outline" onClick={() => setKey((k) => k + 1)} aria-label="Reload">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {selected ? (
        <iframe
          key={key}
          src={selected.url}
          title={selected.name}
          loading="lazy"
          allow="fullscreen; autoplay; xr-spatial-tracking"
          className="flex-1 w-full border-0 bg-white"
        />
      ) : (
        <div className="flex-1 p-6 text-sm text-muted-foreground">Select a module.</div>
      )}
      {selected && (
        <p className="border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {selected.description}
        </p>
      )}
    </div>
  );
}
