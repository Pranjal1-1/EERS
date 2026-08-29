export const DATABASE_TABLES = {
  employees: 'employees', departments: 'departments', users: 'users', kpiTemplates: 'kpi_templates', kpiAssignments: 'kpi_assignments',
  attendance: 'attendance_records', reviews: 'performance_reviews', monthlyPerformance: 'monthly_performance', awards: 'awards', bonuses: 'bonuses', certificates: 'certificates', auditEvents: 'audit_events',
} as const;

export const IMMUTABLE_AFTER_FINALIZATION = ['monthly_performance', 'awards', 'certificates'] as const;

export function requireDatabaseUrl(value: string | undefined): string {
  if (!value?.trim()) throw new Error('DATABASE_URL is required in the server environment');
  return value;
}
