import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "../../8-core-ux-navigation/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../8-core-ux-navigation/ui/dialog";
import { Video, Bot, ArrowRight, GraduationCap as GradCap, Users } from "lucide-react";

type HeroSectionProps = {
  tutorCount: number | null;
};

export function HeroSection({ tutorCount }: HeroSectionProps) {
  const navigate = useNavigate();
  const [learnOpen, setLearnOpen] = useState(false);

  return (
    <section className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-background">
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:py-28">
        <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
          Get unstuck in seconds — <span className="text-aurora">with real tutors or AI.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
          One tap to learn, one tap to teach. No waiting, no friction.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button
            size="lg"
            onClick={() => setLearnOpen(true)}
            className="h-14 rounded-2xl bg-aurora px-8 text-base font-semibold text-white shadow-glow-electric hover:opacity-90"
          >
            <GradCap className="mr-2 h-5 w-5" /> Start Learning
          </Button>
          <Button asChild size="lg" variant="outline" className="h-14 rounded-2xl px-8 text-base font-semibold">
            <Link to="/auth" search={{ role: "tutor" } as never}>
              <Users className="mr-2 h-5 w-5" /> Start Teaching
            </Link>
          </Button>
        </div>
        {tutorCount != null && tutorCount > 0 && (
          <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="neon-dot" />
            <span className="font-semibold text-foreground tabular-nums">{tutorCount}</span> verified tutors ready now
          </p>
        )}
      </div>

      <Dialog open={learnOpen} onOpenChange={setLearnOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How do you want to learn?</DialogTitle>
            <DialogDescription>Pick a path. You can switch any time.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 pt-2">
            <button
              onClick={() => { setLearnOpen(false); void navigate({ to: "/tutors" }); }}
              className="group flex items-start gap-3 rounded-2xl border bg-card p-4 text-left transition hover:border-primary hover:shadow-sm"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Video className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  Human tutor <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Browse verified tutors and start a live session.
                </p>
              </div>
            </button>
            <button
              onClick={() => { setLearnOpen(false); void navigate({ to: "/auth" }); }}
              className="group flex items-start gap-3 rounded-2xl border bg-card p-4 text-left transition hover:border-primary hover:shadow-sm"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  AI tutor <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Socratic coach. Guides you with hints — never just hands you the answer.
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
