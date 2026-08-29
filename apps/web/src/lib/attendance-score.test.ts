import { describe, expect, it } from 'vitest';
import { calculateAttendanceScore } from './attendance-score';

describe('calculateAttendanceScore', () => {
  it('scores full-credit days as 100', () => {
    expect(calculateAttendanceScore([{ status: 'PRESENT' }, { status: 'WORK_FROM_HOME' }, { status: 'OFFICIAL_WORK' }, { status: 'LEAVE' }, { status: 'HOLIDAY' }])).toBe(100);
  });
  it('accounts for half days and absences', () => {
    expect(calculateAttendanceScore([{ status: 'PRESENT' }, { status: 'HALF_DAY' }, { status: 'ABSENT' }])).toBe(50);
  });
  it('returns zero when there is no attendance data', () => {
    expect(calculateAttendanceScore([])).toBe(0);
  });
});
