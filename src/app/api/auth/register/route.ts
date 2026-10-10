import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDatabase } from '@/lib/db';
import { DbUser } from '@/lib/db/types';
import { hashPassword } from '@/lib/auth/password';
import {
  createCustomerSession,
  CUSTOMER_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth/customer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s\-()]{7,16}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { name, email, phone, password, confirmPassword } = body;

    // 1. Validate Required Fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim().toLowerCase())) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (phone && (typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim()))) {
      return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone ? phone.trim() : null;

    const db = getDatabase();

    // 2. Check if email already exists
    const existing = await db.queryOne<DbUser>(
      'SELECT id FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 409 }
      );
    }

    // 3. Hash Password & Enforce Role CUSTOMER (Client roles are strictly rejected/ignored)
    const passwordHash = await hashPassword(password);
    const userId = `usr-${crypto.randomBytes(8).toString('hex')}`;

    await db.execute(
      `INSERT INTO users (id, role, name, email, phone, password_hash, status, created_at, updated_at)
       VALUES (?, 'CUSTOMER', ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))`,
      [userId, cleanName, cleanEmail, cleanPhone, passwordHash]
    );

    // 4. Create customer cart row in D1
    const cartId = `cart-${userId}`;
    await db.execute(
      `INSERT INTO carts (id, user_id, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))`,
      [cartId, userId]
    );

    // 5. Create Server-Side Session
    const sessionToken = await createCustomerSession(userId);

    const safeUser = {
      id: userId,
      role: 'CUSTOMER' as const,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
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
    console.error('Customer registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating your account' },
      { status: 500 }
    );
  }
}
