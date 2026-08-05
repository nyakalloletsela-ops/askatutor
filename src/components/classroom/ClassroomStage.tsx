import { Whiteboard } from "@/components/whiteboard";
import { LorddaLab } from "@/components/LorddaLab";
import { PenTool, FlaskConical, Atom } from "lucide-react";

export type StageKey = "whiteboard" | "phet" | "sim";

interface Props {
  stage: StageKey;
  onSetStage: (s: StageKey) => void;
  roomId: string;
  userId: string;
  displayName: string;
  isTeacher: boolean;
  onLabOpen: (slug: string) => void;
}

/**
 * Main classroom stage. The whiteboard and the labs share the same area —
 * users toggle between them instead of the labs opening in a new tab/popup.
 */
export function ClassroomStage({ stage, onSetStage, roomId, userId, displayName, isTeacher, onLabOpen }: Props) {
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b bg-muted/40 px-2 py-1.5">
        <StageTab active={stage === "whiteboard"} onClick={() => onSetStage("whiteboard")} icon={<PenTool className="h-3.5 w-3.5" />} label="Whiteboard" />
        <StageTab active={stage === "phet"} onClick={() => onSetStage("phet")} icon={<FlaskConical className="h-3.5 w-3.5" />} label="PhET Lab" />
        <StageTab active={stage === "sim"} onClick={() => onSetStage("sim")} icon={<Atom className="h-3.5 w-3.5" />} label="Simulation Lab" />
      </div>

      {/* All stages stay mounted so board strokes and lab state survive toggling. */}
      <div className="relative min-h-0 flex-1">
        <div className={`absolute inset-0 ${stage === "whiteboard" ? "" : "invisible pointer-events-none"}`}>
          <Whiteboard roomId={roomId} userId={userId} userName={displayName} isTeacher={isTeacher} />
        </div>
        <div className={`absolute inset-0 ${stage === "phet" ? "" : "invisible pointer-events-none"}`}>
          <LorddaLab enforceLimit={false} viewedSlugs={[]} limit={999} onOpen={onLabOpen} roomId={roomId} />
        </div>
        <div className={`absolute inset-0 ${stage === "sim" ? "" : "invisible pointer-events-none"}`}>
          <iframe
            src="/labs/simulation-lab?embed=1"
            title="Simulation Lab"
            className="h-full w-full border-0 bg-background"
            allow="fullscreen; microphone"
          />
        </div>
      </div>
    </div>
  );
}

function StageTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
        active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
