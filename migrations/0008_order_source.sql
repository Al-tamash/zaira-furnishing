-- ==============================================================================
-- ZAIRA FURNISHING — Cloudflare D1 / Relational Database Migration 0008
-- Add order_source field to orders table (WEB, WHATSAPP, QUOTE, MEASUREMENT)
-- ==============================================================================

ALTER TABLE orders ADD COLUMN order_source TEXT NOT NULL DEFAULT 'WEB';

CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(order_source);
