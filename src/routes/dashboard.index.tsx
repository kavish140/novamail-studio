import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Mail,
  MailCheck,
  MailX,
  MousePointerClick,
  Send,
  Loader2,
  Check,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatusBadge } from "@/components/nova/status-badge";
import { CodeBlock } from "@/components/nova/code-block";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useEmailLogs, useUser } from "@/hooks/use-supabase";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Overview — NovaMail" },
      {
        name: "description",
        content: "Email delivery overview, recent activity, and quick start.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { data: emailLogs = [], isLoading } = useEmailLogs();
  const { data: user } = useUser();
  const name = user?.name?.split(" ")[0] || "there";

  const sentCount = emailLogs.length;
  const deliveredCount = emailLogs.filter((l) => l.status === "delivered").length;
  const bouncedCount = emailLogs.filter((l) => l.status === "bounced").length;
  const openedCount = emailLogs.filter((l) => (l.opens ?? 0) > 0).length;
  const openRate =
    deliveredCount > 0 ? ((openedCount / deliveredCount) * 100).toFixed(1) + "%" : "0%";

  const trendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return {
        day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        dateStr: d.toISOString().split("T")[0],
        sent: 0,
        delivered: 0,
        bounced: 0,
      };
    });

    emailLogs.forEach((log) => {
      const d = new Date(log.rawCreatedAt || log.sentAt);
      const dateStr = d.toISOString().split("T")[0];
      const bucket = last30Days.find((b) => b.dateStr === dateStr);
      if (bucket) {
        bucket.sent++;
        if (log.status === "delivered") bucket.delivered++;
        if (log.status === "bounced") bucket.bounced++;
      }
    });

    return last30Days;
  }, [emailLogs]);

  const prevStats = useMemo(() => {
    const prev30Days: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (59 - i));
      prev30Days.push(d.toISOString().split("T")[0]);
    }
    let sent = 0,
      delivered = 0,
      bounced = 0;
    emailLogs.forEach((log) => {
      const d = new Date(log.rawCreatedAt || log.sentAt);
      const dateStr = d.toISOString().split("T")[0];
      if (prev30Days.includes(dateStr)) {
        sent++;
        if (log.status === "delivered") delivered++;
        if (log.status === "bounced") bounced++;
      }
    });
    return { sent, delivered, bounced };
  }, [emailLogs]);

  const calcDelta = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? "New" : "—";
    const pct = (((current - previous) / previous) * 100).toFixed(1);
    return Number(pct) >= 0 ? `+${pct}%` : `${pct}%`;
  };

  const generateSpark = (key: "sent" | "delivered" | "bounced") => {
    // take the last 20 days for the sparkline
    return trendData.slice(-20).map((d, i) => ({ x: i, y: d[key] }));
  };
  const sparkOpenRate = trendData
    .slice(-20)
    .map((d, i) => ({ x: i, y: d.delivered > 0 ? d.sent / d.delivered : 0 })); // dummy open rate spark

  const stats = [
    {
      label: "Sent (30d)",
      value: sentCount.toLocaleString(),
      delta: calcDelta(sentCount, prevStats.sent),
      icon: Mail,
      spark: generateSpark("sent"),
    },
    {
      label: "Delivered",
      value: deliveredCount.toLocaleString(),
      delta: calcDelta(deliveredCount, prevStats.delivered),
      icon: MailCheck,
      spark: generateSpark("delivered"),
    },
    {
      label: "Bounced",
      value: bouncedCount.toLocaleString(),
      delta: calcDelta(bouncedCount, prevStats.bounced),
      icon: MailX,
      spark: generateSpark("bounced"),
    },
    {
      label: "Open rate",
      value: openRate,
      delta: "—",
      icon: MousePointerClick,
      spark: sparkOpenRate,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Welcome back, {name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's how NovaMail is performing across your workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SendTestEmailButton />
          <Button asChild>
            <Link to="/dashboard/keys">
              Create new API key <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border/60 bg-surface/60 p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="font-display text-3xl font-semibold tracking-tight">{s.value}</div>
              <div
                className={`text-xs ${s.delta.startsWith("-") ? "text-destructive" : "text-success"}`}
              >
                {s.delta}
              </div>
            </div>
            <div className="mt-3 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={s.spark}>
                  <Line
                    type="monotone"
                    dataKey="y"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-surface/60 p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Email volume</h2>
              <p className="text-xs text-muted-foreground">Sent vs delivered, last 30 days</p>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <LegendDot color="var(--color-primary)" label="Sent" />
              <LegendDot color="var(--color-chart-2)" label="Delivered" />
            </div>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-surface-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: "var(--color-foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#g1)"
                />
                <Area
                  type="monotone"
                  dataKey="delivered"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  fill="url(#g2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface/60 p-6">
          <h2 className="font-display text-lg font-semibold">Quick start</h2>
          <p className="mt-1 text-xs text-muted-foreground">Send your first email in 30 seconds.</p>
          <div className="mt-4">
            <CodeBlock
              language="bash"
              filename="terminal"
              code={`curl https://api.novamail.app/v1/email \\\n  -H "Authorization: Bearer nm_live_••••" \\\n  -d '{"to":"you@acme.dev","subject":"Hi","html":"<b>It works</b>"}'`}
            />
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="mt-4 flex-1">
              <Link to="/docs">Docs</Link>
            </Button>
            <Button asChild variant="outline" className="mt-4 flex-1">
              <Link to="/dashboard/templates">Templates</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface/60">
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Recent activity</h2>
            <p className="text-xs text-muted-foreground">Latest sends</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/logs">View all logs →</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
              Loading logs...
            </div>
          ) : emailLogs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No recent activity. Send your first email to see it here!
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-y border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Recipient</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {emailLogs.slice(0, 6).map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/60 last:border-0 hover:bg-surface-elevated/50"
                  >
                    <td className="px-6 py-3 text-xs text-muted-foreground">{row.sentAt}</td>
                    <td className="px-6 py-3 font-mono text-xs">{row.to}</td>
                    <td className="px-6 py-3">{row.subject}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function SendTestEmailButton() {
  const apiUrl = import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`
    : "https://api.novamail.app/v1/email";

  const [open, setOpen] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Test email from NovaMail");
  const [body, setBody] = useState(
    "<h1>It works!</h1><p>This is a test email sent from your NovaMail dashboard.</p>",
  );
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const handleSend = async () => {
    if (!to.trim()) return toast.error("Enter a recipient email");
    setSending(true);
    setResult(null);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer nm_demo_public",
        },
        body: JSON.stringify({
          from: "test@novamail.app",
          to: to.trim(),
          subject: subject.trim() || "Test email from NovaMail",
          html: body,
        }),
      });
      if (res.ok) {
        setResult("success");
        toast.success("Test email sent! Check your inbox.");
      } else {
        setResult("error");
        toast.error("Send failed — check your API key and domain settings.");
      }
    } catch {
      setResult("error");
      toast.error("Network error — couldn't reach the API.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setResult(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Send className="mr-1.5 h-4 w-4" /> Send test email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send a test email</DialogTitle>
          <DialogDescription>
            Fire a real email through your NovaMail account to verify everything is wired up.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="test-to" className="mb-1.5 block">
              To
            </Label>
            <Input
              id="test-to"
              type="email"
              placeholder="you@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="test-subject" className="mb-1.5 block">
              Subject
            </Label>
            <Input id="test-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="test-body" className="mb-1.5 block">
              HTML body
            </Label>
            <textarea
              id="test-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border/60 bg-background/80 p-3 font-mono text-xs leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            />
          </div>
          {result === "success" && (
            <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
              <Check className="h-4 w-4" />
              Delivered! Check your inbox.
            </div>
          )}
          {result === "error" && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Send failed. Connect an API key and verify your domain to send for real.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending} className="gap-1.5">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Sending…" : "Send test"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
