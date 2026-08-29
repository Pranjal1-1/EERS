import { Pool } from 'pg';
import type { MonthlyPerformanceResult } from './monthly-performance';

export type MonthlyPerformanceRecord = MonthlyPerformanceResult & { finalized: boolean; finalizedAt?: string | null };

export class PostgresMonthlyPerformanceRepository {
  private readonly pool: Pool;
  constructor(databaseUrl = process.env.DATABASE_URL) {
    if (!databaseUrl?.trim()) throw new Error('DATABASE_URL is required');
    this.pool = new Pool({ connectionString: databaseUrl, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
  }

  async save(record: MonthlyPerformanceRecord): Promise<MonthlyPerformanceRecord> {
    const { rows } = await this.pool.query(`INSERT INTO monthly_performance (employee_id, cycle, overall_score, finalized, finalized_at, components, weights) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb) ON CONFLICT (employee_id, cycle) DO UPDATE SET overall_score=EXCLUDED.overall_score, finalized=EXCLUDED.finalized, finalized_at=EXCLUDED.finalized_at, components=EXCLUDED.components, weights=EXCLUDED.weights RETURNING employee_id, cycle, overall_score, finalized, finalized_at, components, weights`, [record.employeeId, record.cycle, record.overallScore, record.finalized, record.finalizedAt ?? null, JSON.stringify(record.components), JSON.stringify(record.weights)]);
    const row = rows[0];
    return { employeeId: row.employee_id, cycle: row.cycle, overallScore: Number(row.overall_score), components: row.components, weights: row.weights, eligible: row.components.attendance >= 75 && Number(row.overall_score) >= 70, finalized: row.finalized, finalizedAt: row.finalized_at };
  }

  async listByYear(employeeId: string, year: number): Promise<MonthlyPerformanceRecord[]> {
    const { rows } = await this.pool.query(`SELECT employee_id, cycle, overall_score, finalized, finalized_at, components, weights FROM monthly_performance WHERE employee_id=$1 AND cycle LIKE $2 ORDER BY cycle`, [employeeId, `${year}-%`]);
    return rows.map((row) => ({ employeeId: row.employee_id, cycle: row.cycle, overallScore: Number(row.overall_score), components: row.components, weights: row.weights, eligible: row.components.attendance >= 75 && Number(row.overall_score) >= 70, finalized: row.finalized, finalizedAt: row.finalized_at }));
  }

  async close(): Promise<void> { await this.pool.end(); }
}
