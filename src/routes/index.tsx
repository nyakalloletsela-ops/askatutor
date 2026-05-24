import { useEffect, useState } from "react";
import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { notifyBookingEmails } from "@/lib/booking-emails.functions";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import {
  Search, Crown, Star, CalendarPlus, Gift, ArrowRight,
  Users, GraduationCap, Briefcase,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ask A Tutor Live — Online Tutoring Marketplace" },
      { name: "description", content: "Find verified tutors for Primary, High School, IGCSE, A-Level and Undergraduate subjects. Book live one-on-one sessions online." },
      { property: "og:title", content: "Ask A Tutor Live — Online Tutoring Marketplace" },
      { property: "og:description", content: "Book verified tutors for Primary to Undergraduate study. Live one-on-one lessons online." },
    ],
  }),
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
  avg_rating: number | null;
  review_count: number | null;
  session_count: number | null;
};

const DEFAULT_CONTENT: Record<string, string> = {
  "hero.badge": "Online tutoring marketplace",
  "hero.title": "Learn from verified tutors, one lesson at a time.",
  "hero.title_accent": "one lesson at a time.",
  "hero.subtitle": "Book live one-on-one sessions with expert tutors for Primary, High School, IGCSE, A-Level and Undergraduate subjects.",
  "hero.cta_primary": "Find a tutor",
  "hero.cta_secondary": "Create free account",
  "shortcuts.find.title": "Students",
  "shortcuts.find.desc": "Find verified tutors by subject and book live lessons.",
  "shortcuts.tutor.title": "Tutors",
  "shortcuts.tutor.desc": "Apply to teach, list your subjects, and start earning.",
  "shortcuts.dash.title": "Work",
  "shortcuts.dash.desc": "Practice with Virtual Labs, AI Coach, and the Community.",
  "tutors.heading": "Available tutors",
  "tutors.subheading": "Browse verified tutors. Search by name or filter by subject.",
  "tutors.top_label": "Top 5 most-booked tutors",
  "footer.tagline": "© Ask A Tutor Live. All rights reserved.",
};

function Home() {
  const { user, isTutor, loading } = useAuth();
  const [tutors, setTutors] = useState<TutorRow[]>([]);
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState<string | null>(null);
  const [content, setContent] = useState<Record<string, string>>(DEFAULT_CONTENT);
  const t = (k: string) => content[k] ?? DEFAULT_CONTENT[k] ?? "";

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }


  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("list_public_tutors");
      if (error) { console.error(error); setTutors([]); return; }
      setTutors((data as TutorRow[]) ?? []);
    })();
    (async () => {
      const { data } = await supabase.from("site_content").select("key, value");
      if (data) {
        const next = { ...DEFAULT_CONTENT };
        (data as { key: string; value: string }[]).forEach((r) => { next[r.key] = r.value; });
        setContent(next);
      }
    })();
  }, []);

  const filtered = tutors.filter((t) => {
    if (subject && !(t.subjects ?? []).includes(subject)) return false;
    if (q && !(t.full_name ?? "").toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  // Show only the 5 busiest tutors on the homepage (RPC already sorts by featured → sessions → rating)
  const top5 = filtered.slice(0, 5);
  const allSubjects = Array.from(new Set(tutors.flatMap((t) => t.subjects ?? []))).sort();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center md:py-24">
          <Badge variant="secondary" className="mb-5">{t("hero.badge")}</Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            {(() => {
              const title = t("hero.title");
              const accent = t("hero.title_accent");
              if (accent && title.endsWith(accent)) {
                const main = title.slice(0, title.length - accent.length).trimEnd();
                return (<>{main}{" "}<span className="text-aurora">{accent}</span></>);
              }
              return title;
            })()}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-aurora text-white hover:opacity-90">
              <a href="#tutors"><Search className="mr-2 h-4 w-4" /> {t("hero.cta_primary")}</a>
            </Button>
            {!user && (
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">{t("hero.cta_secondary")}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ===== SHORTCUT CATEGORIES (3 audiences) ===== */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 className="mb-6 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Who is this for?
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Students */}
          <a href="#tutors" className="block">
            <ShortcutInner icon={Users} title={t("shortcuts.find.title")} desc={t("shortcuts.find.desc")} />
          </a>

          {/* Student Work — learning tools & community */}
          <Link to="/labs" className="block">
            <ShortcutInner icon={Briefcase} title={t("shortcuts.dash.title")} desc={t("shortcuts.dash.desc")} />
          </Link>

          {/* Third card — context-aware so "Become a tutor" only appears once.
              Guests: For Tutors (apply to teach).
              Tutors: their dashboard.
              Logged-in students: their dashboard (the become-tutor CTA lives there). */}
          {!user ? (
            <Link to="/auth" className="block">
              <ShortcutInner icon={GraduationCap} title={t("shortcuts.tutor.title")} desc={t("shortcuts.tutor.desc")} />
            </Link>
          ) : isTutor ? (
            <Link to="/dashboard" className="block">
              <ShortcutInner icon={GraduationCap} title="Tutor Dashboard"
                desc="Manage your subjects, availability and bookings." />
            </Link>
          ) : (
            <Link to="/dashboard" className="block">
              <ShortcutInner icon={GraduationCap} title="Your Dashboard"
                desc="Your sessions, profile and the option to teach." />
            </Link>
          )}
        </div>
      </section>


      {/* ===== TUTORS ===== */}
      <section id="tutors" className="mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("tutors.heading")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("tutors.subheading")}</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tutors…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
        </div>

        {allSubjects.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {allSubjects.slice(0, 16).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={subject === s ? "default" : "outline"}
                onClick={() => setSubject(subject === s ? null : s)}
                className="rounded-full"
              >
                {s}
              </Button>
            ))}
          </div>
        )}

        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tutors
        </h3>
        {top5.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            No tutors match your search yet.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {top5.map((t) => <TutorCard key={t.id} t={t} premium={t.is_featured} />)}
          </div>
        )}

        {filtered.length > 5 && (
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/tutors">View all {filtered.length} tutors <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        )}
      </section>

      <Footer tagline={t("footer.tagline")} />
    </div>
  );
}

