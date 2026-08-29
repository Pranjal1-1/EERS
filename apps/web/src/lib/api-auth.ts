import { headers } from 'next/headers';
import { EERSRole, isRole } from './authorization';

/**
 * Reads the authenticated role from trusted server middleware/session headers.
 * A browser must never be allowed to supply this header directly; middleware
 * should overwrite it after validating the application session.
 */
export async function getAuthenticatedRole(): Promise<EERSRole | null> {
  const h = await headers();
  const role = h.get('x-eers-user-role');
  return isRole(role) ? role : null;
}

export async function requireRole(allowed: readonly EERSRole[]): Promise<EERSRole> {
  const role = await getAuthenticatedRole();
  if (!role || !allowed.includes(role)) throw new Error('UNAUTHORIZED');
  return role;
}
