import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/nova/site-header";
import { SiteFooter } from "@/components/nova/site-footer";
import { CodeBlock } from "@/components/nova/code-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronRight,
  ChevronDown,
  Send,
  Loader2,
  Check,
  AlertTriangle,
  BookOpen,
  Zap,
  Key,
  Globe2,
  Webhook,
  Mail,
  Code2,
  ExternalLink,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCodeSnippets } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — NovaMail API" },
      {
        name: "description",
        content:
          "Quickstart, authentication, and full API reference for the NovaMail transactional email API. Try every endpoint live in the browser.",
      },
      { property: "og:title", content: "NovaMail API Documentation" },
      {
        property: "og:description",
        content: "Everything you need to integrate NovaMail in minutes.",
      },
      { property: "og:url", content: "https://mail.sitenova.dev/docs" },
    ],
    links: [{ rel: "canonical", href: "https://mail.sitenova.dev/docs" }],
  }),
  component: DocsPage,
});

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : "https://your-project.supabase.co/functions/v1";

const SEND_URL = `${API_BASE}/send-email`;

// ─── Nav structure ────────────────────────────────────────────────────────────

interface NavSection {
  id: string;
  label: string;
  icon: typeof BookOpen;
  items: { id: string; label: string; method?: string }[];
}

const NAV: NavSection[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: Zap,
    items: [
      { id: "intro", label: "Introduction" },
      { id: "quickstart", label: "Quickstart" },
      { id: "sdks", label: "SDKs" },
    ],
  },
  {
    id: "api-reference",
    label: "API Reference",
    icon: Code2,
    items: [
      { id: "auth", label: "Authentication" },
      { id: "send-email", label: "Send email", method: "POST" },
      { id: "batch", label: "Batch send", method: "POST" },
      { id: "get-email", label: "Get email status", method: "GET" },
    ],
  },
  {
    id: "features",
    label: "Features",
    icon: Globe2,
    items: [
      { id: "webhooks", label: "Webhooks" },
      { id: "templates", label: "Templates" },
    ],
  },
  {
    id: "reference",
    label: "Reference",
    icon: BookOpen,
    items: [
      { id: "errors", label: "Errors & status codes" },
      { id: "rate-limits", label: "Rate limits" },
    ],
  },
];

const METHOD_COLOR: Record<string, string> = {
  POST: "bg-primary/15 text-primary",
  GET: "bg-success/15 text-success",
  DELETE: "bg-destructive/15 text-destructive",
  PATCH: "bg-warning/15 text-warning",
};

// ─── Persistent collapsible sidebar ───────────────────────────────────────────

