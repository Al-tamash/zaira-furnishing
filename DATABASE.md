# Zaira Furnishing — Database Architecture & Deployment Guide

This document describes the production-hardened relational database architecture for **Zaira Furnishing**, covering Cloudflare D1 production deployment, local SQLite development, environment variables, migrations, health monitoring, and persistence verification.

---

## 1. Database Architecture Overview

The database layer provides an explicit, environment-aware abstraction implemented in `src/lib/db/index.ts`:

```text
┌────────────────────────────────────────────────────────┐
│                   DatabaseClient                       │
│    query() | queryOne() | execute() | batch() | ...    │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
   Development / Test              Production Runtime
  (Local SQLite Driver)         (Cloudflare D1 HTTP Client)
             │                           │
    data/zaira.db (WAL)        Cloudflare Global Network
```

### Development Mode (`NODE_ENV=development` or `NODE_ENV=test`)
- Uses local Node.js zero-dependency SQLite engine (`node:sqlite` in Node 22+).
- Persists to `data/zaira.db`.
- WAL (Write-Ahead Logging) and Foreign Key constraints enabled for durability and relational integrity.

### Production Mode (`NODE_ENV=production`)
- Exclusively uses **Cloudflare D1** via Cloudflare REST API v4.
- All multi-statement transactions (e.g. creating orders, items, and cart cleanup) are executed using native Cloudflare D1 **atomic batching** (`db.batch(...)`).
- **NEVER silently falls back to local SQLite**: If Cloudflare D1 environment variables are missing or incomplete, the application fails immediately and explicitly with a descriptive configuration error.

---

## 2. Required Production Environment Variables

To run in production (e.g., on Vercel, Cloudflare Pages, AWS, or Docker), set the following environment variables:

| Variable | Description | Example / Format |
| :--- | :--- | :--- |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | `0069ef7d5a396094dfe7dace3a03a16c` |
| `CLOUDFLARE_D1_DATABASE_ID` | Cloudflare D1 Database UUID | `xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token with `D1:Edit` permission | Bearer token secret |

> [!WARNING]
> - Never prefix these variables with `NEXT_PUBLIC_`.
> - Never commit actual tokens or database IDs into git.
> - Ensure these are added to your hosting platform's Environment Variables (e.g., Vercel Project Settings > Environment Variables).

---

## 3. What Happens If Production D1 Config Is Missing?

Production mode strictly blocks silent SQLite fallback. If any required Cloudflare variable is missing when running with `NODE_ENV=production`:

1. `getDatabase()` throws a fatal `[DATABASE CONFIGURATION ERROR]`:
   ```text
   [DATABASE CONFIGURATION ERROR] Production environment requires Cloudflare D1 persistence.
   Silently falling back to local SQLite is strictly disallowed in production to prevent ephemeral data loss.
   Missing required environment variables: CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN.
   Ensure these variables are configured in your deployment settings.
   ```
2. The server-side health check endpoint (`/api/health/db`) returns `HTTP 503 Service Unavailable` with `configured: false`.
3. Customer orders, quotes, measurements, and cart state cannot be written to ephemeral serverless containers that disappear upon cold restarts.

---

## 4. How Migrations Are Applied

The project contains 11 relational schema migrations in `migrations/`:
- `0001_initial_schema.sql`: Core catalog, users, services, CMS tables
- `0002_seed_initial_data.sql`: Initial 14 categories, curated products, CMS records
- `0003_customer_auth_cart_wishlist.sql`: Sessions, database carts, cart items, wishlists
- `0004_orders.sql`: Customer orders, order items, price snapshots
- `0005_order_notifications.sql`: Customer & admin notifications, delivery ledger
- `0006_quote_measurement_requests.sql`: Quote & measurement requests persistence
- `0007_customer_reviews.sql`: Verified customer reviews
- `0008_order_source.sql`: Multi-channel order attribution (`WEB`, `WHATSAPP`, `QUOTE`, etc.)
- `0009_order_notifications_read_status.sql`: Read/unread status tracking
- `0010_order_status_history.sql`: Audit trail for order status transitions
- `0011_contact_inquiries.sql`: Contact & concierge inquiries

### Running Migrations

Run the automated migration runner:
```bash
npx tsx scripts/migrate.ts
```

The runner:
1. Connects using the active database adapter (Cloudflare D1 if configured; otherwise local SQLite).
2. Creates and checks the `_migrations` tracking table.
3. Automatically baselines existing schema structures without data loss.
4. Sequentially applies pending migrations.
5. Verifies that all 22 required production tables exist and are healthy.

---

## 5. How to Verify Database Connectivity (Health Check)

A safe server-side health check route is provided at:
```text
GET /api/health/db
```

### Example Healthy Response (`HTTP 200`):
```json
{
  "status": "healthy",
  "ok": true,
  "configured": true,
  "provider": "d1",
  "tablesCount": 22,
  "latencyMs": 48,
  "timestamp": "2026-10-03T11:20:30.841Z"
}
```

### Example Misconfigured Response (`HTTP 503`):
```json
{
  "status": "unhealthy",
  "ok": false,
  "configured": false,
  "provider": "d1",
  "message": "Cloudflare D1 credentials are missing in production environment. Ephemeral SQLite fallback is blocked.",
  "timestamp": "2026-10-03T11:20:41.455Z"
}
```

> [!NOTE]
> The health check endpoint never exposes API tokens, account IDs, database IDs, or file paths.

---

## 6. How to Verify Persistence Across Separate Processes

To prove that database records persist across independent processes and cold requests (and are not kept in memory or ephemeral local storage), run:

```bash
npx tsx scripts/verify_persistence.ts
```

This verification suite:
1. Verifies the production configuration guard.
2. **Process A**: Writes records across Catalog, Customer, Cart, Wishlist, Order, Items, Status History, Quote Request, Measurement Request, and Review.
3. **Process B**: Spawns an independent, fresh Node process from cold state.
4. Reads back and asserts all records, snapshots, and relationships.
5. Cleans up test records so the database remains pristine.

---

## 7. Running Verification & Audit Tests

To run the complete verification suite:
```bash
# Order processing, status updates, and notification transitions
npx tsx scripts/verify_stage4.ts

# Customer tracking and ownership security
npx tsx scripts/verify_stage5.ts

# Production readiness audit (52 checks: WhatsApp, IDOR, idempotency, atomicity)
npx tsx scripts/verify_stage6.ts

# Database migrations & table integrity check
npx tsx scripts/migrate.ts

# Cross-process persistence verification
npx tsx scripts/verify_persistence.ts

# Production Next.js build
npm run build
```
