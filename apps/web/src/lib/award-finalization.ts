import { canFinalizeAward, validateOverride, type RankedCandidate } from './award-ranking';

export type AwardDecision = {
  winnerEmployeeId: string;
  score: number;
  approvedByRole: string;
  override: boolean;
  overrideReason?: string;
};

export function finalizeAward(recommendation: RankedCandidate | null, role: string, selectedEmployeeId?: string, overrideReason?: string): AwardDecision {
  if (!canFinalizeAward(role)) throw new Error('Unauthorized award finalization');
  if (!recommendation) throw new Error('No eligible recommendation exists');

  const selected = selectedEmployeeId ?? recommendation.employeeId;
  const override = selected !== recommendation.employeeId;
  if (override) validateOverride(role, overrideReason ?? '');

  return {
    winnerEmployeeId: selected,
    score: recommendation.score,
    approvedByRole: role,
    override,
    ...(override ? { overrideReason: overrideReason!.trim() } : {}),
  };
}
