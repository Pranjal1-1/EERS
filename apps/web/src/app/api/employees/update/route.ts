import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireRole } from '../../../../lib/api-auth';
import { EERSRole } from '../../../../lib/authorization';

export const runtime = 'nodejs';
const EMPLOYEE_ADMIN_ROLES: EERSRole[] = ['HR', 'MD', 'CEO', 'ADMIN'];

export async function PATCH(request: Request) {
  try { await requireRole(EMPLOYEE_ADMIN_ROLES); }
  catch { return NextResponse.json({ error: 'You do not have permission to update employee records' }, { status: 403 }); }
  let body: { id?: string; name?: string; email?: string; jobTitle?: string; departmentId?: string; active?: boolean };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (!body.id) return NextResponse.json({ error: 'Employee id is required' }, { status: 422 });
  if (body.name !== undefined && (!body.name.trim() || body.name.trim().length > 150)) return NextResponse.json({ error: 'Invalid employee name' }, { status: 422 });
  if (body.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return NextResponse.json({ error: 'Invalid email' }, { status: 422 });
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try {
    const result = await pool.query(`UPDATE employees SET name=COALESCE($2,name), email=COALESCE($3,email), job_title=COALESCE($4,job_title), department_id=COALESCE($5,department_id), active=COALESCE($6,active), updated_at=now() WHERE id=$1 RETURNING id,employee_code,name,email,job_title,department_id,active,updated_at`, [body.id, body.name?.trim() ?? null, body.email?.trim().toLowerCase() ?? null, body.jobTitle?.trim() ?? null, body.departmentId ?? null, body.active ?? null]);
    if (!result.rows[0]) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    return NextResponse.json({ data: result.rows[0] });
  } catch (error: any) {
    if (error?.code === '23505') return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    if (error?.code === '23503') return NextResponse.json({ error: 'Department does not exist' }, { status: 422 });
    console.error(error); return NextResponse.json({ error: 'Unable to update employee' }, { status: 500 });
  } finally { await pool.end(); }
}
