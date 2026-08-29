import { DEFAULT_ROLE_PERMISSIONS, type Permission, type Role } from './rbac';

export function requirePermission(role: Role, permission: Permission): void {
  if (!DEFAULT_ROLE_PERMISSIONS[role]?.includes(permission)) {
    throw new Error('FORBIDDEN');
  }
}

export function canAccessEmployee(role: Role, viewerEmployeeId: string, targetEmployeeId: string): boolean {
  if (role !== 'EMPLOYEE') return true;
  return viewerEmployeeId === targetEmployeeId;
}
