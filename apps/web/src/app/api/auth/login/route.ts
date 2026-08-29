import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { verifyPassword } from '@/lib/auth';
import { createSessionToken } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const email = body.email?.trim().toLowerCase();
  if (!email || !body.password) return NextResponse.json({ error: 'Email and password are required' }, { status: 422 });
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try {
    const { rows } = await pool.query(`SELECT id,email,password_hash,role FROM users WHERE LOWER(email)=LOWER($1) AND active=true LIMIT 1`, [email]);
    const user = rows[0];
    if (!user || !verifyPassword(body.password, user.password_hash)) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    const token = createSessionToken({ id: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({ data: { id: user.id, email: user.email, role: user.role } });
    response.cookies.set('eers_session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 8 * 60 * 60 });
    return response;
  } catch (error) { console.error('login failed', error); return NextResponse.json({ error: 'Unable to sign in' }, { status: 500 }); }
  finally { await pool.end(); }
}
