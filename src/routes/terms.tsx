import { Link, createFileRoute } from "@tanstack/react-router";
import { MinimalFooter } from "@/presentation/domains/1-discovery-matching/home/MinimalFooter";
import { Navbar } from "@/presentation/domains/8-core-ux-navigation/Navbar";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AskATutorLive" },
      {
        name: "description",
        content: "Terms of Service for AskATutorLive.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <article className="prose prose-slate max-w-none dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="lead">
            These terms govern your use of AskATutorLive, an online learning and tutoring platform.
          </p>
          <p>
            <strong>Last updated:</strong> September 13, 2026
          </p>

          <h2>1. Using AskATutorLive</h2>
          <p>
            By using AskATutorLive, you agree to use the platform lawfully, responsibly and in a way
            that does not interfere with other users or the operation and security of the service.
          </p>

          <h2>2. Accounts</h2>
          <p>
            You are responsible for information supplied for your account and for keeping access
            credentials and sessions under your control. Do not impersonate another person or create
            an account using information you are not authorized to use.
          </p>

          <h2>3. Learners and tutors</h2>
          <p>
            Learners are responsible for using tutoring and learning features appropriately. Tutors
            are responsible for providing services professionally, accurately representing their
            qualifications and following applicable platform rules. AskATutorLive may apply role and
            access controls to protect learners, tutors and institutions.
          </p>

          <h2>4. Educational information</h2>
          <p>
            AskATutorLive provides educational and tutoring tools. Platform content, tutor guidance
            and AI-generated information are not a substitute for professional advice where
            professional advice is required. Users should exercise appropriate judgment and verify
            important information.
          </p>

          <h2>5. Acceptable use</h2>
          <p>
            You must not use the platform for unlawful activity, harassment, fraud, unauthorized
            access, abuse, harmful content, interference with service availability, or attempts to
            bypass authentication, authorization, payment, safety or usage controls.
          </p>

          <h2>6. Community and user content</h2>
          <p>
            Where AskATutorLive provides community, messaging or content-sharing features, you
            remain responsible for content you submit and must respect the rights, privacy and
            safety of other users. Content may be moderated or removed when necessary to enforce
            platform rules and protect the community.
          </p>

          <h2>7. Payments and subscriptions</h2>
          <p>
            Where paid features, subscriptions or other transactions are offered, additional
            pricing, payment and refund terms presented during the transaction may apply. Do not
            attempt to manipulate payment status, entitlements, invoices, subscriptions or platform
            balances.
          </p>

          <h2>8. Intellectual property</h2>
          <p>
            AskATutorLive and its associated software, branding and platform materials remain
            protected by applicable intellectual-property rights. You may use the service only as
            permitted by these terms and applicable law.
          </p>

          <h2>9. Safety and enforcement</h2>
          <p>
            We may restrict, suspend or terminate access where reasonably necessary to protect
            users, investigate abuse, enforce these terms, protect the service, or comply with legal
            obligations.
          </p>

          <h2>10. Availability and changes</h2>
          <p>
            Features may change as AskATutorLive develops. We may add, modify, suspend or remove
            functionality and may update these terms when necessary. The current version will be
            published on this page.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions about these terms can be sent to
            <a href="mailto:help@askatutorlive.com"> help@askatutorlive.com</a>.
          </p>

          <p className="not-prose pt-4 text-sm text-muted-foreground">
            See also{" "}
            <Link to="/privacy" className="underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        </article>
      </main>
      <MinimalFooter />
    </div>
  );
}
