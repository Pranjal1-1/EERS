import { createHash, randomBytes } from 'node:crypto';

export function hashPassword(password: string): string {
  if (password.length < 12) throw new Error('Password must contain at least 12 characters');
  const salt = randomBytes(16).toString('hex');
  const digest = createHash('sha256').update(`${salt}:${password}`).digest('hex');
  return `${salt}:${digest}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const actual = createHash('sha256').update(`${salt}:${password}`).digest('hex');
  return actual === expected;
}

export type SessionUser = { id: string; email: string; role: 'EMPLOYEE' | 'MANAGER' | 'HR' | 'MD' | 'CEO' | 'ADMIN' };
