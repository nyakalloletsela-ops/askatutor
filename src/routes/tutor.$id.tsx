import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Star, BookOpen, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { getTutorProfile, getTutorReviews } from "@/application/use-cases/discovery/book-session";
import { Navbar } from "@/presentation/domains/8-core-ux-navigation/Navbar";
import { Card, CardContent } from "@/presentation/domains/8-core-ux-navigation/ui/card";
import { Badge } from "@/presentation/domains/8-core-ux-navigation/ui/badge";
import { Button } from "@/presentation/domains/8-core-ux-navigation/ui/button";

export const Route = createFileRoute("/tutor/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Tutor profile — Ask A Tutor Live` },
      {
        name: "description",
        content: `View tutor profile, subjects, ratings and reviews on Ask A Tutor Live.`,
      },
      { property: "og:title", content: `Tutor profile — Ask A Tutor Live` },
      { property: "og:description", content: `Tutor #${params.id} on Ask A Tutor Live.` },
    ],
  }),
  component: TutorProfile,
});

function TutorProfile() {
  const { id } = Route.useParams();

  const fetchTutorProfile = useServerFn(getTutorProfile);
  const fetchTutorReviews = useServerFn(getTutorReviews);

  const profileQuery = useQuery({
    queryKey: ["tutor-profile", id],
    queryFn: () => fetchTutorProfile({ data: { tutorId: id } }),
  });

  const reviewsQuery = useQuery({
    queryKey: ["tutor-reviews", id],
    queryFn: () => fetchTutorReviews({ data: { tutorId: id } }),
  });

  if (profileQuery.isPending) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="p-8 text-muted-foreground">Loading tutor…</div>
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn't load this tutor's profile.
          </p>
          <Button asChild className="mt-6">
            <Link to="/tutors">Back to tutors</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!profileQuery.data) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Tutor not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This profile may have been removed.</p>
          <Button asChild className="mt-6">
            <Link to="/tutors">Back to tutors</Link>
          </Button>
        </div>
      </div>
    );
  }

  const tutor = profileQuery.data;
  const reviews = reviewsQuery.data ?? [];
  const reviewCount = tutor.review_count ?? reviews.length;

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6 md:py-10">
        <Link
          to="/tutors"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to tutors
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden glass">
            <div className="h-32 bg-aurora" />
            <CardContent className="-mt-12 space-y-4 p-6">
              <div className="flex items-end gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-muted shadow-glow">
                  {tutor.avatar_url ? (
                    <img
                      src={tutor.avatar_url}
                      alt={tutor.full_name ?? "Tutor"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-aurora text-2xl font-bold text-white">
                      {(tutor.full_name ?? "T").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">
                      {tutor.full_name ?? "Tutor"}
                    </h1>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    {reviewCount > 0 ? (
                      <>
                        <Star className="h-4 w-4 fill-gold text-gold" />
                        <span className="font-medium text-foreground">
                          {Number(tutor.avg_rating ?? 0).toFixed(1)}
                        </span>
                        <span>
                          · {reviewCount} review{reviewCount === 1 ? "" : "s"}
                        </span>
                      </>
                    ) : (
                      <span className="italic">New tutor</span>
                    )}
                  </div>
                </div>
              </div>

              {tutor.hourly_rate != null && (
                <p className="text-lg font-semibold">
                  <span className="text-aurora">M{tutor.hourly_rate}</span>
                  <span className="text-sm font-normal text-muted-foreground">/hour</span>
                </p>
              )}

              <div>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <BookOpen className="h-4 w-4" /> Subjects
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(tutor.subjects ?? []).length === 0 ? (
                    <span className="text-sm text-muted-foreground">No subjects listed yet.</span>
                  ) : (
                    tutor.subjects!.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  About
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {tutor.bio ?? "This tutor hasn't added a bio yet."}
                </p>
              </div>

              <div className="pt-2">
                <Button asChild className="bg-aurora text-white hover:opacity-90">
                  <Link to="/tutors">Book a session</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <section className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <MessageSquare className="h-5 w-5 text-primary" /> Student reviews
          </h2>
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No reviews yet. Be the first to book a session.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <Card key={r.id}>
                  <CardContent className="space-y-1.5 p-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < r.rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`}
                        />
                      ))}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm text-foreground/90">{r.comment}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
