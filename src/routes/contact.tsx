import { createFileRoute } from "@tanstack/react-router";
import { MinimalFooter } from "@/presentation/domains/1-discovery-matching/home/MinimalFooter";
import { Navbar } from "@/presentation/domains/8-core-ux-navigation/Navbar";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — AskATutorLive" },
      {
        name: "description",
        content:
          "Contact AskATutorLive for support, privacy matters, information, or administration.",
      },
    ],
  }),
  component: ContactPage,
});

const contacts = [
  {
    title: "General Support",
    email: "support@askatutorlive.com",
    description: "For user and technical support.",
  },
  {
    title: "Privacy",
    email: "privacy@askatutorlive.com",
    description: "For privacy matters and privacy-related requests.",
  },
  {
    title: "General Information / Other Business Matters",
    email: "info@askatutorlive.com",
    description: "For general information and other business matters.",
  },
  {
    title: "Administration",
    email: "admin@askatutorlive.com",
    description: "For administrative matters.",
  },
];

function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-12 max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Contact Us
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">How can we help?</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Choose the contact point that best matches your request.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          {contacts.map((contact) => (
            <section key={contact.email} className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">{contact.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{contact.description}</p>
              <a
                className="mt-4 inline-block font-medium text-primary underline-offset-4 hover:underline"
                href={`mailto:${contact.email}`}
              >
                {contact.email}
              </a>
            </section>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          AskATutorLive is operated by Zero (Pty) Ltd.
        </p>
      </main>
      <MinimalFooter />
    </div>
  );
}
