export type AttendanceImportRow = { employeeCode: string; date: string; status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'WORK_FROM_HOME' | 'LEAVE'; sourceRow: number };
export type AttendanceImportResult = { accepted: AttendanceImportRow[]; errors: Array<{ sourceRow: number; message: string }> };

const statuses = new Set<AttendanceImportRow['status']>(['PRESENT','ABSENT','HALF_DAY','WORK_FROM_HOME','LEAVE']);

export function validateAttendanceRows(rows: Array<Record<string, unknown>>): AttendanceImportResult {
  const accepted: AttendanceImportRow[] = [];
  const errors: AttendanceImportResult['errors'] = [];
  rows.forEach((row, index) => {
    const sourceRow = index + 2;
    const employeeCode = String(row.employeeCode ?? row.employee_code ?? '').trim();
    const date = String(row.date ?? '').trim();
    const status = String(row.status ?? '').trim().toUpperCase() as AttendanceImportRow['status'];
    if (!employeeCode) return errors.push({ sourceRow, message: 'Employee code is required' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) return errors.push({ sourceRow, message: 'Date must be YYYY-MM-DD' });
    if (!statuses.has(status)) return errors.push({ sourceRow, message: `Invalid attendance status: ${status}` });
    accepted.push({ employeeCode, date, status, sourceRow });
  });
  return { accepted, errors };
}
