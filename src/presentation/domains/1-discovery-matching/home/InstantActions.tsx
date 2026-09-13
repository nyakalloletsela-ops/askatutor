import { Link } from "@tanstack/react-router";
import { ArrowRight, CircleHelp, Dumbbell, UserRound } from "lucide-react";

const actions = [
  { icon: CircleHelp, title: "I have a question", desc: "Get help understanding something you are stuck on.", to: "/auth" as const, label: "Ask for help" },
  { icon: UserRound, title: "I want to learn", desc: "Explore subjects, tutors, lessons and learning resources.", to: "/tutors" as const, label: "Find a tutor" },
  { icon: Dumbbell, title: "I want to improve", desc: "Practise, review your work and build stronger understanding.", to: "/auth" as const, label: "Start practising" },
];

export function InstantActions() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="mx-auto mb-9 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Start where you are</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">What do you need right now?</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">There is no single way to learn. Choose the next step that matches what you need.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <Link key={action.title} to={action.to} className="group rounded-3xl border border-border/60 bg-card p-7 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <action.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-xl font-semibold tracking-tight">{action.title}</h3>
            <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{action.desc}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              {action.label}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
