import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useUser, useTeams, useWebhooks } from "@/hooks/use-supabase";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Settings — NovaMail" },
      { name: "description", content: "Manage your profile, team, and webhooks." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: user } = useUser();
  const { data: teams } = useTeams();
  const { data: webhooks } = useWebhooks();
  
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.substring(0, 2).toUpperCase() || "AN";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Workspace, team, and webhook configuration.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-surface/70">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card title="Profile" description="Public details associated with your workspace.">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg">{initials}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={() => toast("Photo upload is disabled in demo")}>Upload photo</Button>
            </div>
            <Grid>
              <FieldRow label="Full name"><Input defaultValue={user?.name || ""} /></FieldRow>
              <FieldRow label="Email"><Input type="email" disabled defaultValue={user?.email || ""} /></FieldRow>
              <FieldRow label="Workspace"><Input defaultValue="Personal Workspace" /></FieldRow>
              <FieldRow label="Timezone"><Input defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone} /></FieldRow>
            </Grid>
            <CardFooter>
              <Button onClick={() => toast.success("Profile saved")}>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card title="Team members" description="Manage access to your workspace.">
            <div className="space-y-3">
              {teams?.[0]?.team_members?.map((m: any) => {
                const isMe = m.user_id === user?.id;
                const name = isMe ? user?.name : "Invited user";
                const email = isMe ? user?.email : "...";
                const role = m.role === "owner" ? "Owner" : "Member";
                
                return (
                  <div key={m.user_id} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{name?.split(" ").map((s: string) => s[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{name} {isMe && "(You)"}</div>
                        <div className="text-xs text-muted-foreground">{email}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">{role}</Badge>
                  </div>
                );
              })}
              {!teams?.[0] && <div className="p-4 text-center text-sm text-muted-foreground">Loading team...</div>}
            </div>
            <CardFooter><Button onClick={() => toast("Multi-user invites require an email provider (coming soon)")}>Invite member</Button></CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <Card title="Webhook endpoints" description="We'll POST signed events here when emails are delivered, opened, or bounced.">
            {webhooks?.map((wh: any) => (
              <div key={wh.id} className="mb-6 space-y-4 rounded-xl border border-border/60 bg-background/40 p-5">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm">{wh.endpoint_url}</div>
                  <Badge variant={wh.is_active ? "secondary" : "outline"} className={wh.is_active ? "bg-success/15 text-success" : ""}>
                    {wh.is_active ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <FieldRow label="Signing secret"><Input readOnly defaultValue={wh.signing_secret} className="font-mono" /></FieldRow>
              </div>
            ))}
            
            {!webhooks?.length && (
              <div className="mb-6 text-sm text-muted-foreground">You haven't configured any webhooks yet.</div>
            )}
            
            <CardFooter>
              <Button onClick={() => toast("Endpoint creation form opening...")}>Add endpoint</Button>
            </CardFooter>
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