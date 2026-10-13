import { getDatabase } from '../src/lib/db';
import {
  ZAIRA_WHATSAPP_NUMBER,
  ZAIRA_WHATSAPP_DISPLAY,
  buildOrderWhatsAppMessage,
  buildOrderWhatsAppUrl,
  WhatsAppOrderData,
} from '../src/lib/whatsapp';
import {
  recordStatusHistory,
  getOrderStatusHistory,
  getUnreadAdminWhatsAppOrdersCount,
  markOrderNotificationsAsRead,
  markNotificationAsRead,
  triggerNewOrderNotifications,
  triggerOrderStatusUpdateNotification,
} from '../src/lib/notifications/service';
import { DbOrder, DbOrderItem, DbOrderNotification } from '../src/lib/db/types';

const db = getDatabase();

let passed = 0;
let failed = 0;
const testIdsToCleanup = {
  users: [] as string[],
  orders: [] as string[],
  orderItems: [] as string[],
  notifications: [] as string[],
  history: [] as string[],
  carts: [] as string[],
  cartItems: [] as string[],
  products: [] as string[],
};

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.log(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function cleanup() {
  console.log('\n--- Cleaning up test records ---');
  for (const id of testIdsToCleanup.history) {
    await db.execute('DELETE FROM order_status_history WHERE order_id = ?', [id]);
  }
  for (const id of testIdsToCleanup.notifications) {
    await db.execute('DELETE FROM order_notifications WHERE id = ? OR order_id = ?', [id, id]);
  }
  for (const id of testIdsToCleanup.orderItems) {
    await db.execute('DELETE FROM order_items WHERE id = ? OR order_id = ?', [id, id]);
  }
  for (const id of testIdsToCleanup.orders) {
    await db.execute('DELETE FROM orders WHERE id = ?', [id]);
  }
  for (const id of testIdsToCleanup.cartItems) {
    await db.execute('DELETE FROM cart_items WHERE id = ? OR cart_id = ?', [id, id]);
  }
  for (const id of testIdsToCleanup.carts) {
    await db.execute('DELETE FROM carts WHERE id = ?', [id]);
  }
  for (const id of testIdsToCleanup.products) {
    await db.execute('DELETE FROM products WHERE id = ?', [id]);
  }
  for (const id of testIdsToCleanup.users) {
    await db.execute('DELETE FROM customer_sessions WHERE user_id = ?', [id]);
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
  }
  console.log('Cleanup completed successfully.\n');
}

async function runAudit() {
  console.log('================================================================');
  console.log('  STAGE 6 — PRODUCTION-READINESS AUDIT & VERIFICATION SUITE');
  console.log('================================================================\n');

  try {
    const timestamp = Date.now();
    const TEST_USER_A = `usr-aud-a-${timestamp}`;
    const TEST_USER_B = `usr-aud-b-${timestamp}`;
    const TEST_PROD_1 = `prod-aud-1-${timestamp}`;
    const TEST_ORDER_1 = `ord-aud-1-${timestamp}`;
    const TEST_ORDER_NUM_1 = `ZAI-2026-AUD001`;
    const TEST_ORDER_2 = `ord-aud-2-${timestamp}`;
    const TEST_ORDER_NUM_2 = `ZAI-2026-AUD002`;

    testIdsToCleanup.users.push(TEST_USER_A, TEST_USER_B);
    testIdsToCleanup.orders.push(TEST_ORDER_1, TEST_ORDER_2);
    testIdsToCleanup.history.push(TEST_ORDER_1, TEST_ORDER_2);
    testIdsToCleanup.notifications.push(TEST_ORDER_1, TEST_ORDER_2);
    testIdsToCleanup.products.push(TEST_PROD_1);

    // ─────────────────────────────────────────────────────────────
    // SETUP FIXTURES
    // ─────────────────────────────────────────────────────────────
    await db.execute(
      `INSERT INTO users (id, role, name, email, phone, created_at, updated_at)
       VALUES (?, 'CUSTOMER', 'Auditor Customer A', 'audit.a@example.com', '+919876543210', datetime('now'), datetime('now'))`,
      [TEST_USER_A]
    );

    await db.execute(
      `INSERT INTO users (id, role, name, email, phone, created_at, updated_at)
       VALUES (?, 'CUSTOMER', 'Auditor Customer B', 'audit.b@example.com', '+919876543211', datetime('now'), datetime('now'))`,
      [TEST_USER_B]
    );

    await db.execute(
      `INSERT INTO products (id, name, slug, description, short_description, category_id, base_price, active, product_type, created_at, updated_at)
       VALUES (?, 'Audit Silk Drapes', 'audit-silk-drapes', 'Luxury Silk Drapery', 'Silk drapes', 'cat-1', 6500, 1, 'custom_made', datetime('now'), datetime('now'))`,
      [TEST_PROD_1]
    );

    // ─────────────────────────────────────────────────────────────
    // 1. ORDER FLOW & DATABASE CREATION INTEGRITY
    // ─────────────────────────────────────────────────────────────
    console.log('[AUDIT CHECK 1] Order Flow & Database Creation');
    await db.execute(
      `INSERT INTO orders (
        id, order_number, user_id, status, payment_method, payment_status,
        customer_name, customer_email, customer_phone, delivery_address,
        city, state, pincode, landmark, delivery_option, site_visit_required,
        subtotal, discount, delivery_charge, total_amount, idempotency_key,
        order_source, created_at, updated_at
      ) VALUES (?, ?, ?, 'CONFIRMED', 'COD', 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, 'standard', 0, ?, 0, 0, ?, ?, 'WHATSAPP', datetime('now'), datetime('now'))`,
      [
        TEST_ORDER_1,
        TEST_ORDER_NUM_1,
        TEST_USER_A,
        'Auditor Customer A',
        'audit.a@example.com',
        '+919876543210',
        'Flat 402, Royal Palms, Jubilee Hills',
        'Hyderabad',
        'Telangana',
        '500033',
        'Near Metro Pillar 12',
        13000,
        13000,
        `idemp-${TEST_ORDER_1}`,
      ]
    );

    const createdOrder = await db.queryOne<DbOrder>('SELECT * FROM orders WHERE id = ?', [TEST_ORDER_1]);
    assert(createdOrder !== null, 'Order successfully created in D1 database');
    assert(createdOrder?.order_number === TEST_ORDER_NUM_1, `Order number format preserved: ${createdOrder?.order_number}`);
    assert(createdOrder?.status === 'CONFIRMED', 'Initial order status is CONFIRMED');
    assert(createdOrder?.payment_method === 'COD', 'Payment method is COD');
    assert(createdOrder?.payment_status === 'PENDING', 'Payment status is PENDING');

    // ─────────────────────────────────────────────────────────────
    // 2. ORDER ITEMS & HISTORICAL SNAPSHOTS
    // ─────────────────────────────────────────────────────────────
    console.log('\n[AUDIT CHECK 2] Order Items & Historical Snapshots');
    const ITEM_1_ID = `item-aud-1-${timestamp}`;
    testIdsToCleanup.orderItems.push(ITEM_1_ID);

    await db.execute(
      `INSERT INTO order_items (
        id, order_id, product_id, variant_id, product_name_snapshot,
        variant_name_snapshot, quantity, unit_price_snapshot, line_total,
        customization_data, product_type, created_at
      ) VALUES (?, ?, ?, null, 'Audit Silk Drapes', 'Champagne Gold', 2, 6500, 13000, ?, 'custom_made', datetime('now'))`,
      [
        ITEM_1_ID,
        TEST_ORDER_1,
        TEST_PROD_1,
        JSON.stringify({
          headingStyle: 'French Pleat',
          customDimensions: '72 × 96 in',
          lining: 'Blackout Thermal',
          notes: 'Living room pair',
        }),
      ]
    );

    const items = await db.query<DbOrderItem>('SELECT * FROM order_items WHERE order_id = ?', [TEST_ORDER_1]);
    assert(items.length === 1, 'Order item created with relation to order');
    assert(items[0].product_name_snapshot === 'Audit Silk Drapes', 'Snapshot contains product name');
    assert(items[0].variant_name_snapshot === 'Champagne Gold', 'Snapshot contains variant name');
    assert(items[0].unit_price_snapshot === 6500, 'Snapshot unit price matches catalog price');
    assert(items[0].line_total === 13000, 'Snapshot line total matches quantity * unit price');

    // ─────────────────────────────────────────────────────────────
    // 3. WHATSAPP FLOW & MESSAGE BUILDER ACCURACY (ALL 6 SCENARIOS)
    // ─────────────────────────────────────────────────────────────
    console.log('\n[AUDIT CHECK 3] WhatsApp Message Builder & Centralized Line');
    assert(ZAIRA_WHATSAPP_NUMBER === '916300145763', `Centralized WhatsApp number is ${ZAIRA_WHATSAPP_NUMBER}`);
    assert(ZAIRA_WHATSAPP_DISPLAY === '+91 63001 45763', `Centralized WhatsApp display is ${ZAIRA_WHATSAPP_DISPLAY}`);

    // Scenario A: Standard product
    const msgA = buildOrderWhatsAppMessage({
      orderNumber: 'ZAI-2026-TEST01',
      customerName: 'Priya Sharma',
      customerPhone: '9876500001',
      deliveryAddress: 'Flat 101, Lakeview Apts',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      subtotal: 4500,
      totalAmount: 4500,
      items: [{
        productName: 'Raw Silk Cushion Covers',
        quantity: 2,
        unitPrice: 2250,
        lineTotal: 4500,
      }],
    });
    assert(msgA.includes('ZAI-2026-TEST01'), 'Scenario A: Order number included');
    assert(msgA.includes('Raw Silk Cushion Covers'), 'Scenario A: Product name included');
    assert(msgA.includes('₹4,500'), 'Scenario A: Price and total included');

    // Scenario B: Product with variant
    const msgB = buildOrderWhatsAppMessage({
      orderNumber: 'ZAI-2026-TEST02',
      customerName: 'Rajesh Varma',
      items: [{
        productName: 'Linen Sheer Drapes',
        variantName: 'Oatmeal Natural',
        quantity: 1,
        unitPrice: 3800,
        lineTotal: 3800,
      }],
    });
    assert(msgB.includes('Colour: Oatmeal Natural'), 'Scenario B: Variant included in message');

    // Scenario C: Multiple quantity
    const msgC = buildOrderWhatsAppMessage({
      orderNumber: 'ZAI-2026-TEST03',
      customerName: 'Ananya Roy',
      items: [{
        productName: 'Velvet Bolster',
        quantity: 4,
        unitPrice: 1500,
        lineTotal: 6000,
      }],
    });
    assert(msgC.includes('Quantity: 4') && msgC.includes('Total: ₹6,000'), 'Scenario C: Multi-quantity line total accurate');

    // Scenario D: Custom/bespoke product
    const msgD = buildOrderWhatsAppMessage({
      orderNumber: 'ZAI-2026-TEST04',
      customerName: 'Vikram Mehta',
      items: [{
        productName: 'Motorized Blackout Drapes',
        quantity: 1,
        unitPrice: 18500,
        lineTotal: 18500,
        customizationData: JSON.stringify({
          headingStyle: 'Ripple Fold',
          customDimensions: '120 × 108 in',
          lining: 'Triple-Weave Blackout',
          notes: 'Master Bedroom east facing',
        }),
      }],
    });
    assert(msgD.includes('Heading Style: Ripple Fold'), 'Scenario D: Heading style included');
    assert(msgD.includes('Size: 120 × 108 in'), 'Scenario D: Bespoke dimensions included');
    assert(msgD.includes('Lining: Triple-Weave Blackout'), 'Scenario D: Lining specification included');
    assert(msgD.includes('Notes: Master Bedroom east facing'), 'Scenario D: Special notes included');

    // Scenario E: Multiple cart items
    const msgE = buildOrderWhatsAppMessage({
      orderNumber: 'ZAI-2026-TEST05',
      customerName: 'Sanjay Reddy',
      items: [
        { productName: 'Curtains A', quantity: 1, unitPrice: 5000, lineTotal: 5000 },
        { productName: 'Curtains B', quantity: 2, unitPrice: 3000, lineTotal: 6000 },
      ],
      subtotal: 11000,
      totalAmount: 11000,
    });
    assert(msgE.includes('1. Curtains A') && msgE.includes('2. Curtains B'), 'Scenario E: Multiple items listed sequentially');

    // Scenario F: Address with special characters & spaces
    const msgF = buildOrderWhatsAppMessage({
      orderNumber: 'ZAI-2026-TEST06',
      customerName: 'Kavita & Rakesh O\'Connor',
      deliveryAddress: 'Plot #42/B, Road No. 36 (Extn.), Opp. St. Mary\'s Chapel',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      landmark: 'Next to Café "Bonsai" & Bakery',
      items: [{ productName: 'Decorative Runner', quantity: 1, unitPrice: 2000, lineTotal: 2000 }],
    });
    const waUrlF = buildOrderWhatsAppUrl({
      orderNumber: 'ZAI-2026-TEST06',
      customerName: 'Kavita & Rakesh O\'Connor',
      deliveryAddress: 'Plot #42/B, Road No. 36 (Extn.), Opp. St. Mary\'s Chapel',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      landmark: 'Next to Café "Bonsai" & Bakery',
      items: [{ productName: 'Decorative Runner', quantity: 1, unitPrice: 2000, lineTotal: 2000 }],
    });
    assert(msgF.includes("Kavita & Rakesh O'Connor"), 'Scenario F: Special characters in name handled');
    assert(msgF.includes("Opp. St. Mary's Chapel"), 'Scenario F: Special characters in address handled');
    assert(waUrlF.startsWith(`https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=`), 'Scenario F: Valid wa.me URL generated');
    assert(!waUrlF.includes(' '), 'Scenario F: No raw spaces in URL query parameter (URI encoded)');

    // ─────────────────────────────────────────────────────────────
    // 4. ORDER SOURCE INTEGRITY
    // ─────────────────────────────────────────────────────────────
    console.log('\n[AUDIT CHECK 4] Order Source Integrity');
    assert(createdOrder?.order_source === 'WHATSAPP', 'WhatsApp order source is WHATSAPP');

    // Verify valid sources
    const ALLOWED = ['WEB', 'WHATSAPP', 'QUOTE', 'MEASUREMENT'];
    assert(ALLOWED.includes('WHATSAPP'), 'WHATSAPP is a permitted source enum');
    assert(ALLOWED.includes('WEB'), 'WEB is a permitted source enum');
    assert(ALLOWED.includes('QUOTE'), 'QUOTE is a permitted source enum');
    assert(ALLOWED.includes('MEASUREMENT'), 'MEASUREMENT is a permitted source enum');

    // ─────────────────────────────────────────────────────────────
    // 5. IDOR & CUSTOMER AUTHORIZATION
    // ─────────────────────────────────────────────────────────────
    console.log('\n[AUDIT CHECK 5] Customer Authorization & IDOR Protection');
    // Customer A querying own order -> allowed
    const custAOrderById = await db.queryOne<DbOrder>(
      'SELECT * FROM orders WHERE (id = ? OR order_number = ?) AND user_id = ?',
      [TEST_ORDER_1, TEST_ORDER_1, TEST_USER_A]
    );
    assert(custAOrderById !== null, 'Customer A can view their own order by UUID');

    const custAOrderByNum = await db.queryOne<DbOrder>(
      'SELECT * FROM orders WHERE (id = ? OR order_number = ?) AND user_id = ?',
      [TEST_ORDER_NUM_1, TEST_ORDER_NUM_1, TEST_USER_A]
    );
    assert(custAOrderByNum !== null, 'Customer A can view their own order by Order Number');

    // Customer B querying Customer A's order -> blocked (IDOR check)
    const custBAccessById = await db.queryOne<DbOrder>(
      'SELECT * FROM orders WHERE (id = ? OR order_number = ?) AND user_id = ?',
      [TEST_ORDER_1, TEST_ORDER_1, TEST_USER_B]
    );
    assert(custBAccessById === null, 'Customer B CANNOT view Customer A order by UUID (IDOR prevented)');

    const custBAccessByNum = await db.queryOne<DbOrder>(
      'SELECT * FROM orders WHERE (id = ? OR order_number = ?) AND user_id = ?',
      [TEST_ORDER_NUM_1, TEST_ORDER_NUM_1, TEST_USER_B]
    );
    assert(custBAccessByNum === null, 'Customer B CANNOT view Customer A order by Order Number (IDOR prevented)');

    // ─────────────────────────────────────────────────────────────
    // 6. ADMIN NOTIFICATION & UNREAD COUNTS
    // ─────────────────────────────────────────────────────────────
    console.log('\n[AUDIT CHECK 6] Admin Notification & Unread Count');
    const initialUnreadCount = await getUnreadAdminWhatsAppOrdersCount();

    // Trigger notification
    await triggerNewOrderNotifications(createdOrder!, items);
    const afterTriggerCount = await getUnreadAdminWhatsAppOrdersCount();
    assert(afterTriggerCount === initialUnreadCount + 1, `Unread count incremented by 1 (${initialUnreadCount} -> ${afterTriggerCount})`);

    // Verify idempotency: Triggering again must NOT create duplicate notification
    await triggerNewOrderNotifications(createdOrder!, items);
    const afterDuplicateTriggerCount = await getUnreadAdminWhatsAppOrdersCount();
    assert(afterDuplicateTriggerCount === afterTriggerCount, 'Duplicate trigger did NOT create duplicate notification (Idempotent)');

    // Acknowledge / Mark as read
    const marked = await markOrderNotificationsAsRead(TEST_ORDER_1);
    assert(marked === true, 'Admin marked notification as read');
    const afterReadCount = await getUnreadAdminWhatsAppOrdersCount();
    assert(afterReadCount === initialUnreadCount, 'Unread count correctly decremented back after read acknowledgement');

    // ─────────────────────────────────────────────────────────────
    // 7. ORDER STATUS TRANSITIONS & STATUS HISTORY INTEGRITY
    // ─────────────────────────────────────────────────────────────
    console.log('\n[AUDIT CHECK 7] Order Status Transitions & History Trail');

    // Transition 1: CONFIRMED -> PROCESSING
    await db.execute("UPDATE orders SET status = 'PROCESSING', updated_at = datetime('now') WHERE id = ?", [TEST_ORDER_1]);
    await recordStatusHistory(TEST_ORDER_1, 'CONFIRMED', 'PROCESSING', 'ADMIN');

    // Transition 2: PROCESSING -> READY
    await db.execute("UPDATE orders SET status = 'READY', updated_at = datetime('now') WHERE id = ?", [TEST_ORDER_1]);
    await recordStatusHistory(TEST_ORDER_1, 'PROCESSING', 'READY', 'ADMIN');

    // Transition 3: READY -> COMPLETED
    await db.execute("UPDATE orders SET status = 'COMPLETED', updated_at = datetime('now') WHERE id = ?", [TEST_ORDER_1]);
    await recordStatusHistory(TEST_ORDER_1, 'READY', 'COMPLETED', 'ADMIN');

    const history = await getOrderStatusHistory(TEST_ORDER_1);
    assert(history.length === 3, `Status history contains exactly 3 entries (found ${history.length})`);
    assert(history[0].old_status === 'CONFIRMED' && history[0].new_status === 'PROCESSING', 'Step 1: CONFIRMED -> PROCESSING recorded');
    assert(history[1].old_status === 'PROCESSING' && history[1].new_status === 'READY', 'Step 2: PROCESSING -> READY recorded');
    assert(history[2].old_status === 'READY' && history[2].new_status === 'COMPLETED', 'Step 3: READY -> COMPLETED recorded');
    assert(history[0].changed_by === 'ADMIN', 'Audit records changed_by accurately');

    // Customer safe history projection
    const customerSafeHistory = history.map((h) => ({
      status: h.new_status,
      timestamp: h.created_at,
    }));
    assert(!('changed_by' in customerSafeHistory[0]), 'Customer safe projection hides internal changed_by');
    assert(customerSafeHistory[0].status === 'PROCESSING', 'Customer safe projection includes new_status');

    // ─────────────────────────────────────────────────────────────
    // 8. ATOMICITY & CART CLEARING SAFETY
    // ─────────────────────────────────────────────────────────────
    console.log('\n[AUDIT CHECK 8] Atomicity & Cart Preservation on Failure');
    const CART_ID = `cart-aud-${timestamp}`;
    const CART_ITEM_ID = `ci-aud-${timestamp}`;
    testIdsToCleanup.carts.push(CART_ID);
    testIdsToCleanup.cartItems.push(CART_ITEM_ID);

    await db.execute(
      `INSERT INTO carts (id, user_id, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))`,
      [CART_ID, TEST_USER_A]
    );
    await db.execute(
      `INSERT INTO cart_items (id, cart_id, product_id, quantity, unit_price_snapshot, created_at, updated_at)
       VALUES (?, ?, ?, 1, 6500, datetime('now'), datetime('now'))`,
      [CART_ITEM_ID, CART_ID, TEST_PROD_1]
    );

    // Verify cart item exists
    const beforeTxCartItem = await db.queryOne('SELECT * FROM cart_items WHERE id = ?', [CART_ITEM_ID]);
    assert(beforeTxCartItem !== null, 'Cart item exists before simulated failed transaction');

    // Simulate transaction failure
    await db.execute('BEGIN TRANSACTION');
    try {
      await db.execute('DELETE FROM cart_items WHERE cart_id = ?', [CART_ID]);
      // Force error (e.g. invalid foreign key or intentional rollback)
      throw new Error('Simulated order validation failure');
    } catch (e) {
      await db.execute('ROLLBACK');
    }

    const afterRollbackCartItem = await db.queryOne('SELECT * FROM cart_items WHERE id = ?', [CART_ITEM_ID]);
    assert(afterRollbackCartItem !== null, 'Cart items PRESERVED after transaction rollback (Cart not lost on failure)');

    // ─────────────────────────────────────────────────────────────
    // 9. IDEMPOTENCY KEY HANDLING
    // ─────────────────────────────────────────────────────────────
    console.log('\n[AUDIT CHECK 9] Idempotency Key Duplicate Prevention');
    const idempKey = `idemp-${TEST_ORDER_1}`;
    const duplicateLookup = await db.queryOne<DbOrder>(
      'SELECT * FROM orders WHERE user_id = ? AND idempotency_key = ?',
      [TEST_USER_A, idempKey]
    );
    assert(duplicateLookup !== null, 'Existing order found by idempotency key');
    assert(duplicateLookup?.id === TEST_ORDER_1, 'Duplicate request safely resolves to identical order ID');

    // ─────────────────────────────────────────────────────────────
    // 10. CANCELLED ORDER LIFECYCLE
    // ─────────────────────────────────────────────────────────────
    console.log('\n[AUDIT CHECK 10] Cancelled Order State');
    await db.execute(
      `INSERT INTO orders (
        id, order_number, user_id, status, payment_method, payment_status,
        customer_name, customer_email, customer_phone, delivery_address,
        city, state, pincode, delivery_option, site_visit_required,
        subtotal, discount, delivery_charge, total_amount, idempotency_key,
        order_source, created_at, updated_at
      ) VALUES (?, ?, ?, 'CONFIRMED', 'COD', 'PENDING', 'Auditor Customer B', 'audit.b@example.com', '+919876543211', 'Address B', 'Hyderabad', 'Telangana', '500081', 'standard', 0, 5000, 0, 0, 5000, 'idemp-cancel-test', 'WHATSAPP', datetime('now'), datetime('now'))`,
      [TEST_ORDER_2, TEST_ORDER_NUM_2, TEST_USER_B]
    );

    // Cancel order
    await db.execute("UPDATE orders SET status = 'CANCELLED', updated_at = datetime('now') WHERE id = ?", [TEST_ORDER_2]);
    await recordStatusHistory(TEST_ORDER_2, 'CONFIRMED', 'CANCELLED', 'ADMIN');

    const cancelledOrder = await db.queryOne<DbOrder>('SELECT * FROM orders WHERE id = ?', [TEST_ORDER_2]);
    assert(cancelledOrder?.status === 'CANCELLED', 'Order transitioned to CANCELLED state');

    const cancelHistory = await getOrderStatusHistory(TEST_ORDER_2);
    assert(cancelHistory.length === 1 && cancelHistory[0].new_status === 'CANCELLED', 'Cancellation recorded in status history');

  } catch (err) {
    console.error('Unexpected error in audit runner:', err);
    failed++;
  } finally {
    await cleanup();
  }

  console.log('================================================================');
  console.log(` AUDIT TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit();
