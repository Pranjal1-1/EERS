import { validateAttendanceRows, type AttendanceImportResult, type AttendanceImportRow } from './attendance';

const required = ['employeeId', 'date', 'status'];

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { cells.push(cell.trim()); cell = ''; }
    else cell += char;
  }
  cells.push(cell.trim());
  return cells;
}

export function parseAttendanceCsv(csv: string, existingKeys = new Set<string>()): AttendanceImportResult {
  const lines = csv.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (!lines.length) return { valid: [], errors: [{ row: 1, message: 'The file is empty' }], duplicates: [] };

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) return { valid: [], errors: [{ row: 1, message: `Missing required column(s): ${missing.join(', ')}` }], duplicates: [] };

  const rows: AttendanceImportRow[] = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const record = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']));
    return {
      employeeId: record.employeeId ?? '',
      date: record.date ?? '',
      status: (record.status ?? '').toUpperCase() as AttendanceImportRow['status'],
      checkIn: record.checkIn || undefined,
      checkOut: record.checkOut || undefined,
    };
  });

  return validateAttendanceRows(rows, existingKeys);
}
