import { Link, useRouterState } from "@tanstack/react-router";
import { Home, GraduationCap, Sparkles, LayoutDashboard, User, Shield } from "lucide-react";
import { useAuth } from "../3-personalization-role-context/hooks/use-auth";
import { isAppShellRoute, isImmersiveRoute } from "./navigation-visibility";

const guestTabs = [
  { to: "/" as const, label: "Home", icon: Home },
  { to: "/tutors" as const, label: "Tutors", icon: GraduationCap },
  { to: "/auth" as const, label: "Sign in", icon: User },
];

const userTabs = [
  { to: "/" as const, label: "Home", icon: Home },
  { to: "/tutors" as const, label: "Tutors", icon: GraduationCap },
  { to: "/ai-tools" as const, label: "AI", icon: Sparkles },
  { to: "/dashboard" as const, label: "Me", icon: LayoutDashboard },
];

export function MobileTabBar() {
  const { user, isAdmin } = useAuth();
  const path = useRouterState({ select: (r) => r.location.pathname });

  // AppShell owns authenticated navigation; classroom is intentionally immersive.
  if (isImmersiveRoute(path) || isAppShellRoute(path)) return null;

  const tabs = user
    ? isAdmin
      ? [...userTabs, { to: "/admin" as const, label: "Admin", icon: Shield }]
      : userTabs
    : guestTabs;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? path === "/" : path === to || path.startsWith(`${to}/`);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
