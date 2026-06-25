import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Plus, RefreshCw, Trash2 } from "lucide-react";
import { type Domain } from "@/lib/mock-data";
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
import { toast } from "sonner";
import { useDomains } from "@/hooks/use-supabase";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

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
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Enter a domain");

    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

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
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
        },
        body: JSON.stringify({ name: name.trim(), region: "us-east-1" }),
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
    } catch (err: unknown) {
      console.error("Add domain error:", err);
      toast.error(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const verifyDomain = async (id: string) => {
    setIsVerifying(id);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.access_token) {
        throw new Error("You must be logged in to verify domains");
      }

      const baseUrl = import.meta.env.VITE_SUPABASE_URL
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/domains`
        : "https://cbyqoakkewlvsgxwosza.supabase.co/functions/v1/domains";

      const res = await fetch(`${baseUrl}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
        },
        body: JSON.stringify({ id }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to verify domain");
      }

      toast.success("Domain verification triggered!");
      refetch();
    } catch (err: unknown) {
      console.error("Verify domain error:", err);
      toast.error(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsVerifying(null);
    }
  };

  const remove = async (id: string) => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("Not authenticated");

      const baseUrl = import.meta.env.VITE_SUPABASE_URL
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/domains`
        : "https://cbyqoakkewlvsgxwosza.supabase.co/functions/v1/domains";

      const res = await fetch(`${baseUrl}?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete domain");
      }

      toast.success("Domain removed");
      refetch();
    } catch (err: unknown) {
      console.error("Delete domain error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete domain");
    }
  };

  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    toast.success("Copied");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Domains</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verify a domain before sending from it. We'll generate the DNS records for you.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1.5 h-4 w-4" /> Add domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a sending domain</DialogTitle>
              <DialogDescription>
                Use a subdomain like <code>mail.yourcompany.com</code> for best deliverability.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={addDomain}>
              <div>
                <Label htmlFor="domain" className="mb-1.5 block">
                  Domain
                </Label>
                <Input
                  id="domain"
                  placeholder="mail.acme.dev"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add domain"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {list.map((d) => {
          const isOpen = expanded === d.id;
          return (
            <div
              key={d.id}
              className="overflow-hidden rounded-2xl border border-border/60 bg-surface/60"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : d.id)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-surface-elevated/50"
              >
                <div className="flex items-center gap-4">
                  <div className="font-display text-lg font-semibold">{d.name}</div>
                  <StatusBadge status={d.status} />
                  <span className="text-xs text-muted-foreground">
                    {d.region} · added {d.addedAt}
                  </span>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {d.status === "pending" && (
                    <div className="flex items-center text-xs text-muted-foreground mr-2">
                      <div className="mr-2 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      Awaiting DNS...
                    </div>
                  )}
                  {d.status !== "verified" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => verifyDomain(d.id)}
                      disabled={isVerifying === d.id}
                    >
                      <RefreshCw
                        className={cn("h-3 w-3 mr-1.5", isVerifying === d.id && "animate-spin")}
                      />
                      Verify
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(d.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-border/60 bg-background/40 p-5">
                  <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                    Add these records at your DNS provider
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">Host</th>
                          <th className="py-2 pr-4">Value</th>
                          <th className="py-2 pr-4">Priority</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.records && d.records.length > 0 ? (
                          d.records.map((r) => (
                            <tr key={r.name} className="border-t border-border/60">
                              <td className="py-3 pr-4 font-mono text-xs">{r.type}</td>
                              <td className="py-3 pr-4 font-mono text-xs break-all">
                                <div className="flex items-center gap-2">
                                  <span>{r.name}</span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 opacity-50 hover:opacity-100 shrink-0"
                                    onClick={() => copy(r.name)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                              <td className="py-3 pr-4 font-mono text-xs break-all">{r.value}</td>
                              <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                                {r.priority ?? "-"}
                              </td>
                              <td className="py-3 text-right">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => copy(r.value)}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-3 text-xs text-muted-foreground">
                              No records found. Delete and try adding the domain again.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-surface/60 p-16 text-center">
            <div className="text-sm text-muted-foreground">
              No domains added yet. Add a sending domain to start sending emails.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
