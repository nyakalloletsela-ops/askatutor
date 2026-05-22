import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { LorddaLab } from "@/components/LorddaLab";

export const Route = createFileRoute("/labs")({
  component: LabsPage,
  head: () => ({
    meta: [
      { title: "Virtual STEM Labs — Ask A Tutor Live" },
      { name: "description", content: "Hands-on virtual experiments in Physics, Chemistry, Biology, Math and Earth Science — from primary to university." },
      { property: "og:title", content: "Virtual STEM Labs — Ask A Tutor Live" },
      { property: "og:description", content: "60+ interactive simulations for African STEM learners." },
    ],
  }),
});

function LabsPage() {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex-1 overflow-hidden pb-16 md:pb-0">
        <LorddaLab />
      </div>
    </div>
  );
}
