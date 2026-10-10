import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/db';
import { DbUser, DbCustomerSession } from '@/lib/db/types';

export const CUSTOMER_SESSION_COOKIE = 'customer_session_token';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SafeCustomerUser {
  id: string;
  role: 'CUSTOMER';
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  created_at: string;
}

/**
 * Creates a server-side session in database and returns the session token.
 */
export async function createCustomerSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const db = getDatabase();

  const expiresDate = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const expiresAt = expiresDate.toISOString().replace('T', ' ').substring(0, 19);

  await db.execute(
    'INSERT INTO customer_sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
    [token, userId, expiresAt]
  );

  return token;
}

/**
 * Extracts and verifies the customer session token against Cloudflare D1 / database.
 * Returns the authenticated user record if valid and active, null otherwise.
 */
export async function getAuthenticatedCustomer(req?: NextRequest): Promise<SafeCustomerUser | null> {
  let token: string | undefined;

  // 1. Check Bearer token in Authorization header
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // 2. Check NextRequest cookies
  if (!token && req) {
    token = req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
  }

  // 3. Check App Router cookies() store
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
    } catch {
      // cookies() unavailable in non-request contexts
    }
  }

  if (!token) {
    return null;
  }

  try {
    const db = getDatabase();
    const session = await db.queryOne<DbCustomerSession>(
      "SELECT * FROM customer_sessions WHERE id = ? AND expires_at > datetime('now')",
      [token]
    );

    if (!session) {
      return null;
    }

    const user = await db.queryOne<DbUser>(
      "SELECT id, role, name, email, phone, status, created_at FROM users WHERE id = ? AND status = 'active'",
      [session.user_id]
    );

    if (!user || user.role !== 'CUSTOMER') {
      return null;
    }

    return {
      id: user.id,
      role: 'CUSTOMER',
      name: user.name,
      email: user.email,
      phone: user.phone || null,
      status: user.status,
      created_at: user.created_at,
    };
  } catch (error) {
    console.error('Error verifying customer session:', error);
    return null;
  }
}

/**
 * Invalidates and deletes a customer session from database.
 */
export async function invalidateCustomerSession(token?: string): Promise<void> {
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
    } catch {
      // ignore
    }
  }

  if (token) {
    try {
      const db = getDatabase();
      await db.execute('DELETE FROM customer_sessions WHERE id = ?', [token]);
    } catch (error) {
      console.error('Error invalidating customer session:', error);
    }
  }
}
