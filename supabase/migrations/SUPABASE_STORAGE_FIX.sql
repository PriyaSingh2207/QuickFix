-- Run this in your Supabase SQL Editor to fix storage permissions

-- 1. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Allow PUBLIC access to view images (SELECT)
-- This allows anyone to see the images on the website
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'complaint-images' );

-- 3. Allow LOGGED IN users to upload images (INSERT)
-- This allows any authenticated user to upload an image
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'complaint-images' );

-- 4. Allow users to UPDATE their own images (Optional but good)
DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
CREATE POLICY "Owner Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'complaint-images' AND owner = auth.uid() );
