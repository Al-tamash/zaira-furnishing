import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAuthenticatedCustomer } from '@/lib/auth/customer';
import { getDatabase } from '@/lib/db';
import { DbProduct } from '@/lib/db/types';

export async function GET(req: NextRequest) {
  const customer = await getAuthenticatedCustomer(req);
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const db = getDatabase();
    const rows = await db.query<{
      id: string;
      product_id: string;
      created_at: string;
      product_name: string;
      product_slug: string;
      category_id: string;
      base_price: number;
      active: number;
      main_image: string | null;
    }>(
      `SELECT
        w.id,
        w.product_id,
        w.created_at,
        p.name as product_name,
        p.slug as product_slug,
        p.category_id,
        p.base_price,
        p.active,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND active = 1 ORDER BY is_main DESC, display_order ASC LIMIT 1) as main_image
       FROM wishlist_items w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [customer.id]
    );

    const ids = rows.map((r) => r.product_id);

    return NextResponse.json({
      data: rows,
      ids,
      count: rows.length,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const customer = await getAuthenticatedCustomer(req);
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const productId = body?.productId;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDatabase();

    // 1. Verify product exists and is active (lookup by ID or slug)
    const product = await db.queryOne<DbProduct>(
      'SELECT id, active FROM products WHERE (id = ? OR slug = ?) AND active = 1',
      [productId, productId]
    );

    if (!product || product.active !== 1) {
      return NextResponse.json(
        { error: 'Product is not available for wishlist' },
        { status: 400 }
      );
    }

    const canonicalProductId = product.id;

    // 2. Insert into wishlist (unique constraint ensures no duplicates)
    const existing = await db.queryOne<{ id: string }>(
      'SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?',
      [customer.id, canonicalProductId]
    );

    if (!existing) {
      const id = `wl-${crypto.randomBytes(8).toString('hex')}`;
      await db.execute(
        "INSERT INTO wishlist_items (id, user_id, product_id, created_at) VALUES (?, ?, ?, datetime('now'))",
        [id, customer.id, canonicalProductId]
      );
    }

    return NextResponse.json({ success: true, wishlisted: true });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const customer = await getAuthenticatedCustomer(req);
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    await db.execute(
      'DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?',
      [customer.id, productId]
    );

    return NextResponse.json({ success: true, wishlisted: false });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
