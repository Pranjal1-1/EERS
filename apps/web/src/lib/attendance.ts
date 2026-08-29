export type AttendanceImportRow = {
  employeeId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'WORK_FROM_HOME' | 'OFFICIAL_WORK' | 'HOLIDAY';
  checkIn?: string;
  checkOut?: string;
};

export type AttendanceImportResult = {
  valid: AttendanceImportRow[];
  errors: Array<{ row: number; message: string }>;
  duplicates: AttendanceImportRow[];
};

const statuses = new Set<AttendanceImportRow['status']>(['PRESENT','ABSENT','HALF_DAY','LEAVE','WORK_FROM_HOME','OFFICIAL_WORK','HOLIDAY']);

export function validateAttendanceRows(rows: AttendanceImportRow[], existingKeys = new Set<string>()): AttendanceImportResult {
  const valid: AttendanceImportRow[] = [];
  const errors: Array<{ row: number; message: string }> = [];
  const duplicates: AttendanceImportRow[] = [];
  const seen = new Set(existingKeys);

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    if (!row.employeeId?.trim()) return errors.push({ row: rowNumber, message: 'Employee ID is required' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) return errors.push({ row: rowNumber, message: 'Date must use YYYY-MM-DD' });
    if (!statuses.has(row.status)) return errors.push({ row: rowNumber, message: 'Invalid attendance status' });
    const key = `${row.employeeId.trim()}:${row.date}`;
    if (seen.has(key)) return duplicates.push(row);
    seen.add(key);
    valid.push({ ...row, employeeId: row.employeeId.trim() });
  });

  return { valid, errors, duplicates };
}
