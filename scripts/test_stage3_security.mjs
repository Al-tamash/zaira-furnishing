// scripts/test_stage3_security.mjs
// Automated verification suite for STAGE 3 — QUOTE REQUESTS + FREE MEASUREMENT REQUESTS

import { DatabaseSync } from 'node:sqlite';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('STAGE 3: SECURITY & BACKEND VERIFICATION SUITE');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const testCustomerEmailA = `stage3_customer_a_${timestamp}@example.com`;
  const testCustomerEmailB = `stage3_customer_b_${timestamp}@example.com`;
  const testPassword = 'Password123!';

  let customerCookieA = '';
  let customerCookieB = '';
  let customerIdA = '';
  let customerIdB = '';

  // ─── SETUP: Register Customer A and Customer B ───
  console.log('SETUP: Registering Test Customers');
  try {
    const regResA = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Sharma',
        email: testCustomerEmailA,
        password: testPassword,
        confirmPassword: testPassword,
        phone: '9876500001',
      }),
    });
    const dataA = await regResA.json();
    assert(regResA.status === 200 || regResA.status === 201, 'Customer A registered');
    customerIdA = dataA.user?.id;
    const cookiesA = regResA.headers.getSetCookie ? regResA.headers.getSetCookie() : [regResA.headers.get('set-cookie') || ''];
    customerCookieA = cookiesA.join('; ');

    const regResB = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Priya Patel',
        email: testCustomerEmailB,
        password: testPassword,
        confirmPassword: testPassword,
        phone: '9876500002',
      }),
    });
    const dataB = await regResB.json();
    assert(regResB.status === 200 || regResB.status === 201, 'Customer B registered');
    customerIdB = dataB.user?.id;
    const cookiesB = regResB.headers.getSetCookie ? regResB.headers.getSetCookie() : [regResB.headers.get('set-cookie') || ''];
    customerCookieB = cookiesB.join('; ');
  } catch (err) {
    console.error('Setup failed:', err);
  }

  // Find a valid active product with custom measurement
  const db = new DatabaseSync('data/zaira.db');
  const activeCustomProd = db.prepare(
    "SELECT id, name FROM products WHERE active = 1 AND custom_measurement_available = 1 LIMIT 1"
  ).get();

  let nonMeasurementProd = db.prepare(
    "SELECT id, name FROM products WHERE active = 1 AND custom_measurement_available = 0 LIMIT 1"
  ).get();
  const tempNonMeasId = !nonMeasurementProd ? `prod_temp_nonmeas_${timestamp}` : null;
  if (tempNonMeasId) {
    db.prepare(`
      INSERT INTO products (id, category_id, name, slug, description, short_description, product_type, base_price, active, custom_measurement_available, created_at, updated_at)
      VALUES (?, 'cat-1', 'Temp Non-Measurement Prod', ?, 'Temp', 'Temp', 'standard', 100, 1, 0, datetime('now'), datetime('now'))
    `).run(tempNonMeasId, `temp-nonmeas-${timestamp}`);
    nonMeasurementProd = { id: tempNonMeasId, name: 'Temp Non-Measurement Prod' };
  }

  let inactiveProd = db.prepare(
    "SELECT id, name FROM products WHERE active = 0 LIMIT 1"
  ).get();
  const tempInactiveId = !inactiveProd ? `prod_temp_inactive_${timestamp}` : null;
  if (tempInactiveId) {
    db.prepare(`
      INSERT INTO products (id, category_id, name, slug, description, short_description, product_type, base_price, active, custom_measurement_available, created_at, updated_at)
      VALUES (?, 'cat-1', 'Temp Inactive Prod', ?, 'Temp', 'Temp', 'standard', 100, 0, 1, datetime('now'), datetime('now'))
    `).run(tempInactiveId, `temp-inactive-${timestamp}`);
    inactiveProd = { id: tempInactiveId, name: 'Temp Inactive Prod' };
  }

  console.log('\nProducts for test:');
  console.log('  Active Custom Product:', activeCustomProd?.id, activeCustomProd?.name);
  console.log('  Non-Measurement Product:', nonMeasurementProd?.id, nonMeasurementProd?.name);
  console.log('  Inactive Product:', inactiveProd?.id, inactiveProd?.name);

  let quoteRequestBId = '';
  let quoteRequestBNumber = '';
  let measurementRequestBId = '';
  let measurementRequestBNumber = '';

  // Create Quote Request as Customer B
  const qResB = await fetch(`${BASE_URL}/api/quote-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: customerCookieB,
    },
    body: JSON.stringify({
      productId: activeCustomProd.id,
      quantity: 2,
      customerName: 'Priya Patel',
      phone: '9876500002',
      email: testCustomerEmailB,
      dimensions: '60″ Width × 96″ Height',
      customerNotes: 'Looking for blackout lining.',
      idempotencyKey: `idem_quote_b_${timestamp}`,
    }),
  });
  const qDataB = await qResB.json();
  quoteRequestBId = qDataB.quoteRequest?.id;
  quoteRequestBNumber = qDataB.quoteRequest?.request_number;

  // Create Measurement Request as Customer B
  const mResB = await fetch(`${BASE_URL}/api/measurement-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: customerCookieB,
    },
    body: JSON.stringify({
      productId: activeCustomProd.id,
      customerName: 'Priya Patel',
      phone: '9876500002',
      email: testCustomerEmailB,
      address: 'Villa 42, Jubilee Hills, Hyderabad',
      preferredDate: '2026-10-15',
      preferredTimeSlot: 'Morning (10:00 AM – 1:00 PM)',
      idempotencyKey: `idem_meas_b_${timestamp}`,
    }),
  });
  const mDataB = await mResB.json();
  measurementRequestBId = mDataB.measurementRequest?.id;
  measurementRequestBNumber = mDataB.measurementRequest?.request_number;

  console.log('\n--- 12 MANDATORY SECURITY TESTS ---');

  // Test 1: Customer A cannot read Customer B's quote request
  console.log('\nTest 1: Customer A reading Customer B quote request');
  const t1Res = await fetch(`${BASE_URL}/api/quote-requests/${quoteRequestBId}`, {
    headers: { Cookie: customerCookieA },
  });
  assert(t1Res.status === 403, `Customer A cannot read Customer B's quote request (HTTP ${t1Res.status})`);

  // Test 2: Customer A cannot read Customer B's measurement request
  console.log('\nTest 2: Customer A reading Customer B measurement request');
  const t2Res = await fetch(`${BASE_URL}/api/measurement-requests/${measurementRequestBId}`, {
    headers: { Cookie: customerCookieA },
  });
  assert(t2Res.status === 403, `Customer A cannot read Customer B's measurement request (HTTP ${t2Res.status})`);

  // Test 3: Customer cannot PATCH another customer's request
  console.log('\nTest 3: Customer PATCH request');
  const t3Res = await fetch(`${BASE_URL}/api/quote-requests/${quoteRequestBId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: customerCookieA,
    },
    body: JSON.stringify({ status: 'CLOSED' }),
  });
  assert(t3Res.status === 401, `Customer cannot PATCH quote request (Admin only) (HTTP ${t3Res.status})`);

  // Test 4: Non-admin cannot access admin request APIs
  console.log('\nTest 4: Non-admin accessing admin PATCH');
  const t4Res = await fetch(`${BASE_URL}/api/measurement-requests/${measurementRequestBId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: customerCookieA,
    },
    body: JSON.stringify({ status: 'SCHEDULED' }),
  });
  assert(t4Res.status === 401, `Non-admin cannot update measurement request (HTTP ${t4Res.status})`);

  // Test 5: Inactive product cannot receive a new request
  console.log('\nTest 5: Inactive product rejection');
  const t5Res = await fetch(`${BASE_URL}/api/quote-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: inactiveProd.id,
      quantity: 1,
      customerName: 'Test Inactive',
      phone: '9876543210',
    }),
  });
  const t5Data = await t5Res.json();
  assert(t5Res.status === 400 && t5Data.error?.includes('inactive'), `Inactive product rejected: "${t5Data.error}" (HTTP ${t5Res.status})`);

  // Test 6: Inactive variant cannot be submitted
  console.log('\nTest 6: Inactive variant rejection');
  // First insert a temporary inactive variant or check existing
  const tempVarId = `var_inactive_${timestamp}`;
  db.prepare(`
    INSERT INTO product_variants (id, product_id, name, variant_type, sku, price_adjustment, active, display_order, in_stock, created_at)
    VALUES (?, ?, 'Inactive Test Variant', 'color', 'SKU-INACT', 0, 0, 99, 0, datetime('now'))
  `).run(tempVarId, activeCustomProd.id);

  const t6Res = await fetch(`${BASE_URL}/api/quote-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: activeCustomProd.id,
      variantId: tempVarId,
      quantity: 1,
      customerName: 'Test Variant',
      phone: '9876543210',
    }),
  });
  const t6Data = await t6Res.json();
  assert(t6Res.status === 400 && t6Data.error?.includes('discontinued or inactive'), `Inactive variant rejected: "${t6Data.error}" (HTTP ${t6Res.status})`);
  // Cleanup temp variant
  db.prepare("DELETE FROM product_variants WHERE id = ?").run(tempVarId);

  // Test 7: Product ID tampering is rejected
  console.log('\nTest 7: Product ID tampering rejection');
  const t7Res = await fetch(`${BASE_URL}/api/quote-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'tampered-product-id-999',
      quantity: 1,
      customerName: 'Tamper Test',
      phone: '9876543210',
    }),
  });
  const t7Data = await t7Res.json();
  assert(t7Res.status === 400 && t7Data.error?.includes('does not exist'), `Product ID tampering rejected: "${t7Data.error}" (HTTP ${t7Res.status})`);

  // Test 8: Variant ID tampering is rejected (variant belongs to another product)
  console.log('\nTest 8: Variant ID tampering rejection');
  const otherVariant = db.prepare("SELECT id, product_id FROM product_variants WHERE product_id != ? AND active = 1 LIMIT 1").get(activeCustomProd.id);
  const t8Res = await fetch(`${BASE_URL}/api/quote-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: activeCustomProd.id,
      variantId: otherVariant?.id || 'fake-variant-id-999',
      quantity: 1,
      customerName: 'Variant Tamper Test',
      phone: '9876543210',
    }),
  });
  const t8Data = await t8Res.json();
  assert(t8Res.status === 400 && t8Data.error?.includes('does not exist for this product'), `Variant ID tampering rejected: "${t8Data.error}" (HTTP ${t8Res.status})`);

  // Test 9: Measurement request for a non-measurement product is rejected
  console.log('\nTest 9: Non-measurement product rejection');
  const t9Res = await fetch(`${BASE_URL}/api/measurement-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: nonMeasurementProd.id,
      customerName: 'Measurement Reject Test',
      phone: '9876543210',
      address: 'Banjara Hills, Hyderabad',
      preferredDate: '2026-10-20',
      preferredTimeSlot: 'Morning (10:00 AM – 1:00 PM)',
    }),
  });
  const t9Data = await t9Res.json();
  assert(
    t9Res.status === 400 && t9Data.error?.includes('does not support in-home custom measurement'),
    `Non-measurement product rejected: "${t9Data.error}" (HTTP ${t9Res.status})`
  );

  // Test 10: Duplicate submission protection works
  console.log('\nTest 10: Duplicate submission / Idempotency protection');
  const dupKey = `idem_dup_test_${timestamp}`;
  const dupPayload = {
    productId: activeCustomProd.id,
    quantity: 1,
    customerName: 'Idem User',
    phone: '9876543210',
    idempotencyKey: dupKey,
  };
  const d1Res = await fetch(`${BASE_URL}/api/quote-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dupPayload),
  });
  const d1Data = await d1Res.json();
  const d1Num = d1Data.quoteRequest?.request_number;

  // Immediate second submission with identical idempotencyKey
  const d2Res = await fetch(`${BASE_URL}/api/quote-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dupPayload),
  });
  const d2Data = await d2Res.json();
  const d2Num = d2Data.quoteRequest?.request_number;

  const countRow = db.prepare("SELECT COUNT(*) as c FROM quote_requests WHERE idempotency_key = ?").get(dupKey);
  assert(
    d1Res.ok && d2Res.ok && d1Num === d2Num && countRow.c === 1,
    `Duplicate submission returned existing record without creating duplicate row (total records: ${countRow.c}, req#: ${d1Num})`
  );

  // Test 11: Request number is unique and follows format
  console.log('\nTest 11: Request number format and uniqueness');
  const isQuoteFormatValid = /^ZQ-\d{8}-[A-Z0-9]{4}$/.test(quoteRequestBNumber);
  const isMeasFormatValid = /^ZM-\d{8}-[A-Z0-9]{4}$/.test(measurementRequestBNumber);
  const dupCheckQuote = db.prepare("SELECT COUNT(*) as c FROM quote_requests WHERE request_number = ?").get(quoteRequestBNumber);
  const dupCheckMeas = db.prepare("SELECT COUNT(*) as c FROM measurement_requests WHERE request_number = ?").get(measurementRequestBNumber);

  assert(
    isQuoteFormatValid && isMeasFormatValid && dupCheckQuote.c === 1 && dupCheckMeas.c === 1,
    `Request numbers valid format (ZQ: ${quoteRequestBNumber}, ZM: ${measurementRequestBNumber}) and unique in DB`
  );

  // Test 12: SQL injection-style input is safely parameterized
  console.log('\nTest 12: SQL injection parameterization');
  const sqlInjectionString = "'; DROP TABLE test_injection_dummy; -- ' OR '1'='1";
  const t12Res = await fetch(`${BASE_URL}/api/quote-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: activeCustomProd.id,
      quantity: 1,
      customerName: `Safe User ${sqlInjectionString}`,
      phone: '9876543210',
      customerNotes: sqlInjectionString,
    }),
  });
  const t12Data = await t12Res.json();
  const savedRow = db.prepare("SELECT customer_name, customer_notes FROM quote_requests WHERE id = ?").get(t12Data.quoteRequest?.id);

  assert(
    t12Res.ok && savedRow && savedRow.customer_notes === sqlInjectionString,
    `SQL injection string safely stored as literal parameter value without database corruption`
  );

  // ─── ADMIN MANAGEMENT CHECKS ───
  console.log('\n--- ADMIN MANAGEMENT VERIFICATION ---');
  // Admin Quote Update
  const patchQuoteRes = await fetch(`${BASE_URL}/api/quote-requests/${quoteRequestBId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_SECRET,
    },
    body: JSON.stringify({ status: 'QUOTED' }),
  });
  const patchQuoteData = await patchQuoteRes.json();
  assert(patchQuoteRes.status === 200 && patchQuoteData.quoteRequest?.status === 'QUOTED', 'Admin successfully updated quote status to QUOTED');

  // Admin Measurement Update
  const patchMeasRes = await fetch(`${BASE_URL}/api/measurement-requests/${measurementRequestBId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': ADMIN_SECRET,
    },
    body: JSON.stringify({ status: 'SCHEDULED' }),
  });
  const patchMeasData = await patchMeasRes.json();
  assert(patchMeasRes.status === 200 && patchMeasData.measurementRequest?.status === 'SCHEDULED', 'Admin successfully updated measurement status to SCHEDULED');

  // Admin List with Search and Filter
  const listRes = await fetch(`${BASE_URL}/api/quote-requests?status=QUOTED&search=${quoteRequestBNumber}`, {
    headers: { 'x-admin-key': ADMIN_SECRET },
  });
  const listData = await listRes.json();
  assert(listRes.status === 200 && listData.quoteRequests?.length === 1, 'Admin filter and search returned exact target request');

  if (tempNonMeasId) {
    db.prepare("DELETE FROM quote_requests WHERE product_id = ?").run(tempNonMeasId);
    db.prepare("DELETE FROM measurement_requests WHERE product_id = ?").run(tempNonMeasId);
    db.prepare("DELETE FROM products WHERE id = ?").run(tempNonMeasId);
  }
  if (tempInactiveId) {
    db.prepare("DELETE FROM quote_requests WHERE product_id = ?").run(tempInactiveId);
    db.prepare("DELETE FROM measurement_requests WHERE product_id = ?").run(tempInactiveId);
    db.prepare("DELETE FROM products WHERE id = ?").run(tempInactiveId);
  }

  console.log('\n====================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
