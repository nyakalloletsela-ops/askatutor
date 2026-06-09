import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { checkRoomMembership } from "@/lib/access.functions";

export const Route = createFileRoute("/_authenticated/classroom/$roomId/notes")({
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
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-2 border-b px-3 py-2">
        <Button asChild size="sm" variant="ghost">
          <Link to="/classroom/$roomId" params={{ roomId }}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to whiteboard
          </Link>
        </Button>
        <p className="text-sm font-semibold">Notes</p>
      </header>
      <main className="flex min-h-0 flex-1 flex-col p-3">
        <p className="mb-2 text-xs text-muted-foreground">
          Private notes for this session — auto-saved on this device.
        </p>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Take notes during the lesson…"
          className="min-h-0 flex-1 resize-none rounded-md border bg-card p-3 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/40"
        />
      </main>
    </div>
  );
}
