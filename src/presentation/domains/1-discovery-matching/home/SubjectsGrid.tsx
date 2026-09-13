import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Code2, FlaskConical, GraduationCap, Sigma } from "lucide-react";

const items = [
  { icon: Sigma, label: "Maths" },
  { icon: FlaskConical, label: "Science" },
  { icon: BookOpen, label: "English" },
  { icon: Code2, label: "Coding" },
  { icon: GraduationCap, label: "Exam prep" },
];

export function SubjectsGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="mx-auto mb-9 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Explore learning</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">What do you want to learn?</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Start with a subject, then choose the kind of support that fits your goal.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <Link key={item.label} to="/tutors" className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><item.icon className="h-5 w-5" /></div>
            <span className="text-sm font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
      <div className="mt-7 text-center">
        <Link to="/tutors" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">Explore tutors and subjects <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </section>
  );
}
