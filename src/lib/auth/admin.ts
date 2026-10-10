import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = 'concierge@zairafurnishing.com';

function cleanSecret(val: string | undefined): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  // Strip accidental enclosing single or double quotes
  return trimmed.replace(/^['"]|['"]$/g, '').trim() || null;
}

export function getAdminSecret(): string {
  const secretKey = cleanSecret(process.env.ADMIN_SECRET_KEY);
  if (secretKey) return secretKey;

  const authSecret = cleanSecret(process.env.AUTH_SECRET);
  if (authSecret) return authSecret;

  // Fallback master secret to prevent complete lockout
  return 'Zaira@Admin2026';
}

export function isValidAdminSecret(input: string | undefined | null): boolean {
  if (!input) return false;
  const trimmed = input.trim().replace(/^['"]|['"]$/g, '').trim();
  const configured = getAdminSecret();

  // Accept configured secret, or standard keys Zaira@Admin2026 / Zaira@Owner2026
  return (
    trimmed === configured ||
    trimmed === 'Zaira@Admin2026' ||
    trimmed === 'Zaira@Owner2026' ||
    (Boolean(process.env.AUTH_SECRET) && trimmed === cleanSecret(process.env.AUTH_SECRET))
  );
}

export function getAdminEmail(): string {
  return ADMIN_EMAIL;
}

/**
 * Validates whether a request comes from an authenticated administrator.
 * Checks Bearer token, x-admin-key header, or admin_token cookie.
 */
export async function verifyAdminRequest(req?: NextRequest): Promise<boolean> {
  // 1. Check x-admin-key header
  if (req) {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey && isValidAdminSecret(adminKey)) {
      return true;
    }

    // 2. Check Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (isValidAdminSecret(token)) {
        return true;
      }
    }
  }

  // 3. Check admin_token cookie (for Next.js App Router Server Components & Actions)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (token && isValidAdminSecret(token)) {
      return true;
    }
  } catch {
    // cookies() unavailable in non-request contexts
  }

  return false;
}
