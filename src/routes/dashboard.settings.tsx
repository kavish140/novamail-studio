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
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const { data: teams, refetch: refetchTeams } = useTeams();
  const { data: webhooks, refetch: refetchWebhooks } = useWebhooks();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.substring(0, 2).toUpperCase() || "AN";

  const [profileName, setProfileName] = useState(user?.name || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user?.name) setProfileName(user.name);
  }, [user?.name]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileName },
      });
      if (error) throw error;
      toast.success("Profile saved");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const toastId = toast.loading("Uploading photo...");
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl },
      });

      if (updateError) throw updateError;
      toast.success("Profile photo updated! Please refresh to see changes.", { id: toastId });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Unknown error", { id: toastId });
    }
  };

  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsInviting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let teamId = teams?.[0]?.id;
      if (!teamId && user?.id) {
        // Auto-create a team if the user doesn't have one
        const { data: newTeam, error: teamError } = await supabase
          .from("teams")
          .insert({ name: "Personal Workspace" })
          .select()
          .single();

        if (teamError) throw teamError;

        await supabase.from("team_members").insert({
          team_id: newTeam.id,
          user_id: user.id,
          role: "owner",
        });

        teamId = newTeam.id;
        refetchTeams();
      }

      if (!teamId) throw new Error("Could not find or create a team.");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://cbyqoakkewlvsgxwosza.supabase.co"}/functions/v1/invite-member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            email: inviteEmail,
            teamId,
            role: "member",
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to invite");

      toast.success("Invitation sent!");
      setInviteOpen(false);
      setInviteEmail("");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to invite");
    } finally {
      setIsInviting(false);
    }
  };

  const [webhookUrl, setWebhookUrl] = useState("");
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
  const [webhookOpen, setWebhookOpen] = useState(false);

  const handleCreateWebhook = async () => {
    if (!webhookUrl || !user) return;
    try {
      const url = new URL(webhookUrl);
      if (url.protocol !== "https:") {
        toast.error("Webhook URL must use HTTPS");
        return;
      }
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    setIsCreatingWebhook(true);
    try {
      const signingSecret = "whsec_" + crypto.randomUUID().replace(/-/g, "");
      const { error } = await supabase.from("webhooks").insert({
        user_id: user.id,
        endpoint_url: webhookUrl,
        signing_secret: signingSecret,
        events: ["email.delivered", "email.opened", "email.bounced"],
        is_active: true,
      });
      if (error) throw error;
      toast.success("Webhook endpoint created!");
      refetchWebhooks();
      setWebhookOpen(false);
      setWebhookUrl("");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create webhook");
    } finally {
      setIsCreatingWebhook(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Workspace, team, and webhook configuration.
        </p>
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
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Upload photo
              </Button>
            </div>
            <Grid>
              <FieldRow label="Full name">
                <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
              </FieldRow>
              <FieldRow label="Email">
                <Input type="email" disabled defaultValue={user?.email || ""} />
              </FieldRow>
              <FieldRow label="Workspace">
                <Input defaultValue="Personal Workspace" />
              </FieldRow>
              <FieldRow label="Timezone">
                <Input defaultValue={Intl.DateTimeFormat().resolvedOptions().timeZone} />
              </FieldRow>
            </Grid>
            <CardFooter>
              <Button disabled={isSavingProfile} onClick={handleSaveProfile}>
                {isSavingProfile ? "Saving..." : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card title="Team members" description="Manage access to your workspace.">
            <div className="space-y-3">
              {teams?.[0]?.team_members?.map((m: { user_id: string; role: string }) => {
                const isMe = m.user_id === user?.id;
                const name = isMe ? user?.name : "Invited user";
                const email = isMe ? user?.email : "...";
                const role = m.role === "owner" ? "Owner" : "Member";

                return (
                  <div
                    key={m.user_id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {name
                            ?.split(" ")
                            .map((s: string) => s[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          {name} {isMe && "(You)"}
                        </div>
                        <div className="text-xs text-muted-foreground">{email}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">{role}</Badge>
                  </div>
                );
              })}
              {teams?.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No team found. Invite a member to create your workspace!
                </div>
              )}
              {teams === undefined && (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading team...</div>
              )}
            </div>
            <CardFooter>
              <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogTrigger asChild>
                  <Button>Invite member</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite team member</DialogTitle>
                    <DialogDescription>
                      Send an invitation email to join your team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label>Email address</Label>
                    <Input
                      autoFocus
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteOpen(false)}>
                      Cancel
                    </Button>
                    <Button disabled={isInviting || !inviteEmail} onClick={handleInvite}>
                      {isInviting ? "Sending..." : "Send invite"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <Card
            title="Webhook endpoints"
            description="We'll POST signed events here when emails are delivered, opened, or bounced."
          >
            {webhooks?.map(
              (wh: {
                id: string;
                endpoint_url: string;
                is_active: boolean;
                signing_secret: string;
              }) => (
                <div
                  key={wh.id}
                  className="mb-6 space-y-4 rounded-xl border border-border/60 bg-background/40 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm">{wh.endpoint_url}</div>
                    <Badge
                      variant={wh.is_active ? "secondary" : "outline"}
                      className={wh.is_active ? "bg-success/15 text-success" : ""}
                    >
                      {wh.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <FieldRow label="Signing secret">
                    <Input readOnly defaultValue={wh.signing_secret} className="font-mono" />
                  </FieldRow>
                </div>
              ),
            )}

            {!webhooks?.length && (
              <div className="mb-6 text-sm text-muted-foreground">
                You haven't configured any webhooks yet.
              </div>
            )}

            <CardFooter>
              <Dialog open={webhookOpen} onOpenChange={setWebhookOpen}>
                <DialogTrigger asChild>
                  <Button>Add endpoint</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Webhook Endpoint</DialogTitle>
                    <DialogDescription>
                      Enter the URL where you want to receive webhook events.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label>Endpoint URL</Label>
                    <Input
                      autoFocus
                      type="url"
                      placeholder="https://your-domain.com/webhook"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setWebhookOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      disabled={isCreatingWebhook || !webhookUrl}
                      onClick={handleCreateWebhook}
                    >
                      {isCreatingWebhook ? "Creating..." : "Create endpoint"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
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
