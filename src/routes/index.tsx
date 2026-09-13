import { useEffect, useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/presentation/domains/8-core-ux-navigation/Navbar";
import { useAuth } from "@/presentation/domains/3-personalization-role-context/hooks/use-auth";
import {
  HeroSection,
  ActivityTicker,
  InstantActions,
  HowItWorksSection,
  TrustMetrics,
  SubjectsGrid,
  MinimalFooter,
} from "@/presentation/domains/1-discovery-matching";
import { LearningBeyondSession, TutorOpportunity, FinalLearningCta } from "@/presentation/domains/1-discovery-matching/home/PurposeSections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AskATutorLive — Learn how to solve it" },
      { name: "description", content: "Ask a question, find the right tutor, practise what you are learning, and get intelligent support along the way." },
      { property: "og:title", content: "AskATutorLive — Learn how to solve it" },
      { property: "og:description", content: "People, learning tools and AI working together to help you make real progress." },
    ],
  }),
  component: Home,
});

type TutorRow = { id: string; subjects: string[] | null };

function Home() {
  const { user, loading } = useAuth();
  const [tutorCount, setTutorCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.rpc("list_public_tutors").then(({ data, error }) => {
      if (error) { setTutorCount(null); return; }
      setTutorCount(((data as TutorRow[]) ?? []).length);
    });
  }, []);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection tutorCount={tutorCount} />
        <ActivityTicker />
        <InstantActions />
        <HowItWorksSection />
        <LearningBeyondSession />
        <SubjectsGrid />
        <TrustMetrics tutorCount={tutorCount} />
        <TutorOpportunity />
        <FinalLearningCta />
      </main>
      <MinimalFooter />
    </div>
  );
}
