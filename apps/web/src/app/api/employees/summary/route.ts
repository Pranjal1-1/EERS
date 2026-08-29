import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const runtime = 'nodejs';

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: databaseUrl, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
  try {
    const { rows } = await pool.query(`SELECT d.id, d.name, COUNT(e.id)::int AS employee_count FROM departments d LEFT JOIN employees e ON e.department_id=d.id AND e.active=true WHERE d.active=true GROUP BY d.id, d.name ORDER BY d.name`);
    const total = rows.reduce((sum, row) => sum + row.employee_count, 0);
    return NextResponse.json({ data: rows, total });
  } catch (error) {
    console.error('GET /api/employees/summary failed', error);
    return NextResponse.json({ error: 'Unable to load employee summary' }, { status: 500 });
  } finally { await pool.end(); }
}
