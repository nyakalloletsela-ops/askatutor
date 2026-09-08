import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/presentation/domains/8-core-ux-navigation/Navbar";
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
      { name: "description", content: "Pay your tutor in bulk for one or many lessons using their tutor ID." },
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

  const submit = async () => {
    if (!pricing) return;
    setSubmitting(true);
    const { data, error } = await supabase.rpc("create_bulk_lesson_intent", {
      _tutor: pricing.id,
      _lessons: lessons,
      _lesson_minutes: minutes,
      _method: "manual",
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(
      `Payment request created. Reference: ${data}. An admin will confirm once payment is received.`,
      { duration: 8000 },
    );
    setPricing(null);
    setLessons(1);
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
