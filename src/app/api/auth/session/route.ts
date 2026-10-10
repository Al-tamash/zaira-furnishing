import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedCustomer } from '@/lib/auth/customer';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedCustomer(req);

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
