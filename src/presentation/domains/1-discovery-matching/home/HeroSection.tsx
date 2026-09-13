import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Sparkles, Users } from "lucide-react";
import { Button } from "../../8-core-ux-navigation/ui/button";

type HeroSectionProps = { tutorCount: number | null };

export function HeroSection({ tutorCount }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.16),transparent_65%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Human tutoring, learning tools and AI support
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
            Learn with the right support.
            <span className="block text-aurora">When you need it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            Find a tutor, get help with a difficult concept, practise what you are learning, and keep moving forward.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-2xl bg-aurora px-7 text-base font-semibold text-white shadow-glow-electric hover:opacity-90">
              <Link to="/auth"><BookOpen className="mr-2 h-5 w-5" /> Start Learning</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-2xl px-7 text-base font-semibold">
              <Link to="/tutors"><Users className="mr-2 h-5 w-5" /> Find a Tutor</Link>
            </Button>
          </div>
          {tutorCount != null && tutorCount > 0 && (
            <p className="mt-5 text-xs text-muted-foreground">
              {tutorCount.toLocaleString()} tutors currently discoverable
            </p>
          )}
        </div>
        <div className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-2 text-xs font-medium text-muted-foreground">
          {["1-to-1 tutoring", "Online learning", "Practice & resources", "AI assistance"].map((item) => (
            <span key={item} className="rounded-full border border-border/60 bg-card/80 px-3 py-1.5">{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
