import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus,
  Users,
  Crown,
  Shield,
  Code2,
  Eye,
  X,
  Send,
  MoreHorizontal,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/team")({
  head: () => ({
    meta: [
      { title: "Team — NovaMail" },
      {
        name: "description",
        content: "Invite teammates to collaborate on your NovaMail workspace.",
      },
    ],
  }),
  component: TeamPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "owner" | "admin" | "developer" | "viewer";

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: Exclude<Role, "owner">;
  sentAt: string;
}

const ROLE_CONFIG: Record<Role, { label: string; icon: typeof Crown; color: string }> = {
  owner: { label: "Owner", icon: Crown, color: "bg-primary/15 text-primary" },
  admin: { label: "Admin", icon: Shield, color: "bg-warning/15 text-warning" },
  developer: { label: "Developer", icon: Code2, color: "bg-info/15 text-info" },
  viewer: { label: "Viewer", icon: Eye, color: "bg-muted text-muted-foreground" },
};

function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cfg.color}`}
    >
      <cfg.icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function TeamPage() {
  const { data: user } = useUser();

  const [members, setMembers] = useState<Member[]>([
    {
      id: "m_2",
      name: "Alex Chen",
      email: "alex@acme.dev",
      role: "developer",
    },
  ]);

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Exclude<Role, "owner">>("developer");
  const [removing, setRemoving] = useState<Member | null>(null);

  const ownerMember: Member = {
    id: "owner",
    name: user?.name || "You",
    email: user?.email || "",
    role: "owner",
    avatarUrl: user?.avatarUrl,
  };

  const allMembers = [ownerMember, ...members];

  const handleInvite = () => {
    if (!inviteEmail.trim()) return toast.error("Enter an email address");
    if (
      allMembers.some((m) => m.email === inviteEmail.trim()) ||
      pendingInvites.some((p) => p.email === inviteEmail.trim())
    ) {
      return toast.error("This email has already been invited");
    }

    setPendingInvites((prev) => [
      ...prev,
      {
        id: `inv_${Date.now()}`,
        email: inviteEmail.trim(),
        role: inviteRole,
        sentAt: "Just now",
      },
    ]);

    toast.success(`Invite sent to ${inviteEmail.trim()}`);
    setInviteEmail("");
    setInviteRole("developer");
    setInviteOpen(false);
  };

  const cancelInvite = (id: string) => {
    setPendingInvites((prev) => prev.filter((p) => p.id !== id));
    toast.success("Invite cancelled");
  };

  const resendInvite = (email: string) => {
    toast.success(`Invite resent to ${email}`);
  };

  const removeMember = (m: Member) => {
    setMembers((prev) => prev.filter((x) => x.id !== m.id));
    setRemoving(null);
    toast.success(`${m.name} removed from the team`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite teammates to collaborate on your NovaMail workspace.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Invite member
        </Button>
      </div>

      {/* Members */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Members ({allMembers.length})</span>
        </div>
        <div className="rounded-2xl border border-border/60 bg-surface/60 overflow-hidden divide-y divide-border/60">
          {allMembers.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-surface-elevated/40 transition-colors"
            >
              {m.avatarUrl ? (
                <Avatar className="h-9 w-9">
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="h-full w-full object-cover rounded-full"
                  />
                </Avatar>
              ) : (
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
                    {getInitials(m.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{m.name}</span>
                  {m.role === "owner" && (
                    <span className="text-[10px] text-muted-foreground">(You)</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">{m.email}</div>
              </div>
              <RoleBadge role={m.role} />
              {m.role !== "owner" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setRemoving(m)}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Send className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Pending invites ({pendingInvites.length})</span>
          </div>
          <div className="rounded-2xl border border-border/60 bg-surface/60 overflow-hidden divide-y divide-border/60">
            {pendingInvites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-elevated/40 transition-colors"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {inv.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{inv.email}</div>
                  <div className="text-xs text-muted-foreground">Sent {inv.sentAt}</div>
                </div>
                <RoleBadge role={inv.role} />
                <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
                  Pending
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => resendInvite(inv.email)}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" /> Resend
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => cancelInvite(inv.id)}
                  >
                    <X className="mr-1 h-3 w-3" /> Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role descriptions */}
      <div className="rounded-2xl border border-border/60 bg-surface/60 p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Role permissions
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["owner", "admin", "developer", "viewer"] as Role[]).map((role) => {
            const cfg = ROLE_CONFIG[role];
            const descriptions: Record<Role, string> = {
              owner: "Full access. Billing, team management, and all API operations.",
              admin: "Everything except billing. Can manage team members and API keys.",
              developer: "Create and manage API keys, view logs, manage templates.",
              viewer: "Read-only access. View logs and dashboard, but cannot change settings.",
            };
            return (
              <div key={role} className="rounded-xl border border-border/40 bg-background/60 p-3">
                <RoleBadge role={role} />
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {descriptions[role]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>
              They'll receive an email with a link to join your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-email" className="mb-1.5 block">
                Email address
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="teammate@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInvite();
                }}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as Exclude<Role, "owner">)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite}>
              <Send className="mr-1.5 h-4 w-4" /> Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove member confirmation */}
      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They'll lose access to this workspace immediately. You can re-invite them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => removing && removeMember(removing)}
            >
              Remove member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
