import { NextResponse } from 'next/server';
import { requireUser } from '../../../../lib/api-auth';
import { PERFORMANCE_MANAGERS } from '../../../../lib/authorization';

export const runtime = 'nodejs';

export async function GET() {
  try { await requireUser(PERFORMANCE_MANAGERS); } catch (error) { if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); throw error; }
  const csv = 'employee_code,attendance_date,status,source\nEMP001,2026-08-01,PRESENT,MANUAL\n';
  return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="attendance-template.csv"', 'Cache-Control': 'no-store' } });
}
