import { createFileRoute } from "@tanstack/react-router";
import { MinimalFooter } from "@/presentation/domains/1-discovery-matching/home/MinimalFooter";
import { Navbar } from "@/presentation/domains/8-core-ux-navigation/Navbar";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — AskATutorLive" },
      { name: "description", content: "Privacy Policy for AskATutorLive, operated by Zero (Pty) Ltd." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-muted-foreground">AskATutorLive is operated by Zero (Pty) Ltd.</p>
        </header>

        <div className="space-y-10 leading-7 text-muted-foreground">
          <section><h2 className="text-xl font-semibold text-foreground">1. Information we handle</h2><p className="mt-3">Depending on how you use the platform, we may handle account and authentication information, profile information, learning and tutoring information, communications, transaction-related information, and technical information needed to operate the service.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">2. How information is used</h2><p className="mt-3">Information may be used to provide and operate the platform, support learning and tutoring activities, manage accounts and sessions, communicate with users, process transactions, maintain service functionality, address misuse, and respond to requests.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">3. Learning and educational information</h2><p className="mt-3">Information generated through learning activities, assessments, tutoring interactions, submissions, and related services may be processed to provide the educational functionality of the platform and associated user-facing features.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">4. AI-assisted features</h2><p className="mt-3">Where AI-assisted features are available, information supplied to those features may be processed to provide the requested functionality. AI output can be incorrect and should not be treated as a substitute for appropriate educational or professional judgment.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">5. Service providers</h2><p className="mt-3">We may use third-party providers for services such as authentication, hosting, communications, payments, analytics, storage, and AI or other technical capabilities. Their processing may be governed by their own terms and privacy notices.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">6. Cookies and browser storage</h2><p className="mt-3">The platform may use cookies, local storage, or similar browser technologies where needed for authentication, session functionality, preferences, security, or other service operations.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">7. Security and retention</h2><p className="mt-3">We take reasonable measures intended to protect information and retain information as needed for the purposes for which it is processed, operational requirements, legal obligations, dispute handling, and legitimate business needs.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">8. Your requests</h2><p className="mt-3">For privacy matters or privacy-related requests, contact <a className="text-primary underline-offset-4 hover:underline" href="mailto:privacy@askatutorlive.com">privacy@askatutorlive.com</a>. For general support, contact <a className="text-primary underline-offset-4 hover:underline" href="mailto:support@askatutorlive.com">support@askatutorlive.com</a>.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">9. Changes</h2><p className="mt-3">This Privacy Policy may be updated from time to time. The version published on this page is the applicable version for users of the service.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">10. Contact</h2><p className="mt-3">General information and other business matters: <a className="text-primary underline-offset-4 hover:underline" href="mailto:info@askatutorlive.com">info@askatutorlive.com</a>. Administrative matters: <a className="text-primary underline-offset-4 hover:underline" href="mailto:admin@askatutorlive.com">admin@askatutorlive.com</a>.</p></section>
        </div>
      </main>
      <MinimalFooter />
    </div>
  );
}
