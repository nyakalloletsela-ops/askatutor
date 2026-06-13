import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { FloatingVideo, type FloatingVideoHandle } from "@/components/FloatingVideo";
import { TldrawCanvas } from "@/components/whiteboard";
import { useYjsRoom, hashColor, type CollabUser } from "@/components/whiteboard/collaboration/useYjsRoom";
import { LorddaLab } from "@/components/LorddaLab";
import { WebGLLab } from "@/components/WebGLLab";
import { ClassroomFiles } from "@/components/ClassroomFiles";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { checkRoomMembership } from "@/lib/access.functions";
import { ClassroomTopBar } from "@/components/classroom/TopBar";
import { ParticipantsPanel } from "@/components/classroom/ParticipantsPanel";
import { ClassroomSidePanel } from "@/components/classroom/SidePanel";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Participant } from "@/components/JitsiRoom";

export const Route = createFileRoute("/_authenticated/classroom/$roomId")({
  beforeLoad: async ({ params }) => {
    try {
      const { isMember } = await checkRoomMembership({ data: { roomId: params.roomId } });
      if (!isMember) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: ClassroomPage,
});

function NotesPanel({ roomId }: { roomId: string }) {
  const storageKey = `classroom-notes:${roomId}`;
  const [value, setValue] = useState("");
  useEffect(() => {
    try {
      setValue(localStorage.getItem(storageKey) ?? "");
    } catch {
      /* noop */
    }
  }, [storageKey]);
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, value);
      } catch {
        /* noop */
      }
    }, 300);
    return () => clearTimeout(id);
  }, [storageKey, value]);
  return (
    <div className="flex h-full flex-col p-3">
      <p className="mb-2 text-xs text-muted-foreground">
        Private notes for this session — auto-saved on this device.
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Take notes during the lesson…"
        className="min-h-0 flex-1 resize-none rounded-xl border bg-card p-3 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}

function ClassroomPage() {
  const { roomId } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const [isTutor, setIsTutor] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeTab, setActiveTab] = useState("whiteboard");
  const [sidePanel, setSidePanel] = useState<"chat" | "ai" | null>(null);
  const [leftOpen, setLeftOpen] = useState(false);
  const videoRef = useRef<FloatingVideoHandle>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!user) return;
    if (roomId.startsWith("demo-")) {
      setIsTutor(true);
      return;
    }
    supabase
      .from("sessions")
      .select("tutor_id")
      .eq("room_id", roomId)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        const row = data as { tutor_id: string } | null;
        setIsTutor(!!row && row.tutor_id === user.id);
      });
  }, [roomId, user]);

  // Single shared Yjs room — used by whiteboard, recorder, awareness, cursors.
  const displayName = user?.email ?? "Guest";
  const collabUser: CollabUser = user
    ? { id: user.id, name: displayName, color: hashColor(user.id) }
    : { id: "anon", name: "Guest", color: "#888" };
  const room = useYjsRoom(roomId, collabUser);

  if (!user) return null;
  const canRecord = isTutor || isAdmin;
  const totalParticipants = participants.length + 1; // include self

  const toggleSidePanel = (panel: "chat" | "ai") => {
    setSidePanel((curr) => (curr === panel ? null : panel));
  };

  const participantsPanel = (
    <ParticipantsPanel
      participants={participants}
      awareness={room.awareness}
      selfId={user.id}
      selfName={displayName}
      isTutor={isTutor}
    />
  );

  return (
    <div className="flex h-screen flex-col bg-muted/30 text-foreground">
      <ClassroomTopBar
        roomId={roomId}
        participantsCount={totalParticipants}
        doc={room.doc}
        userId={user.id}
        canRecord={canRecord}
        onToggleLeft={() => setLeftOpen(true)}
        onToggleRight={toggleSidePanel}
        rightOpen={sidePanel}
      />

      <main className="flex min-h-0 flex-1 gap-2 p-2">
        {/* Left sidebar — desktop only */}
        <div className="hidden w-[260px] shrink-0 overflow-hidden rounded-xl border bg-card shadow-sm lg:block">
          {participantsPanel}
        </div>

        {/* Mobile left drawer */}
        <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
          <SheetContent side="left" className="w-[300px] p-0">
            {participantsPanel}
          </SheetContent>
        </Sheet>

        {/* Center */}
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full min-h-0 flex-col">
            <div className="flex items-center border-b bg-background/60 px-2 py-1.5">
              <TabsList className="h-9 bg-muted/60">
                <TabsTrigger value="whiteboard" className="text-xs">
                  Whiteboard
                </TabsTrigger>
                <TabsTrigger value="notes" className="text-xs">
                  Notes
                </TabsTrigger>
                <TabsTrigger value="files" className="text-xs">
                  Files
                </TabsTrigger>
                <TabsTrigger value="lab" className="text-xs">
                  PhET Lab
                </TabsTrigger>
                <TabsTrigger value="lab3d" className="text-xs">
                  3D Lab
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="whiteboard" className="m-0 min-h-0 flex-1 p-2">
              <TldrawCanvas
                roomId={roomId}
                userId={user.id}
                userName={displayName}
                room={{ doc: room.doc, awareness: room.awareness }}
              />
            </TabsContent>
            <TabsContent value="notes" className="m-0 min-h-0 flex-1">
              <NotesPanel roomId={roomId} />
            </TabsContent>
            <TabsContent value="files" className="m-0 min-h-0 flex-1">
              <ClassroomFiles roomId={roomId} />
            </TabsContent>
            <TabsContent value="lab" className="m-0 min-h-0 flex-1">
              <LorddaLab enforceLimit={false} viewedSlugs={[]} limit={Infinity} onOpen={() => {}} roomId={roomId} />
            </TabsContent>
            <TabsContent value="lab3d" className="m-0 min-h-0 flex-1">
              <WebGLLab enforceLimit={false} viewedSlugs={[]} limit={Infinity} onOpen={() => {}} />
            </TabsContent>
          </Tabs>
        </section>

        {/* Right side panel — desktop docks, mobile becomes a sheet */}
        {!isMobile && sidePanel && (
          <div className="hidden w-[360px] shrink-0 overflow-hidden rounded-xl border bg-card shadow-sm md:block">
            <ClassroomSidePanel
              open={sidePanel}
              onChange={setSidePanel}
              roomId={roomId}
              userId={user.id}
              displayName={displayName}
            />
          </div>
        )}

        <Sheet open={isMobile && !!sidePanel} onOpenChange={(o) => !o && setSidePanel(null)}>
          <SheetContent side="right" className="w-full max-w-md p-0 sm:max-w-md">
            {sidePanel && (
              <ClassroomSidePanel
                open={sidePanel}
                onChange={setSidePanel}
                roomId={roomId}
                userId={user.id}
                displayName={displayName}
              />
            )}
          </SheetContent>
        </Sheet>
      </main>

      <FloatingVideo
        ref={videoRef}
        roomId={roomId}
        displayName={displayName}
        email={user.email ?? ""}
        onParticipantsChange={setParticipants}
      />
    </div>
  );
}
