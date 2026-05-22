import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Crown, Search, Sparkles, Video, PenLine, FlaskConical, CalendarPlus } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

type TutorRow = {
  id: string;
  full_name: string | null;
  bio: string | null;
  subjects: string[] | null;
  hourly_rate: number | null;
  avatar_url: string | null;
  is_featured: boolean;
};

function Home() {
  const [tutors, setTutors] = useState<TutorRow[]>([]);
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("list_public_tutors");
      if (error) {
        console.error(error);
        setTutors([]);
        return;
      }
      setTutors((data as TutorRow[]) ?? []);
    })();
  }, []);

  const filtered = tutors.filter((t) => {
    if (subject && !(t.subjects ?? []).includes(subject)) return false;
    if (q && !(t.full_name ?? "").toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const featured = filtered.filter((t) => t.is_featured);
  const standard = filtered.filter((t) => !t.is_featured);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-gold text-gold-foreground hover:bg-gold">
              <Sparkles className="mr-1 h-3 w-3" /> Built for Lesotho
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Master any subject — one live session at a time.
            </h1>
            <p className="mt-4 text-lg text-navy-foreground/80 md:text-xl">
              Book certified tutors and join a split-screen virtual classroom with whiteboard and
              our Lordda Lab.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
                <Link to="/auth">Get started — it's free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-navy-foreground/30 bg-transparent text-navy-foreground hover:bg-navy-foreground/10"
                onClick={() => {
                  document.getElementById("tutors")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Browse tutors
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
              <Feature icon={<Video className="h-5 w-5" />} label="HD live video" />
              <Feature icon={<PenLine className="h-5 w-5" />} label="Realtime whiteboard" />
              <Feature icon={<FlaskConical className="h-5 w-5" />} label="Lordda Virtual Lab" />
            </div>
          </div>
        </div>
      </section>


      {/* Search */}
      <section id="tutors" className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-navy">Find your tutor</h2>
            <p className="text-sm text-muted-foreground">
              Premium Certified Tutors appear first.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from(new Set(tutors.flatMap((t) => t.subjects ?? []))).sort().map((s) => (
            <Button
              key={s}
              size="sm"
              variant={subject === s ? "default" : "outline"}
              onClick={() => setSubject(subject === s ? null : s)}
            >
              {s}
            </Button>
          ))}
        </div>

        {featured.length > 0 && (
          <>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-navy">
              <Crown className="h-4 w-4 text-gold" /> Premium Certified Tutors
            </h3>
            <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((t) => (
                <TutorCard key={t.id} t={t} premium />
              ))}
            </div>
          </>
        )}

        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          All tutors
        </h3>
        {standard.length === 0 && featured.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            No tutors yet. Sign up and create your tutor profile to be listed!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {standard.map((t) => (
              <TutorCard key={t.id} t={t} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t bg-muted/30 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Ask A Tutor · Maseru, Lesotho
      </footer>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-navy-foreground/15 bg-navy-foreground/5 px-3 py-2">
      <span className="text-gold">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );
}


function TutorCard({ t, premium }: { t: TutorRow; premium?: boolean }) {
  return (
    <Card className={`shadow-card transition hover:shadow-elegant ${premium ? "border-gold/40 ring-1 ring-gold/30" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-lg font-semibold text-navy-foreground">
            {(t.full_name ?? "T").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate font-semibold text-navy">
                {t.full_name ?? "Unnamed tutor"}
              </h4>
              {premium && (
                <Badge className="bg-gold text-gold-foreground hover:bg-gold">
                  <Crown className="mr-1 h-3 w-3" /> Premium
                </Badge>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {t.bio ?? "No bio yet."}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {(t.subjects ?? []).map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
            </div>
            {t.hourly_rate != null && (
              <p className="mt-3 text-sm font-medium text-navy">
                M{t.hourly_rate}/hour
              </p>
            )}
            <div className="mt-4">
              <BookSessionDialog tutor={t} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookSessionDialog({ tutor }: { tutor: TutorRow }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const subjects = tutor.subjects ?? [];
  const [subject, setSubject] = useState<string>(subjects[0] ?? "");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("60");

  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast.info("Please sign in to book a session");
      navigate({ to: "/auth" });
    }
  };

  const submit = async () => {
    if (!user || !date || !time) return;
    setLoading(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`);
      if (isNaN(scheduledAt.getTime()) || scheduledAt < new Date()) {
        toast.error("Pick a future date and time");
        return;
      }
      const { error } = await supabase.from("sessions").insert({
        tutor_id: tutor.id,
        student_id: user.id,
        subject: subject || null,
        scheduled_at: scheduledAt.toISOString(),
        duration_min: Number(duration),
      });
      if (error) throw error;
      toast.success("Session booked! Check your dashboard.");
      setOpen(false);
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Button size="sm" className="w-full" onClick={handleClick}>
        <CalendarPlus className="mr-1 h-4 w-4" /> Book session
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          <CalendarPlus className="mr-1 h-4 w-4" /> Book session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book {tutor.full_name ?? "tutor"}</DialogTitle>
          <DialogDescription>Pick a subject, date and time for your session.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {subjects.length > 0 && (
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading || !date || !time}>
            {loading ? "Booking…" : "Confirm booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
