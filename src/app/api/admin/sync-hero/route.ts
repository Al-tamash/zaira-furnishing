import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin';

export async function GET(req: NextRequest) {
  const isAuthed = await verifyAdminRequest(req);
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ status: 'ok' });
}
