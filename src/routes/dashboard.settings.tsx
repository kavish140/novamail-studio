import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NovaMail" },
      { name: "description", content: "Manage your profile, team, billing, and webhooks." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Workspace, team, and billing configuration.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-surface/70">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card title="Profile" description="Public details associated with your workspace.">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg">AN</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">Upload photo</Button>
            </div>
            <Grid>
              <FieldRow label="Full name"><Input defaultValue="Ada Nova" /></FieldRow>
              <FieldRow label="Email"><Input type="email" defaultValue="ada@acme.dev" /></FieldRow>
              <FieldRow label="Workspace"><Input defaultValue="Acme Engineering" /></FieldRow>
              <FieldRow label="Timezone"><Input defaultValue="Europe/Berlin" /></FieldRow>
            </Grid>
            <CardFooter>
              <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card title="Team members" description="Invite teammates and manage permissions.">
            <div className="space-y-3">
              {[
                { n: "Ada Nova", e: "ada@acme.dev", r: "Owner" },
                { n: "Linus Park", e: "linus@acme.dev", r: "Admin" },
                { n: "Grace Liu", e: "grace@acme.dev", r: "Developer" },
              ].map((m) => (
                <div key={m.e} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback>{m.n.split(" ").map((s) => s[0]).join("")}</AvatarFallback></Avatar>
                    <div>
                      <div className="text-sm font-medium">{m.n}</div>
                      <div className="text-xs text-muted-foreground">{m.e}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{m.r}</Badge>
                </div>
              ))}
            </div>
            <CardFooter><Button onClick={() => toast("Invite is a demo")}>Invite member</Button></CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6 space-y-6">
          <Card title="Current plan" description="You're on the Pro plan, billed monthly.">
            <div className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/10 p-5">
              <div>
                <div className="font-display text-xl font-semibold">Pro · $29 / mo</div>
                <div className="text-sm text-muted-foreground">100,000 emails / month. Renews on July 6, 2026.</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Change plan</Button>
                <Button variant="ghost" className="text-destructive hover:text-destructive">Cancel</Button>
              </div>
            </div>
          </Card>
          <Card title="Invoices" description="Your last six billing periods.">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="py-2">Date</th><th>Amount</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-border/60">
                    <td className="py-3 text-muted-foreground">2026-0{6 - i}-06</td>
                    <td>$29.00</td>
                    <td><Badge variant="secondary" className="bg-success/15 text-success border-success/30">Paid</Badge></td>
                    <td className="text-right"><Button size="sm" variant="ghost">Download</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <Card title="Webhook endpoint" description="We'll POST signed events here when emails are delivered, opened, or bounced.">
            <FieldRow label="Endpoint URL"><Input defaultValue="https://api.acme.dev/webhooks/novamail" /></FieldRow>
            <FieldRow label="Signing secret"><Input readOnly defaultValue="whsec_••••••••••••••••" className="font-mono" /></FieldRow>
            <div className="space-y-3 pt-2">
              {[
                { id: "delivered", label: "email.delivered" },
                { id: "opened", label: "email.opened" },
                { id: "clicked", label: "email.clicked" },
                { id: "bounced", label: "email.bounced" },
              ].map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                  <span className="font-mono text-sm">{e.label}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
            <CardFooter><Button onClick={() => toast.success("Webhook saved")}>Save webhook</Button></CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-surface/60">
      <div className="border-b border-border/60 p-6">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      {children}
    </div>
  );
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 pt-2">{children}</div>;
}