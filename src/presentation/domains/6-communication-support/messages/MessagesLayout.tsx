import { ReactNode } from "react";
import { Navbar } from "../../8-core-ux-navigation/Navbar";
import { Card } from "../../8-core-ux-navigation/ui/card";

export function MessagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-12">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">Messages</h1>
        <Card className="overflow-hidden">{children}</Card>
      </main>
    </div>
  );
}
