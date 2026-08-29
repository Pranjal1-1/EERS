import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireUser } from '../../../lib/api-auth';
import { PERFORMANCE_MANAGERS } from '../../../lib/authorization';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  let user;
  try { user = await requireUser(); } catch (error) { if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); throw error; }
  const p = new URL(request.url).searchParams;
  let employeeId = p.get('employeeId');
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try {
    if (user.role === 'EMPLOYEE') {
      const identity = await pool.query(`SELECT id FROM employees WHERE LOWER(email)=LOWER($1) AND active=true LIMIT 1`, [user.email]);
      if (!identity.rows[0]) return NextResponse.json({ error: 'Employee profile not found' }, { status: 403 });
      const ownEmployeeId = String(identity.rows[0].id);
      if (employeeId && employeeId !== ownEmployeeId) return NextResponse.json({ error: 'Employees may only view their own attendance' }, { status: 403 });
      employeeId = ownEmployeeId;
    }
    if (!employeeId) return NextResponse.json({ error: 'employeeId is required' }, { status: 422 });
    const { rows } = await pool.query(`SELECT id,employee_id,attendance_date,status,source,created_at FROM attendance_records WHERE employee_id=$1 ORDER BY attendance_date DESC`, [employeeId]);
    return NextResponse.json({ data: rows });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to load attendance' }, { status: 500 }); }
  finally { await pool.end(); }
}

export async function POST(request: Request) {
  try { await requireUser(PERFORMANCE_MANAGERS); } catch (error) { if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); throw error; }
  let body: { employeeId?: string; attendanceDate?: string; status?: string; source?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (!body.employeeId || !body.attendanceDate || !/^\d{4}-\d{2}-\d{2}$/.test(body.attendanceDate) || !body.status?.trim()) return NextResponse.json({ error: 'Employee, date and status are required' }, { status: 422 });
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try { const { rows } = await pool.query(`INSERT INTO attendance_records (employee_id,attendance_date,status,source) VALUES ($1,$2,$3,$4) ON CONFLICT (employee_id,attendance_date) DO UPDATE SET status=EXCLUDED.status,source=EXCLUDED.source RETURNING id,employee_id,attendance_date,status,source,created_at`, [body.employeeId, body.attendanceDate, body.status.trim().toUpperCase(), body.source?.trim() || 'MANUAL']); return NextResponse.json({ data: rows[0] }, { status: 201 }); }
  catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to save attendance' }, { status: 500 }); }
  finally { await pool.end(); }
}
