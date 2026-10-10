import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDatabase } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getAuthenticatedCustomer } from '@/lib/auth/customer';
import { DbQuoteRequest } from '@/lib/db/types';
import { generateQuoteRequestNumber, resolveProductAndVariant } from '@/lib/db/requests';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import { triggerNewQuoteNotification } from '@/lib/notifications/service';

// ─── POST /api/quote-requests ───
export async function POST(req: NextRequest) {
  try {
    const db = getDatabase();
    await ensureDatabaseSchema(db);
    const body = await req.json();
    const {
      productId,
      variantId,
      customerName,
      customerPhone,
      phone,
      customerEmail,
      email,
      quantity,
      dimensions,
      customizationDetails,
      customerNotes,
      idempotencyKey,
    } = body;

    const resolvedCustomerName = (customerName || body.name || body.customer_name || '').trim();
    const resolvedPhone = customerPhone || phone || body.customer_phone;
    const resolvedEmail = customerEmail || email || body.customer_email;
    const resolvedNotes = (customerNotes || body.message || body.requirements || '').trim() || null;

    // 1. Validate customer name
    if (!resolvedCustomerName) {
      return NextResponse.json(
        { error: 'Customer name is required.' },
        { status: 400 }
      );
    }

    // 2. Validate customer phone (at least 10 digits)
    const cleanPhone = (resolvedPhone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'A valid phone number with at least 10 digits is required.' },
        { status: 400 }
      );
    }

    // 3. Validate quantity
    const parsedQty = typeof quantity === 'number' ? quantity : parseInt(quantity, 10);
    const validQty = isNaN(parsedQty) || parsedQty < 1 ? 1 : parsedQty;

    // 4. Duplicate protection / Idempotency check
    if (idempotencyKey && typeof idempotencyKey === 'string' && idempotencyKey.trim().length > 0) {
      const existing = await db.queryOne<DbQuoteRequest>(
        'SELECT * FROM quote_requests WHERE idempotency_key = ?',
        [idempotencyKey.trim()]
      );
      if (existing) {
        return NextResponse.json(
          { success: true, quoteRequest: existing, duplicate: true },
          { status: 200 }
        );
      }
    }

    // 5. Server-side product & variant resolution (strict database lookup)
    const resolvedProductId = (
      productId ||
      body.product_id ||
      body.productSlug ||
      body.slug ||
      body.product_name ||
      'prod-off-custom-made-curtains'
    ).trim();

    let productCtx;
    try {
      productCtx = await resolveProductAndVariant(db, resolvedProductId, variantId);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const { product, variant, categoryName, categorySlug } = productCtx;

    // 6. Check for authenticated user session (if logged in)
    const authenticatedCustomer = await getAuthenticatedCustomer(req);
    const userId = authenticatedCustomer ? authenticatedCustomer.id : null;

    // 7. Generate unique request reference number and ID
    const id = `qr-${crypto.randomUUID()}`;
    const requestNumber = await generateQuoteRequestNumber(db);

    const customizationDetailsJson =
      customizationDetails && typeof customizationDetails === 'object'
        ? JSON.stringify(customizationDetails)
        : null;

    // 8. Insert quote request with genuine product snapshots
    await db.execute(
      `INSERT INTO quote_requests (
        id, request_number, user_id, customer_name, customer_phone, customer_email,
        product_id, product_name_snapshot, product_sku_snapshot,
        category_name_snapshot, category_slug_snapshot,
        variant_id, variant_name_snapshot,
        quantity, dimensions, customization_details, customer_notes,
        starting_price_snapshot, status, idempotency_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?, datetime('now'), datetime('now'))`,
      [
        id,
        requestNumber,
        userId,
        resolvedCustomerName,
        cleanPhone,
        resolvedEmail?.trim() || null,
        product.id,
        product.display_name || product.name,
        variant?.sku || product.id,
        categoryName,
        categorySlug,
        variant?.id || null,
        variant?.name || null,
        validQty,
        dimensions?.trim() || null,
        customizationDetailsJson,
        resolvedNotes,
        product.base_price,
        idempotencyKey?.trim() || null,
      ]
    );

    const createdRecord = await db.queryOne<DbQuoteRequest>(
      'SELECT * FROM quote_requests WHERE id = ?',
      [id]
    );

    if (createdRecord) {
      try {
        await triggerNewQuoteNotification(createdRecord);
      } catch (notifErr) {
        console.error('Failed to trigger quote notification:', notifErr);
      }
    }

    return NextResponse.json(
      { success: true, quoteRequest: createdRecord },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error creating quote request:', err);
    return NextResponse.json(
      { error: 'An unexpected server error occurred while submitting your quote request.' },
      { status: 500 }
    );
  }
}

// ─── GET /api/quote-requests ───
export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminRequest(req);
    const customer = await getAuthenticatedCustomer(req);

    if (!isAdmin && !customer) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    const db = getDatabase();
    const { searchParams } = new URL(req.url);

    // If Admin: list all requests with filters, search, and pagination
    if (isAdmin) {
      const search = searchParams.get('search')?.trim();
      const status = searchParams.get('status')?.trim();
      const pageParam = parseInt(searchParams.get('page') || '1', 10);
      const limitParam = parseInt(searchParams.get('limit') || '20', 10);

      const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
      const limit = isNaN(limitParam) || limitParam < 1 || limitParam > 100 ? 20 : limitParam;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE 1=1';
      const params: unknown[] = [];

      if (search) {
        whereClause += ` AND (
          request_number LIKE ? OR
          customer_name LIKE ? OR
          customer_phone LIKE ? OR
          customer_email LIKE ? OR
          product_name_snapshot LIKE ?
        )`;
        const pattern = `%${search}%`;
        params.push(pattern, pattern, pattern, pattern, pattern);
      }

      if (status && status !== 'ALL') {
        whereClause += ' AND status = ?';
        params.push(status.toUpperCase());
      }

      const countSql = `SELECT COUNT(*) as total FROM quote_requests ${whereClause}`;
      const countRow = await db.queryOne<{ total: number }>(countSql, params);
      const total = countRow?.total || 0;
      const totalPages = Math.ceil(total / limit) || 1;

      // Status count breakdowns for admin dashboard tabs
      const statusCounts = await db.query<{ status: string; cnt: number }>(
        'SELECT status, COUNT(*) as cnt FROM quote_requests GROUP BY status'
      );
      const countsMap: Record<string, number> = {
        ALL: 0,
        NEW: 0,
        CONTACTED: 0,
        QUOTED: 0,
        CLOSED: 0,
        CANCELLED: 0,
      };
      let totalAll = 0;
      for (const row of statusCounts) {
        const key = row.status ? row.status.toUpperCase() : '';
        if (key && key in countsMap) {
          countsMap[key] = row.cnt;
        }
        totalAll += row.cnt;
      }
      countsMap.ALL = totalAll;

      const querySql = `
        SELECT *
        FROM quote_requests
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      const quoteRequests = await db.query<DbQuoteRequest>(querySql, [...params, limit, offset]);

      return NextResponse.json({
        quoteRequests,
        total,
        page,
        totalPages,
        limit,
        counts: countsMap,
      });
    }

    // If Authenticated Customer: return only their own requests
    if (customer) {
      const quoteRequests = await db.query<DbQuoteRequest>(
        'SELECT * FROM quote_requests WHERE user_id = ? ORDER BY created_at DESC',
        [customer.id]
      );
      return NextResponse.json({ quoteRequests });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (err: any) {
    console.error('Error fetching quote requests:', err);
    return NextResponse.json({ error: 'Failed to fetch quote requests.' }, { status: 500 });
  }
}
