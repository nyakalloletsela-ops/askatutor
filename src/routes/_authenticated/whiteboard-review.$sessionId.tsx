import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaybackPlayer } from "@/components/whiteboard/timeline/PlaybackPlayer";

export const Route = createFileRoute("/_authenticated/whiteboard-review/$sessionId")({
  component: ReviewPage,
});

function ReviewPage() {
  const { sessionId } = Route.useParams();
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-3 py-2">
        <Button asChild size="sm" variant="ghost">
          <Link to="/dashboard">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Link>
        </Button>
        <p className="text-sm font-semibold">Recording review</p>
        <span className="w-16" />
      </header>
      <main className="min-h-0 flex-1">
        <PlaybackPlayer sessionId={sessionId} />
      </main>
    </div>
  );
}
