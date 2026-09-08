import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/presentation/domains/3-personalization-role-context/hooks/use-auth";
import { getLessonsList, cancelSession, rescheduleSession, completeSession } from "@/application/use-cases/sessions/manage-session";
import { PageContainer } from "@/presentation/domains/8-core-ux-navigation/primitives";
import { Card, CardContent } from "@/presentation/domains/8-core-ux-navigation/ui/card";
import { Button } from "@/presentation/domains/8-core-ux-navigation/ui/button";
import { Badge } from "@/presentation/domains/8-core-ux-navigation/ui/badge";
import { Input } from "@/presentation/domains/8-core-ux-navigation/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/presentation/domains/8-core-ux-navigation/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/presentation/domains/8-core-ux-navigation/ui/dialog";
import { Video, RefreshCw, X, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/lessons")({
  component: LessonsPage,
});

type Lesson = {
  id: string;
  tutor_id: string;
  student_id: string;
  subject: string | null;
  scheduled_at: string;
  duration_min: number;
  room_id: string;
  status: "scheduled" | "completed" | "cancelled";
  cancel_reason: string | null;
};

function LessonsPage() {
  const { user } = useAuth();
  const fetchLessons = useServerFn(getLessonsList);
  const doCancel = useServerFn(cancelSession);
  const doReschedule = useServerFn(rescheduleSession);
  const doComplete = useServerFn(completeSession);

  const [rows, setRows] = useState<Lesson[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [tab, setTab] = useState("upcoming");
  const [resched, setResched] = useState<Lesson | null>(null);
  const [newWhen, setNewWhen] = useState("");
  const [cancel, setCancel] = useState<Lesson | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const load = async () => {
    const result = await fetchLessons();
    setRows(result?.sessions as Lesson[] ?? []);
    setNames(result?.names ?? {});
  };

  useEffect(() => { load(); }, [user]);

  const now = Date.now();
  const upcoming = rows.filter((r) => r.status === "scheduled" && new Date(r.scheduled_at).getTime() >= now - r.duration_min * 60000);
  const past = rows.filter((r) => r.status === "completed" || (r.status === "scheduled" && new Date(r.scheduled_at).getTime() < now - r.duration_min * 60000));
  const cancelled = rows.filter((r) => r.status === "cancelled");

  const handleCancel = async () => {
    if (!cancel) return;
    await doCancel({ data: { sessionId: cancel.id, reason: cancelReason || undefined } });
    toast.success("Lesson cancelled");
    setCancel(null); setCancelReason("");
    load();
  };

  const handleReschedule = async () => {
    if (!resched || !newWhen) return;
    await doReschedule({ data: { sessionId: resched.id, newStart: newWhen } });
    toast.success("Lesson rescheduled");
    setResched(null); setNewWhen("");
    load();
  };

  const handleComplete = async (l: Lesson) => {
    await doComplete({ data: { sessionId: l.id } });
    toast.success("Lesson marked complete");
    load();
  };

  const renderList = (list: Lesson[]) =>
    list.length === 0 ? (
      <p className="text-sm text-muted-foreground">Nothing here.</p>
    ) : (
      <div className="space-y-2">
        {list.map((l) => {
          const counterId = l.tutor_id === user?.id ? l.student_id : l.tutor_id;
          const counterRole = l.tutor_id === user?.id ? "Student" : "Tutor";
          const startsAt = new Date(l.scheduled_at);
          const joinable = l.status === "scheduled" && startsAt.getTime() - now < 10 * 60000 && now - startsAt.getTime() < l.duration_min * 60000;
          const isTutor = l.tutor_id === user?.id;
          const canComplete = isTutor && l.status === "scheduled" && startsAt.getTime() <= now;
          return (
            <Card key={l.id}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{l.subject || "Lesson"}</p>
                    <Badge variant="secondary">{counterRole}: {names[counterId] ?? "—"}</Badge>
                    {l.status === "cancelled" && <Badge variant="destructive">Cancelled</Badge>}
                    {l.status === "completed" && <Badge>Completed</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {startsAt.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {" · "}{l.duration_min} min
                  </p>
                  {l.cancel_reason && <p className="text-xs text-muted-foreground">Reason: {l.cancel_reason}</p>}
                </div>
                {l.status === "scheduled" && (
                  <div className="flex flex-wrap gap-1">
                    <Button asChild size="sm" disabled={!joinable} variant={joinable ? "default" : "outline"}>
                      <Link to="/classroom/$roomId" params={{ roomId: l.room_id }}>
                        <Video className="mr-1 h-3.5 w-3.5" /> {joinable ? "Join" : "Classroom"}
                      </Link>
                    </Button>
                    {canComplete && (
                      <Button size="sm" variant="secondary" onClick={() => handleComplete(l)}>
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Complete
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => {
                      setResched(l);
                      setNewWhen(startsAt.toISOString().slice(0, 16));
                    }}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Reschedule</Button>
                    <Button size="sm" variant="ghost" onClick={() => setCancel(l)}>
                      <X className="mr-1 h-3.5 w-3.5" /> Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );

  return (
    <PageContainer title="My lessons" description="All your scheduled, past, and cancelled sessions.">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">{renderList(upcoming)}</TabsContent>
        <TabsContent value="past" className="mt-4">{renderList(past)}</TabsContent>
        <TabsContent value="cancelled" className="mt-4">{renderList(cancelled)}</TabsContent>
      </Tabs>

      <Dialog open={!!resched} onOpenChange={(o) => !o && setResched(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule lesson</DialogTitle>
            <DialogDescription>Pick a new start time. The tutor's availability and buffers will be checked.</DialogDescription>
          </DialogHeader>
          <Input type="datetime-local" value={newWhen} onChange={(e) => setNewWhen(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setResched(null)}>Back</Button>
            <Button onClick={handleReschedule}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancel} onOpenChange={(o) => !o && setCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel lesson</DialogTitle>
            <DialogDescription>Let the other party know why (optional).</DialogDescription>
          </DialogHeader>
          <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason (optional)" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancel(null)}>Back</Button>
            <Button variant="destructive" onClick={handleCancel}>Cancel lesson</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
