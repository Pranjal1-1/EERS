import { Pool } from 'pg';
import type { AuditEvent } from './audit-log';
import type { AttendanceDay } from './attendance-score';

export type AttendanceImportRow = {
  employeeCode: string;
  date: string;
  status: AttendanceDay['status'];
};

export type AttendanceImportResult = { imported: number; auditEvent: AuditEvent };

export async function importAttendanceTransactional(
  rows: AttendanceImportRow[],
  actorUserId: string,
  auditEvent: AuditEvent,
): Promise<AttendanceImportResult> {
  if (typeof window !== 'undefined') throw new Error('Attendance persistence is server-only');
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error('DATABASE_URL is required for attendance persistence');
  if (!actorUserId || !auditEvent.id) throw new Error('Attendance import requires an authenticated actor and audit event');
  if (!rows.length) throw new Error('Attendance import contains no rows');

  const pool = new Pool({ connectionString: databaseUrl, max: 10, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let imported = 0;
    for (const row of rows) {
      const employee = await client.query('SELECT id FROM employees WHERE employee_id = $1 LIMIT 1', [row.employeeCode]);
      if (!employee.rows[0]) throw new Error(`Employee not found: ${row.employeeCode}`);
      await client.query(`INSERT INTO attendance_records (employee_id, attendance_date, status) VALUES ($1,$2,$3) ON CONFLICT (employee_id, attendance_date) DO UPDATE SET status = EXCLUDED.status`, [employee.rows[0].id, row.date, row.status]);
      imported++;
    }
    await client.query('INSERT INTO audit_events (id, action, actor_user_id, target_type, target_id, metadata, occurred_at) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)', [auditEvent.id, auditEvent.action, actorUserId, auditEvent.targetType, auditEvent.targetId, JSON.stringify(auditEvent.metadata), auditEvent.occurredAt]);
    await client.query('COMMIT');
    return { imported, auditEvent };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
