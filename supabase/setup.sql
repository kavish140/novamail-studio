-- Create the email_logs table
create table public.email_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  to_email text not null,
  from_email text not null default 'noreply@novamail.app',
  subject text not null,
  status text not null,
  resend_id text,
  opens integer default 0,
  clicks integer default 0,
  user_id uuid references auth.users(id) not null
);

-- Create the domains table
create table public.domains (
  id uuid default gen_random_uuid() primary key,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  status text not null default 'pending',
  region text not null default 'us-east',
  resend_domain_id text,
  records jsonb,
  is_approved boolean not null default false,
  user_id uuid references auth.users(id) not null
);

-- Create the api_keys table
create table public.api_keys (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  prefix text not null,
  key_hash text not null,
  env text not null default 'live',
  last_used timestamp with time zone,
  user_id uuid references auth.users(id) not null
);

-- Set up Row Level Security (RLS)
alter table public.email_logs enable row level security;
alter table public.domains enable row level security;
alter table public.api_keys enable row level security;

-- Email Logs Policies
create policy "Users can insert their own email logs" on public.email_logs for insert with check (auth.uid() = user_id);
create policy "Users can view their own email logs" on public.email_logs for select using (auth.uid() = user_id);

-- Domains Policies
create policy "Users can insert their own domains" on public.domains for insert with check (auth.uid() = user_id);
create policy "Users can view their own domains" on public.domains for select using (auth.uid() = user_id);
create policy "Users can update their own domains" on public.domains for update using (auth.uid() = user_id);
create policy "Users can delete their own domains" on public.domains for delete using (auth.uid() = user_id);

-- API Keys Policies
create policy "Users can insert their own api keys" on public.api_keys for insert with check (auth.uid() = user_id);
create policy "Users can view their own api keys" on public.api_keys for select using (auth.uid() = user_id);
create policy "Users can update their own api keys" on public.api_keys for update using (auth.uid() = user_id);
create policy "Users can delete their own api keys" on public.api_keys for delete using (auth.uid() = user_id);
