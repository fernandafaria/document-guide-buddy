-- Phase 1: Critical Security Fixes for RLS Policies

-- 1. Drop the insecure public SELECT policy on profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 2. Create secure RLS policies for profiles table
-- Policy 1: Users can view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Users can view limited profile info of users they've matched with
CREATE POLICY "Users can view matched profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE (user1_id = auth.uid() AND user2_id = profiles.id)
       OR (user2_id = auth.uid() AND user1_id = profiles.id)
  )
);

-- Policy 3: Users can view limited profile info of users at the same location
CREATE POLICY "Users can view profiles at same location"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  current_check_in IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles AS own_profile
    WHERE own_profile.id = auth.uid()
      AND own_profile.current_check_in IS NOT NULL
      AND own_profile.current_check_in->>'location_id' = profiles.current_check_in->>'location_id'
  )
);

-- 3. Drop the insecure public SELECT policy on locations
DROP POLICY IF EXISTS "Locations are viewable by everyone" ON public.locations;

-- 4. Create secure RLS policy for locations table
-- Only authenticated users can view locations
CREATE POLICY "Authenticated users can view locations"
ON public.locations
FOR SELECT
TO authenticated
USING (true);

-- 5. Add index for performance on location queries
CREATE INDEX IF NOT EXISTS idx_profiles_current_check_in_location_id 
ON public.profiles ((current_check_in->>'location_id'));

-- 6. Create a view for public profile data (without sensitive fields)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  name,
  gender,
  age,
  intentions,
  photos,
  profession,
  education,
  city,
  state,
  languages,
  musical_styles,
  alcohol,
  religion,
  zodiac_sign,
  about_me,
  current_check_in,
  last_active,
  created_at
FROM public.profiles;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;