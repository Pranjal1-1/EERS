import type { AttendanceImportRow } from './attendance-import';

export type TransactionClient = {
  query<T = unknown>(text: string, values?: readonly unknown[]): Promise<{ rows: T[]; rowCount: number | null }>;
  release(): void;
};

export type TransactionPool = { connect(): Promise<TransactionClient> };

export type AttendanceImportResult = {
  imported: number;
  auditEventId: string;
};

export async function persistAttendanceImport(
  pool: TransactionPool,
  rows: AttendanceImportRow[],
  actorUserId: string,
  auditEventId: string,
): Promise<AttendanceImportResult> {
  if (!actorUserId.trim()) throw new Error('Authenticated actor is required');
  if (!auditEventId.trim()) throw new Error('Audit event id is required');
  if (!rows.length) throw new Error('No validated attendance rows to import');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      await client.query(
        `INSERT INTO attendance_records (employee_id, attendance_date, status, source)
         SELECT id, $2::date, $3, 'EXCEL_IMPORT' FROM employees WHERE employee_code = $1
         ON CONFLICT (employee_id, attendance_date) DO UPDATE SET status = EXCLUDED.status, source = EXCLUDED.source`,
        [row.employeeCode, row.date, row.status],
      );
    }
    await client.query(
      `INSERT INTO audit_events (id, action, actor_user_id, target_type, target_id, metadata)
       VALUES ($1, 'ATTENDANCE_IMPORT', $2, 'ATTENDANCE_IMPORT', $1, $3::jsonb)`,
      [auditEventId, actorUserId, JSON.stringify({ rows: rows.length })],
    );
    await client.query('COMMIT');
    return { imported: rows.length, auditEventId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
