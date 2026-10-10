import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getDatabase } from '@/lib/db';
import { DbOrder, DbOrderItem } from '@/lib/db/types';
import {
  triggerOrderStatusUpdateNotification,
  getOrderNotifications,
  recordStatusHistory,
  getOrderStatusHistory,
} from '@/lib/notifications/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const ALLOWED_ORDER_STATUSES = ['CONFIRMED', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'] as const;
type AllowedOrderStatus = (typeof ALLOWED_ORDER_STATUSES)[number];

const ALLOWED_PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const;
type AllowedPaymentStatus = (typeof ALLOWED_PAYMENT_STATUSES)[number];

const VALID_TRANSITIONS: Record<string, AllowedOrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['READY', 'CONFIRMED', 'CANCELLED'],
  READY: ['COMPLETED', 'PROCESSING', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

// ─── GET /api/admin/orders/[id] (View single order with historical snapshots) ───
export async function GET(req: NextRequest, context: RouteContext) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Order identifier is required' }, { status: 400 });
  }

  try {
    const db = getDatabase();

    // Query order from D1 by primary ID or order_number
    const order = await db.queryOne<DbOrder>(
      'SELECT * FROM orders WHERE id = ? OR order_number = ?',
      [id, id]
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Automatically acknowledge / mark unread admin notifications as read for this order
    await db.execute(
      `UPDATE order_notifications
       SET is_read = 1, read_at = datetime('now'), updated_at = datetime('now')
       WHERE order_id = ? AND recipient_type = 'ADMIN' AND (is_read = 0 OR is_read IS NULL)`,
      [order.id]
    );

    // Query order items using historical snapshots (never overwrite with current catalog prices)
    const items = await db.query<
      DbOrderItem & {
        product_image: string | null;
        product_slug: string | null;
      }
    >(
      `SELECT
        oi.*,
        (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND active = 1 ORDER BY is_main DESC, display_order ASC LIMIT 1) as product_image,
        p.slug as product_slug
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?
       ORDER BY oi.created_at ASC`,
      [order.id]
    );

    // Query notifications history and status history for this order
    const [notifications, statusHistory] = await Promise.all([
      getOrderNotifications(order.id),
      getOrderStatusHistory(order.id),
    ]);

    return NextResponse.json({
      order: {
        ...order,
        items,
        notifications,
        statusHistory,
      },
    });
  } catch (error) {
    console.error('Error fetching admin order details:', error);
    return NextResponse.json({ error: 'Failed to retrieve order details' }, { status: 500 });
  }
}

// ─── PATCH /api/admin/orders/[id] (Update status, payment status, or notes) ───
export async function PATCH(req: NextRequest, context: RouteContext) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Order identifier is required' }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { status, paymentStatus, notes } = body;

    const db = getDatabase();

    // Verify order exists
    const existingOrder = await db.queryOne<DbOrder>(
      'SELECT * FROM orders WHERE id = ? OR order_number = ?',
      [id, id]
    );

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 1. Validate status transition if provided
    let newStatus: AllowedOrderStatus | null = null;
    if (status !== undefined) {
      if (typeof status !== 'string') {
        return NextResponse.json({ error: 'Status must be a valid string' }, { status: 400 });
      }
      const upperStatus = status.trim().toUpperCase() as AllowedOrderStatus;
      if (!ALLOWED_ORDER_STATUSES.includes(upperStatus)) {
        return NextResponse.json(
          {
            error: `Invalid status "${status}". Allowed values: ${ALLOWED_ORDER_STATUSES.join(', ')}`,
          },
          { status: 400 }
        );
      }

      // Check transition graph
      if (upperStatus !== existingOrder.status) {
        const allowedNext = VALID_TRANSITIONS[existingOrder.status] || [];
        if (!allowedNext.includes(upperStatus)) {
          return NextResponse.json(
            {
              error: `Invalid status transition from "${existingOrder.status}" to "${upperStatus}". Allowed transitions: ${
                allowedNext.length > 0 ? allowedNext.join(', ') : 'None (order is in terminal status)'
              }`,
            },
            { status: 400 }
          );
        }
      }
      newStatus = upperStatus;
    }

    // 2. Validate payment status if provided
    let newPaymentStatus: AllowedPaymentStatus | null = null;
    if (paymentStatus !== undefined) {
      if (typeof paymentStatus !== 'string') {
        return NextResponse.json({ error: 'Payment status must be a valid string' }, { status: 400 });
      }
      const upperPayStatus = paymentStatus.trim().toUpperCase() as AllowedPaymentStatus;
      if (!ALLOWED_PAYMENT_STATUSES.includes(upperPayStatus)) {
        return NextResponse.json(
          {
            error: `Invalid payment status "${paymentStatus}". Allowed values: ${ALLOWED_PAYMENT_STATUSES.join(', ')}`,
          },
          { status: 400 }
        );
      }
      newPaymentStatus = upperPayStatus;
    }

    // 3. Update in D1
    await db.execute(
      `UPDATE orders SET
        status = COALESCE(?, status),
        payment_status = COALESCE(?, payment_status),
        notes = COALESCE(?, notes),
        updated_at = datetime('now')
       WHERE id = ?`,
      [
        newStatus,
        newPaymentStatus,
        notes !== undefined ? (typeof notes === 'string' ? notes.trim() : null) : null,
        existingOrder.id,
      ]
    );

    // 4. Return freshly updated order record
    const updatedOrder = await db.queryOne<DbOrder>(
      'SELECT * FROM orders WHERE id = ?',
      [existingOrder.id]
    );

    const statusActuallyChanged = !!(newStatus && newStatus !== existingOrder.status);
    let notificationCreated = false;
    let notificationError: string | null = null;

    // 5. Record status history & trigger customer notification ONLY if status actually changed
    if (updatedOrder && statusActuallyChanged && newStatus) {
      // Record audit trail
      try {
        await recordStatusHistory(existingOrder.id, existingOrder.status, newStatus, 'ADMIN');
      } catch (historyErr) {
        console.error('Non-blocking status history error:', historyErr);
      }

      // Trigger customer notification
      try {
        const notifResult = await triggerOrderStatusUpdateNotification(
          updatedOrder,
          existingOrder.status,
          newStatus
        );
        notificationCreated = !!notifResult;
      } catch (notifErr: any) {
        console.error('Non-blocking notification error after admin status update:', notifErr);
        notificationError = notifErr?.message || 'Notification dispatch failed';
      }
    }

    // 6. Query updated notifications and status history
    const [notifications, statusHistory] = await Promise.all([
      getOrderNotifications(existingOrder.id),
      getOrderStatusHistory(existingOrder.id),
    ]);

    return NextResponse.json({
      success: true,
      statusChanged: !!statusActuallyChanged,
      notificationCreated,
      notificationError,
      order: updatedOrder ? { ...updatedOrder, notifications, statusHistory } : updatedOrder,
    });
  } catch (error) {
    console.error('Error updating admin order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
