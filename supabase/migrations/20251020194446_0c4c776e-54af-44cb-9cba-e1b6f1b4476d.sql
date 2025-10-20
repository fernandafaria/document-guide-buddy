-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view profiles at same location" ON public.profiles;

-- Create a corrected policy that doesn't cause recursion
CREATE POLICY "Users can view profiles at same location"
ON public.profiles
FOR SELECT
USING (
  current_check_in IS NOT NULL 
  AND EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND current_check_in IS NOT NULL 
    AND (current_check_in->>'location_id') = (profiles.current_check_in->>'location_id')
  )
);