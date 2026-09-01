import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireUser } from '../../../../lib/api-auth';
import { PERFORMANCE_MANAGERS } from '../../../../lib/authorization';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  let user;
  try { user = await requireUser(); } catch (e) { if (e instanceof Error && e.message === 'UNAUTHORIZED') return NextResponse.json({error:'Unauthorized'},{status:401}); throw e; }
  const p=new URL(request.url).searchParams; const requested=p.get('employeeId'); const cycle=p.get('cycle') || new Date().toISOString().slice(0,7);
  if (!/^\d{4}-\d{2}$/.test(cycle)) return NextResponse.json({error:'cycle must be YYYY-MM'},{status:422});
  const url=process.env.DATABASE_URL?.trim(); if(!url) return NextResponse.json({error:'DATABASE_URL is required'},{status:503});
  const pool=new Pool({connectionString:url,max:5});
  try {
    let employeeId=requested;
    if (user.role==='EMPLOYEE') {
      const own=await pool.query(`SELECT id FROM employees WHERE LOWER(email)=LOWER($1) AND active=true LIMIT 1`,[user.email]);
      if(!own.rows[0]) return NextResponse.json({error:'Employee profile not found'},{status:403});
      employeeId=String(own.rows[0].id);
      if(requested && requested!==employeeId) return NextResponse.json({error:'Employees may only view their own performance'},{status:403});
    } else if (!PERFORMANCE_MANAGERS.includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403});
    if(!employeeId) return NextResponse.json({error:'employeeId is required'},{status:422});
    const employee=await pool.query(`SELECT e.id,e.employee_code,e.name,e.email,e.active,d.name AS department FROM employees e LEFT JOIN departments d ON d.id=e.department_id WHERE e.id=$1`,[employeeId]);
    if(!employee.rows[0]) return NextResponse.json({error:'Employee not found'},{status:404});
    const [kpis,attendance,reviews,current,history]=await Promise.all([
      pool.query(`SELECT a.id,a.cycle,a.target,k.name,k.weight,r.achieved,r.score FROM kpi_assignments a JOIN kpi_templates k ON k.id=a.kpi_template_id LEFT JOIN kpi_results r ON r.kpi_assignment_id=a.id WHERE a.employee_id=$1 AND a.cycle=$2 ORDER BY k.name`,[employeeId,cycle]),
      pool.query(`SELECT COUNT(*) FILTER(WHERE LOWER(status) IN ('present','p'))::numeric present,COUNT(*)::numeric total,COUNT(*) FILTER(WHERE LOWER(status) IN ('absent','a'))::numeric absent,COUNT(*) FILTER(WHERE LOWER(status) IN ('leave','l'))::numeric leave FROM attendance_records WHERE employee_id=$1 AND attendance_date>=to_date($2||'-01','YYYY-MM-DD') AND attendance_date<to_date($2||'-01','YYYY-MM-DD')+INTERVAL '1 month'`,[employeeId,cycle]),
      pool.query(`SELECT review_type,AVG(score)::numeric score,COUNT(*)::int count FROM performance_reviews WHERE employee_id=$1 AND cycle=$2 GROUP BY review_type ORDER BY review_type`,[employeeId,cycle]),
      pool.query(`SELECT id,cycle,overall_score,eligible,finalized,components,weights,finalized_at FROM monthly_performance WHERE employee_id=$1 AND cycle=$2`,[employeeId,cycle]),
      pool.query(`SELECT cycle,overall_score,eligible,finalized FROM monthly_performance WHERE employee_id=$1 ORDER BY cycle DESC LIMIT 12`,[employeeId])
    ]);
    const a=attendance.rows[0]; const attendanceScore=Number(a.total)>0?Number(a.present)/Number(a.total)*100:null;
    const mappedKpis = kpis.rows.map((r: any) => ({
      ...r,
      target: Number(r.target),
      weight: Number(r.weight),
      achieved: r.achieved === null ? null : Number(r.achieved),
      score: r.score === null ? null : Number(r.score),
    }));
    const mappedAttendance = {
      present: Number(a.present || 0),
      absent: Number(a.absent || 0),
      leave: Number(a.leave || 0),
      total: Number(a.total || 0),
      score: attendanceScore === null ? null : Number(attendanceScore.toFixed(2)),
    };
    const mappedReviews = reviews.rows.map((r: any) => ({
      ...r,
      score: Number(r.score),
    }));

    return NextResponse.json({
      data: {
        employee: employee.rows[0],
        cycle,
        kpis: mappedKpis,
        attendance: mappedAttendance,
        reviews: mappedReviews,
        monthlyPerformance: current.rows[0] || null,
        history: history.rows,
      },
    });
  } catch(e){console.error(e);return NextResponse.json({error:'Unable to load employee performance'},{status:500});} finally{await pool.end();}
}
