import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminRequest,
  getAdminEmail,
  isValidAdminSecret,
  createAdminSessionToken,
} from '@/lib/auth/admin';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function GET(req: NextRequest) {
  const isAuthed = await verifyAdminRequest(req);
  return NextResponse.json({ authenticated: isAuthed });
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Rate limit: 5 attempts per 15 minutes (900 seconds)
    const rateLimit = checkRateLimit(`admin-login:${ip}`, 5, 900);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${Math.ceil(rateLimit.resetInSeconds / 60)} minutes.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetInSeconds),
          },
        }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    const validEmail = getAdminEmail().toLowerCase();
    const inputPassword = (password || body.secretKey || body.secret || '').trim();
    const inputEmail = (email || '').trim().toLowerCase();

    const isPasswordValid = isValidAdminSecret(inputPassword);
    const isEmailValid =
      !inputEmail ||
      inputEmail === validEmail ||
      inputEmail.includes('admin') ||
      inputEmail.includes('zaira') ||
      inputEmail.includes('concierge');

    if (isPasswordValid && isEmailValid) {
      // Generate cryptographically signed HMAC-SHA256 session token
      const sessionToken = await createAdminSessionToken();

      const response = NextResponse.json({
        success: true,
        user: {
          email: validEmail,
          role: 'ADMIN',
          name: 'Zaira Atelier Admin',
        },
      });

      // Set HTTP-only secure cookie containing signed session token
      response.cookies.set({
        name: 'admin_token',
        value: sessionToken,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid administrator credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_token');
  return response;
}
