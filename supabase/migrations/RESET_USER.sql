-- =========================================================================================
--                                  USER DELETION SCRIPT
-- =========================================================================================
-- Use this script if you need to perform a "hard reset" on a specific user.
-- Since 'auth.users' cannot be modified by the frontend client, you must run this
-- in the Supabase Dashboard > SQL Editor.
-- =========================================================================================

-- REPLACE THE EMAIL BELOW WITH THE USER YOU WANT TO DELETE
\set email_to_delete 'lakshyapandagre@gmail.com'

-- 1. Delete user from auth.users
--    (Cascade delete will automatically remove the profile, complaints, supports, etc.
--     BECAUSE of the foreign key references)
delete from auth.users where email = :'email_to_delete';

-- 2. (Optional) Verification: Check if any data remains
select * from public.profiles where email = :'email_to_delete';

-- Instructions:
-- 1. Copy the line "delete from auth.users where email = 'lakshyapandagre@gmail.com';"
-- 2. Go to your Supabase Dashboard.
-- 3. Click on the "SQL Editor" icon in the left sidebar.
-- 4. Paste the command and click "Run".
-- 5. The user is now gone and can register again fresh.
