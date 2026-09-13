import { Link } from "@tanstack/react-router";
import { ArrowRight, Brain, HeartHandshake, Sparkles, Users } from "lucide-react";
import { Button } from "../../8-core-ux-navigation/ui/button";

export function LearningBeyondSession() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card p-7 md:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Beyond the session</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Learning doesn&apos;t stop when the session ends.</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">A good learning experience continues after the call. Review what you learned, practise it, reflect on mistakes and decide what to work on next.</p>
          <div className="mt-7 flex flex-wrap gap-2 text-xs font-medium">
            {["Learn", "Practise", "Reflect", "Evidence", "Progress"].map((item) => <span key={item} className="rounded-full border border-border/60 bg-muted/30 px-3 py-1.5">{item}</span>)}
          </div>
        </div>
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-7 md:p-9">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Brain className="h-5 w-5" /></div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">Technology that helps you learn better.</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">AI can explain concepts, offer guidance, help you practise and support tutors. The goal is better learning — not simply faster answers.</p>
          <div className="mt-6 flex items-center gap-3 text-xs font-medium text-muted-foreground">
            <span className="rounded-xl border bg-background px-3 py-2">You</span><ArrowRight className="h-4 w-4" /><span className="rounded-xl border bg-background px-3 py-2">Tutor / AI assistance</span><ArrowRight className="h-4 w-4" /><span className="rounded-xl border bg-background px-3 py-2">Learning</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TutorOpportunity() {
  return (
    <section className="border-y border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">For tutors</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Share what you know. Help someone learn.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">Build your tutor profile, share your expertise, connect with learners and turn your knowledge into someone else&apos;s progress.</p>
          </div>
          <Button asChild size="lg" variant="outline" className="rounded-2xl px-6">
            <Link to="/become-tutor"><Users className="mr-2 h-5 w-5" /> Become a Tutor</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function FinalLearningCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground md:p-12">
        <div className="max-w-2xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/10"><HeartHandshake className="h-5 w-5" /></div>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-5xl">Ready to keep learning?</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-primary-foreground/80 md:text-base">Start with the question, subject or goal in front of you. AskATutorLive helps you find the next useful step.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="rounded-2xl"><Link to="/auth"><Sparkles className="mr-2 h-4 w-4" /> Start Learning</Link></Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><Link to="/tutors">Find a Tutor <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
