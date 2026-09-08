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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AskATutorLive \u2014 Get unstuck in seconds" },
      { name: "description", content: "Start a live learning session instantly with real tutors or AI. No waiting, no friction." },
      { property: "og:title", content: "AskATutorLive \u2014 Get unstuck in seconds" },
      { property: "og:description", content: "Start a live learning session instantly with real tutors or AI." },
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
      <HeroSection tutorCount={tutorCount} />
      <ActivityTicker />
      <InstantActions />
      <HowItWorksSection />
      <TrustMetrics tutorCount={tutorCount} />
      <SubjectsGrid />
      <MinimalFooter />
    </div>
  );
}
