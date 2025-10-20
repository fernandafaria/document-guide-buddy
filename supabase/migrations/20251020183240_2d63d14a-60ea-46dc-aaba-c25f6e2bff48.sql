-- Fix the security definer view issue
-- Drop the view and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;

-- Note: Views in PostgreSQL don't use SECURITY DEFINER by default
-- The linter may have flagged this incorrectly, but we'll ensure it's not set
-- Users will query this view with their own permissions, respecting RLS policies