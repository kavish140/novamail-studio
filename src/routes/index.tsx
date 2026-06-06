import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Code2, Gauge, Globe2, KeyRound, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { SiteHeader } from "@/components/nova/site-header";
import { SiteFooter } from "@/components/nova/site-footer";
import { CodeBlock } from "@/components/nova/code-block";
import { CodeTabs } from "@/components/nova/code-tabs";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { codeSnippets } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NovaMail — Transactional email API for developers" },
      { name: "description", content: "Generate an API key, drop in three lines of code, and send transactional email at any scale. Built for engineering teams who ship." },
      { property: "og:title", content: "NovaMail — Transactional email API" },
      { property: "og:description", content: "Send automated email with a single API call. Built for developers." },
    ],
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
      <CodeShowcase />
      <Stats />
      <Pricing />
      <Faq />
      <CtaBand />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-aurora" />
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1.05fr_1fr] lg:py-32">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            v2.0 — Streaming webhooks now in public beta
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Send transactional <br />
            email with <span className="text-gradient">one API call.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            NovaMail is the email API your engineers will actually like. Generate a key, paste three lines of code, and ship reliable delivery to a million inboxes by Friday.
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
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> 3,000 free emails / mo</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> SOC 2 Type II</span>
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary/30 via-accent/20 to-transparent blur-3xl" />
          <CodeBlock filename="terminal" language="bash" code={codeSnippets.curl} className="glow" />
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

function LogoStrip() {
  const logos = ["HELIX", "VERTEX", "NORTHWIND", "FERMION", "PARALLAX", "ATLAS·IO"];
  return (
    <section className="border-y border-border/60 bg-surface/30">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">Trusted by teams shipping at scale</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-70">
          {logos.map((l) => (
            <span key={l} className="font-display text-lg font-semibold tracking-[0.2em] text-muted-foreground">{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: KeyRound, title: "Instant API keys", body: "Spin up scoped, revocable keys per environment in one click. Per-key rate limits and IP allowlists included." },
  { icon: Zap, title: "Reliable delivery", body: "Auto-warmed dedicated IP pools, smart retries, and bounce handling tuned by ML on billions of sends." },
  { icon: Gauge, title: "Realtime logs", body: "Every event — sent, opened, clicked, bounced — streamed to your dashboard and webhooks within 100ms." },
  { icon: Code2, title: "First-class SDKs", body: "Hand-crafted libraries for Node, Python, Go, Ruby, PHP, and Elixir. All open source, all MIT." },
  { icon: Globe2, title: "Global edge", body: "Send from 14 regions automatically. Your customers in Tokyo get a Tokyo egress." },
  { icon: ShieldCheck, title: "Built for compliance", body: "SOC 2 Type II, GDPR, HIPAA-ready. Bring your own KMS keys for full encryption control." },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead eyebrow="Features" title="Everything you need. Nothing you don't." subtitle="A focused email platform that gets out of your way." />
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

function SectionHead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</div>
      <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
      <p className="mt-4 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function CodeShowcase() {
  return (
    <section className="relative border-y border-border/60 bg-surface/30 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Developer experience</div>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Three lines. <br /> Production-ready.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            No deliverability consultants. No DNS therapy sessions. Add the SDK, paste your key, and watch real opens stream into your dashboard.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {["Typed SDKs with autocomplete for every parameter", "Idempotency keys built in — safe retries by default", "Live test mode that mirrors production exactly"].map((p) => (
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

function Stats() {
  const stats = [
    { v: "12B+", l: "emails sent / year" },
    { v: "99.999%", l: "API uptime" },
    { v: "84ms", l: "median send latency" },
    { v: "14", l: "global regions" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="bg-background p-8 text-center">
            <div className="font-display text-4xl font-semibold tracking-tight text-gradient">{s.v}</div>
            <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const plans = [
  { name: "Hobby", price: "$0", desc: "For side projects and prototypes.", features: ["3,000 emails / month", "1 custom domain", "7-day log retention", "Community support"], cta: "Start free" },
  { name: "Pro", price: "$29", desc: "For startups shipping every week.", features: ["100,000 emails / month", "10 custom domains", "30-day log retention", "Webhook subscriptions", "Email support"], cta: "Start 14-day trial", featured: true },
  { name: "Scale", price: "Custom", desc: "For high-volume senders.", features: ["Volume pricing from $0.0003 / email", "Dedicated IP pools", "365-day log retention", "Bring your own KMS", "24/7 priority support"], cta: "Talk to sales" },
];

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHead eyebrow="Pricing" title="Pay for what you send." subtitle="Transparent, volume-friendly pricing. Cancel anytime." />
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
              <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Most popular</span>
            )}
            <div className="text-sm text-muted-foreground">{p.name}</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-5xl font-semibold tracking-tight">{p.price}</span>
              {p.price !== "Custom" && <span className="text-sm text-muted-foreground">/ month</span>}
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
    </section>
  );
}

function Faq() {
  const items = [
    { q: "How long does it take to start sending?", a: "About four minutes. Sign up, verify your sending domain with the DNS records we generate, paste your API key into your code, and send. Most teams are live before their coffee gets cold." },
    { q: "Do you support marketing emails?", a: "NovaMail is built for transactional and operational email — receipts, password resets, magic links, alerts. We don't do marketing blasts." },
    { q: "Can I bring my own dedicated IP?", a: "Yes. Scale customers can warm dedicated IPs from any of our 14 regions, with smart routing back to shared pools during low-volume periods." },
    { q: "What happens if I exceed my plan limits?", a: "Nothing breaks. We page you (and your team) when you cross 80%, and overage is billed at your plan's per-email rate. No surprises." },
    { q: "Is NovaMail SOC 2 compliant?", a: "Yes, SOC 2 Type II. We're also GDPR-compliant and HIPAA-ready under signed BAA for Scale customers." },
  ];
  return (
    <section id="faq" className="border-t border-border/60 bg-surface/20 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHead eyebrow="FAQ" title="Questions, answered." subtitle="Still curious? Email kavishganatra5@gmail.com — a human will reply." />
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

function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface p-14 text-center">
        <div className="absolute inset-0 bg-aurora opacity-80" />
        <div className="relative">
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Your first email is one minute away.</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Create a free NovaMail account and send your first transactional email before this page finishes scrolling.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="glow">
              <Link to="/signup">Create free account <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
