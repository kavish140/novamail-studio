import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/nova/site-header";
import { SiteFooter } from "@/components/nova/site-footer";

export const Route = createFileRoute("/legal/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <div className="mt-8 space-y-6 text-muted-foreground">
          <p>Last updated: June 2026</p>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              1. Information we collect
            </h2>
            <p>
              We collect information you provide directly to us, such as when you create an account,
              update your profile, or contact customer support. This includes your name, email
              address, and any other information you choose to provide.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              2. How we use your information
            </h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services,
              including to authenticate users, process transactions, and send related information
              such as confirmations and receipts.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Data processing</h2>
            <p>
              By using our service, you acknowledge that emails sent through NovaMail are processed
              via our infrastructure partners (including Resend) and governed by their respective
              privacy policies.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Contact us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at
              support@sitenova.dev.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
