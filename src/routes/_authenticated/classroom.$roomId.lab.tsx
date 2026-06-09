import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LorddaLab } from "@/components/LorddaLab";
import { checkRoomMembership } from "@/lib/access.functions";

export const Route = createFileRoute("/_authenticated/classroom/$roomId/lab")({
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
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-2 border-b px-3 py-2">
        <Button asChild size="sm" variant="ghost">
          <Link to="/classroom/$roomId" params={{ roomId }}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to whiteboard
          </Link>
        </Button>
        <p className="text-sm font-semibold">PhET Lab</p>
      </header>
      <main className="min-h-0 flex-1">
        <LorddaLab enforceLimit={false} viewedSlugs={[]} limit={Infinity} onOpen={() => {}} roomId={roomId} />
      </main>
    </div>
  );
}
