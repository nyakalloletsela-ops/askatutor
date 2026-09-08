import { Link } from "@tanstack/react-router";
import { MessageSquare, Video, Bot, ArrowRight } from "lucide-react";

const actions = [
  { icon: MessageSquare, emoji: "\u{1F4D8}", title: "Ask a Question", desc: "Type it. Get an answer in seconds.", to: "/auth" as const },
  { icon: Video, emoji: "\u{1F3A5}", title: "Join Live Tutor", desc: "Hop into a session with a verified tutor.", to: "/tutors" as const },
  { icon: Bot, emoji: "\u{1F916}", title: "AI Tutor Mode", desc: "Instant explanations, 24/7.", to: "/auth" as const },
];

export function InstantActions() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="grid gap-5 md:grid-cols-3">
        {actions.map((a) => (
          <Link
            key={a.title}
            to={a.to}
            className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-7 transition hover:-translate-y-0.5 hover:border-electric hover:shadow-glow-electric"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition group-hover:bg-primary/20" />
            <div className="text-4xl">{a.emoji}</div>
            <h3 className="mt-5 text-xl font-semibold tracking-tight">{a.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{a.desc}</p>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-electric">
              Start now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
