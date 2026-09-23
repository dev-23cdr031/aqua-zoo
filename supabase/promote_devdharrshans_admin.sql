-- Grant admin access to devdharrshans.23csd@kongu.edu
-- Run this in the Supabase Dashboard -> SQL Editor (requires owner/service access).
-- The user must have already signed up once so their profile row exists
-- (a profile row is created automatically on first sign-in via ensure_my_profile()).

UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'devdharrshans.23csd@kongu.edu');

-- Verify it worked (should return the user with role = 'admin'):
SELECT p.id, u.email, p.role
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'devdharrshans.23csd@kongu.edu';
