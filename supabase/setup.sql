-- Create the email_logs table
create table public.email_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  to_email text not null,
  subject text not null,
  status text not null,
  resend_id text,
  user_id uuid references auth.users(id) -- Optional: to tie emails to the authenticated user
);

-- Set up Row Level Security (RLS)
alter table public.email_logs enable row level security;

-- Create policies so users can only see their own logs
create policy "Users can insert their own email logs"
  on public.email_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own email logs"
  on public.email_logs for select
  using (auth.uid() = user_id);
