// scripts/qa_full_website.mjs
// Comprehensive End-to-End Functional, SSR & API QA Audit Suite
import { DatabaseSync } from 'node:sqlite';

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

async function runQa() {
  console.log('=================================================================');
  console.log('ZAIRA FURNISHING: FULL WEBSITE A–Z END-TO-END QA AUDIT');
  console.log(`Target: ${BASE_URL}`);
  console.log('=================================================================\n');

  // ─────────────────────────────────────────────────────────────
  // SECTION 1: PUBLIC PAGES SSR RENDERING & CONTENT INTEGRITY
  // ─────────────────────────────────────────────────────────────
  console.log('--- SECTION 1: SSR Pages & Route Availability ---');
  
  const publicRoutes = [
    { path: '/', titleCheck: 'Zaira Furnishing' },
    { path: '/about', titleCheck: 'About' },
    { path: '/services', titleCheck: 'Services' },
    { path: '/contact', titleCheck: 'Contact' },
    { path: '/cart', titleCheck: 'Cart' },
    { path: '/checkout', titleCheck: 'Checkout' },
    { path: '/admin/login', titleCheck: 'Admin' },
    { path: '/categories/curtains/blackout', titleCheck: 'Curtain' },
    { path: '/products/blackout-curtains', titleCheck: 'Blackout' },
    { path: '/products/sheer-day-curtains', titleCheck: 'Sheer' },
  ];

  for (const r of publicRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${r.path}`);
      assert(res.status === 200, `Route ${r.path} returns HTTP 200`, `status: ${res.status}`);
      const html = await res.text();
      assert(html.toLowerCase().includes(r.titleCheck.toLowerCase()), `Route ${r.path} contains "${r.titleCheck}" in HTML`);
    } catch (e) {
      assert(false, `Route ${r.path} fetch failed`, e.message);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 2: PRODUCT DETAIL VARIANT SELECTOR INTEGRITY
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 2: Product Detail Variant Selector QA ---');

  // 2a. Blackout Curtains (4 active variants) -> MUST render active variant options
  try {
    const res = await fetch(`${BASE_URL}/products/blackout-curtains`);
    const html = await res.text();
    const hasColourSelector = html.includes('Select Colour') || html.includes('Select Option');
    const hasNavy = html.includes('Midnight Navy');
    const hasBeige = html.includes('Warm Beige');
    assert(hasColourSelector && hasNavy && hasBeige, 'prod-off-blackout-curtains renders active variant choices (Midnight Navy, Warm Beige)');
    assert(html.includes('Blackout Curtains'), 'prod-off-blackout-curtains renders product name correctly');
    assert(html.includes('₹'), 'prod-off-blackout-curtains renders currency symbol ₹');
  } catch (e) {
    assert(false, 'Product blackout-curtains fetch failed', e.message);
  }

  // 2b. Sheer / Day Curtains (3 active variants) -> MUST show variant options
  try {
    const res = await fetch(`${BASE_URL}/products/sheer-day-curtains`);
    const html = await res.text();
    const hasSelector = html.includes('Select Colour') || html.includes('Select Option');
    const hasChalkWhite = html.includes('Chalk White');
    const hasChampagne = html.includes('Champagne Shimmer');
    assert(hasSelector && hasChalkWhite && hasChampagne, 'prod-off-sheer-day-curtains renders active variant choices (Chalk White, Champagne Shimmer)');
  } catch (e) {
    assert(false, 'Product sheer-day-curtains fetch failed', e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 3: CUSTOMER REGISTRATION, CART & CHECKOUT (COD)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 3: Customer Auth, Cart & COD Checkout E2E Flow ---');
  let customerCookie = '';
  const timestamp = Date.now();
  const testCustomerEmail = `qa_audit_customer_${timestamp}@example.com`;
  const testPassword = 'Password123!';

  try {
    // 3a. Register customer to establish authenticated session
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'QA Audit Customer',
        email: testCustomerEmail,
        phone: '9876543299',
        password: testPassword,
        confirmPassword: testPassword,
      }),
    });
    assert(regRes.status === 200 || regRes.status === 201, 'Customer registration returns 200/201', `status: ${regRes.status}`);
    const setCookie = regRes.headers.get('set-cookie');
    if (setCookie) {
      customerCookie = setCookie.split(';')[0];
    }
    assert(!!customerCookie, 'Customer auth session cookie established');

    // 3b. Add item to cart
    const addRes = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        productId: 'prod-off-blackout-curtains',
        quantity: 2,
        notes: 'Living room window pair',
      }),
    });
    assert(addRes.status === 200 || addRes.status === 201, 'POST /api/cart/items returns 200/201', `status: ${addRes.status}`);

    // 3c. Get cart
    const getCartRes = await fetch(`${BASE_URL}/api/cart`, {
      headers: { Cookie: customerCookie },
    });
    assert(getCartRes.status === 200, 'GET /api/cart returns HTTP 200');
    const cartData = await getCartRes.json();
    assert(cartData.cartId && cartData.items && cartData.items.length > 0, 'Cart contains active items', `count: ${cartData.items?.length}`);

    // 3d. Checkout & Order Placement (COD)
    const orderPayload = {
      customerName: 'QA Audit Customer',
      customerEmail: testCustomerEmail,
      customerPhone: '9876543299',
      deliveryAddress: 'Flat 304, Prestige Palms, Whitefield Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      paymentMethod: 'COD',
      notes: 'QA COD Order Placement',
    };

    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: customerCookie,
      },
      body: JSON.stringify(orderPayload),
    });

    assert(orderRes.status === 200 || orderRes.status === 201, 'POST /api/orders returns 200/201', `status: ${orderRes.status}`);
    const orderData = await orderRes.json();
    const orderNumber = orderData.order?.orderNumber || orderData.order?.order_number || orderData.orderNumber;
    assert(!!orderNumber, `Order created with order reference: ${orderNumber}`);

    // Verify DB persistence of order
    const db = new DatabaseSync('data/zaira.db');
    const dbOrder = db.prepare('SELECT * FROM orders WHERE user_id = (SELECT id FROM users WHERE email = ?) ORDER BY id DESC LIMIT 1').get(testCustomerEmail);
    assert(!!dbOrder, 'Order successfully recorded in orders table for customer');
    assert(dbOrder && dbOrder.payment_method?.toUpperCase() === 'COD', 'Payment method is COD');
    assert(dbOrder && dbOrder.payment_status?.toUpperCase() === 'PENDING', 'COD payment_status is PENDING');
    db.close();
  } catch (e) {
    assert(false, 'Auth, Cart, and Checkout workflow failed', e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 4: QUOTE REQUEST FLOW & VERIFICATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 4: Quote Request E2E Flow ---');
  try {
    const quotePayload = {
      productId: 'prod-off-blackout-curtains',
      customerName: 'QA Quote Customer',
      customerEmail: `qa_quote_${timestamp}@example.com`,
      customerPhone: '9876543210',
      pincode: '560001',
      customerNotes: 'Automated QA Quote Request verification',
      dimensions: '8x10 ft',
    };

    const quoteRes = await fetch(`${BASE_URL}/api/quote-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotePayload),
    });

    assert(quoteRes.status === 200 || quoteRes.status === 201, 'POST /api/quote-requests returns 200/201', `status: ${quoteRes.status}`);
    const quoteData = await quoteRes.json();
    const reqNum = quoteData.quoteRequest?.request_number;
    assert(!!reqNum && reqNum.startsWith('ZQ-'), `Quote request created with valid number: ${reqNum}`);

    // Verify DB persistence
    if (reqNum) {
      const db = new DatabaseSync('data/zaira.db');
      const dbRow = db.prepare('SELECT * FROM quote_requests WHERE request_number = ?').get(reqNum);
      assert(!!dbRow, 'Quote request persisted to database with matching request_number');
      assert(dbRow && dbRow.customer_email === quotePayload.customerEmail, 'Customer email matched in DB');
      db.close();
    }
  } catch (e) {
    assert(false, 'Quote request flow failed', e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 5: FREE MEASUREMENT REQUEST FLOW
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 5: Free Measurement Request E2E Flow ---');
  try {
    const measurementPayload = {
      productId: 'prod-off-blackout-curtains',
      customerName: 'QA Measurement Customer',
      customerEmail: `qa_measure_${timestamp}@example.com`,
      customerPhone: '9876543211',
      address: 'Plot 42, Green Glen Layout, Bellandur, Bengaluru 560103',
      preferredDate: '2026-10-05',
      preferredTimeSlot: 'morning',
      customerNotes: 'Free measurement QA test',
    };

    const measureRes = await fetch(`${BASE_URL}/api/measurement-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(measurementPayload),
    });

    assert(measureRes.status === 200 || measureRes.status === 201, 'POST /api/measurement-requests returns 200/201', `status: ${measureRes.status}`);
    const measureData = await measureRes.json();
    const reqNum = measureData.measurementRequest?.request_number;
    assert(!!reqNum && reqNum.startsWith('ZM-'), `Measurement request created with valid number: ${reqNum}`);

    // Verify DB persistence
    if (reqNum) {
      const db = new DatabaseSync('data/zaira.db');
      const dbRow = db.prepare('SELECT * FROM measurement_requests WHERE request_number = ?').get(reqNum);
      assert(!!dbRow, 'Measurement request persisted to database with matching request_number');
      assert(dbRow && dbRow.address.includes('Bengaluru'), 'Address persisted correctly in DB');
      db.close();
    }
  } catch (e) {
    assert(false, 'Measurement request flow failed', e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 6: ADMIN API ACCESS & SECURITY
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- SECTION 6: Admin API Security & Data Management ---');
  try {
    // 6a. Unauthorized requests without admin key must fail with 401
    const unauthOrders = await fetch(`${BASE_URL}/api/admin/orders`);
    assert(unauthOrders.status === 401, 'Unauthenticated GET /api/admin/orders returns HTTP 401', `status: ${unauthOrders.status}`);

    const unauthQuotes = await fetch(`${BASE_URL}/api/quote-requests`);
    assert(unauthQuotes.status === 401, 'Unauthenticated GET /api/quote-requests returns HTTP 401', `status: ${unauthQuotes.status}`);

    const unauthMeasures = await fetch(`${BASE_URL}/api/measurement-requests`);
    assert(unauthMeasures.status === 401, 'Unauthenticated GET /api/measurement-requests returns HTTP 401', `status: ${unauthMeasures.status}`);

    // 6b. Authorized requests with x-admin-key
    const authHeaders = { 'x-admin-key': ADMIN_SECRET };

    const authOrders = await fetch(`${BASE_URL}/api/admin/orders`, { headers: authHeaders });
    assert(authOrders.status === 200, 'Authorized GET /api/admin/orders returns HTTP 200');

    const authQuotes = await fetch(`${BASE_URL}/api/quote-requests`, { headers: authHeaders });
    assert(authQuotes.status === 200, 'Authorized GET /api/quote-requests returns HTTP 200');

    const authMeasures = await fetch(`${BASE_URL}/api/measurement-requests`, { headers: authHeaders });
    assert(authMeasures.status === 200, 'Authorized GET /api/measurement-requests returns HTTP 200');

    const authCats = await fetch(`${BASE_URL}/api/admin/categories`, { headers: authHeaders });
    assert(authCats.status === 200, 'Authorized GET /api/admin/categories returns HTTP 200');

    const authProds = await fetch(`${BASE_URL}/api/admin/products`, { headers: authHeaders });
    assert(authProds.status === 200, 'Authorized GET /api/admin/products returns HTTP 200');
  } catch (e) {
    assert(false, 'Admin API testing failed', e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n=================================================================');
  console.log(`FULL QA AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=================================================================');
  if (failed > 0) {
    console.log('Failures:');
    failures.forEach(f => console.log('  - ' + f));
    process.exit(1);
  } else {
    console.log('🎉 ALL QA AUDIT CHECKS PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  }
}

runQa().catch(err => {
  console.error('QA Script crashed:', err);
  process.exit(1);
});
