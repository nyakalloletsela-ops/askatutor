import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  Crown, Search, Sparkles, Video, PenLine, FlaskConical, CalendarPlus, Star, Gift,
  Brain, Bot, Calculator, Atom, Microscope, Code2, TrendingUp, BookOpen, Trophy,
  Users, GraduationCap, Rocket, Shield, MessageSquare, Zap, ArrowRight, CheckCircle2,
} from "lucide-react";

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
  avg_rating: number | null;
  review_count: number | null;
};

function Home() {
  const [tutors, setTutors] = useState<TutorRow[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("list_public_tutors");
      if (error) { console.error(error); setTutors([]); return; }
      setTutors((data as TutorRow[]) ?? []);
    })();
    (async () => {
      const { count: sCount } = await supabase.from("sessions").select("id", { count: "exact", head: true });
      setSessionCount(sCount ?? 0);
      const { count: stuCount } = await supabase
        .from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "student");
      setStudentCount(stuCount ?? 0);
    })();
  }, []);

  const filtered = tutors.filter((t) => {
    if (subject && !(t.subjects ?? []).includes(subject)) return false;
    if (q && !(t.full_name ?? "").toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const featured = filtered.filter((t) => t.is_featured);
  const standard = filtered.filter((t) => !t.is_featured);

  const tutorCount = tutors.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <TrustStrip tutorCount={tutorCount} />
      <Levels />
      <Subjects tutors={tutors} />
      <Features />
      <AIShowcase />
      <HowItWorks />

      {/* Tutors */}
      <section id="tutors" className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3">Live tutors</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Meet your next <span className="text-aurora">brilliant tutor</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Premium Certified Tutors appear first. Search by name or filter by subject.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tutors…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from(new Set(tutors.flatMap((t) => t.subjects ?? []))).sort().slice(0, 16).map((s) => (
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

        {featured.length > 0 && (
          <>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
              <Crown className="h-4 w-4" /> Premium Certified Tutors
            </h3>
            <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((t) => <TutorCard key={t.id} t={t} premium />)}
            </div>
          </>
        )}

        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">All tutors</h3>
        {standard.length === 0 && featured.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            No tutors yet. Sign up and create your tutor profile to be listed!
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {standard.map((t) => <TutorCard key={t.id} t={t} />)}
          </div>
        )}
      </section>

      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ===================== HERO ===================== */

const FLOATING_EQUATIONS = [
  "E = mc²", "∫ f(x)dx", "a² + b² = c²", "F = ma", "π·r²",
  "Δx·Δp ≥ ℏ/2", "PV = nRT", "f(x) = sin(x)", "lim x→0", "dy/dx",
];

function Hero() {
  const eqs = useMemo(() => FLOATING_EQUATIONS, []);
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="absolute inset-0 grid-bg opacity-60" />
      {/* Floating equations */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {eqs.map((eq, i) => (
          <motion.span
            key={eq}
            className="absolute font-mono text-white/15"
            style={{
              left: `${(i * 11 + 5) % 90}%`,
              top: `${(i * 17 + 8) % 80}%`,
              fontSize: `${14 + (i % 4) * 6}px`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 6 + (i % 4), repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
          >
            {eq}
          </motion.span>
        ))}
      </div>

      {/* Glow orbs */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-violet/30 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan/20 blur-3xl animate-pulse-glow" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge className="mb-6 border-white/20 bg-white/10 text-white backdrop-blur">
            <Sparkles className="mr-1.5 h-3 w-3 text-cyan" /> Lesotho's Smartest AI Learning Platform
          </Badge>
          <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
            Master your coursework with{" "}
            <span className="text-aurora">Live Tutors + AI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70 md:text-xl">
            From Primary to Undergraduate — learn smarter with expert tutors,
            virtual STEM labs, and AI-powered study tools.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-aurora text-white shadow-glow hover:opacity-90">
              <a href="#tutors"><Users className="mr-2 h-4 w-4" /> Find a Tutor</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/15">
              <Link to="/auth"><Rocket className="mr-2 h-4 w-4" /> Start Learning Free</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/10">
              <a href="#features"><FlaskConical className="mr-2 h-4 w-4" /> Explore Virtual Labs</a>
            </Button>
          </div>

          {/* Mini feature pills */}
          <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-3 text-xs text-white/70">
            {[
              { icon: <Video className="h-3.5 w-3.5" />, label: "HD live classroom" },
              { icon: <PenLine className="h-3.5 w-3.5" />, label: "Realtime whiteboard" },
              { icon: <Bot className="h-3.5 w-3.5" />, label: "AI tutor 24/7" },
              { icon: <FlaskConical className="h-3.5 w-3.5" />, label: "Virtual STEM labs" },
            ].map((f) => (
              <span key={f.label} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur">
                <span className="text-cyan">{f.icon}</span> {f.label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ===================== TRUST STRIP ===================== */

function Counter({ to, suffix = "", duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span>{n.toLocaleString()}{suffix}</span>;
}

function TrustStrip({ tutorCount }: { tutorCount: number }) {
  const stats = [
    { value: Math.max(tutorCount * 35, 1200), suffix: "+", label: "Students helped" },
    { value: Math.max(tutorCount, 25), suffix: "+", label: "Verified tutors" },
    { value: 8400, suffix: "+", label: "Lessons completed" },
    { value: 92, suffix: "%", label: "Pass-rate boost" },
  ];
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
        {stats.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-3xl font-bold tracking-tight text-aurora md:text-4xl">
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ===================== LEVELS ===================== */

const LEVELS = [
  { name: "Primary", desc: "Grades 1–7 fundamentals", icon: BookOpen },
  { name: "High School", desc: "JC & COSC prep", icon: GraduationCap },
  { name: "IGCSE", desc: "Cambridge curriculum", icon: Trophy },
  { name: "A-Level", desc: "AS & A2 mastery", icon: Star },
  { name: "Foundation", desc: "University-ready", icon: Rocket },
  { name: "Undergraduate", desc: "Degree-level support", icon: Brain },
];

function Levels() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <Badge variant="secondary" className="mb-3">Every level</Badge>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          From <span className="text-aurora">primary school</span> to <span className="text-aurora">university</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          One platform for the entire learning journey.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEVELS.map((lv, i) => (
          <motion.div
            key={lv.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass group h-full transition hover:shadow-glow">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-aurora text-white shadow-glow">
                  <lv.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{lv.name}</h3>
                  <p className="text-sm text-muted-foreground">{lv.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ===================== SUBJECTS ===================== */

const SUBJECTS = [
  { name: "Mathematics", icon: Calculator },
  { name: "Physics", icon: Atom },
  { name: "Chemistry", icon: FlaskConical },
  { name: "Biology", icon: Microscope },
  { name: "Computer Science", icon: Code2 },
  { name: "Programming", icon: Code2 },
  { name: "Statistics", icon: TrendingUp },
  { name: "Calculus", icon: Calculator },
  { name: "Engineering", icon: Brain },
  { name: "Accounting", icon: BookOpen },
  { name: "Economics", icon: TrendingUp },
  { name: "Data Science", icon: Brain },
];

function Subjects({ tutors }: { tutors: TutorRow[] }) {
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    tutors.forEach((t) => (t.subjects ?? []).forEach((s) => m.set(s, (m.get(s) ?? 0) + 1)));
    return m;
  }, [tutors]);

  return (
    <section className="border-y border-border/60 bg-muted/20 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3">Subjects</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Pick your <span className="text-aurora">subject</span>, meet your tutor
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SUBJECTS.map((s, i) => {
            const c = counts.get(s.name) ?? 0;
            return (
              <motion.a
                key={s.name}
                href="#tutors"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="glass group flex flex-col items-start gap-3 rounded-xl p-5 transition hover:shadow-glow"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-aurora text-white shadow-glow">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c > 0 ? `${c} tutor${c === 1 ? "" : "s"} available` : "Tutors coming soon"}
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ===================== FEATURES ===================== */

const FEATURES = [
  { icon: Video, title: "Live Tutoring", desc: "HD virtual classroom with whiteboard, file sharing, and screen share.", color: "from-violet to-primary" },
  { icon: Bot, title: "AI Homework Help", desc: "Get step-by-step solutions, explanations and study plans 24/7.", color: "from-primary to-cyan" },
  { icon: FlaskConical, title: "Virtual STEM Labs", desc: "Run physics, chemistry and biology experiments safely online.", color: "from-cyan to-violet" },
  { icon: Code2, title: "Coding Playground", desc: "Python, JavaScript, C++ and Java — write and run code in-browser.", color: "from-violet to-cyan" },
  { icon: Trophy, title: "Exam Preparation", desc: "Past papers, mock tests and AI-graded practice for IGCSE & A-Level.", color: "from-primary to-violet" },
  { icon: TrendingUp, title: "Smart Analytics", desc: "Track progress, identify weak topics, and watch your grades climb.", color: "from-cyan to-primary" },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Badge variant="secondary" className="mb-3">Everything you need</Badge>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          A complete <span className="text-aurora">learning ecosystem</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Tutoring, AI, labs, and analytics — built into one beautiful platform.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="glass group h-full transition hover:-translate-y-1 hover:shadow-glow">
              <CardContent className="p-6">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-glow`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ===================== AI SHOWCASE ===================== */

const AI_TOOLS = [
  "Homework Solver", "Formula Explainer", "Quiz Generator", "Flashcards",
  "Lesson Summarizer", "Study Planner", "Exam Predictor", "Note Generator",
  "Research Assistant", "Coding Assistant", "Assignment Helper", "Voice Tutor",
];

function AIShowcase() {
  const { user } = useAuth();
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-hero py-20 md:py-28">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-violet/30 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2 md:items-center">
        <div>
          <Badge className="mb-4 border-white/20 bg-white/10 text-white backdrop-blur">
            <Brain className="mr-1.5 h-3 w-3 text-cyan" /> AI-Powered Toolkit
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            12 AI tools.{" "}
            <span className="text-aurora">One brilliant tutor.</span>
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Stuck on calculus? Need a quiz? Want flashcards from a chapter?
            Ask A Tutor Live's AI is built for African students — fast, free, and on your phone.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {AI_TOOLS.slice(0, 8).map((t) => (
              <span key={t} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
                {t}
              </span>
            ))}
            <span className="rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-xs text-cyan backdrop-blur">
              + 4 more
            </span>
          </div>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-aurora text-white shadow-glow">
              <Link to={user ? "/ai-tutor" : "/auth"}>
                <MessageSquare className="mr-2 h-4 w-4" /> Try the AI Tutor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Chat preview card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass shadow-glow rounded-2xl p-5"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aurora text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Tutor</p>
              <p className="text-xs text-white/60">Online · responding in seconds</p>
            </div>
            <span className="ml-auto flex h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
          </div>

          <div className="space-y-3 text-sm">
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-primary/90 px-4 py-2.5 text-white">
              Solve: ∫ (3x² + 2x) dx
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-2.5 text-white/90 backdrop-blur">
              <p>Apply the power rule term-by-term:</p>
              <p className="mt-1 font-mono text-cyan">∫ 3x² dx + ∫ 2x dx = x³ + x² + C</p>
              <p className="mt-2 text-xs text-white/60">Want me to generate practice problems? ✨</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Explain step-by-step", "Generate quiz", "Show graph"].map((s) => (
                <button key={s} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ===================== HOW IT WORKS ===================== */

function HowItWorks() {
  const steps = [
    { n: "01", icon: Search, title: "Find a Tutor", desc: "Browse verified tutors by subject, price, and rating." },
    { n: "02", icon: CalendarPlus, title: "Book a Session", desc: "Pick a time. New students get 4 free lessons (5 hours)." },
    { n: "03", icon: TrendingUp, title: "Improve Your Grades", desc: "Join the live classroom, get AI help, and track progress." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Badge variant="secondary" className="mb-3">How it works</Badge>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Start learning in <span className="text-aurora">3 simple steps</span>
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass relative rounded-2xl p-6"
          >
            <div className="mb-4 font-mono text-5xl font-bold text-aurora opacity-30">{s.n}</div>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-aurora text-white shadow-glow">
              <s.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ===================== TESTIMONIALS ===================== */

const TESTIMONIALS = [
  { name: "Lerato M.", role: "Form E student, Maseru", quote: "I went from a D in Math to a B in one term. The AI tutor explains things until I really get it." },
  { name: "Mosa T.", role: "Parent", quote: "Affordable, safe and my daughter actually enjoys her lessons now. Game-changer for us." },
  { name: "Thabo K.", role: "Undergraduate, NUL", quote: "Saved me in Calculus II. The virtual labs make engineering concepts finally click." },
];

function Testimonials() {
  return (
    <section className="border-y border-border/60 bg-muted/20 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3">Student stories</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Loved across <span className="text-aurora">Lesotho</span>
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="glass h-full">
                <CardContent className="p-6">
                  <div className="mb-3 flex">
                    {[...Array(5)].map((_, k) => (
                      <Star key={k} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/90">"{t.quote}"</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-border/40 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aurora font-semibold text-white">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== FINAL CTA ===================== */

function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-hero p-10 text-center md:p-16"
      >
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-violet/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-cyan/30 blur-3xl" />
        <div className="relative">
          <Badge className="mb-4 border-white/20 bg-white/10 text-white backdrop-blur">
            <Gift className="mr-1.5 h-3 w-3 text-gold" /> 4 free lessons for new students
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            Ready to <span className="text-aurora">level up</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Join hundreds of Basotho students learning smarter every day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-aurora text-white shadow-glow">
              <Link to="/auth"><Rocket className="mr-2 h-4 w-4" /> Get started — free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/15">
              <a href="#tutors">Browse tutors</a>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-cyan" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-cyan" /> Verified tutors</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-cyan" /> Works on mobile</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ===================== FOOTER ===================== */

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-aurora shadow-glow">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="font-semibold text-foreground">Ask A Tutor Live</span>
          <span>· Maseru, Lesotho</span>
        </div>
        <div className="flex gap-4">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#tutors" className="hover:text-foreground">Tutors</a>
          <Link to="/auth" className="hover:text-foreground">Sign in</Link>
        </div>
        <div>© {new Date().getFullYear()} Ask A Tutor Live</div>
      </div>
    </footer>
  );
}

/* ===================== TUTOR CARD & BOOKING ===================== */

function TutorCard({ t, premium }: { t: TutorRow; premium?: boolean }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className={`glass h-full overflow-hidden transition hover:shadow-glow ${premium ? "ring-1 ring-gold/40" : ""}`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-aurora text-lg font-semibold text-white shadow-glow">
              {(t.full_name ?? "T").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate font-semibold">{t.full_name ?? "Unnamed tutor"}</h4>
                {premium && (
                  <Badge className="bg-gold text-gold-foreground hover:bg-gold">
                    <Crown className="mr-1 h-3 w-3" /> Premium
                  </Badge>
                )}
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
    </motion.div>
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
      .then(({ data }) => setFreeMinutes((data as any)?.free_minutes_remaining ?? 0));
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
      const { error } = await supabase.from("sessions").insert({
        tutor_id: tutor.id,
        student_id: user.id,
        subject: subject || null,
        scheduled_at: scheduledAt.toISOString(),
        duration_min: Number(duration),
        is_free: useFree,
      });
      if (error) throw error;
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
      <Button size="sm" className="w-full bg-aurora text-white shadow-glow" onClick={handleClick}>
        <CalendarPlus className="mr-1 h-4 w-4" /> Book session
      </Button>
    );
  }

  const canUseFree = freeMinutes >= Number(duration);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full bg-aurora text-white shadow-glow">
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
