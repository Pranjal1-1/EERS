export const ROLES = ['EMPLOYEE', 'MANAGER', 'HR', 'MD', 'CEO', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = {
  VIEW_OWN_PERFORMANCE: 'view:own-performance',
  MANAGE_EMPLOYEES: 'manage:employees',
  MANAGE_ATTENDANCE: 'manage:attendance',
  MANAGE_KPIS: 'manage:kpis',
  REVIEW_PERFORMANCE: 'review:performance',
  MANAGE_FEEDBACK: 'manage:feedback',
  MANAGE_AWARDS: 'manage:awards',
  APPROVE_AWARDS: 'approve:awards',
  MANAGE_BONUSES: 'manage:bonuses',
  VIEW_REPORTS: 'view:reports',
  VIEW_AUDIT_LOG: 'view:audit-log',
  MANAGE_SETTINGS: 'manage:settings',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  EMPLOYEE: [PERMISSIONS.VIEW_OWN_PERFORMANCE],
  MANAGER: [PERMISSIONS.VIEW_OWN_PERFORMANCE, PERMISSIONS.REVIEW_PERFORMANCE, PERMISSIONS.MANAGE_ATTENDANCE, PERMISSIONS.MANAGE_FEEDBACK, PERMISSIONS.APPROVE_AWARDS],
  HR: Object.values(PERMISSIONS).filter((permission) => permission !== PERMISSIONS.MANAGE_SETTINGS),
  MD: [PERMISSIONS.VIEW_OWN_PERFORMANCE, PERMISSIONS.REVIEW_PERFORMANCE, PERMISSIONS.APPROVE_AWARDS, PERMISSIONS.MANAGE_AWARDS, PERMISSIONS.MANAGE_BONUSES, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.VIEW_AUDIT_LOG],
  CEO: [PERMISSIONS.VIEW_OWN_PERFORMANCE, PERMISSIONS.REVIEW_PERFORMANCE, PERMISSIONS.APPROVE_AWARDS, PERMISSIONS.MANAGE_AWARDS, PERMISSIONS.MANAGE_BONUSES, PERMISSIONS.VIEW_REPORTS, PERMISSIONS.VIEW_AUDIT_LOG],
  ADMIN: Object.values(PERMISSIONS),
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return DEFAULT_ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function assertPermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) throw new Error(`Forbidden: ${permission}`);
}
