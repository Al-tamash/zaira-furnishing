import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedCustomer } from '@/lib/auth/customer';
import { getDatabase } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const customer = await getAuthenticatedCustomer(req);
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const { quantity, delta } = body || {};

    const db = getDatabase();

    // 1. Verify item exists and belongs to the authenticated customer's cart
    const item = await db.queryOne<{ id: string; cart_id: string; quantity: number }>(
      `SELECT ci.id, ci.cart_id, ci.quantity
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [id, customer.id]
    );

    if (!item) {
      return NextResponse.json({ error: 'Cart item not found or unauthorized' }, { status: 404 });
    }

    let newQty: number;
    if (quantity !== undefined) {
      newQty = parseInt(quantity, 10);
    } else if (delta !== undefined) {
      newQty = item.quantity + parseInt(delta, 10);
    } else {
      return NextResponse.json({ error: 'Either quantity or delta is required' }, { status: 400 });
    }

    if (newQty <= 0) {
      await db.execute('DELETE FROM cart_items WHERE id = ?', [id]);
      await db.execute("UPDATE carts SET updated_at = datetime('now') WHERE id = ?", [item.cart_id]);
      return NextResponse.json({ success: true, removed: true });
    }

    await db.execute(
      "UPDATE cart_items SET quantity = ?, updated_at = datetime('now') WHERE id = ?",
      [newQty, id]
    );
    await db.execute("UPDATE carts SET updated_at = datetime('now') WHERE id = ?", [item.cart_id]);

    return NextResponse.json({ success: true, quantity: newQty });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const customer = await getAuthenticatedCustomer(req);
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getDatabase();

    // Verify item exists and belongs to the authenticated customer's cart
    const item = await db.queryOne<{ id: string; cart_id: string }>(
      `SELECT ci.id, ci.cart_id
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = ? AND c.user_id = ?`,
      [id, customer.id]
    );

    if (!item) {
      return NextResponse.json({ error: 'Cart item not found or unauthorized' }, { status: 404 });
    }

    await db.execute('DELETE FROM cart_items WHERE id = ?', [id]);
    await db.execute("UPDATE carts SET updated_at = datetime('now') WHERE id = ?", [item.cart_id]);

    return NextResponse.json({ success: true, removed: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json({ error: 'Failed to delete cart item' }, { status: 500 });
  }
}
