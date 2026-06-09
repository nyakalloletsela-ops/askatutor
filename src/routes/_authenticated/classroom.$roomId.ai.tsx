import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AiAssistantPanel } from "@/components/classroom/AiAssistantPanel";
import { checkRoomMembership } from "@/lib/access.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/classroom/$roomId/ai")({
  beforeLoad: async ({ params }) => {
    try {
      const { isMember } = await checkRoomMembership({ data: { roomId: params.roomId } });
      if (!isMember) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: Page,
});

function Page() {
  const { roomId } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const [isTutor, setIsTutor] = useState(false);
  const [whiteboardId, setWhiteboardId] = useState<string | null>(null);
  const lastInsertRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (roomId.startsWith("demo-")) {
      setIsTutor(true);
    } else {
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
    }
    supabase.rpc("ensure_whiteboard", { _room_id: roomId }).then(({ data }) => {
      if (data) setWhiteboardId(data as string);
    });
  }, [roomId, user]);

  const insertToBoard = async (text: string) => {
    if (!whiteboardId || !user) {
      toast.error("Whiteboard not ready");
      return;
    }
    // Queue insert via mutation row — the open whiteboard subscribers will render it
    const payload = {
      records: [
        {
          id: `shape:ai-${Date.now()}`,
          typeName: "shape",
          type: "text",
          x: 100,
          y: 100,
          rotation: 0,
          index: "a1",
          parentId: "page:page",
          isLocked: false,
          opacity: 1,
          meta: {},
          props: { richText: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text }] }] }, w: 320, autoSize: false, color: "black", size: "m", font: "draw", textAlign: "start", scale: 1 },
        },
      ],
    };
    const { error } = await supabase.from("whiteboard_mutations").insert({
      whiteboard_id: whiteboardId,
      user_id: user.id,
      mutation_type: "add",
      mutation_payload: payload,
    });
    if (error) toast.error(error.message);
    else {
      lastInsertRef.current = text;
      toast.success("Sent to whiteboard");
    }
  };

  if (!user) return null;
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-2 border-b px-3 py-2">
        <Button asChild size="sm" variant="ghost">
          <Link to="/classroom/$roomId" params={{ roomId }}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to whiteboard
          </Link>
        </Button>
        <p className="text-sm font-semibold">AI Assistant</p>
      </header>
      <main className="min-h-0 flex-1">
        <AiAssistantPanel
          roomId={roomId}
          defaultTutorMode={isTutor || isAdmin}
          onInsertToBoard={insertToBoard}
        />
      </main>
    </div>
  );
}
