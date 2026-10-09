-- 1. Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  role text default 'citizen',
  phone text,
  city text,
  points int default 0,
  reports_count int default 0,
  resolved_count int default 0,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.profiles enable row level security;

-- 3. Create Policies (Drop existing first to avoid errors)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;

-- Policy: View (Select)
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Policy: Insert
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- Policy: Update
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 4. Auto-create profile Trigger (Optional but helpful)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, city)
  values (
      new.id, 
      new.email, 
      new.raw_user_meta_data->>'full_name', 
      coalesce(new.raw_user_meta_data->>'role', 'citizen'),
      coalesce(new.raw_user_meta_data->>'city', 'Indore')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

-- Re-create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Grant permissions to authenticated users
grant all on public.profiles to authenticated;
grant all on public.profiles to service_role;
