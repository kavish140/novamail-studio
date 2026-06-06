-- 1. Create teams table
create table public.teams (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  owner_id uuid references auth.users(id) not null
);

-- 2. Create team_members table
create table public.team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, user_id)
);

-- Enable RLS
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- Policies for teams
create policy "Users can view teams they are members of" on public.teams
  for select using (
    exists (
      select 1 from public.team_members
      where team_members.team_id = teams.id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Owners can update their teams" on public.teams
  for update using (owner_id = auth.uid());

create policy "Users can create teams" on public.teams
  for insert with check (owner_id = auth.uid());

-- Policies for team_members
create policy "Users can view members of their teams" on public.team_members
  for select using (
    exists (
      select 1 from public.team_members as tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
    )
  );

create policy "Team owners can insert members" on public.team_members
  for insert with check (
    exists (
      select 1 from public.teams
      where teams.id = team_id
      and teams.owner_id = auth.uid()
    )
  );

create policy "Team owners can delete members" on public.team_members
  for delete using (
    exists (
      select 1 from public.teams
      where teams.id = team_id
      and teams.owner_id = auth.uid()
    )
  );

-- Trigger to automatically add the owner as a team member when a team is created
create or replace function public.handle_new_team()
returns trigger as $$
begin
  insert into public.team_members (team_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_team_created
  after insert on public.teams
  for each row execute procedure public.handle_new_team();

-- Trigger to automatically create a "Personal Workspace" team when a new user signs up
create or replace function public.handle_new_user_team()
returns trigger as $$
begin
  insert into public.teams (name, owner_id)
  values ('Personal Workspace', new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_team
  after insert on auth.users
  for each row execute procedure public.handle_new_user_team();

-- Now we must add team_id to existing tables.
-- To not break existing data, we can just create team_id and populate it later.
alter table public.api_keys add column team_id uuid references public.teams(id);
alter table public.domains add column team_id uuid references public.teams(id);
alter table public.email_logs add column team_id uuid references public.teams(id);
