import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getDatabase } from '@/lib/db';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import { DbOrder } from '@/lib/db/types';

export async function GET(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.trim();
  const status = searchParams.get('status')?.trim();
  const paymentStatus = searchParams.get('payment_status')?.trim();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '20', 10);

  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const limit = isNaN(limitParam) || limitParam < 1 || limitParam > 100 ? 20 : limitParam;
  const offset = (page - 1) * limit;

  try {
    const db = getDatabase();
    await ensureDatabaseSchema(db);

    let whereClause = 'WHERE 1=1';
    const params: unknown[] = [];

    // Search filter across order_number, customer_name, customer_phone, customer_email
    if (search) {
      whereClause += ` AND (
        o.order_number LIKE ? OR
        o.customer_name LIKE ? OR
        o.customer_phone LIKE ? OR
        o.customer_email LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Status filter
    if (status && status !== 'ALL') {
      whereClause += ' AND o.status = ?';
      params.push(status.toUpperCase());
    }

    // Payment status filter
    if (paymentStatus && paymentStatus !== 'ALL') {
      whereClause += ' AND o.payment_status = ?';
      params.push(paymentStatus.toUpperCase());
    }

    // 1. Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM orders o ${whereClause}`;
    const countRow = await db.queryOne<{ total: number }>(countSql, params);
    const total = countRow?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // 2. Query paginated orders with item summaries
    const ordersSql = `
      SELECT
        o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        (SELECT product_name_snapshot FROM order_items WHERE order_id = o.id LIMIT 1) as first_product_name,
        (SELECT MAX(CASE WHEN customization_data IS NOT NULL OR product_type = 'custom_made' THEN 1 ELSE 0 END) FROM order_items WHERE order_id = o.id) as has_custom_items,
        (SELECT MAX(CASE WHEN recipient_type = 'ADMIN' AND event_type = 'NEW_ORDER_ADMIN' AND (is_read = 0 OR is_read IS NULL) THEN 1 ELSE 0 END) FROM order_notifications WHERE order_id = o.id) as has_unread_notification
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const orders = await db.query<
      DbOrder & {
        item_count: number;
        first_product_name: string | null;
        has_custom_items: number;
        has_unread_notification: number;
      }
    >(ordersSql, [...params, limit, offset]);

    return NextResponse.json({
      orders,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}
