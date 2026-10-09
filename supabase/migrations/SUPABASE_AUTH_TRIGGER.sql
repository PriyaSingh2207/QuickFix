-- 1. Create the function that will handle the trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, city, status, points, reports_count, resolved_count)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'citizen'),
    coalesce(new.raw_user_meta_data->>'city', 'Indore'),
    'active',
    0,
    0,
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- 2. Create the trigger on auth.users
-- This ensures that whenever a user signs up (via Email, Google, etc.), a profile is created INSTANTLY.
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 3. (Optional) Backfill for existing users who might have missed the trigger
insert into public.profiles (id, email, name, role, city, status, points, reports_count, resolved_count)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  'citizen', 
  'Indore',
  'active',
  0, 0, 0
from auth.users
where id not in (select id from public.profiles);
