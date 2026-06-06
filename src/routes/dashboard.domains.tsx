import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Plus, RefreshCw, Trash2 } from "lucide-react";
import { type Domain } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/nova/status-badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDomains } from "@/hooks/use-supabase";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard/domains")({
  head: () => ({
    meta: [
      { title: "Domains — NovaMail" },
      { name: "description", content: "Verify sending domains and manage DNS records." },
    ],
  }),
  component: DomainsPage,
});

const records = (host: string) => [
  { type: "TXT", host: `_novamail.${host}`, value: "v=novamail1; k=rsa; p=MIIBIj…AQAB" },
  { type: "MX", host: `mail.${host}`, value: "inbound.novamail.app (priority 10)" },
  { type: "CNAME", host: `nm1._domainkey.${host}`, value: "nm1.dkim.novamail.app" },
  { type: "CNAME", host: `nm2._domainkey.${host}`, value: "nm2.dkim.novamail.app" },
];

function DomainsPage() {
  const { data: list = [], refetch } = useDomains();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Enter a domain");
    
    setLoading(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session || !session.access_token) {
        console.error("Session Error:", sessionError, "Session:", session);
        throw new Error("You are not properly logged in. Please refresh or log in again.");
      }

      const apiUrl = import.meta.env.VITE_SUPABASE_URL 
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/domains`
        : "https://cbyqoakkewlvsgxwosza.supabase.co/functions/v1/domains";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY || ""
        },
        body: JSON.stringify({ name: name.trim(), region: "us-east-1" })
      });

      const responseData = await res.json();
      console.log("Domain API response:", res.status, responseData);

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to add domain");
      }

      toast.success("Domain added — verify the DNS records to start sending");
      setOpen(false);
      setName("");
      if (responseData.id) setExpanded(responseData.id);
      refetch();
    } catch (err: any) {
      console.error("Add domain error:", err);
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    // Delete from DB. We can optionally also delete from Resend via an Edge Function, 
    // but deleting from DB is sufficient to hide it from the user.
    const { error } = await supabase.from('domains').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success("Domain removed");
    refetch();
  };

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Domains</h1>
          <p className="mt-1 text-sm text-muted-foreground">Verify a domain before sending from it. We'll generate the DNS records for you.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1.5 h-4 w-4" /> Add domain</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a sending domain</DialogTitle>
              <DialogDescription>Use a subdomain like <code>mail.yourcompany.com</code> for best deliverability.</DialogDescription>
            </DialogHeader>
            <div>
              <Label htmlFor="domain" className="mb-1.5 block">Domain</Label>
              <Input id="domain" placeholder="mail.acme.dev" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={addDomain}>Add domain</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {list.map((d) => {
          const isOpen = expanded === d.id;
          return (
            <div key={d.id} className="overflow-hidden rounded-2xl border border-border/60 bg-surface/60">
              <button onClick={() => setExpanded(isOpen ? null : d.id)} className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-surface-elevated/50">
                <div className="flex items-center gap-4">
                  <div className="font-display text-lg font-semibold">{d.name}</div>
                  <StatusBadge status={d.status} />
                  <span className="text-xs text-muted-foreground">{d.region} · added {d.addedAt}</span>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {d.status === "pending" && (
                    <div className="flex items-center text-xs text-muted-foreground mr-2">
                      <div className="mr-2 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      Awaiting DNS...
                    </div>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove(d.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-border/60 bg-background/40 p-5">
                  <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Add these records at your DNS provider</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">Host</th>
                          <th className="py-2 pr-4">Value</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.records && d.records.length > 0 ? d.records.map((r) => (
                          <tr key={r.name} className="border-t border-border/60">
                            <td className="py-3 pr-4 font-mono text-xs">{r.type}</td>
                            <td className="py-3 pr-4 font-mono text-xs break-all">{r.name}</td>
                            <td className="py-3 pr-4 font-mono text-xs break-all">{r.value}</td>
                            <td className="py-3 text-right">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copy(r.value)}>
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} className="py-3 text-xs text-muted-foreground">No records found. Delete and try adding the domain again.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}