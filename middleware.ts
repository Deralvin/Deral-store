import { NextResponse, NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  if (pathname === '/login') {
    if (token && verifyJWT(token)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!token || !verifyJWT(token)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!login|api/auth).*)'],
};
