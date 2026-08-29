export type MonthlyInputs = {
  employeeId: string;
  cycle: string;
  kpis: Array<{ score: number; weight: number }>;
  attendanceScore?: number;
  managerScore?: number;
  projectScore?: number;
  clientScore?: number;
};

export type MonthlyCalculation = {
  employeeId: string;
  cycle: string;
  overallScore: number;
  components: Record<string, number>;
  weights: Record<string, number>;
  eligible: boolean;
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function calculateMonthlyPerformance(input: MonthlyInputs): MonthlyCalculation {
  if (!input.employeeId || !/^\d{4}-\d{2}$/.test(input.cycle)) throw new Error('Employee ID and valid YYYY-MM cycle are required');
  if (!input.kpis.length) throw new Error('At least one KPI result is required');
  const kpiWeight = input.kpis.reduce((s, k) => s + k.weight, 0);
  if (kpiWeight <= 0) throw new Error('KPI weights must total more than zero');
  const kpiScore = clamp(input.kpis.reduce((s, k) => s + clamp(k.score) * k.weight, 0) / kpiWeight);
  const evidence: Array<[string, number, number]> = [['kpi', kpiScore, 70]];
  if (input.attendanceScore !== undefined) evidence.push(['attendance', clamp(input.attendanceScore), 10]);
  if (input.managerScore !== undefined) evidence.push(['manager', clamp(input.managerScore), 10]);
  if (input.projectScore !== undefined) evidence.push(['project', clamp(input.projectScore), 5]);
  if (input.clientScore !== undefined) evidence.push(['client', clamp(input.clientScore), 5]);
  const totalWeight = evidence.reduce((s, [, , w]) => s + w, 0);
  const overallScore = Number((evidence.reduce((s, [, score, weight]) => s + score * weight, 0) / totalWeight).toFixed(2));
  const components = Object.fromEntries(evidence.map(([name, score]) => [name, Number(score.toFixed(2))]));
  const weights = Object.fromEntries(evidence.map(([name, , weight]) => [name, weight]));
  return { employeeId: input.employeeId, cycle: input.cycle, overallScore, components, weights, eligible: overallScore >= 70 && (input.attendanceScore === undefined || input.attendanceScore >= 75) };
}
