import { Link } from "@tanstack/react-router";

export function MinimalFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
        <div>&copy; {new Date().getFullYear()} AskATutorLive</div>
        <nav className="flex flex-wrap items-center gap-5">
          <Link to="/community" className="hover:text-foreground">About</Link>
          <Link to="/auth" className="hover:text-foreground">Become a Tutor</Link>
          <Link to="/help" className="hover:text-foreground">Support</Link>
          <a href="mailto:help@askatutorlive.com" className="hover:text-foreground">Terms</a>
        </nav>
      </div>
    </footer>
  );
}
