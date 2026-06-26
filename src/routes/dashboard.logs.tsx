import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  MousePointerClick,
  Timer,
  ChevronDown,
  Download,
} from "lucide-react";
import { type EmailLog } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/nova/status-badge";
import { CodeBlock } from "@/components/nova/code-block";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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

// ─── Delivery Timeline ─────────────────────────────────────────────────────────

type TimelineEvent = {
  icon: typeof Clock;
  label: string;
  time: string;
  color: string;
  description: string;
};

function buildTimeline(log: EmailLog): TimelineEvent[] {
  const base = log.rawCreatedAt ? new Date(log.rawCreatedAt) : new Date();
  const fmt = (offset: number) =>
    new Date(base.getTime() + offset * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const events: TimelineEvent[] = [
    {
      icon: Timer,
      label: "API request received",
      time: fmt(0),
      color: "text-info",
      description: "POST /v1/email accepted, message queued for delivery.",
    },
    {
      icon: Clock,
      label: "Queued for delivery",
      time: fmt(1),
      color: "text-muted-foreground",
      description: "Routed to us-east-1 send worker. IP warm pool selected.",
    },
  ];

  if (log.status === "delivered" || log.status === "opened") {
    events.push({
      icon: CheckCircle2,
      label: "Delivered",
      time: fmt(3),
      color: "text-success",
      description: "Remote MTA accepted the message with a 250 OK response.",
    });
  }

  if (log.status === "opened" && log.opens > 0) {
    events.push({
      icon: Eye,
      label: `Opened (×${log.opens})`,
      time: fmt(47),
      color: "text-primary",
      description: "Tracking pixel fired. User agent: Mozilla/5.0 (Macintosh).",
    });
  }

  if (log.status === "opened" && log.clicks > 0) {
    events.push({
      icon: MousePointerClick,
      label: `Link clicked (×${log.clicks})`,
      time: fmt(63),
      color: "text-accent",
      description: "Redirect through nm-click.io/r/ — destination: your call-to-action URL.",
    });
  }

  if (log.status === "bounced") {
    events.push({
      icon: XCircle,
      label: "Hard bounce",
      time: fmt(4),
      color: "text-destructive",
      description: "5.1.1 — The email account does not exist. Recipient suppressed.",
    });
  }

  if (log.status === "failed") {
    events.push({
      icon: AlertCircle,
      label: "Delivery failed",
      time: fmt(4),
      color: "text-warning",
      description: "Connection timed out after 3 retry attempts over 30 minutes.",
    });
  }

  if (log.status === "queued") {
    events.push({
      icon: Clock,
      label: "Still in queue",
      time: fmt(2),
      color: "text-muted-foreground",
      description: "Waiting on MX resolution. Will retry up to 5 times over 4 hours.",
    });
  }

  return events;
}

function DeliveryTimeline({ log }: { log: EmailLog }) {
  const events = buildTimeline(log);
  return (
    <div className="mt-6">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Delivery timeline
      </div>
      <div className="space-y-0">
        {events.map((ev, i) => (
          <div key={i} className="flex gap-3">
            {/* dot + line */}
            <div className="flex flex-col items-center">
              <div
                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/60 bg-surface ${ev.color}`}
              >
                <ev.icon className="h-3 w-3" />
              </div>
              {i < events.length - 1 && (
                <div className="my-0.5 w-px flex-1 bg-border/60" style={{ minHeight: 20 }} />
              )}
            </div>
            {/* content */}
            <div className="pb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{ev.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{ev.time}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                {ev.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Detail drawer ─────────────────────────────────────────────────────────────

function LogDetailDrawer({ log, onClose }: { log: EmailLog | null; onClose: () => void }) {
  return (
    <Sheet open={!!log} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full max-w-lg sm:max-w-lg overflow-y-auto space-y-0">
        {log && (
          <>
            <SheetHeader className="pb-4 border-b border-border/60">
              <SheetTitle className="font-display text-xl leading-tight">{log.subject}</SheetTitle>
              <SheetDescription className="font-mono text-xs">{log.id}</SheetDescription>
            </SheetHeader>

            {/* Stats row */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniCard label="Status">
                <StatusBadge status={log.status} />
              </MiniCard>
              <MiniCard label="Opens">
                <span className="font-semibold">{log.opens}</span>
              </MiniCard>
              <MiniCard label="Clicks">
                <span className="font-semibold">{log.clicks}</span>
              </MiniCard>
            </div>

            {/* Fields */}
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="To">
                <span className="font-mono text-xs">{log.to}</span>
              </Row>
              <Row label="From">
                <span className="font-mono text-xs">{log.from}</span>
              </Row>
              <Row label="Sent">
                <span className="text-muted-foreground">{log.sentAt}</span>
              </Row>
            </dl>

            {/* Delivery Timeline */}
            <DeliveryTimeline log={log} />

            {/* Request payload */}
            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Request payload
              </div>
              <CodeBlock
                language="json"
                filename="request.json"
                code={JSON.stringify(
                  {
                    from: log.from,
                    to: log.to,
                    subject: log.subject,
                    html: "<h1>…</h1>",
                    idempotency_key: log.id,
                  },
                  null,
                  2,
                )}
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MiniCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface/60 p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center justify-center">{children}</div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

function LogsPage() {
  const { data: emailLogs = [], isLoading } = useEmailLogs();
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [open, setOpen] = useState<EmailLog | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    if (timeRange === "24h") cutoff.setHours(now.getHours() - 24);
    else if (timeRange === "7d") cutoff.setDate(now.getDate() - 7);
    else cutoff.setDate(now.getDate() - 30);

    return emailLogs.filter((l) => {
      const logDate = new Date(l.rawCreatedAt || l.sentAt);
      if (logDate < cutoff) return false;
      if (status !== "all" && l.status !== status) return false;
      if (q && !`${l.to} ${l.subject} ${l.from}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [status, q, emailLogs, timeRange]);

  const counts = useMemo(() => {
    const all = emailLogs.length;
    const delivered = emailLogs.filter(
      (l) => l.status === "delivered" || l.status === "opened",
    ).length;
    const bounced = emailLogs.filter((l) => l.status === "bounced" || l.status === "failed").length;
    return { all, delivered, bounced };
  }, [emailLogs]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Email logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every email NovaMail has sent for your workspace. Click any row for the delivery
            timeline.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Quick-stat chips */}
      <div className="flex flex-wrap gap-3">
        <StatChip label="Total" value={counts.all} />
        <StatChip label="Delivered / Opened" value={counts.delivered} accent="success" />
        <StatChip label="Bounced / Failed" value={counts.bounced} accent="destructive" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-surface/60 p-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="logs-search"
            placeholder="Search by recipient, subject or sender…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 bg-background/60"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="opened">Opened</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
        {(q || status !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ("");
              setStatus("all");
            }}
            className="text-muted-foreground"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-2xl border border-border/60 bg-surface/60 p-16 text-center">
          <div className="text-sm text-muted-foreground animate-pulse">Loading email logs…</div>
        </div>
      ) : (
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
                <th className="px-6 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <>
                  <tr
                    key={row.id}
                    onClick={() => setOpen(row)}
                    className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-surface-elevated/60 transition-colors group"
                  >
                    <td className="px-6 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {row.sentAt}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs">{row.to}</td>
                    <td className="px-6 py-3 max-w-[200px] truncate">{row.subject}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-6 py-3 text-xs">
                      {row.opens > 0 ? (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <Eye className="h-3 w-3" /> {row.opens}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{row.opens}</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-xs">
                      {row.clicks > 0 ? (
                        <span className="inline-flex items-center gap-1 text-accent">
                          <MousePointerClick className="h-3 w-3" /> {row.clicks}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{row.clicks}</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpanded((prev) => (prev === row.id ? null : row.id));
                      }}
                    >
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          expanded === row.id ? "rotate-180" : ""
                        }`}
                      />
                    </td>
                  </tr>

                  {/* Inline mini-timeline expansion */}
                  {expanded === row.id && (
                    <tr
                      key={`${row.id}-expanded`}
                      className="border-b border-border/60 bg-surface/40"
                    >
                      <td colSpan={7} className="px-8 py-4">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          Quick timeline
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {buildTimeline(row).map((ev, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs"
                            >
                              <ev.icon className={`h-3 w-3 ${ev.color}`} />
                              <span className="text-foreground">{ev.label}</span>
                              <span className="text-muted-foreground">{ev.time}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setOpen(row)}
                          className="mt-3 text-xs text-primary hover:underline"
                        >
                          Open full detail →
                        </button>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-muted-foreground">
                    No emails match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Full detail drawer */}
      <LogDetailDrawer log={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "success" | "destructive";
}) {
  const color =
    accent === "success"
      ? "text-success"
      : accent === "destructive"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface/60 px-4 py-2">
      <span className={`font-display text-lg font-semibold ${color}`}>{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2.5 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
