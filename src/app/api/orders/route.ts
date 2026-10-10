import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getAuthenticatedCustomer,
  createCustomerSession,
  CUSTOMER_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth/customer';
import { getDatabase } from '@/lib/db';
import { DbProduct, DbProductVariant, DbCart, DbCartItem, DbOrder, DbOrderItem, DbUser } from '@/lib/db/types';
import { triggerNewOrderNotifications } from '@/lib/notifications/service';

// Helper to generate sequential human-readable collision-safe order number
async function generateOrderNumber(db: ReturnType<typeof getDatabase>): Promise<string> {
  const currentYear = new Date().getFullYear();
  const countRow = await db.queryOne<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM orders WHERE created_at LIKE ?",
    [`${currentYear}%`]
  );
  let nextSeq = (countRow?.cnt || 0) + 1;

  while (true) {
    const candidate = `ZAI-${currentYear}-${String(nextSeq).padStart(6, '0')}`;
    const exists = await db.queryOne<{ id: string }>(
      'SELECT id FROM orders WHERE order_number = ?',
      [candidate]
    );
    if (!exists) {
      return candidate;
    }
    nextSeq++;
  }
}

// ─── GET /api/orders (List authenticated customer's orders) ───
export async function GET(req: NextRequest) {
  const customer = await getAuthenticatedCustomer(req);
  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  try {
    const db = getDatabase();
    const orders = await db.query<DbOrder>(
      `SELECT o.*
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [customer.id]
    );

    const ordersWithItems = await Promise.all(
      orders.map(async (o) => {
        const items = await db.query<
          DbOrderItem & { product_image: string | null; product_slug: string | null }
        >(
          `SELECT
            oi.*,
            (SELECT image_url FROM product_images WHERE product_id = oi.product_id AND active = 1 ORDER BY is_main DESC, display_order ASC LIMIT 1) as product_image,
            p.slug as product_slug
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?
           ORDER BY oi.created_at ASC`,
          [o.id]
        );
        return {
          ...o,
          items,
        };
      })
    );

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// ─── POST /api/orders (Create genuine D1 COD Order) ───
export async function POST(req: NextRequest) {
  try {
    const customer = await getAuthenticatedCustomer(req);

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      city,
      state,
      pincode,
      landmark,
      deliveryOption = 'standard',
      siteVisitDate,
      siteVisitTime,
      notes,
      idempotencyKey,
      paymentMethod = 'COD',
      order_source,
      orderSource,
      isBuyNow = false,
    } = body;

    // Validate order source (WEB, WHATSAPP, QUOTE, MEASUREMENT) - defaults to WEB
    const ALLOWED_ORDER_SOURCES = ['WEB', 'WHATSAPP', 'QUOTE', 'MEASUREMENT'] as const;
    type AllowedOrderSource = (typeof ALLOWED_ORDER_SOURCES)[number];

    const rawSource = (order_source || orderSource || 'WEB').toString().trim().toUpperCase();
    if (!ALLOWED_ORDER_SOURCES.includes(rawSource as AllowedOrderSource)) {
      return NextResponse.json(
        { error: `Invalid order source: "${rawSource}". Allowed values are: ${ALLOWED_ORDER_SOURCES.join(', ')}` },
        { status: 400 }
      );
    }
    const finalOrderSource: AllowedOrderSource = rawSource as AllowedOrderSource;

    // 1. Validate required customer information
    const finalCustomerName = (customerName || body.name || body.fullName || body.customer_name || '').toString().trim();
    if (!finalCustomerName || finalCustomerName.length < 2) {
      return NextResponse.json({ error: 'Full name is required (min 2 characters)' }, { status: 400 });
    }

    const rawPhone = (customerPhone || body.phone || body.mobile || body.customer_phone || '').toString().trim();
    if (!rawPhone || !/^[0-9+ -]{10,14}$/.test(rawPhone)) {
      return NextResponse.json({ error: 'Valid 10-digit mobile number is required' }, { status: 400 });
    }

    const cleanPhone = rawPhone;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = customerEmail ? customerEmail.trim() : (customer?.email || '');
    const finalEmail = cleanEmail || `${cleanPhone.replace(/\D/g, '')}@guest.zaira.local`;
    if (cleanEmail && !emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    // 2. Validate delivery address
    const rawDeliveryAddress = (
      deliveryAddress ||
      body.address ||
      body.shippingAddress ||
      body.delivery_address ||
      (body.addressLine1 ? `${body.addressLine1}, ${body.addressLine2 || ''}` : '')
    );
    const finalDeliveryAddress = typeof rawDeliveryAddress === 'string' ? rawDeliveryAddress.trim() : '';

    if (!finalDeliveryAddress || finalDeliveryAddress.length < 5) {
      return NextResponse.json({ error: 'Delivery address is required (min 5 characters)' }, { status: 400 });
    }

    const finalCity = (city || body.town || 'Hyderabad').toString().trim();
    if (!finalCity) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }

    const finalState = (state || body.province || 'Telangana').toString().trim();
    if (!finalState) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 });
    }

    const rawPincode = (pincode || body.postalCode || body.pin_code || '500033').toString().trim();
    if (!rawPincode || !/^[0-9]{6}$/.test(rawPincode)) {
      return NextResponse.json({ error: 'Valid 6-digit PIN code is required' }, { status: 400 });
    }
    const finalPincode = rawPincode;

    // Enforce COD payment method for Stage 4
    if (paymentMethod && paymentMethod.toUpperCase() !== 'COD') {
      return NextResponse.json(
        { error: 'Only Cash on Delivery (COD) is supported in this stage.' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Determine or create User record
    let userId: string;
    let sessionTokenToSet: string | null = null;

    if (customer) {
      userId = customer.id;
    } else {
      const existingUser = await db.queryOne<DbUser>(
        'SELECT * FROM users WHERE email = ? OR (phone = ? AND role = ?)',
        [finalEmail, cleanPhone, 'CUSTOMER']
      );
      if (existingUser) {
        userId = existingUser.id;
      } else {
        userId = `usr-${crypto.randomBytes(8).toString('hex')}`;
        await db.execute(
          `INSERT INTO users (id, role, name, email, phone, status, created_at, updated_at)
           VALUES (?, 'CUSTOMER', ?, ?, ?, 'active', datetime('now'), datetime('now'))`,
          [userId, finalCustomerName, finalEmail, cleanPhone]
        );
      }
      try {
        sessionTokenToSet = await createCustomerSession(userId);
      } catch (sessErr) {
        console.warn('Could not establish customer session for order:', sessErr);
      }
    }

    // 3. Idempotency Check (prevent accidental double-click duplicate orders)
    if (idempotencyKey && typeof idempotencyKey === 'string') {
      const existingOrder = await db.queryOne<DbOrder>(
        'SELECT * FROM orders WHERE user_id = ? AND idempotency_key = ?',
        [userId, idempotencyKey.trim()]
      );

      if (existingOrder) {
        const existingItems = await db.query<DbOrderItem>(
          'SELECT * FROM order_items WHERE order_id = ?',
          [existingOrder.id]
        );
        return NextResponse.json({
          success: true,
          order: {
            ...existingOrder,
            orderNumber: existingOrder.order_number,
            orderSource: existingOrder.order_source,
            subtotal: existingOrder.subtotal,
            discount: existingOrder.discount,
            totalAmount: existingOrder.total_amount,
            deliveryCharge: existingOrder.delivery_charge,
            customerName: existingOrder.customer_name,
            customerPhone: existingOrder.customer_phone,
            customerEmail: existingOrder.customer_email,
            deliveryAddress: existingOrder.delivery_address,
            deliveryOption: existingOrder.delivery_option,
            siteVisitTime: existingOrder.site_visit_time,
            items: existingItems,
          },
          isDuplicateSubmission: true,
        });
      }
    }

    // 4. Fetch Cart Items or Buy Now Single Item
    let cart: DbCart | null = null;
    let cartItems: DbCartItem[] = [];

    if (isBuyNow) {
      if (!Array.isArray(body.items) || body.items.length === 0) {
        return NextResponse.json(
          { error: 'No product selected for Buy Now order.' },
          { status: 400 }
        );
      }
      cartItems = body.items.map((it: any) => ({
        id: it.id || `bn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        cart_id: '',
        product_id: it.productId || it.product_id,
        variant_id: it.variantId || it.variant_id || null,
        quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
        unit_price_snapshot: 0,
        customization_data: typeof it.customizationData === 'object' ? JSON.stringify(it.customizationData) : it.customization_data || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } else {
      cart = await db.queryOne<DbCart>(
        'SELECT * FROM carts WHERE user_id = ?',
        [userId]
      );

      if (cart) {
        cartItems = await db.query<DbCartItem>(
          'SELECT * FROM cart_items WHERE cart_id = ?',
          [cart.id]
        );
      }

      // Support items payload passed from checkout body (e.g. fresh client bag synchronization)
      if ((!cartItems || cartItems.length === 0) && Array.isArray(body.items) && body.items.length > 0) {
        if (!cart) {
          const cartId = `cart-${userId}`;
          await db.execute(
            "INSERT INTO carts (id, user_id, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))",
            [cartId, userId]
          );
          cart = { id: cartId, user_id: userId, created_at: '', updated_at: '' };
        }
        cartItems = body.items.map((it: any) => ({
          id: it.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          cart_id: cart!.id,
          product_id: it.productId || it.product_id,
          variant_id: it.variantId || it.variant_id || null,
          quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
          unit_price_snapshot: 0,
          customization_data: typeof it.customizationData === 'object' ? JSON.stringify(it.customizationData) : it.customization_data || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      }
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty. Please add products before placing an order.' },
        { status: 400 }
      );
    }

    // 5. Server-Side Verification of each cart item against D1 catalog
    interface ValidatedOrderItem {
      productId: string;
      variantId: string | null;
      productName: string;
      variantName: string | null;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      customizationData: string | null;
      productType: string;
    }

    const validatedItems: ValidatedOrderItem[] = [];
    let calculatedSubtotal = 0;

    for (const item of cartItems) {
      // Re-fetch product
      const product = await db.queryOne<DbProduct>(
        'SELECT * FROM products WHERE id = ?',
        [item.product_id]
      );

      if (!product || product.active !== 1) {
        return NextResponse.json(
          { error: `Product "${product?.name || item.product_id}" is currently unavailable.` },
          { status: 400 }
        );
      }

      // Re-fetch variant if present
      let variantName: string | null = null;
      let variantPriceAdj = 0;

      if (item.variant_id) {
        const variant = await db.queryOne<DbProductVariant>(
          'SELECT * FROM product_variants WHERE id = ? AND product_id = ? AND active = 1',
          [item.variant_id, item.product_id]
        );

        if (!variant) {
          return NextResponse.json(
            { error: `Selected variant for "${product.name}" is no longer available.` },
            { status: 400 }
          );
        }

        variantName = variant.name;
        variantPriceAdj = variant.price_adjustment || 0;
      }

      // Calculate server unit price snapshot (catalog truth, never client truth)
      const unitPrice = Math.max(0, product.base_price + variantPriceAdj);
      const lineTotal = unitPrice * item.quantity;
      calculatedSubtotal += lineTotal;

      validatedItems.push({
        productId: product.id,
        variantId: item.variant_id || null,
        productName: product.name,
        variantName,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
        customizationData: item.customization_data || null,
        productType: product.product_type || 'standard',
      });
    }

    // 6. Calculate Order Totals
    const subtotal = calculatedSubtotal;
    const discount = 0;
    const deliveryCharge = 0;
    const totalAmount = subtotal + deliveryCharge - discount;

    // 7. Generate IDs and Order Number
    const orderId = `ord-${crypto.randomBytes(8).toString('hex')}`;
    const orderNumber = await generateOrderNumber(db);
    const siteVisitRequired = deliveryOption === 'service_visit' ? 1 : 0;

    // 8. Atomic Database Transaction (Compatible with both Cloudflare D1 batching & SQLite WAL)
    const statements: { sql: string; params: unknown[] }[] = [
      {
        sql: `INSERT INTO orders (
          id, order_number, user_id, status, payment_method, payment_status,
          customer_name, customer_email, customer_phone, delivery_address,
          city, state, pincode, landmark, delivery_option, site_visit_required,
          site_visit_date, site_visit_time, subtotal, discount, delivery_charge,
          total_amount, notes, idempotency_key, order_source, created_at, updated_at
        ) VALUES (?, ?, ?, 'CONFIRMED', 'COD', 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        params: [
          orderId,
          orderNumber,
          userId,
          finalCustomerName,
          finalEmail,
          cleanPhone,
          finalDeliveryAddress,
          finalCity,
          finalState,
          finalPincode,
          landmark ? landmark.trim() : null,
          deliveryOption,
          siteVisitRequired,
          siteVisitDate || null,
          siteVisitTime || null,
          subtotal,
          discount,
          deliveryCharge,
          totalAmount,
          notes ? notes.trim() : null,
          idempotencyKey ? idempotencyKey.trim() : null,
          finalOrderSource,
        ],
      },
    ];

    for (const item of validatedItems) {
      const itemId = `oi-${crypto.randomBytes(8).toString('hex')}`;
      statements.push({
        sql: `INSERT INTO order_items (
          id, order_id, product_id, variant_id, product_name_snapshot,
          variant_name_snapshot, quantity, unit_price_snapshot, line_total,
          customization_data, product_type, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        params: [
          itemId,
          orderId,
          item.productId,
          item.variantId,
          item.productName,
          item.variantName,
          item.quantity,
          item.unitPrice,
          item.lineTotal,
          item.customizationData,
          item.productType,
        ],
      });
    }

    // Clear customer's purchased cart items ONLY IF it's regular cart checkout (NOT Buy Now)
    if (!isBuyNow && cart) {
      statements.push({
        sql: 'DELETE FROM cart_items WHERE cart_id = ?',
        params: [cart.id],
      });
      statements.push({
        sql: "UPDATE carts SET updated_at = datetime('now') WHERE id = ?",
        params: [cart.id],
      });
    }

    try {
      await db.batch(statements);
    } catch (batchErr) {
      console.error('Atomic batch execution failed during order creation:', batchErr);
      throw batchErr;
    }

    // 8.5 Trigger Order Confirmation Notifications (Customer & Admin) after verified commit
    try {
      const committedOrder = await db.queryOne<DbOrder>(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );
      if (committedOrder) {
        const committedItems = await db.query<any>(
          'SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC',
          [committedOrder.id]
        );
        await triggerNewOrderNotifications(committedOrder, committedItems);
      }
    } catch (notifErr) {
      console.error('Non-blocking notification error after order commit:', notifErr);
    }

    // 9. Return clean, safe order confirmation data
    const response = NextResponse.json({
      success: true,
      order: {
        id: orderId,
        orderNumber,
        status: 'CONFIRMED',
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        customerName: finalCustomerName,
        customerEmail: finalEmail,
        customerPhone: cleanPhone,
        deliveryAddress: finalDeliveryAddress,
        city: finalCity,
        state: finalState,
        pincode: finalPincode,
        landmark: landmark ? landmark.trim() : null,
        deliveryOption,
        siteVisitRequired,
        siteVisitDate: siteVisitDate || null,
        siteVisitTime: siteVisitTime || null,
        subtotal,
        discount,
        deliveryCharge,
        totalAmount,
        orderSource: finalOrderSource,
        order_source: finalOrderSource,
        notes: notes ? notes.trim() : null,
        createdAt: new Date().toISOString(),
        items: validatedItems,
      },
    });

    if (sessionTokenToSet) {
      response.cookies.set(CUSTOMER_SESSION_COOKIE, sessionTokenToSet, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE_SECONDS,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while placing your order. Please try again.' },
      { status: 500 }
    );
  }
}
