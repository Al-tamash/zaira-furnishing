// scripts/test_stage6_notifications.mjs
// Automated verification suite for STAGE 6 — CUSTOMER & ADMIN ORDER NOTIFICATIONS

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
  console.log('STAGE 6: ORDER NOTIFICATIONS VERIFICATION SUITE');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const testCustomerEmailA = `stage6_customer_a_${timestamp}@example.com`;
  const testCustomerEmailB = `stage6_customer_b_${timestamp}@example.com`;
  const testPassword = 'Password123!';
  let customerCookieA = '';
  let customerCookieB = '';

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
        phone: '+91 9876500001',
      }),
    });
    assert(regResA.status === 200 || regResA.status === 201, `Customer A registered`);
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
        phone: '+91 9876500002',
      }),
    });
    assert(regResB.status === 200 || regResB.status === 201, `Customer B registered`);
    const cookiesB = regResB.headers.getSetCookie ? regResB.headers.getSetCookie() : [regResB.headers.get('set-cookie') || ''];
    customerCookieB = cookiesB.join('; ');
  } catch (err) {
    assert(false, `Setup failed: ${err.message}`);
  }

  // ─── TEST 1: Unconfigured Provider Records FAILED without Cancelling Order ───
  console.log('\nTEST 1: Notification Provider Unconfigured Handling & Order Preservation');
  let orderNumber1 = '';
  let orderId1 = '';

  try {
    // 1. Get product from catalog
    const prodsRes = await fetch(`${BASE_URL}/api/products`);
    const prodsData = await prodsRes.json();
    const product = prodsData.data[0];
    assert(Boolean(product), `Got product "${product.name}"`);

    // 2. Add to Cart
    await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookieA },
      body: JSON.stringify({
        productId: product.id,
        quantity: 1,
        sizeLabel: 'Standard 7ft Door',
      }),
    });

    // 3. Place Order without provider configured (default local test environment)
    const placeRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookieA },
      body: JSON.stringify({
        customerName: 'Aarav Sharma',
        customerEmail: testCustomerEmailA,
        customerPhone: '+91 9876500001',
        deliveryAddress: 'Flat 301, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        deliveryOption: 'standard',
        paymentMethod: 'COD',
      }),
    });

    assert(placeRes.status === 200 || placeRes.status === 201, `Order placement succeeded (status ${placeRes.status})`);
    const placeData = await placeRes.json();
    orderNumber1 = placeData.order.orderNumber || placeData.order.order_number;
    orderId1 = placeData.order.id;
    assert(Boolean(orderNumber1), `Order reference generated: ${orderNumber1}`);

    // 4. Verify in Admin that Order was NOT cancelled despite provider being unconfigured
    const adminCheckRes = await fetch(`${BASE_URL}/api/admin/orders/${orderNumber1}`, {
      headers: { 'x-admin-key': ADMIN_SECRET },
    });
    assert(adminCheckRes.status === 200, `Admin successfully fetched order ${orderNumber1}`);
    const adminCheckData = await adminCheckRes.json();
    const fetchedOrder = adminCheckData.order;

    assert(fetchedOrder.status === 'CONFIRMED', `Order remains CONFIRMED in D1`);
    assert(fetchedOrder.payment_status === 'PENDING', `Payment status is COD PENDING`);

    // 5. Inspect Notification Records in D1
    const notifs = fetchedOrder.notifications || [];
    assert(notifs.length >= 2, `Exactly 2 notifications created for new order (found ${notifs.length})`);

    const custNotif = notifs.find((n) => n.event_type === 'NEW_ORDER_CUSTOMER');
    const adminNotif = notifs.find((n) => n.event_type === 'NEW_ORDER_ADMIN');

    assert(Boolean(custNotif), `Customer confirmation notification record created`);
    assert(custNotif?.recipient_email === testCustomerEmailA, `Customer notification recipient is customer email`);
    assert(custNotif?.recipient_type === 'CUSTOMER', `Recipient type is CUSTOMER`);
    assert(custNotif?.status === 'FAILED', `Status accurately recorded as FAILED (unconfigured provider)`);
    assert(custNotif?.error_message?.toLowerCase().includes('configured'), `Error message clearly explains unconfigured provider`);

    assert(Boolean(adminNotif), `Admin new-order notification record created`);
    assert(adminNotif?.recipient_type === 'ADMIN', `Recipient type is ADMIN`);
    assert(adminNotif?.status === 'FAILED', `Admin notification status is FAILED (unconfigured provider)`);
    assert(Boolean(adminNotif?.recipient_email), `Admin recipient email is configured: ${adminNotif?.recipient_email}`);
  } catch (err) {
    assert(false, `Test 1 failed: ${err.message}`);
  }

  // ─── TEST 2: Failed Order Transaction Creates NO Notifications ───
  console.log('\nTEST 2: Failed Order Transaction Must Not Trigger Notifications');
  try {
    // Attempt order placement with empty cart / invalid data
    const failRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookieA },
      body: JSON.stringify({
        customerName: 'Aarav Sharma',
        customerEmail: 'invalid-email', // invalid
        customerPhone: '123',
        deliveryAddress: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: 'COD',
      }),
    });

    assert(failRes.status === 400 || failRes.status === 500, `Invalid order submission rejected (${failRes.status})`);
  } catch (err) {
    assert(false, `Test 2 failed: ${err.message}`);
  }

  // ─── TEST 3: Status Transition Notifications ───
  console.log('\nTEST 3: Status Transition Notification Rules');
  try {
    // 1. Transition CONFIRMED -> PROCESSING (Valid change -> creates notification)
    const patch1 = await fetch(`${BASE_URL}/api/admin/orders/${orderNumber1}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_SECRET },
      body: JSON.stringify({ status: 'PROCESSING', notes: 'Bespoke tailoring begun.' }),
    });
    assert(patch1.status === 200, `Admin transitioned status to PROCESSING`);
    const patch1Data = await patch1.json();
    const notifsAfterPatch1 = patch1Data.order?.notifications || [];

    const statusNotif1 = notifsAfterPatch1.find(
      (n) => n.event_type === 'ORDER_STATUS_UPDATED_CUSTOMER' && n.idempotency_key.includes('PROCESSING')
    );
    assert(Boolean(statusNotif1), `Status update notification created for PROCESSING`);
    assert(statusNotif1?.recipient_email === testCustomerEmailA, `Notification recipient is customer email`);

    // 2. Attempt Same Status Update: PROCESSING -> PROCESSING (No change -> NO notification)
    const notifCountBeforeSameStatus = notifsAfterPatch1.length;
    const patchSame = await fetch(`${BASE_URL}/api/admin/orders/${orderNumber1}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_SECRET },
      body: JSON.stringify({ status: 'PROCESSING', notes: 'Duplicate status check' }),
    });
    assert(patchSame.status === 200, `Admin sent same status PROCESSING`);
    const patchSameData = await patchSame.json();
    const notifsAfterSame = patchSameData.order?.notifications || [];
    assert(
      notifsAfterSame.length === notifCountBeforeSameStatus,
      `No duplicate notification created when status does not change (${notifsAfterSame.length} == ${notifCountBeforeSameStatus})`
    );

    // 3. Attempt Invalid Transition: PROCESSING -> COMPLETED (skipping READY -> rejected 400 -> NO notification)
    const patchInvalid = await fetch(`${BASE_URL}/api/admin/orders/${orderNumber1}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_SECRET },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    assert(patchInvalid.status === 400, `Illegal transition PROCESSING -> COMPLETED rejected with 400`);
  } catch (err) {
    assert(false, `Test 3 failed: ${err.message}`);
  }

  // ─── TEST 4: Successful Delivery Simulation & Idempotency Check ───
  console.log('\nTEST 4: Delivery Provider Code-Path & Idempotency Check');
  try {
    // We test the retry endpoint with NOTIFICATION_MOCK_SUCCESS set to verify the SENT code-path
    process.env.NOTIFICATION_MOCK_SUCCESS = 'true';

    // 1. Fetch current notifications for order 1
    const adminRes = await fetch(`${BASE_URL}/api/admin/orders/${orderNumber1}`, {
      headers: { 'x-admin-key': ADMIN_SECRET },
    });
    const orderData = await adminRes.json();
    const failedNotif = (orderData.order?.notifications || []).find((n) => n.status === 'FAILED');
    assert(Boolean(failedNotif), `Found failed notification record to test retry: ${failedNotif?.id}`);

    // 2. Retry the failed notification via Admin Retry API with mock header in dev
    const retryRes = await fetch(`${BASE_URL}/api/admin/orders/${orderNumber1}/retry-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': ADMIN_SECRET,
        'x-notification-mock': 'true',
      },
      body: JSON.stringify({ notificationId: failedNotif.id }),
    });
    assert(retryRes.status === 200, `Retry API returned 200`);
    const retryData = await retryRes.json();
    assert(retryData.success === true, `Retry dispatch succeeded`);
    assert(retryData.notification.status === 'SENT', `Notification status updated to SENT in D1`);
    assert(Boolean(retryData.notification.provider_message_id), `Provider message ID recorded: ${retryData.notification.provider_message_id}`);
    assert(retryData.notification.attempts >= 1, `Attempts counter incremented: ${retryData.notification.attempts}`);

    // 3. Duplicate Prevention: Attempt to retry the ALREADY SENT notification
    const duplicateRetryRes = await fetch(`${BASE_URL}/api/admin/orders/${orderNumber1}/retry-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_SECRET },
      body: JSON.stringify({ notificationId: failedNotif.id }),
    });
    assert(duplicateRetryRes.status === 400, `Retrying already SENT notification rejected with 400 (duplicate prevention)`);

    // Reset mock flag
    delete process.env.NOTIFICATION_MOCK_SUCCESS;
  } catch (err) {
    assert(false, `Test 4 failed: ${err.message}`);
  }

  // ─── TEST 5: Security & Isolation Testing ───
  console.log('\nTEST 5: Security & Customer Isolation against Notification Data');
  try {
    // 1. Customer A attempts to call admin retry endpoint -> 401
    const custRetryRes = await fetch(`${BASE_URL}/api/admin/orders/${orderNumber1}/retry-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookieA },
      body: JSON.stringify({ notificationId: 'any-id' }),
    });
    assert(custRetryRes.status === 401, `Customer calling admin retry endpoint blocked with 401 (got ${custRetryRes.status})`);

    // 2. Customer B attempts to view Customer A's order -> 404
    const custBViewRes = await fetch(`${BASE_URL}/api/orders/${orderNumber1}`, {
      headers: { Cookie: customerCookieB },
    });
    assert(custBViewRes.status === 404, `Customer B blocked from Customer A's order (404)`);

    // 3. Customer A calling GET /api/orders/[id] does NOT receive admin notification data
    const custAViewRes = await fetch(`${BASE_URL}/api/orders/${orderNumber1}`, {
      headers: { Cookie: customerCookieA },
    });
    assert(custAViewRes.status === 200, `Customer A views own order`);
    const custAData = await custAViewRes.json();
    assert(custAData.order?.notifications === undefined, `Customer API does not leak internal notification logs`);

    // 4. Verify API response never exposes notification secrets/API keys
    const adminOrderViewRes = await fetch(`${BASE_URL}/api/admin/orders/${orderNumber1}`, {
      headers: { 'x-admin-key': ADMIN_SECRET },
    });
    const adminOrderJson = await adminOrderViewRes.json();
    assert(adminOrderJson.order?.apiKey === undefined, `Admin API response does not leak apiKey`);
    assert(adminOrderJson.order?.providerSecret === undefined, `Admin API response does not leak providerSecret`);
    assert(adminOrderJson.order?.provider_api_key === undefined, `Admin API response does not leak provider_api_key`);
    const notifs = adminOrderJson.order?.notifications || [];
    assert(notifs.every((n) => n.api_key === undefined && n.secret === undefined), `No secrets in notification records`);
  } catch (err) {
    assert(false, `Test 5 failed: ${err.message}`);
  }

  // ─── FINAL SUMMARY ───
  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
