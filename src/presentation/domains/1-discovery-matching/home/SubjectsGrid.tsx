import { Link } from "@tanstack/react-router";
import { Button } from "../../8-core-ux-navigation/ui/button";
import { Sigma, FlaskConical, BookOpen, Code2, Briefcase, GraduationCap, Sparkles } from "lucide-react";

const items = [
  { icon: Sigma, label: "Maths" },
  { icon: FlaskConical, label: "Science" },
  { icon: BookOpen, label: "English" },
  { icon: Code2, label: "Coding" },
  { icon: Briefcase, label: "Business" },
  { icon: GraduationCap, label: "Exam prep" },
];

export function SubjectsGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Jump into a subject</h2>
        <p className="mt-2 text-sm text-muted-foreground">One tap \u2014 straight into a session.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((s) => (
          <Link
            key={s.label}
            to="/tutors"
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-5 text-center transition hover:-translate-y-0.5 hover:border-electric hover:shadow-glow-electric"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-aurora text-white">
              <s.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold">{s.label}</span>
          </Link>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button asChild size="lg" className="rounded-2xl bg-aurora text-white shadow-glow-electric hover:opacity-90">
          <Link to="/tutors">
            <Sparkles className="mr-2 h-4 w-4" /> Start Session
          </Link>
        </Button>
      </div>
    </section>
  );
}
