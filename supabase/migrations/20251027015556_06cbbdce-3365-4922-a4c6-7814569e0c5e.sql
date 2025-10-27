-- Ensure profile-photos bucket is public
UPDATE storage.buckets
SET public = true
WHERE id = 'profile-photos';