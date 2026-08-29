import { calculateAttendanceScore, type AttendanceDay } from './attendance-score';
import { calculateKpiResults, type KpiDefinition } from './kpi';

export type PerformanceInputs = {
  kpis: KpiDefinition[];
  kpiActuals: Record<string, number>;
  attendance: AttendanceDay[];
  managerScore: number;
  projectScore: number;
  clientScore: number;
  innovationScore: number;
  recognitionScore: number;
};

export const DEFAULT_COMPONENT_WEIGHTS = {
  kpi: 30,
  manager: 20,
  project: 15,
  client: 15,
  attendance: 10,
  innovation: 5,
  recognition: 5,
} as const;

export function calculateOverallPerformance(inputs: PerformanceInputs, weights = DEFAULT_COMPONENT_WEIGHTS): number {
  const kpiResults = calculateKpiResults(inputs.kpis, inputs.kpiActuals);
  const kpiScore = kpiResults.reduce((sum, result) => sum + result.weightedScore, 0);
  const values = {
    kpi: kpiScore,
    manager: inputs.managerScore,
    project: inputs.projectScore,
    client: inputs.clientScore,
    attendance: calculateAttendanceScore(inputs.attendance),
    innovation: inputs.innovationScore,
    recognition: inputs.recognitionScore,
  };
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);
  if (totalWeight !== 100) throw new Error('Performance component weights must total 100');
  return Math.round(Object.entries(weights).reduce((sum, [key, weight]) => sum + values[key as keyof typeof values] * weight / 100, 0) * 100) / 100;
}
