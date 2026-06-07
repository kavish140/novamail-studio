import { Link } from "@tanstack/react-router";
import { NovaLogo } from "./logo";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative flex flex-col px-6 py-8 sm:px-12">
        <Link to="/" className="inline-flex">
          <NovaLogo />
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
        </div>
        <div className="text-xs text-muted-foreground">© NovaMail Labs</div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-border/60 bg-surface lg:block">
        <div className="absolute inset-0 bg-aurora" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <blockquote className="max-w-md text-2xl font-display leading-snug tracking-tight">
            "We replaced three email providers with NovaMail in a weekend. Our deliverability went
            up and our on-call pages went away."
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent" />
            <div>
              <div className="text-sm font-medium">Mira Okafor</div>
              <div className="text-xs text-muted-foreground">Staff Engineer, Helix Health</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
