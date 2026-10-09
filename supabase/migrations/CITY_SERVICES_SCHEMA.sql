-- CITY SERVICES SCHEMA
-- Run this in Supabase SQL Editor

-- 1. WASTE REQUESTS
create table if not exists public.waste_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  issue_type text not null, -- 'missed_pickup', 'overflowing', 'bulky', 'hazardous'
  description text,
  image_url text,
  status text check (status in ('pending', 'assigned', 'resolved')) default 'pending',
  created_at timestamptz default now()
);

alter table public.waste_requests enable row level security;

create policy "Users can view own waste requests" on waste_requests 
  for select using (auth.uid() = user_id);

create policy "Users can insert waste requests" on waste_requests 
  for insert with check (auth.uid() = user_id);

create policy "Users can update own waste requests" on waste_requests 
  for update using (auth.uid() = user_id);

-- 2. PARKING PERMITS
create table if not exists public.parking_permits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  permit_no text unique not null,
  expiry_date date not null,
  status text check (status in ('active', 'expired')) default 'active',
  created_at timestamptz default now()
);

alter table public.parking_permits enable row level security;

create policy "Users can view own permits" on parking_permits 
  for select using (auth.uid() = user_id);

-- 3. PARKING RENEWALS
create table if not exists public.parking_renewals (
  id uuid default gen_random_uuid() primary key,
  permit_id uuid references public.parking_permits(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamptz default now()
);

alter table public.parking_renewals enable row level security;

create policy "Users can view own renewals" on parking_renewals 
  for select using (auth.uid() = user_id);

create policy "Users can insert renewals" on parking_renewals 
  for insert with check (auth.uid() = user_id);

-- 4. POWER ISSUES
create table if not exists public.power_issues (
  id uuid default gen_random_uuid() primary key,
  area text not null,
  description text,
  reported_by uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('reported', 'investigating', 'resolved')) default 'reported',
  created_at timestamptz default now()
);

alter table public.power_issues enable row level security;

create policy "Power issues are viewable by everyone" on power_issues 
  for select using (true);

create policy "Users can report power issues" on power_issues 
  for insert with check (auth.uid() = reported_by);

-- 5. WIFI REPORTS
create table if not exists public.wifi_reports (
  id uuid default gen_random_uuid() primary key,
  location text not null,
  issue text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('reported', 'investigating', 'resolved')) default 'reported',
  created_at timestamptz default now()
);

alter table public.wifi_reports enable row level security;

create policy "Wifi reports are viewable by everyone" on wifi_reports 
  for select using (true);

create policy "Users can report wifi issues" on wifi_reports 
  for insert with check (auth.uid() = user_id);


-- 6. ENABLE REALTIME
alter publication supabase_realtime add table public.waste_requests;
alter publication supabase_realtime add table public.power_issues;
alter publication supabase_realtime add table public.wifi_reports;
alter publication supabase_realtime add table public.parking_renewals;

-- 7. STORAGE BUCKET (If not exists)
insert into storage.buckets (id, name, public) 
values ('service-images', 'service-images', true)
on conflict (id) do nothing;

create policy "Public Access" on storage.objects for select using ( bucket_id = 'service-images' );
create policy "Authenticated Plan Upload" on storage.objects for insert with check ( bucket_id = 'service-images' and auth.role() = 'authenticated' );

