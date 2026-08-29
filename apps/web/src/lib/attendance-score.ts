export type AttendanceDay = { status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'WORK_FROM_HOME' | 'OFFICIAL_WORK' | 'HOLIDAY' };

const credit: Record<AttendanceDay['status'], number> = {
  PRESENT: 1, WORK_FROM_HOME: 1, OFFICIAL_WORK: 1, HOLIDAY: 1, HALF_DAY: 0.5, LEAVE: 1, ABSENT: 0,
};

export function calculateAttendanceScore(days: AttendanceDay[]): number {
  if (!days.length) return 0;
  const score = days.reduce((sum, day) => sum + credit[day.status], 0) / days.length * 100;
  return Math.round(Math.min(100, Math.max(0, score)) * 100) / 100;
}
