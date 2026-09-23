-- Shared Supabase authentication roles and per-user order ownership.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone text;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

DROP POLICY IF EXISTS "users_read_own_profile" ON public.profiles;
CREATE POLICY "users_read_own_profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "admins_update_profiles" ON public.profiles;
CREATE POLICY "admins_update_profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role AND NOT public.is_admin() THEN
    NEW.role = OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role_changes ON public.profiles;
CREATE TRIGGER protect_profile_role_changes
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure users created before this migration also have a role row.
INSERT INTO public.profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;

UPDATE public.profiles AS profiles
SET
  full_name = COALESCE(profiles.full_name, users.raw_user_meta_data ->> 'full_name'),
  phone = COALESCE(profiles.phone, users.raw_user_meta_data ->> 'phone')
FROM auth.users AS users
WHERE users.id = profiles.id;

CREATE OR REPLACE FUNCTION public.ensure_my_profile()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_profile public.profiles;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.profiles (id, full_name, phone)
  SELECT id, raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'phone'
  FROM auth.users
  WHERE id = auth.uid()
  ON CONFLICT (id) DO NOTHING;

  SELECT * INTO current_profile
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN current_profile;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_my_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_my_profile() TO authenticated;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);

DROP POLICY IF EXISTS "public_read_orders" ON public.orders;
CREATE POLICY "users_read_own_orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "public_insert_orders" ON public.orders;
CREATE POLICY "users_insert_own_orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_update_orders" ON public.orders;
CREATE POLICY "admins_update_orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_orders" ON public.orders;
CREATE POLICY "admins_delete_orders"
  ON public.orders FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Restrict existing admin write policies to actual admins.
DROP POLICY IF EXISTS "admin_insert_categories" ON public.categories;
CREATE POLICY "admins_insert_categories" ON public.categories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_categories" ON public.categories;
CREATE POLICY "admins_update_categories" ON public.categories FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_categories" ON public.categories;
CREATE POLICY "admins_delete_categories" ON public.categories FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_products" ON public.products;
CREATE POLICY "admins_insert_products" ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_products" ON public.products;
CREATE POLICY "admins_update_products" ON public.products FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_products" ON public.products;
CREATE POLICY "admins_delete_products" ON public.products FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_read_all_products" ON public.products;
CREATE POLICY "admin_read_all_products" ON public.products FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "admin_insert_gallery" ON public.gallery;
CREATE POLICY "admins_insert_gallery" ON public.gallery FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_gallery" ON public.gallery;
CREATE POLICY "admins_update_gallery" ON public.gallery FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_gallery" ON public.gallery;
CREATE POLICY "admins_delete_gallery" ON public.gallery FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_read_all_gallery" ON public.gallery;
CREATE POLICY "admin_read_all_gallery" ON public.gallery FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "admin_read_enquiries" ON public.enquiries;
CREATE POLICY "admin_read_enquiries" ON public.enquiries FOR SELECT TO authenticated
  USING (public.is_admin());
DROP POLICY IF EXISTS "admin_update_enquiries" ON public.enquiries;
CREATE POLICY "admin_update_enquiries" ON public.enquiries FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_store_settings" ON public.store_settings;
CREATE POLICY "admin_update_store_settings" ON public.store_settings FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());