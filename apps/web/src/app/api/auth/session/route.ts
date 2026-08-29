import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/session';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('eers_session')?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  const user = verifySessionToken(token);
  if (!user) {
    const response = NextResponse.json({ authenticated: false }, { status: 401 });
    response.cookies.delete('eers_session');
    return response;
  }

  return NextResponse.json({ authenticated: true, user });
}
