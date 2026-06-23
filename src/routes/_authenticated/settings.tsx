import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/dashboard/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Bell, CreditCard, Shield, Palette } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AskATutorLive" },
      { name: "description", content: "Manage your account, notifications, billing and preferences." },
    ],
  }),
  component: SettingsPage,
});

const sections = [
  { icon: User, title: "Profile", desc: "Name, avatar, bio and public info.", to: "/dashboard" as const },
  { icon: Bell, title: "Notifications", desc: "Email and in-app alerts.", to: "/notifications" as const },
  { icon: CreditCard, title: "Billing & Payments", desc: "Plans, invoices and payouts.", to: "/dashboard" as const },
  { icon: Shield, title: "Security", desc: "Password, sessions and 2FA.", to: "/dashboard" as const },
  { icon: Palette, title: "Appearance", desc: "Theme and display preferences.", to: "/dashboard" as const },
];

function SettingsPage() {
  return (
    <AppShell title="Settings">
      <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((s) => (
            <Card key={s.title} className="transition hover:shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base">{s.title}</CardTitle>
                  <CardDescription className="truncate">{s.desc}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link to={s.to}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
