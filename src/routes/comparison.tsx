import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/nova/site-header";
import { SiteFooter } from "@/components/nova/site-footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, AlertTriangle, Minus } from "lucide-react";

export const Route = createFileRoute("/comparison")({
  head: () => ({
    meta: [
      { title: "NovaMail vs Resend vs EmailJS vs SendGrid — Email API Comparison" },
      {
        name: "description",
        content:
          "Honest, verified comparison of NovaMail, Resend, EmailJS, and SendGrid. Free tier, pricing, features, and key differences for indie developers.",
      },
      { property: "og:title", content: "NovaMail vs Resend vs EmailJS vs SendGrid" },
      {
        property: "og:description",
        content:
          "Which email API should you actually use? See the real numbers, features, and pricing side by side.",
      },
      { property: "og:url", content: "https://mail.sitenova.dev/comparison" },
    ],
    links: [{ rel: "canonical", href: "https://mail.sitenova.dev/comparison" }],
  }),
  component: ComparisonPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type CellValue =
  | { type: "check" }
  | { type: "cross" }
  | { type: "warn"; note: string }
  | { type: "text"; value: string }
  | { type: "dash" };

interface ComparisonRow {
  label: string;
  sublabel?: string;
  novamail: CellValue;
  resend: CellValue;
  emailjs: CellValue;
  sendgrid: CellValue;
}

interface ComparisonSection {
  title: string;
  rows: ComparisonRow[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const sections: ComparisonSection[] = [
  {
    title: "Free Tier",
    rows: [
      {
        label: "Free emails / month",
        novamail: { type: "text", value: "3,000" },
        resend: { type: "text", value: "3,000" },
        emailjs: { type: "text", value: "200 requests" },
        sendgrid: { type: "warn", note: "60-day trial only¹" },
      },
      {
        label: "Daily send limit (free)",
        sublabel: "Hard cap per calendar day",
        novamail: { type: "text", value: "No limit" },
        resend: { type: "warn", note: "100/day hard cap" },
        emailjs: { type: "dash" },
        sendgrid: { type: "warn", note: "100/day (trial)" },
      },
      {
        label: "Credit card required",
        novamail: { type: "cross" },
        resend: { type: "cross" },
        emailjs: { type: "cross" },
        sendgrid: { type: "cross" },
      },
    ],
  },
  {
    title: "Pricing",
    rows: [
      {
        label: "Price for 50k emails/mo",
        novamail: { type: "text", value: "$29" },
        resend: { type: "text", value: "$20" },
        emailjs: { type: "warn", note: "$15 (5k req only²)" },
        sendgrid: { type: "text", value: "$19.95" },
      },
      {
        label: "Price for 100k emails/mo",
        novamail: { type: "text", value: "$29" },
        resend: { type: "warn", note: "$20 + overage" },
        emailjs: { type: "text", value: "$40" },
        sendgrid: { type: "text", value: "$34.95" },
      },
      {
        label: "Dedicated IPs available",
        novamail: { type: "text", value: "Scale plan" },
        resend: { type: "text", value: "$30/mo add-on" },
        emailjs: { type: "cross" },
        sendgrid: { type: "text", value: "Pro ($89.95/mo)" },
      },
    ],
  },
  {
    title: "Developer Experience",
    rows: [
      {
        label: "REST API (server-side)",
        novamail: { type: "check" },
        resend: { type: "check" },
        emailjs: { type: "cross" },
        sendgrid: { type: "check" },
      },
      {
        label: "API key exposure risk",
        sublabel: "Keys visible in browser source",
        novamail: { type: "text", value: "None — server only" },
        resend: { type: "text", value: "None — server only" },
        emailjs: { type: "warn", note: "⚠ Keys in browser JS" },
        sendgrid: { type: "text", value: "None — server only" },
      },
      {
        label: "SMTP relay",
        novamail: { type: "check" },
        resend: { type: "check" },
        emailjs: { type: "cross" },
        sendgrid: { type: "check" },
      },
      {
        label: "Official SDKs",
        novamail: { type: "text", value: "Node, Python, Go, Ruby, PHP, Elixir" },
        resend: { type: "text", value: "Node, Python, Go, Ruby, PHP, Elixir" },
        emailjs: { type: "text", value: "JS (browser) only" },
        sendgrid: { type: "text", value: "Node, Python, Go, PHP, Ruby, Java, C#" },
      },
      {
        label: "Idempotency keys",
        novamail: { type: "check" },
        resend: { type: "check" },
        emailjs: { type: "cross" },
        sendgrid: { type: "check" },
      },
      {
        label: "Batch sending",
        novamail: { type: "check" },
        resend: { type: "check" },
        emailjs: { type: "cross" },
        sendgrid: { type: "check" },
      },
      {
        label: "Email scheduling",
        novamail: { type: "check" },
        resend: { type: "check" },
        emailjs: { type: "cross" },
        sendgrid: { type: "check" },
      },
    ],
  },
  {
    title: "Observability",
    rows: [
      {
        label: "Realtime delivery logs",
        novamail: { type: "check" },
        resend: { type: "check" },
        emailjs: { type: "text", value: "Basic history" },
        sendgrid: { type: "check" },
      },
      {
        label: "Log retention (free plan)",
        novamail: { type: "text", value: "7 days" },
        resend: { type: "text", value: "1 day" },
        emailjs: { type: "text", value: "7 days" },
        sendgrid: { type: "text", value: "3 days" },
      },
      {
        label: "Log retention (paid plan)",
        novamail: { type: "text", value: "30d Pro / 365d Scale" },
        resend: { type: "text", value: "30 days" },
        emailjs: { type: "text", value: "30 days" },
        sendgrid: { type: "text", value: "7+ days" },
      },
      {
        label: "Webhooks (open/click/bounce)",
        novamail: { type: "check" },
        resend: { type: "check" },
        emailjs: { type: "cross" },
        sendgrid: { type: "check" },
      },
      {
        label: "Open & click tracking",
        novamail: { type: "check" },
        resend: { type: "check" },
        emailjs: { type: "text", value: "Basic analytics" },
        sendgrid: { type: "check" },
      },
    ],
  },
  {
    title: "Dashboard Features",
    rows: [
      {
        label: "Template manager",
        novamail: { type: "check" },
        resend: { type: "cross" },
        emailjs: { type: "text", value: "Limited on free" },
        sendgrid: { type: "check" },
      },
      {
        label: "Test email from UI",
        novamail: { type: "check" },
        resend: { type: "cross" },
        emailjs: { type: "check" },
        sendgrid: { type: "check" },
      },
      {
        label: "Team invites",
        novamail: { type: "check" },
        resend: { type: "check" },
        emailjs: { type: "text", value: "Professional+ only" },
        sendgrid: { type: "check" },
      },
    ],
  },
  {
    title: "Security & Compliance",
    rows: [
      {
        label: "SOC 2 Type II",
        novamail: { type: "check" },
        resend: { type: "check" },
        emailjs: { type: "cross" },
        sendgrid: { type: "check" },
      },
      {
        label: "GDPR compliant",
        novamail: { type: "check" },
        resend: { type: "check" },
        emailjs: { type: "check" },
        sendgrid: { type: "check" },
      },
      {
        label: "HIPAA ready",
        novamail: { type: "text", value: "Scale (BAA)" },
        resend: { type: "cross" },
        emailjs: { type: "cross" },
        sendgrid: { type: "text", value: "Enterprise" },
      },
      {
        label: "Custom domain verification",
        novamail: { type: "check" },
        resend: { type: "check" },
        emailjs: { type: "cross" },
        sendgrid: { type: "check" },
      },
    ],
  },
];

const footnotes = [
  "¹ SendGrid retired its permanent free plan on May 27, 2025. New accounts receive a 60-day trial with 100 emails/day.",
  "² EmailJS's $15/mo Professional plan covers only 5,000–10,000 requests/mo. $40/mo for 25k–200k requests.",
];

// ─── Cell renderer ────────────────────────────────────────────────────────────

function Cell({ value, highlight }: { value: CellValue; highlight?: boolean }) {
  const base = highlight ? "px-4 py-3 bg-primary/5 text-center" : "px-4 py-3 text-center";

  if (value.type === "check")
    return (
      <td className={base}>
        <Check className="mx-auto h-4 w-4 text-success" />
      </td>
    );
  if (value.type === "cross")
    return (
      <td className={base}>
        <X className="mx-auto h-4 w-4 text-muted-foreground/50" />
      </td>
    );
  if (value.type === "dash")
    return (
      <td className={base}>
        <Minus className="mx-auto h-4 w-4 text-muted-foreground/30" />
      </td>
    );
  if (value.type === "warn")
    return (
      <td className={base}>
        <span className="inline-flex items-center gap-1 text-xs text-warning">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          {value.note}
        </span>
      </td>
    );
  return (
    <td className={base}>
      <span
        className={`text-xs ${highlight ? "font-semibold text-foreground" : "text-muted-foreground"}`}
      >
        {value.value}
      </span>
    </td>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ComparisonPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-aurora opacity-60" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground mb-6">
            <span className="inline-block h-2 w-2 rounded-full bg-success animate-pulse" />
            Data verified June 2026 from live pricing pages
          </div>
          <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
            NovaMail vs the rest.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            An honest, side-by-side look at every feature that matters to a full-stack developer
            choosing an email API. No marketing fluff — just real numbers.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="glow">
              <Link to="/signup">
                Start free — no credit card <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/docs">Read the docs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full min-w-[680px] text-sm border-separate border-spacing-0">
            {/* Sticky column headers */}
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-surface/90 backdrop-blur px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[260px]">
                  Feature
                </th>
                {/* NovaMail — highlighted */}
                <th className="bg-primary/10 border-x border-primary/20 px-4 py-4 text-center w-[160px]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-display text-base font-semibold text-foreground">
                      NovaMail
                    </span>
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                      You are here
                    </span>
                  </div>
                </th>
                <th className="bg-surface/40 px-4 py-4 text-center w-[160px]">
                  <span className="font-display text-base font-semibold text-muted-foreground">
                    Resend
                  </span>
                </th>
                <th className="bg-surface/40 px-4 py-4 text-center w-[160px]">
                  <span className="font-display text-base font-semibold text-muted-foreground">
                    EmailJS
                  </span>
                </th>
                <th className="bg-surface/40 px-4 py-4 text-center w-[160px]">
                  <span className="font-display text-base font-semibold text-muted-foreground">
                    SendGrid
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {sections.map((section) => (
                <>
                  {/* Section header row */}
                  <tr key={`section-${section.title}`}>
                    <td
                      colSpan={5}
                      className="bg-surface/50 border-y border-border/60 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary"
                    >
                      {section.title}
                    </td>
                  </tr>
                  {section.rows.map((row, i) => (
                    <tr
                      key={`${section.title}-${i}`}
                      className="border-b border-border/40 last:border-0 hover:bg-surface/20 transition-colors"
                    >
                      {/* Feature label */}
                      <td className="sticky left-0 z-10 bg-background px-4 py-3 group-hover:bg-surface/20">
                        <div className="text-sm font-medium text-foreground">{row.label}</div>
                        {row.sublabel && (
                          <div className="text-xs text-muted-foreground mt-0.5">{row.sublabel}</div>
                        )}
                      </td>
                      {/* Data cells */}
                      <Cell value={row.novamail} highlight />
                      <Cell value={row.resend} />
                      <Cell value={row.emailjs} />
                      <Cell value={row.sendgrid} />
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footnotes */}
        <div className="mt-6 space-y-1.5">
          {footnotes.map((note) => (
            <p key={note} className="text-xs text-muted-foreground">
              {note}
            </p>
          ))}
        </div>
      </section>

      {/* Why NovaMail wins for indie devs */}
      <section className="border-y border-border/60 bg-surface/20 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary text-center">
            The indie-friendly choice
          </div>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-center sm:text-5xl">
            Why developers pick NovaMail.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "3,000 free — no daily cap",
                body: "Resend gives you 3,000 free emails too, but throttles you to 100 per day. NovaMail has no daily cap — burst when you need to.",
              },
              {
                title: "No key exposure",
                body: "EmailJS runs in the browser, which means your API key is visible to anyone who opens DevTools. NovaMail is server-side only.",
              },
              {
                title: "SendGrid killed its free tier",
                body: "As of May 2025, SendGrid no longer offers a permanent free plan. NovaMail's free tier is permanent and genuinely useful.",
              },
              {
                title: "100k emails for $29",
                body: "Resend caps its Pro plan at 50k/mo for $20. NovaMail's Pro covers 100k for $29 — almost half the per-email cost.",
              },
              {
                title: "Template manager included",
                body: "Resend has no dashboard template manager. NovaMail lets you create, preview, and reuse HTML templates without leaving the dashboard.",
              },
              {
                title: "365-day log retention at Scale",
                body: "Most providers cap logs at 30 days. NovaMail Scale keeps a full year of delivery history for compliance and debugging.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-border/60 bg-surface/60 p-6 hover:border-primary/40 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary mb-4">
                  <Check className="h-4 w-4" />
                </div>
                <h3 className="font-display text-base font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface p-14 text-center">
          <div className="absolute inset-0 bg-aurora opacity-70" />
          <div className="relative">
            <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              We know you'll switch. Start free.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              No credit card. No daily cap. 3,000 emails a month, forever. If you need more, our
              pricing is straightforward — no hidden overage surprises.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="glow">
                <Link to="/signup">
                  Create free account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/docs">Browse the docs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
