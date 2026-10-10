-- ==============================================================================
-- ZAIRA FURNISHING — Cloudflare D1 / Relational Database Migration 0003
-- Customer Authentication, Server Sessions, Database Wishlist & Database Cart
-- ==============================================================================

-- 1. SERVER-SIDE CUSTOMER SESSIONS (HttpOnly Secure Session Token Storage)
CREATE TABLE IF NOT EXISTS customer_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cust_sessions_user ON customer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cust_sessions_expires ON customer_sessions(expires_at);

-- 2. CUSTOMER WISHLIST (Unique per customer and product)
CREATE TABLE IF NOT EXISTS wishlist_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist_items(product_id);

-- 3. CUSTOMER CARTS (One active cart per customer)
CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_carts_user ON carts(user_id);

-- 4. CART ITEMS (Database-backed items with server-verified price snapshots)
CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
    unit_price_snapshot REAL NOT NULL,
    customization_data TEXT, -- JSON Object: { sizeLabel, headingStyle, customDimensions, bespokeNotes }
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant ON cart_items(variant_id);
