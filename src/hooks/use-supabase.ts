import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ApiKey, Domain, EmailLog } from '@/lib/mock-data';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    }
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: ['api_keys'],
    queryFn: async () => {
      const { data, error } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        prefix: row.prefix,
        env: row.env,
        createdAt: new Date(row.created_at).toLocaleDateString(),
        lastUsed: row.last_used ? new Date(row.last_used).toLocaleDateString() : 'Never'
      })) as ApiKey[];
    }
  });
}

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const { data, error } = await supabase.from('domains').select('*').order('added_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        status: row.status,
        region: row.region,
        addedAt: new Date(row.added_at).toLocaleDateString()
      })) as Domain[];
    }
  });
}

export function useEmailLogs() {
  return useQuery({
    queryKey: ['email_logs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('email_logs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        to: row.to_email,
        from: row.from_email || 'noreply@novamail.app',
        subject: row.subject,
        status: row.status,
        sentAt: new Date(row.created_at).toLocaleString(),
        opens: row.opens || 0,
        clicks: row.clicks || 0
      })) as EmailLog[];
    }
  });
}
