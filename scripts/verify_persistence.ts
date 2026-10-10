import crypto from 'crypto';
import { spawn } from 'child_process';
import path from 'path';
import { getDatabase } from '../src/lib/db';
import { DbCategory, DbOrder, DbOrderItem, DbQuoteRequest, DbMeasurementRequest, DbProductReview } from '../src/lib/db/types';

// Unique suffix for this test run
const RUN_ID = `test_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

// Test identifiers (inherited from parent if spawned as worker)
const TEST_CAT_ID = process.env.TEST_CAT_ID || `cat_${RUN_ID}`;
const TEST_SUBCAT_ID = process.env.TEST_SUBCAT_ID || `subcat_${RUN_ID}`;
const TEST_PROD_ID = process.env.TEST_PROD_ID || `prod_${RUN_ID}`;
const TEST_IMG_ID = process.env.TEST_IMG_ID || `img_${RUN_ID}`;
const TEST_VAR_ID = process.env.TEST_VAR_ID || `var_${RUN_ID}`;
const TEST_SPEC_ID = process.env.TEST_SPEC_ID || `spec_${RUN_ID}`;

const TEST_USER_ID = process.env.TEST_USER_ID || `usr_${RUN_ID}`;
const TEST_SESSION_ID = process.env.TEST_SESSION_ID || `sess_${RUN_ID}`;
const TEST_CART_ID = process.env.TEST_CART_ID || `cart_${RUN_ID}`;
const TEST_CART_ITEM_ID = process.env.TEST_CART_ITEM_ID || `ci_${RUN_ID}`;
const TEST_WISHLIST_ID = process.env.TEST_WISHLIST_ID || `wish_${RUN_ID}`;

const TEST_ORDER_ID = process.env.TEST_ORDER_ID || `ord_${RUN_ID}`;
const TEST_ORDER_NUM = process.env.TEST_ORDER_NUM || `ZAI-TEST-${Date.now().toString().slice(-6)}`;
const TEST_ORDER_ITEM_ID = process.env.TEST_ORDER_ITEM_ID || `oi_${RUN_ID}`;
const TEST_HISTORY_ID = process.env.TEST_HISTORY_ID || `osh_${RUN_ID}`;

const TEST_QUOTE_ID = process.env.TEST_QUOTE_ID || `quote_${RUN_ID}`;
const TEST_QUOTE_NUM = process.env.TEST_QUOTE_NUM || `ZQ-TEST-${Date.now().toString().slice(-6)}`;

const TEST_MEASURE_ID = process.env.TEST_MEASURE_ID || `meas_${RUN_ID}`;
const TEST_MEASURE_NUM = process.env.TEST_MEASURE_NUM || `ZM-TEST-${Date.now().toString().slice(-6)}`;

const TEST_REVIEW_ID = process.env.TEST_REVIEW_ID || `rev_${RUN_ID}`;

// ─── STEP A: WRITE TEST DATA (Process A) ───
async function runProcessA_Write(): Promise<void> {
  console.log('--- [Process A] Initiating Writes for Persistence Verification ---');
  const db = getDatabase();

  const health = await db.healthCheck();
  console.log(`Active Database Provider: ${health.provider.toUpperCase()} (Latency: ${health.latencyMs}ms)`);

  // 1. Catalog writes
  console.log('1. Inserting Catalog records (Category, Subcategory, Product, Image, Variant, Spec)...');
  await db.execute(
    `INSERT INTO categories (id, name, slug, tagline, description, image, display_order, active, featured, is_customizable)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [TEST_CAT_ID, 'Persistence Test Category', `test-cat-${RUN_ID}`, 'Test Tagline', 'Test Desc', '/test.jpg', 99, 1, 0, 1]
  );

  await db.execute(
    `INSERT INTO subcategories (id, category_id, name, slug, description, image, display_order, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [TEST_SUBCAT_ID, TEST_CAT_ID, 'Persistence Test Subcategory', `test-sub-${RUN_ID}`, 'Sub Desc', '/test-sub.jpg', 0, 1]
  );

  await db.execute(
    `INSERT INTO products (id, category_id, subcategory_id, name, slug, description, short_description, product_type, pricing_type, base_price, active, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [TEST_PROD_ID, TEST_CAT_ID, TEST_SUBCAT_ID, 'Persistence Test Curtain', `test-prod-${RUN_ID}`, 'Long description', 'Short description', 'standard', 'fixed', 4999, 1, 0]
  );

  await db.execute(
    `INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_main, active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [TEST_IMG_ID, TEST_PROD_ID, '/test-img.jpg', 'Main Image', 0, 1, 1]
  );

  await db.execute(
    `INSERT INTO product_variants (id, product_id, name, variant_type, sku, color_hex, price_adjustment, in_stock, active, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [TEST_VAR_ID, TEST_PROD_ID, 'Midnight Navy', 'color', `SKU-${RUN_ID}`, '#000080', 0, 1, 1, 0]
  );

  await db.execute(
    `INSERT INTO product_specifications (id, product_id, label, value, display_order)
     VALUES (?, ?, ?, ?, ?)`,
    [TEST_SPEC_ID, TEST_PROD_ID, 'Material', '100% Belgian Linen', 0]
  );

  // 2. Customer & Sessions
  console.log('2. Inserting Customer, Session, Cart, Cart Item, Wishlist...');
  await db.execute(
    `INSERT INTO users (id, role, name, email, phone, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [TEST_USER_ID, 'CUSTOMER', 'Persistence Tester', `tester-${RUN_ID}@example.com`, '+919999999999', 'active']
  );

  await db.execute(
    `INSERT INTO customer_sessions (id, user_id, expires_at)
     VALUES (?, ?, datetime('now', '+7 days'))`,
    [TEST_SESSION_ID, TEST_USER_ID]
  );

  await db.execute(
    `INSERT INTO carts (id, user_id) VALUES (?, ?)`,
    [TEST_CART_ID, TEST_USER_ID]
  );

  await db.execute(
    `INSERT INTO cart_items (id, cart_id, product_id, variant_id, quantity, unit_price_snapshot)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [TEST_CART_ITEM_ID, TEST_CART_ID, TEST_PROD_ID, TEST_VAR_ID, 2, 4999]
  );

  await db.execute(
    `INSERT INTO wishlist_items (id, user_id, product_id)
     VALUES (?, ?, ?)`,
    [TEST_WISHLIST_ID, TEST_USER_ID, TEST_PROD_ID]
  );

  // 3. Orders & Order Items via batch
  console.log('3. Inserting Order, Order Items & Status History via atomic batch...');
  await db.batch([
    {
      sql: `INSERT INTO orders (
        id, order_number, user_id, status, payment_method, payment_status,
        customer_name, customer_email, customer_phone, delivery_address,
        city, state, pincode, subtotal, discount, delivery_charge, total_amount, order_source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        TEST_ORDER_ID, TEST_ORDER_NUM, TEST_USER_ID, 'CONFIRMED', 'COD', 'PENDING',
        'Persistence Tester', `tester-${RUN_ID}@example.com`, '+919999999999', 'Atelier Villa 42',
        'Hyderabad', 'Telangana', '500034', 9998, 0, 0, 9998, 'WEB',
      ],
    },
    {
      sql: `INSERT INTO order_items (
        id, order_id, product_id, variant_id, product_name_snapshot,
        variant_name_snapshot, quantity, unit_price_snapshot, line_total, product_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        TEST_ORDER_ITEM_ID, TEST_ORDER_ID, TEST_PROD_ID, TEST_VAR_ID,
        'Persistence Test Curtain', 'Midnight Navy', 2, 4999, 9998, 'standard',
      ],
    },
    {
      sql: `INSERT INTO order_status_history (id, order_id, old_status, new_status, changed_by)
            VALUES (?, ?, ?, ?, ?)`,
      params: [TEST_HISTORY_ID, TEST_ORDER_ID, 'PENDING', 'CONFIRMED', 'SYSTEM'],
    },
  ]);

  // 4. Quote Request
  console.log('4. Inserting Quote Request...');
  await db.execute(
    `INSERT INTO quote_requests (
      id, request_number, user_id, customer_name, customer_phone, customer_email,
      product_id, product_name_snapshot, quantity, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      TEST_QUOTE_ID, TEST_QUOTE_NUM, TEST_USER_ID, 'Persistence Tester',
      '+919999999999', `tester-${RUN_ID}@example.com`, TEST_PROD_ID,
      'Persistence Test Curtain', 3, 'NEW',
    ]
  );

  // 5. Measurement Request
  console.log('5. Inserting Measurement Request...');
  await db.execute(
    `INSERT INTO measurement_requests (
      id, request_number, user_id, customer_name, customer_phone, customer_email,
      product_id, product_name_snapshot, address, preferred_date, preferred_time_slot, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      TEST_MEASURE_ID, TEST_MEASURE_NUM, TEST_USER_ID, 'Persistence Tester',
      '+919999999999', `tester-${RUN_ID}@example.com`, TEST_PROD_ID,
      'Persistence Test Curtain', 'Bespoke Residency 101', '2026-10-15', '10:00 AM - 1:00 PM', 'NEW',
    ]
  );

  // 6. Product Review
  console.log('6. Inserting Product Review...');
  await db.execute(
    `INSERT INTO product_reviews (id, product_id, user_id, customer_name, rating, comment, is_verified_purchase, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [TEST_REVIEW_ID, TEST_PROD_ID, TEST_USER_ID, 'Persistence Tester', 5, 'Exceptional drapery quality and weight.', 1, 'APPROVED']
  );

  console.log('✓ [Process A] All test records written successfully.\n');
}

// ─── STEP B: READ & VERIFY IN A FRESH PROCESS (Process B) ───
async function runProcessB_Verify(): Promise<void> {
  console.log('--- [Process B / Separate Request] Verifying Persistence from Cold State ---');
  const db = getDatabase();

  // 1. Verify Catalog
  const prod = await db.queryOne<{ id: string; name: string; base_price: number }>(
    'SELECT id, name, base_price FROM products WHERE id = ?',
    [TEST_PROD_ID]
  );
  if (!prod || prod.base_price !== 4999) {
    throw new Error(`Catalog verification failed: product ${TEST_PROD_ID} not found or mismatch`);
  }
  console.log('  ✓ Catalog product persisted & verified across process boundary');

  const variant = await db.queryOne<{ id: string; name: string }>(
    'SELECT id, name FROM product_variants WHERE id = ?',
    [TEST_VAR_ID]
  );
  if (!variant || variant.name !== 'Midnight Navy') {
    throw new Error('Variant verification failed across process boundary');
  }
  console.log('  ✓ Product variant persisted & verified');

  // 2. Verify Customer & Cart
  const user = await db.queryOne<{ id: string; email: string }>(
    'SELECT id, email FROM users WHERE id = ?',
    [TEST_USER_ID]
  );
  if (!user || user.id !== TEST_USER_ID) {
    throw new Error('User verification failed across process boundary');
  }
  console.log('  ✓ Customer user persisted & verified');

  const cartItem = await db.queryOne<{ id: string; quantity: number }>(
    'SELECT id, quantity FROM cart_items WHERE id = ?',
    [TEST_CART_ITEM_ID]
  );
  if (!cartItem || cartItem.quantity !== 2) {
    throw new Error('Cart item verification failed across process boundary');
  }
  console.log('  ✓ Cart & items persisted & verified');

  const wish = await db.queryOne<{ id: string }>(
    'SELECT id FROM wishlist_items WHERE id = ?',
    [TEST_WISHLIST_ID]
  );
  if (!wish) {
    throw new Error('Wishlist item verification failed across process boundary');
  }
  console.log('  ✓ Wishlist persisted & verified');

  // 3. Verify Order & Order Items
  const order = await db.queryOne<DbOrder>(
    'SELECT * FROM orders WHERE id = ?',
    [TEST_ORDER_ID]
  );
  if (!order || order.order_number !== TEST_ORDER_NUM || order.total_amount !== 9998) {
    throw new Error('Order verification failed across process boundary');
  }
  console.log(`  ✓ Order ${order.order_number} (₹${order.total_amount}) retrieved after fresh request`);

  const orderItem = await db.queryOne<DbOrderItem>(
    'SELECT * FROM order_items WHERE id = ?',
    [TEST_ORDER_ITEM_ID]
  );
  if (!orderItem || orderItem.product_name_snapshot !== 'Persistence Test Curtain') {
    throw new Error('Order item snapshot verification failed across process boundary');
  }
  console.log('  ✓ Order items & snapshots retrieved intact');

  // 4. Verify Quote Request
  const quote = await db.queryOne<DbQuoteRequest>(
    'SELECT * FROM quote_requests WHERE id = ?',
    [TEST_QUOTE_ID]
  );
  if (!quote || quote.request_number !== TEST_QUOTE_NUM || quote.status !== 'NEW') {
    throw new Error('Quote request verification failed across process boundary');
  }
  console.log(`  ✓ Quote request ${quote.request_number} survives new request`);

  // 5. Verify Measurement Request
  const measurement = await db.queryOne<DbMeasurementRequest>(
    'SELECT * FROM measurement_requests WHERE id = ?',
    [TEST_MEASURE_ID]
  );
  if (!measurement || measurement.request_number !== TEST_MEASURE_NUM) {
    throw new Error('Measurement request verification failed across process boundary');
  }
  console.log(`  ✓ Measurement request ${measurement.request_number} survives new request`);

  // 6. Verify Product Review
  const review = await db.queryOne<DbProductReview>(
    'SELECT * FROM product_reviews WHERE id = ?',
    [TEST_REVIEW_ID]
  );
  if (!review || review.rating !== 5 || review.status !== 'APPROVED') {
    throw new Error('Review verification failed across process boundary');
  }
  console.log('  ✓ Product review verified in database');

  // ─── CLEANUP ───
  console.log('\n--- Cleaning up test records ---');
  await db.execute('DELETE FROM product_reviews WHERE id = ?', [TEST_REVIEW_ID]);
  await db.execute('DELETE FROM measurement_requests WHERE id = ?', [TEST_MEASURE_ID]);
  await db.execute('DELETE FROM quote_requests WHERE id = ?', [TEST_QUOTE_ID]);
  await db.execute('DELETE FROM order_status_history WHERE id = ?', [TEST_HISTORY_ID]);
  await db.execute('DELETE FROM order_items WHERE id = ?', [TEST_ORDER_ITEM_ID]);
  await db.execute('DELETE FROM orders WHERE id = ?', [TEST_ORDER_ID]);
  await db.execute('DELETE FROM wishlist_items WHERE id = ?', [TEST_WISHLIST_ID]);
  await db.execute('DELETE FROM cart_items WHERE id = ?', [TEST_CART_ITEM_ID]);
  await db.execute('DELETE FROM carts WHERE id = ?', [TEST_CART_ID]);
  await db.execute('DELETE FROM customer_sessions WHERE id = ?', [TEST_SESSION_ID]);
  await db.execute('DELETE FROM users WHERE id = ?', [TEST_USER_ID]);
  await db.execute('DELETE FROM product_specifications WHERE id = ?', [TEST_SPEC_ID]);
  await db.execute('DELETE FROM product_variants WHERE id = ?', [TEST_VAR_ID]);
  await db.execute('DELETE FROM product_images WHERE id = ?', [TEST_IMG_ID]);
  await db.execute('DELETE FROM products WHERE id = ?', [TEST_PROD_ID]);
  await db.execute('DELETE FROM subcategories WHERE id = ?', [TEST_SUBCAT_ID]);
  await db.execute('DELETE FROM categories WHERE id = ?', [TEST_CAT_ID]);

  console.log('✓ All test data cleaned up. Database is pristine.\n');
  console.log('================================================================');
  console.log('✅ MULTI-PROCESS PERSISTENCE VERIFICATION PASSED COMPLETELY!');
  console.log('================================================================\n');
}

// ─── MASTER CONTROLLER ───
async function main() {
  const mode = process.argv[2];

  if (mode === '--worker-verify') {
    // We are the spawned child process (Process B)
    const runId = process.argv[3];
    // Override IDs to match the parent
    await runProcessB_Verify();
    process.exit(0);
  }

  console.log('================================================================');
  console.log('       ZAIRA FURNISHING — DATABASE PERSISTENCE SUITE            ');
  console.log('================================================================\n');

  // Test 1: Verify Production Guard
  console.log('[TEST 1] Verifying Production SQLite Guard...');
  const isProduction = process.env.NODE_ENV === 'production';
  const hasD1Config = Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_D1_DATABASE_ID &&
    process.env.CLOUDFLARE_API_TOKEN
  );

  console.log(`  - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  - Cloudflare Account ID: ${process.env.CLOUDFLARE_ACCOUNT_ID ? 'Configured' : 'Missing'}`);
  console.log(`  - Cloudflare D1 Database ID: ${process.env.CLOUDFLARE_D1_DATABASE_ID ? 'Configured' : 'Missing'}`);
  console.log(`  - Cloudflare API Token: ${process.env.CLOUDFLARE_API_TOKEN ? 'Configured' : 'Missing'}`);

  if (!hasD1Config) {
    console.log('\n  ℹ️ Notice: Production D1 credentials are not fully configured in this environment.');
    console.log('  Testing that production mode actively and strictly BLOCKS fallback to SQLite:');

    // Simulate production environment in an isolated call
    const savedEnv = process.env.NODE_ENV;
    const envObj = process.env as Record<string, string | undefined>;
    try {
      envObj.NODE_ENV = 'production';
      // Force cache bust if any
      let threwExpectedError = false;
      try {
        const { getDatabase: freshDb } = await import('../src/lib/db');
        // Fresh call should throw
        freshDb();
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (errorMsg.includes('[DATABASE CONFIGURATION ERROR]')) {
          threwExpectedError = true;
          console.log('  ✓ Production mode correctly THREW clear configuration error.');
          console.log('  ✓ Unsafe silent fallback to ephemeral SQLite is completely blocked.');
        } else {
          throw err;
        }
      }
      if (!threwExpectedError) {
        throw new Error('Production guard failed: did not throw when D1 config is missing!');
      }
    } finally {
      envObj.NODE_ENV = savedEnv;
    }
  }

  // Test 2: Process A writes
  console.log('\n[TEST 2] Testing Persistence across separate processes...');
  await runProcessA_Write();

  // Test 3: Process B reads (in fresh child process)
  console.log('[TEST 3] Spawning Process B (fresh isolated Node process)...');
  await new Promise<void>((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const npxCmd = isWindows ? 'npx.cmd' : 'npx';
    const child = spawn(
      npxCmd,
      ['tsx', path.resolve(__dirname, 'verify_persistence.ts'), '--worker-verify', RUN_ID],
      {
        cwd: process.cwd(),
        shell: isWindows,
        stdio: 'inherit',
        env: {
          ...process.env,
          // Pass IDs to child via env
          TEST_CAT_ID,
          TEST_SUBCAT_ID,
          TEST_PROD_ID,
          TEST_IMG_ID,
          TEST_VAR_ID,
          TEST_SPEC_ID,
          TEST_USER_ID,
          TEST_SESSION_ID,
          TEST_CART_ID,
          TEST_CART_ITEM_ID,
          TEST_WISHLIST_ID,
          TEST_ORDER_ID,
          TEST_ORDER_NUM,
          TEST_ORDER_ITEM_ID,
          TEST_HISTORY_ID,
          TEST_QUOTE_ID,
          TEST_QUOTE_NUM,
          TEST_MEASURE_ID,
          TEST_MEASURE_NUM,
          TEST_REVIEW_ID,
        },
      }
    );

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Child process B exited with failure code ${code}`));
      }
    });
  });
}

// In worker mode, read IDs from env
if (process.argv[2] === '--worker-verify') {
  (global as any).TEST_CAT_ID = process.env.TEST_CAT_ID;
}

main().catch((err) => {
  console.error('\n❌ Persistence verification failed:', err);
  process.exit(1);
});
