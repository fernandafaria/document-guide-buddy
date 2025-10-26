-- Allow users to delete their own likes
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
CREATE POLICY "Users can delete their own likes"
ON public.likes
FOR DELETE
TO authenticated
USING (auth.uid() = from_user_id);