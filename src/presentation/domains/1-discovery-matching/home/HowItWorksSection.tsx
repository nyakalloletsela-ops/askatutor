import { BookOpen, Search, Video } from "lucide-react";

const steps = [
  { icon: Search, n: "01", title: "Tell us what you need", desc: "Start with a subject, question, goal or skill you want to improve." },
  { icon: Video, n: "02", title: "Choose your support", desc: "Find a tutor, book a session or use the learning tools that fit the moment." },
  { icon: BookOpen, n: "03", title: "Learn and keep going", desc: "Learn, practise and return when you need the next step." },
];

export function HowItWorksSection() {
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-18">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How it works</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Simple to start. Built for progress.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><step.icon className="h-5 w-5" /></div>
                <span className="text-xs font-bold tracking-widest text-muted-foreground">{step.n}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
