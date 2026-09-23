/*
# Create products table

1. New Tables
- `products`
  - `id` (uuid, primary key, auto-generated)
  - `name` (text, not null) — product name e.g. "Neon Tetra"
  - `category_id` (uuid, not null, FK → categories.id ON DELETE RESTRICT)
  - `price` (numeric(10,2), not null) — price in INR
  - `unit` (text, not null) — pricing unit e.g. "per fish", "per pair"
  - `description` (text, not null) — product description shown on card
  - `tag` (text, nullable) — optional badge e.g. "Bestseller", "New", "Beginner"
  - `image_url` (text, not null) — must start with https:// (CHECK constraint)
  - `is_active` (boolean, not null, default true) — soft-delete / hide from storefront
  - `sort_order` (smallint, not null, default 0) — display ordering
  - `created_at` (timestamptz, not null, default now())
  - `updated_at` (timestamptz, not null, default now()) — auto-updated via trigger
2. Seed Data
- Inserts all 14 products currently hardcoded in data.ts, mapped to their
  category via a subquery on the category slug.
3. Security
- RLS enabled on `products`.
- Public read: anyone can SELECT rows where is_active = true (storefront display).
- Admin write: only authenticated users can INSERT, UPDATE, DELETE (all rows).
4. Indexes
- Index on `category_id` for filter queries.
- Index on `is_active` for storefront queries.
- Index on `sort_order` for ordered display.
5. Trigger
- `update_products_updated_at` — auto-updates `updated_at` on every UPDATE.
*/

-- Updated_at trigger function (shared, idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  unit text NOT NULL,
  description text NOT NULL,
  tag text,
  image_url text NOT NULL CHECK (image_url ~ '^https://'),
  is_active boolean NOT NULL DEFAULT true,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products (sort_order);

-- Auto-update updated_at on row change
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_products" ON products;
CREATE POLICY "public_read_active_products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products"
  ON products FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Seed all 14 products from data.ts
INSERT INTO products (name, category_id, price, unit, description, tag, image_url, sort_order)
VALUES
  ('Neon Tetra',            (SELECT id FROM categories WHERE slug = 'freshwater-fish'),     40,  'per pair', 'Glowing blue-red schooling fish, perfect for community tanks.',           'Bestseller', 'https://images.pexels.com/photos/18435511/pexels-photo-18435511.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 1),
  ('Fancy Guppy',           (SELECT id FROM categories WHERE slug = 'freshwater-fish'),     25,  'per fish', 'Vibrant livebearers in rainbow colours, easy for beginners.',           'Beginner',   'https://images.pexels.com/photos/18435512/pexels-photo-18435512.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 2),
  ('Clown Loach',           (SELECT id FROM categories WHERE slug = 'freshwater-fish'),    120,  'per fish', 'Playful orange-striped bottom dweller that keeps snails in check.',     NULL,         'https://images.pexels.com/photos/31956913/pexels-photo-31956913.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 3),
  ('Koi Carp',              (SELECT id FROM categories WHERE slug = 'freshwater-fish'),    350,  'per fish', 'Graceful patterned koi ideal for outdoor ponds and large tanks.',      NULL,         'https://images.pexels.com/photos/14867656/pexels-photo-14867656.png?auto=compress&cs=tinysrgb&h=650&w=940',  4),
  ('Rainbow Wrasse',        (SELECT id FROM categories WHERE slug = 'marine-fish'),       680,  'per fish', 'Reef-safe wrasse with electric rainbow colouring over coral.',         'Marine',     'https://images.pexels.com/photos/36982268/pexels-photo-36982268.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 5),
  ('Orange Anthias',        (SELECT id FROM categories WHERE slug = 'marine-fish'),       950,  'per fish', 'Brilliant orange reef fish that brings motion to marine setups.',     NULL,         'https://images.pexels.com/photos/31807563/pexels-photo-31807563.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 6),
  ('Zebra Danio',           (SELECT id FROM categories WHERE slug = 'freshwater-fish'),    20,  'per fish', 'Hardy striped swimmers, lively and great for planted tanks.',          NULL,         'https://images.pexels.com/photos/18435522/pexels-photo-18435522.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 7),
  ('Tropical Community Set',(SELECT id FROM categories WHERE slug = 'freshwater-fish'),   499,  'per set',  'Curated mix of 12 peaceful community fish to start a lively tank.',   'Combo',      'https://images.pexels.com/photos/12829679/pexels-photo-12829679.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 8),
  ('Anubias Nana',          (SELECT id FROM categories WHERE slug = 'aquatic-plants'),      90,  'per pot',  'Low-light rosette plant that thrives attached to driftwood.',           NULL,         'https://images.pexels.com/photos/8970782/pexels-photo-8970782.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',   9),
  ('Java Fern Mat',         (SELECT id FROM categories WHERE slug = 'aquatic-plants'),      75,  'per mat',  'Hardy rhizome plant that purifies water and shelters fry.',            NULL,         'https://images.pexels.com/photos/31047030/pexels-photo-31047030.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 10),
  ('Rimless Glass Tank 60cm',(SELECT id FROM categories WHERE slug = 'tanks-accessories'), 2400, 'per tank', 'Crystal-clear low-iron aquarium with foam mat included.',              'New',        'https://images.pexels.com/photos/37796017/pexels-photo-37796017.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 11),
  ('LED Aqua Light 30W',    (SELECT id FROM categories WHERE slug = 'tanks-accessories'),  1100, 'per unit', 'Full-spectrum rampable light that brings out fish and plant colour.',  NULL,         'https://images.pexels.com/photos/7254512/pexels-photo-7254512.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',   12),
  ('TetraMin Flakes 200g',  (SELECT id FROM categories WHERE slug = 'fish-food'),          180, 'per tin',  'Balanced staple flake food for all small tropical fish.',             NULL,         'https://images.pexels.com/photos/18435511/pexels-photo-18435511.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 13),
  ('Brine Shrimp Cubes',    (SELECT id FROM categories WHERE slug = 'fish-food'),           95, 'per pack', 'High-protein frozen treat that boosts colour and vitality.',          NULL,         'https://images.pexels.com/photos/18435522/pexels-photo-18435522.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 14)
ON CONFLICT DO NOTHING;
