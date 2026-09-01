import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireUser } from '../../../../lib/api-auth';
import { PERFORMANCE_MANAGERS } from '../../../../lib/authorization';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try { await requireUser(PERFORMANCE_MANAGERS); } catch (error) { if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); throw error; }
  const cycle = new URL(request.url).searchParams.get('cycle') || new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(cycle)) return NextResponse.json({ error: 'cycle must be YYYY-MM' }, { status: 422 });
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try {
    const [employees, departments, candidates, approvals, bonuses, attendance] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total,COUNT(*) FILTER (WHERE active=true)::int AS active FROM employees`),
      pool.query(`SELECT d.name,COUNT(e.id)::int AS employee_count,COALESCE(AVG(mp.overall_score),0)::numeric AS average_score FROM departments d LEFT JOIN employees e ON e.department_id=d.id AND e.active=true LEFT JOIN monthly_performance mp ON mp.employee_id=e.id AND mp.cycle=$1 GROUP BY d.id,d.name ORDER BY d.name`, [cycle]),
      pool.query(`SELECT mp.employee_id,e.employee_code,e.name AS employee_name,mp.overall_score,ROW_NUMBER() OVER (ORDER BY mp.overall_score DESC, e.name)::int AS rank FROM monthly_performance mp JOIN employees e ON e.id=mp.employee_id WHERE mp.cycle=$1 AND mp.finalized=true AND mp.eligible=true ORDER BY mp.overall_score DESC,e.name LIMIT 10`, [cycle]),
      pool.query(`SELECT COUNT(*)::int AS count FROM performance_reviews WHERE cycle=$1 AND status IN ('SUBMITTED','PENDING')`, [cycle]),
      pool.query(`SELECT COUNT(*)::int AS count FROM bonus_recommendations WHERE cycle=$1 AND status IN ('PENDING','SUBMITTED')`, [cycle]),
      pool.query(`SELECT COALESCE(COUNT(*) FILTER (WHERE LOWER(status) IN ('present','p')),0)::numeric AS present,COUNT(*)::numeric AS total FROM attendance_records WHERE attendance_date >= to_date($1 || '-01','YYYY-MM-DD') AND attendance_date < to_date($1 || '-01','YYYY-MM-DD') + INTERVAL '1 month'`, [cycle])
    ]);
    const a=attendance.rows[0]; const attendanceScore=Number(a.total)>0?Number(a.present)/Number(a.total)*100:0;
    return NextResponse.json({ data: { cycle, employees: employees.rows[0], attendanceScore:Number(attendanceScore.toFixed(2)), departments:departments.rows.map(r=>({...r,employeeCount:r.employee_count,averageScore:Number(r.average_score)})), topCandidates:candidates.rows.map(r=>({employeeId:r.employee_code||r.employee_id,employeeName:r.employee_name,score:Number(r.overall_score),rank:r.rank})), pendingApprovals:approvals.rows[0].count, pendingBonuses:bonuses.rows[0].count } });
  } catch (error) { console.error(error); return NextResponse.json({ error:'Unable to load management dashboard' }, { status:500 }); }
  finally { await pool.end(); }
}
