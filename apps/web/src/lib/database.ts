import { requireDatabaseUrl } from './database-plan';

export type DatabaseClient = {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(work: (client: DatabaseClient) => Promise<T>): Promise<T>;
};

/** Server-only configuration guard. The concrete driver is injected by the application runtime. */
export function getDatabaseConfig(env: NodeJS.ProcessEnv = process.env) {
  return { url: requireDatabaseUrl(env.DATABASE_URL), ssl: env.DATABASE_SSL !== 'false' };
}
