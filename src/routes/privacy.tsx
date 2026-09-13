import { Link, createFileRoute } from "@tanstack/react-router";
import { MinimalFooter } from "@/presentation/domains/1-discovery-matching/home/MinimalFooter";
import { Navbar } from "@/presentation/domains/8-core-ux-navigation/Navbar";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — AskATutorLive" },
      {
        name: "description",
        content: "Privacy information for AskATutorLive users.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <article className="prose prose-slate max-w-none dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="lead">
            AskATutorLive is committed to protecting the information entrusted to the platform. This
            policy explains, at a high level, what information may be processed when you use
            AskATutorLive and how it is used to provide and improve the service.
          </p>
          <p>
            <strong>Last updated:</strong> September 13, 2026
          </p>

          <h2>1. Information we process</h2>
          <p>
            Depending on how you use the service, AskATutorLive may process account and profile
            information, including your name, email address, authentication information and profile
            details; information you provide while using tutoring, learning and community features;
            messages and support requests; and technical information needed to operate, secure and
            troubleshoot the service.
          </p>

          <h2>2. Google sign-in</h2>
          <p>
            If you choose Google sign-in, Google provides authentication information to AskATutorLive
            so that we can create and maintain your account and authenticate you. We use Google
            account information only for the purposes described in this policy and the service's
            user-facing functionality. AskATutorLive does not sell Google user data.
          </p>

          <h2>3. How information is used</h2>
          <p>
            Information is used to authenticate users, provide tutoring and learning features,
            maintain profiles and sessions, respond to support requests, protect the platform, prevent
            abuse, maintain service reliability, and improve the user experience.
          </p>

          <h2>4. Service providers</h2>
          <p>
            AskATutorLive uses third-party infrastructure and service providers where necessary to
            operate features such as authentication, data storage, communications, hosting, payments
            and other platform functionality. Information shared with a provider is limited to what is
            reasonably necessary for that provider to perform its service.
          </p>

          <h2>5. AI features</h2>
          <p>
            Where AI features are enabled, information submitted to an AI-powered feature may be
            processed to provide the requested functionality. Access to AI features and the data
            available to them is subject to the platform's authorization and entitlement rules.
          </p>

          <h2>6. Security and access</h2>
          <p>
            We use technical and organizational measures intended to protect information from
            unauthorized access, alteration, disclosure or destruction. Access to protected
            information is intended to follow account, role and authorization boundaries.
          </p>

          <h2>7. Retention and deletion</h2>
          <p>
            Information is retained for as long as reasonably necessary to provide the service, meet
            operational and legal requirements, resolve disputes, prevent abuse and maintain security.
            If you want to request account or personal-data deletion, contact
            <a href="mailto:help@askatutorlive.com"> help@askatutorlive.com</a> with enough information
            for us to identify the relevant account.
          </p>

          <h2>8. Your choices</h2>
          <p>
            You may contact us about access, correction or deletion requests concerning your personal
            information. Some information may need to be retained where required for security, fraud
            prevention, legal compliance or legitimate operational purposes.
          </p>

          <h2>9. Children and learners</h2>
          <p>
            AskATutorLive is an education platform. Where a learner is a child or otherwise needs a
            parent, guardian or institution to provide consent, the applicable account and
            authorization process should be followed. We do not knowingly request unnecessary personal
            information from children.
          </p>

          <h2>10. Changes to this policy</h2>
          <p>
            We may update this policy as the platform changes. The latest version will be made
            available on this page with its effective date.
          </p>

          <h2>11. Contact</h2>
          <p>
            Privacy questions and requests can be sent to
            <a href="mailto:help@askatutorlive.com"> help@askatutorlive.com</a>.
          </p>

          <p className="not-prose pt-4 text-sm text-muted-foreground">
            See also <Link to="/terms" className="underline underline-offset-4">Terms of Service</Link>.
          </p>
        </article>
      </main>
      <MinimalFooter />
    </div>
  );
}