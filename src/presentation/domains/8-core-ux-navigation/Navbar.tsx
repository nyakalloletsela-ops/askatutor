import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Moon, Sun, Menu, X, Bell } from "lucide-react";
import logo from "@/assets/logo.png";
import { useEffect, useState } from "react";
import { useAuth } from "../3-personalization-role-context/hooks/use-auth";
import { useTheme } from "./hooks/use-theme";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { isAppShellRoute } from "./navigation-visibility";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    let alive = true;
    const load = async () => {
      const { count: courses } = await supabase
        .from("tutor_courses")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      if (alive) setPendingCount(courses ?? 0);
    };
    load();
    const t = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [isAdmin]);

  // Authenticated routes have AppShell as their single navigation owner.
  // Keeping this guard here lets legacy/public routes migrate incrementally
  // without rendering two competing navigation systems.
  if (isAppShellRoute(path)) return null;

  const close = () => setOpen(false);
  const links = (
    <>
      <Link to="/tutors" onClick={close} className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground">Find a Tutor</Link>
      <Link to="/tutors" onClick={close} className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground">Learn</Link>
      <Link to="/labs" onClick={close} className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground">Practise</Link>
      {user && <Link to="/dashboard" onClick={close} className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground">My Progress</Link>}
      {!user && <Link to="/auth" onClick={close} className="rounded-md px-3 py-2 text-sm font-semibold text-primary hover:bg-accent">Ask for Help</Link>}
      {user && <>
        <Link to="/ai-tools" onClick={close} className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground">AI Support</Link>
        {isAdmin && <Link to="/admin" onClick={close} className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent">Admin</Link>}
      </>}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold" aria-label="AskATutorLive home">
          <img src={logo} alt="Ask A Tutor Live logo" className="h-9 w-9 object-contain" />
          <span className="text-lg tracking-tight">Ask A Tutor <span className="text-aurora">Live</span></span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links}
          <Button asChild size="sm" className="ml-2 rounded-xl bg-aurora text-white hover:opacity-90"><Link to={user ? "/dashboard" : "/auth"}>{user ? "Continue Learning" : "Start Learning"}</Link></Button>
          <button onClick={toggle} aria-label="Toggle theme" className="ml-1 rounded-md p-2 text-foreground/70 hover:bg-accent hover:text-foreground">{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          {isAdmin && <Link to="/admin" aria-label={`Admin notifications${pendingCount ? `: ${pendingCount} pending` : ""}`} className="relative rounded-md p-2 text-foreground/70 hover:bg-accent"><Bell className="h-4 w-4" />{pendingCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">{pendingCount > 9 ? "9+" : pendingCount}</span>}</Link>}
          {user && <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }} aria-label="Sign out"><LogOut className="h-4 w-4" /></Button>}
        </nav>
        <div className="flex items-center gap-1 md:hidden">
          <button onClick={toggle} aria-label="Toggle theme" className="rounded-md p-2 text-foreground/70 hover:bg-accent">{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <button onClick={() => setOpen((v) => !v)} aria-label={open ? "Close menu" : "Open menu"} className="rounded-md p-2 hover:bg-accent">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {open && <div className="border-t border-border/60 bg-background/95 backdrop-blur md:hidden"><div className="flex flex-col gap-1 px-4 py-3">{links}<Button asChild size="sm" className="mt-2 justify-start bg-aurora text-white"><Link to={user ? "/dashboard" : "/auth"} onClick={close}>{user ? "Continue Learning" : "Start Learning"}</Link></Button>{user && <Button variant="ghost" size="sm" className="justify-start" onClick={async () => { await signOut(); close(); navigate({ to: "/" }); }}><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>}</div></div>}
    </header>
  );
}
