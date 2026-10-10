-- ==============================================================================
-- ZAIRA FURNISHING — Cloudflare D1 / Relational Database Migration 0004
-- Customer Orders, Order Items, Snapshots & COD Checkout
-- ==============================================================================

-- Drop old empty placeholder tables if present
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

-- 1. ORDERS TABLE
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'CONFIRMED', -- 'PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'
    payment_method TEXT NOT NULL DEFAULT 'COD', -- 'COD'
    payment_status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'FAILED', 'REFUNDED'
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    landmark TEXT,
    delivery_option TEXT NOT NULL DEFAULT 'standard', -- 'standard', 'service_visit'
    site_visit_required INTEGER NOT NULL DEFAULT 0,
    site_visit_date TEXT,
    site_visit_time TEXT,
    subtotal REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    delivery_charge REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL,
    notes TEXT,
    idempotency_key TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON orders(idempotency_key);

-- 2. ORDER ITEMS TABLE (With historical product & price snapshots)
CREATE TABLE order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id),
    variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    variant_name_snapshot TEXT,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price_snapshot REAL NOT NULL,
    line_total REAL NOT NULL,
    customization_data TEXT, -- JSON Object storing measurements, pleats, headings, etc.
    product_type TEXT NOT NULL DEFAULT 'standard',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant ON order_items(variant_id);
