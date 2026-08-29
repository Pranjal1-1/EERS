import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { calculateMonthlyPerformance } from '../../../../../../lib/monthly-performance-calculator';
import { requireRole } from '../../../../../../lib/api-auth';
import { PERFORMANCE_MANAGERS } from '../../../../../../lib/authorization';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try { await requireRole(PERFORMANCE_MANAGERS); } catch { return NextResponse.json({ error: 'You do not have permission to finalize monthly performance' }, { status: 403 }); }
  let body: { employeeId?: string; cycle?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (!body.employeeId || !body.cycle || !/^\d{4}-\d{2}$/.test(body.cycle)) return NextResponse.json({ error: 'Employee and valid YYYY-MM cycle are required' }, { status: 422 });
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
  try {
    const kpis = await pool.query(`SELECT r.score,k.weight FROM kpi_results r JOIN kpi_assignments a ON a.id=r.kpi_assignment_id JOIN kpi_templates k ON k.id=a.kpi_template_id WHERE a.employee_id=$1 AND a.cycle=$2 AND a.active=true`, [body.employeeId, body.cycle]);
    if (!kpis.rows.length) return NextResponse.json({ error: 'No KPI results found for this employee and cycle' }, { status: 422 });
    const attendance = await pool.query(`SELECT COUNT(*) FILTER (WHERE LOWER(status) IN ('present','p'))::numeric AS present, COUNT(*)::numeric AS total FROM attendance_records WHERE employee_id=$1 AND attendance_date >= to_date($2 || '-01','YYYY-MM-DD') AND attendance_date < (to_date($2 || '-01','YYYY-MM-DD') + INTERVAL '1 month')`, [body.employeeId, body.cycle]);
    const a = attendance.rows[0];
    const attendanceScore = Number(a.total) > 0 ? Number(a.present) / Number(a.total) * 100 : undefined;
    const reviews = await pool.query(`SELECT review_type,AVG(score)::numeric AS score FROM performance_reviews WHERE employee_id=$1 AND cycle=$2 AND status='APPROVED' GROUP BY review_type`, [body.employeeId, body.cycle]);
    const reviewMap = Object.fromEntries(reviews.rows.map(r => [String(r.review_type).toLowerCase(), Number(r.score)]));
    const calculated = calculateMonthlyPerformance({ employeeId: body.employeeId, cycle: body.cycle, kpis: kpis.rows.map(r => ({ score: Number(r.score), weight: Number(r.weight) })), attendanceScore, managerScore: reviewMap.manager, projectScore: reviewMap.project, clientScore: reviewMap.client });
    const { rows } = await pool.query(`INSERT INTO monthly_performance (employee_id,cycle,overall_score,eligible,finalized,components,weights,finalized_at) VALUES ($1,$2,$3,$4,true,$5::jsonb,$6::jsonb,now()) ON CONFLICT (employee_id,cycle) DO UPDATE SET overall_score=EXCLUDED.overall_score,eligible=EXCLUDED.eligible,finalized=true,components=EXCLUDED.components,weights=EXCLUDED.weights,finalized_at=now() RETURNING id,employee_id,cycle,overall_score,eligible,finalized,components,weights,finalized_at`, [calculated.employeeId, calculated.cycle, calculated.overallScore, calculated.eligible, JSON.stringify(calculated.components), JSON.stringify(calculated.weights)]);
    return NextResponse.json({ data: rows[0] });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to finalize monthly performance' }, { status: 500 }); }
  finally { await pool.end(); }
}
