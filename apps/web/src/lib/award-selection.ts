import type { MonthlyPerformanceResult } from './monthly-performance';

export type AwardPeriod = 'MONTH' | 'YEAR';
export type AwardCandidate = MonthlyPerformanceResult & { monthsQualified?: number };

export function selectEmployeeOfMonth(candidates: MonthlyPerformanceResult[]): MonthlyPerformanceResult | null {
  const eligible = candidates.filter((c) => c.eligible);
  if (!eligible.length) return null;
  return [...eligible].sort((a, b) => b.overallScore - a.overallScore || b.components.kpi - a.components.kpi || a.employeeId.localeCompare(b.employeeId))[0];
}

export function selectEmployeeOfYear(candidates: AwardCandidate[], minimumQualifiedMonths = 6): AwardCandidate | null {
  const eligible = candidates.filter((c) => c.eligible && (c.monthsQualified ?? 0) >= minimumQualifiedMonths);
  if (!eligible.length) return null;
  return [...eligible].sort((a, b) => b.overallScore - a.overallScore || (b.monthsQualified ?? 0) - (a.monthsQualified ?? 0) || b.components.kpi - a.components.kpi || a.employeeId.localeCompare(b.employeeId))[0];
}
