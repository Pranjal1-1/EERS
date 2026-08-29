import { NextResponse } from 'next/server';
import { Pool } from 'pg';
export const runtime = 'nodejs';

async function getPool() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error('DATABASE_URL is required');
  return new Pool({ connectionString: url, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
}

export async function GET(request: Request) {
  const departmentId = new URL(request.url).searchParams.get('departmentId');
  let pool: Pool | undefined;
  try {
    pool = await getPool();
    const { rows } = await pool.query(`SELECT k.id,k.department_id,k.name,k.target,k.weight,k.active,d.name AS department FROM kpi_templates k JOIN departments d ON d.id=k.department_id WHERE ($1::uuid IS NULL OR k.department_id=$1) ORDER BY d.name,k.name`, [departmentId || null]);
    return NextResponse.json({ data: rows });
  } catch (error) { console.error(error); return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load KPIs' }, { status: 500 }); }
  finally { await pool?.end(); }
}

export async function POST(request: Request) {
  let body: { departmentId?: string; name?: string; target?: number; weight?: number };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const name = body.name?.trim();
  if (!body.departmentId || !name || name.length > 150) return NextResponse.json({ error: 'Department and KPI name are required' }, { status: 422 });
  if (!Number.isFinite(body.target) || (body.target as number) < 0) return NextResponse.json({ error: 'Target must be non-negative' }, { status: 422 });
  if (!Number.isFinite(body.weight) || (body.weight as number) < 0 || (body.weight as number) > 100) return NextResponse.json({ error: 'Weight must be between 0 and 100' }, { status: 422 });
  let pool: Pool | undefined;
  try {
    pool = await getPool();
    const { rows } = await pool.query(`INSERT INTO kpi_templates (department_id,name,target,weight) VALUES ($1,$2,$3,$4) RETURNING id,department_id,name,target,weight,active,created_at`, [body.departmentId, name, body.target, body.weight]);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (error: any) {
    if (error?.code === '23503') return NextResponse.json({ error: 'Department does not exist' }, { status: 422 });
    console.error(error); return NextResponse.json({ error: 'Unable to create KPI' }, { status: 500 });
  } finally { await pool?.end(); }
}
