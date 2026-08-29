export type MonthlyScoreInputs = {
  kpi: number;
  manager: number;
  project: number;
  client: number;
  attendance: number;
  innovation: number;
  recognition: number;
};

export type MonthlyWeights = Omit<MonthlyScoreInputs, 'kpi' | 'manager' | 'project' | 'client' | 'attendance' | 'innovation' | 'recognition'> & Record<keyof MonthlyScoreInputs, number>;

export const DEFAULT_MONTHLY_WEIGHTS: MonthlyWeights = {
  kpi: 30,
  manager: 20,
  project: 15,
  client: 15,
  attendance: 10,
  innovation: 5,
  recognition: 5,
};

export function validateWeights(weights: MonthlyWeights): void {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  if (Math.abs(total - 100) > 0.000001) throw new Error(`Scoring weights must total 100; received ${total}`);
  if (Object.values(weights).some((value) => value < 0)) throw new Error('Scoring weights cannot be negative');
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function calculateMonthlyScore(inputs: MonthlyScoreInputs, weights = DEFAULT_MONTHLY_WEIGHTS): number {
  validateWeights(weights);
  const keys = Object.keys(weights) as (keyof MonthlyScoreInputs)[];
  const weighted = keys.reduce((sum, key) => sum + clamp(inputs[key]) * (weights[key] / 100), 0);
  return Math.round(weighted * 100) / 100;
}

export function calculateTargetAchievement(actual: number, target: number, cap = 100): number {
  if (target <= 0) throw new Error('Target must be greater than zero');
  if (actual < 0) throw new Error('Actual value cannot be negative');
  return Math.min(cap, Math.max(0, (actual / target) * 100));
}
