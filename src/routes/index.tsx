import { useEffect, useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/presentation/domains/8-core-ux-navigation/Navbar";
import { useAuth } from "@/presentation/domains/3-personalization-role-context/hooks/use-auth";
import {
  HeroSection,
  InstantActions,
  HowItWorksSection,
  SubjectsGrid,
  MinimalFooter,
} from "@/presentation/domains/1-discovery-matching";
import {
  FeaturedTutors,
  LearningTools,
  TutorOpportunity,
} from "@/presentation/domains/1-discovery-matching/home/PurposeSections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AskATutorLive — Learn with the right support" },
      {
        name: "description",
        content:
          "Find a tutor, learn online, practise what you are learning, and get intelligent support when you need it.",
      },
      { property: "og:title", content: "AskATutorLive — Learn with the right support" },
      {
        property: "og:description",
        content: "Find a tutor, learn online, practise, and get help when you need it.",
      },
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
      if (!error) setTutorCount(((data as TutorRow[]) ?? []).length);
    });
  }, []);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection tutorCount={tutorCount} />
        <InstantActions />
        <FeaturedTutors />
        <HowItWorksSection />
        <LearningTools />
        <SubjectsGrid />
        <TutorOpportunity />
      </main>
      <MinimalFooter />
    </div>
  );
}
