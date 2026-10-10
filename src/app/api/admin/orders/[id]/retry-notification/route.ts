// src/app/api/admin/orders/[id]/retry-notification/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getDatabase } from '@/lib/db';
import { DbOrder, DbOrderNotification } from '@/lib/db/types';
import { retryNotification } from '@/lib/notifications/service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
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
    if (!body || !body.notificationId) {
      return NextResponse.json({ error: 'notificationId is required' }, { status: 400 });
    }

    const { notificationId } = body;
    const db = getDatabase();

    // Verify order exists
    const order = await db.queryOne<DbOrder>(
      'SELECT id FROM orders WHERE id = ? OR order_number = ?',
      [id, id]
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify notification belongs to this order
    const notification = await db.queryOne<DbOrderNotification>(
      'SELECT * FROM order_notifications WHERE id = ? AND order_id = ?',
      [notificationId, order.id]
    );

    if (!notification) {
      return NextResponse.json({ error: 'Notification record not found for this order' }, { status: 404 });
    }

    // Prevent duplicate sending if already SENT
    if (notification.status === 'SENT') {
      return NextResponse.json(
        { error: 'Notification was already delivered successfully. Cannot re-send to avoid duplicates.' },
        { status: 400 }
      );
    }

    const mockSuccess =
      process.env.NODE_ENV !== 'production' &&
      req.headers.get('x-notification-mock') === 'true';

    // Attempt safe retry
    const result = await retryNotification(notificationId, { mockSuccess });

    return NextResponse.json({
      success: result.success,
      notification: result.notification,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error retrying notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retry notification' },
      { status: 500 }
    );
  }
}
