import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { FloatingVideo } from "@/components/FloatingVideo";
import { Whiteboard } from "@/components/Whiteboard";
import { LorddaLab } from "@/components/LorddaLab";
import { ClassroomFiles } from "@/components/ClassroomFiles";
import { DeviceSelector, type JitsiDeviceApi } from "@/components/DeviceSelector";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Camera, ExternalLink, Mic, Stethoscope, Users } from "lucide-react";
import { checkRoomMembership } from "@/lib/access.functions";
import type { MediaDiagnostics, Participant } from "@/components/JitsiRoom";

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

const initialDiagnostics: MediaDiagnostics = {
  cameraAvailable: "checking",
  microphoneAvailable: "checking",
  cameraPermission: "checking",
  microphonePermission: "checking",
  jitsiMessages: [],
};

const statusText = (value: string) => value.replace("-", " ");

const statusClassName = (value: string) =>
  value === "available" || value === "granted"
    ? "border-primary/30 bg-primary/10 text-primary"
    : value === "denied" || value === "blocked" || value === "missing" || value === "in-use"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : "border-border bg-muted text-muted-foreground";

function DiagnosticsPanel({ diagnostics }: { diagnostics: MediaDiagnostics }) {
  return (
    <section className="border-b bg-muted/20 px-2 py-2 sm:px-4" aria-label="Media diagnostics">
      <div className="grid gap-2 text-xs sm:grid-cols-[auto_1fr] sm:items-start">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Stethoscope className="h-3.5 w-3.5" /> Diagnostics
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${statusClassName(diagnostics.cameraAvailable)}`}
          >
            <Camera className="h-3 w-3" /> Camera {statusText(diagnostics.cameraAvailable)}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${statusClassName(diagnostics.cameraPermission)}`}
          >
            Camera permission {statusText(diagnostics.cameraPermission)}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${statusClassName(diagnostics.microphoneAvailable)}`}
          >
            <Mic className="h-3 w-3" /> Mic {statusText(diagnostics.microphoneAvailable)}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${statusClassName(diagnostics.microphonePermission)}`}
          >
            Mic permission {statusText(diagnostics.microphonePermission)}
          </span>
          {diagnostics.jitsiMessages.length > 0 && (
            <span className="w-full text-destructive sm:w-auto">
              Jitsi: {diagnostics.jitsiMessages[0]}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

function ClassroomPage() {
  const { roomId } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const [isTutor, setIsTutor] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [diagnostics, setDiagnostics] = useState<MediaDiagnostics>(initialDiagnostics);

  useEffect(() => {
    if (!user) return;
    // Demo rooms are owned by the user — they're the tutor of their own demo.
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
        setIsTutor(!!data && (data as { tutor_id: string }).tutor_id === user.id);
      });
  }, [roomId, user]);

  if (!user) return null;
  const canControlBoard = isTutor || isAdmin;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between gap-2 border-b px-2 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Button asChild size="sm" variant="ghost">
            <Link to="/dashboard">
              <ArrowLeft className="mr-1 h-4 w-4" /> Leave
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Live Classroom</p>
            <p className="truncate text-xs text-muted-foreground sm:max-w-none">Room: {roomId}</p>
          </div>
        </div>
        <Button
          asChild
          size="icon"
          variant="ghost"
          title="Open video in new tab"
          aria-label="Open video in new tab"
        >
          <a
            href={`https://meet.jit.si/AskATutor-${roomId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </header>

      <div className="border-b bg-muted/30 px-2 py-1.5 sm:px-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            In room ({participants.length})
          </span>
          {participants.length === 0 ? (
            <span className="text-xs text-muted-foreground">Waiting for participants…</span>
          ) : (
            <div className="flex items-center gap-1.5">
              {participants.map((p) => (
                <span
                  key={p.id}
                  className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs ${
                    p.status === "joined"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-200"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      p.status === "joined" ? "bg-emerald-400" : "animate-pulse bg-amber-400"
                    }`}
                  />
                  {p.displayName ?? "Guest"}
                  <span className="opacity-70">{p.status === "joined" ? "" : "· connecting"}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <DiagnosticsPanel diagnostics={diagnostics} />

      <main className="min-h-0 flex-1">
        <Tabs defaultValue="whiteboard" className="flex h-full flex-col">
          <TabsList className="m-2 grid w-[calc(100%-1rem)] max-w-md grid-cols-3">
            <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="lab">Lordda Lab</TabsTrigger>
          </TabsList>
          <TabsContent value="whiteboard" className="m-0 min-h-0 flex-1">
            <Whiteboard roomId={roomId} userId={user.id} isHost={canControlBoard} />
          </TabsContent>
          <TabsContent value="files" className="m-0 min-h-0 flex-1">
            <ClassroomFiles roomId={roomId} />
          </TabsContent>
          <TabsContent value="lab" className="m-0 min-h-0 flex-1">
            <LorddaLab enforceLimit={false} viewedSlugs={[]} limit={Infinity} onOpen={() => {}} />
          </TabsContent>
        </Tabs>
      </main>

      <FloatingVideo
        roomId={roomId}
        displayName={user.email ?? "Guest"}
        email={user.email ?? ""}
        onParticipantsChange={setParticipants}
        onDiagnosticsChange={setDiagnostics}
      />
    </div>
  );
}
