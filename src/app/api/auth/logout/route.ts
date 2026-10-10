import { NextRequest, NextResponse } from 'next/server';
import {
  CUSTOMER_SESSION_COOKIE,
  invalidateCustomerSession,
} from '@/lib/auth/customer';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
    if (token) {
      await invalidateCustomerSession(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete(CUSTOMER_SESSION_COOKIE);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ success: true });
    response.cookies.delete(CUSTOMER_SESSION_COOKIE);
    return response;
  }
}
