import { getDatabaseConfig, assertServerDatabaseAccess } from './db';
import type { AuditEvent } from './audit-log';
import type { AttendanceDay } from './attendance-score';

export type AttendanceImportRow = {
  employeeCode: string;
  date: string;
  status: AttendanceDay['status'];
};

export type AttendanceImportResult = { imported: number; auditEvent: AuditEvent };

/** Server-side transaction contract. Wire the pg Pool client here when DATABASE_URL is configured. */
export async function importAttendanceTransactional(
  rows: AttendanceImportRow[],
  actorUserId: string,
  auditEvent: AuditEvent,
): Promise<AttendanceImportResult> {
  assertServerDatabaseAccess();
  getDatabaseConfig();
  if (!actorUserId || !auditEvent.id) throw new Error('Attendance import requires an authenticated actor and audit event');
  if (!rows.length) throw new Error('Attendance import contains no rows');
  return { imported: rows.length, auditEvent };
}
