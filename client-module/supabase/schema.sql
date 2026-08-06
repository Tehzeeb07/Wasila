-- ============================================================
-- CLIENT MODULE SCHEMA
-- Freelancer Marketplace — Group Project
--
-- Run this in your team's Supabase project: SQL Editor > New query
-- If `profiles` already exists (built by a teammate), skip that
-- block and just make sure it has an `id` + `role` column.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- ENUM TYPES ----------
do $$ begin
  create type user_role as enum ('admin', 'client', 'freelancer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_status as enum ('open', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type proposal_status as enum ('pending', 'accepted', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type budget_type as enum ('fixed', 'hourly');
exception when duplicate_object then null; end $$;

-- ---------- PROFILES (shared across all 3 modules) ----------
-- One row per authenticated user. `role` decides admin/client/freelancer.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'client',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ---------- CLIENT COMPANY PROFILES ----------
create table if not exists client_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  company_name text not null,
  industry text,
  company_size text,          -- '1-10', '11-50', '50-200', '200+'
  website text,
  location text,
  about text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- JOB POSTINGS ----------
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text,
  skills text[] default '{}',
  budget_type budget_type not null default 'fixed',
  budget_min numeric(10,2),
  budget_max numeric(10,2),
  deadline date,
  status job_status not null default 'open',
  accepted_proposal_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- PROPOSALS (submitted by freelancers, actioned by clients) ----------
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  freelancer_id uuid not null references profiles(id) on delete cascade,
  cover_letter text not null,
  proposed_rate numeric(10,2) not null,
  estimated_days integer,
  status proposal_status not null default 'pending',
  created_at timestamptz not null default now()
);

do $$ begin
  alter table jobs
    add constraint fk_accepted_proposal
    foreign key (accepted_proposal_id) references proposals(id) on delete set null;
exception when duplicate_object then null; end $$;

-- ---------- PROJECT UPDATES (lightweight project-management log) ----------
create table if not exists project_updates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

-- ---------- INDEXES ----------
create index if not exists idx_jobs_client on jobs(client_id);
create index if not exists idx_jobs_status on jobs(status);
create index if not exists idx_proposals_job on proposals(job_id);
create index if not exists idx_proposals_freelancer on proposals(freelancer_id);
create index if not exists idx_updates_job on project_updates(job_id);

-- ---------- updated_at trigger ----------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_jobs_updated_at on jobs;
create trigger trg_jobs_updated_at before update on jobs
  for each row execute function set_updated_at();

drop trigger if exists trg_client_profiles_updated_at on client_profiles;
create trigger trg_client_profiles_updated_at before update on client_profiles
  for each row execute function set_updated_at();

-- ---------- ROW LEVEL SECURITY ----------
alter table profiles enable row level security;
alter table client_profiles enable row level security;
alter table jobs enable row level security;
alter table proposals enable row level security;
alter table project_updates enable row level security;

-- profiles: any authenticated user can read (freelancers need to see client
-- names and vice versa); a user can only insert/update their own row.
drop policy if exists "profiles_select_all_authenticated" on profiles;
create policy "profiles_select_all_authenticated" on profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- client_profiles: readable by anyone signed in; only the owning client can write
drop policy if exists "client_profiles_select_all_authenticated" on client_profiles;
create policy "client_profiles_select_all_authenticated" on client_profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "client_profiles_insert_own" on client_profiles;
create policy "client_profiles_insert_own" on client_profiles
  for insert with check (auth.uid() = id);

drop policy if exists "client_profiles_update_own" on client_profiles;
create policy "client_profiles_update_own" on client_profiles
  for update using (auth.uid() = id);

-- jobs: readable by anyone signed in (freelancers browse open jobs);
-- only the owning client can create/edit/delete their own postings
drop policy if exists "jobs_select_all_authenticated" on jobs;
create policy "jobs_select_all_authenticated" on jobs
  for select using (auth.role() = 'authenticated');

drop policy if exists "jobs_insert_own" on jobs;
create policy "jobs_insert_own" on jobs
  for insert with check (auth.uid() = client_id);

drop policy if exists "jobs_update_own" on jobs;
create policy "jobs_update_own" on jobs
  for update using (auth.uid() = client_id);

drop policy if exists "jobs_delete_own" on jobs;
create policy "jobs_delete_own" on jobs
  for delete using (auth.uid() = client_id);

-- proposals: a freelancer sees/creates their own; a client sees/updates
-- (accepts/rejects) proposals on jobs they own
drop policy if exists "proposals_select_own_or_job_owner" on proposals;
create policy "proposals_select_own_or_job_owner" on proposals
  for select using (
    auth.uid() = freelancer_id
    or auth.uid() in (select client_id from jobs where jobs.id = proposals.job_id)
  );

drop policy if exists "proposals_insert_own" on proposals;
create policy "proposals_insert_own" on proposals
  for insert with check (auth.uid() = freelancer_id);

drop policy if exists "proposals_update_job_owner" on proposals;
create policy "proposals_update_job_owner" on proposals
  for update using (
    auth.uid() in (select client_id from jobs where jobs.id = proposals.job_id)
  );

-- project_updates: visible/writable by the job's client and its accepted freelancer
drop policy if exists "project_updates_select_participants" on project_updates;
create policy "project_updates_select_participants" on project_updates
  for select using (
    auth.uid() in (
      select client_id from jobs where jobs.id = project_updates.job_id
      union
      select freelancer_id from proposals
        where proposals.job_id = project_updates.job_id and proposals.status = 'accepted'
    )
  );

drop policy if exists "project_updates_insert_participants" on project_updates;
create policy "project_updates_insert_participants" on project_updates
  for insert with check (
    auth.uid() = author_id
    and auth.uid() in (
      select client_id from jobs where jobs.id = project_updates.job_id
      union
      select freelancer_id from proposals
        where proposals.job_id = project_updates.job_id and proposals.status = 'accepted'
    )
  );
