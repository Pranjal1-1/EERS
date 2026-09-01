import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireUser } from '../../../../lib/api-auth';
import { PERFORMANCE_MANAGERS } from '../../../../lib/authorization';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    await requireUser(PERFORMANCE_MANAGERS);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    throw error;
  }

  const cycle = new URL(request.url).searchParams.get('cycle') || new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(cycle)) {
    return NextResponse.json({ error: 'cycle must be YYYY-MM' }, { status: 422 });
  }

  const url = process.env.DATABASE_URL?.trim();
  if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });

  const [year, month] = cycle.split('-').map(Number);
  const pool = new Pool({ connectionString: url, max: 5 });

  try {
    const [employees, departments, candidates, approvals, bonuses, attendance] = await Promise.all([
      pool.query(`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active
        FROM employees
      `),
      pool.query(`
        SELECT d.name,
               COUNT(e.id) FILTER (WHERE e.status = 'ACTIVE')::int AS employee_count,
               COALESCE(AVG(ps.overall_score), 0)::numeric AS average_score
        FROM departments d
        LEFT JOIN employees e ON e.department_id = d.id
        LEFT JOIN performance_scores ps
          ON ps.employee_id = e.id
         AND ps.cycle_id = (
           SELECT id FROM performance_cycles
           WHERE cycle_year = $1 AND cycle_month = $2 AND type = 'MONTHLY'
           LIMIT 1
         )
        GROUP BY d.id, d.name
        ORDER BY d.name
      `, [year, month]),
      pool.query(`
        SELECT ps.employee_id,
               e.employee_id,
               CONCAT_WS(' ', e.first_name, e.last_name) AS employee_name,
               ps.overall_score,
               ROW_NUMBER() OVER (ORDER BY ps.overall_score DESC, e.first_name, e.last_name)::int AS rank
        FROM performance_scores ps
        JOIN employees e ON e.id = ps.employee_id
        JOIN performance_cycles pc ON pc.id = ps.cycle_id
        WHERE pc.cycle_year = $1
          AND pc.cycle_month = $2
          AND pc.type = 'MONTHLY'
          AND pc.status = 'FINALIZED'
        ORDER BY ps.overall_score DESC, e.first_name, e.last_name
        LIMIT 10
      `, [year, month]),
      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM awards a
        JOIN performance_cycles pc ON pc.id = a.cycle_id
        WHERE pc.cycle_year = $1
          AND pc.cycle_month = $2
          AND pc.type = 'MONTHLY'
          AND a.approved_by IS NULL
      `, [year, month]),
      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM bonuses b
        JOIN awards a ON a.id = b.award_id
        JOIN performance_cycles pc ON pc.id = a.cycle_id
        WHERE pc.cycle_year = $1
          AND pc.cycle_month = $2
          AND pc.type = 'MONTHLY'
          AND b.status = 'PENDING'
      `, [year, month]),
      pool.query(`
        SELECT COUNT(*) FILTER (WHERE status = 'PRESENT')::numeric AS present,
               COUNT(*)::numeric AS total
        FROM attendance
        WHERE attendance_date >= make_date($1, $2, 1)
          AND attendance_date < (make_date($1, $2, 1) + INTERVAL '1 month')
      `, [year, month])
    ]);

    const a = attendance.rows[0];
    const attendanceScore = Number(a.total) > 0 ? Number(a.present) / Number(a.total) * 100 : 0;

    return NextResponse.json({
      data: {
        cycle,
        employees: employees.rows[0],
        attendanceScore: Number(attendanceScore.toFixed(2)),
        departments: departments.rows.map((r) => ({
          name: r.name,
          employeeCount: r.employee_count,
          averageScore: Number(r.average_score)
        })),
        topCandidates: candidates.rows.map((r) => ({
          employeeId: r.employee_id,
          employeeName: r.employee_name,
          score: Number(r.overall_score),
          rank: r.rank
        })),
        pendingApprovals: approvals.rows[0].count,
        pendingBonuses: bonuses.rows[0].count
      }
    });
  } catch (error) {
    console.error('GET /api/dashboard/management failed', error);
    return NextResponse.json({ error: 'Unable to load management dashboard' }, { status: 500 });
  } finally {
    await pool.end();
  }
}
