import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarPlus } from "lucide-react";

type Student = { id: string; name: string };

export function ScheduleStudentCard({
  tutorId,
  onCreated,
}: {
  tutorId: string;
  onCreated?: () => void;
}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [when, setWhen] = useState("");
  const [duration, setDuration] = useState(60);
  const [busy, setBusy] = useState(false);

  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("list_students_for_tutor");
      if (!error && data) {
        setStudents(
          (data as { id: string; full_name: string | null }[]).map((s) => ({
            id: s.id,
            name: s.full_name ?? "Student",
          })),
        );
        return;
      }
      // fallback: past students only
      const { data: ss } = await supabase
        .from("sessions")
        .select("student_id")
        .eq("tutor_id", tutorId);
      const ids = Array.from(new Set((ss ?? []).map((s) => s.student_id)));
      if (ids.length === 0) return setStudents([]);
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ids);
      setStudents(
        (profs ?? []).map((p) => ({ id: p.id, name: p.full_name ?? "Student" })),
      );
    })();
  }, [tutorId]);

  const filtered = query
    ? students.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : students;

  const submit = async () => {
    if (!studentId || !when) {
      toast.error("Pick a student and a time");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("sessions").insert({
      tutor_id: tutorId,
      student_id: studentId,
      subject: subject || null,
      scheduled_at: new Date(when).toISOString(),
      duration_min: duration,
      is_free: false,
      status: "scheduled",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Session scheduled");
    setSubject("");
    setWhen("");
    onCreated?.();
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No student accounts found yet. Once students sign up you'll be able to schedule
            classes for them here.
          </p>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Search students</Label>
              <Input
                placeholder="Type a name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Student ({filtered.length})</Label>
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {filtered.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Subject (optional)</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Date & time</Label>
                <Input
                  type="datetime-local"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  min={15}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value) || 60)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={submit} disabled={busy}>
                <CalendarPlus className="mr-1.5 h-4 w-4" />
                {busy ? "Scheduling…" : "Schedule session"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
