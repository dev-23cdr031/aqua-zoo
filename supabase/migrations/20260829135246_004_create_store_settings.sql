/*
# Create store_settings table

1. New Tables
- `store_settings`
  - `id` (smallint, primary key, always 1) — singleton row
  - `store_name` (text, not null, default 'Sakthi''s Aqua Zoo')
  - `location` (text, not null) — e.g. "Virudhunagar"
  - `address` (text, not null) — full street address
  - `phone` (text, not null) — phone/WhatsApp number
  - `email` (text, nullable) — contact email
  - `hours` (text, not null) — opening hours summary
  - `stat_species` (integer, not null, default 120) — hero stat: fish species count
  - `stat_plants` (integer, not null, default 45) — hero stat: plant varieties count
  - `stat_years` (integer, not null, default 8) — hero stat: years of service
  - `updated_at` (timestamptz, not null, default now()) — auto-updated via trigger

2. Seed Data
- Inserts a single row (id=1) with all store info currently hardcoded in App.tsx:
  address, phone, email, hours, hero stats.

3. Security
- RLS enabled on `store_settings`.
- Public read: anyone can SELECT (the storefront needs this data).
- Admin update: only authenticated users can UPDATE (no INSERT/DELETE — singleton).

4. Trigger
- Auto-update `updated_at` on every UPDATE.
*/
CREATE TABLE IF NOT EXISTS store_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name text NOT NULL DEFAULT 'Sakthi''s Aqua Zoo',
  location text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text,
  hours text NOT NULL,
  stat_species integer NOT NULL DEFAULT 120,
  stat_plants integer NOT NULL DEFAULT 45,
  stat_years integer NOT NULL DEFAULT 8,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Only one row can ever exist
INSERT INTO store_settings (id, store_name, location, address, phone, email, hours, stat_species, stat_plants, stat_years)
VALUES (
  1,
  'Sakthi''s Aqua Zoo',
  'Virudhunagar',
  'No. 42, KVS Street, Near Old Bus Stand, Virudhunagar, Tamil Nadu 626001',
  '+91 98765 43210',
  'hello@sakthisaquazoo.in',
  'Mon–Sat: 9:30 AM – 8:30 PM · Sun: 10:00 AM – 6:00 PM',
  120,
  45,
  8
)
ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS trg_store_settings_updated_at ON store_settings;
CREATE TRIGGER trg_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_store_settings" ON store_settings;
CREATE POLICY "public_read_store_settings"
  ON store_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_update_store_settings" ON store_settings;
CREATE POLICY "admin_update_store_settings"
  ON store_settings FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);
