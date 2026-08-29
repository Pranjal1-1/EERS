import type { MonthlyPerformanceResult } from './monthly-performance';
import { selectEmployeeOfYear, type AwardCandidate } from './award-selection';

export type YearlyEmployeeReport = {
  employeeId: string;
  year: number;
  monthsEvaluated: number;
  qualifiedMonths: number;
  averageScore: number;
  minimumScore: number;
  maximumScore: number;
  attendanceAverage: number;
  kpiAverage: number;
  eligibleForEOY: boolean;
};

export function buildYearlyReport(employeeId: string, year: number, months: MonthlyPerformanceResult[]): YearlyEmployeeReport {
  if (!employeeId.trim()) throw new Error('Employee ID is required');
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error('Invalid year');
  const records = months.filter((m) => m.employeeId === employeeId && m.cycle.startsWith(`${year}-`));
  if (!records.length) throw new Error('No monthly performance records found');
  const scores = records.map((m) => m.overallScore);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return {
    employeeId,
    year,
    monthsEvaluated: records.length,
    qualifiedMonths: records.filter((m) => m.eligible).length,
    averageScore: Number(averageScore.toFixed(2)),
    minimumScore: Math.min(...scores),
    maximumScore: Math.max(...scores),
    attendanceAverage: Number((records.reduce((s, m) => s + m.components.attendance, 0) / records.length).toFixed(2)),
    kpiAverage: Number((records.reduce((s, m) => s + m.components.kpi, 0) / records.length).toFixed(2)),
    eligibleForEOY: records.filter((m) => m.eligible).length >= 6,
  };
}

export function selectEOYWithEvidence(candidates: AwardCandidate[]): AwardCandidate | null {
  return selectEmployeeOfYear(candidates, 6);
}
