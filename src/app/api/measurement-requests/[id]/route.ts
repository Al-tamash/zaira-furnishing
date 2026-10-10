import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getAuthenticatedCustomer } from '@/lib/auth/customer';
import { DbMeasurementRequest, MeasurementRequestStatus } from '@/lib/db/types';

const VALID_STATUSES: MeasurementRequestStatus[] = [
  'NEW',
  'CONTACTED',
  'SCHEDULED',
  'COMPLETED',
  'CANCELLED',
];

// ─── GET /api/measurement-requests/[id] ───
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();

    const measurementRequest = await db.queryOne<DbMeasurementRequest>(
      'SELECT * FROM measurement_requests WHERE id = ? OR request_number = ?',
      [id, id]
    );

    if (!measurementRequest) {
      return NextResponse.json({ error: 'Measurement request not found' }, { status: 404 });
    }

    const isAdmin = await verifyAdminRequest(req);
    const customer = await getAuthenticatedCustomer(req);

    // Customer Isolation Check: Admin can view any; customer can ONLY view their own
    if (!isAdmin) {
      if (!customer || customer.id !== measurementRequest.user_id) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have permission to view this measurement request' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ measurementRequest });
  } catch (err: any) {
    console.error('Error fetching measurement request detail:', err);
    return NextResponse.json({ error: 'Failed to retrieve measurement request' }, { status: 500 });
  }
}

// ─── PATCH /api/measurement-requests/[id] (Admin Only) ───
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await verifyAdminRequest(req);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required to update measurement requests' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status, customerNotes } = body;

    const db = getDatabase();
    const existing = await db.queryOne<DbMeasurementRequest>(
      'SELECT * FROM measurement_requests WHERE id = ? OR request_number = ?',
      [id, id]
    );

    if (!existing) {
      return NextResponse.json({ error: 'Measurement request not found' }, { status: 404 });
    }

    let updatedStatus = existing.status;
    if (status) {
      const upperStatus = status.toString().toUpperCase() as MeasurementRequestStatus;
      if (!VALID_STATUSES.includes(upperStatus)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      updatedStatus = upperStatus;
    }

    const updatedNotes = customerNotes !== undefined ? customerNotes : existing.customer_notes;

    // Historical snapshot cannot be modified, only status, customer notes, updated_at
    await db.execute(
      `UPDATE measurement_requests
       SET status = ?, customer_notes = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [updatedStatus, updatedNotes, existing.id]
    );

    const updatedRecord = await db.queryOne<DbMeasurementRequest>(
      'SELECT * FROM measurement_requests WHERE id = ?',
      [existing.id]
    );

    return NextResponse.json({
      message: 'Measurement request updated successfully',
      measurementRequest: updatedRecord,
    });
  } catch (err: any) {
    console.error('Error updating measurement request:', err);
    return NextResponse.json({ error: 'Failed to update measurement request' }, { status: 500 });
  }
}
