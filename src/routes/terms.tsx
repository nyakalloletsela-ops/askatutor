import { createFileRoute } from "@tanstack/react-router";
import { MinimalFooter } from "@/presentation/domains/1-discovery-matching/home/MinimalFooter";
import { Navbar } from "@/presentation/domains/8-core-ux-navigation/Navbar";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AskATutorLive" },
      { name: "description", content: "Terms of Service for AskATutorLive, operated by Zero (Pty) Ltd." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">Legal</p>
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-4 text-muted-foreground">These terms apply to use of AskATutorLive, operated by Zero (Pty) Ltd.</p>
        </header>

        <div className="space-y-10 leading-7 text-muted-foreground">
          <section><h2 className="text-xl font-semibold text-foreground">1. Using the service</h2><p className="mt-3">You may use AskATutorLive only for lawful purposes and in accordance with these terms. You are responsible for information you provide through your account and for keeping account credentials under your control.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">2. Tutoring and learning</h2><p className="mt-3">AskATutorLive provides educational and tutoring functionality. Learning materials, tutoring interactions, assessments, and other platform features are provided to support learning and do not guarantee a particular educational outcome.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">3. Assessments and AI</h2><p className="mt-3">Assessment results and AI-assisted outputs may contain errors. Users should exercise appropriate judgment and verify important information. AI features are not a substitute for qualified professional advice where such advice is required.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">4. User content and conduct</h2><p className="mt-3">You must not use the service to upload or transmit unlawful, harmful, abusive, fraudulent, infringing, or malicious content, or to interfere with the service or attempt to gain unauthorized access.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">5. Payments</h2><p className="mt-3">Where paid services are offered, applicable prices and payment terms will be presented before a transaction. Payment processing may be provided through third-party payment providers and may be subject to their terms.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">6. Third-party services</h2><p className="mt-3">The platform may integrate third-party services. Their availability and use may be subject to separate terms, policies, and technical limitations.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">7. Intellectual property</h2><p className="mt-3">The platform and its original software, branding, and content are protected by applicable intellectual property rights. You retain rights in content you lawfully provide, subject to the permissions needed to operate the service.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">8. Availability and changes</h2><p className="mt-3">Features may change, be suspended, or become unavailable. We may update these terms when the service or applicable requirements change.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">9. Suspension</h2><p className="mt-3">Access may be restricted or suspended where reasonably necessary to protect users, the service, third parties, or the integrity of the platform, including in response to misuse or suspected unauthorized activity.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">10. Governing law</h2><p className="mt-3">These terms are governed by the laws of Lesotho, subject to applicable law and the jurisdiction of the courts of Lesotho.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">11. Contact</h2><p className="mt-3">General support: <a className="text-primary underline-offset-4 hover:underline" href="mailto:support@askatutorlive.com">support@askatutorlive.com</a>. Privacy matters: <a className="text-primary underline-offset-4 hover:underline" href="mailto:privacy@askatutorlive.com">privacy@askatutorlive.com</a>. General information and other business matters: <a className="text-primary underline-offset-4 hover:underline" href="mailto:info@askatutorlive.com">info@askatutorlive.com</a>. Administrative matters: <a className="text-primary underline-offset-4 hover:underline" href="mailto:admin@askatutorlive.com">admin@askatutorlive.com</a>.</p></section>
        </div>
      </main>
      <MinimalFooter />
    </div>
  );
}
