import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ApiKey, Domain, DomainRecord, EmailLog } from "@/lib/mock-data";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split("@")[0],
        avatarUrl: user.user_metadata?.avatar_url,
      };
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
}

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*, team_members(role, user_id)");
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
}

export function useWebhooks() {
  return useQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("webhooks").select("*");
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: ["api_keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(
        (row: {
          id: string;
          name: string;
          prefix: string;
          created_at: string;
          last_used: string | null;
        }) => ({
          id: row.id,
          name: row.name,
          prefix: row.prefix,
          createdAt: new Date(row.created_at).toLocaleDateString(),
          lastUsed: row.last_used ? new Date(row.last_used).toLocaleDateString() : "Never",
        }),
      ) as ApiKey[];
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
}

export function useDomains() {
  return useQuery({
    queryKey: ["domains"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("domains")
        .select("*")
        .order("added_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(
        (row: {
          id: string;
          name: string;
          status: string;
          region: string;
          added_at: string;
          records: DomainRecord[] | null;
        }) => ({
          id: row.id,
          name: row.name,
          status: row.status,
          region: row.region,
          addedAt: new Date(row.added_at).toLocaleDateString(),
          records: row.records || [],
        }),
      ) as Domain[];
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
}

export function useEmailLogs() {
  return useQuery({
    queryKey: ["email_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(
        (row: {
          id: string;
          to_email: string;
          from_email: string | null;
          subject: string;
          status: string;
          created_at: string;
          opens: number | null;
          clicks: number | null;
        }) => ({
          id: row.id,
          to: row.to_email,
          from: row.from_email || "noreply@novamail.app",
          subject: row.subject,
          status: row.status,
          sentAt: new Date(row.created_at).toLocaleString(),
          rawCreatedAt: row.created_at,
          opens: row.opens || 0,
          clicks: row.clicks || 0,
        }),
      ) as EmailLog[];
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });
}
