import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from './src/lib/session';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('eers_session')?.value;
  const session = token ? verifySessionToken(token) : null;
  const pathname = request.nextUrl.pathname;

  if (pathname === '/login' || pathname.startsWith('/api/auth/')) return NextResponse.next();

  if (!session) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const headers = new Headers(request.headers);
  headers.set('x-eers-user-id', session.id);
  headers.set('x-eers-user-role', session.role);
  headers.set('x-eers-user-email', session.email);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
