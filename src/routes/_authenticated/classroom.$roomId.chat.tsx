import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ChatPanel } from "@/components/classroom/ChatPanel";
import { checkRoomMembership } from "@/lib/access.functions";

export const Route = createFileRoute("/_authenticated/classroom/$roomId/chat")({
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
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-2 border-b px-3 py-2">
        <Button asChild size="sm" variant="ghost">
          <Link to="/classroom/$roomId" params={{ roomId }}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to whiteboard
          </Link>
        </Button>
        <p className="text-sm font-semibold">Classroom Chat</p>
      </header>
      <main className="min-h-0 flex-1">
        <ChatPanel roomId={roomId} userId={user.id} displayName={user.email ?? "Guest"} />
      </main>
    </div>
  );
}
