import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedCustomer } from '@/lib/auth/customer';
import { getDatabase } from '@/lib/db';
import { DbOrder, DbOrderItem } from '@/lib/db/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const customer = await getAuthenticatedCustomer(req);
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    const db = getDatabase();

    // Query order strictly scoped to authenticated customer's user_id
    const order = await db.queryOne<DbOrder>(
      'SELECT * FROM orders WHERE (id = ? OR order_number = ?) AND user_id = ?',
      [id, id, customer.id]
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Query order items with snapshot data and display images
    const items = await db.query<DbOrderItem & { product_image: string | null; product_slug: string | null }>(
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

    // Query customer-safe status history (strictly new_status and created_at, no admin or internal info)
    const rawHistory = await db.query<{ new_status: string; created_at: string }>(
      'SELECT new_status, created_at FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC',
      [order.id]
    );

    const statusHistory = rawHistory.map((h) => ({
      status: h.new_status,
      timestamp: h.created_at,
    }));

    return NextResponse.json({
      order: {
        ...order,
        items,
        statusHistory,
      },
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}
