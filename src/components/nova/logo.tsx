import { cn } from "@/lib/utils";

export function NovaLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-semibold tracking-tight", className)}>
      <img src="/logo.png" alt="NovaMail Logo" className="h-8 w-8 object-contain" />
      <span className="text-base">NovaMail</span>
    </span>
  );
}