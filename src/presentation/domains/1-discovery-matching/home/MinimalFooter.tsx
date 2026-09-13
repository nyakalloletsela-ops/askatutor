import { Link } from "@tanstack/react-router";

export function MinimalFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
        <div>&copy; {new Date().getFullYear()} AskATutorLive</div>
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/community" className="hover:text-foreground">About</Link>
          <Link to="/auth" className="hover:text-foreground">Become a Tutor</Link>
          <Link to="/help" className="hover:text-foreground">Support</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
