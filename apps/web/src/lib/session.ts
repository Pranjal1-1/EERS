import { createHmac, timingSafeEqual } from 'node:crypto';
import type { SessionUser } from './auth';

const secret = process.env.EERS_SESSION_SECRET;

function getSecret() {
  if (!secret || secret.length < 32) throw new Error('EERS_SESSION_SECRET must be configured with at least 32 characters');
  return secret;
}

export function createSessionToken(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify({ ...user, iat: Date.now() })).toString('base64url');
  const signature = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): SessionUser | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionUser & { iat: number };
    if (!parsed.iat || Date.now() - parsed.iat > 8 * 60 * 60 * 1000) return null;
    return { id: parsed.id, email: parsed.email, role: parsed.role };
  } catch {
    return null;
  }
}
