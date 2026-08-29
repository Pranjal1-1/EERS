export type MonthlyPerformance = { month: number; score: number; finalized: boolean };

export function calculateAnnualScore(months: MonthlyPerformance[]): number {
  const finalized = months.filter((month) => month.finalized);
  if (!finalized.length) return 0;
  return Math.round(finalized.reduce((sum, month) => sum + Math.max(0, Math.min(100, month.score)), 0) / finalized.length * 100) / 100;
}

export function annualEligibility(months: MonthlyPerformance[], minimumFinalizedMonths = 10): boolean {
  return months.filter((month) => month.finalized).length >= minimumFinalizedMonths;
}

export function rankAnnualCandidates(candidates: Array<{ employeeId: string; employeeName: string; months: MonthlyPerformance[] }>) {
  return candidates
    .filter((candidate) => annualEligibility(candidate.months))
    .map((candidate) => ({ ...candidate, annualScore: calculateAnnualScore(candidate.months) }))
    .sort((a, b) => b.annualScore - a.annualScore || a.employeeName.localeCompare(b.employeeName))
    .map((candidate, index) => ({ ...candidate, rank: index + 1 }));
}
