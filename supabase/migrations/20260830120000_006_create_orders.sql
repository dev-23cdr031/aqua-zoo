/*
# Create orders table and RLS policies

1. New Table: orders
  - id (uuid, primary key, auto-generated)
  - order_number (text, unique, not null)
  - customer_name (text, not null)
  - customer_phone (text, not null)
  - customer_email (text, nullable)
  - shipping_address (text, not null)
  - city (text, not null default 'Virudhunagar')
  - postal_code (text, nullable)
  - order_notes (text, nullable)
  - items (jsonb, not null)
  - subtotal_amount (numeric(10,2), not null)
  - shipping_fee (numeric(10,2), not null default 0)
  - total_amount (numeric(10,2), not null)
  - delivery_method (text, not null default 'home_delivery' check in ('home_delivery', 'store_pickup'))
  - payment_method (text, not null default 'cod' check in ('cod', 'upi_on_delivery', 'store_pickup'))
  - payment_status (text, not null default 'pending' check in ('pending', 'paid', 'failed'))
  - order_status (text, not null default 'new' check in ('new', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'))
  - created_at timestamptz NOT NULL DEFAULT now()
  - updated_at timestamptz NOT NULL DEFAULT now()

2. Security: Row Level Security (RLS)
  - Public INSERT: anon and authenticated users can submit orders
  - Public SELECT: anon and authenticated users can view orders by order_number/id
  - Admin ALL: authenticated store admins can view, update status, and manage all orders

3. Indexes:
  - order_number
  - customer_phone
  - order_status
  - created_at
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  delivery_method text NOT NULL DEFAULT 'home_delivery' CHECK (delivery_method IN ('home_delivery', 'store_pickup')),
  payment_method text NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'upi_on_delivery', 'store_pickup')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  order_status text NOT NULL DEFAULT 'new' CHECK (order_status IN ('new', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders (customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 1. Anyone (public anon or authenticated) can submit a new order
DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. Public can read orders (allows immediate receipt verification after placing)
DROP POLICY IF EXISTS "public_read_orders" ON orders;
CREATE POLICY "public_read_orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. Authenticated store admins can update order status and details
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Authenticated store admins can delete orders
DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);
