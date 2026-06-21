import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Video, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useClassroomRTC } from "@/hooks/useClassroomRTC";
import { Whiteboard } from "@/components/whiteboard";
import { ClassroomHeader } from "./ClassroomHeader";
import { VideoStage } from "./VideoStage";
import { ActionBar, type PanelKey } from "./ActionBar";
import { ClassroomSidePanel, type SidePanelKey } from "./SidePanel";
import { DeviceSettingsDialog } from "./DeviceSettingsDialog";

interface Props {
  roomId: string;
  userId: string;
  displayName: string;
  isTutor: boolean;
  isAdmin: boolean;
  tutorName?: string;
  studentName?: string;
}

export function ClassroomShell({ roomId, userId, displayName, isTutor, isAdmin, tutorName, studentName }: Props) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [panel, setPanel] = useState<PanelKey>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const rtc = useClassroomRTC({ roomId, userId, displayName });

  // Keep page from accidentally scrolling when keyboard/whiteboard activates on mobile
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  const togglePanel = (p: Exclude<PanelKey, null>) => setPanel((cur) => (cur === p ? null : p));

  const onLeave = async () => {
    await rtc.leave();
    void navigate({ to: "/dashboard" });
  };

  const participants = 1 + (rtc.remote ? 1 : 0);

  const localSlot = {
    stream: rtc.localStream,
    name: displayName,
    isLocal: true,
    micOn: rtc.micOn,
    cameraOn: rtc.cameraOn,
    screenSharing: rtc.screenSharing,
    quality: rtc.stats.quality,
    placeholder: rtc.joined ? "Camera off" : "Tap join to start",
  };
  const remoteSlot = {
    stream: rtc.remoteStream,
    name: rtc.remote?.displayName ?? "Waiting for guest…",
    isLocal: false,
    micOn: true,
    cameraOn: !!rtc.remoteStream,
    screenSharing: rtc.remote?.isScreenSharing,
    quality: rtc.stats.quality,
    placeholder: "Waiting…",
  };
  // Tutor video on the left in the strip
  const tutorSlot = isTutor ? localSlot : remoteSlot;
  const studentSlot = isTutor ? remoteSlot : localSlot;

  return (
    <div className="flex h-screen flex-col bg-muted/30 text-foreground">
      <ClassroomHeader
        roomId={roomId}
        tutorName={tutorName}
        studentName={studentName}
        participantsCount={participants}
        quality={rtc.stats.quality}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="relative flex min-h-0 flex-1 gap-2 p-2">
        {/* Center column: whiteboard + (desktop) video strip */}
        <section className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
            <Whiteboard roomId={roomId} userId={userId} userName={displayName} isTeacher={isTutor || isAdmin} />
          </div>

          {/* Desktop: video strip under the whiteboard */}
          {!isMobile && (
            <div className="h-40 shrink-0">
              <VideoStage tutor={tutorSlot} student={studentSlot} variant="strip" />
            </div>
          )}

          {/* Action bar */}
          <div className="pointer-events-none sticky bottom-2 z-30 flex justify-center px-2">
            <ActionBar
              micOn={rtc.micOn}
              cameraOn={rtc.cameraOn}
              screenSharing={rtc.screenSharing}
              panel={panel}
              onToggleMic={() => void rtc.service.toggleMic()}
              onToggleCamera={() => void rtc.service.toggleCamera()}
              onToggleScreen={() =>
                rtc.screenSharing ? void rtc.service.stopScreenShare() : void rtc.service.startScreenShare()
              }
              onTogglePanel={togglePanel}
              onOpenSettings={() => setSettingsOpen(true)}
              onLeave={onLeave}
            />
          </div>
        </section>

        {/* Desktop side panel */}
        {!isMobile && panel && (
          <aside className="w-[360px] shrink-0 overflow-hidden rounded-2xl border bg-card shadow-sm">
            <ClassroomSidePanel
              open={panel}
              onChange={(p) => setPanel(p)}
              roomId={roomId}
              userId={userId}
              displayName={displayName}
            />
          </aside>
        )}

        {/* Mobile floating videos */}
        {isMobile && rtc.joined && (
          <VideoStage tutor={tutorSlot} student={studentSlot} variant="floating" />
        )}

        {/* Mobile bottom sheet */}
        <Sheet open={isMobile && !!panel} onOpenChange={(o) => !o && setPanel(null)}>
          <SheetContent side="bottom" className="h-[80vh] p-0">
            {panel && (
              <ClassroomSidePanel
                open={panel}
                onChange={(p) => setPanel(p)}
                roomId={roomId}
                userId={userId}
                displayName={displayName}
              />
            )}
          </SheetContent>
        </Sheet>

        {/* Pre-join overlay */}
        {!rtc.joined && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-background/85 backdrop-blur-sm">
            <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center shadow-xl">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Video className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold">Ready to join the classroom?</h2>
              <p className="text-xs text-muted-foreground">
                Your browser will ask for camera and microphone access. You can change devices any time from the settings cog.
              </p>
              {rtc.error && <p className="text-xs text-destructive">{rtc.error}</p>}
              <Button size="lg" onClick={() => void rtc.join()} disabled={rtc.joining} className="w-full">
                {rtc.joining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
                {rtc.joining ? "Joining…" : "Join classroom"}
              </Button>
              <button onClick={onLeave} className="text-xs text-muted-foreground hover:text-foreground">
                Cancel and go back
              </button>
            </div>
          </div>
        )}
      </main>

      <DeviceSettingsDialog service={rtc.service} open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
