import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDatabase } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getAuthenticatedCustomer } from '@/lib/auth/customer';
import { DbMeasurementRequest } from '@/lib/db/types';
import { generateMeasurementRequestNumber, resolveProductAndVariant } from '@/lib/db/requests';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import { triggerNewMeasurementNotification } from '@/lib/notifications/service';
import { buildMeasurementWhatsAppUrl } from '@/lib/whatsapp';

// ─── POST /api/measurement-requests ───
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
      address,
      preferredDate,
      preferredTimeSlot,
      dimensions,
      customerNotes,
      idempotencyKey,
    } = body;

    const resolvedCustomerName = (customerName || body.name || body.customer_name || '').trim();
    const resolvedPhone = customerPhone || phone || body.customer_phone;
    const resolvedEmail = customerEmail || email || body.customer_email;
    const resolvedNotes = (customerNotes || body.notes || body.requirements || body.message || '').trim() || null;
    const isConsultation = Boolean(body.serviceRequested || !productId);

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

    // 3. Validate address/location (provide fallback for consultation form if not entered)
    const resolvedAddress = address && typeof address === 'string' && address.trim().length > 0
      ? address.trim()
      : (isConsultation ? 'Showroom Consultation (Site location to be confirmed via phone)' : '');

    if (!resolvedAddress) {
      return NextResponse.json(
        { error: 'Address or location is required for measurement visit.' },
        { status: 400 }
      );
    }

    // 4. Validate preferred date and time
    const resolvedDate = preferredDate && typeof preferredDate === 'string' && preferredDate.trim().length > 0
      ? preferredDate.trim()
      : (isConsultation ? 'Flexible / Showroom Coordinator Scheduled' : '');

    if (!resolvedDate) {
      return NextResponse.json(
        { error: 'Preferred date is required.' },
        { status: 400 }
      );
    }

    const resolvedTimeSlot = preferredTimeSlot && typeof preferredTimeSlot === 'string' && preferredTimeSlot.trim().length > 0
      ? preferredTimeSlot.trim()
      : (isConsultation ? 'Showroom Coordinated' : '');

    if (!resolvedTimeSlot) {
      return NextResponse.json(
        { error: 'Preferred time slot is required.' },
        { status: 400 }
      );
    }

    // 5. Duplicate protection / Idempotency check
    if (idempotencyKey && typeof idempotencyKey === 'string' && idempotencyKey.trim().length > 0) {
      const existing = await db.queryOne<DbMeasurementRequest>(
        'SELECT * FROM measurement_requests WHERE idempotency_key = ?',
        [idempotencyKey.trim()]
      );
      if (existing) {
        return NextResponse.json(
          { success: true, measurementRequest: existing, duplicate: true },
          { status: 200 }
        );
      }
    }

    // 6. Server-side product & variant resolution
    const targetProductId = (productId && typeof productId === 'string' && productId.trim().length > 0)
      ? productId.trim()
      : 'prod-off-custom-made-curtains'; // Flagship custom made-to-measure product

    let productCtx;
    try {
      productCtx = await resolveProductAndVariant(db, targetProductId, variantId);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const { product, variant, categoryName, categorySlug } = productCtx;

    // 7. Validate product supports custom measurement (in-home consultation requests are always eligible)
    if (!isConsultation && product.custom_measurement_available !== 1) {
      return NextResponse.json(
        { error: 'This product does not support in-home custom measurement requests.' },
        { status: 400 }
      );
    }

    // 8. Check for authenticated user session
    const authenticatedCustomer = await getAuthenticatedCustomer(req);
    const userId = authenticatedCustomer ? authenticatedCustomer.id : null;

    // 9. Generate unique request reference number and ID
    const id = `mr-${crypto.randomUUID()}`;
    const requestNumber = await generateMeasurementRequestNumber(db);

    const productNameSnapshot = body.serviceRequested && typeof body.serviceRequested === 'string'
      ? body.serviceRequested.trim()
      : (product.display_name || product.name);

    const categoryNameSnapshot = body.serviceRequested && typeof body.serviceRequested === 'string'
      ? 'Showroom Consultation Service'
      : categoryName;

    const categorySlugSnapshot = body.serviceRequested && typeof body.serviceRequested === 'string'
      ? 'services'
      : categorySlug;

    // 10. Insert measurement request with genuine snapshots
    await db.execute(
      `INSERT INTO measurement_requests (
        id, request_number, user_id, customer_name, customer_phone, customer_email,
        product_id, product_name_snapshot, product_sku_snapshot,
        category_name_snapshot, category_slug_snapshot,
        variant_id, variant_name_snapshot,
        address, preferred_date, preferred_time_slot,
        dimensions, customer_notes, status, idempotency_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?, datetime('now'), datetime('now'))`,
      [
        id,
        requestNumber,
        userId,
        resolvedCustomerName,
        cleanPhone,
        resolvedEmail?.trim() || null,
        product.id,
        productNameSnapshot,
        variant?.sku || product.id,
        categoryNameSnapshot,
        categorySlugSnapshot,
        variant?.id || null,
        variant?.name || null,
        resolvedAddress,
        resolvedDate,
        resolvedTimeSlot,
        dimensions?.trim() || null,
        resolvedNotes,
        idempotencyKey?.trim() || null,
      ]
    );

    const createdRecord = await db.queryOne<DbMeasurementRequest>(
      'SELECT * FROM measurement_requests WHERE id = ?',
      [id]
    );

    let whatsappUrl: string | null = null;
    if (createdRecord) {
      // 1. Trigger internal admin notifications & email
      try {
        await triggerNewMeasurementNotification(createdRecord);
      } catch (notifErr) {
        console.error('Failed to trigger measurement notification:', notifErr);
      }

      // 2. Generate pre-filled WhatsApp alert URL for instant mobile dispatch
      try {
        whatsappUrl = buildMeasurementWhatsAppUrl({
          productName: createdRecord.product_name_snapshot,
          categoryName: createdRecord.category_name_snapshot || 'In-Home Visit',
          customerName: createdRecord.customer_name,
          customerPhone: createdRecord.customer_phone,
          customerEmail: createdRecord.customer_email,
          address: createdRecord.address,
          preferredDate: createdRecord.preferred_date,
          preferredTime: createdRecord.preferred_time_slot,
          requirements: createdRecord.customer_notes,
          requestReference: `#${createdRecord.request_number}`,
        });
      } catch (waErr) {
        console.error('Failed to build measurement WhatsApp URL:', waErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        measurementRequest: createdRecord,
        whatsappUrl,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error creating measurement request:', err);
    return NextResponse.json(
      { error: 'An unexpected server error occurred while booking your measurement request.' },
      { status: 500 }
    );
  }
}

// ─── GET /api/measurement-requests ───
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
          address LIKE ? OR
          product_name_snapshot LIKE ?
        )`;
        const pattern = `%${search}%`;
        params.push(pattern, pattern, pattern, pattern, pattern, pattern);
      }

      if (status && status !== 'ALL') {
        whereClause += ' AND status = ?';
        params.push(status.toUpperCase());
      }

      const countSql = `SELECT COUNT(*) as total FROM measurement_requests ${whereClause}`;
      const countRow = await db.queryOne<{ total: number }>(countSql, params);
      const total = countRow?.total || 0;
      const totalPages = Math.ceil(total / limit) || 1;

      // Status count breakdowns for admin dashboard tabs
      const statusCounts = await db.query<{ status: string; cnt: number }>(
        'SELECT status, COUNT(*) as cnt FROM measurement_requests GROUP BY status'
      );
      const countsMap: Record<string, number> = {
        ALL: 0,
        NEW: 0,
        CONTACTED: 0,
        SCHEDULED: 0,
        COMPLETED: 0,
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
        FROM measurement_requests
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      const measurementRequests = await db.query<DbMeasurementRequest>(querySql, [...params, limit, offset]);

      return NextResponse.json({
        measurementRequests,
        total,
        page,
        totalPages,
        limit,
        counts: countsMap,
      });
    }

    // If Authenticated Customer: return only their own requests
    if (customer) {
      const measurementRequests = await db.query<DbMeasurementRequest>(
        'SELECT * FROM measurement_requests WHERE user_id = ? ORDER BY created_at DESC',
        [customer.id]
      );
      return NextResponse.json({ measurementRequests });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (err: any) {
    console.error('Error fetching measurement requests:', err);
    return NextResponse.json({ error: 'Failed to fetch measurement requests.' }, { status: 500 });
  }
}
