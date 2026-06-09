import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { FloatingVideo, type FloatingVideoHandle } from "@/components/FloatingVideo";
import { ClassroomWorkspace } from "@/components/classroom/ClassroomWorkspace";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  MoreVertical,
  Video,
  VideoOff,
  Minus,
  Maximize2,
  MessageSquare,
  Sparkles,
  FileText,
  Folder,
  FlaskConical,
  Box,
} from "lucide-react";
import { checkRoomMembership } from "@/lib/access.functions";
import { toast } from "sonner";
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

function ClassroomPage() {
  const { roomId } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const [isTutor, setIsTutor] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [, setParticipants] = useState<Participant[]>([]);
  const [videoHidden, setVideoHidden] = useState(false);
  const [videoMinimized, setVideoMinimized] = useState(true);
  const videoRef = useRef<FloatingVideoHandle>(null);

  useEffect(() => {
    if (!user) return;
    if (roomId.startsWith("demo-")) {
      setIsTutor(true);
      return;
    }
    supabase
      .from("sessions")
      .select("id, tutor_id, status")
      .eq("room_id", roomId)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        const row = data as { id: string; tutor_id: string; status: string } | null;
        setIsTutor(!!row && row.tutor_id === user.id);
        setSessionId(row?.id ?? null);
        setSessionStatus(row?.status ?? null);
      });
  }, [roomId, user]);

  const markComplete = async () => {
    if (!sessionId) return;
    setCompleting(true);
    const { error } = await supabase.from("sessions").update({ status: "completed" }).eq("id", sessionId);
    setCompleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSessionStatus("completed");
    toast.success("Session marked complete.");
  };

  const toggleVideoHidden = () => {
    if (videoHidden) {
      videoRef.current?.show();
      setVideoHidden(false);
    } else {
      videoRef.current?.hide();
      setVideoHidden(true);
    }
  };

  const toggleVideoMinimized = () => {
    if (videoMinimized) {
      videoRef.current?.expand();
      setVideoMinimized(false);
    } else {
      videoRef.current?.minimize();
      setVideoMinimized(true);
    }
  };

  if (!user) return null;
  const canControlBoard = isTutor || isAdmin;
  const canMarkComplete = (isTutor || isAdmin) && sessionId && sessionStatus !== "completed";

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between gap-2 border-b px-2 py-1.5 sm:px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link to="/dashboard">
              <ArrowLeft className="mr-1 h-4 w-4" /> Leave
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              Live Classroom
              {sessionStatus === "completed" && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Completed
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={toggleVideoMinimized} title={videoMinimized ? "Expand video" : "Minimize video"}>
            {videoMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={toggleVideoHidden} title={videoHidden ? "Show video" : "Hide video"}>
            {videoHidden ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" title="More">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Open in a separate page</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/classroom/$roomId/chat" params={{ roomId }}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/classroom/$roomId/ai" params={{ roomId }}>
                  <Sparkles className="mr-2 h-4 w-4" /> AI Assistant
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/classroom/$roomId/notes" params={{ roomId }}>
                  <FileText className="mr-2 h-4 w-4" /> Notes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/classroom/$roomId/files" params={{ roomId }}>
                  <Folder className="mr-2 h-4 w-4" /> Files
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/classroom/$roomId/lab" params={{ roomId }}>
                  <FlaskConical className="mr-2 h-4 w-4" /> PhET Lab
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/classroom/$roomId/lab3d" params={{ roomId }}>
                  <Box className="mr-2 h-4 w-4" /> 3D Lab
                </Link>
              </DropdownMenuItem>
              {canMarkComplete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={markComplete} disabled={completing}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {completing ? "Saving…" : "Mark complete"}
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={`https://meet.jit.si/AskATutor-${roomId}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Open video in new tab
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        <ClassroomWorkspace roomId={roomId} userId={user.id} canEdit={canControlBoard} />
      </main>

      <FloatingVideo
        ref={videoRef}
        roomId={roomId}
        displayName={user.email ?? "Guest"}
        email={user.email ?? ""}
        onParticipantsChange={setParticipants}
        onDiagnosticsChange={() => {}}
        onApiReady={() => {}}
      />
    </div>
  );
}
