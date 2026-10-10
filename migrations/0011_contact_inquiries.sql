-- ==============================================================================
-- ZAIRA FURNISHING — Cloudflare D1 / Relational Database Migration 0011
-- Contact Inquiries Backend Persistence
-- ==============================================================================

CREATE TABLE IF NOT EXISTS contact_inquiries (
    id TEXT PRIMARY KEY,
    inquiry_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW', 'READ', 'CONTACTED', 'RESOLVED', 'ARCHIVED')),
    idempotency_key TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_number ON contact_inquiries(inquiry_number);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON contact_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_phone ON contact_inquiries(phone);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created ON contact_inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_idempotency ON contact_inquiries(idempotency_key);
