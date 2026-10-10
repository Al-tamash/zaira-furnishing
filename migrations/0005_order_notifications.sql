-- ==============================================================================
-- ZAIRA FURNISHING — Cloudflare D1 / Relational Database Migration 0005
-- Customer & Admin Order Notifications, Delivery Ledger & Idempotency
-- ==============================================================================

CREATE TABLE IF NOT EXISTS order_notifications (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    recipient_type TEXT NOT NULL, -- 'CUSTOMER' or 'ADMIN'
    event_type TEXT NOT NULL,     -- 'NEW_ORDER_CUSTOMER', 'NEW_ORDER_ADMIN', 'ORDER_STATUS_UPDATED_CUSTOMER'
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
    provider TEXT NOT NULL DEFAULT 'generic',
    provider_message_id TEXT,
    error_message TEXT,
    payload_summary TEXT,         -- JSON summary of notification contents
    idempotency_key TEXT NOT NULL UNIQUE,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    sent_at TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_order_notifications_order ON order_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_customer ON order_notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_event ON order_notifications(event_type);
CREATE INDEX IF NOT EXISTS idx_order_notifications_status ON order_notifications(status);
CREATE INDEX IF NOT EXISTS idx_order_notifications_idempotency ON order_notifications(idempotency_key);
