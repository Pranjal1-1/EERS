export type DatabaseProvider = 'postgresql';

export type DatabaseConfig = {
  provider: DatabaseProvider;
  url: string;
  ssl: boolean;
};

export function getDatabaseConfig(env: NodeJS.ProcessEnv = process.env): DatabaseConfig {
  const url = env.DATABASE_URL?.trim();
  if (!url) throw new Error('DATABASE_URL is required');
  return { provider: 'postgresql', url, ssl: env.DATABASE_SSL !== 'false' };
}

/**
 * Server-only boundary for database access. Concrete driver wiring belongs here,
 * keeping domain logic independent of the chosen PostgreSQL client.
 */
export function assertServerDatabaseAccess(): void {
  if (typeof window !== 'undefined') throw new Error('Database access is server-only');
}