/* ===================== SHORTCUT CARD ===================== */

function ShortcutInner({
  icon: Icon, title, desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Card className="group h-full border-border/60 transition hover:border-foreground/30 hover:shadow-sm">
      <CardContent className="flex h-full flex-col gap-3 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-aurora text-white">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-foreground/80 group-hover:text-foreground">
          Continue <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </CardContent>
    </Card>
  );
}

/* ===================== FOOTER ===================== */

function Footer({ tagline }: { tagline: string }) {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row">
        <div>{tagline.replace(/^©\s*/, `© ${new Date().getFullYear()} `)}</div>
        <div className="flex flex-wrap items-center gap-4">
          <a href="mailto:help@askatutorlive.com" className="hover:text-foreground">help@askatutorlive.com</a>
          <Link to="/community" className="hover:text-foreground">Community</Link>
          <Link to="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
        </div>
      </div>
    </footer>
  );
}

/* ===================== TUTOR CARD ===================== */

function TutorCard({ t }: { t: TutorRow; premium?: boolean }) {
  return (
    <Card className="h-full border-border/60 transition hover:shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
            {t.avatar_url ? (
              <img src={t.avatar_url} alt={t.full_name ?? ""} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                {(t.full_name ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate font-semibold">{t.full_name ?? "Unnamed tutor"}</h4>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              {(t.review_count ?? 0) > 0 ? (
                <>
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                  <span className="font-medium text-foreground">{Number(t.avg_rating ?? 0).toFixed(1)}</span>
                  <span>· {t.review_count} review{t.review_count === 1 ? "" : "s"}</span>
                </>
              ) : (
                <span className="italic">New tutor</span>
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {t.bio ?? "No bio yet."}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {(t.subjects ?? []).slice(0, 4).map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
            {t.hourly_rate != null && (
              <p className="mt-3 text-sm font-medium">
                <span className="text-aurora">M{t.hourly_rate}</span>
                <span className="text-muted-foreground">/hour</span>
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <BookSessionDialog tutor={t} />
              <Button asChild variant="outline" size="sm">
                <Link to="/tutor/$id" params={{ id: t.id }}>View profile</Link>
              </Button>
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
  const [useFree, setUseFree] = useState(false);
  const [freeMinutes, setFreeMinutes] = useState<number>(0);

  useEffect(() => {
    if (!open || !user) return;
    supabase.from("profiles").select("free_minutes_remaining").eq("id", user.id).single()
      .then(({ data }) => setFreeMinutes((data as { free_minutes_remaining?: number } | null)?.free_minutes_remaining ?? 0));
  }, [open, user]);

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
      if (user.id === tutor.id) {
        toast.error("You can't book a session with yourself");
        return;
      }
      const { data: inserted, error } = await supabase.from("sessions").insert({
        tutor_id: tutor.id,
        student_id: user.id,
        subject: subject || null,
        scheduled_at: scheduledAt.toISOString(),
        duration_min: Number(duration),
        is_free: useFree,
      }).select("id").single();
      if (error) {
        console.error("Booking insert failed", { error, userId: user.id, tutorId: tutor.id });
        throw new Error(`${error.message}${error.code ? ` (${error.code})` : ""}`);
      }

      if (inserted?.id) {
        notifyBookingEmails({ data: { sessionId: inserted.id } }).catch(() => {});
      }
      toast.success(useFree ? "Free session booked!" : "Session booked! Check your dashboard.");
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
      <Button size="sm" className="w-full bg-aurora text-white" onClick={handleClick}>
        <CalendarPlus className="mr-1 h-4 w-4" /> Book session
      </Button>
    );
  }

  const canUseFree = freeMinutes >= Number(duration);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full bg-aurora text-white">
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
                <SelectTrigger><SelectValue placeholder="Choose subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
            <Select value={duration} onValueChange={(v) => { setDuration(v); if (Number(v) > freeMinutes) setUseFree(false); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {freeMinutes > 0 && (
            <label className={`flex items-start gap-3 rounded-md border p-3 text-sm ${canUseFree ? "cursor-pointer hover:bg-muted/40" : "opacity-60"}`}>
              <input
                type="checkbox"
                className="mt-1"
                checked={useFree}
                disabled={!canUseFree}
                onChange={(e) => setUseFree(e.target.checked)}
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <Gift className="h-4 w-4 text-gold" /> Use a free welcome lesson
                </div>
                <p className="text-xs text-muted-foreground">
                  You have <strong>{freeMinutes} minutes</strong> of free lessons remaining.
                  {!canUseFree && " Not enough for this duration."}
                </p>
              </div>
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading || !date || !time} className="bg-aurora text-white">
            {loading ? "Booking…" : useFree ? "Confirm free booking" : "Confirm booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
