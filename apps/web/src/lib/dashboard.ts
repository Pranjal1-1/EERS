export type DashboardSummary = {
  totalEmployees: number;
  activeEmployees: number;
  departments: Array<{ name: string; employeeCount: number; averageScore: number }>;
  topCandidates: Array<{ employeeId: string; employeeName: string; score: number; rank: number }>;
  pendingApprovals: number;
  pendingBonuses: number;
  attendanceScore: number;
};

export function buildDashboardSummary(input: DashboardSummary): DashboardSummary {
  if (input.totalEmployees < 0 || input.activeEmployees < 0) throw new Error('Employee counts cannot be negative');
  if (input.activeEmployees > input.totalEmployees) throw new Error('Active employees cannot exceed total employees');
  return {
    ...input,
    departments: input.departments.map((department) => ({ ...department, averageScore: Math.max(0, Math.min(100, department.averageScore)) })),
    topCandidates: [...input.topCandidates].sort((a, b) => a.rank - b.rank),
  };
}
