import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/nova/site-header";
import { SiteFooter } from "@/components/nova/site-footer";

export const Route = createFileRoute("/legal/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Terms of Service</h1>
        <div className="mt-8 space-y-6 text-muted-foreground">
          <p>Last updated: June 2026</p>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using NovaMail, you agree to be bound by these Terms of Service and
              all applicable laws and regulations.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Use License</h2>
            <p>
              Permission is granted to temporarily use the materials on NovaMail's website for
              personal or commercial use. This is the grant of a license, not a transfer of title,
              and under this license you may not use the service to send spam or unsolicited
              marketing emails.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Service Limits</h2>
            <p>
              Free tier accounts are limited to 3,000 emails per month. Attempting to circumvent
              these limits by creating multiple accounts may result in account termination.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Disclaimer</h2>
            <p>
              The materials on NovaMail's website are provided on an 'as is' basis. NovaMail makes
              no warranties, expressed or implied, and hereby disclaims and negates all other
              warranties including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of intellectual
              property or other violation of rights.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
