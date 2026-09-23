-- Allow authenticated admins to SELECT ALL products (including inactive) and ALL gallery items (including inactive)
-- The existing public_read_active_* policies only show is_active=true rows.
-- These new admin_read_all_* policies are ADDITIVE (permissive) so authenticated
-- users get the union of active + inactive rows.

DROP POLICY IF EXISTS "admin_read_all_products" ON products;
CREATE POLICY "admin_read_all_products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_read_all_gallery" ON gallery;
CREATE POLICY "admin_read_all_gallery"
  ON gallery FOR SELECT
  TO authenticated
  USING (true);
