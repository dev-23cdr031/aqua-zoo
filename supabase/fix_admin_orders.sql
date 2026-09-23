-- ============================================================
-- AQUA ZOO  ·  FIX: missing `orders` table + admin helpers
-- ------------------------------------------------------------
-- Why: The live Supabase project is missing the public.orders
-- table and the admin_list_customers() function, so customer
-- orders are NOT stored and the Admin Orders/Customers tabs
-- show errors / no data.
-- This script is IDEMPOTENT (safe to run multiple times).
-- How to run: Supabase Dashboard -> SQL Editor -> new query
--             -> paste -> Run. Then hard-refresh the site.
-- ============================================================

-- 1) ORDERS TABLE (matches the app payload + final status list)
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL CHECK (length(btrim(customer_name)) > 0),
  customer_phone text NOT NULL CHECK (length(btrim(customer_phone)) > 0),
  customer_email text,
  shipping_address text NOT NULL CHECK (length(btrim(shipping_address)) > 0),
  city text NOT NULL DEFAULT 'Virudhunagar',
  postal_code text,
  order_notes text,
  items jsonb NOT NULL,
  subtotal_amount numeric(10,2) NOT NULL CHECK (subtotal_amount >= 0),
  shipping_fee numeric(10,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  delivery_method text NOT NULL DEFAULT 'home_delivery'
    CHECK (delivery_method IN ('home_delivery', 'store_pickup')),
  payment_method text NOT NULL DEFAULT 'cod'
    CHECK (payment_method IN ('cod', 'upi_on_delivery', 'store_pickup')),
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed')),
  order_status text NOT NULL DEFAULT 'pending'
    CHECK (order_status IN ('pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- items must be a non-empty JSON array
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_items_array_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_items_array_check
  CHECK (jsonb_typeof(items) = 'array' AND jsonb_array_length(items) > 0);

-- indexes used by the app
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders (customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_status  ON public.orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id       ON public.orders (user_id);

-- auto-touch updated_at on changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) ROW LEVEL SECURITY
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_orders"     ON public.orders;
DROP POLICY IF EXISTS "users_insert_own_orders"  ON public.orders;
DROP POLICY IF EXISTS "public_read_orders"       ON public.orders;
DROP POLICY IF EXISTS "users_read_own_orders"    ON public.orders;
DROP POLICY IF EXISTS "admin_update_orders"      ON public.orders;
DROP POLICY IF EXISTS "admins_update_orders"     ON public.orders;
DROP POLICY IF EXISTS "admin_delete_orders"      ON public.orders;
DROP POLICY IF EXISTS "admins_delete_orders"     ON public.orders;

-- customers can place their own order
CREATE POLICY "users_insert_own_orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- customers see own orders; admins see everything
CREATE POLICY "users_read_own_orders"
  ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- only admins change or delete orders
CREATE POLICY "admins_update_orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "admins_delete_orders"
  ON public.orders FOR DELETE TO authenticated
  USING (public.is_admin());

-- 3) ADMIN HELPER: customer directory (Customers + Dashboard tabs)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

DROP FUNCTION IF EXISTS public.admin_list_customers();
CREATE OR REPLACE FUNCTION public.admin_list_customers()
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  phone text,
  role text,
  created_at timestamptz,
  order_count bigint,
  total_spend numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    profiles.id,
    profiles.full_name,
    users.email,
    profiles.phone,
    profiles.role,
    profiles.created_at,
    COUNT(orders.id)::bigint AS order_count,
    COALESCE(SUM(CASE WHEN orders.order_status <> 'cancelled' THEN orders.total_amount ELSE 0 END), 0)::numeric AS total_spend
  FROM public.profiles AS profiles
  JOIN auth.users AS users ON users.id = profiles.id
  LEFT JOIN public.orders AS orders ON orders.user_id = profiles.id
  WHERE public.is_admin()
  GROUP BY profiles.id, profiles.full_name, users.email, profiles.phone, profiles.role, profiles.created_at
  ORDER BY profiles.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_list_customers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_customers() TO authenticated;

-- 4) New sign-ups automatically get a profile row
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

-- 5) Make sure admins can manage the other store tables
--    (idempotent; safe even if the policies already exist)
DROP POLICY IF EXISTS "admin_insert_products"    ON public.products;
DROP POLICY IF EXISTS "admins_insert_products"   ON public.products;
CREATE POLICY "admins_insert_products" ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_products"    ON public.products;
DROP POLICY IF EXISTS "admins_update_products"   ON public.products;
CREATE POLICY "admins_update_products" ON public.products FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_products"    ON public.products;
DROP POLICY IF EXISTS "admins_delete_products"   ON public.products;
CREATE POLICY "admins_delete_products" ON public.products FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_read_all_products" ON public.products;
CREATE POLICY "admin_read_all_products" ON public.products FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "admin_insert_categories"    ON public.categories;
DROP POLICY IF EXISTS "admins_insert_categories"   ON public.categories;
CREATE POLICY "admins_insert_categories" ON public.categories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_categories"    ON public.categories;
DROP POLICY IF EXISTS "admins_update_categories"   ON public.categories;
CREATE POLICY "admins_update_categories" ON public.categories FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_categories"    ON public.categories;
DROP POLICY IF EXISTS "admins_delete_categories"   ON public.categories;
CREATE POLICY "admins_delete_categories" ON public.categories FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_gallery"    ON public.gallery;
DROP POLICY IF EXISTS "admins_insert_gallery"   ON public.gallery;
CREATE POLICY "admins_insert_gallery" ON public.gallery FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_gallery"    ON public.gallery;
DROP POLICY IF EXISTS "admins_update_gallery"   ON public.gallery;
CREATE POLICY "admins_update_gallery" ON public.gallery FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_gallery"    ON public.gallery;
DROP POLICY IF EXISTS "admins_delete_gallery"   ON public.gallery;
CREATE POLICY "admins_delete_gallery" ON public.gallery FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_read_all_gallery" ON public.gallery;
CREATE POLICY "admin_read_all_gallery" ON public.gallery FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "admin_read_enquiries"   ON public.enquiries;
CREATE POLICY "admin_read_enquiries" ON public.enquiries FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_enquiries"  ON public.enquiries;
DROP POLICY IF EXISTS "admins_update_enquiries" ON public.enquiries;
CREATE POLICY "admin_update_enquiries" ON public.enquiries FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_store_settings" ON public.store_settings;
CREATE POLICY "admin_update_store_settings" ON public.store_settings FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6) Make PostgREST (the API the app uses) see the new objects NOW
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- VERIFICATION (run after the above, they will show result rows)
-- ============================================================
-- SELECT * FROM public.orders ORDER BY created_at DESC LIMIT 10;
-- SELECT p.id, u.email, p.role FROM public.profiles p
--   JOIN auth.users u ON u.id = p.id ORDER BY p.created_at;


