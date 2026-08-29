import { headers } from 'next/headers';
import { EERSRole, isRole } from './authorization';

export type AuthenticatedRequestUser = { id: string; email: string; role: EERSRole };

/** Headers are populated only by the server proxy after verifying the signed session. */
export async function getAuthenticatedUser(): Promise<AuthenticatedRequestUser | null> {
  const h = await headers();
  const id = h.get('x-eers-user-id');
  const email = h.get('x-eers-user-email');
  const role = h.get('x-eers-user-role');
  if (!id || !email || !isRole(role)) return null;
  return { id, email, role };
}

export async function getAuthenticatedRole(): Promise<EERSRole | null> {
  return (await getAuthenticatedUser())?.role ?? null;
}

export async function requireRole(allowed: readonly EERSRole[]): Promise<EERSRole> {
  const user = await getAuthenticatedUser();
  if (!user || !allowed.includes(user.role)) throw new Error('UNAUTHORIZED');
  return user.role;
}

export async function requireUser(allowed: readonly EERSRole[] = ['EMPLOYEE','MANAGER','HR','MD','CEO','ADMIN']): Promise<AuthenticatedRequestUser> {
  const user = await getAuthenticatedUser();
  if (!user || !allowed.includes(user.role)) throw new Error('UNAUTHORIZED');
  return user;
}
