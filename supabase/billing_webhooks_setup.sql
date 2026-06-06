-- 1. Create subscriptions table for UPI Billing
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  plan text not null default 'free',
  status text not null default 'active',
  current_period_end timestamp with time zone not null,
  upi_reference_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy "Users can insert their own subscriptions" on public.subscriptions
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own subscriptions" on public.subscriptions
  for update using (auth.uid() = user_id);

-- 2. Create webhooks table
create table public.webhooks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  endpoint_url text not null,
  signing_secret text not null,
  events text[] not null default array['email.delivered', 'email.opened', 'email.bounced'],
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.webhooks enable row level security;

create policy "Users can view their own webhooks" on public.webhooks
  for select using (auth.uid() = user_id);
create policy "Users can insert their own webhooks" on public.webhooks
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own webhooks" on public.webhooks
  for update using (auth.uid() = user_id);
create policy "Users can delete their own webhooks" on public.webhooks
  for delete using (auth.uid() = user_id);
