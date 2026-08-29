import { Pool, type QueryResultRow } from 'pg';
import { getDatabaseConfig, assertServerDatabaseAccess } from '../db';

export type SqlExecutor = <T extends QueryResultRow = QueryResultRow>(query: string, params?: readonly unknown[]) => Promise<T[]>;

let pool: Pool | undefined;

function getPool(): Pool {
  assertServerDatabaseAccess();
  if (pool) return pool;
  const config = getDatabaseConfig();
  pool = new Pool({ connectionString: config.url, ssl: config.ssl ? { rejectUnauthorized: false } : false, max: 10, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000 });
  return pool;
}

export function createSqlExecutor(): SqlExecutor {
  const database = getPool();
  return async <T extends QueryResultRow = QueryResultRow>(query: string, params: readonly unknown[] = []) => {
    const result = await database.query<T>(query, params as unknown[]);
    return result.rows;
  };
}

export async function closeDatabase(): Promise<void> {
  if (pool) { await pool.end(); pool = undefined; }
}
