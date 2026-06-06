import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  delivered: "bg-success/15 text-success border-success/30",
  opened: "bg-info/15 text-info border-info/30",
  queued: "bg-warning/15 text-warning border-warning/30",
  bounced: "bg-destructive/15 text-destructive border-destructive/30",
  failed: "bg-destructive/20 text-destructive border-destructive/40",
  verified: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  live: "bg-primary/15 text-foreground border-primary/40",
  test: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status] ?? "bg-muted text-muted-foreground border-border",
      )}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}