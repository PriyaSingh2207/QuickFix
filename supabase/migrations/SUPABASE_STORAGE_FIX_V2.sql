-- UPDATED SCRIPT (V2)
-- Copy and run this in your Supabase SQL Editor

-- 1. We skip enabling RLS because it is usually already enabled.
-- If this fails, it means we don't need to do it anyway.

-- 2. Allow PUBLIC access to view images (SELECT)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'complaint-images' );

-- 3. Allow LOGGED IN users to upload images (INSERT)
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'complaint-images' );

-- 4. Allow users to UPDATE their own images
DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
CREATE POLICY "Owner Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'complaint-images' AND owner = auth.uid() );
