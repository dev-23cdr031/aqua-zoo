/*
# Create categories table

1. New Tables
- `categories`
  - `id` (uuid, primary key, auto-generated)
  - `name` (text, not null) — display name e.g. "Freshwater Fish"
  - `slug` (text, not null, unique) — URL-friendly identifier
  - `sort_order` (smallint, default 0) — controls display ordering
  - `created_at` (timestamptz, default now())
2. Seed Data
- Inserts the 5 product categories currently hardcoded in data.ts:
  "Freshwater Fish", "Marine Fish", "Aquatic Plants", "Tanks & Accessories", "Fish Food"
  (The frontend also has "All" as a filter chip, but that is a UI-only pseudo-category
   and is NOT stored in the database.)
3. Security
- RLS enabled on `categories`.
- Public read: anyone (anon + authenticated) can SELECT all rows — the storefront
  needs category data to render filter chips.
- Admin write: only authenticated users can INSERT, UPDATE, DELETE — for future
  admin dashboard use.
4. Indexes
- Unique index on `slug` for lookups.
- Index on `sort_order` for ordered queries.
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories (sort_order);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Seed the 5 categories from the existing frontend data.ts
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Freshwater Fish',    'freshwater-fish',     1),
  ('Marine Fish',        'marine-fish',         2),
  ('Aquatic Plants',     'aquatic-plants',      3),
  ('Tanks & Accessories','tanks-accessories',   4),
  ('Fish Food',          'fish-food',           5)
ON CONFLICT (slug) DO NOTHING;
