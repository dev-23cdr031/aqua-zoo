-- Create the exact no-argument RPC used by the existing frontend.
-- This migration reuses public.profiles and does not create a duplicate table.

DO $$
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RAISE EXCEPTION 'public.profiles does not exist. Apply the profiles migration first.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'id'
  ) THEN
    RAISE EXCEPTION 'public.profiles must contain an id column.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'role'
  ) THEN
    RAISE EXCEPTION 'public.profiles must contain a role column.';
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.ensure_my_profile()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id uuid;
  current_profile public.profiles;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Only insert when absent. Existing profile rows and roles are untouched.
  INSERT INTO public.profiles (id, role)
  VALUES (current_user_id, 'user')
  ON CONFLICT (id) DO NOTHING;

  SELECT *
  INTO current_profile
  FROM public.profiles
  WHERE id = current_user_id;

  RETURN current_profile;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_my_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_my_profile() TO authenticated;

NOTIFY pgrst, 'reload schema';
