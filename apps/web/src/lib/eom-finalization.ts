import { Pool } from 'pg';

export type EOMFinalizationInput = {
  awardId: string;
  actorUserId: string;
  bonusAmount: number;
  certificateNumber: string;
};

export async function finalizeEOMAward(input: EOMFinalizationInput) {
  if (!input.awardId || !input.actorUserId) throw new Error('Award and actor are required');
  if (!Number.isFinite(input.bonusAmount) || input.bonusAmount < 0) throw new Error('Bonus amount must be non-negative');
  if (!input.certificateNumber.trim()) throw new Error('Certificate number is required');
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error('DATABASE_URL is required');
  const pool = new Pool({ connectionString: databaseUrl, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const award = await client.query(`SELECT id, employee_id, award_type, cycle, status, finalized_at FROM awards WHERE id=$1 FOR UPDATE`, [input.awardId]);
    if (!award.rows[0]) throw new Error('Award not found');
    const a = award.rows[0];
    if (a.award_type !== 'EMPLOYEE_OF_MONTH') throw new Error('Award is not an Employee of the Month award');
    if (!['APPROVED','RECOMMENDED','OVERRIDDEN'].includes(a.status)) throw new Error('Award cannot be finalized from its current status');
    if (a.finalized_at) throw new Error('Award is already finalized');
    await client.query(`UPDATE awards SET status='APPROVED', approved_by=$2, finalized_at=now() WHERE id=$1`, [input.awardId, input.actorUserId]);
    await client.query(`INSERT INTO bonuses (award_id, amount, status) VALUES ($1,$2,'PENDING') ON CONFLICT (award_id) DO UPDATE SET amount=EXCLUDED.amount`, [input.awardId, input.bonusAmount]);
    await client.query(`INSERT INTO certificates (award_id, certificate_number, issued_at) VALUES ($1,$2,now()) ON CONFLICT (award_id) DO NOTHING`, [input.awardId, input.certificateNumber.trim()]);
    await client.query(`INSERT INTO audit_events (action, actor_user_id, target_type, target_id, metadata) VALUES ('EOM_FINALIZED',$1,'AWARD',$2,$3::jsonb)`, [input.actorUserId, input.awardId, JSON.stringify({ cycle: a.cycle, employeeId: a.employee_id, bonusAmount: input.bonusAmount })]);
    await client.query('COMMIT');
    return { awardId: input.awardId, employeeId: a.employee_id, cycle: a.cycle, finalized: true, bonusAmount: input.bonusAmount, certificateNumber: input.certificateNumber.trim() };
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); await pool.end(); }
}
