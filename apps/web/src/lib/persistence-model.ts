export type EmployeeRecord = { id: string; employeeCode: string; name: string; email: string; departmentId: string; role: string; active: boolean };
export type MonthlyPerformanceRecord = { id: string; employeeId: string; cycle: string; overallScore: number; eligible: boolean; finalized: boolean; components: Record<string, number> };
export type AwardRecord = { id: string; employeeId: string; awardType: 'EMPLOYEE_OF_MONTH' | 'EMPLOYEE_OF_YEAR'; cycle: string; score: number; status: 'RECOMMENDED' | 'APPROVED' | 'OVERRIDDEN' | 'REJECTED' };
export type BonusRecord = { id: string; awardId: string; amount: number; status: 'PENDING' | 'APPROVED' | 'PROCESSED' | 'PAID' };
export type CertificateRecord = { id: string; awardId: string; certificateNumber: string; issuedAt?: string };

export const PERSISTENCE_ENTITIES = ['employees', 'departments', 'kpi_templates', 'kpi_assignments', 'attendance_records', 'reviews', 'monthly_performance', 'awards', 'bonuses', 'certificates', 'audit_events'] as const;
