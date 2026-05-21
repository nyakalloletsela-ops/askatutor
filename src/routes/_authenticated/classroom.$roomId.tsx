import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { JitsiRoom } from "@/components/JitsiRoom";
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
    <div className="flex h-screen flex-col bg-navy text-navy-foreground">
      <header className="flex items-center justify-between border-b border-navy-foreground/10 px-4 py-2">
        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="ghost" className="text-navy-foreground hover:bg-navy-foreground/10">
            <Link to="/dashboard">
              <ArrowLeft className="mr-1 h-4 w-4" /> Leave
            </Link>
          </Button>
          <div>
            <p className="text-sm font-semibold">Live Classroom</p>
            <p className="text-xs text-navy-foreground/60">Room: {roomId}</p>
          </div>
        </div>
      </header>

      {/* Workstation-first layout: small video tile, large whiteboard/lab area */}
      <div className="grid flex-1 grid-cols-1 grid-rows-[180px_1fr] overflow-hidden md:grid-cols-[280px_1fr] md:grid-rows-1 landscape:grid-cols-[240px_1fr] landscape:grid-rows-1">
        <section className="min-h-0 border-b border-navy-foreground/10 md:border-b-0 md:border-r">
          <JitsiRoom roomId={roomId} displayName={user.email ?? "Guest"} email={user.email ?? ""} />
        </section>
        <section className="min-h-0 bg-background text-foreground">
          <Tabs defaultValue="whiteboard" className="flex h-full flex-col">
            <TabsList className="m-2 grid w-[calc(100%-1rem)] grid-cols-3">
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
              <LorddaLab />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
