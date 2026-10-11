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

  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: ADMIN_SECRET_KEY is not configured in production environment variables.');
  }

  // Fallback for local development if not set in .env
  return 'Zaira@Admin2026';
}

function getSigningSecret(): string {
  const customSignSecret = cleanSecret(process.env.ADMIN_SESSION_SECRET);
  if (customSignSecret) return customSignSecret;
  return `${getAdminSecret()}:zaira_admin_session_v1`;
}

// Universal Base64URL encoding/decoding compatible with Edge & Node.js
function toBase64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token with a 7-day expiration.
 * The raw admin secret is never stored inside the token or cookie.
 */
export async function createAdminSessionToken(): Promise<string> {
  const secret = getSigningSecret();
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const payload = JSON.stringify({
    role: 'ADMIN',
    email: ADMIN_EMAIL,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  });

  const encodedPayload = toBase64Url(enc.encode(payload));
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(encodedPayload));
  const signature = toBase64Url(signatureBuffer);

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies an admin HMAC-SHA256 session token.
 * Validates expiration, role, and cryptographic signature.
 */
export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || !token.includes('.')) return false;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return false;

  try {
    const secret = getSigningSecret();
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = fromBase64Url(signature);
    const isValidSig = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      enc.encode(encodedPayload)
    );
    if (!isValidSig) return false;

    const payloadJson = new TextDecoder().decode(fromBase64Url(encodedPayload));
    const payload = JSON.parse(payloadJson);

    if (payload.role !== 'ADMIN') return false;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
      return false; // Expired
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates whether raw input matches the configured admin secret.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function isValidAdminSecret(input: string | undefined | null): boolean {
  if (!input) return false;
  const trimmed = input.trim().replace(/^['"]|['"]$/g, '').trim();
  const configured = getAdminSecret();

  if (trimmed.length !== configured.length) {
    return false;
  }

  // Constant-time character comparison
  let diff = 0;
  for (let i = 0; i < trimmed.length; i++) {
    diff |= trimmed.charCodeAt(i) ^ configured.charCodeAt(i);
  }
  return diff === 0;
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
    if (adminKey && (isValidAdminSecret(adminKey) || (await verifyAdminSessionToken(adminKey)))) {
      return true;
    }

    // 2. Check Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (isValidAdminSecret(token) || (await verifyAdminSessionToken(token))) {
        return true;
      }
    }
  }

  // 3. Check admin_token cookie (for Next.js App Router Server Components & Actions)
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (token) {
      if (await verifyAdminSessionToken(token)) {
        return true;
      }
      // Support transition for existing sessions matching secret
      if (isValidAdminSecret(token)) {
        return true;
      }
    }
  } catch {
    // cookies() unavailable in non-request contexts
  }

  return false;
}
