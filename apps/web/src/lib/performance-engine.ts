import { calculateAttendanceScore, type AttendanceDay } from './attendance-score';
import { calculateKpiResults, type KpiDefinition } from './kpi';
import { DEFAULT_COMPONENT_WEIGHTS } from './performance-cycle';

export type UnifiedPerformanceInput = {
  employeeId: string;
  cycle: string;
  kpis: KpiDefinition[];
  kpiActuals: Record<string, number>;
  attendance: AttendanceDay[];
  managerScore: number;
  projectScore: number;
  clientScore: number;
  innovationScore: number;
  recognitionScore: number;
  weights?: typeof DEFAULT_COMPONENT_WEIGHTS;
  eligible?: boolean;
};

export type PerformanceSnapshot = {
  employeeId: string;
  cycle: string;
  eligible: boolean;
  overallScore: number;
  components: Record<string, number>;
  generatedAt: string;
};

function clamp(value: number) { return Math.max(0, Math.min(100, value)); }

export function buildPerformanceSnapshot(input: UnifiedPerformanceInput): PerformanceSnapshot {
  const weights = input.weights ?? DEFAULT_COMPONENT_WEIGHTS;
  if (Object.values(weights).reduce((a, b) => a + b, 0) !== 100) throw new Error('Performance weights must total 100');
  const kpiScore = calculateKpiResults(input.kpis, input.kpiActuals).reduce((sum, item) => sum + item.weightedScore, 0);
  const components = {
    kpi: clamp(kpiScore), manager: clamp(input.managerScore), project: clamp(input.projectScore),
    client: clamp(input.clientScore), attendance: calculateAttendanceScore(input.attendance),
    innovation: clamp(input.innovationScore), recognition: clamp(input.recognitionScore),
  };
  const overallScore = Math.round(Object.entries(weights).reduce((sum, [key, weight]) => sum + components[key as keyof typeof components] * weight / 100, 0) * 100) / 100;
  return { employeeId: input.employeeId, cycle: input.cycle, eligible: input.eligible !== false, overallScore, components, generatedAt: new Date().toISOString() };
}
