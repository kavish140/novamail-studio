## NovaMail Frontend Plan

Pure frontend build (no backend wiring). All data is mocked locally so every screen looks complete and interactive.

### Design system

- Palette: Midnight Indigo — `#0a0a1a` bg, `#141432` surface, `#1e1e5a` elevated, `#4f46e5` primary accent, with an indigo glow gradient for hero/CTA.
- Typography: Space Grotesk (headings) + DM Sans (body), loaded via `<link>` in `__root.tsx`; JetBrains Mono for code blocks.
- Tokens defined in `src/styles.css` (`oklch` values) — semantic only, no raw hex in components.
- Subtle grid/aurora backgrounds, sharp 12px radius, soft indigo shadows, Motion-style fade/slide on scroll.

### Routes (TanStack Start, file-based)

```
src/routes/
  __root.tsx            (fonts, shell, Toaster)
  index.tsx             /            Landing page
  login.tsx             /login       Sign in
  signup.tsx            /signup      Create account
  docs.tsx              /docs        Quickstart + API reference
  dashboard.tsx         /dashboard   Layout (sidebar + Outlet)
  dashboard.index.tsx   /dashboard   Overview (stats, recent sends, charts)
  dashboard.keys.tsx    /dashboard/keys      API keys management
  dashboard.logs.tsx    /dashboard/logs      Email send logs table
  dashboard.domains.tsx /dashboard/domains   Domain verification UI
  dashboard.settings.tsx /dashboard/settings Profile/billing UI
```

Each route gets its own `head()` metadata (title, description, og tags).

### Page contents

**Landing (`/`)**

- Sticky transparent nav: NovaMail logo, links (Features, Docs, Pricing), Sign in + Get started CTAs.
- Hero: bold headline "Send transactional email with one API call.", subhead, primary CTA, secondary "View docs", animated code snippet card on the right showing a `curl` call to NovaMail.
- Logo strip (mock companies).
- Feature grid (3): "Instant API keys", "Reliable delivery", "Realtime logs".
- Code-in-action section: tabbed snippet (Node / Python / curl) with copy button.
- Stats band (emails sent, uptime, p50 latency).
- Pricing (3 tiers: Free, Pro, Scale).
- FAQ accordion.
- Footer with columns.

**Auth (`/login`, `/signup`)**

- Split layout: left = form card (email, password, social buttons stub), right = brand panel with gradient + tagline. No backend; submit shows toast + navigates to `/dashboard`.

**Dashboard layout**

- Left sidebar: logo, nav items (Overview, API Keys, Logs, Domains, Settings), user chip at bottom.
- Top bar: search, env switcher (Test/Live), notifications, avatar menu.
- Content area renders `<Outlet />`.

**Overview**

- 4 stat cards (Sent, Delivered, Bounced, Opens) with sparklines.
- Line chart (last 30 days) using Recharts.
- Recent activity table (last 6 sends).
- "Quick start" card with code snippet.

**API Keys**

- "Create new key" button → dialog (name, environment, permissions) → mock generated key shown once with copy + warning.
- Table of keys: name, prefix (`nm_live_••••abcd`), created, last used, actions (reveal/copy/revoke). Revoke confirm dialog.

**Logs**

- Filter bar (status, date range, search by recipient/subject).
- Table: timestamp, to, subject, status badge (delivered/bounced/queued/failed), open rate dot.
- Row click → side sheet with full email details + JSON payload preview.

**Domains**

- Add domain dialog → mock DNS records table (TXT, MX, DKIM) with copy buttons + verify button (mock pending → verified).
- List of domains with status badges.

**Settings**

- Tabs: Profile, Team, Billing, Webhooks. Editable inputs, plan card, invoices table, webhook URL field.

**Docs**

- Left ToC, right content. Sections: Introduction, Authentication, Quickstart, Send Email endpoint (request/response examples), Webhooks, Errors. Syntax-highlighted snippets with language tabs and copy.

### Mock data

A single `src/lib/mock-data.ts` exports keys, logs, stats arrays so multiple pages stay coherent.

### Components & libraries

- shadcn/ui (button, card, dialog, sheet, table, tabs, badge, input, select, dropdown, accordion, sonner) — already installed.
- `recharts` for charts, `framer-motion` for entrance animations, `lucide-react` for icons. Install only if missing.

### Out of scope

- No Supabase/Lovable Cloud, no real auth, no API key persistence, no Resend integration. All actions are local UI state + toasts. Backend can be wired later.

### Deliverable check

- All routes have unique SEO `head()`.
- All colors via semantic tokens.
- Responsive (mobile sidebar becomes drawer).
- Index placeholder removed.
