-- Create the templates table
create table public.templates (
  id text primary key, -- we can use text like 'tpl_abc123'
  user_id uuid references auth.users(id) not null,
  name text not null,
  subject text not null,
  html text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.templates enable row level security;

-- Templates Policies
create policy "Users can insert their own templates" on public.templates for insert with check (auth.uid() = user_id);
create policy "Users can view their own templates" on public.templates for select using (auth.uid() = user_id);
create policy "Users can update their own templates" on public.templates for update using (auth.uid() = user_id);
create policy "Users can delete their own templates" on public.templates for delete using (auth.uid() = user_id);

-- Add index
create index if not exists idx_templates_user_id on public.templates (user_id);
