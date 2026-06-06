import { cn } from "@/lib/utils";

export function NovaLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-semibold tracking-tight", className)}>
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground glow">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7l9 6 9-6" />
          <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
          <path d="M3 7l9-4 9 4" />
        </svg>
      </span>
      <span className="text-base">NovaMail</span>
    </span>
  );
}