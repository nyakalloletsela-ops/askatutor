import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function SubjectsGrid() {
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    supabase.rpc("list_public_tutors").then(({ data, error }) => {
      if (!error) {
        const values = ((data as { subjects: string[] | null }[]) ?? []).flatMap(
          (tutor) => tutor.subjects ?? [],
        );
        setSubjects(Array.from(new Set(values)).sort().slice(0, 10));
      }
    });
  }, []);

  if (!subjects.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:py-18">
      <div className="mx-auto mb-7 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Explore subjects
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          What do you want to learn?
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {subjects.map((subject) => (
          <Link
            key={subject}
            to="/tutors"
            className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="truncate text-sm font-semibold">{subject}</span>
          </Link>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          to="/tutors"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          Browse all tutors <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
