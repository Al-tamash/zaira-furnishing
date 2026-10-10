// src/lib/notifications/service.ts

import crypto from 'crypto';
import { getDatabase } from '@/lib/db';
import {
  DbOrder,
  DbOrderNotification,
  DbOrderStatusHistory,
  DbMeasurementRequest,
  DbQuoteRequest,
  DbAdminNotification,
  NotificationEventType,
  NotificationRecipientType,
} from '@/lib/db/types';
import { getNotificationProvider, DefaultNotificationProvider } from './provider';
import {
  generateCustomerOrderConfirmationEmail,
  generateAdminNewOrderEmail,
  generateCustomerStatusUpdateEmail,
  generateAdminMeasurementRequestEmail,
  generateAdminQuoteRequestEmail,
} from './templates';

interface SendNotificationParams {
  orderId: string;
  customerId?: string | null;
  recipientType: NotificationRecipientType;
  eventType: NotificationEventType;
  recipientEmail: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  payloadSummary: Record<string, unknown>;
}

/**
 * Core notification dispatch and recording mechanism.
 * Idempotent, safe against duplicate sends, and logs every attempt to D1.
 */
export async function recordAndSendNotification(
  params: SendNotificationParams
): Promise<{ notification: DbOrderNotification; sent: boolean }> {
  const db = getDatabase();
  const provider = getNotificationProvider();

  // 1. Check idempotency: Has this exact event already been recorded?
  const existing = await db.queryOne<DbOrderNotification>(
    'SELECT * FROM order_notifications WHERE idempotency_key = ?',
    [params.idempotencyKey]
  );

  if (existing) {
    // If already successfully sent, never send duplicate!
    if (existing.status === 'SENT') {
      return { notification: existing, sent: true };
    }
  }

  const notificationId = existing ? existing.id : `notif-${crypto.randomUUID()}`;
  const payloadSummaryJson = JSON.stringify(params.payloadSummary);

  // 2. Insert or ensure record exists with PENDING state
  if (!existing) {
    await db.execute(
      `INSERT INTO order_notifications (
        id, order_id, customer_id, recipient_type, event_type,
        recipient_email, subject, status, provider, payload_summary,
        idempotency_key, attempts, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, 0, datetime('now'), datetime('now'))`,
      [
        notificationId,
        params.orderId,
        params.customerId || null,
        params.recipientType,
        params.eventType,
        params.recipientEmail,
        params.subject,
        provider.name,
        payloadSummaryJson,
        params.idempotencyKey,
      ]
    );
  }

  // 3. Dispatch to delivery provider
  try {
    const res = await provider.send({
      to: params.recipientEmail,
      subject: params.subject,
      html: params.html,
      text: params.text,
      metadata: { orderId: params.orderId, notificationId },
    });

    if (res.success) {
      await db.execute(
        `UPDATE order_notifications SET
          status = 'SENT',
          sent_at = datetime('now'),
          provider = ?,
          provider_message_id = ?,
          error_message = NULL,
          attempts = attempts + 1,
          updated_at = datetime('now')
         WHERE id = ?`,
        [res.provider, res.messageId || null, notificationId]
      );
    } else {
      await db.execute(
        `UPDATE order_notifications SET
          status = 'FAILED',
          provider = ?,
          error_message = ?,
          attempts = attempts + 1,
          updated_at = datetime('now')
         WHERE id = ?`,
        [res.provider, res.error || 'Unknown delivery failure', notificationId]
      );
    }

    const updated = await db.queryOne<DbOrderNotification>(
      'SELECT * FROM order_notifications WHERE id = ?',
      [notificationId]
    );

    return {
      notification: updated || existing!,
      sent: res.success,
    };
  } catch (err: any) {
    // Failure must be captured cleanly without throwing
    const errorMsg = err.message || 'Fatal error during notification delivery';
    await db.execute(
      `UPDATE order_notifications SET
        status = 'FAILED',
        error_message = ?,
        attempts = attempts + 1,
        updated_at = datetime('now')
       WHERE id = ?`,
      [errorMsg, notificationId]
    );

    const updated = await db.queryOne<DbOrderNotification>(
      'SELECT * FROM order_notifications WHERE id = ?',
      [notificationId]
    );

    return {
      notification: updated || existing!,
      sent: false,
    };
  }
}

/**
 * Triggers all notifications for a newly placed and committed order:
 * 1. Customer confirmation notification
 * 2. Admin alert notification
 */
