import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getAuthenticatedUser, requireUser } from '../../../lib/api-auth';
import { PERFORMANCE_MANAGERS } from '../../../lib/authorization';
export const runtime = 'nodejs';

function scoreAchievement(target: number, achieved: number) {
  if (target <= 0) return achieved >= 0 ? 100 : 0;
  return Math.min(100, Math.max(0, (achieved / target) * 100));
}

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams; const employeeId = p.get('employeeId'); const cycle = p.get('cycle');
  if (!employeeId || !cycle || !/^\d{4}-\d{2}$/.test(cycle)) return NextResponse.json({ error: 'employeeId and valid YYYY-MM cycle are required' }, { status: 422 });
  const user = await getAuthenticatedUser();
  const allowed = user && PERFORMANCE_MANAGERS.includes(user.role);
  if (!allowed && user?.id !== employeeId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try {
    const { rows } = await pool.query(`SELECT a.id,a.kpi_template_id,a.target,k.name,k.weight,r.achieved,r.score,r.updated_at FROM kpi_assignments a JOIN kpi_templates k ON k.id=a.kpi_template_id LEFT JOIN kpi_results r ON r.kpi_assignment_id=a.id WHERE a.employee_id=$1 AND a.cycle=$2 ORDER BY k.name`, [employeeId, cycle]);
    return NextResponse.json({ data: rows });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to load KPI results' }, { status: 500 }); } finally { await pool.end(); }
}

export async function POST(request: Request) {
  const actor = await requireUser(PERFORMANCE_MANAGERS).catch(() => null);
  if (!actor) return NextResponse.json({ error: 'Performance manager authorization required' }, { status: 403 });
  let body: { kpiAssignmentId?: string; achieved?: number };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (!body.kpiAssignmentId || !Number.isFinite(body.achieved) || (body.achieved as number) < 0) return NextResponse.json({ error: 'KPI assignment and non-negative achieved value are required' }, { status: 422 });
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try {
    const { rows } = await pool.query(`INSERT INTO kpi_results (kpi_assignment_id,achieved,score) SELECT a.id,$2,LEAST(100,GREATEST(0,CASE WHEN a.target<=0 THEN 100 ELSE ($2/a.target)*100 END)) FROM kpi_assignments a JOIN employees e ON e.id=a.employee_id WHERE a.id=$1 AND e.active=true RETURNING id,kpi_assignment_id,achieved,score,updated_at`, [body.kpiAssignmentId, body.achieved]);
    if (!rows[0]) return NextResponse.json({ error: 'KPI assignment not found or employee inactive' }, { status: 422 });
    await pool.query(`INSERT INTO audit_events (action,actor_user_id,target_type,target_id,metadata) VALUES ('KPI_RESULT_UPDATED',$1,'KPI_RESULT',$2,$3::jsonb)`, [actor.id, rows[0].id, JSON.stringify({ achieved: body.achieved, score: rows[0].score })]);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to save KPI result. Ensure the KPI results migration has been applied.' }, { status: 500 }); } finally { await pool.end(); }
}
