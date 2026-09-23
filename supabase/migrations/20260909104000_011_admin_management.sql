-- Extend the existing role-protected schema for the admin management surface.
-- This migration is idempotent and does not expose auth secrets.

-- Normalize legacy order states before tightening the supported workflow.
UPDATE public.orders SET order_status = 'pending' WHERE order_status = 'new';
UPDATE public.orders SET order_status = 'ready' WHERE order_status = 'out_for_delivery';
UPDATE public.orders SET order_status = 'completed' WHERE order_status = 'delivered';

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_order_status_check
  CHECK (order_status IN ('pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'));

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_items_array_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_items_array_check
  CHECK (jsonb_typeof(items) = 'array' AND jsonb_array_length(items) > 0);

-- Replace the earlier broad policies with admin-only management policies.
DROP POLICY IF EXISTS "public_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "public_read_orders" ON public.orders;
DROP POLICY IF EXISTS "users_read_own_orders" ON public.orders;
DROP POLICY IF EXISTS "users_insert_own_orders" ON public.orders;
DROP POLICY IF EXISTS "admin_update_orders" ON public.orders;
DROP POLICY IF EXISTS "admins_update_orders" ON public.orders;
DROP POLICY IF EXISTS "admin_delete_orders" ON public.orders;
DROP POLICY IF EXISTS "admins_delete_orders" ON public.orders;

CREATE POLICY "users_insert_own_orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_read_own_orders"
  ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admins_update_orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admins_delete_orders"
  ON public.orders FOR DELETE TO authenticated
  USING (public.is_admin());

-- Admins need a safe, read-only customer directory. Email comes from auth.users;
-- passwords and tokens are never returned.
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

-- Keep direct profile edits restricted to admins or the profile owner.
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_update_profiles" ON public.profiles;
CREATE POLICY "users_update_own_profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

NOTIFY pgrst, 'reload schema';
