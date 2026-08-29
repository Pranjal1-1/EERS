export type KpiDefinition = { id: string; name: string; target: number; weight: number; cap?: number };

export type KpiResult = { kpiId: string; actual: number; achievementScore: number; weightedScore: number };

export function calculateKpiAchievement(actual: number, target: number, cap = 100): number {
  if (!Number.isFinite(actual) || actual < 0) throw new Error('Actual value must be a non-negative number');
  if (!Number.isFinite(target) || target <= 0) throw new Error('Target must be greater than zero');
  if (!Number.isFinite(cap) || cap <= 0) throw new Error('Cap must be greater than zero');
  return Math.round(Math.min(cap, (actual / target) * 100) * 100) / 100;
}

export function validateKpiWeights(kpis: KpiDefinition[]): void {
  if (!kpis.length) throw new Error('At least one KPI is required');
  if (kpis.some((kpi) => !kpi.name.trim() || kpi.weight < 0)) throw new Error('KPI names are required and weights cannot be negative');
  const total = kpis.reduce((sum, kpi) => sum + kpi.weight, 0);
  if (Math.abs(total - 100) > 0.000001) throw new Error(`KPI weights must total 100; received ${total}`);
}

export function calculateKpiResults(kpis: KpiDefinition[], actuals: Record<string, number>): KpiResult[] {
  validateKpiWeights(kpis);
  return kpis.map((kpi) => {
    const achievementScore = calculateKpiAchievement(actuals[kpi.id] ?? 0, kpi.target, kpi.cap ?? 100);
    return { kpiId: kpi.id, actual: actuals[kpi.id] ?? 0, achievementScore, weightedScore: Math.round(achievementScore * kpi.weight) / 100 };
  });
}
