-- ==============================================================================
-- ZAIRA FURNISHING — Cloudflare D1 / Relational Database Migration 0007
-- Dynamic Product Customer Reviews Table & Indexes
-- ==============================================================================

CREATE TABLE IF NOT EXISTS product_reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_verified_purchase INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'APPROVED' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON product_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON product_reviews(status);
