import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldOff,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  AlertTriangle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "kavishganatra5@gmail.com";

export const Route = createFileRoute("/dashboard/admin")({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email !== ADMIN_EMAIL) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Admin — NovaMail" },
      { name: "description", content: "Admin domain approval panel." },
    ],
  }),
  component: AdminPage,
});

type DomainRow = {
  id: string;
  name: string;
  status: string;
  region: string;
  is_approved: boolean;
  added_at: string;
  user_id: string;
  user_email: string;
};

async function adminFetch(method: string, path: string, body?: object) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const base = import.meta.env.VITE_SUPABASE_URL;
  const res = await fetch(`${base}/functions/v1/admin-domains${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function StatusBadge({ approved, verified }: { approved: boolean; verified: boolean }) {
  if (!verified) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
        <Clock className="h-3 w-3" />
        DNS Pending
      </span>
    );
  }
  if (approved) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
        <CheckCircle2 className="h-3 w-3" />
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
      <XCircle className="h-3 w-3" />
      Awaiting Approval
    </span>
  );
}

function AdminPage() {
  const [domains, setDomains] = useState<DomainRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch("GET", "");
      setDomains(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load domains");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleApproval = async (id: string, approve: boolean) => {
    setActionLoading(id + "-approval");
    try {
      await adminFetch("PATCH", "", { id, is_approved: approve });
      setDomains((prev) => prev.map((d) => (d.id === id ? { ...d, is_approved: approve } : d)));
      toast.success(approve ? "Domain approved!" : "Domain approval revoked.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete "${name}" from NovaMail AND Resend? This cannot be undone.`))
      return;
    setActionLoading(id + "-delete");
    try {
      await adminFetch("DELETE", `?id=${id}`);
      setDomains((prev) => prev.filter((d) => d.id !== id));
      toast.success(`"${name}" has been deleted.`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = domains.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.user_email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && !d.is_approved) ||
      (filter === "approved" && d.is_approved);
    return matchesSearch && matchesFilter;
  });

  const pendingCount = domains.filter((d) => !d.is_approved && d.status === "verified").length;
  const approvedCount = domains.filter((d) => d.is_approved).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Admin Panel</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Review and approve domain sending requests from all users.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDomains}
          disabled={loading}
          id="admin-refresh-btn"
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-surface-elevated p-4">
          <p className="text-xs text-muted-foreground">Total Domains</p>
          <p className="mt-1 text-3xl font-bold">{domains.length}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-xs text-amber-400/80">Pending Approval</p>
          <p className="mt-1 text-3xl font-bold text-amber-400">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs text-emerald-400/80">Approved</p>
          <p className="mt-1 text-3xl font-bold text-emerald-400">{approvedCount}</p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              id={`admin-filter-${f}`}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="admin-search"
            placeholder="Search domain or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface/60 h-9 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Loading domains…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center text-muted-foreground">
            <Globe className="h-10 w-10 opacity-30" />
            <p className="text-sm">No domains found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-surface/40">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                  Domain
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                  Owner
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                  Region
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">
                  Added
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((domain, i) => {
                const isApprovalLoading = actionLoading === domain.id + "-approval";
                const isDeleteLoading = actionLoading === domain.id + "-delete";
                return (
                  <tr
                    key={domain.id}
                    className={cn(
                      "border-b border-border/40 transition-colors hover:bg-surface/40",
                      i === filtered.length - 1 && "border-b-0",
                    )}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-medium">
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                        {domain.name}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground max-w-[180px] truncate">
                      {domain.user_email}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">{domain.region}</td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        approved={domain.is_approved}
                        verified={domain.status === "verified"}
                      />
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(domain.added_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {domain.is_approved ? (
                          <Button
                            id={`admin-revoke-${domain.id}`}
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-amber-400 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-300 h-8"
                            onClick={() => handleApproval(domain.id, false)}
                            disabled={isApprovalLoading}
                          >
                            {isApprovalLoading ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ShieldOff className="h-3.5 w-3.5" />
                            )}
                            Revoke
                          </Button>
                        ) : (
                          <Button
                            id={`admin-approve-${domain.id}`}
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300 h-8"
                            onClick={() => handleApproval(domain.id, true)}
                            disabled={isApprovalLoading}
                          >
                            {isApprovalLoading ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            )}
                            Approve
                          </Button>
                        )}
                        <Button
                          id={`admin-delete-${domain.id}`}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(domain.id, domain.name)}
                          disabled={isDeleteLoading}
                          title="Delete domain"
                        >
                          {isDeleteLoading ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Abuse note */}
      {pendingCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-xs text-amber-300/80">
            <span className="font-semibold text-amber-300">
              {pendingCount} domain{pendingCount > 1 ? "s" : ""} awaiting approval.
            </span>{" "}
            Review each domain carefully before approving. Spam or phishing domains should be
            deleted immediately.
          </p>
        </div>
      )}
    </div>
  );
}
