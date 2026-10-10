-- ==============================================================================
-- ZAIRA FURNISHING — Cloudflare D1 / Relational Database Migration 0009
-- Add read/unread status tracking to order_notifications table
-- ==============================================================================

ALTER TABLE order_notifications ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0;
ALTER TABLE order_notifications ADD COLUMN read_at TEXT;

CREATE INDEX IF NOT EXISTS idx_order_notifications_read ON order_notifications(is_read);
