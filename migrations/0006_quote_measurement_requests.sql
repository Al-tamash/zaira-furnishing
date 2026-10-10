-- ==============================================================================
-- ZAIRA FURNISHING — Cloudflare D1 / Relational Database Migration 0006
-- Quote Requests & Free Measurement Requests Backend Persistence
-- ==============================================================================

-- 1. QUOTE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS quote_requests (
    id TEXT PRIMARY KEY,
    request_number TEXT NOT NULL UNIQUE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_name_snapshot TEXT NOT NULL,
    product_sku_snapshot TEXT,
    category_name_snapshot TEXT,
    category_slug_snapshot TEXT,
    variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
    variant_name_snapshot TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    dimensions TEXT,
    customization_details TEXT, -- JSON Object holding bespoke specifications
    customer_notes TEXT,
    starting_price_snapshot REAL,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW', 'CONTACTED', 'QUOTED', 'CLOSED', 'CANCELLED')),
    idempotency_key TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_number ON quote_requests(request_number);
CREATE INDEX IF NOT EXISTS idx_quote_requests_user ON quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_product ON quote_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created ON quote_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_quote_requests_idempotency ON quote_requests(idempotency_key);

-- 2. MEASUREMENT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS measurement_requests (
    id TEXT PRIMARY KEY,
    request_number TEXT NOT NULL UNIQUE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_name_snapshot TEXT NOT NULL,
    product_sku_snapshot TEXT,
    category_name_snapshot TEXT,
    category_slug_snapshot TEXT,
    variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
    variant_name_snapshot TEXT,
    address TEXT NOT NULL,
    preferred_date TEXT NOT NULL,
    preferred_time_slot TEXT NOT NULL,
    dimensions TEXT,
    customer_notes TEXT,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED')),
    idempotency_key TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_measurement_requests_number ON measurement_requests(request_number);
CREATE INDEX IF NOT EXISTS idx_measurement_requests_user ON measurement_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_measurement_requests_product ON measurement_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_measurement_requests_status ON measurement_requests(status);
CREATE INDEX IF NOT EXISTS idx_measurement_requests_date ON measurement_requests(preferred_date);
CREATE INDEX IF NOT EXISTS idx_measurement_requests_created ON measurement_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_measurement_requests_idempotency ON measurement_requests(idempotency_key);
