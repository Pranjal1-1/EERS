import { NextResponse } from 'next/server';
import { Pool } from 'pg';
export const runtime = 'nodejs';

export async function GET() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try {
    const { rows } = await pool.query(`SELECT id,name,is_active,created_at FROM departments WHERE is_active=true ORDER BY name`);
    return NextResponse.json({ data: rows });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to load departments' }, { status: 500 }); }
  finally { await pool.end(); }
}

export async function POST(request: Request) {
  let body: { name?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const name = body.name?.trim();
  if (!name || name.length > 100) return NextResponse.json({ error: 'Department name is required and must be <= 100 characters' }, { status: 422 });
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try {
    const { rows } = await pool.query(`INSERT INTO departments (name) VALUES ($1) RETURNING id,name,is_active,created_at`, [name]);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (error: any) {
    if (error?.code === '23505') return NextResponse.json({ error: 'Department already exists' }, { status: 409 });
    console.error(error); return NextResponse.json({ error: 'Unable to create department' }, { status: 500 });
  } finally { await pool.end(); }
}
