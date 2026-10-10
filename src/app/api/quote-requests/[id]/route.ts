import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getAuthenticatedCustomer } from '@/lib/auth/customer';
import { DbQuoteRequest, QuoteRequestStatus } from '@/lib/db/types';

const VALID_STATUSES: QuoteRequestStatus[] = ['NEW', 'CONTACTED', 'QUOTED', 'CLOSED', 'CANCELLED'];

// ─── GET /api/quote-requests/[id] ───
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();

    const quoteRequest = await db.queryOne<DbQuoteRequest>(
      'SELECT * FROM quote_requests WHERE id = ? OR request_number = ?',
      [id, id]
    );

    if (!quoteRequest) {
      return NextResponse.json({ error: 'Quote request not found' }, { status: 404 });
    }

    const isAdmin = await verifyAdminRequest(req);
    const customer = await getAuthenticatedCustomer(req);

    // Customer Isolation Check: Admin can see all; customer can ONLY see their own
    if (!isAdmin) {
      if (!customer || customer.id !== quoteRequest.user_id) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to view this quote request' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ quoteRequest });
  } catch (err: any) {
    console.error('Error fetching quote request detail:', err);
    return NextResponse.json({ error: 'Failed to retrieve quote request' }, { status: 500 });
  }
}

// ─── PATCH /api/quote-requests/[id] (Admin Only) ───
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminRequest(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required to update quote requests' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status, customerNotes } = body;

    const db = getDatabase();
    const existing = await db.queryOne<DbQuoteRequest>(
      'SELECT * FROM quote_requests WHERE id = ? OR request_number = ?',
      [id, id]
    );

    if (!existing) {
      return NextResponse.json({ error: 'Quote request not found' }, { status: 404 });
    }

    let updatedStatus = existing.status;
    if (status) {
      const upperStatus = status.toString().toUpperCase() as QuoteRequestStatus;
      if (!VALID_STATUSES.includes(upperStatus)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      updatedStatus = upperStatus;
    }

    const updatedNotes = customerNotes !== undefined ? customerNotes : existing.customer_notes;

    // Execute update on status, notes, updated_at (historical snapshots are untouched!)
    await db.execute(
      `UPDATE quote_requests
       SET status = ?, customer_notes = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [updatedStatus, updatedNotes, existing.id]
    );

    const updatedRecord = await db.queryOne<DbQuoteRequest>(
      'SELECT * FROM quote_requests WHERE id = ?',
      [existing.id]
    );

    return NextResponse.json({ success: true, quoteRequest: updatedRecord });
  } catch (err: any) {
    console.error('Error updating quote request:', err);
    return NextResponse.json({ error: 'Failed to update quote request' }, { status: 500 });
  }
}
