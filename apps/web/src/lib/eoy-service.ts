import { Pool } from 'pg';
import { selectEmployeeOfYear, type AwardCandidate } from './award-selection';

export class EmployeeOfYearService {
  private readonly pool: Pool;
  constructor(databaseUrl = process.env.DATABASE_URL) {
    if (!databaseUrl?.trim()) throw new Error('DATABASE_URL is required');
    this.pool = new Pool({ connectionString: databaseUrl, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
  }

  async recommend(year: number, minimumQualifiedMonths = 6): Promise<AwardCandidate | null> {
    if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error('Invalid year');
    if (!Number.isInteger(minimumQualifiedMonths) || minimumQualifiedMonths < 1 || minimumQualifiedMonths > 12) throw new Error('Invalid minimum qualified months');
    const { rows } = await this.pool.query(`SELECT employee_id, cycle, overall_score, eligible, components, weights, finalized, finalized_at FROM monthly_performance WHERE cycle LIKE $1 AND finalized=true ORDER BY employee_id, cycle`, [`${year}-%`]);
    const grouped = new Map<string, AwardCandidate>();
    for (const row of rows) {
      const current = grouped.get(row.employee_id);
      const candidate = { employeeId: row.employee_id, cycle: row.cycle, overallScore: Number(row.overall_score), eligible: row.eligible, components: row.components, weights: row.weights, finalized: row.finalized, finalizedAt: row.finalized_at, monthsQualified: (current?.monthsQualified ?? 0) + (row.eligible ? 1 : 0) } as AwardCandidate;
      if (!current || candidate.overallScore >= current.overallScore) grouped.set(row.employee_id, candidate);
    }
    const candidates = [...grouped.values()];
    const winner = selectEmployeeOfYear(candidates, minimumQualifiedMonths);
    if (!winner) return null;
    const existing = await this.pool.query(`SELECT id FROM awards WHERE employee_id=$1 AND award_type='EMPLOYEE_OF_YEAR' AND cycle=$2 LIMIT 1`, [winner.employeeId, String(year)]);
    if (!existing.rows[0]) await this.pool.query(`INSERT INTO awards (employee_id, award_type, cycle, score, status) VALUES ($1,'EMPLOYEE_OF_YEAR',$2,$3,'RECOMMENDED')`, [winner.employeeId, String(year), winner.overallScore]);
    return winner;
  }

  async close(): Promise<void> { await this.pool.end(); }
}
