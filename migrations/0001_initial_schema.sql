-- ==============================================================================
-- ZAIRA FURNISHING — Cloudflare D1 / Relational Database Migration 0001
-- Initial Relational Schema for Real Dynamic E-Commerce & Atelier CMS
-- ==============================================================================

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK(role IN ('CUSTOMER', 'ADMIN', 'VENDOR')),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. CATEGORIES (All 14 Catalog Sections)
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

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);

-- 3. SUBCATEGORIES (Genuine Types for Curtains, Blinds, Sofa Fabrics, Wallpapers, Carpets)
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

CREATE INDEX IF NOT EXISTS idx_subcategories_cat_slug ON subcategories(category_id, slug);

-- 4. PRODUCTS (Standard & Custom-Made Furnishings)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    product_type TEXT NOT NULL CHECK(product_type IN ('standard', 'custom_made')),
    pricing_type TEXT NOT NULL DEFAULT 'fixed' CHECK(pricing_type IN ('fixed', 'per_metre', 'per_panel', 'per_roll', 'per_sqft', 'custom_estimate')),
    base_price REAL NOT NULL,
    starting_price INTEGER NOT NULL DEFAULT 0, -- 1 = shows "From ₹...", 0 = fixed
    unit TEXT DEFAULT 'piece',
    custom_made INTEGER NOT NULL DEFAULT 0,
    featured INTEGER NOT NULL DEFAULT 0,
    custom_measurement_available INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT '₹',
    space_slugs TEXT, -- JSON Array: ["living-room", "bedroom"]
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- 5. PRODUCT IMAGES
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

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- 6. PRODUCT OPTIONS & VARIANTS (Colors, Weaves, Finishes)
CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    variant_type TEXT NOT NULL CHECK(variant_type IN ('color', 'pattern', 'material', 'finish', 'thickness', 'opacity', 'firmness', 'design')),
    sku TEXT NOT NULL,
    color_hex TEXT,
    thumbnail_image TEXT,
    preview_image TEXT,
    price_adjustment REAL DEFAULT 0,
    in_stock INTEGER NOT NULL DEFAULT 1,
    attributes TEXT, -- JSON Object: {"Opacity": "100% Total Blackout", "Material": "Triple-weave"}
    display_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- 7. PRODUCT SPECIFICATIONS (Key Details, Care, Technical Specs)
CREATE TABLE IF NOT EXISTS product_specifications (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_specs_product ON product_specifications(product_id);

-- 8. PRODUCT CUSTOMIZATION CONFIGURATIONS
-- Flexible rules per product (width, drop, pleat, motorization) without forcing curtain fields onto every product
CREATE TABLE IF NOT EXISTS customization_configs (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL, -- 'dimensions', 'heading_style', 'motorization', 'lining_type', 'fabric_quantity'
    field_label TEXT NOT NULL, -- e.g. 'Pleat / Heading Style', 'Width & Drop', 'Fabric Metres'
    field_type TEXT NOT NULL CHECK(field_type IN ('dimension_pair', 'select', 'number', 'text', 'boolean')),
    options TEXT, -- JSON Array of available string options
    default_value TEXT,
    min_value REAL,
    max_value REAL,
    unit TEXT, -- 'cm', 'inches', 'metres'
    is_required INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_customization_configs_product ON customization_configs(product_id);

-- 9. SERVICES (8 Verified Atelier Services)
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_desc TEXT NOT NULL,
    full_desc TEXT,
    image TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    highlights TEXT, -- JSON Array of string highlights
    requires_site_visit INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

-- 10. CMS CONTENT (Hero, Brand Story, Showroom Contact, Services, Footer)
CREATE TABLE IF NOT EXISTS cms_content (
    id TEXT PRIMARY KEY,
    section_key TEXT UNIQUE NOT NULL, -- e.g. 'home_hero', 'home_brand_story', 'home_showroom_contact', 'home_featured_furnishings', 'site_footer'
    title TEXT,
    subtitle TEXT,
    content TEXT, -- JSON structured payload holding section-specific fields
    image_url TEXT,
    secondary_image_url TEXT,
    updated_by TEXT REFERENCES users(id),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cms_section_key ON cms_content(section_key);

-- 11. ORDERS (Foundational structure for checkout and customer accounts)
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- e.g. 'ZF-842915'
    customer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    subtotal REAL NOT NULL,
    shipping_cost REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'order_received' CHECK(status IN ('order_received', 'details_confirmed', 'tailoring_preparation', 'ready_for_dispatch', 'delivered_installed')),
    payment_method TEXT NOT NULL DEFAULT 'cod' CHECK(payment_method IN ('cod', 'online_demo')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    delivery_option TEXT NOT NULL DEFAULT 'standard' CHECK(delivery_option IN ('standard', 'service_visit')),
    delivery_address TEXT NOT NULL, -- JSON Object: {addressLine1, addressLine2, city, state, pincode, country}
    time_slot TEXT,
    has_custom_products INTEGER NOT NULL DEFAULT 0,
    vendor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_vendor ON orders(vendor_id);

-- 12. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    product_slug TEXT NOT NULL,
    variant_name TEXT,
    sku TEXT,
    unit_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    total_price REAL NOT NULL,
    customization_data TEXT, -- JSON Object: {sizeLabel, headingStyle, customDimensions, bespokeNotes}
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
