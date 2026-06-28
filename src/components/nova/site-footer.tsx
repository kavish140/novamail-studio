import { Link } from "@tanstack/react-router";
import { NovaLogo } from "./logo";

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="mb-4 text-sm font-semibold text-foreground">{title}</div>
      <ul className="space-y-2.5 text-sm text-muted-foreground">
        {items.map((it) => (
          <li key={it.label}>
            {it.href.startsWith("/") && !it.href.includes("#") ? (
              <Link to={it.href} className="transition hover:text-foreground">
                {it.label}
              </Link>
            ) : (
              <a
                href={it.href}
                className="transition hover:text-foreground"
                target={it.href.startsWith("http") ? "_blank" : undefined}
                rel={it.href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {it.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-6">
        <div className="md:col-span-2">
          <NovaLogo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            The transactional email API your engineering team will actually enjoy using.
          </p>
        </div>
        <FooterCol
          title="Product"
          items={[
            { label: "Features", href: "/#features" },
            { label: "Changelog", href: "/changelog" },
          ]}
        />
        <FooterCol
          title="Developers"
          items={[
            { label: "Documentation", href: "/docs" },
            { label: "SDKs", href: "/sdks" },
            { label: "API Reference", href: "/docs#send-email" },
            { label: "Webhooks", href: "/docs#webhooks" },
          ]}
        />
        <FooterCol
          title="Company"
          items={[
            { label: "About SiteNova", href: "https://sitenova.dev" },
            { label: "Twitter / X", href: "https://x.com/Kavish_Ganatra" },
            { label: "Instagram", href: "https://instagram.com/sitenova_web_design" },
            { label: "YouTube", href: "https://www.youtube.com/@SiteNova_Web_Design" },
            { label: "Contact", href: "mailto:support@sitenova.dev" },
          ]}
        />
        <FooterCol
          title="Legal"
          items={[
            { label: "Privacy", href: "/legal/privacy" },
            { label: "Terms", href: "/legal/terms" },
          ]}
        />
      </div>

      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NovaMail Labs, Inc. Built for developers, everywhere.
      </div>
    </footer>
  );
}
