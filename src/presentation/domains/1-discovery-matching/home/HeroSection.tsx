import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Sparkles, Users } from "lucide-react";
import { Button } from "../../8-core-ux-navigation/ui/button";

type HeroSectionProps = { tutorCount: number | null };

export function HeroSection({ tutorCount }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.16),transparent_65%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            People, learning tools and AI — working together
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
            Don&apos;t just get the answer.
            <span className="block text-aurora">Learn how to solve it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            Ask a question, find the right tutor, practise what you&apos;re learning, and get intelligent support along the way. AskATutorLive is built around one goal: helping you make real progress.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-2xl bg-aurora px-7 text-base font-semibold text-white shadow-glow-electric hover:opacity-90">
              <Link to="/auth"><BookOpen className="mr-2 h-5 w-5" /> Start Learning</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-2xl px-7 text-base font-semibold">
              <Link to="/tutors"><Users className="mr-2 h-5 w-5" /> Find a Tutor</Link>
            </Button>
          </div>
          {tutorCount != null && tutorCount > 0 && (
            <p className="mt-5 text-xs text-muted-foreground">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              {tutorCount.toLocaleString()} tutors currently discoverable on the platform
            </p>
          )}
        </div>
        <div className="mx-auto mt-14 grid max-w-4xl gap-3 text-left sm:grid-cols-3">
          {[
            ["ASK", "Start with the question or concept you need help with."],
            ["LEARN", "Work with people, lessons, resources and intelligent support."],
            ["GROW", "Practise, reflect and keep moving toward your next goal."],
          ].map(([label, text]) => (
            <div key={label} className="rounded-2xl border border-border/60 bg-card/80 p-5 backdrop-blur">
              <div className="text-xs font-bold tracking-[0.18em] text-primary">{label}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
