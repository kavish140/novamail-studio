import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  Check,
  Code2,
  Gauge,
  Globe2,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Zap,
  Send,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { SiteHeader } from "@/components/nova/site-header";
import { SiteFooter } from "@/components/nova/site-footer";
import { CodeBlock } from "@/components/nova/code-block";
import { CodeTabs } from "@/components/nova/code-tabs";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getCodeSnippets } from "@/lib/mock-data";
import { useState, useRef, useEffect, useCallback } from "react";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "NovaMail — Transactional email API for developers" },
      {
        name: "description",
        content:
          "Generate an API key, drop in three lines of code, and send transactional email at any scale. Built for engineering teams who ship.",
      },
      { property: "og:title", content: "NovaMail — Transactional email API" },
      {
        property: "og:description",
        content: "Send automated email with a single API call. Built for developers.",
      },
      { property: "og:url", content: "https://mail.sitenova.dev/" },
    ],
    links: [{ rel: "canonical", href: "https://mail.sitenova.dev/" }],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <CodeShowcase />
      <MigrationSection />
      <Stats />
      <Pricing />
      <Faq />
      <CtaBand />
      <SiteFooter />
    </div>
  );
}

// ─── Live code demo widget ────────────────────────────────────────────────────

function LiveCodeDemo() {
  const apiUrl = import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`
    : "https://api.novamail.app/v1/email";

  const [to, setTo] = useState("ada@lovelace.dev");
  const [subject, setSubject] = useState("Hello from NovaMail");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const curlCommand = `curl ${apiUrl} \\
  -H "Authorization: Bearer nm_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "hello@sitenova.dev",
    "to": "${to || "recipient@example.com"}",
    "subject": "${subject || "Your subject here"}",
    "html": "<strong>It works!</strong>"
  }'`;

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Public demo — uses a server-side anonymous key
          Authorization: "Bearer nm_demo_public",
        },
        body: JSON.stringify({
          from: "hello@sitenova.dev",
          to: to || "demo@novamail.app",
          subject: subject || "Hello from NovaMail",
          html: "<strong>It works! Sent from the NovaMail live demo.</strong>",
        }),
      });
      setResult(res.ok ? "success" : "error");
    } catch {
      setResult("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-surface/60 overflow-hidden">
      {/* Input fields */}
      <div className="p-4 space-y-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground w-14 shrink-0">To</label>
          <input
            id="demo-to"
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            className="flex-1 bg-background/60 border border-border/50 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground w-14 shrink-0">Subject</label>
          <input
            id="demo-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Your subject line"
            className="flex-1 bg-background/60 border border-border/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          />
        </div>
      </div>

      {/* Live curl command */}
      <div className="bg-background/80 p-4 font-mono text-xs leading-relaxed text-muted-foreground overflow-x-auto whitespace-pre">
        {curlCommand}
      </div>

      {/* Send button + result */}
      <div className="p-3 border-t border-border/40 flex items-center gap-3">
        <Button
          id="demo-send-btn"
          onClick={handleSend}
          disabled={sending}
          size="sm"
          className="glow gap-2"
        >
          {sending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {sending ? "Sending…" : "Send it"}
        </Button>
        {result === "success" && (
          <span className="flex items-center gap-1.5 text-xs text-success animate-fade-up">
            <Check className="h-3.5 w-3.5" /> Delivered! Check the logs.
          </span>
        )}
        {result === "error" && (
          <span className="text-xs text-muted-foreground animate-fade-up">
            Connect your key to send for real.
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated aurora background */}
      <div className="absolute inset-0 bg-aurora" />
      <div className="absolute inset-0 bg-grid opacity-50" />
      {/* Floating orbs */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-20 right-0 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[80px]" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1.05fr_1fr] lg:py-32">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            v2.0 — Streaming webhooks now in public beta
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            The email API for <br />
            indie <span className="text-gradient">builders.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            3,000 free emails/mo — no daily cap, no credit card, no sales call. Generate a key,
            paste three lines of code, and ship.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="glow">
              <Link to="/signup">
                Start sending free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/docs">Read the docs</Link>
            </Button>
          </div>
          <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> 3,000 free / mo — no daily cap
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> No credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" /> SOC 2 Type II
            </span>
          </div>
        </div>

        {/* Live code demo */}
        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary/30 via-accent/20 to-transparent blur-3xl" />
          <LiveCodeDemo />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <MiniStat label="p50 latency" value="84ms" />
            <MiniStat label="Delivery" value="99.98%" />
            <MiniStat label="Uptime" value="99.999%" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface/70 p-3 text-center">
      <div className="font-display text-lg font-semibold">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

// ─── Logo strip ───────────────────────────────────────────────────────────────

function LogoStrip() {
  const logos = ["HELIX", "VERTEX", "NORTHWIND", "FERMION", "PARALLAX", "ATLAS·IO"];
  return (
    <section className="border-y border-border/60 bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by teams shipping at scale
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-70">
          {logos.map((l) => (
            <span
              key={l}
              className="font-display text-lg font-semibold tracking-[0.2em] text-muted-foreground"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: KeyRound,
    title: "Instant API keys",
    body: "Spin up scoped, revocable keys per environment in one click. Per-key rate limits and IP allowlists included.",
  },
  {
    icon: Zap,
    title: "Reliable delivery",
    body: "Auto-warmed dedicated IP pools, smart retries, and bounce handling tuned by ML on billions of sends.",
  },
  {
    icon: Gauge,
    title: "Realtime logs",
    body: "Every event — sent, opened, clicked, bounced — streamed to your dashboard and webhooks within 100ms.",
  },
  {
    icon: Code2,
    title: "First-class SDKs",
    body: "Hand-crafted libraries for Node, Python, Go, Ruby, PHP, and Elixir. All open source, all MIT.",
  },
  {
    icon: Globe2,
    title: "Global edge",
    body: "Send from 14 regions automatically. Your customers in Tokyo get a Tokyo egress.",
  },
  {
    icon: ShieldCheck,
    title: "Built for compliance",
    body: "SOC 2 Type II, GDPR, HIPAA-ready. Bring your own KMS keys for full encryption control.",
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead
        eyebrow="Features"
        title="Everything you need. Nothing you don't."
        subtitle="A focused email platform that gets out of your way."
      />
      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="bg-background p-7 transition hover:bg-surface/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const howSteps = [
  {
    num: "01",
    title: "Make the API call",
    body: "POST to /v1/email with your key in the Authorization header. Any language, any framework.",
    color: "from-primary/30 to-primary/5",
  },
  {
    num: "02",
    title: "We queue & deliver",
    body: "NovaMail routes your email through the nearest region, warms IPs, and retries on transient failures.",
    color: "from-accent/30 to-accent/5",
  },
  {
    num: "03",
    title: "Webhooks fire instantly",
    body: "email.delivered, email.opened, email.bounced — signed payloads hit your endpoint within 100ms.",
    color: "from-info/30 to-info/5",
  },
  {
    num: "04",
    title: "Observe in your dashboard",
    body: "Every send, open, click, and bounce is in your logs. Filter, search, and drill into event timelines.",
    color: "from-success/30 to-success/5",
  },
];

function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative border-y border-border/60 bg-surface/20 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="How it works"
          title="Four steps from zero to inbox."
          subtitle="No deliverability consultants. No DNS therapy sessions."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {howSteps.map((step, i) => (
            <div
              key={step.num}
              className="relative flex flex-col rounded-2xl border border-border/60 bg-background p-6 transition"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`,
              }}
            >
              {/* connector arrow (desktop) */}
              {i < howSteps.length - 1 && (
                <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground">
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
              <div
                className={`h-10 w-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}
              >
                <span className="font-mono text-xs font-bold text-foreground">{step.num}</span>
              </div>
              <h3 className="font-display text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Code Showcase ────────────────────────────────────────────────────────────

function CodeShowcase() {
  return (
    <section className="relative border-b border-border/60 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Developer experience
          </div>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Three lines. <br /> Production-ready.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            No deliverability consultants. No DNS therapy sessions. Add the SDK, paste your key, and
            watch real opens stream into your dashboard.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Typed SDKs with autocomplete for every parameter",
              "Idempotency keys built in — safe retries by default",
              "Detailed email delivery logs",
            ].map((p) => (
              <li key={p} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-success" />
                <span className="text-muted-foreground">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <CodeTabs />
      </div>
    </section>
  );
}

// ─── Migration from Resend ────────────────────────────────────────────────────

function MigrationSection() {
  const apiUrl = import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`
    : "https://api.novamail.app/v1/email";

  const resendCode = `import { Resend } from 'resend';
const resend = new Resend('re_live_••••••••');

await resend.emails.send({
  from: 'hello@acme.com',
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<b>Hello world</b>',
});`;

  const novamailCode = `import fetch from 'node-fetch';

await fetch('${apiUrl}', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer nm_live_••••••••',
             'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'hello@acme.com',
    to: 'user@example.com',
    subject: 'Welcome!',
    html: '<b>Hello world</b>',
  }),
});`;

  return (
    <section className="border-y border-border/60 bg-surface/20 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="Migration"
          title="Switch from Resend in 5 minutes."
          subtitle="If you know Resend, you already know NovaMail. The API surface is nearly identical."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">
                Before — Resend
              </span>
            </div>
            <CodeBlock filename="send-email.js" language="javascript" code={resendCode} />
          </div>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                After — NovaMail
              </span>
              <span className="text-xs text-muted-foreground">2-line diff</span>
            </div>
            <CodeBlock filename="send-email.js" language="javascript" code={novamailCode} />
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Same REST structure",
              desc: "Identical JSON body shape — swap the URL and key.",
            },
            {
              label: "Same webhook events",
              desc: "email.delivered, .opened, .bounced — no handler rewrites.",
            },
            {
              label: "100k emails for $29",
              desc: "Resend Pro caps at 50k for $20. We cover 100k at $29.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border/60 bg-background p-4 flex items-start gap-3"
            >
              <Check className="mt-0.5 h-4 w-4 text-success shrink-0" />
              <div>
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button asChild size="lg" className="glow">
            <Link to="/signup">
              Migrate now — free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── Animated Stats ───────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function AnimatedStat({
  value,
  label,
  suffix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const count = useCountUp(value, 1600, visible);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-background p-8 text-center">
      <div className="font-display text-4xl font-semibold tracking-tight text-gradient">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatedStat value={12} suffix="B+" label="emails sent / year" />
        <AnimatedStat value={99999} suffix="%" label="API uptime" />
        <AnimatedStat value={84} suffix="ms" label="median send latency" />
        <AnimatedStat value={14} label="global regions" />
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Hobby",
    price: "$0",
    desc: "For side projects and prototypes.",
    features: [
      "3,000 emails / month",
      "No daily send cap",
      "1 custom domain",
      "7-day log retention",
      "Community support",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$29",
    desc: "For startups shipping every week.",
    features: [
      "100,000 emails / month",
      "10 custom domains",
      "30-day log retention",
      "Webhook subscriptions",
      "Template manager",
      "Email support",
    ],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Scale",
    price: "Custom",
    desc: "For high-volume senders.",
    features: [
      "Volume pricing from $0.0003 / email",
      "Dedicated IP pools",
      "365-day log retention",
      "Bring your own KMS",
      "24/7 priority support",
    ],
    cta: "Talk to sales",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead
        eyebrow="Pricing"
        title="Pay for what you send."
        subtitle="Transparent, volume-friendly pricing. Cancel anytime."
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={
              "relative rounded-2xl border bg-surface/60 p-8 transition " +
              (p.featured ? "border-primary/60 glow" : "border-border/60 hover:border-border")
            }
          >
            {p.featured && (
              <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Most popular
              </span>
            )}
            <div className="text-sm text-muted-foreground">{p.name}</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-5xl font-semibold tracking-tight">{p.price}</span>
              {p.price !== "Custom" && (
                <span className="text-sm text-muted-foreground">/ month</span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            <Button asChild className="mt-6 w-full" variant={p.featured ? "default" : "outline"}>
              <Link to="/signup">{p.cta}</Link>
            </Button>
            <div className="my-6 h-px bg-border/60" />
            <ul className="space-y-3 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-success" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Compare link */}
      <div className="mt-8 text-center">
        <Link
          to="/comparison"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          See how we compare to Resend, EmailJS, and SendGrid
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

function Faq() {
  const items = [
    {
      q: "How long does it take to start sending?",
      a: "About four minutes. Sign up, verify your sending domain with the DNS records we generate, paste your API key into your code, and send. Most teams are live before their coffee gets cold.",
    },
    {
      q: "Do you support marketing emails?",
      a: "NovaMail is built for transactional and operational email — receipts, password resets, magic links, alerts. We don't do marketing blasts.",
    },
    {
      q: "Why no daily send cap on the free tier?",
      a: "Resend caps free accounts at 100 emails per day even though the monthly limit is 3,000. That's annoying if you want to test a burst. NovaMail doesn't throttle you daily — send all 3,000 whenever you need them.",
    },
    {
      q: "Can I bring my own dedicated IP?",
      a: "Yes. Scale customers can warm dedicated IPs from any of our 14 regions, with smart routing back to shared pools during low-volume periods.",
    },
    {
      q: "What happens if I exceed my plan limits?",
      a: "Nothing breaks. We page you (and your team) when you cross 80%, and overage is billed at your plan's per-email rate. No surprises.",
    },
    {
      q: "Is NovaMail SOC 2 compliant?",
      a: "Yes, SOC 2 Type II. We're also GDPR-compliant and HIPAA-ready under signed BAA for Scale customers.",
    },
  ];
  return (
    <section id="faq" className="border-t border-border/60 bg-surface/20 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHead
          eyebrow="FAQ"
          title="Questions, answered."
          subtitle="Still curious? Email kavishganatra5@gmail.com — a human will reply."
        />
        <Accordion type="single" collapsible className="mt-10">
          {items.map((it) => (
            <AccordionItem key={it.q} value={it.q} className="border-border/60">
              <AccordionTrigger className="text-left text-base">{it.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

// ─── CTA Band ────────────────────────────────────────────────────────────────

function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface p-14 text-center">
        <div className="absolute inset-0 bg-aurora opacity-80" />
        <div className="relative">
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Your first email is one minute away.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Create a free NovaMail account and send your first transactional email before this page
            finishes scrolling.
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
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function SectionHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</div>
      <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-muted-foreground">{subtitle}</p>
    </div>
  );
}
