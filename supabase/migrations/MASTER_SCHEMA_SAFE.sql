-- =========================================================================================
--                            RESQ PRODUCTION SCHEMA V1.1 (SAFE MODE)
-- =========================================================================================
-- This script uses "DO" blocks and checks to prevent "Already Exists" errors.
-- It will safely upgrade your database without breaking existing tables.
-- =========================================================================================

-- 1. PROFILES (Users)
-- Ensure table exists (already does, just safe check)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  email text,
  phone text,
  city text default 'Indore',
  role text check (role in ('citizen', 'volunteer', 'admin')) default 'citizen',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Policies (Drop first to avoid "already exists" error)
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- 2. COMPLAINTS
create table if not exists public.complaints (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  lat float,
  lng float,
  images text[], 
  status text check (status in ('pending', 'in_progress', 'resolved')) default 'pending',
  priority text default 'Normal',
  created_at timestamptz default now()
);

alter table public.complaints enable row level security;

-- Policies
drop policy if exists "Complaints are viewable by everyone" on complaints;
drop policy if exists "Users can create complaints" on complaints;
drop policy if exists "Users can update own complaints" on complaints;

create policy "Complaints are viewable by everyone" on complaints for select using (true);
create policy "Users can create complaints" on complaints for insert with check (auth.uid() = user_id);
create policy "Users can update own complaints" on complaints for update using (auth.uid() = user_id);

-- 3. MISSING REPORTS
create table if not exists public.missing_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  person_name text not null,
  age int,
  last_seen_location text not null,
  description text,
  image_url text,
  status text check (status in ('missing', 'found')) default 'missing',
  contact_phone text,
  created_at timestamptz default now()
);

alter table public.missing_reports enable row level security;

-- Policies
drop policy if exists "Missing reports are viewable by everyone" on missing_reports;
drop policy if exists "Users can create missing reports" on missing_reports;
drop policy if exists "Users can update own missing reports" on missing_reports;

create policy "Missing reports are viewable by everyone" on missing_reports for select using (true);
create policy "Users can create missing reports" on missing_reports for insert with check (auth.uid() = user_id);
create policy "Users can update own missing reports" on missing_reports for update using (auth.uid() = user_id);

-- 4. ANNOUNCEMENTS
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.announcements enable row level security;

-- Policies
drop policy if exists "Announcements are viewable by everyone" on announcements;
drop policy if exists "Admins/Volunteers can create announcements" on announcements;

create policy "Announcements are viewable by everyone" on announcements for select using (true);
create policy "Admins/Volunteers can create announcements" on announcements for insert 
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'volunteer')
  )
);

-- 5. COMMENTS (Unified)
create table if not exists public.u_comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_type text check (parent_type in ('complaint', 'missing_report')),
  parent_id uuid not null,
  message text not null,
  created_at timestamptz default now()
);

alter table public.u_comments enable row level security;

drop policy if exists "Comments are viewable by everyone" on u_comments;
drop policy if exists "Users can create comments" on u_comments;

create policy "Comments are viewable by everyone" on u_comments for select using (true);
create policy "Users can create comments" on u_comments for insert with check (auth.uid() = user_id);

-- 6. ACTIVITIES
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action_type text not null,
  reference_id uuid,
  created_at timestamptz default now()
);

alter table public.activities enable row level security;

drop policy if exists "Users can view own activities" on activities;
drop policy if exists "Users can create activities" on activities;

create policy "Users can view own activities" on activities for select using (auth.uid() = user_id);
create policy "Users can create activities" on activities for insert with check (auth.uid() = user_id);

-- 7. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  message text not null,
  type text check (type in ('alert', 'update', 'generic', 'resolved', 'reminder', 'reward')) default 'generic',
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view own notifications" on notifications;
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);

-- 7.1 INCIDENTS (For Emergency Dashboard)
create table if not exists public.incidents (
  id text primary key, -- Text ID to match hook mocked IDs if needed, or UUID
  title text not null,
  type text not null,
  severity text check (severity in ('critical', 'high', 'medium', 'low')),
  location_address text,
  status text default 'active',
  affected_population int default 0,
  started_at timestamptz default now()
);

alter table public.incidents enable row level security;
drop policy if exists "Incidents are viewable by everyone" on incidents;
create policy "Incidents are viewable by everyone" on incidents for select using (true);

-- 8. TRIGGER (Safely Drop & Recreate)
create or replace function public.log_complaint_activity()
returns trigger as $$
begin
  insert into public.activities (user_id, action_type, reference_id)
  values (new.user_id, 'created_complaint', new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_complaint_created on public.complaints;
create trigger on_complaint_created
  after insert on public.complaints
  for each row execute procedure public.log_complaint_activity();
