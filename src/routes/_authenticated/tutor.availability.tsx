import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/presentation/domains/3-personalization-role-context/hooks/use-auth";
import { PageContainer } from "@/presentation/domains/8-core-ux-navigation/primitives";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/domains/8-core-ux-navigation/ui/card";
import { Button } from "@/presentation/domains/8-core-ux-navigation/ui/button";
import { Input } from "@/presentation/domains/8-core-ux-navigation/ui/input";
import { Label } from "@/presentation/domains/8-core-ux-navigation/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/domains/8-core-ux-navigation/ui/select";
import { Trash2, Copy, CalendarOff, Loader2 } from "lucide-react";
import {
  getMyAvailability,
  addAvailabilityWindow,
  updateAvailabilitySettings,
  deleteAvailabilityWindow,
  copyAvailabilityDay,
} from "@/application/use-cases/tutor/availability";

export const Route = createFileRoute("/_authenticated/tutor/availability")({
  component: AvailabilityPage,
});

type Slot = {
  id: string;
  weekday: number;
  start_min: number;
  end_min: number;
  timezone: string;
  buffer_minutes: number;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function mins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function hhmm(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

function AvailabilityPage() {
  const { user, isTutor } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [tz, setTz] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [buffer, setBuffer] = useState<number>(0);

  const [weekday, setWeekday] = useState("1");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  const fetchAvailability = useServerFn(getMyAvailability);
  const addWindow = useServerFn(addAvailabilityWindow);
  const updateSettings = useServerFn(updateAvailabilitySettings);
  const deleteWindow = useServerFn(deleteAvailabilityWindow);
  const copyDayFn = useServerFn(copyAvailabilityDay);

  const load = async () => {
    if (!user) return;
    const data = await fetchAvailability();
    const rows = (data as Slot[]) ?? [];
    setSlots(rows);
    if (rows[0]) {
      setTz(rows[0].timezone);
      setBuffer(rows[0].buffer_minutes);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copying, setCopying] = useState<string | null>(null);

  const add = async () => {
    if (!user) return;
    const s = mins(start),
      e = mins(end);
    if (e <= s) return toast.error("End must be after start");
    setAdding(true);
    try {
      await addWindow({
        data: {
          weekday: Number(weekday),
          start_min: s,
          end_min: e,
          timezone: tz,
          buffer_minutes: buffer,
        },
      });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add window");
    } finally {
      setAdding(false);
    }
  };

  const del = async (id: string) => {
    setDeleting(id);
    try {
      await deleteWindow({ data: { windowId: id } });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const updateAll = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateSettings({ data: { timezone: tz, buffer_minutes: buffer } });
      toast.success("Saved");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const copyDay = async (from: number, to: number) => {
    if (!user) return;
    const key = `${from}-${to}`;
    setCopying(key);
    try {
      await copyDayFn({ data: { fromWeekday: from, toWeekday: to } });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to copy");
    } finally {
      setCopying(null);
    }
  };

  if (!isTutor) {
    return (
      <PageContainer title="Availability">
        <p className="text-sm text-muted-foreground">Tutors only.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Weekly availability"
      description="Set the hours students can book. Times saved in the timezone you choose."
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to="/tutor/holidays">
            <CalendarOff className="mr-2 h-4 w-4" /> Holidays
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Add a window</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Day</Label>
                <Select value={weekday} onValueChange={setWeekday}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS.map((d, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Start</Label>
                <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div>
                <Label>End</Label>
                <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
            <Button onClick={add} disabled={adding}>
              {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Add window
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Timezone</Label>
              <Input
                value={tz}
                onChange={(e) => setTz(e.target.value)}
                placeholder="Africa/Harare"
              />
            </div>
            <div>
              <Label>Buffer between lessons (minutes)</Label>
              <Input
                type="number"
                min={0}
                max={120}
                value={buffer}
                onChange={(e) => setBuffer(Number(e.target.value))}
              />
            </div>
            <Button variant="outline" size="sm" onClick={updateAll} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save settings"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
            {WEEKDAYS.map((d, i) => {
              const day = slots.filter((s) => s.weekday === i);
              return (
                <div key={d} className="rounded-md border p-2">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase">{d}</p>
                    <Select
                      onValueChange={(v) => copyDay(i, Number(v))}
                      disabled={copying?.startsWith(`${i}-`)}
                    >
                      <SelectTrigger className="h-6 w-6 border-none p-0">
                        <Copy className="h-3 w-3" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEEKDAYS.map(
                          (t, j) =>
                            j !== i && (
                              <SelectItem key={j} value={String(j)}>
                                Copy → {t}
                              </SelectItem>
                            ),
                        ).filter((item): item is React.ReactElement => item !== false)}
                      </SelectContent>
                    </Select>
                  </div>
                  {day.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">—</p>
                  ) : (
                    <ul className="space-y-1">
                      {day.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between rounded bg-muted px-2 py-1 text-[11px]"
                        >
                          <span>
                            {hhmm(s.start_min)}–{hhmm(s.end_min)}
                          </span>
                          <button
                            onClick={() => del(s.id)}
                            disabled={deleting === s.id}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            {deleting === s.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
