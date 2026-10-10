import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDatabase } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { DbContactInquiry } from '@/lib/db/types';

/**
 * Generates unique readable inquiry reference.
 * Format: CI-YYYYMMDD-XXXX (e.g. CI-20260930-A81C)
 */
async function generateInquiryNumber(db: ReturnType<typeof getDatabase>): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  while (true) {
    const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    const candidate = `CI-${dateStr}-${randomSuffix}`;
    const existing = await db.queryOne<{ id: string }>(
      'SELECT id FROM contact_inquiries WHERE inquiry_number = ?',
      [candidate]
    );
    if (!existing) {
      return candidate;
    }
  }
}

// ─── POST /api/contact ───
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, subject, message, idempotencyKey } = body;

    // 1. Validate customer name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter your full name (at least 2 characters).' },
        { status: 400 }
      );
    }

    // 2. Validate phone number (at least 10 digits)
    const cleanPhone = (phone ? String(phone) : '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number with at least 10 digits.' },
        { status: 400 }
      );
    }

    // 3. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 4. Validate message
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please enter your message or project scope (at least 5 characters).' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // 5. Duplicate protection / Idempotency check
    if (idempotencyKey && typeof idempotencyKey === 'string' && idempotencyKey.trim().length > 0) {
      const existing = await db.queryOne<DbContactInquiry>(
        'SELECT * FROM contact_inquiries WHERE idempotency_key = ?',
        [idempotencyKey.trim()]
      );
      if (existing) {
        return NextResponse.json(
          { success: true, inquiry: existing, duplicate: true },
          { status: 200 }
        );
      }
    }

    // 6. Generate unique ID and reference number
    const id = `ci-${crypto.randomUUID()}`;
    const inquiryNumber = await generateInquiryNumber(db);
    const resolvedSubject = typeof subject === 'string' && subject.trim() ? subject.trim() : 'General Inquiry';

    // 7. Persist inquiry into database
    await db.execute(
      `INSERT INTO contact_inquiries (
        id, inquiry_number, name, phone, email, subject, message, status, idempotency_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'NEW', ?, datetime('now'), datetime('now'))`,
      [
        id,
        inquiryNumber,
        name.trim(),
        cleanPhone,
        email.trim().toLowerCase(),
        resolvedSubject,
        message.trim(),
        idempotencyKey && typeof idempotencyKey === 'string' ? idempotencyKey.trim() : null,
      ]
    );

    const createdRecord = await db.queryOne<DbContactInquiry>(
      'SELECT * FROM contact_inquiries WHERE id = ?',
      [id]
    );

    return NextResponse.json(
      { success: true, inquiry: createdRecord },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error creating contact inquiry:', err);
    return NextResponse.json(
      { error: 'An unexpected server error occurred while sending your message. Please try again or reach out to us directly.' },
      { status: 500 }
    );
  }
}

// ─── GET /api/contact (Admin Only) ───
export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminRequest(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const db = getDatabase();
    const { searchParams } = new URL(req.url);

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
        inquiry_number LIKE ? OR
        name LIKE ? OR
        phone LIKE ? OR
        email LIKE ? OR
        subject LIKE ? OR
        message LIKE ?
      )`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern, pattern, pattern);
    }

    if (status && status !== 'ALL') {
      whereClause += ' AND status = ?';
      params.push(status.toUpperCase());
    }

    const countSql = `SELECT COUNT(*) as total FROM contact_inquiries ${whereClause}`;
    const countRow = await db.queryOne<{ total: number }>(countSql, params);
    const total = countRow?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    const querySql = `
      SELECT *
      FROM contact_inquiries
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const inquiries = await db.query<DbContactInquiry>(querySql, [...params, limit, offset]);

    return NextResponse.json({
      inquiries,
      total,
      page,
      totalPages,
      limit,
    });
  } catch (err: any) {
    console.error('Error fetching contact inquiries:', err);
    return NextResponse.json(
      { error: 'Failed to fetch contact inquiries.' },
      { status: 500 }
    );
  }
}
