import { Mic, MicOff, Video, VideoOff, MonitorUp, MonitorOff, MessageSquare, FileText, StickyNote, Sparkles, PhoneOff, Settings, PictureInPicture2, PanelLeft, Focus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LayoutMode } from "./VideoLayout";

export type PanelKey = "chat" | "files" | "notes" | "ai" | null;

interface Props {
  micOn: boolean;
  cameraOn: boolean;
  screenSharing: boolean;
  panel: PanelKey;
  layoutMode: LayoutMode;
  onSetLayout: (mode: LayoutMode) => void;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreen: () => void;
  onTogglePanel: (panel: Exclude<PanelKey, null>) => void;
  onOpenSettings: () => void;
  onLeave: () => void;
}

export function ActionBar({
  micOn, cameraOn, screenSharing, panel,
  onToggleMic, onToggleCamera, onToggleScreen, onTogglePanel, onOpenSettings, onLeave,
}: Props) {
  return (
    <div className="pointer-events-auto mx-auto flex w-full max-w-3xl items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-zinc-900/85 px-2 py-2 shadow-2xl backdrop-blur sm:gap-2">
      <CircleButton active={micOn} onClick={onToggleMic} title={micOn ? "Mute" : "Unmute"} danger={!micOn}>
        {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </CircleButton>
      <CircleButton active={cameraOn} onClick={onToggleCamera} title={cameraOn ? "Stop camera" : "Start camera"} danger={!cameraOn}>
        {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
      </CircleButton>
      <CircleButton active={screenSharing} onClick={onToggleScreen} title={screenSharing ? "Stop sharing" : "Share screen"} accent={screenSharing}>
        {screenSharing ? <MonitorOff className="h-4 w-4" /> : <MonitorUp className="h-4 w-4" />}
      </CircleButton>

      <span className="mx-1 h-6 w-px bg-white/15" />

      <CircleButton active={panel === "chat"} onClick={() => onTogglePanel("chat")} title="Chat">
        <MessageSquare className="h-4 w-4" />
      </CircleButton>
      <CircleButton active={panel === "files"} onClick={() => onTogglePanel("files")} title="Files">
        <FileText className="h-4 w-4" />
      </CircleButton>
      <CircleButton active={panel === "notes"} onClick={() => onTogglePanel("notes")} title="Notes">
        <StickyNote className="h-4 w-4" />
      </CircleButton>
      <CircleButton active={panel === "ai"} onClick={() => onTogglePanel("ai")} title="AI Tutor">
        <Sparkles className="h-4 w-4" />
      </CircleButton>

      <span className="mx-1 h-6 w-px bg-white/15" />

      <CircleButton onClick={onOpenSettings} title="Devices">
        <Settings className="h-4 w-4" />
      </CircleButton>
      <Button onClick={onLeave} variant="destructive" size="sm" className="ml-1 h-9 rounded-full px-3">
        <PhoneOff className="mr-1.5 h-4 w-4" /> Leave
      </Button>
    </div>
  );
}

function CircleButton({
  children, onClick, active, danger, accent, title,
}: {
  children: React.ReactNode; onClick: () => void; active?: boolean; danger?: boolean; accent?: boolean; title: string;
}) {
  const base = "grid h-9 w-9 place-items-center rounded-full transition shrink-0";
  const tone = danger
    ? "bg-rose-500/90 text-white hover:bg-rose-500"
    : accent
    ? "bg-sky-500/90 text-white hover:bg-sky-500"
    : active
    ? "bg-white text-zinc-900 hover:bg-zinc-100"
    : "bg-white/10 text-white hover:bg-white/20";
  return (
    <button type="button" title={title} aria-label={title} onClick={onClick} className={`${base} ${tone}`}>
      {children}
    </button>
  );
}
