-- Fix security warnings

-- 1. Move postgis extension from public to extensions schema
DROP EXTENSION IF EXISTS postgis CASCADE;
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- 2. Fix function search_path for handle_new_user
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone_number)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();