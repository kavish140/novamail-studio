import { Link } from "@tanstack/react-router";
import { NovaLogo } from "./logo";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-supabase";

export function SiteHeader() {
  const { data: user } = useUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="transition hover:opacity-80">
          <NovaLogo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="/#features" className="transition hover:text-foreground">
            Features
          </a>
          <Link to="/docs" className="transition hover:text-foreground">
            Docs
          </Link>
          <Link to="/changelog" className="transition hover:text-foreground">
            Changelog
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild size="sm" className="glow">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="glow">
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
