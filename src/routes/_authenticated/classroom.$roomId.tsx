import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { JitsiRoom } from "@/components/JitsiRoom";
import { Whiteboard } from "@/components/Whiteboard";
import { LorddaLab } from "@/components/LorddaLab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/classroom/$roomId")({
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

      {/* Split screen: video | workstation. Landscape on mobile -> side by side */}
      <div className="grid flex-1 grid-cols-1 grid-rows-2 overflow-hidden md:grid-cols-2 md:grid-rows-1 landscape:grid-cols-2 landscape:grid-rows-1">
        <section className="min-h-0 border-r border-navy-foreground/10">
          <JitsiRoom roomId={roomId} displayName={user.email ?? "Guest"} email={user.email ?? ""} />
        </section>
        <section className="min-h-0 bg-background text-foreground">
          <Tabs defaultValue="whiteboard" className="flex h-full flex-col">
            <TabsList className="m-2 grid w-[calc(100%-1rem)] grid-cols-2">
              <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
              <TabsTrigger value="lab">Lordda Lab</TabsTrigger>
            </TabsList>
            <TabsContent value="whiteboard" className="m-0 min-h-0 flex-1">
              <Whiteboard roomId={roomId} userId={user.id} />
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
