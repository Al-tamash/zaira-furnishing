import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSessionToken, isValidAdminSecret } from '@/lib/auth/admin';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = req.cookies.get('admin_token')?.value;

    if (!adminToken) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isValidSession = await verifyAdminSessionToken(adminToken);
    const isLegacySecret = !isValidSession && isValidAdminSecret(adminToken);

    if (!isValidSession && !isLegacySecret) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('admin_token');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
