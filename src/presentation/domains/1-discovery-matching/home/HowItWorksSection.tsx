import { Check, Search, BookOpen, LineChart } from "lucide-react";

const steps = [
  { icon: Search, n: "01", title: "Tell us what you are learning", desc: "Start with a question, subject, goal or concept that needs attention." },
  { icon: BookOpen, n: "02", title: "Get the right support", desc: "Choose a tutor, learning resource, practice activity or intelligent assistance." },
  { icon: Check, n: "03", title: "Learn and practise", desc: "Work through explanations, examples, live sessions and hands-on practice." },
  { icon: LineChart, n: "04", title: "Build evidence of progress", desc: "Use feedback and completed work to understand what is improving and what needs more attention." },
];

export function HowItWorksSection() {
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">The learning journey</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">From “I&apos;m stuck” to “I can do this.”</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">AskATutorLive connects the pieces of learning instead of treating every question as a one-off session.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.n} className="relative rounded-2xl border border-border/60 bg-card p-6">
              {index < steps.length - 1 && <div className="absolute right-0 top-10 hidden w-4 translate-x-full border-t border-dashed border-border md:block" />}
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><step.icon className="h-5 w-5" /></div>
                <span className="text-xs font-bold tracking-widest text-muted-foreground">{step.n}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
          <p className="text-sm font-medium">Learn → Practise → Reflect → Evidence → Progress</p>
          <p className="mt-1 text-xs text-muted-foreground">The goal is not simply finishing a session. It is becoming more capable.</p>
        </div>
      </div>
    </section>
  );
}
