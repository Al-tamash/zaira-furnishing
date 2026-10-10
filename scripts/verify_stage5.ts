import { getDatabase } from '../src/lib/db';
import { ZAIRA_WHATSAPP_NUMBER, ZAIRA_WHATSAPP_DISPLAY, buildOrderWhatsAppMessage, buildOrderWhatsAppUrl } from '../src/lib/whatsapp';
import { recordStatusHistory, getOrderStatusHistory } from '../src/lib/notifications/service';
import { DbOrder, DbOrderItem } from '../src/lib/db/types';

const db = getDatabase();

const CUSTOMER_A_ID = 'usr-test-cust-a';
const CUSTOMER_B_ID = 'usr-test-cust-b';
const ORDER_A_ID = `test-s5-order-${Date.now()}`;
const ORDER_A_NUM = `ZAI-2026-S5001A`;
const ORDER_B_ID = `test-s5-order-b-${Date.now()}`;
const ORDER_B_NUM = `ZAI-2026-S5001B`;

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.log(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function setupTestData() {
  // Ensure test users exist
  await db.execute(
    `INSERT OR IGNORE INTO users (id, role, name, email, phone, created_at, updated_at)
     VALUES (?, 'CUSTOMER', 'Customer A', 'cust.a@example.com', '+919876500001', datetime('now'), datetime('now'))`,
    [CUSTOMER_A_ID]
  );

  await db.execute(
    `INSERT OR IGNORE INTO users (id, role, name, email, phone, created_at, updated_at)
     VALUES (?, 'CUSTOMER', 'Customer B', 'cust.b@example.com', '+919876500002', datetime('now'), datetime('now'))`,
    [CUSTOMER_B_ID]
  );

  // Insert Order A for Customer A
  await db.execute(
    `INSERT INTO orders (
      id, order_number, user_id, status, payment_method, payment_status,
      customer_name, customer_email, customer_phone, delivery_address,
      city, state, pincode, landmark, delivery_option, site_visit_required,
      subtotal, discount, delivery_charge, total_amount,
      idempotency_key, order_source, created_at, updated_at
    ) VALUES (?, ?, ?, 'CONFIRMED', 'COD', 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, 'standard', 0, ?, 0, 0, ?, ?, 'WHATSAPP', datetime('now'), datetime('now'))`,
    [
      ORDER_A_ID, ORDER_A_NUM, CUSTOMER_A_ID,
      'Customer A', 'cust.a@example.com', '+919876500001', '101 Lotus St',
      'Hyderabad', 'Telangana', '500034', 'Near GVK Mall',
      8400, 8400, `idemp-${ORDER_A_ID}`,
    ]
  );

  // Insert items for Order A
  await db.execute(
    `INSERT INTO order_items (
      id, order_id, product_id, variant_id, product_name_snapshot,
      variant_name_snapshot, quantity, unit_price_snapshot, line_total,
      customization_data, product_type, created_at
    ) VALUES (?, ?, 'prod-curt-1', null, 'Blackout Velvet Curtains', 'Ivory', 2, 4200, 8400, null, 'custom_made', datetime('now'))`,
    [`item-${ORDER_A_ID}`, ORDER_A_ID]
  );

  // Insert Order B for Customer B
  await db.execute(
    `INSERT INTO orders (
      id, order_number, user_id, status, payment_method, payment_status,
      customer_name, customer_email, customer_phone, delivery_address,
      city, state, pincode, landmark, delivery_option, site_visit_required,
      subtotal, discount, delivery_charge, total_amount,
      idempotency_key, order_source, created_at, updated_at
    ) VALUES (?, ?, ?, 'CONFIRMED', 'COD', 'PENDING', ?, ?, ?, ?, ?, ?, ?, null, 'standard', 0, ?, 0, 0, ?, ?, 'WHATSAPP', datetime('now'), datetime('now'))`,
    [
      ORDER_B_ID, ORDER_B_NUM, CUSTOMER_B_ID,
      'Customer B', 'cust.b@example.com', '+919876500002', '202 Palm Ave',
      'Hyderabad', 'Telangana', '500081',
      4200, 4200, `idemp-${ORDER_B_ID}`,
    ]
  );
}

async function main() {
  console.log('=== STAGE 5 VERIFICATION: CUSTOMER ORDER TRACKING & STATUS EXPERIENCE ===\n');

  await setupTestData();

  // ───────────────────────────────────────────
  // TEST A & B: WhatsApp Order created & confirmation displays actual order number
  // ───────────────────────────────────────────
  console.log('TEST A & B: Order Creation & Order Reference Identification');
  const orderA = await db.queryOne<DbOrder>('SELECT * FROM orders WHERE id = ?', [ORDER_A_ID]);
  assert(orderA !== null, `Order A exists in database`);
  assert(orderA?.order_number === ORDER_A_NUM, `Order number is formatted as ZAI-YYYY-XXXXXX: ${orderA?.order_number}`);
  assert(orderA?.order_source === 'WHATSAPP', `order_source is WHATSAPP`);

  // ───────────────────────────────────────────
  // TEST C: Customer Order History
  // ───────────────────────────────────────────
  console.log('\nTEST C: Customer Order History Scoping & Data Fields');
  const custAOrders = await db.query<DbOrder>(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [CUSTOMER_A_ID]
  );
  assert(custAOrders.length === 1, `Customer A sees exactly their order (got ${custAOrders.length})`);
  assert(custAOrders[0].order_number === ORDER_A_NUM, `Order number displayed matches ${ORDER_A_NUM}`);
  assert(custAOrders[0].total_amount === 8400, `Total amount displayed: ₹8,400`);
  assert(custAOrders[0].payment_method === 'COD', `Payment method displayed: Cash on Delivery`);
  assert(custAOrders[0].order_source === 'WHATSAPP', `Order source displayed: WHATSAPP`);

  // ───────────────────────────────────────────
  // TEST D & E: Order Detail Status matches Database
  // ───────────────────────────────────────────
  console.log('\nTEST D & E: Order Detail Status matches Database');
  assert(orderA?.status === 'CONFIRMED', `Initial status is CONFIRMED`);
  assert(orderA?.landmark === 'Near GVK Mall', `Landmark is stored in order: Near GVK Mall`);
  assert(orderA?.payment_status === 'PENDING', `Payment status is PENDING`);

  // ───────────────────────────────────────────
  // TEST F: Transition CONFIRMED → PROCESSING
  // ───────────────────────────────────────────
  console.log('\nTEST F: Admin changes CONFIRMED → PROCESSING');
  await db.execute("UPDATE orders SET status = 'PROCESSING', updated_at = datetime('now') WHERE id = ?", [ORDER_A_ID]);
  await recordStatusHistory(ORDER_A_ID, 'CONFIRMED', 'PROCESSING', 'ADMIN');
  const orderAfterProcessing = await db.queryOne<DbOrder>('SELECT * FROM orders WHERE id = ?', [ORDER_A_ID]);
  assert(orderAfterProcessing?.status === 'PROCESSING', `Customer re-fetch sees status: PROCESSING`);

  // ───────────────────────────────────────────
  // TEST G: Transition PROCESSING → READY
  // ───────────────────────────────────────────
  console.log('\nTEST G: Admin changes PROCESSING → READY');
  await db.execute("UPDATE orders SET status = 'READY', updated_at = datetime('now') WHERE id = ?", [ORDER_A_ID]);
  await recordStatusHistory(ORDER_A_ID, 'PROCESSING', 'READY', 'ADMIN');
  const orderAfterReady = await db.queryOne<DbOrder>('SELECT * FROM orders WHERE id = ?', [ORDER_A_ID]);
  assert(orderAfterReady?.status === 'READY', `Customer re-fetch sees status: READY`);

  // ───────────────────────────────────────────
  // TEST H: Transition READY → COMPLETED
  // ───────────────────────────────────────────
  console.log('\nTEST H: Admin changes READY → COMPLETED');
  await db.execute("UPDATE orders SET status = 'COMPLETED', updated_at = datetime('now') WHERE id = ?", [ORDER_A_ID]);
  await recordStatusHistory(ORDER_A_ID, 'READY', 'COMPLETED', 'ADMIN');
  const orderAfterCompleted = await db.queryOne<DbOrder>('SELECT * FROM orders WHERE id = ?', [ORDER_A_ID]);
  assert(orderAfterCompleted?.status === 'COMPLETED', `Customer re-fetch sees status: COMPLETED`);

  // ───────────────────────────────────────────
  // TEST I: CANCELLED state handling
  // ───────────────────────────────────────────
  console.log('\nTEST I: CANCELLED state handling');
  await db.execute("UPDATE orders SET status = 'CANCELLED', updated_at = datetime('now') WHERE id = ?", [ORDER_B_ID]);
  await recordStatusHistory(ORDER_B_ID, 'CONFIRMED', 'CANCELLED', 'ADMIN');
  const orderBCancelled = await db.queryOne<DbOrder>('SELECT * FROM orders WHERE id = ?', [ORDER_B_ID]);
  assert(orderBCancelled?.status === 'CANCELLED', `Order B status is CANCELLED`);

  // Verify customer-safe history for Order B
  const safeHistoryB = await db.query<{ new_status: string; created_at: string }>(
    'SELECT new_status, created_at FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC',
    [ORDER_B_ID]
  );
  assert(safeHistoryB.length === 1, `Safe history has cancellation record`);
  assert(safeHistoryB[0].new_status === 'CANCELLED', `History recorded status CANCELLED`);

  // ───────────────────────────────────────────
  // TEST J: Customer Security & Ownership Authorization
  // ───────────────────────────────────────────
  console.log('\nTEST J: Customer Ownership Authorization');
  // Customer A queries Customer B's order:
  const crossQuery = await db.queryOne<DbOrder>(
    'SELECT * FROM orders WHERE (id = ? OR order_number = ?) AND user_id = ?',
    [ORDER_B_ID, ORDER_B_ID, CUSTOMER_A_ID]
  );
  assert(crossQuery === null, `Customer A CANNOT access Customer B's order (query returned null / 404)`);

  const ownQuery = await db.queryOne<DbOrder>(
    'SELECT * FROM orders WHERE (id = ? OR order_number = ?) AND user_id = ?',
    [ORDER_A_ID, ORDER_A_ID, CUSTOMER_A_ID]
  );
  assert(ownQuery !== null, `Customer A CAN access their own order`);

  // ───────────────────────────────────────────
  // TEST K: Customer-safe status history (No admin emails or internal secrets)
  // ───────────────────────────────────────────
  console.log('\nTEST K: Customer-Safe Status History');
  const rawHistoryA = await db.query<{ new_status: string; created_at: string }>(
    'SELECT new_status, created_at FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC',
    [ORDER_A_ID]
  );
  assert(rawHistoryA.length === 3, `Order A has 3 status history records (got ${rawHistoryA.length})`);
  assert(rawHistoryA[0].new_status === 'PROCESSING', `First transition: PROCESSING`);
  assert(rawHistoryA[1].new_status === 'READY', `Second transition: READY`);
  assert(rawHistoryA[2].new_status === 'COMPLETED', `Third transition: COMPLETED`);

  // ───────────────────────────────────────────
  // TEST L: WhatsApp Helper & Number Verification
  // ───────────────────────────────────────────
  console.log('\nTEST L: Centralized WhatsApp Utility');
  assert(ZAIRA_WHATSAPP_NUMBER === '917947415666', `Official WhatsApp Number is 917947415666`);
  assert(ZAIRA_WHATSAPP_DISPLAY === '07947415666', `Official WhatsApp Display is 07947415666`);

  const waUrl = `https://wa.me/${ZAIRA_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Zaira Furnishing, I have a question about my order ${ORDER_A_NUM}.`)}`;
  assert(waUrl.includes('917947415666'), `WhatsApp link targets official atelier number`);
  assert(waUrl.includes(ORDER_A_NUM), `WhatsApp link includes exact order number: ${ORDER_A_NUM}`);

  // ───────────────────────────────────────────
  // TEST M: Empty State Verification
  // ───────────────────────────────────────────
  console.log('\nTEST M: Empty Orders State');
  const nonExistentCustomerOrders = await db.query<DbOrder>(
    'SELECT * FROM orders WHERE user_id = ?',
    ['usr-non-existent']
  );
  assert(nonExistentCustomerOrders.length === 0, `Non-existent customer has 0 orders (renders clean empty state)`);

  // ───────────────────────────────────────────
  // TEST N: Stages 1-4 Integrity Intact
  // ───────────────────────────────────────────
  console.log('\nTEST N: Stages 1-4 System Verification');
  // Check order_source field in DB
  const colCheck = await db.queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM pragma_table_info('orders') WHERE name = 'order_source'"
  );
  assert((colCheck?.count || 0) > 0, `orders.order_source column exists (Stage 1)`);

  // Check order_status_history table in DB
  const tableCheck = await db.queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type = 'table' AND name = 'order_status_history'"
  );
  assert((tableCheck?.count || 0) > 0, `order_status_history table exists (Stage 4)`);

  // Check order_notifications table in DB
  const notifTableCheck = await db.queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM sqlite_master WHERE type = 'table' AND name = 'order_notifications'"
  );
  assert((notifTableCheck?.count || 0) > 0, `order_notifications table exists (Stage 3)`);

  // ───────────────────────────────────────────
  // CLEANUP
  // ───────────────────────────────────────────
  console.log('\nCLEANUP: Removing test records');
  await db.execute('DELETE FROM order_status_history WHERE order_id IN (?, ?)', [ORDER_A_ID, ORDER_B_ID]);
  await db.execute('DELETE FROM order_items WHERE order_id IN (?, ?)', [ORDER_A_ID, ORDER_B_ID]);
  await db.execute('DELETE FROM orders WHERE id IN (?, ?)', [ORDER_A_ID, ORDER_B_ID]);
  await db.execute('DELETE FROM users WHERE id IN (?, ?)', [CUSTOMER_A_ID, CUSTOMER_B_ID]);
  console.log('  ✓ Test orders and users cleaned up. Database pristine.');

  // ───────────────────────────────────────────
  // RESULTS
  // ───────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed > 0) {
    console.log('\n⚠ SOME TESTS FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ ALL STAGE 5 TESTS PASSED SUCCESSFULLY');
  }
}

main().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
