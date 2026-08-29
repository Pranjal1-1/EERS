import { getDatabaseConfig, assertServerDatabaseAccess } from '../db';

export type SqlExecutor = <T = unknown>(query: string, params?: readonly unknown[]) => Promise<T[]>;

/** Adapter contract. Inject a PostgreSQL client in the server runtime; never import this module from client components. */
export function createSqlExecutor(): SqlExecutor {
  assertServerDatabaseAccess();
  const config = getDatabaseConfig();
  if (config.provider !== 'postgresql') throw new Error('Unsupported database provider');
  throw new Error('PostgreSQL driver is not installed. Configure the server adapter before enabling persistence.');
}
