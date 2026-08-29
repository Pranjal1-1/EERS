import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireUser } from '../../../../lib/api-auth';
import { EERSRole } from '../../../../lib/authorization';

export const runtime = 'nodejs';
const MANAGEMENT: EERSRole[] = ['MANAGER', 'HR', 'MD', 'CEO', 'ADMIN'];
const APPROVERS: EERSRole[] = ['HR', 'MD', 'CEO', 'ADMIN'];

export async function GET(request: Request) {
  const user = await requireUser();
  const p = new URL(request.url).searchParams;
  const employeeId = p.get('employeeId'); const cycle = p.get('cycle');
  if (!cycle || !/^\d{4}-\d{2}$/.test(cycle)) return NextResponse.json({ error: 'Valid YYYY-MM cycle is required' }, { status: 422 });
  if (user.role === 'EMPLOYEE' && employeeId !== user.id) return NextResponse.json({ error: 'You can only view your own reviews' }, { status: 403 });
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try {
    const query = employeeId ? `SELECT r.id,r.employee_id,r.reviewer_id,r.review_type,r.cycle,r.score,r.comment,r.evidence,r.status,r.created_at,r.updated_at,u.email AS reviewer_email FROM performance_reviews r JOIN users u ON u.id=r.reviewer_id WHERE r.employee_id=$1 AND r.cycle=$2 ORDER BY r.created_at DESC` : `SELECT r.id,r.employee_id,r.reviewer_id,r.review_type,r.cycle,r.score,r.comment,r.evidence,r.status,r.created_at,r.updated_at,u.email AS reviewer_email FROM performance_reviews r JOIN users u ON u.id=r.reviewer_id WHERE r.cycle=$1 ORDER BY r.created_at DESC`;
    const params = employeeId ? [employeeId, cycle] : [cycle];
    const { rows } = await pool.query(query, params);
    return NextResponse.json({ data: rows });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to load performance reviews' }, { status: 500 }); }
  finally { await pool.end(); }
}

export async function POST(request: Request) {
  const user = await requireUser(MANAGEMENT);
  let body: { employeeId?: string; reviewType?: 'MANAGER'|'PROJECT'|'CLIENT'; cycle?: string; score?: number; comment?: string; evidence?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (!body.employeeId || !body.reviewType || !body.cycle || !/^\d{4}-\d{2}$/.test(body.cycle)) return NextResponse.json({ error: 'Employee, review type and valid cycle are required' }, { status: 422 });
  if (!Number.isFinite(body.score) || (body.score as number) < 0 || (body.score as number) > 100) return NextResponse.json({ error: 'Score must be between 0 and 100' }, { status: 422 });
  if (!body.comment?.trim()) return NextResponse.json({ error: 'Review comment is required' }, { status: 422 });
  if (body.reviewType === 'CLIENT' && !['HR','MD','CEO','ADMIN'].includes(user.role)) return NextResponse.json({ error: 'Only HR or executive roles may record client reviews' }, { status: 403 });
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try {
    const { rows } = await pool.query(`INSERT INTO performance_reviews (employee_id,reviewer_id,review_type,cycle,score,comment,evidence,status) SELECT $1,$2,$3,$4,$5,$6,$7,'SUBMITTED' WHERE EXISTS (SELECT 1 FROM employees WHERE id=$1 AND active=true) AND $1 <> (SELECT id FROM employees WHERE user_id=$2 LIMIT 1) RETURNING id,employee_id,reviewer_id,review_type,cycle,score,comment,evidence,status,created_at`, [body.employeeId, user.id, body.reviewType, body.cycle, body.score, body.comment.trim(), body.evidence?.trim() || null]);
    if (!rows[0]) return NextResponse.json({ error: 'Employee not found/inactive or self-review is not allowed' }, { status: 422 });
    await pool.query(`INSERT INTO audit_events (action,actor_user_id,target_type,target_id,metadata) VALUES ('PERFORMANCE_REVIEW_SUBMITTED',$1,'PERFORMANCE_REVIEW',$2,$3::jsonb)`, [user.id, rows[0].id, JSON.stringify({ employeeId: body.employeeId, reviewType: body.reviewType, cycle: body.cycle, score: body.score })]);
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to submit performance review' }, { status: 500 }); }
  finally { await pool.end(); }
}

export async function PATCH(request: Request) {
  const user = await requireUser(APPROVERS);
  let body: { id?: string; status?: 'APPROVED'|'REJECTED'; comment?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (!body.id || !body.status) return NextResponse.json({ error: 'Review id and status are required' }, { status: 422 });
  const url = process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool = new Pool({ connectionString: url, max: 5 });
  try {
    const { rows } = await pool.query(`UPDATE performance_reviews SET status=$2,updated_at=now(),comment=CASE WHEN $3::text IS NULL THEN comment ELSE $3 END WHERE id=$1 AND status='SUBMITTED' AND reviewer_id<>$4 RETURNING id,employee_id,reviewer_id,review_type,cycle,score,comment,evidence,status,updated_at`, [body.id, body.status, body.comment?.trim() || null, user.id]);
    if (!rows[0]) return NextResponse.json({ error: 'Review not found, already processed, or self-approval is not allowed' }, { status: 422 });
    await pool.query(`INSERT INTO audit_events (action,actor_user_id,target_type,target_id,metadata) VALUES ($1,$2,'PERFORMANCE_REVIEW',$3,$4::jsonb)`, [`PERFORMANCE_REVIEW_${body.status}`, user.id, body.id, JSON.stringify({ employeeId: rows[0].employee_id, cycle: rows[0].cycle, reviewType: rows[0].review_type })]);
    return NextResponse.json({ data: rows[0] });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to process performance review' }, { status: 500 }); }
  finally { await pool.end(); }
}
