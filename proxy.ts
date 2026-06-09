import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * Verify JWT from cookies or Authorization header.
 * Returns decoded payload or null.
 */
export function verifyRequestToken(request: NextRequest) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return null;

  const token =
    request.cookies.get('token')?.value ||
    request.cookies.get('authToken')?.value ||
    request.headers.get('authorization')?.split(' ')[1];

  if (!token) return null;

  try {
    return jwt.verify(token, jwtSecret) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

/**
 * Next.js middleware — protects routes and handles redirects.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasJwtSecret = Boolean(process.env.JWT_SECRET);
  const payload = verifyRequestToken(request);

  // Public routes — always allow
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    // If already logged in and visiting /login, redirect to dashboard
    if (pathname === '/login' && payload) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Allow public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/favicon') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Protected routes — require valid token
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    if (!hasJwtSecret) {
      loginUrl.searchParams.set('error', 'server_config');
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/partnerships/:path*',
    '/email/:path*',
    '/partners/:path*',
    '/interactions/:path*',
    '/activity-log/:path*',
    '/settings/:path*',
    '/search/:path*',
    '/admin/:path*',
    '/login',
  ],
};
