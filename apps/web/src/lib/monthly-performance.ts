import { calculateMonthlyScore, type MonthlyScoreInputs, type MonthlyWeights, DEFAULT_MONTHLY_WEIGHTS } from './scoring';

export type MonthlyPerformanceResult = {
  employeeId: string;
  cycle: string;
  components: MonthlyScoreInputs;
  weights: MonthlyWeights;
  overallScore: number;
  eligible: boolean;
};

export type EligibilityRules = {
  minimumAttendanceScore: number;
  minimumOverallScore: number;
};

export const DEFAULT_ELIGIBILITY_RULES: EligibilityRules = {
  minimumAttendanceScore: 75,
  minimumOverallScore: 70,
};

export function calculateMonthlyPerformance(
  employeeId: string,
  cycle: string,
  components: MonthlyScoreInputs,
  weights: MonthlyWeights = DEFAULT_MONTHLY_WEIGHTS,
  rules: EligibilityRules = DEFAULT_ELIGIBILITY_RULES,
): MonthlyPerformanceResult {
  if (!employeeId.trim()) throw new Error('Employee ID is required');
  if (!/^\d{4}-\d{2}$/.test(cycle)) throw new Error('Cycle must use YYYY-MM format');
  const overallScore = calculateMonthlyScore(components, weights);
  return {
    employeeId,
    cycle,
    components,
    weights,
    overallScore,
    eligible: components.attendance >= rules.minimumAttendanceScore && overallScore >= rules.minimumOverallScore,
  };
}

export function rankEligibleMonthlyPerformance(results: MonthlyPerformanceResult[]): MonthlyPerformanceResult[] {
  return [...results].filter((result) => result.eligible).sort((a, b) => b.overallScore - a.overallScore || b.components.kpi - a.components.kpi || a.employeeId.localeCompare(b.employeeId));
}
