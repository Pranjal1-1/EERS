export type EERSRole = 'EMPLOYEE' | 'MANAGER' | 'HR' | 'MD' | 'CEO' | 'ADMIN';

export const PERFORMANCE_MANAGERS: EERSRole[] = ['MANAGER', 'HR', 'MD', 'CEO', 'ADMIN'];
export const AWARD_APPROVERS: EERSRole[] = ['MANAGER', 'HR', 'MD', 'CEO', 'ADMIN'];

export function isRole(value: unknown): value is EERSRole {
  return typeof value === 'string' && ['EMPLOYEE','MANAGER','HR','MD','CEO','ADMIN'].includes(value);
}

export function canManagePerformance(role: unknown): boolean {
  return isRole(role) && PERFORMANCE_MANAGERS.includes(role);
}

export function canApproveAward(role: unknown): boolean {
  return isRole(role) && AWARD_APPROVERS.includes(role);
}

export function assertCanManagePerformance(role: unknown): asserts role is EERSRole {
  if (!canManagePerformance(role)) throw new Error('Insufficient permissions to manage performance');
}

export function assertCanApproveAward(role: unknown): asserts role is EERSRole {
  if (!canApproveAward(role)) throw new Error('Insufficient permissions to approve awards');
}
