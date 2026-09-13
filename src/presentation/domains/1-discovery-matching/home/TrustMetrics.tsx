import { Brain, ShieldCheck, Users } from "lucide-react";

export function TrustMetrics({ tutorCount }: { tutorCount: number | null }) {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="grid gap-6 rounded-3xl border border-border/60 bg-card p-7 md:grid-cols-[1.2fr_1fr] md:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">People first</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">People are at the centre of AskATutorLive.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">Technology can explain, guide and help you practise. Human tutors bring expertise, context and the kind of support that helps difficult ideas click.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4"><Users className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold">Human expertise</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Find support around your learning needs.</p></div>
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4"><Brain className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold">Responsible assistance</p><p className="mt-1 text-xs leading-5 text-muted-foreground">AI is positioned as support for learning, not a replacement for it.</p></div>
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4"><ShieldCheck className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold">Trust matters</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Accounts, privacy and responsible use are part of the product.</p></div>
          </div>
        </div>
        {tutorCount != null && tutorCount > 0 && (
          <p className="mt-5 text-center text-xs text-muted-foreground">{tutorCount.toLocaleString()} tutors are currently discoverable through the platform.</p>
        )}
      </section>
    </>
  );
}