function DocsSidebar({ activeId }: { activeId: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    "getting-started": true,
    "api-reference": true,
    features: true,
    reference: true,
  });

  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-24 space-y-1">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground px-2">
          Documentation
        </div>
        {NAV.map((section) => (
          <Collapsible
            key={section.id}
            open={open[section.id]}
            onOpenChange={(v) => setOpen((p) => ({ ...p, [section.id]: v }))}
          >
            <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition group">
              <section.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-left">{section.label}</span>
              {open[section.id] ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-5 mt-0.5 space-y-0.5 border-l border-border/50 pl-3">
                {section.items.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition hover:text-foreground ${
                      activeId === item.id ? "text-primary font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                    {item.method && (
                      <span
                        className={`ml-auto rounded px-1 py-0.5 text-[9px] font-bold ${METHOD_COLOR[item.method]}`}
                      >
                        {item.method}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}

        <div className="pt-4 border-t border-border/60 mt-4">
          <Link
            to="/comparison"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Compare plans
          </Link>
          <Link
            to="/dashboard/keys"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <Key className="h-3.5 w-3.5" /> Get API key
          </Link>
        </div>
      </div>
    </aside>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({
  id,
  title,
  badge,
  children,
}: {
  id: string;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5">
      <div className="flex items-center gap-3 border-b border-border/60 pb-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
        {badge}
      </div>
      {children}
    </section>
  );
}

// ─── Endpoint badge ───────────────────────────────────────────────────────────

function EndpointBadge({ method, path }: { method: string; path: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface/60 px-4 py-2.5 font-mono text-sm">
      <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${METHOD_COLOR[method]}`}>
        {method}
      </span>
      <span className="text-muted-foreground">{path}</span>
    </div>
  );
}

// ─── Param table ─────────────────────────────────────────────────────────────

function ParamTable({
  rows,
}: {
  rows: { name: string; type: string; required?: boolean; description: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <table className="w-full text-sm">
        <thead className="bg-surface/70 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5">Field</th>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-border/60 hover:bg-surface/30 transition">
              <td className="px-4 py-2.5 font-mono text-xs">
                <span className="text-foreground">{r.name}</span>
                {r.required && (
                  <span className="ml-1.5 text-[9px] font-bold text-destructive uppercase">
                    required
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-primary">{r.type}</td>
              <td className="px-4 py-2.5 text-muted-foreground text-xs">{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Multi-language code tabs ─────────────────────────────────────────────────

function LangTabs({
  snippets,
  defaultLang = "curl",
}: {
  snippets: { lang: string; label: string; filename: string; code: string }[];
  defaultLang?: string;
}) {
  return (
    <Tabs defaultValue={defaultLang}>
      <TabsList className="bg-surface/70 flex-wrap h-auto p-1 gap-0.5">
        {snippets.map((s) => (
          <TabsTrigger key={s.lang} value={s.lang} className="text-xs px-3 py-1.5">
            {s.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {snippets.map((s) => (
        <TabsContent key={s.lang} value={s.lang} className="mt-3">
          <CodeBlock filename={s.filename} language={s.lang} code={s.code} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

// ─── Try-it panel ────────────────────────────────────────────────────────────

function TryItPanel() {
  const [apiKey, setApiKey] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Hello from NovaMail");
  const [html, setHtml] = useState("<strong>It works!</strong>");
  const [from, setFrom] = useState("hello@sitenova.dev");
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<{
    ok: boolean;
    status: number;
    body: string;
  } | null>(null);

  const handleSend = async () => {
    if (!to.trim()) return toast.error("Enter a recipient email");
    setSending(true);
    setResponse(null);
    try {
      const res = await fetch(SEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim() || "nm_demo_public"}`,
        },
        body: JSON.stringify({
          from: from.trim() || "hello@sitenova.dev",
          to: to.trim(),
          subject: subject.trim(),
          html,
        }),
      });
      let body = "";
      try {
        body = JSON.stringify(await res.json(), null, 2);
      } catch {
        body = await res.text();
      }
      setResponse({ ok: res.ok, status: res.status, body });
    } catch (e: unknown) {
      setResponse({
        ok: false,
        status: 0,
        body: JSON.stringify({ error: { message: "Network error" } }, null, 2),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-surface/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-primary/5 px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-semibold text-primary">Try it — live API call</span>
      </div>

      <div className="p-5 space-y-3">
        {/* API Key */}
        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">
            API Key
          </Label>
          <Input
            id="tryit-apikey"
            type="password"
            placeholder="nm_live_•••••••• (leave blank for demo mode)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="font-mono text-xs h-8"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">
              From
            </Label>
            <Input
              id="tryit-from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="text-xs h-8"
            />
          </div>
          <div>
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">
              To
            </Label>
            <Input
              id="tryit-to"
              type="email"
              placeholder="recipient@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="text-xs h-8"
            />
          </div>
        </div>

        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">
            Subject
          </Label>
          <Input
            id="tryit-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-xs h-8"
          />
        </div>

        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 block">
            HTML body
          </Label>
          <Input
            id="tryit-html"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="font-mono text-xs h-8"
          />
        </div>

        <Button onClick={handleSend} disabled={sending} size="sm" className="w-full gap-2">
          {sending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {sending ? "Sending…" : "Send request"}
        </Button>

        {/* Response */}
        {response && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  response.ok ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                }`}
              >
                {response.ok ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {response.status || "Error"}
              </span>
              <span className="text-xs text-muted-foreground">
                {response.ok ? "Success" : "Failed"}
              </span>
            </div>
            <div className="rounded-xl border border-border/60 bg-background overflow-hidden">
              <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-foreground/90 max-h-40">
                {response.body}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SDK showcase cards ────────────────────────────────────────────────────────

const SDK_LIST = [
  { lang: "Python", pkg: "pip install novamail", color: "text-info", badge: "Official" },
];

// ─── Active section tracking ──────────────────────────────────────────────────

function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-20% 0px -70% 0px" },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, [ids]);

  return active;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function DocsPage() {
  const allIds = NAV.flatMap((s) => s.items.map((i) => i.id));
  const activeId = useActiveSection(allIds);

  const apiBase = API_BASE;
  const snippets = getCodeSnippets(SEND_URL);

  const sendSnippets = [
    { lang: "bash", label: "cURL", filename: "terminal", code: snippets.curl },
    { lang: "typescript", label: "Node.js", filename: "send-email.ts", code: snippets.node },
    { lang: "python", label: "Python", filename: "send_email.py", code: snippets.python },
    { lang: "go", label: "Go", filename: "main.go", code: snippets.go },
    { lang: "ruby", label: "Ruby", filename: "send_email.rb", code: snippets.ruby },
    { lang: "php", label: "PHP", filename: "send_email.php", code: snippets.php },
  ];

  const batchSnippets = [
    {
      lang: "bash",
      label: "cURL",
      filename: "terminal",
      code: `curl ${apiBase}/batch-email \\
  -H "Authorization: Bearer nm_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "emails": [
      { "to": "ada@lovelace.dev", "subject": "Hi Ada", "html": "<b>Hello!</b>" },
      { "to": "alan@turing.dev",  "subject": "Hi Alan", "html": "<b>Hello!</b>" }
    ],
    "from": "hello@sitenova.dev"
  }'`,
    },
    {
      lang: "typescript",
      label: "Node.js",
      filename: "batch.ts",
      code: `const res = await fetch('${apiBase}/batch-email', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer nm_live_••••••••',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'hello@sitenova.dev',
    emails: [
      { to: 'ada@lovelace.dev', subject: 'Hi Ada', html: '<b>Hello!</b>' },
      { to: 'alan@turing.dev',  subject: 'Hi Alan', html: '<b>Hello!</b>' },
    ],
  }),
});
const data = await res.json();
console.log(data);`,
    },
  ];

  const getEmailSnippets = [
    {
      lang: "bash",
      label: "cURL",
      filename: "terminal",
      code: `curl ${apiBase}/email/msg_2lQ7v8x4hKpC \\
  -H "Authorization: Bearer nm_live_••••••••"`,
    },
    {
      lang: "typescript",
      label: "Node.js",
      filename: "get-email.ts",
      code: `const res = await fetch('${apiBase}/email/msg_2lQ7v8x4hKpC', {
  headers: { 'Authorization': 'Bearer nm_live_••••••••' },
});
const email = await res.json();
console.log(email.status); // "delivered"`,
    },
  ];

  const webhookSnippets = [
    {
      lang: "typescript",
      label: "Node.js",
      filename: "webhook.ts",
      code: `import crypto from 'crypto';

// Express / Hono / any framework
app.post('/webhooks/novamail', (req, res) => {
  const sig  = req.headers['x-novamail-signature'] as string;
  const body = JSON.stringify(req.body);

  // Verify HMAC-SHA256 signature
  const expected = crypto
    .createHmac('sha256', process.env.NOVAMAIL_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (sig !== expected) return res.status(401).send('Invalid signature');

  const event = req.body;
  if (event.type === 'email.delivered') {
    console.log('Delivered:', event.data.id);
  }
  res.status(200).send('ok');
});`,
    },
    {
      lang: "python",
      label: "Python",
      filename: "webhook.py",
      code: `import hmac, hashlib, os
from flask import Flask, request, abort

app = Flask(__name__)

@app.route('/webhooks/novamail', methods=['POST'])
def webhook():
    sig = request.headers.get('X-NovaMail-Signature', '')
    body = request.get_data()
    secret = os.environ['NOVAMAIL_WEBHOOK_SECRET'].encode()

    expected = hmac.new(secret, body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected):
        abort(401)

    event = request.json
    print(f"Event: {event['type']}, ID: {event['data']['id']}")
    return 'ok', 200`,
    },
  ];

  const templateSnippets = [
    {
      lang: "bash",
      label: "cURL",
      filename: "terminal",
      code: `curl ${apiBase}/send-email \\
  -H "Authorization: Bearer nm_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "hello@sitenova.dev",
    "to": "ada@lovelace.dev",
    "template_id": "tmpl_welcome",
    "template_data": {
      "first_name": "Ada",
      "app_name": "Acme"
    }
  }'`,
    },
    {
      lang: "typescript",
      label: "Node.js",
      filename: "template.ts",
      code: `const res = await fetch('${apiBase}/send-email', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer nm_live_••••••••',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'hello@sitenova.dev',
    to: 'ada@lovelace.dev',
    template_id: 'tmpl_welcome',
    template_data: {
      first_name: 'Ada',
      app_name: 'Acme',
    },
  }),
});`,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <div className="mx-auto flex max-w-7xl gap-10 px-6 py-14">
        {/* Persistent sidebar */}
        <DocsSidebar activeId={activeId} />

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <article className="space-y-20 max-w-3xl">
            {/* ── Introduction ── */}
            <section id="intro" className="scroll-mt-24">
              <Badge variant="secondary" className="mb-4">
                API v1
              </Badge>
              <h1 className="font-display text-4xl font-semibold tracking-tight">
                NovaMail API documentation
              </h1>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                The NovaMail API is a REST API that lets you send transactional email from any
                language that can make an HTTPS request. All endpoints are versioned and live under{" "}
                <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
                  {apiBase}
                </code>
                .
              </p>

              {/* Quick links */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: Zap,
                    title: "Quickstart",
                    desc: "Send your first email in 3 minutes",
                    href: "#quickstart",
                  },
                  {
                    icon: Key,
                    title: "API Keys",
                    desc: "Create scoped keys and rotate safely",
                    href: "/dashboard/keys",
                  },
                  {
                    icon: Webhook,
                    title: "Webhooks",
                    desc: "Subscribe to delivery lifecycle events",
                    href: "#webhooks",
                  },
                ].map((card) => (
                  <a
                    key={card.title}
                    href={card.href}
                    className="group rounded-xl border border-border/60 bg-surface/40 p-4 transition hover:border-primary/40"
                  >
                    <card.icon className="h-5 w-5 text-primary mb-2" />
                    <div className="text-sm font-semibold">{card.title}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
                  </a>
                ))}
              </div>
            </section>

            {/* ── Quickstart ── */}
            <Section id="quickstart" title="Quickstart">
              <p className="text-muted-foreground">Four steps from zero to inbox.</p>
              <ol className="ml-5 list-decimal space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/dashboard/domains" className="text-primary hover:underline">
                    Verify a sending domain
                  </Link>{" "}
                  — add the DNS records we generate and wait ~60 seconds.
                </li>
                <li>
                  <Link to="/dashboard/keys" className="text-primary hover:underline">
                    Create an API key
                  </Link>{" "}
                  — scoped, revocable, with optional IP allowlists.
                </li>
                <li>Install the SDK or call the REST endpoint directly.</li>
                <li>Send your first email — it should arrive within 3 seconds.</li>
              </ol>
              <LangTabs snippets={sendSnippets} defaultLang="bash" />
            </Section>

            {/* ── SDKs ── */}
            <Section id="sdks" title="SDKs">
              <p className="text-muted-foreground">
                Our official Python SDK is open source (MIT), fully typed, and auto-published to
                PyPI on every API release.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SDK_LIST.map((sdk) => (
                  <div
                    key={sdk.lang}
                    className="rounded-xl border border-border/60 bg-surface/40 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${sdk.color}`}>{sdk.lang}</span>
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
                        {sdk.badge}
                      </span>
                    </div>
                    <CodeBlock
                      code={sdk.pkg}
                      language="bash"
                      className="border-0 bg-background/60 text-xs"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Want a language-specific deep dive?{" "}
                <Link to="/sdks" className="text-primary hover:underline">
                  Visit the SDK showcase →
                </Link>
              </p>
            </Section>

            {/* ── Authentication ── */}
            <Section
              id="auth"
              title="Authentication"
              badge={
                <Badge variant="secondary" className="font-mono text-xs">
                  Bearer
                </Badge>
              }
            >
              <p className="text-muted-foreground">
                NovaMail authenticates requests with a{" "}
                <code className="text-foreground">Bearer</code> API key in the{" "}
                <code className="text-foreground">Authorization</code> header. Create a key from the{" "}
                <Link to="/dashboard/keys" className="text-primary hover:underline">
                  API Keys
                </Link>{" "}
                page.
              </p>
              <CodeBlock
                filename="terminal"
                language="bash"
                code={`curl ${apiBase}/send-email \\
  -H "Authorization: Bearer nm_live_••••••••" \\
  -H "Content-Type: application/json"`}
              />
              <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Never expose your API key in browser JavaScript. NovaMail is a server-side only
                  API. Keys found in public repositories will be automatically revoked.
                </span>
              </div>
            </Section>

            {/* ── Send email ── */}
            <Section
              id="send-email"
              title="Send email"
              badge={
                <span className="rounded px-2 py-0.5 text-xs font-bold bg-primary/15 text-primary">
                  POST
                </span>
              }
            >
              <EndpointBadge method="POST" path={`${apiBase}/send-email`} />
              <p className="text-muted-foreground">
                Sends a single transactional email. Returns a message object with an ID you can use
                to poll delivery status or match against webhook events.
              </p>

              <h3 className="font-display text-base font-semibold">Request body</h3>
              <ParamTable
                rows={[
                  {
                    name: "from",
                    type: "string",
                    required: true,
                    description: "Verified sender address.",
                  },
                  {
                    name: "to",
                    type: "string | string[]",
                    required: true,
                    description: "One or more recipient addresses.",
                  },
                  {
                    name: "subject",
                    type: "string",
                    required: true,
                    description: "Subject line, max 998 chars.",
                  },
                  {
                    name: "html",
                    type: "string",
                    description: "HTML body. Required if text is omitted.",
                  },
                  {
                    name: "text",
                    type: "string",
                    description: "Plain-text body. Required if html is omitted.",
                  },
                  { name: "reply_to", type: "string", description: "Optional reply-to address." },
                  {
                    name: "template_id",
                    type: "string",
                    description: "Reference a saved template instead of html/text.",
                  },
                  {
                    name: "template_data",
                    type: "object",
                    description: "Variables injected into the template.",
                  },
                  { name: "headers", type: "object", description: "Optional custom SMTP headers." },
                  {
                    name: "attachments",
                    type: "Attachment[]",
                    description: "Optional. Max 25 MB combined.",
                  },
                  {
                    name: "scheduled_at",
                    type: "ISO 8601 string",
                    description: "Schedule delivery up to 72h in the future.",
                  },
                  {
                    name: "idempotency_key",
                    type: "string",
                    description: "Recommended. Safe retry token (UUID).",
                  },
                ]}
              />

              <h3 className="font-display text-base font-semibold">Response</h3>
              <CodeBlock
                filename="200 OK"
                language="json"
                code={`{
  "id": "msg_2lQ7v8x4hKpC",
  "to": "ada@lovelace.dev",
  "status": "queued",
  "created_at": "2026-06-06T09:42:11Z"
}`}
              />

              <h3 className="font-display text-base font-semibold">Code examples</h3>
              <LangTabs snippets={sendSnippets} defaultLang="bash" />

              {/* Try-it panel */}
              <TryItPanel />
            </Section>

            {/* ── Batch send ── */}
            <Section
              id="batch"
              title="Batch send"
              badge={
                <span className="rounded px-2 py-0.5 text-xs font-bold bg-primary/15 text-primary">
                  POST
                </span>
              }
            >
              <EndpointBadge method="POST" path={`${apiBase}/batch-email`} />
              <p className="text-muted-foreground">
                Send up to{" "}
                <strong className="text-foreground">100 emails in a single API call</strong>. Each
                item in the <code>emails</code> array can have its own <code>to</code>,{" "}
                <code>subject</code>, <code>html</code>, and <code>template_data</code> — useful for
                transactional blasts (order confirmations, digest emails).
              </p>
              <h3 className="font-display text-base font-semibold">Request body</h3>
              <ParamTable
                rows={[
                  {
                    name: "from",
                    type: "string",
                    required: true,
                    description: "Verified sender. Applies to all messages.",
                  },
                  {
                    name: "emails",
                    type: "EmailItem[]",
                    required: true,
                    description: "Array of up to 100 email objects.",
                  },
                  {
                    name: "emails[].to",
                    type: "string",
                    required: true,
                    description: "Recipient address for this item.",
                  },
                  {
                    name: "emails[].subject",
                    type: "string",
                    required: true,
                    description: "Subject for this item.",
                  },
                  {
                    name: "emails[].html",
                    type: "string",
                    description: "HTML body for this item.",
                  },
                  {
                    name: "emails[].template_id",
                    type: "string",
                    description: "Template ID for this item.",
                  },
                  {
                    name: "emails[].template_data",
                    type: "object",
                    description: "Template variables for this item.",
                  },
                ]}
              />
              <h3 className="font-display text-base font-semibold">Code examples</h3>
              <LangTabs snippets={batchSnippets} defaultLang="bash" />
            </Section>

            {/* ── Get email status ── */}
            <Section
              id="get-email"
              title="Get email status"
              badge={
                <span className="rounded px-2 py-0.5 text-xs font-bold bg-success/15 text-success">
                  GET
                </span>
              }
            >
              <EndpointBadge method="GET" path={`${apiBase}/email/:id`} />
              <p className="text-muted-foreground">
                Retrieve the current delivery status and event history for a single message by its
                ID.
              </p>
              <h3 className="font-display text-base font-semibold">Response</h3>
              <CodeBlock
                filename="200 OK"
                language="json"
                code={`{
  "id": "msg_2lQ7v8x4hKpC",
  "to": "ada@lovelace.dev",
  "from": "hello@sitenova.dev",
  "subject": "Welcome to Acme",
  "status": "delivered",
  "opens": 3,
  "clicks": 1,
  "created_at": "2026-06-06T09:42:11Z",
  "delivered_at": "2026-06-06T09:42:14Z",
  "events": [
    { "type": "queued",    "timestamp": "2026-06-06T09:42:11Z" },
    { "type": "delivered", "timestamp": "2026-06-06T09:42:14Z" },
    { "type": "opened",    "timestamp": "2026-06-06T09:42:58Z" }
  ]
}`}
              />
              <h3 className="font-display text-base font-semibold">Code examples</h3>
              <LangTabs snippets={getEmailSnippets} defaultLang="bash" />
            </Section>

            {/* ── Webhooks ── */}
            <Section id="webhooks" title="Webhooks">
              <p className="text-muted-foreground">
                Subscribe to lifecycle events —{" "}
                <code className="text-foreground">email.delivered</code>,{" "}
                <code className="text-foreground">email.opened</code>,{" "}
                <code className="text-foreground">email.clicked</code>,{" "}
                <code className="text-foreground">email.bounced</code> — and we'll POST signed
                payloads to your endpoint within 100ms of the event occurring.
              </p>

              <h3 className="font-display text-base font-semibold">Payload shape</h3>
              <CodeBlock
                filename="webhook payload"
                language="json"
                code={`{
  "id": "evt_7xK2p9mNq4",
  "type": "email.delivered",
  "created_at": "2026-06-06T09:42:14Z",
  "data": {
    "id": "msg_2lQ7v8x4hKpC",
    "to": "ada@lovelace.dev",
    "delivered_at": "2026-06-06T09:42:14Z"
  }
}`}
              />

              <h3 className="font-display text-base font-semibold">Signature verification</h3>
              <p className="text-muted-foreground text-sm">
                Every webhook is signed with an <code>X-NovaMail-Signature</code> header
                (HMAC-SHA256). Always verify the signature before processing an event.
              </p>
              <LangTabs snippets={webhookSnippets} defaultLang="typescript" />
            </Section>

            {/* ── Templates ── */}
            <Section id="templates" title="Templates">
              <p className="text-muted-foreground">
                Create reusable HTML templates from the{" "}
                <Link to="/dashboard/templates" className="text-primary hover:underline">
                  Templates dashboard
                </Link>{" "}
                and reference them by ID in your API calls. Use{" "}
                <code className="text-foreground">{"{{variable}}"}</code> syntax for dynamic
                content.
              </p>
              <h3 className="font-display text-base font-semibold">Using a template</h3>
              <LangTabs snippets={templateSnippets} defaultLang="bash" />
              <h3 className="font-display text-base font-semibold">Available variables</h3>
              <ParamTable
                rows={[
                  {
                    name: "template_id",
                    type: "string",
                    required: true,
                    description: "The ID of the template (e.g. tmpl_welcome).",
                  },
                  {
                    name: "template_data",
                    type: "object",
                    description: "Key-value pairs injected into {{variable}} placeholders.",
                  },
                ]}
              />
            </Section>

            {/* ── Errors ── */}
            <Section id="errors" title="Errors & status codes">
              <p className="text-muted-foreground">
                NovaMail uses standard HTTP status codes. Errors always return a structured JSON
                envelope.
              </p>
              <CodeBlock
                filename="422 Unprocessable"
                language="json"
                code={`{
  "error": {
    "type": "validation_error",
    "message": "subject must be 998 characters or fewer",
    "param": "subject"
  }
}`}
              />
              <div className="overflow-hidden rounded-xl border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-surface/70 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5">Code</th>
                      <th className="px-4 py-2.5">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["200", "Success"],
                      ["400", "Bad request — malformed JSON or missing required fields"],
                      ["401", "Unauthorized — invalid or revoked API key"],
                      ["403", "Forbidden — key doesn't have permission for this action"],
                      ["404", "Not found — message or resource ID doesn't exist"],
                      ["409", "Conflict — idempotency_key already used for a different payload"],
                      ["422", "Unprocessable — request is well-formed but validation failed"],
                      [
                        "429",
                        "Rate limit exceeded — slow down and retry after the Retry-After header",
                      ],
                      ["500", "Internal server error — retry with exponential backoff"],
                    ].map(([code, meaning]) => (
                      <tr
                        key={code}
                        className="border-t border-border/60 hover:bg-surface/30 transition"
                      >
                        <td className="px-4 py-2.5 font-mono text-xs font-semibold text-foreground">
                          {code}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* ── Rate limits ── */}
            <Section id="rate-limits" title="Rate limits">
              <p className="text-muted-foreground">
                Rate limits are enforced per API key. The response always includes{" "}
                <code className="text-foreground">X-RateLimit-*</code> headers.
              </p>
              <div className="overflow-hidden rounded-xl border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-surface/70 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5">Plan</th>
                      <th className="px-4 py-2.5">Requests / sec</th>
                      <th className="px-4 py-2.5">Burst</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Hobby (free)", "10 req/s", "50"],
                      ["Pro", "100 req/s", "500"],
                      ["Scale", "1,000 req/s", "5,000"],
                    ].map(([plan, rps, burst]) => (
                      <tr
                        key={plan}
                        className="border-t border-border/60 hover:bg-surface/30 transition"
                      >
                        <td className="px-4 py-2.5 text-xs font-medium">{plan}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-primary">{rps}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                          {burst}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <CodeBlock
                filename="Response headers"
                language="bash"
                code={`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1717668134
Retry-After: 1  # only present on 429`}
              />
            </Section>
          </article>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
