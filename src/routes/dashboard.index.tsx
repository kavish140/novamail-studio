import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, MailCheck, MailX, MousePointerClick } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { emailLogs, spark, trendData } from "@/lib/mock-data";
import { StatusBadge } from "@/components/nova/status-badge";
import { CodeBlock } from "@/components/nova/code-block";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Overview — NovaMail" },
      { name: "description", content: "Email delivery overview, recent activity, and quick start." },
    ],
  }),
  component: Overview,
});

const stats = [
  { label: "Sent (30d)", value: "42,184", delta: "+12.4%", icon: Mail, seed: 1 },
  { label: "Delivered", value: "41,902", delta: "+12.1%", icon: MailCheck, seed: 2 },
  { label: "Bounced", value: "182", delta: "-3.2%", icon: MailX, seed: 3 },
  { label: "Open rate", value: "48.6%", delta: "+1.8%", icon: MousePointerClick, seed: 4 },
];

function Overview() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back, Ada</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's how NovaMail is performing across your workspace.</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/keys">
            Create new API key <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
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
              <div className={`text-xs ${s.delta.startsWith("-") ? "text-destructive" : "text-success"}`}>{s.delta}</div>
            </div>
            <div className="mt-3 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spark(s.seed)}>
                  <Line type="monotone" dataKey="y" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
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
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border)", borderRadius: 8 }} labelStyle={{ color: "var(--color-foreground)" }} />
                <Area type="monotone" dataKey="sent" stroke="var(--color-primary)" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="delivered" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface/60 p-6">
          <h2 className="font-display text-lg font-semibold">Quick start</h2>
          <p className="mt-1 text-xs text-muted-foreground">Send your first email in 30 seconds.</p>
          <div className="mt-4">
            <CodeBlock language="bash" filename="terminal" code={`curl https://api.novamail.app/v1/email \\\n  -H "Authorization: Bearer nm_live_••••" \\\n  -d '{"to":"you@acme.dev","subject":"Hi","html":"<b>It works</b>"}'`} />
          </div>
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link to="/docs">Open documentation</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface/60">
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Recent activity</h2>
            <p className="text-xs text-muted-foreground">Latest sends across all environments</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard/logs">View all logs →</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
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
                <tr key={row.id} className="border-b border-border/60 last:border-0 hover:bg-surface-elevated/50">
                  <td className="px-6 py-3 text-xs text-muted-foreground">{row.sentAt}</td>
                  <td className="px-6 py-3 font-mono text-xs">{row.to}</td>
                  <td className="px-6 py-3">{row.subject}</td>
                  <td className="px-6 py-3"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
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