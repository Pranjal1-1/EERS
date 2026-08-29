import type { KpiDefinition } from './kpi';
import { calculateKpiResults } from './kpi';

export type EmployeeKpiAssignment = { employeeId: string; departmentId: string; kpis: KpiDefinition[] };

export function calculateEmployeeMonthlyKpis(assignment: EmployeeKpiAssignment, actuals: Record<string, number>) {
  if (!assignment.employeeId || !assignment.departmentId) throw new Error('Employee and department are required');
  return { employeeId: assignment.employeeId, departmentId: assignment.departmentId, results: calculateKpiResults(assignment.kpis, actuals), calculatedAt: new Date().toISOString() };
}
