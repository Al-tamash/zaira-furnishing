import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { DbUser } from '@/lib/db/types';
import { verifyPassword } from '@/lib/auth/password';
import {
  createCustomerSession,
  CUSTOMER_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth/customer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDatabase();

    const user = await db.queryOne<DbUser>(
      'SELECT * FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (!user || !user.password_hash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'This account has been deactivated. Please contact concierge.' },
        { status: 403 }
      );
    }

    // Only authenticate CUSTOMER accounts through this customer login endpoint
    if (user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Invalid customer credentials' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Ensure customer has a cart record
    const cart = await db.queryOne<{ id: string }>('SELECT id FROM carts WHERE user_id = ?', [user.id]);
    if (!cart) {
      await db.execute(
        `INSERT INTO carts (id, user_id, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))`,
        [`cart-${user.id}`, user.id]
      );
    }

    // Create secure server session
    const sessionToken = await createCustomerSession(user.id);

    const safeUser = {
      id: user.id,
      role: 'CUSTOMER' as const,
      name: user.name,
      email: user.email,
      phone: user.phone || null,
    };

    const response = NextResponse.json({
      success: true,
      user: safeUser,
    });

    response.cookies.set({
      name: CUSTOMER_SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
