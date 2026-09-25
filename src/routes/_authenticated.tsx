import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/presentation/domains/3-personalization-role-context/hooks/use-auth";
import { AppShell } from "@/presentation/domains/8-core-ux-navigation/AppShell";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <main
        className="flex min-h-[100svh] items-center justify-center bg-background px-4"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">Loading your workspace…</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
