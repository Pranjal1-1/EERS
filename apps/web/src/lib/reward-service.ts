export type FinalizedAward = { id: string; employeeId: string; awardType: 'MONTH' | 'YEAR'; cycle: string; status: 'FINALIZED'; finalizedAt: string };
export type RewardPlan = { bonusAmount: number; certificateTitle: string; certificateBody: string };

export function createRewardsForFinalizedAward(award: FinalizedAward, plan: RewardPlan) {
  if (award.status !== 'FINALIZED') throw new Error('Rewards can only be generated for finalized awards');
  if (!Number.isFinite(plan.bonusAmount) || plan.bonusAmount < 0) throw new Error('Bonus amount must be a non-negative number');
  if (!plan.certificateTitle.trim() || !plan.certificateBody.trim()) throw new Error('Certificate content is required');
  return {
    bonus: { awardId: award.id, employeeId: award.employeeId, amount: plan.bonusAmount, status: 'PENDING' as const },
    certificate: { awardId: award.id, employeeId: award.employeeId, title: plan.certificateTitle.trim(), body: plan.certificateBody.trim(), status: 'READY' as const },
  };
}
