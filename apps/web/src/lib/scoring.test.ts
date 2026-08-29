import { describe, expect, it } from 'vitest';
import { calculateMonthlyScore, calculateTargetAchievement } from './scoring';

describe('calculateMonthlyScore', () => {
  it('calculates the configured weighted score', () => {
    expect(calculateMonthlyScore({ kpi: 95, manager: 90, project: 92, client: 96, attendance: 94, innovation: 90, recognition: 100 })).toBe(93.75);
  });

  it('rejects weights that do not total 100', () => {
    expect(() => calculateMonthlyScore({ kpi: 100, manager: 100, project: 100, client: 100, attendance: 100, innovation: 100, recognition: 100 }, { kpi: 20, manager: 20, project: 15, client: 15, attendance: 10, innovation: 5, recognition: 5 })).not.toThrow();
    expect(() => calculateMonthlyScore({ kpi: 100, manager: 100, project: 100, client: 100, attendance: 100, innovation: 100, recognition: 100 }, { kpi: 21, manager: 20, project: 15, client: 15, attendance: 10, innovation: 5, recognition: 5 })).toThrow();
  });
});

describe('calculateTargetAchievement', () => {
  it('returns normalized achievement with a cap', () => {
    expect(calculateTargetAchievement(9, 10)).toBe(90);
    expect(calculateTargetAchievement(12, 10)).toBe(100);
  });
});
