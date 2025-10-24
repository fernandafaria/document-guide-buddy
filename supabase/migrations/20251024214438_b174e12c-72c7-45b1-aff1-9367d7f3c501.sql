-- Ensure public bucket for profile photos and proper access policies
-- Create bucket if it doesn't exist and make it public
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do update set public = true;

-- Public read access for profile photos
drop policy if exists "Public read profile photos" on storage.objects;
create policy "Public read profile photos"
on storage.objects for select
using (bucket_id = 'profile-photos');

-- Authenticated users can upload their own photos (path prefix must be their user id)
drop policy if exists "Users can upload own profile photos" on storage.objects;
create policy "Users can upload own profile photos"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Authenticated users can update their own photos
drop policy if exists "Users can update own profile photos" on storage.objects;
create policy "Users can update own profile photos"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Authenticated users can delete their own photos
drop policy if exists "Users can delete own profile photos" on storage.objects;
create policy "Users can delete own profile photos"
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);
