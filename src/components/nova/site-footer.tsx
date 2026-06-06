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
              <Link to={it.href} className="transition hover:text-foreground">{it.label}</Link>
            ) : (
              <a href={it.href} className="transition hover:text-foreground">{it.label}</a>
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
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <NovaLogo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            The transactional email API your engineering team will actually enjoy using.
          </p>
        </div>
        <FooterCol title="Product" items={[
          { label: "Features", href: "/#features" },
          { label: "Pricing", href: "/#pricing" },
          { label: "Docs", href: "/docs" },
          { label: "Changelog", href: "#" },
        ]} />
        <FooterCol title="Company" items={[
          { label: "About", href: "#" },
          { label: "Customers", href: "#" },
          { label: "Careers", href: "#" },
          { label: "Contact", href: "#" },
        ]} />
        <FooterCol title="Legal" items={[
          { label: "Privacy", href: "#" },
          { label: "Terms", href: "#" },
          { label: "DPA", href: "#" },
          { label: "Security", href: "#" },
        ]} />
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NovaMail Labs, Inc. Built for developers, everywhere.
      </div>
    </footer>
  );
}