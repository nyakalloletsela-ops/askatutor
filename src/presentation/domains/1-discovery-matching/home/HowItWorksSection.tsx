export function HowItWorksSection() {
  const steps = [
    { n: 1, title: "Type your question", desc: "Tell us what you're stuck on." },
    { n: 2, title: "Get matched instantly", desc: "Real tutor or AI \u2014 your choice." },
    { n: 3, title: "Learn live", desc: "Video, whiteboard and chat in one room." },
  ];
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <h2 className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          How it works
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-aurora text-base font-bold text-white">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
