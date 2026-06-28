import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/nova/site-header";
import { SiteFooter } from "@/components/nova/site-footer";
import { CodeBlock } from "@/components/nova/code-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Github,
  Package,
  Star,
  GitFork,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/sdks")({
  head: () => ({
    meta: [
      { title: "SDKs — NovaMail" },
      {
        name: "description",
        content:
          "Official NovaMail SDKs for Node.js, Python, Go, Ruby, PHP, and Elixir. Type-safe, auto-published, MIT licensed.",
      },
    ],
  }),
  component: SdksPage,
});

// ─── Types & data ─────────────────────────────────────────────────────────────

interface Sdk {
  lang: string;
  tagline: string;
  install: string;
  installLabel: string;
  pkg: string;
  github: string;
  stars: string;
  forks: string;
  color: string;
  bgColor: string;
  examples: { label: string; filename: string; language: string; code: string }[];
  features: string[];
}

const API_BASE = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : "https://your-project.supabase.co/functions/v1";

const SEND_URL = `${API_BASE}/send-email`;

const SDKS: Sdk[] = [
  {
    lang: "Python",
    tagline: "Async-first Python SDK with full type hints for sync and async codebases.",
    install: "pip install novamail",
    installLabel: "pip",
    pkg: "novamail",
    github: "https://github.com/novamail/novamail-python",
    stars: "874",
    forks: "62",
    color: "text-info",
    bgColor: "bg-info/10 border-info/30",
    features: [
      "Sync and async (asyncio)",
      "Full type hints (PEP 484)",
      "Django / FastAPI / Flask ready",
      "Dataclass responses",
      "Exponential backoff retries",
    ],
    examples: [
      {
        label: "Send email",
        filename: "send.py",
        language: "python",
        code: `from novamail import NovaMail

nova = NovaMail(api_key=os.environ['NOVAMAIL_API_KEY'])

result = nova.emails.send(
    from_='hello@acme.dev',
    to='ada@lovelace.dev',
    subject='Welcome to Acme!',
    html='<h1>Welcome, Ada!</h1>',
)
print('Sent:', result.id)`,
      },
      {
        label: "Async",
        filename: "async_send.py",
        language: "python",
        code: `import asyncio
from novamail import AsyncNovaMail

async def main():
    nova = AsyncNovaMail(api_key=os.environ['NOVAMAIL_API_KEY'])
    result = await nova.emails.send(
        from_='hello@acme.dev',
        to='ada@lovelace.dev',
        subject='Async send!',
        html='<p>It works.</p>',
    )
    print('Sent:', result.id)

asyncio.run(main())`,
      },
    ],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function SdksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-6 py-16 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="mb-2">
            Official SDK
          </Badge>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Python SDK</h1>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Our official Python SDK is open source (MIT), fully typed, and auto-published to PyPI on
            every API release.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button asChild size="sm">
              <Link to="/dashboard/keys">
                Get your API key <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/docs">Read the docs</Link>
            </Button>
          </div>
        </div>

        {/* SDK grid — overview cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SDKS.map((sdk) => (
            <a
              key={sdk.lang}
              href={`#sdk-${sdk.lang.toLowerCase().replace(".", "")}`}
              className={`group rounded-2xl border p-5 transition hover:scale-[1.01] ${sdk.bgColor}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className={`font-display text-lg font-semibold ${sdk.color}`}>
                    {sdk.lang}
                  </div>
                  <code className="text-[11px] text-muted-foreground">{sdk.install}</code>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5" />
                  {sdk.stars}
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{sdk.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {sdk.features.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>

        {/* SDK detail sections */}
        {SDKS.map((sdk) => {
          const anchorId = `sdk-${sdk.lang.toLowerCase().replace(".", "")}`;
          return (
            <section
              key={sdk.lang}
              id={anchorId}
              className="scroll-mt-24 space-y-6 rounded-2xl border border-border/60 bg-surface/40 p-8"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className={`font-display text-2xl font-semibold ${sdk.color}`}>
                    {sdk.lang} SDK
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground max-w-xl">{sdk.tagline}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={sdk.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background px-3 py-1.5 text-xs hover:border-border transition"
                  >
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5" /> {sdk.stars}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <GitFork className="h-3.5 w-3.5" /> {sdk.forks}
                  </span>
                </div>
              </div>

              {/* Install */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Install
                </div>
                <CodeBlock code={sdk.install} language="bash" filename={sdk.installLabel} />
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {sdk.features.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    {f}
                  </div>
                ))}
              </div>

              {/* Code examples */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Examples
                </div>
                {sdk.examples.length === 1 ? (
                  <CodeBlock
                    code={sdk.examples[0].code}
                    language={sdk.examples[0].language}
                    filename={sdk.examples[0].filename}
                  />
                ) : (
                  <Tabs defaultValue={sdk.examples[0].label}>
                    <TabsList className="bg-surface/70 h-auto p-1 gap-0.5">
                      {sdk.examples.map((ex) => (
                        <TabsTrigger
                          key={ex.label}
                          value={ex.label}
                          className="text-xs px-3 py-1.5"
                        >
                          {ex.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {sdk.examples.map((ex) => (
                      <TabsContent key={ex.label} value={ex.label} className="mt-3">
                        <CodeBlock code={ex.code} language={ex.language} filename={ex.filename} />
                      </TabsContent>
                    ))}
                  </Tabs>
                )}
              </div>

              {/* Package link */}
              <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-mono">{sdk.pkg}</span>
                <a
                  href={sdk.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  View on GitHub <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </section>
          );
        })}

        {/* CTA */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-10 text-center space-y-4">
          <h2 className="font-display text-2xl font-semibold">Missing your language?</h2>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm">
            The REST API works from any language that can make an HTTPS request. If you build a
            community SDK, we'd love to list it here.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild>
              <a href="https://github.com/novamail" target="_blank" rel="noopener noreferrer">
                <Github className="mr-1.5 h-4 w-4" /> Open an issue
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/docs">Browse REST API docs</Link>
            </Button>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
