import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/nova/site-header";
import { SiteFooter } from "@/components/nova/site-footer";
import { CodeBlock } from "@/components/nova/code-block";
import { CodeTabs } from "@/components/nova/code-tabs";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — NovaMail API" },
      {
        name: "description",
        content:
          "Quickstart, authentication, and reference for the NovaMail transactional email API.",
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

const sections = [
  { id: "intro", label: "Introduction" },
  { id: "auth", label: "Authentication" },
  { id: "quickstart", label: "Quickstart" },
  { id: "send", label: "Send email" },
  { id: "webhooks", label: "Webhooks" },
  { id: "errors", label: "Errors" },
];

function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              On this page
            </div>
            <nav className="space-y-1 text-sm">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-surface hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <article className="prose-invert max-w-3xl space-y-16">
          <header id="intro">
            <Badge variant="secondary" className="mb-4">
              API v1
            </Badge>
            <h1 className="font-display text-4xl font-semibold tracking-tight">
              NovaMail API documentation
            </h1>
            <p className="mt-4 text-muted-foreground">
              The NovaMail API is a REST API that lets you send transactional email from any
              language that can make an HTTPS request. All endpoints are versioned and live under{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 text-sm">
                {import.meta.env.VITE_SUPABASE_URL
                  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
                  : "https://cbyqoakkewlvsgxwosza.supabase.co/functions/v1"}
              </code>
              .
            </p>
          </header>

          <Section id="auth" title="Authentication">
            <p className="text-muted-foreground">
              NovaMail authenticates requests with a Bearer API key. Create a key from the{" "}
              <Link
                to="/dashboard/keys"
                className="text-primary underline-offset-4 hover:underline"
              >
                API Keys
              </Link>{" "}
              page and pass it in the <code>Authorization</code> header.
            </p>
            <CodeBlock
              filename="terminal"
              language="bash"
              code={`curl ${import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1` : "https://cbyqoakkewlvsgxwosza.supabase.co/functions/v1"}/send-email \\
  -H "Authorization: Bearer nm_live_••••••••"`}
            />
            <p className="text-sm text-muted-foreground">
              Never expose your API keys in client code.
            </p>
          </Section>

          <Section id="quickstart" title="Quickstart">
            <ol className="ml-5 list-decimal space-y-2 text-muted-foreground mb-6">
              <li>Verify a sending domain on the Domains page.</li>
              <li>Create an API key.</li>
              <li>Install the SDK or call the REST endpoint directly.</li>
              <li>Send your first email.</li>
            </ol>
            <div className="mb-8">
              <h4 className="mb-3 font-display text-base font-semibold">Install the Python SDK</h4>
              <CodeBlock filename="terminal" language="bash" code="pip install novamail" />
            </div>
            <CodeTabs />
          </Section>

          <Section id="send" title="Send email — POST /v1/email">
            <p className="text-muted-foreground">
              Sends a single transactional email and returns a message id.
            </p>
            <h4 className="mt-6 font-display text-base font-semibold">Request body</h4>
            <ParamTable
              rows={[
                ["from", "string", "Required. Verified sender address."],
                ["to", "string | string[]", "Required. One or more recipient addresses."],
                ["subject", "string", "Required. Subject line, max 998 chars."],
                ["html", "string", "HTML body. Required if text is omitted."],
                ["text", "string", "Plain-text body. Required if html is omitted."],
                ["reply_to", "string", "Optional reply-to address."],
                ["headers", "object", "Optional custom headers."],
                ["attachments", "Attachment[]", "Optional. Max 25 MB combined."],
                ["idempotency_key", "string", "Recommended. Safe retry token."],
              ]}
            />
            <h4 className="mt-6 font-display text-base font-semibold">Response</h4>
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
          </Section>

          <Section id="webhooks" title="Webhooks">
            <p className="text-muted-foreground">
              Subscribe to lifecycle events — <code>email.delivered</code>,{" "}
              <code>email.opened</code>, <code>email.clicked</code>, <code>email.bounced</code> —
              and we'll POST signed payloads to your endpoint.
            </p>
            <CodeBlock
              filename="webhook payload"
              language="json"
              code={`{
  "type": "email.delivered",
  "data": {
    "id": "msg_2lQ7v8x4hKpC",
    "to": "ada@lovelace.dev",
    "delivered_at": "2026-06-06T09:42:14Z"
  }
}`}
            />
          </Section>

          <Section id="errors" title="Errors">
            <p className="text-muted-foreground">
              NovaMail uses standard HTTP status codes and returns a structured error envelope.
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
          </Section>
        </article>
      </div>
      <SiteFooter />
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-4 scroll-mt-24">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function ParamTable({ rows }: { rows: [string, string, string][] }) {
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
            <tr key={r[0]} className="border-t border-border/60">
              <td className="px-4 py-2.5 font-mono text-xs text-foreground">{r[0]}</td>
              <td className="px-4 py-2.5 font-mono text-xs text-primary">{r[1]}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
