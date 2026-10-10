import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedCustomer } from '@/lib/auth/customer';
import { getDatabase } from '@/lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const customer = await getAuthenticatedCustomer(req);
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const { productId } = await params;
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    await db.execute(
      'DELETE FROM wishlist_items WHERE user_id = ? AND (product_id = ? OR product_id = (SELECT id FROM products WHERE slug = ?))',
      [customer.id, productId, productId]
    );

    return NextResponse.json({ success: true, wishlisted: false });
  } catch (error) {
    console.error('Error removing from wishlist by id:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
