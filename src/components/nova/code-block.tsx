import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CodeBlock({
  code,
  language = "bash",
  className,
  filename,
}: {
  code: string;
  language?: string;
  className?: string;
  filename?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className={cn("group relative overflow-hidden rounded-xl border border-border bg-surface/70", className)}>
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-success/70" />
          <span className="ml-2 font-mono">{filename ?? language}</span>
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-foreground/90">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}