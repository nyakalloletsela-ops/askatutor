import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { FloatingVideo } from "@/components/FloatingVideo";
import { Whiteboard } from "@/components/Whiteboard";
import { LorddaLab } from "@/components/LorddaLab";
import { ClassroomFiles } from "@/components/ClassroomFiles";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { checkRoomMembership } from "@/lib/access.functions";

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
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="ghost">
            <Link to="/dashboard">
              <ArrowLeft className="mr-1 h-4 w-4" /> Leave
            </Link>
          </Button>
          <div>
            <p className="text-sm font-semibold">Live Classroom</p>
            <p className="text-xs text-muted-foreground">Room: {roomId}</p>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        <Tabs defaultValue="whiteboard" className="flex h-full flex-col">
          <TabsList className="m-2 grid w-[calc(100%-1rem)] max-w-md grid-cols-3">
            <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="lab">Lordda Lab</TabsTrigger>
          </TabsList>
          <TabsContent value="whiteboard" className="m-0 min-h-0 flex-1">
            <Whiteboard roomId={roomId} userId={user.id} />
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
      />
    </div>
  );
}
