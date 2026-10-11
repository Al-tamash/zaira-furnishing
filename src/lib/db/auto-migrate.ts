import fs from 'fs';
import path from 'path';
import { DatabaseClient } from './index';

/**
 * Embedded schema DDL covering all 22 required production tables.
 * Used as a zero-dependency fallback if migration files cannot be loaded from the disk filesystem.
 */
export const CORE_SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS _migrations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK(role IN ('CUSTOMER', 'ADMIN', 'VENDOR')),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    description TEXT,
    image TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    featured INTEGER NOT NULL DEFAULT 1,
    is_customizable INTEGER NOT NULL DEFAULT 0,
    item_count_text TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subcategories (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    image TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(category_id, slug)
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    product_type TEXT NOT NULL DEFAULT 'custom_made' CHECK(product_type IN ('standard', 'custom_made')),
    pricing_type TEXT NOT NULL DEFAULT 'fixed' CHECK(pricing_type IN ('fixed', 'per_metre', 'per_panel', 'per_roll', 'per_sqft', 'custom_estimate')),
    base_price REAL NOT NULL DEFAULT 0,
    starting_price INTEGER NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'piece',
    custom_made INTEGER NOT NULL DEFAULT 0,
    featured INTEGER NOT NULL DEFAULT 0,
    custom_measurement_available INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT '₹',
    space_slugs TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_main INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    variant_type TEXT NOT NULL DEFAULT 'color',
    sku TEXT NOT NULL,
    color_hex TEXT,
    thumbnail_image TEXT,
    preview_image TEXT,
    price_adjustment REAL DEFAULT 0,
    in_stock INTEGER NOT NULL DEFAULT 1,
    attributes TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_specifications (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customization_configs (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL DEFAULT 'select',
    options TEXT,
    default_value TEXT,
    min_value REAL,
    max_value REAL,
    unit TEXT,
    is_required INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_desc TEXT NOT NULL,
    full_desc TEXT,
    image TEXT,
    icon_name TEXT,
    highlights TEXT,
    requires_site_visit INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cms_content (
    id TEXT PRIMARY KEY,
    section_key TEXT UNIQUE NOT NULL,
    title TEXT,
    subtitle TEXT,
    content TEXT,
    image_url TEXT,
    secondary_image_url TEXT,
    updated_by TEXT REFERENCES users(id),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS customer_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
    unit_price_snapshot REAL NOT NULL,
    customization_data TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'CONFIRMED',
    payment_method TEXT NOT NULL DEFAULT 'COD',
    payment_status TEXT NOT NULL DEFAULT 'PENDING',
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    landmark TEXT,
    delivery_option TEXT NOT NULL DEFAULT 'standard',
    site_visit_required INTEGER NOT NULL DEFAULT 0,
    site_visit_date TEXT,
    site_visit_time TEXT,
    subtotal REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    delivery_charge REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL,
    notes TEXT,
    order_source TEXT NOT NULL DEFAULT 'WEB',
    idempotency_key TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id),
    variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    variant_name_snapshot TEXT,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price_snapshot REAL NOT NULL,
    line_total REAL NOT NULL,
    customization_data TEXT,
    product_type TEXT NOT NULL DEFAULT 'standard',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_notifications (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    channel TEXT NOT NULL DEFAULT 'IN_APP',
    recipient TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SENT',
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

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
    customization_details TEXT,
    customer_notes TEXT,
    starting_price_snapshot REAL,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW', 'CONTACTED', 'QUOTED', 'CLOSED', 'CANCELLED')),
    idempotency_key TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

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

CREATE TABLE IF NOT EXISTS order_status_history (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL DEFAULT 'SYSTEM',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
    id TEXT PRIMARY KEY,
    inquiry_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT 'General Inquiry',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW', 'CONTACTED', 'RESOLVED', 'CLOSED')),
    idempotency_key TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    reference_number TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    amount REAL,
    action_url TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    read_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_admin_notif_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notif_created ON admin_notifications(created_at);
`;

let initializationPromise: Promise<boolean> | null = null;
let isMigrating = false;

/**
 * Seeds flagship categories, products, and review placeholders safely.
 */
export async function seedCatalogData(db: DatabaseClient): Promise<void> {
  try {
    const { CATEGORIES } = await import('@/lib/data/categories');
    const { PRODUCTS } = await import('@/lib/data/products');
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 1. Seed categories
    const categoryMap = new Map<string, string>();
    for (const cat of CATEGORIES) {
      categoryMap.set(cat.slug, cat.id);
      categoryMap.set(cat.id, cat.id);
      await db.execute(
        `INSERT OR IGNORE INTO categories (id, name, slug, tagline, description, image, display_order, active, featured, is_customizable)
         VALUES (?, ?, ?, ?, ?, ?, 0, 1, 1, ?)`,
        [cat.id, cat.name, cat.slug, cat.tagline, cat.description, cat.image, cat.isCustomizable ? 1 : 0]
      );
    }

    // 2. Seed products
    for (const prod of PRODUCTS) {
      const categoryId = (prod.categorySlug && categoryMap.get(prod.categorySlug)) || 'cat-1';
      await db.execute(
        `INSERT OR IGNORE INTO products (
          id, category_id, name, display_name, slug, description, short_description,
          product_type, base_price, starting_price, active, featured, custom_measurement_available, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 1, ?, ?)`,
        [
          prod.id,
          categoryId,
          prod.name,
          prod.displayName || prod.name,
          prod.slug,
          prod.description || prod.shortDescription || 'Zaira Luxury Furnishing',
          prod.shortDescription || 'Zaira Luxury Furnishing',
          prod.productType || 'custom_made',
          prod.price || 0,
          prod.startingPrice ? 1 : 0,
          prod.featured ? 1 : 0,
          now,
          now,
        ]
      );
    }
    console.log('[DATABASE AUTO-MIGRATE] Seeded flagship catalog successfully.');
  } catch (seedErr) {
    console.warn('[DATABASE AUTO-MIGRATE] Seed warning:', seedErr);
  }
}

/**
 * Checks if the database is initialized. If tables are missing (e.g. fresh D1 or cold serverless SQLite),
 * automatically executes all migrations and seeds core catalog tables.
 */
export async function ensureDatabaseSchema(db: DatabaseClient): Promise<boolean> {
  if (initializationPromise) return initializationPromise;
  if (isMigrating) return true;

  isMigrating = true;
  initializationPromise = (async () => {
    try {
      // 1. Fast check: does the products table already exist with rows?
      const check = await db.queryOne<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='products'"
      );
      if (check?.name) {
        // Self-heal customization_configs if created with legacy schema missing field_key
        try {
          const cfgInfo = await db.query<{ name: string }>("PRAGMA table_info(customization_configs)");
          if (cfgInfo && cfgInfo.length > 0 && !cfgInfo.some((c) => c.name === 'field_key')) {
            console.log('[DATABASE AUTO-MIGRATE] Repairing legacy customization_configs schema...');
            await db.execute('DROP TABLE IF EXISTS customization_configs');
            await db.execute(`
              CREATE TABLE IF NOT EXISTS customization_configs (
                  id TEXT PRIMARY KEY,
                  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                  field_key TEXT NOT NULL,
                  field_label TEXT NOT NULL,
                  field_type TEXT NOT NULL DEFAULT 'select',
                  options TEXT,
                  default_value TEXT,
                  min_value REAL,
                  max_value REAL,
                  unit TEXT,
                  is_required INTEGER NOT NULL DEFAULT 0,
                  display_order INTEGER NOT NULL DEFAULT 0
              )
            `);
          }
        } catch (repairErr) {
          console.warn('[DATABASE AUTO-MIGRATE] Customization configs schema check:', repairErr);
        }

        // Self-heal admin_notifications if table does not exist
        try {
          const notifCheck = await db.queryOne<{ name: string }>(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='admin_notifications'"
          );
          if (!notifCheck?.name) {
            await db.execute(`
              CREATE TABLE IF NOT EXISTS admin_notifications (
                  id TEXT PRIMARY KEY,
                  type TEXT NOT NULL,
                  reference_id TEXT NOT NULL,
                  reference_number TEXT NOT NULL,
                  title TEXT NOT NULL,
                  message TEXT NOT NULL,
                  customer_name TEXT NOT NULL,
                  customer_phone TEXT NOT NULL,
                  customer_email TEXT,
                  amount REAL,
                  action_url TEXT NOT NULL,
                  is_read INTEGER NOT NULL DEFAULT 0,
                  read_at TEXT,
                  created_at TEXT NOT NULL DEFAULT (datetime('now'))
              );
              CREATE INDEX IF NOT EXISTS idx_admin_notif_read ON admin_notifications(is_read);
              CREATE INDEX IF NOT EXISTS idx_admin_notif_created ON admin_notifications(created_at);
            `);
          }
        } catch (notifErr) {
          console.warn('[DATABASE AUTO-MIGRATE] Admin notifications schema check:', notifErr);
        }

        const prodCount = await db.queryOne<{ c: number }>("SELECT COUNT(*) as c FROM products");
        if ((prodCount?.c || 0) > 0) {
          return true;
        }
      }

      console.log('[DATABASE AUTO-MIGRATE] "products" table not found or empty. Initializing database schema...');

      // 2. Discover migration files on disk if running with filesystem access
      let migrationsApplied = false;
      try {
        const migrationsDir = path.resolve(process.cwd(), 'migrations');
        if (fs.existsSync(migrationsDir)) {
          const files = fs
            .readdirSync(migrationsDir)
            .filter((f) => f.endsWith('.sql'))
            .sort();

          for (const file of files) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
            await db.runMigration(sql);
          }
          migrationsApplied = true;
          console.log('[DATABASE AUTO-MIGRATE] Applied migrations from disk successfully.');
        }
      } catch (fileErr) {
        console.warn('[DATABASE AUTO-MIGRATE] Could not run migrations from disk, falling back to embedded schema:', fileErr);
      }

      // 3. Fallback to embedded DDL if files were not read or tables are still missing
      const verifyCheck = await db.queryOne<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='products'"
      );

      if (!verifyCheck?.name) {
        console.log('[DATABASE AUTO-MIGRATE] Executing embedded schema DDL...');
        await db.runMigration(CORE_SCHEMA_DDL);
      }

      // 4. Seed catalog data if products table is empty
      const postCount = await db.queryOne<{ c: number }>("SELECT COUNT(*) as c FROM products");
      if (!postCount || postCount.c === 0) {
        await seedCatalogData(db);
      }

      return true;
    } catch (err) {
      console.error('[DATABASE AUTO-MIGRATE FATAL] Error during schema auto-migration:', err);
      initializationPromise = null;
      return false;
    } finally {
      isMigrating = false;
    }
  })();

  return initializationPromise;
}

