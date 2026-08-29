import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password: string): string {
  if (password.length < 12) throw new Error('Password must contain at least 12 characters');
  const salt = randomBytes(16).toString('hex');
  const digest = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${digest}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith('scrypt:')) {
    const [, salt, expected] = stored.split(':');
    if (!salt || !expected) return false;
    const actual = scryptSync(password, salt, 64).toString('hex');
    const a = Buffer.from(actual, 'hex'); const b = Buffer.from(expected, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  }
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const actual = createHash('sha256').update(`${salt}:${password}`).digest('hex');
  const a = Buffer.from(actual); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type SessionUser = { id: string; email: string; role: 'EMPLOYEE' | 'MANAGER' | 'HR' | 'MD' | 'CEO' | 'ADMIN' };
