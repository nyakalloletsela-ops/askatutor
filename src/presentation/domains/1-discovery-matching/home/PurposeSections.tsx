import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Brain, CalendarPlus, CheckCircle2, Sparkles, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "../../8-core-ux-navigation/ui/badge";
import { Button } from "../../8-core-ux-navigation/ui/button";

export type FeaturedTutor = {
  id: string;
  full_name: string | null;
  bio: string | null;
  subjects: string[] | null;
  hourly_rate: number | null;
  avatar_url: string | null;
  avg_rating: number | null;
  review_count: number | null;
};

export function FeaturedTutors() {
  const [tutors, setTutors] = useState<FeaturedTutor[]>([]);

  useEffect(() => {
    supabase.rpc("list_public_tutors").then(({ data, error }) => {
      if (!error) setTutors(((data as FeaturedTutor[]) ?? []).slice(0, 3));
    });
  }, []);

  if (!tutors.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Find your tutor</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Learn from someone who fits your goal.</h2>
        </div>
        <Button asChild variant="ghost" className="hidden sm:inline-flex"><Link to="/tutors">See all tutors <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {tutors.map((tutor) => (
          <div key={tutor.id} className="rounded-2xl border border-border/60 bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
                {tutor.avatar_url ? <img src={tutor.avatar_url} alt={tutor.full_name ?? "Tutor"} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">{(tutor.full_name ?? "?").charAt(0).toUpperCase()}</div>}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{tutor.full_name ?? "Tutor"}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{tutor.review_count ? `${Number(tutor.avg_rating ?? 0).toFixed(1)} · ${tutor.review_count} reviews` : "New tutor"}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{tutor.bio ?? "Ready to help you learn."}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{(tutor.subjects ?? []).slice(0, 3).map((subject) => <Badge key={subject} variant="secondary" className="text-xs">{subject}</Badge>)}</div>
            <div className="mt-4 flex items-center justify-between gap-3">
              {tutor.hourly_rate != null ? <span className="text-sm font-semibold"><span className="text-aurora">M{tutor.hourly_rate}</span><span className="text-muted-foreground">/hour</span></span> : <span />}
              <Button asChild size="sm" className="bg-aurora text-white"><Link to="/tutor/$id" params={{ id: tutor.id }}>View tutor</Link></Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 text-center sm:hidden"><Button asChild variant="outline"><Link to="/tutors">See all tutors</Link></Button></div>
    </section>
  );
}

const learningTools = [
  { icon: CheckCircle2, title: "Live tutoring", text: "Personal help when a concept needs a human." },
  { icon: Sparkles, title: "Practice", text: "Turn explanations into active learning." },
  { icon: CalendarPlus, title: "Keep going", text: "Book the next session when you are ready." },
];

export function LearningTools() {
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-border/60 bg-card p-7 md:col-span-2 md:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">More than a video call</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Everything you need to keep learning.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Use live tutoring alongside lessons, practice, resources and feedback so each session has a useful next step.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {learningTools.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-border/60 p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-7 md:p-9">
            <Brain className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">AI when it helps.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Get explanations, guidance and practice support without losing the human tutor at the centre of learning.</p>
            <Button asChild variant="outline" className="mt-6 rounded-xl"><Link to="/ai-tools">Explore AI support <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TutorOpportunity() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <div className="rounded-3xl border border-border/60 bg-card p-7 md:flex md:items-center md:justify-between md:gap-8 md:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">For tutors</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Teach what you know. Reach more learners.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Create your tutor profile, set your availability and connect with learners who need your expertise.</p>
        </div>
        <Button asChild size="lg" variant="outline" className="mt-6 shrink-0 rounded-2xl md:mt-0"><Link to="/become-tutor"><Users className="mr-2 h-5 w-5" /> Become a Tutor</Link></Button>
      </div>
    </section>
  );
}
