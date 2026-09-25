import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Navbar } from "@/presentation/domains/8-core-ux-navigation/Navbar";
import { initiateCheckout } from "@/application/use-cases/commerce/initiate-checkout";
import { ScopeGate } from "@/presentation/domains/3-personalization-role-context/ScopeGate";
import {
  TutorLookup,
  TutorPricing,
  BulkLessonConfig,
} from "@/presentation/domains/7-commerce-financial/payments";

export const Route = createFileRoute("/_authenticated/pay-tutor")({
  component: PayTutorPage,
  head: () => ({
    meta: [
      { title: "Pay a tutor — Ask A Tutor Live" },
      {
        name: "description",
        content: "Pay your tutor in bulk for one or many lessons using their tutor ID.",
      },
    ],
  }),
});

function PayTutorPage() {
  return (
    <>
      <Navbar />
      <ScopeGate scope="find_tutors">
        <PayTutorInner />
      </ScopeGate>
    </>
  );
}

function PayTutorInner() {
  const [pricing, setPricing] = useState<TutorPricing | null>(null);
  const [lessons, setLessons] = useState(1);
  const [minutes, setMinutes] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const startCheckout = useServerFn(initiateCheckout);

  const submit = async () => {
    if (!pricing) return;
    setSubmitting(true);
    try {
      const result = await startCheckout({
        data: { tutorId: pricing.id, lessons, lessonMinutes: minutes },
      });
      window.location.assign(result.approvalUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout could not be started.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pay a tutor</h1>
        <p className="text-sm text-muted-foreground">
          Enter the tutor's ID to pay for one or more lessons in bulk. The total is calculated from
          their hourly rate.
        </p>
      </div>
      <TutorLookup onFound={setPricing} />
      {pricing && (
        <BulkLessonConfig
          pricing={pricing}
          lessons={lessons}
          setLessons={setLessons}
          minutes={minutes}
          setMinutes={setMinutes}
          onSubmit={submit}
          submitting={submitting}
        />
      )}
    </div>
  );
}
