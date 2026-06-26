import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/nova/site-header";
import { SiteFooter } from "@/components/nova/site-footer";
import { Rss, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — NovaMail" },
      {
        name: "description",
        content: "What's new in NovaMail — feature releases, improvements, and fixes.",
      },
      { property: "og:title", content: "NovaMail Changelog" },
      { property: "og:url", content: "https://mail.sitenova.dev/changelog" },
    ],
    links: [{ rel: "canonical", href: "https://mail.sitenova.dev/changelog" }],
  }),
  component: ChangelogPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type EntryTag = "new" | "improvement" | "fix" | "deprecation";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  summary: string;
  tags: EntryTag[];
  items: { tag: EntryTag; text: string }[];
}

const TAG_STYLES: Record<EntryTag, string> = {
  new: "bg-primary/15 text-primary",
  improvement: "bg-info/15 text-info",
  fix: "bg-success/15 text-success",
  deprecation: "bg-warning/15 text-warning",
};

const TAG_LABELS: Record<EntryTag, string> = {
  new: "🆕 New",
  improvement: "⚡ Improvement",
  fix: "🐛 Fix",
  deprecation: "⚠️ Deprecated",
};

// ─── Data — empty for now, real entries go here ───────────────────────────────
// To add an entry, append an object to this array following the type above.
const entries: ChangelogEntry[] = [];

// ─── Components ───────────────────────────────────────────────────────────────

function TagBadge({ tag }: { tag: EntryTag }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TAG_STYLES[tag]}`}
    >
      {TAG_LABELS[tag]}
    </span>
  );
}

function ChangelogEntryCard({ entry }: { entry: ChangelogEntry }) {
  return (
    <article className="relative pl-8 pb-12 last:pb-0">
      {/* Timeline dot + line */}
      <div className="absolute left-0 top-1.5 flex flex-col items-center">
        <div className="h-3 w-3 rounded-full border-2 border-primary bg-background ring-4 ring-primary/10" />
        <div
          className="mt-2 w-px flex-1 bg-border/60 last:hidden"
          style={{ minHeight: "calc(100% - 20px)" }}
        />
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface/40 p-6 transition hover:border-border">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">
                {entry.version}
              </span>
              <time className="text-xs text-muted-foreground">{entry.date}</time>
            </div>
            <h2 className="font-display text-xl font-semibold tracking-tight">{entry.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{entry.summary}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        </div>

        {/* Item list */}
        {entry.items.length > 0 && (
          <ul className="mt-4 space-y-2.5 border-t border-border/40 pt-4">
            {entry.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <TagBadge tag={item.tag} />
                <span className="mt-0.5">{item.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-surface/60 mb-6">
        <Sparkles className="h-7 w-7 text-primary" />
      </div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">Something's cooking.</h2>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
        The first changelog entry is on its way. Subscribe below and we'll ping you the moment it
        drops.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ChangelogPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Page header */}
      <div className="relative border-b border-border/60">
        <div className="absolute inset-0 bg-aurora opacity-40" />
        <div className="relative mx-auto max-w-3xl px-6 py-16">
          <div className="flex items-center gap-2 mb-4">
            <Rss className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Changelog
            </span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            What's new in NovaMail.
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl">
            Product updates, improvements, and fixes — in reverse chronological order. Built in
            public.
          </p>

          {/* Subscribe form */}
          <form onSubmit={handleSubscribe} className="mt-6 flex gap-2 max-w-sm">
            {submitted ? (
              <div className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-2.5 text-sm text-success w-full">
                <span>✓</span>
                <span>You're subscribed! We'll email you on new releases.</span>
              </div>
            ) : (
              <>
                <input
                  id="changelog-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 rounded-xl border border-border/60 bg-surface/60 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-auto py-2.5"
                >
                  Subscribe
                </Button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Entries or empty state */}
      <div className="mx-auto max-w-3xl px-6 py-16">
        {entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-0">
            {entries.map((entry) => (
              <ChangelogEntryCard key={entry.version} entry={entry} />
            ))}
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
