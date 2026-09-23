-- ============================================================================
-- Grant ADMIN access to brandnestcompany@gmail.com
-- ============================================================================
-- HOW TO RUN:
--   1. Make sure the account has signed up / signed in at least once.
--      (Signing up automatically creates a row in public.profiles with role
--       'user' via the on_auth_user_created / ensure_my_profile() flow.)
--   2. Open the Supabase Dashboard -> SQL Editor (requires owner access).
--      Project: https://supabase.com/dashboard/project/qixogsgtgvdhqronviyb
--   3. Paste this whole script and click "Run".
--
-- NOTE: The role-protection trigger would silently revert a plain UPDATE in the
--       SQL Editor (auth.uid() is NULL there), so we disable it temporarily,
--       promote, then re-enable it.
-- ============================================================================

-- Temporarily disable the role-protection trigger.
ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_role_changes;

-- Promote the user. If their profile row does not exist yet (account created but
-- never signed in), create it on the fly. If it exists, just set role = 'admin'.
INSERT INTO public.profiles (id, role)
SELECT id, 'admin'
FROM auth.users
WHERE lower(email) = 'brandnestcompany@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Re-enable the role-protection trigger.
ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_role_changes;

-- Verify it worked (should return one row with role = 'admin').
-- If NO row is returned, the account does not exist yet in auth.users —
-- ask them to sign up at the site first, then re-run this script.
SELECT p.id, u.email, p.role
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE lower(u.email) = 'brandnestcompany@gmail.com';
