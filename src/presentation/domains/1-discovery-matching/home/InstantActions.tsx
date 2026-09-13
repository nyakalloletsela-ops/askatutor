import { Link } from "@tanstack/react-router";
import { ArrowRight, CircleHelp, Dumbbell, UserRound } from "lucide-react";

const actions = [
  { icon: CircleHelp, title: "I have a question", desc: "Get help with something you are stuck on.", to: "/auth" as const, label: "Get help" },
  { icon: UserRound, title: "I want to learn", desc: "Find a tutor for your subject, level and goal.", to: "/tutors" as const, label: "Find a tutor" },
  { icon: Dumbbell, title: "I want to practise", desc: "Build understanding with practice and learning tools.", to: "/auth" as const, label: "Start learning" },
];

export function InstantActions() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-7 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Start here</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">What are you looking for?</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {actions.map((action) => (
          <Link key={action.title} to={action.to} className="group rounded-2xl border border-border/60 bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><action.icon className="h-5 w-5" /></div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">{action.title}</h3>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{action.desc}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-primary">{action.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
