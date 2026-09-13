import { createFileRoute } from "@tanstack/react-router";
import { MinimalFooter } from "@/presentation/domains/1-discovery-matching/home/MinimalFooter";
import { Navbar } from "@/presentation/domains/8-core-ux-navigation/Navbar";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — AskATutorLive" },
      { name: "description", content: "Learn about AskATutorLive and the services it provides." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-12 max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            About AskATutorLive
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Learning support when you need it.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            AskATutorLive is an education and tutoring platform designed to support learners and
            educators through tutoring, learning activities, assessment, scheduling, communication,
            and related services.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">What we provide</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              The platform brings together learning and tutoring experiences so learners can access
              support, work through learning activities, and engage with tutors and other platform
              services.
            </p>
          </section>
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Who we serve</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              AskATutorLive is built for learners, tutors, instructors, and other participants who
              use the platform's education and tutoring services.
            </p>
          </section>
        </div>

        <section className="mt-8 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Who operates AskATutorLive?</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            AskATutorLive is operated by Zero (Pty) Ltd. The public website is askatutorlive.com.
          </p>
        </section>
      </main>
      <MinimalFooter />
    </div>
  );
}
