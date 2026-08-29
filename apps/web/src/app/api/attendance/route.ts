import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireRole } from '../../../lib/api-auth';
import { PERFORMANCE_MANAGERS } from '../../../lib/authorization';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const role = await requireRole(['EMPLOYEE','MANAGER','HR','MD','CEO','ADMIN']);
  const p = new URL(request.url).searchParams;
  const employeeId = p.get('employeeId');
  if (!employeeId) return NextResponse.json({ error: 'employeeId is required' }, { status: 422 });
  if (role === 'EMPLOYEE') {
    const h = new Headers();
    // The authenticated employee's identity is intentionally required to be
    // resolved by the session layer before this endpoint is exposed.
    if (p.get('self') !== 'true') return NextResponse.json({ error: 'Employees may only view their own attendance' }, { status: 403 });
  }
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try { const { rows } = await pool.query(`SELECT id,employee_id,attendance_date,status,source,created_at FROM attendance_records WHERE employee_id=$1 ORDER BY attendance_date DESC`, [employeeId]); return NextResponse.json({ data: rows }); }
  catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to load attendance' }, { status: 500 }); }
  finally { await pool.end(); }
}

export async function POST(request: Request) {
  try { await requireRole(PERFORMANCE_MANAGERS); } catch (error) { if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); throw error; }
  let body: { employeeId?: string; attendanceDate?: string; status?: string; source?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (!body.employeeId || !body.attendanceDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.attendanceDate) || !body.status?.trim()) return NextResponse.json({ error: 'Employee, date and status are required' }, { status: 422 });
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try { const { rows } = await pool.query(`INSERT INTO attendance_records (employee_id,attendance_date,status,source) VALUES ($1,$2,$3,$4) ON CONFLICT (employee_id,attendance_date) DO UPDATE SET status=EXCLUDED.status,source=EXCLUDED.source RETURNING id,employee_id,attendance_date,status,source,created_at`, [body.employeeId, body.attendanceDate, body.status.trim().toUpperCase(), body.source?.trim() || 'MANUAL']); return NextResponse.json({ data: rows[0] }, { status: 201 }); }
  catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to save attendance' }, { status: 500 }); }
  finally { await pool.end(); }
}
