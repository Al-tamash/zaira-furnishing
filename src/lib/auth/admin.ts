import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = 'concierge@zairafurnishing.com';

export function getAdminSecret(): string | null {
  const secret = process.env.ADMIN_SECRET_KEY || process.env.AUTH_SECRET;
  return secret?.trim() || null;
}

export function getAdminEmail(): string {
  return ADMIN_EMAIL;
}

/**
 * Validates whether a request comes from an authenticated administrator.
 * Checks Bearer token, x-admin-key header, or admin_token cookie.
 */
export async function verifyAdminRequest(req?: NextRequest): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) {
    return false;
  }

  // 1. Check x-admin-key header
  if (req) {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey && adminKey === secret) {
      return true;
    }

    // 2. Check Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token === secret) {
        return true;
      }
    }
  }

  // 3. Check admin_token cookie (for Next.js App Router Server Components & Actions)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (token && token === secret) {
      return true;
    }
  } catch {
    // cookies() unavailable in non-request contexts
  }

  return false;
}
