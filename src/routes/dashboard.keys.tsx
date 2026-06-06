import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Copy, Eye, EyeOff, MoreHorizontal, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { type ApiKey } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/nova/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useApiKeys } from "@/hooks/use-supabase";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard/keys")({
  head: () => ({
    meta: [
      { title: "API Keys — NovaMail" },
      { name: "description", content: "Create, reveal, and revoke API keys for your NovaMail workspace." },
    ],
  }),
  component: KeysPage,
});

function randSuffix() {
  return Math.random().toString(36).slice(2, 10);
}

function KeysPage() {
  const { data: keys = [], refetch } = useApiKeys();
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [pendingRevoke, setPendingRevoke] = useState<ApiKey | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [env, setEnv] = useState<"test" | "live">("live");

  const create = async () => {
    if (!name.trim()) return toast.error("Give your key a name");
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return toast.error("You must be logged in");

    const full = `nm_${env}_${randSuffix()}${randSuffix()}`;
    const prefix = `nm_${env}_${full.slice(8, 12)}`;

    const { error } = await supabase.from('api_keys').insert({
      user_id: userData.user.id,
      name: name.trim(),
      prefix,
      env
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setCreatedKey(full);
    setName("");
    toast.success("API key created");
    refetch();
  };

  const revoke = async (id: string) => {
    const { error } = await supabase.from('api_keys').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Key revoked");
    setPendingRevoke(null);
    refetch();
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">API Keys</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create scoped keys and revoke compromised ones in one click.</p>
        </div>
        <Dialog open={creating} onOpenChange={(o) => { setCreating(o); if (!o) setCreatedKey(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1.5 h-4 w-4" /> Create new key</Button>
          </DialogTrigger>
          <DialogContent>
            {createdKey ? (
              <>
                <DialogHeader>
                  <DialogTitle>Your new API key</DialogTitle>
                  <DialogDescription>Copy it now — for security reasons we won't show it again.</DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 font-mono text-sm">
                  <span className="flex-1 break-all">{createdKey}</span>
                  <Button size="icon" variant="ghost" onClick={() => copy(createdKey)}><Copy className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                  <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  Store this key in your secrets manager. Never commit it to git or expose it in client code.
                </div>
                <DialogFooter>
                  <Button onClick={() => { setCreating(false); setCreatedKey(null); }}>Done</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Create new API key</DialogTitle>
                  <DialogDescription>Give the key a memorable name and choose an environment.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="kname" className="mb-1.5 block">Name</Label>
                    <Input id="kname" placeholder="Production server" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Environment</Label>
                    <Select value={env} onValueChange={(v) => setEnv(v as "test" | "live")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="test">Test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
                  <Button onClick={create}>Create key</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border/60 bg-surface/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Key</th>
              <th className="px-6 py-3">Env</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3">Last used</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => {
              const shown = revealed[k.id];
              const display = shown ? `${k.prefix}${randSuffix()}` : `${k.prefix}••••••••`;
              return (
                <tr key={k.id} className="border-b border-border/60 last:border-0 hover:bg-surface-elevated/50">
                  <td className="px-6 py-4 font-medium">{k.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-background/60 px-2 py-1 font-mono text-xs">{display}</code>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setRevealed((r) => ({ ...r, [k.id]: !shown }))}>
                        {shown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copy(display)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={k.env} /></td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{k.createdAt}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{k.lastUsed}</td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copy(display)}>Copy key</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast("Rename is a demo")}>Rename</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setPendingRevoke(k)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Revoke
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!pendingRevoke} onOpenChange={(o) => !o && setPendingRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this key?</AlertDialogTitle>
            <AlertDialogDescription>
              Any request using <code className="font-mono">{pendingRevoke?.prefix}••••</code> will start failing immediately. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => pendingRevoke && revoke(pendingRevoke.id)}>
              Revoke key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}