export type Candidate = {
  employeeId: string;
  employeeName: string;
  score: number;
  eligible: boolean;
  disqualificationReason?: string;
};

export type RankedCandidate = Candidate & { rank: number };

export function rankCandidates(candidates: Candidate[]): RankedCandidate[] {
  const eligible = candidates.filter((candidate) => candidate.eligible);
  return [...eligible]
    .sort((a, b) => b.score - a.score || a.employeeName.localeCompare(b.employeeName))
    .map((candidate, index) => ({ ...candidate, rank: index + 1 }));
}

export function recommendWinner(candidates: Candidate[]): RankedCandidate | null {
  return rankCandidates(candidates)[0] ?? null;
}

export function canFinalizeAward(role: string): boolean {
  return ['MANAGER', 'HR', 'MD', 'CEO', 'ADMIN'].includes(role);
}

export function validateOverride(role: string, reason: string): void {
  if (!canFinalizeAward(role)) throw new Error('Only authorized management roles can override an award recommendation');
  if (!reason.trim()) throw new Error('An override reason is required');
}
