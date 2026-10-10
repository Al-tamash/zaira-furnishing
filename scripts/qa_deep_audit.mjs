// scripts/qa_deep_audit.mjs
// Exhaustive QA Audit Suite for Items 7-30
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}${details ? ' — ' + details : ''}`);
    failed++;
    failures.push(`${message}${details ? ' — ' + details : ''}`);
  }
}

async function runDeepAudit() {
  console.log('=================================================================');
  console.log('ZAIRA FURNISHING: DEEP QA AUDIT SUITE (ITEMS 7–30)');
  console.log(`Target: ${BASE_URL}`);
  console.log('=================================================================\n');

  const db = new DatabaseSync('data/zaira.db');

  // ─────────────────────────────────────────────────────────────
  // 1. AUDIT IMAGES AGAINST PUBLIC FILESYSTEM
  // ─────────────────────────────────────────────────────────────
  console.log('--- 1. Image Filesystem Integrity ---');
  const allImages = db.prepare('SELECT id, product_id, image_url FROM product_images WHERE active = 1').all();
  let missingImages = 0;
  for (const img of allImages) {
    const url = img.image_url;
    if (url.startsWith('/')) {
      const filePath = path.join(process.cwd(), 'public', url.replace(/^\//, ''));
      if (!fs.existsSync(filePath)) {
        missingImages++;
        console.error(`    Missing image file on disk: ${url} (Product: ${img.product_id})`);
      }
    }
  }
  assert(missingImages === 0, `All active product images exist on disk in public/ (${allImages.length} checked)`, `missing: ${missingImages}`);

  // Check category images
  const allCats = db.prepare('SELECT id, slug, image FROM categories WHERE active = 1').all();
  let missingCatImages = 0;
  for (const cat of allCats) {
    if (cat.image && cat.image.startsWith('/')) {
      const filePath = path.join(process.cwd(), 'public', cat.image.replace(/^\//, ''));
      if (!fs.existsSync(filePath)) {
        missingCatImages++;
        console.error(`    Missing category image: ${cat.image} (Category: ${cat.slug})`);
      }
    }
  }
  assert(missingCatImages === 0, `All active category images exist on disk in public/ (${allCats.length} checked)`);

  // ─────────────────────────────────────────────────────────────
  // 2. INACTIVE PRODUCTS & CATEGORIES ISOLATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. Inactive Products & Categories Public Isolation ---');

  // 2a. Verify API /api/categories returns only active categories
  const catApiRes = await fetch(`${BASE_URL}/api/categories`);
  const catApiData = await catApiRes.json();
  const apiCats = catApiData.categories || catApiData.data || catApiData;
  assert(apiCats.length === 9, `GET /api/categories returns exactly 9 active categories (actual: ${apiCats.length})`);
  const hasInactiveCat = apiCats.some(c => c.slug === 'artificial-turf-green-walls' || c.active === 0);
  assert(!hasInactiveCat, 'GET /api/categories contains no inactive categories');

  // 2b. Verify API /api/products returns only active products
  const prodApiRes = await fetch(`${BASE_URL}/api/products`);
  const prodApiData = await prodApiRes.json();
  const apiProds = prodApiData.products || prodApiData.data || prodApiData;
  assert(apiProds.length === 45, `GET /api/products returns exactly 45 active products (actual: ${apiProds.length})`);
  const hasInactiveProd = apiProds.some(p => p.active === 0);
  assert(!hasInactiveProd, 'GET /api/products contains no inactive products');

  // 2c. Verify requesting an inactive product slug returns 404
  const inactiveSlugRes = await fetch(`${BASE_URL}/products/verdent-luxury-40mm-all-weather-artificial-landscape-turf`);
  assert(inactiveSlugRes.status === 404, 'Direct URL for inactive product returns HTTP 404', `status: ${inactiveSlugRes.status}`);

  // ─────────────────────────────────────────────────────────────
  // 3. CART SERVER-SIDE PRICE TAMPERING PREVENTION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. Cart Server-Side Price Validation ---');
  const timestamp = Date.now();
  const testCustomerEmail = `qa_price_test_${timestamp}@example.com`;
  const testPassword = 'Password123!';

  // Register customer
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'QA Price Check',
      email: testCustomerEmail,
      phone: '9876543288',
      password: testPassword,
      confirmPassword: testPassword,
    }),
  });
  const cookies = regRes.headers.getSetCookie ? regRes.headers.getSetCookie() : [regRes.headers.get('set-cookie') || ''];
  const customerCookie = cookies.join('; ');

  // Attempt to submit product with client-tampered price of ₹1
  await fetch(`${BASE_URL}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({
      productId: 'prod-curt-1',
      quantity: 1,
      price: 1, // Tampered price
    }),
  });

  // Fetch cart and verify server used genuine DB price (₹3,850)
  const cartRes = await fetch(`${BASE_URL}/api/cart`, { headers: { Cookie: customerCookie } });
  const cartData = await cartRes.json();
  const cartItem = cartData.items?.[0];
  const dbProdPrice = db.prepare('SELECT base_price FROM products WHERE id = ?').get('prod-curt-1').base_price;
  assert(cartItem?.unitPrice === dbProdPrice, `Cart enforces server-side price snapshot: ₹${cartItem?.unitPrice} (tampered ₹1 ignored)`);

  // ─────────────────────────────────────────────────────────────
  // 4. WISHLIST APIS & CUSTOMER ISOLATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. Wishlist API & Customer Isolation ---');

  // Customer A adds to wishlist
  const wishAddRes = await fetch(`${BASE_URL}/api/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify({ productId: 'prod-curt-1' }),
  });
  assert(wishAddRes.status === 200 || wishAddRes.status === 201, 'POST /api/wishlist adds item');

  // Customer A gets wishlist
  const wishGetRes = await fetch(`${BASE_URL}/api/wishlist`, { headers: { Cookie: customerCookie } });
  const wishData = await wishGetRes.json();
  assert(wishData.count === 1 && wishData.ids?.includes('prod-curt-1'), 'Customer A sees wishlist item in /api/wishlist');

  // Register Customer B and verify Customer B sees 0 wishlist items (isolation)
  const testCustomerEmailB = `qa_wish_b_${timestamp}@example.com`;
  const regResB = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'QA Wish B',
      email: testCustomerEmailB,
      phone: '9876543289',
      password: testPassword,
      confirmPassword: testPassword,
    }),
  });
  const cookiesB = regResB.headers.getSetCookie ? regResB.headers.getSetCookie() : [regResB.headers.get('set-cookie') || ''];
  const cookieB = cookiesB.join('; ');

  const wishGetResB = await fetch(`${BASE_URL}/api/wishlist`, { headers: { Cookie: cookieB } });
  const wishDataB = await wishGetResB.json();
  assert(wishDataB.count === 0, 'Customer B has 0 items (Wishlist data strictly isolated)');

  // Customer A removes from wishlist
  const wishDelRes = await fetch(`${BASE_URL}/api/wishlist/prod-curt-1`, {
    method: 'DELETE',
    headers: { Cookie: customerCookie },
  });
  assert(wishDelRes.status === 200, 'DELETE /api/wishlist/prod-curt-1 removes item');

  // ─────────────────────────────────────────────────────────────
  // 5. ORDER IDEMPOTENCY & CUSTOMER ISOLATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 5. Order Idempotency & Customer Isolation ---');
  const idempotencyKey = `idem-${Date.now()}`;
  const orderPayload = {
    customerName: 'QA Price Check',
    customerEmail: testCustomerEmail,
    customerPhone: '9876543288',
    deliveryAddress: 'Flat 101, Test Residency',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    paymentMethod: 'COD',
    idempotencyKey,
  };

  // Submit order 1
  const orderRes1 = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify(orderPayload),
  });
  const orderData1 = await orderRes1.json();
  const orderNum1 = orderData1.order?.orderNumber || orderData1.order?.order_number;
  assert(!!orderNum1, `Initial order placed with number ${orderNum1}`);

  // Submit order 2 with same idempotency key
  const orderRes2 = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
    body: JSON.stringify(orderPayload),
  });
  const orderData2 = await orderRes2.json();
  assert(orderData2.isDuplicateSubmission === true, 'Duplicate order submission identified by idempotencyKey');
  const orderNum2 = orderData2.order?.orderNumber || orderData2.order?.order_number;
  assert(orderNum1 === orderNum2, 'Duplicate submission returns the existing order reference');

  // Customer B tries to view Customer A's order -> 404
  const custBOrderRes = await fetch(`${BASE_URL}/api/orders/${orderNum1}`, {
    headers: { Cookie: cookieB },
  });
  assert(custBOrderRes.status === 404, 'Customer B cannot access Customer A order details (HTTP 404)');

  // ─────────────────────────────────────────────────────────────
  // 6. ADMIN ORDER STATUS TRANSITIONS
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 6. Admin Order Status Transition Rules ---');
  const adminHeaders = {
    'Content-Type': 'application/json',
    'x-admin-key': ADMIN_SECRET,
  };

  // Legal transition: CONFIRMED -> PROCESSING
  const patchProcessing = await fetch(`${BASE_URL}/api/admin/orders/${orderNum1}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ status: 'PROCESSING' }),
  });
  assert(patchProcessing.status === 200, 'Admin can transition order CONFIRMED -> PROCESSING');

  // Illegal transition: PROCESSING -> COMPLETED directly (must go to READY or DELIVERED first)
  const patchIllegal = await fetch(`${BASE_URL}/api/admin/orders/${orderNum1}`, {
    method: 'PATCH',
    headers: adminHeaders,
    body: JSON.stringify({ status: 'COMPLETED' }),
  });
  assert(patchIllegal.status === 400, 'Illegal transition PROCESSING -> COMPLETED rejected with HTTP 400');

  // ─────────────────────────────────────────────────────────────
  // 7. INTERNAL LINK CRAWLER (ZERO 404/500 ON ALL SITE ROUTES)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 7. Dynamic Internal Route Crawler ---');
  const activeProdsList = db.prepare('SELECT slug FROM products WHERE active = 1').all();
  const activeCatsList = db.prepare('SELECT slug FROM categories WHERE active = 1').all();

  const routesToTest = [
    '/',
    '/about',
    '/services',
    '/contact',
    '/cart',
    '/checkout',
    '/account',
    '/account/orders',
    '/admin/login',
    ...activeCatsList.map(c => `/categories/${c.slug}`),
    ...activeProdsList.map(p => `/products/${p.slug}`),
  ];

  let brokenRoutes = 0;
  for (const r of routesToTest) {
    try {
      const res = await fetch(`${BASE_URL}${r}`);
      if (res.status >= 400) {
        brokenRoutes++;
        console.error(`    Broken route: ${r} returned status ${res.status}`);
      }
    } catch (e) {
      brokenRoutes++;
      console.error(`    Failed to fetch route ${r}: ${e.message}`);
    }
  }
  assert(brokenRoutes === 0, `All ${routesToTest.length} active site routes (all 45 products, all 9 categories, all core pages) respond successfully with HTTP 200`);

  // ─────────────────────────────────────────────────────────────
  // 8. CODEBASE STATIC SCAN FOR FAKE/HARDCODED DATA LEAKS
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 8. Static Source Code Checks ---');
  // Check that no production route or component imports dummy fake products
  const productDetailSrc = fs.readFileSync('src/components/products/ProductDetailView.tsx', 'utf8');
  assert(!productDetailSrc.includes('DUMMY_'), 'ProductDetailView has no DUMMY_ constants');
  assert(!productDetailSrc.includes('MOCK_'), 'ProductDetailView has no MOCK_ constants');

  // Verify responsive CSS classes in main layouts
  const headerSrc = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');
  assert(headerSrc.includes('md:hidden') || headerSrc.includes('lg:hidden') || headerSrc.includes('sm:'), 'Header includes responsive mobile/desktop classes');

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n=================================================================');
  console.log(`DEEP QA AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=================================================================');
  db.close();

  if (failed > 0) {
    failures.forEach(f => console.log('  - ' + f));
    process.exit(1);
  } else {
    console.log('🎉 ALL 24 DEEP AUDIT CHECKS PASSED!\n');
    process.exit(0);
  }
}

runDeepAudit().catch(err => {
  console.error('Deep Audit Script crashed:', err);
  process.exit(1);
});
