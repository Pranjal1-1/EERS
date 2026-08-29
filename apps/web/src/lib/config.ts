export type PerformanceConfig = {
  componentWeights: {
    kpi: number;
    manager: number;
    project: number;
    client: number;
    attendance: number;
    innovation: number;
    recognition: number;
  };
  minimumAnnualMonths: number;
  minimumAttendanceScore: number;
  minimumOverallScore: number;
};

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  componentWeights: { kpi: 30, manager: 20, project: 15, client: 15, attendance: 10, innovation: 5, recognition: 5 },
  minimumAnnualMonths: 10,
  minimumAttendanceScore: 75,
  minimumOverallScore: 70,
};

export function validatePerformanceConfig(config: PerformanceConfig): void {
  const total = Object.values(config.componentWeights).reduce((sum, weight) => sum + weight, 0);
  if (total !== 100) throw new Error(`Performance weights must total 100; received ${total}`);
  if (!Number.isInteger(config.minimumAnnualMonths) || config.minimumAnnualMonths < 1 || config.minimumAnnualMonths > 12) throw new Error('Annual month eligibility must be between 1 and 12');
  if (config.minimumAttendanceScore < 0 || config.minimumAttendanceScore > 100) throw new Error('Attendance threshold must be 0-100');
  if (config.minimumOverallScore < 0 || config.minimumOverallScore > 100) throw new Error('Overall threshold must be 0-100');
}
