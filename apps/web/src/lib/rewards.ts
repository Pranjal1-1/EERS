export type BonusStatus = 'PENDING' | 'APPROVED' | 'PROCESSED' | 'PAID';

export function transitionBonusStatus(current: BonusStatus, next: BonusStatus): BonusStatus {
  const allowed: Record<BonusStatus, BonusStatus[]> = {
    PENDING: ['APPROVED'],
    APPROVED: ['PROCESSED'],
    PROCESSED: ['PAID'],
    PAID: [],
  };
  if (!allowed[current].includes(next)) throw new Error(`Invalid bonus transition: ${current} -> ${next}`);
  return next;
}

export function validateBonusAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Bonus amount must be a non-negative number');
}
