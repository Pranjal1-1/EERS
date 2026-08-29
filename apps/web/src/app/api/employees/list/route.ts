import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = 'nodejs';

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: databaseUrl, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
  try {
    const { rows } = await pool.query(`SELECT e.id, e.employee_code, e.name, e.email, e.job_title, e.active, d.name AS department FROM employees e JOIN departments d ON d.id=e.department_id ORDER BY e.name`);
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('GET /api/employees/list failed', error);
    return NextResponse.json({ error: 'Unable to load employee directory' }, { status: 500 });
  } finally { await pool.end(); }
}
