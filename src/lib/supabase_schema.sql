-- Enable PostGIS for location features (optional but recommended)
create extension if not exists postgis;

-- 0. Profiles Table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  role text default 'citizen' check (role in ('citizen', 'volunteer', 'admin')),
  status text default 'active' check (status in ('active', 'disabled', 'pending_verification')),
  area_id uuid,
  language text default 'en',
  notification_preferences jsonb default '{"sms": false, "email": true, "push": true}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile" 
on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile" 
on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile" 
on profiles for update using (auth.uid() = id);

-- 1. Complaints Table
create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id), -- Assuming auth.users or public.profiles
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  lat double precision,
  lng double precision,
  images text[] default array[]::text[],
  status text default 'submitted',
  priority text default 'Medium',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Complaints Supports (Reposts/Likes)
create table if not exists complaint_supports (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references complaints(id) on delete cascade,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  unique(complaint_id, user_id)
);

-- 3. Complaints Comments
create table if not exists complaint_comments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references complaints(id) on delete cascade,
  user_id uuid references auth.users(id),
  comment text not null,
  created_at timestamp with time zone default now()
);

-- 4. Storage Bucket
insert into storage.buckets (id, name, public) 
values ('complaint-images', 'complaint-images', true)
on conflict (id) do nothing;

-- RLS Policies
alter table complaints enable row level security;
alter table complaint_supports enable row level security;
alter table complaint_comments enable row level security;

-- Complaints Policies
create policy "Public complaints are viewable by everyone" 
on complaints for select using (true);

create policy "Users can insert their own complaints" 
on complaints for insert with check (auth.uid() = user_id);

-- Supports Policies
create policy "Public supports are viewable by everyone" 
on complaint_supports for select using (true);

create policy "Users can support complaints" 
on complaint_supports for insert with check (auth.uid() = user_id);

create policy "Users can remove their support"
on complaint_supports for delete using (auth.uid() = user_id);

-- Comments Policies
create policy "Public comments are viewable by everyone" 
on complaint_comments for select using (true);

create policy "Users can insert comments" 
on complaint_comments for insert with check (auth.uid() = user_id);

-- Storage Policies (Simplified)
create policy "Public Access" 
on storage.objects for select using ( bucket_id = 'complaint-images' );

create policy "Authenticated users can upload" 
on storage.objects for insert with check ( bucket_id = 'complaint-images' and auth.role() = 'authenticated' );
