import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest, getAdminSecret, getAdminEmail } from '@/lib/auth/admin';

export async function GET(req: NextRequest) {
  const isAuthed = await verifyAdminRequest(req);
  return NextResponse.json({ authenticated: isAuthed });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const validEmail = getAdminEmail();
    const validSecret = getAdminSecret();

    if (!validSecret) {
      console.error('Admin authentication misconfiguration: ADMIN_SECRET_KEY is not configured in the server environment.');
      return NextResponse.json(
        { error: 'Server authentication configuration error: ADMIN_SECRET_KEY is not configured.' },
        { status: 500 }
      );
    }

    const inputPassword = (password || body.secretKey || body.secret || '').trim();
    const inputEmail = (email || '').trim().toLowerCase();

    const isPasswordValid = Boolean(inputPassword && inputPassword === validSecret);
    const isEmailValid = !inputEmail || inputEmail === validEmail.toLowerCase() || inputEmail === 'admin' || inputEmail.includes('admin');

    if (isPasswordValid && isEmailValid) {
      const response = NextResponse.json({
        success: true,
        user: {
          email: validEmail,
          role: 'ADMIN',
          name: 'Zaira Atelier Admin',
        },
      });

      // Set HTTP-only secure cookie
      response.cookies.set({
        name: 'admin_token',
        value: validSecret,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid administrator credentials' }, { status: 401 });
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
