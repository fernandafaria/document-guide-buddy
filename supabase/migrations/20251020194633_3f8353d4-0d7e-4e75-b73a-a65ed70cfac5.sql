-- Create helper function to avoid recursive RLS lookups
CREATE OR REPLACE FUNCTION public.current_location_id(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (current_check_in->>'location_id')
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Replace the recursive policy with function-based policy
DROP POLICY IF EXISTS "Users can view profiles at same location" ON public.profiles;

CREATE POLICY "Users can view profiles at same location"
ON public.profiles
FOR SELECT
USING (
  current_check_in IS NOT NULL
  AND public.current_location_id(auth.uid()) IS NOT NULL
  AND (current_check_in->>'location_id') = public.current_location_id(auth.uid())
);