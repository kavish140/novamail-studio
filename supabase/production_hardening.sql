-- Production Hardening Migration
-- Run this AFTER the existing setup.sql, teams_setup.sql, and billing_webhooks_setup.sql

-- 1. Add update policy for email_logs (needed for webhook status updates via RLS)
-- Note: The resend-webhook function uses service_role key, so this is belt-and-suspenders.
create policy "Users can update their own email logs" on public.email_logs
  for update using (auth.uid() = user_id);

-- 2. Add unique constraint on api_keys(key_hash) to prevent duplicate keys
alter table public.api_keys add constraint api_keys_key_hash_unique unique (key_hash);

-- 3. Add performance indexes for common dashboard queries
create index if not exists idx_email_logs_user_created
  on public.email_logs (user_id, created_at desc);

create index if not exists idx_email_logs_resend_id
  on public.email_logs (resend_id);

create index if not exists idx_domains_user_id
  on public.domains (user_id);

create index if not exists idx_domains_resend_domain_id
  on public.domains (resend_domain_id);

create index if not exists idx_api_keys_key_hash
  on public.api_keys (key_hash);

create index if not exists idx_api_keys_user_id
  on public.api_keys (user_id);

create index if not exists idx_webhooks_user_active
  on public.webhooks (user_id, is_active);
