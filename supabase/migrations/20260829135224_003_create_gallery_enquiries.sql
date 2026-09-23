/*
# Create gallery and enquiries tables

1. New Tables

## gallery
  - `id` (uuid, primary key, auto-generated)
  - `image_url` (text, not null, CHECK ^https://) — photo URL
  - `caption` (text, not null) — overlay caption e.g. "Display Reef Tank"
  - `sort_order` (smallint, not null, default 0) — display ordering
  - `is_active` (boolean, not null, default true) — soft-delete
  - `created_at` (timestamptz, not null, default now())
  Seed: all 6 gallery images from data.ts

## enquiries
  - `id` (uuid, primary key, auto-generated)
  - `product_id` (uuid, nullable, FK → products.id ON DELETE SET NULL)
  - `customer_name` (text, not null) — required
  - `customer_phone` (text, not null) — required
  - `customer_email` (text, nullable) — optional
  - `message` (text, nullable) — optional
  - `status` (text, not null, default 'new', CHECK in ('new','contacted','closed'))
  - `created_at` (timestamptz, not null, default now())
  No seed data — this table starts empty, populated by customer enquiries.

2. Security

## gallery RLS
  - Public read: SELECT where is_active = true
  - Admin write: INSERT/UPDATE/DELETE for authenticated only

## enquiries RLS
  - Public INSERT only: anyone can submit an enquiry (WITH CHECK true)
  - NO public SELECT — visitors cannot read other people's enquiries
  - Admin SELECT all: authenticated can read all enquiries
  - Admin UPDATE: authenticated can update status

3. Indexes
  - gallery: is_active, sort_order
  - enquiries: product_id, status, created_at
*/
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL CHECK (image_url ~ '^https://'),
  caption text NOT NULL,
  sort_order smallint NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_is_active ON gallery (is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON gallery (sort_order);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_gallery" ON gallery;
CREATE POLICY "public_read_active_gallery"
  ON gallery FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "admin_insert_gallery" ON gallery;
CREATE POLICY "admin_insert_gallery"
  ON gallery FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_gallery" ON gallery;
CREATE POLICY "admin_update_gallery"
  ON gallery FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_gallery" ON gallery;
CREATE POLICY "admin_delete_gallery"
  ON gallery FOR DELETE
  TO authenticated
  USING (true);

-- Seed 6 gallery images from data.ts
INSERT INTO gallery (image_url, caption, sort_order) VALUES
  ('https://images.pexels.com/photos/31047030/pexels-photo-31047030.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Display Reef Tank',    1),
  ('https://images.pexels.com/photos/12829679/pexels-photo-12829679.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Community Aquarium',   2),
  ('https://images.pexels.com/photos/31956913/pexels-photo-31956913.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Koi Pond Corner',      3),
  ('https://images.pexels.com/photos/8970782/pexels-photo-8970782.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',  'Planted Aquascape',    4),
  ('https://images.pexels.com/photos/36982268/pexels-photo-36982268.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Marine Reef Wall',    5),
  ('https://images.pexels.com/photos/31807563/pexels-photo-31807563.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Anthias Display',     6)
ON CONFLICT DO NOTHING;

-- ===== enquiries =====
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  customer_name text NOT NULL CHECK (length(btrim(customer_name)) > 0),
  customer_phone text NOT NULL CHECK (length(btrim(customer_phone)) > 0),
  customer_email text,
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_product_id ON enquiries (product_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries (created_at DESC);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Public can INSERT enquiries but cannot SELECT them back
DROP POLICY IF EXISTS "public_insert_enquiries" ON enquiries;
CREATE POLICY "public_insert_enquiries"
  ON enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin can SELECT all enquiries
DROP POLICY IF EXISTS "admin_read_enquiries" ON enquiries;
CREATE POLICY "admin_read_enquiries"
  ON enquiries FOR SELECT
  TO authenticated
  USING (true);

-- Admin can UPDATE enquiry status
DROP POLICY IF EXISTS "admin_update_enquiries" ON enquiries;
CREATE POLICY "admin_update_enquiries"
  ON enquiries FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);
