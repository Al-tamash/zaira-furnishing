import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDatabase } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { DbContactInquiry } from '@/lib/db/types';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

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
    const ip = getClientIp(req);
    // Rate limit: 10 contact inquiries per 10 minutes (600s)
    const rateLimit = checkRateLimit(`contact-form:${ip}`, 10, 600);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many submissions. Please wait ${Math.ceil(rateLimit.resetInSeconds / 60)} minutes before trying again.`,
        },
        { status: 429 }
      );
    }

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
        { error: 'Please write a message with at least 5 characters.' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // 5. Check Idempotency Key
    if (idempotencyKey && typeof idempotencyKey === 'string') {
      const existing = await db.queryOne<DbContactInquiry>(
        'SELECT * FROM contact_inquiries WHERE idempotency_key = ?',
        [idempotencyKey]
      );
      if (existing) {
        return NextResponse.json({
          success: true,
          inquiry: existing,
          duplicate: true,
        });
      }
    }

    const inquiryId = `ci_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const inquiryNumber = await generateInquiryNumber(db);
    const trimmedSubject = (subject && typeof subject === 'string') ? subject.trim() : 'General Inquiry';

    const insertSql = `
      INSERT INTO contact_inquiries (
        id, inquiry_number, name, phone, email, subject, message, status, idempotency_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'NEW', ?, datetime('now'), datetime('now'))
    `;

    await db.execute(insertSql, [
      inquiryId,
      inquiryNumber,
      name.trim(),
      cleanPhone,
      email.trim(),
      trimmedSubject,
      message.trim(),
      idempotencyKey || null,
    ]);

    // Insert notification for admin
    try {
      const notifId = `notif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      await db.execute(
        `INSERT INTO notifications (id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, 'lead', 0, datetime('now'))`,
        [
          notifId,
          `New Contact Inquiry: ${inquiryNumber}`,
          `${name.trim()} (${cleanPhone}) sent a message: "${trimmedSubject}"`,
        ]
      );
    } catch {
      // Notification insertion is best-effort
    }

    const createdInquiry = await db.queryOne<DbContactInquiry>(
      'SELECT * FROM contact_inquiries WHERE id = ?',
      [inquiryId]
    );

    return NextResponse.json(
      {
        success: true,
        inquiry: createdInquiry,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Contact inquiry submission error:', err);
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again or reach out on WhatsApp.' },
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

// ─── PATCH /api/contact (Admin Only: Status Update) ───
export async function PATCH(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminRequest(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing inquiry ID or status' }, { status: 400 });
    }

    const validStatuses = ['NEW', 'READ', 'CONTACTED', 'RESOLVED', 'ARCHIVED'];
    const upperStatus = String(status).toUpperCase();
    if (!validStatuses.includes(upperStatus)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const db = getDatabase();
    await db.execute(
      `UPDATE contact_inquiries SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      [upperStatus, id]
    );

    const updated = await db.queryOne<DbContactInquiry>(
      'SELECT * FROM contact_inquiries WHERE id = ?',
      [id]
    );

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (err: any) {
    console.error('Error updating contact inquiry:', err);
    return NextResponse.json({ error: 'Failed to update inquiry.' }, { status: 500 });
  }
}