export async function triggerNewOrderNotifications(
  order: DbOrder,
  items: any[]
): Promise<{ customerNotification: DbOrderNotification; adminNotification: DbOrderNotification }> {
  const db = getDatabase();
  const defaultProvider = new DefaultNotificationProvider();
  const adminEmail = defaultProvider.getAdminEmail();

  // 1. Customer Order Confirmation
  const customerContent = generateCustomerOrderConfirmationEmail(order, items);
  const custResult = await recordAndSendNotification({
    orderId: order.id,
    customerId: order.user_id,
    recipientType: 'CUSTOMER',
    eventType: 'NEW_ORDER_CUSTOMER',
    recipientEmail: order.customer_email,
    subject: customerContent.subject,
    html: customerContent.html,
    text: customerContent.text,
    idempotencyKey: `order_${order.id}_new_order_customer`,
    payloadSummary: {
      orderNumber: order.order_number,
      totalAmount: order.total_amount,
      itemCount: items.length,
      customerName: order.customer_name,
    },
  });

  // 2. Admin New Order Alert
  const adminContent = generateAdminNewOrderEmail(order, items);
  const adminResult = await recordAndSendNotification({
    orderId: order.id,
    customerId: order.user_id,
    recipientType: 'ADMIN',
    eventType: 'NEW_ORDER_ADMIN',
    recipientEmail: adminEmail,
    subject: adminContent.subject,
    html: adminContent.html,
    text: adminContent.text,
    idempotencyKey: `order_${order.id}_new_order_admin`,
    payloadSummary: {
      orderNumber: order.order_number,
      orderSource: order.order_source || 'WEB',
      customerName: order.customer_name,
      totalAmount: order.total_amount,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
    },
  });

  // 3. Record in Unified Admin Notifications Table
  try {
    const isWhatsApp = order.order_source === 'WHATSAPP';
    const notifTitle = isWhatsApp
      ? `New WhatsApp Order #${order.order_number}`
      : `New Web Order #${order.order_number}`;
    const notifMsg = `Order placed by ${order.customer_name} for ₹${Number(order.total_amount).toLocaleString('en-IN')} (${items.length} item${items.length === 1 ? '' : 's'})`;

    await db.execute(
      `INSERT OR REPLACE INTO admin_notifications (
        id, type, reference_id, reference_number, title, message,
        customer_name, customer_phone, customer_email, amount,
        action_url, is_read, created_at
      ) VALUES (?, 'ORDER', ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
      [
        `notif-order-${order.id}`,
        order.id,
        order.order_number,
        notifTitle,
        notifMsg,
        order.customer_name,
        order.customer_phone,
        order.customer_email || null,
        order.total_amount,
        `/admin/orders/${order.id}`,
      ]
    );
  } catch (adminNotifErr) {
    console.error('Error logging to admin_notifications:', adminNotifErr);
  }

  return {
    customerNotification: custResult.notification,
    adminNotification: adminResult.notification,
  };
}

/**
 * Triggers all notifications for a newly booked measurement or consultation request:
 * 1. Inserts into admin_notifications for instant admin bell & phone alert
 * 2. Sends email alert to admin concierge
 */
export async function triggerNewMeasurementNotification(
  request: DbMeasurementRequest
): Promise<{ success: boolean; notificationId: string }> {
  const db = getDatabase();
  const defaultProvider = new DefaultNotificationProvider();
  const adminEmail = defaultProvider.getAdminEmail();

  const isConsultation =
    request.product_name_snapshot?.toLowerCase().includes('consultation') ||
    request.category_slug_snapshot === 'services';
  const notifType = isConsultation ? 'CONSULTATION' : 'MEASUREMENT';
  const label = isConsultation ? 'Consultation Request' : 'In-Home Measurement';
  const notifTitle = `New ${label} #${request.request_number}`;
  const notifMsg = `${request.customer_name} requested ${request.product_name_snapshot || 'In-Home Visit'} for ${request.preferred_date} (${request.preferred_time_slot})`;
  const notificationId = `notif-meas-${request.id}`;

  // 1. Record into admin_notifications
  try {
    await db.execute(
      `INSERT OR REPLACE INTO admin_notifications (
        id, type, reference_id, reference_number, title, message,
        customer_name, customer_phone, customer_email, amount,
        action_url, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
      [
        notificationId,
        notifType,
        request.id,
        request.request_number,
        notifTitle,
        notifMsg,
        request.customer_name,
        request.customer_phone,
        request.customer_email || null,
        null,
        '/admin/measurement-requests',
      ]
    );
  } catch (err) {
    console.error('Error recording measurement admin notification:', err);
  }

  // 2. Dispatch email to admin
  try {
    const emailContent = generateAdminMeasurementRequestEmail(request);
    await defaultProvider.send({
      to: adminEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      metadata: { measurementId: request.id },
    });
  } catch (emailErr) {
    console.error('Error sending measurement admin alert email:', emailErr);
  }

  return { success: true, notificationId };
}

/**
 * Triggers all notifications for a newly submitted quote request:
 * 1. Inserts into admin_notifications
 * 2. Sends email alert to admin concierge
 */
export async function triggerNewQuoteNotification(
  request: DbQuoteRequest
): Promise<{ success: boolean; notificationId: string }> {
  const db = getDatabase();
  const defaultProvider = new DefaultNotificationProvider();
  const adminEmail = defaultProvider.getAdminEmail();

  const notifTitle = `New Custom Quote Request #${request.request_number}`;
  const notifMsg = `${request.customer_name} requested a bespoke quote for ${request.product_name_snapshot} (Qty: ${request.quantity})`;
  const notificationId = `notif-quote-${request.id}`;

  // 1. Record into admin_notifications
  try {
    await db.execute(
      `INSERT OR REPLACE INTO admin_notifications (
        id, type, reference_id, reference_number, title, message,
        customer_name, customer_phone, customer_email, amount,
        action_url, is_read, created_at
      ) VALUES (?, 'QUOTE', ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
      [
        notificationId,
        request.id,
        request.request_number,
        notifTitle,
        notifMsg,
        request.customer_name,
        request.customer_phone,
        request.customer_email || null,
        null,
        '/admin/quote-requests',
      ]
    );
  } catch (err) {
    console.error('Error recording quote admin notification:', err);
  }

  // 2. Dispatch email to admin
  try {
    const emailContent = generateAdminQuoteRequestEmail(request);
    await defaultProvider.send({
      to: adminEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      metadata: { quoteId: request.id },
    });
  } catch (emailErr) {
    console.error('Error sending quote admin alert email:', emailErr);
  }

  return { success: true, notificationId };
}

/**
 * Triggers customer notification when an order status is updated by admin.
 * Only sends if status actually changed.
 */
export async function triggerOrderStatusUpdateNotification(
  order: DbOrder,
  previousStatus: string,
  newStatus: string
): Promise<DbOrderNotification | null> {
  if (previousStatus === newStatus) {
    return null; // No status change, do not send
  }

  const content = generateCustomerStatusUpdateEmail(order, previousStatus, newStatus);
  const result = await recordAndSendNotification({
    orderId: order.id,
    customerId: order.user_id,
    recipientType: 'CUSTOMER',
    eventType: 'ORDER_STATUS_UPDATED_CUSTOMER',
    recipientEmail: order.customer_email,
    subject: content.subject,
    html: content.html,
    text: content.text,
    idempotencyKey: `order_${order.id}_status_${newStatus}_customer`,
    payloadSummary: {
      orderNumber: order.order_number,
      previousStatus,
      newStatus,
    },
  });

  return result.notification;
}

/**
 * Retrieve notifications for an order (used by Admin Order Detail page)
 */
export async function getOrderNotifications(orderId: string): Promise<DbOrderNotification[]> {
  const db = getDatabase();
  return db.query<DbOrderNotification>(
    `SELECT * FROM order_notifications WHERE order_id = ? ORDER BY created_at DESC`,
    [orderId]
  );
}

/**
 * Record a status change in the order_status_history audit trail.
 */
export async function recordStatusHistory(
  orderId: string,
  oldStatus: string,
  newStatus: string,
  changedBy: string = 'ADMIN'
): Promise<DbOrderStatusHistory> {
  const db = getDatabase();
  const historyId = `osh-${crypto.randomUUID()}`;

  await db.execute(
    `INSERT INTO order_status_history (id, order_id, old_status, new_status, changed_by, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [historyId, orderId, oldStatus, newStatus, changedBy]
  );

  const record = await db.queryOne<DbOrderStatusHistory>(
    'SELECT * FROM order_status_history WHERE id = ?',
    [historyId]
  );

  return record!;
}

/**
 * Retrieve status change history for an order.
 */
export async function getOrderStatusHistory(orderId: string): Promise<DbOrderStatusHistory[]> {
  const db = getDatabase();
  return db.query<DbOrderStatusHistory>(
    `SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC`,
    [orderId]
  );
}

/**
 * Safely retry a FAILED notification.
 * Idempotent: If the notification is already SENT, returns without re-sending.
 */
export async function retryNotification(
  notificationId: string,
  options?: { mockSuccess?: boolean }
): Promise<{ success: boolean; notification: DbOrderNotification; message?: string }> {
  const db = getDatabase();
  const provider = getNotificationProvider();

  const notification = await db.queryOne<DbOrderNotification>(
    'SELECT * FROM order_notifications WHERE id = ?',
    [notificationId]
  );

  if (!notification) {
    throw new Error('Notification record not found');
  }

  if (notification.status === 'SENT') {
    return {
      success: true,
      notification,
      message: 'Notification was already successfully delivered.',
    };
  }

  // Retrieve associated order to rebuild email
  const order = await db.queryOne<DbOrder>(
    'SELECT * FROM orders WHERE id = ?',
    [notification.order_id]
  );

  if (!order) {
    throw new Error('Associated order not found');
  }

  // Fetch items
  const items = await db.query<any>(
    'SELECT * FROM order_items WHERE order_id = ?',
    [order.id]
  );

  let content: { subject: string; html: string; text: string };
  if (notification.event_type === 'NEW_ORDER_CUSTOMER') {
    content = generateCustomerOrderConfirmationEmail(order, items);
  } else if (notification.event_type === 'NEW_ORDER_ADMIN') {
    content = generateAdminNewOrderEmail(order, items);
  } else {
    // STATUS_UPDATED
    let prev = 'CONFIRMED';
    let next = order.status;
    if (notification.payload_summary) {
      try {
        const parsed = JSON.parse(notification.payload_summary);
        if (parsed.previousStatus) prev = parsed.previousStatus;
        if (parsed.newStatus) next = parsed.newStatus;
      } catch {
        // fallback
      }
    }
    content = generateCustomerStatusUpdateEmail(order, prev, next);
  }

  const res = await provider.send({
    to: notification.recipient_email,
    subject: content.subject,
    html: content.html,
    text: content.text,
    metadata: { orderId: order.id, notificationId, mockSuccess: options?.mockSuccess },
  });

  if (res.success) {
    await db.execute(
      `UPDATE order_notifications SET
        status = 'SENT',
        sent_at = datetime('now'),
        provider = ?,
        provider_message_id = ?,
        error_message = NULL,
        attempts = attempts + 1,
        updated_at = datetime('now')
       WHERE id = ?`,
      [res.provider, res.messageId || null, notificationId]
    );
  } else {
    await db.execute(
      `UPDATE order_notifications SET
        status = 'FAILED',
        provider = ?,
        error_message = ?,
        attempts = attempts + 1,
        updated_at = datetime('now')
       WHERE id = ?`,
      [res.provider, res.error || 'Retry failed', notificationId]
    );
  }

  const updated = await db.queryOne<DbOrderNotification>(
    'SELECT * FROM order_notifications WHERE id = ?',
    [notificationId]
  );

  return {
    success: res.success,
    notification: updated!,
    message: res.success ? 'Notification delivered successfully.' : res.error,
  };
}

/**
 * Count all unread admin notifications across Orders, Measurements, and Quotes.
 */
export async function getUnreadAdminNotificationsCount(): Promise<{
  total: number;
  orders: number;
  measurements: number;
  quotes: number;
}> {
  const db = getDatabase();
  try {
    const rows = await db.query<{ type: string; count: number }>(`
      SELECT type, COUNT(*) as count
      FROM admin_notifications
      WHERE is_read = 0 OR is_read IS NULL
      GROUP BY type
    `);

    let orders = 0;
    let measurements = 0;
    let quotes = 0;

    for (const r of rows) {
      if (r.type === 'ORDER') orders += r.count;
      else if (r.type === 'MEASUREMENT' || r.type === 'CONSULTATION') measurements += r.count;
      else if (r.type === 'QUOTE') quotes += r.count;
    }

    return {
      total: orders + measurements + quotes,
      orders,
      measurements,
      quotes,
    };
  } catch {
    return { total: 0, orders: 0, measurements: 0, quotes: 0 };
  }
}

/**
 * Backward compatibility: count unread admin notifications.
 */
export async function getUnreadAdminWhatsAppOrdersCount(): Promise<number> {
  const counts = await getUnreadAdminNotificationsCount();
  return counts.total;
}

/**
 * Retrieve unified admin notifications with action URLs, phone dialers, and WhatsApp links.
 */
export async function getUnifiedAdminNotifications(options?: {
  unreadOnly?: boolean;
  type?: string;
  limit?: number;
}): Promise<any[]> {
  const db = getDatabase();
  const limit = options?.limit || 25;
  const whereClauses: string[] = ['1=1'];
  const params: unknown[] = [];

  if (options?.unreadOnly) {
    whereClauses.push('(is_read = 0 OR is_read IS NULL)');
  }

  if (options?.type && options.type !== 'ALL') {
    if (options.type === 'MEASUREMENT') {
      whereClauses.push("(type = 'MEASUREMENT' OR type = 'CONSULTATION')");
    } else {
      whereClauses.push('type = ?');
      params.push(options.type);
    }
  }

  params.push(limit);

  try {
    const notifications = await db.query<DbAdminNotification>(
      `SELECT * FROM admin_notifications
       WHERE ${whereClauses.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT ?`,
      params
    );

    return notifications.map((n) => {
      const cleanPhone = (n.customer_phone || '').replace(/\D/g, '');
      const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      return {
        ...n,
        phone_call_url: n.customer_phone ? `tel:${n.customer_phone}` : null,
        whatsapp_url: cleanPhone ? `https://wa.me/${waNumber}` : null,
      };
    });
  } catch (err) {
    console.error('Error fetching unified notifications:', err);
    return [];
  }
}

/**
 * Backward-compatible helper for existing order notification list callers.
 */
export async function getAdminOrderNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<any[]> {
  const notifications = await getUnifiedAdminNotifications(options);
  // Map back to shape expected by existing layout
  return notifications.map((n) => ({
    id: n.id,
    order_id: n.reference_id,
    order_number: n.reference_number,
    subject: n.title,
    message: n.message,
    status: 'SENT',
    is_read: n.is_read,
    read_at: n.read_at,
    created_at: n.created_at,
    customer_name: n.customer_name,
    customer_phone: n.customer_phone,
    total_amount: n.amount || 0,
    order_source: n.type,
    action_url: n.action_url,
    phone_call_url: n.phone_call_url,
    whatsapp_url: n.whatsapp_url,
  }));
}

/**
 * Mark a specific notification as read.
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const db = getDatabase();
  let modified = false;

  try {
    const res1 = await db.execute(
      "UPDATE admin_notifications SET is_read = 1, read_at = datetime('now') WHERE id = ?",
      [notificationId]
    );
    if (res1.changes > 0) modified = true;
  } catch {}

  try {
    const res2 = await db.execute(
      "UPDATE order_notifications SET is_read = 1, read_at = datetime('now'), updated_at = datetime('now') WHERE id = ?",
      [notificationId]
    );
    if (res2.changes > 0) modified = true;
  } catch {}

  return modified;
}

/**
 * Mark all unread admin notifications for a specific order as read.
 */
export async function markOrderNotificationsAsRead(orderIdentifier: string): Promise<boolean> {
  const db = getDatabase();
  try {
    await db.execute(
      `UPDATE admin_notifications
       SET is_read = 1, read_at = datetime('now')
       WHERE reference_id = ? OR reference_number = ?`,
      [orderIdentifier, orderIdentifier]
    );
  } catch {}

  try {
    await db.execute(
      `UPDATE order_notifications
       SET is_read = 1, read_at = datetime('now'), updated_at = datetime('now')
       WHERE recipient_type = 'ADMIN'
         AND (is_read = 0 OR is_read IS NULL)
         AND (
           order_id = ? OR
           order_id = (SELECT id FROM orders WHERE order_number = ?)
         )`,
      [orderIdentifier, orderIdentifier]
    );
  } catch {}

  return true;
}

/**
 * Mark all unread admin notifications as read.
 */
export async function markAllAdminNotificationsAsRead(): Promise<boolean> {
  const db = getDatabase();
  try {
    await db.execute(
      "UPDATE admin_notifications SET is_read = 1, read_at = datetime('now') WHERE is_read = 0 OR is_read IS NULL"
    );
  } catch {}

  try {
    await db.execute(
      `UPDATE order_notifications
       SET is_read = 1, read_at = datetime('now'), updated_at = datetime('now')
       WHERE recipient_type = 'ADMIN'
         AND (is_read = 0 OR is_read IS NULL)`
    );
  } catch {}

  return true;
}

