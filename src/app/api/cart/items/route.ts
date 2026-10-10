import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAuthenticatedCustomer } from '@/lib/auth/customer';
import { getDatabase } from '@/lib/db';
import { DbProduct, DbProductVariant, DbCart, DbCartItem } from '@/lib/db/types';

export async function POST(req: NextRequest) {
  const customer = await getAuthenticatedCustomer(req);
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
      productId,
      variantId,
      quantity = 1,
      sizeLabel,
      headingStyle,
      customDimensions,
      customizationData,
    } = body;

    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty) || numQty <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive integer' }, { status: 400 });
    }

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const db = getDatabase();

    // 1. Verify Product exists and is active (lookup by ID or slug)
    const product = await db.queryOne<DbProduct>(
      'SELECT * FROM products WHERE (id = ? OR slug = ?) AND active = 1',
      [productId, productId]
    );

    if (!product || product.active !== 1) {
      return NextResponse.json(
        { error: 'Product not found or currently unavailable' },
        { status: 400 }
      );
    }

    const canonicalProductId = product.id;

    // 2. Verify Variant if provided
    let variant: DbProductVariant | null = null;
    if (variantId) {
      variant = await db.queryOne<DbProductVariant>(
        'SELECT * FROM product_variants WHERE id = ? AND (product_id = ? OR product_id = ?) AND active = 1',
        [variantId, productId, canonicalProductId]
      );

      if (!variant) {
        return NextResponse.json(
          { error: 'Selected variant is not valid for this product' },
          { status: 400 }
        );
      }
    }

    // 3. SERVER-SIDE PRICE CALCULATION (Client price parameter is strictly ignored)
    const basePrice = Number(product.base_price);
    const variantAdjustment = variant ? Number(variant.price_adjustment || 0) : 0;
    const unitPriceSnapshot = Math.max(0, basePrice + variantAdjustment);

    // 4. Build normalized customization JSON
    const mergedCustomization: Record<string, any> = {
      ...(typeof customizationData === 'object' && customizationData ? customizationData : {}),
      ...(sizeLabel ? { sizeLabel } : {}),
      ...(headingStyle ? { headingStyle } : {}),
      ...(customDimensions ? { customDimensions } : {}),
    };
    const customJson = Object.keys(mergedCustomization).length > 0 ? JSON.stringify(mergedCustomization) : null;

    // 5. Ensure Customer has an active cart
    let cart = await db.queryOne<DbCart>('SELECT id FROM carts WHERE user_id = ?', [customer.id]);
    if (!cart) {
      const cartId = `cart-${customer.id}`;
      await db.execute(
        "INSERT INTO carts (id, user_id, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))",
        [cartId, customer.id]
      );
      cart = { id: cartId, user_id: customer.id, created_at: '', updated_at: '' };
    }

    // 6. Check for duplicate cart item
    let existingItem: DbCartItem | null = null;
    if (variantId) {
      existingItem = await db.queryOne<DbCartItem>(
        'SELECT * FROM cart_items WHERE cart_id = ? AND (product_id = ? OR product_id = ?) AND variant_id = ? AND (customization_data = ? OR (customization_data IS NULL AND ? IS NULL))',
        [cart.id, productId, canonicalProductId, variantId, customJson, customJson]
      );
    } else {
      existingItem = await db.queryOne<DbCartItem>(
        'SELECT * FROM cart_items WHERE cart_id = ? AND (product_id = ? OR product_id = ?) AND variant_id IS NULL AND (customization_data = ? OR (customization_data IS NULL AND ? IS NULL))',
        [cart.id, productId, canonicalProductId, customJson, customJson]
      );
    }

    if (existingItem) {
      // Merge quantity
      const updatedQty = existingItem.quantity + numQty;
      await db.execute(
        "UPDATE cart_items SET quantity = ?, unit_price_snapshot = ?, updated_at = datetime('now') WHERE id = ?",
        [updatedQty, unitPriceSnapshot, existingItem.id]
      );

      await db.execute("UPDATE carts SET updated_at = datetime('now') WHERE id = ?", [cart.id]);

      return NextResponse.json({
        success: true,
        itemId: existingItem.id,
        quantity: updatedQty,
        unitPrice: unitPriceSnapshot,
      });
    }

    // 7. Insert new cart item
    const newItemId = `ci-${crypto.randomBytes(8).toString('hex')}`;
    await db.execute(
      `INSERT INTO cart_items (id, cart_id, product_id, variant_id, quantity, unit_price_snapshot, customization_data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [newItemId, cart.id, canonicalProductId, variantId || null, numQty, unitPriceSnapshot, customJson]
    );

    await db.execute("UPDATE carts SET updated_at = datetime('now') WHERE id = ?", [cart.id]);

    return NextResponse.json({
      success: true,
      itemId: newItemId,
      quantity: numQty,
      unitPrice: unitPriceSnapshot,
    });
  } catch (error) {
    console.error('Error adding cart item:', error);
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
  }
}
