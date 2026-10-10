import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin';
import {
  getUnreadAdminNotificationsCount,
  getUnifiedAdminNotifications,
  markNotificationAsRead,
  markOrderNotificationsAsRead,
  markAllAdminNotificationsAsRead,
} from '@/lib/notifications/service';

export async function GET(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const type = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const [counts, notifications] = await Promise.all([
      getUnreadAdminNotificationsCount(),
      getUnifiedAdminNotifications({ unreadOnly, type, limit }),
    ]);

    return NextResponse.json({
      success: true,
      unreadCount: counts.total,
      counts,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json({ error: 'Failed to retrieve notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { notificationId, orderId, markAll } = body;

    let modified = false;

    if (markAll) {
      modified = await markAllAdminNotificationsAsRead();
    } else if (notificationId) {
      modified = await markNotificationAsRead(notificationId);
    } else if (orderId) {
      modified = await markOrderNotificationsAsRead(orderId);
    } else {
      return NextResponse.json(
        { error: 'Either notificationId, orderId, or markAll is required' },
        { status: 400 }
      );
    }

    const counts = await getUnreadAdminNotificationsCount();

    return NextResponse.json({
      success: true,
      modified,
      unreadCount: counts.total,
      counts,
    });
  } catch (error) {
    console.error('Error marking admin notification read:', error);
    return NextResponse.json({ error: 'Failed to update notification state' }, { status: 500 });
  }
}
