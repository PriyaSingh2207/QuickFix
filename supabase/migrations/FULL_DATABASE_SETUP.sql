-- =========================================================================================
--                    QUICKFIX COMPLETE SUPABASE SCHEMA & STORAGE SETUP
-- =========================================================================================
-- Run this script in your Supabase Dashboard:
-- 1. Open https://supabase.com/dashboard/project/yidbhuhxgdlprrrmbceu/sql
-- 2. Click "New Query", paste this entire script, and click "Run".
-- =========================================================================================

-- 0. Enable PostGIS (if available)
create extension if not exists postgis;

-- 1. PROFILES (Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null default 'Citizen',
  email text,
  phone text,
  city text default 'Indore',
  role text check (role in ('citizen', 'volunteer', 'admin')) default 'citizen',
  status text default 'active',
  points int default 100,
  reports_count int default 0,
  resolved_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- 2. COMPLAINTS (Civic Issues)
create table if not exists public.complaints (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  lat double precision,
  lng double precision,
  images text[] default array[]::text[], 
  status text default 'pending',
  priority text default 'Medium',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.complaints enable row level security;
drop policy if exists "Complaints are viewable by everyone" on public.complaints;
drop policy if exists "Users can create complaints" on public.complaints;
drop policy if exists "Users can update own complaints" on public.complaints;

create policy "Complaints are viewable by everyone" on public.complaints for select using (true);
create policy "Users can create complaints" on public.complaints for insert with check (auth.uid() = user_id);
create policy "Users can update own complaints" on public.complaints for update using (auth.uid() = user_id);

-- 3. COMPLAINT SUPPORTS (Upvotes)
create table if not exists public.complaint_supports (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(complaint_id, user_id)
);

alter table public.complaint_supports enable row level security;
drop policy if exists "Public supports are viewable by everyone" on public.complaint_supports;
drop policy if exists "Users can support complaints" on public.complaint_supports;
drop policy if exists "Users can remove their support" on public.complaint_supports;

create policy "Public supports are viewable by everyone" on public.complaint_supports for select using (true);
create policy "Users can support complaints" on public.complaint_supports for insert with check (auth.uid() = user_id);
create policy "Users can remove their support" on public.complaint_supports for delete using (auth.uid() = user_id);

-- 4. COMPLAINT REPOSTS
create table if not exists public.complaint_reposts (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(complaint_id, user_id)
);

alter table public.complaint_reposts enable row level security;
drop policy if exists "Public reposts are viewable by everyone" on public.complaint_reposts;
drop policy if exists "Users can repost complaints" on public.complaint_reposts;

create policy "Public reposts are viewable by everyone" on public.complaint_reposts for select using (true);
create policy "Users can repost complaints" on public.complaint_reposts for insert with check (auth.uid() = user_id);

-- 5. COMPLAINT COMMENTS
create table if not exists public.complaint_comments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references public.complaints(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  comment text not null,
  created_at timestamptz default now()
);

alter table public.complaint_comments enable row level security;
drop policy if exists "Public comments are viewable by everyone" on public.complaint_comments;
drop policy if exists "Users can insert comments" on public.complaint_comments;

create policy "Public comments are viewable by everyone" on public.complaint_comments for select using (true);
create policy "Users can insert comments" on public.complaint_comments for insert with check (auth.uid() = user_id);

-- 6. STORAGE BUCKET FOR COMPLAINT IMAGES
insert into storage.buckets (id, name, public) 
values ('complaint-images', 'complaint-images', true)
on conflict (id) do nothing;

drop policy if exists "Complaint Images Public Access" on storage.objects;
drop policy if exists "Users can upload complaint images" on storage.objects;

create policy "Complaint Images Public Access" on storage.objects for select using (bucket_id = 'complaint-images');
create policy "Users can upload complaint images" on storage.objects for insert with check (bucket_id = 'complaint-images');

-- 7. AUTOMATIC USER PROFILE TRIGGER (When new user signs up in Supabase Auth)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'citizen'),
    'Indore'
  )
  on conflict (id) do update set
    email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
