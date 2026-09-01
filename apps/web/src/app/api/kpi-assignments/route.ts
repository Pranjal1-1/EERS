import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getAuthenticatedRole } from '../../../lib/api-auth';
import { PERFORMANCE_MANAGERS } from '../../../lib/authorization';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const role = await getAuthenticatedRole();
  const params = new URL(request.url).searchParams;
  const employeeId = params.get('employeeId'); const cycle = params.get('cycle');
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!employeeId || !cycle || !/^\d{4}-\d{2}$/.test(cycle)) return NextResponse.json({ error: 'employeeId and valid YYYY-MM cycle are required' }, { status: 422 });
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try {
    const { rows } = await pool.query(`SELECT a.id,a.employee_id,a.kpi_template_id,a.cycle,a.target,a.active,k.name,k.weight FROM kpi_assignments a JOIN kpi_templates k ON k.id=a.kpi_template_id WHERE a.employee_id=$1 AND a.cycle=$2 ORDER BY k.name`, [employeeId, cycle]);
    return NextResponse.json({ data: rows });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to load KPI assignments' }, { status: 500 }); } finally { await pool.end(); }
}

export async function POST(request: Request) {
  const role = await getAuthenticatedRole();
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!PERFORMANCE_MANAGERS.includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let body: { employeeId?: string; kpiTemplateId?: string; cycle?: string; target?: number };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (!body.employeeId || !body.kpiTemplateId || !body.cycle || !/^\d{4}-\d{2}$/.test(body.cycle)) return NextResponse.json({ error: 'Employee, KPI and valid cycle are required' }, { status: 422 });
  if (body.target !== undefined && (!Number.isFinite(body.target) || body.target < 0)) return NextResponse.json({ error: 'Target must be non-negative' }, { status: 422 });
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try {
    const { rows } = await pool.query(`INSERT INTO kpi_assignments (employee_id,kpi_template_id,cycle,target) SELECT $1,$2,$3,COALESCE($4,k.target) FROM kpi_templates k JOIN employees e ON e.department_id=k.department_id WHERE k.id=$2 AND e.id=$1 AND e.active=true RETURNING id,employee_id,kpi_template_id,cycle,target,active`, [body.employeeId, body.kpiTemplateId, body.cycle, body.target ?? null]);
    if (!rows[0]) return NextResponse.json({ error: 'Employee or KPI not found, inactive, or KPI belongs to another department' }, { status: 422 });
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (error: any) {
    if (error?.code === '23505') return NextResponse.json({ error: 'KPI is already assigned for this employee and cycle' }, { status: 409 });
    console.error(error); return NextResponse.json({ error: 'Unable to assign KPI' }, { status: 500 });
  } finally { await pool.end(); }
}
