import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { browseTutors } from "@/application/use-cases/discovery/browse-tutors";
import { Navbar } from "@/presentation/domains/8-core-ux-navigation/Navbar";
import { Button } from "@/presentation/domains/8-core-ux-navigation/ui/button";
import { Card, CardContent } from "@/presentation/domains/8-core-ux-navigation/ui/card";
import { Badge } from "@/presentation/domains/8-core-ux-navigation/ui/badge";
import { Input } from "@/presentation/domains/8-core-ux-navigation/ui/input";
import { Search, CalendarPlus, Star } from "lucide-react";

export const Route = createFileRoute("/tutors")({
  head: () => ({
    meta: [
      { title: "All Tutors — Ask A Tutor Live" },
      {
        name: "description",
        content:
          "Browse all verified tutors on Ask A Tutor Live. Filter by subject and book a live one-on-one session.",
      },
    ],
  }),
  component: AllTutorsPage,
});

type TutorRow = {
  id: string;
  full_name: string | null;
  bio: string | null;
  subjects: string[] | null;
  hourly_rate: number | null;
  avatar_url: string | null;
  is_featured: boolean;
  avg_rating: number | null;
  review_count: number | null;
  session_count: number | null;
};

function AllTutorsPage() {
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState<string | null>(null);

  const fetchTutors = useServerFn(browseTutors);
  const { data: tutors = [] } = useQuery({
    queryKey: ["browse-tutors", subject, q],
    queryFn: () => fetchTutors({ data: { subject: subject ?? undefined, search: q || undefined } }),
  });

  const allSubjects = Array.from(new Set(tutors.flatMap((t) => t.subjects ?? []))).sort();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">All tutors</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {tutors.length} verified tutor{tutors.length === 1 ? "" : "s"} available.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tutors…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {allSubjects.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {allSubjects.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={subject === s ? "default" : "outline"}
                onClick={() => setSubject(subject === s ? null : s)}
                className="rounded-full"
              >
                {s}
              </Button>
            ))}
          </div>
        )}

        {tutors.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            No tutors match your search.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tutors.map((t) => (
              <TutorCard key={t.id} t={t} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function TutorCard({ t }: { t: TutorRow }) {
  return (
    <Card className="h-full border-border/60 transition hover:shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
            {t.avatar_url ? (
              <img
                src={t.avatar_url}
                alt={t.full_name ?? ""}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                {(t.full_name ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate font-semibold">{t.full_name ?? "Unnamed tutor"}</h4>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              {(t.review_count ?? 0) > 0 ? (
                <>
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                  <span className="font-medium text-foreground">
                    {Number(t.avg_rating ?? 0).toFixed(1)}
                  </span>
                  <span>
                    · {t.review_count} review{t.review_count === 1 ? "" : "s"}
                  </span>
                </>
              ) : (
                <span className="italic">New tutor</span>
              )}
              {(t.session_count ?? 0) > 0 && (
                <span className="ml-2">
                  · {t.session_count} session{t.session_count === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {t.bio ?? "No bio yet."}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {(t.subjects ?? []).slice(0, 4).map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
            {t.hourly_rate != null && (
              <p className="mt-3 text-sm font-medium">
                <span className="text-aurora">M{t.hourly_rate}</span>
                <span className="text-muted-foreground">/hour</span>
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" className="bg-aurora text-white">
                <Link to="/book/$tutorId" params={{ tutorId: t.id }}>
                  <CalendarPlus className="mr-1 h-4 w-4" /> Book lesson
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/tutor/$id" params={{ id: t.id }}>
                  View profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
