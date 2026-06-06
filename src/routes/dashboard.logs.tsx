import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { type EmailLog } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/nova/status-badge";
import { CodeBlock } from "@/components/nova/code-block";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useEmailLogs } from "@/hooks/use-supabase";

export const Route = createFileRoute("/dashboard/logs")({
  head: () => ({
    meta: [
      { title: "Email Logs — NovaMail" },
      { name: "description", content: "Realtime log stream of every email sent through NovaMail." },
    ],
  }),
  component: LogsPage,
});

function LogsPage() {
  const { data: emailLogs = [], isLoading } = useEmailLogs();
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<EmailLog | null>(null);

  const filtered = useMemo(() => {
    return emailLogs.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (q && !`${l.to} ${l.subject}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [status, q]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Email logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every email NovaMail has sent for your workspace.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-surface/60 p-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by recipient or subject" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-background/60" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="opened">Opened</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="24h">
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">To</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Opens</th>
              <th className="px-6 py-3">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} onClick={() => setOpen(row)} className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-surface-elevated/60">
                <td className="px-6 py-3 text-xs text-muted-foreground">{row.sentAt}</td>
                <td className="px-6 py-3 font-mono text-xs">{row.to}</td>
                <td className="px-6 py-3">{row.subject}</td>
                <td className="px-6 py-3"><StatusBadge status={row.status} /></td>
                <td className="px-6 py-3 text-xs">{row.opens}</td>
                <td className="px-6 py-3 text-xs">{row.clicks}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-muted-foreground">No emails match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full max-w-lg sm:max-w-lg overflow-y-auto">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-xl">{open.subject}</SheetTitle>
                <SheetDescription className="font-mono text-xs">{open.id}</SheetDescription>
              </SheetHeader>
              <dl className="mt-6 space-y-3 text-sm">
                <Row label="Status"><StatusBadge status={open.status} /></Row>
                <Row label="To"><span className="font-mono text-xs">{open.to}</span></Row>
                <Row label="From"><span className="font-mono text-xs">{open.from}</span></Row>
                <Row label="Sent"><span className="text-muted-foreground">{open.sentAt}</span></Row>
                <Row label="Opens"><span>{open.opens}</span></Row>
                <Row label="Clicks"><span>{open.clicks}</span></Row>
              </dl>
              <div className="mt-6">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Request payload</div>
                <CodeBlock language="json" filename="request.json" code={JSON.stringify({
                  from: open.from,
                  to: open.to,
                  subject: open.subject,
                  html: "<h1>…</h1>",
                  idempotency_key: open.id,
                }, null, 2)} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}