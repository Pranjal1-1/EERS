import { Pool } from 'pg';
import type { MonthlyPerformanceResult } from './monthly-performance';
import { selectEmployeeOfMonth } from './award-selection';

export class EmployeeOfMonthService {
  private readonly pool: Pool;
  constructor(databaseUrl = process.env.DATABASE_URL) {
    if (!databaseUrl?.trim()) throw new Error('DATABASE_URL is required');
    this.pool = new Pool({ connectionString: databaseUrl, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
  }

  async recommend(cycle: string): Promise<MonthlyPerformanceResult | null> {
    if (!/^\d{4}-\d{2}$/.test(cycle)) throw new Error('Cycle must use YYYY-MM format');
    const { rows } = await this.pool.query(`SELECT employee_id, cycle, overall_score, eligible, components, weights, finalized, finalized_at FROM monthly_performance WHERE cycle=$1 AND finalized=true`, [cycle]);
    const candidates: MonthlyPerformanceResult[] = rows.map((r) => ({ employeeId: r.employee_id, cycle: r.cycle, overallScore: Number(r.overall_score), eligible: r.eligible, components: r.components, weights: r.weights, finalized: r.finalized, finalizedAt: r.finalized_at }));
    const winner = selectEmployeeOfMonth(candidates);
    if (!winner) return null;
    const existing = await this.pool.query(`SELECT id FROM awards WHERE employee_id=$1 AND award_type='EMPLOYEE_OF_MONTH' AND cycle=$2 LIMIT 1`, [winner.employeeId, cycle]);
    if (!existing.rows[0]) await this.pool.query(`INSERT INTO awards (employee_id, award_type, cycle, score, status) VALUES ($1,'EMPLOYEE_OF_MONTH',$2,$3,'RECOMMENDED')`, [winner.employeeId, cycle, winner.overallScore]);
    return winner;
  }

  async close(): Promise<void> { await this.pool.end(); }
}
