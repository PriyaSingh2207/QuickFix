-- =========================================================================================
--                            RESQ PRODUCTION SCHEMA V1.0
-- =========================================================================================
-- Run this in Supabase SQL Editor to align with the Master Prompt requirements.
-- This handles Tables, RLS Policies, and Helper Functions.
-- =========================================================================================

-- 1. PROFILES (Users)
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

-- Policies
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
create policy "Complaints are viewable by everyone" on complaints for select using (true);
create policy "Users can create complaints" on complaints for insert with check (auth.uid() = user_id);
create policy "Users can update own complaints" on complaints for update using (auth.uid() = user_id);

-- 3. MISSING REPORTS (Replaces Missing Items)
-- If missing_items exists, we might want to drop it or ignore it. Let's create missing_reports.
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
create policy "Announcements are viewable by everyone" on announcements for select using (true);
-- Only admins/volunteers should probably create, but for now allow auth users for demo purposes or restrict
create policy "Admins/Volunteers can create announcements" on announcements for insert 
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'volunteer')
  )
);

-- 5. COMMENTS (Unified or Specific)
-- Let's stick to a specific structure if existing code relies on it, 
-- but the prompt asked for "parent_type". Let's create a unified table.
create table if not exists public.u_comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  parent_type text check (parent_type in ('complaint', 'missing_report')),
  parent_id uuid not null,
  message text not null,
  created_at timestamptz default now()
);

alter table public.u_comments enable row level security;

create policy "Comments are viewable by everyone" on u_comments for select using (true);
create policy "Users can create comments" on u_comments for insert with check (auth.uid() = user_id);

-- 6. ACTIVITIES (For User Activity History)
create table if not exists public.activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action_type text not null, -- e.g., 'created_complaint', 'commented', 'joined_squad'
  reference_id uuid,
  created_at timestamptz default now()
);

alter table public.activities enable row level security;

create policy "Users can view own activities" on activities for select using (auth.uid() = user_id);
create policy "Users can create activities" on activities for insert with check (auth.uid() = user_id);

-- 7. NOTIFICATIONS (Optional but good for Realtime)
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);

-- 8. STORAGE BUCKETS (Script cannot easily create buckets, but we assume 'complaints' and 'missing' exist)
-- This part acts as a reminder.

-- 9. TRIGGERS for Activities (Optional Automation)
-- Example: When a complaint is created, log activity.
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
