'use client';

import { useState } from 'react';
import { validateAttendanceRows, type AttendanceImportRow } from '@/lib/attendance-import';

export default function AttendanceImportPage() {
  const [rows, setRows] = useState<AttendanceImportRow[]>([]);
  const [errors, setErrors] = useState<Array<{sourceRow:number;message:string}>>([]);
  function preview() {
    const result = validateAttendanceRows([
      { employeeCode: 'E001', date: '2026-08-01', status: 'PRESENT' },
      { employeeCode: 'E002', date: '2026-08-01', status: 'WORK_FROM_HOME' },
    ]);
    setRows(result.accepted); setErrors(result.errors);
  }
  return <main className="shell"><header className="topbar"><div><p className="eyebrow">Attendance</p><h1>Excel / CSV import</h1><p className="muted">Validate the company's existing attendance sheet before it is written to EERS.</p></div><span className="status">Admin / HR</span></header><section className="card"><p className="muted">Expected columns: employeeCode, date, status. Statuses: PRESENT, ABSENT, HALF_DAY, WORK_FROM_HOME, LEAVE.</p><button className="button" onClick={preview}>Preview validation</button></section><section className="card"><p className="eyebrow">Accepted rows</p>{rows.map((row) => <div className="table-row" key={`${row.employeeCode}-${row.date}`}><span>{row.employeeCode}</span><span>{row.date}</span><strong>{row.status}</strong></div>)}{errors.map((error) => <p className="form-message" key={error.sourceRow}>Row {error.sourceRow}: {error.message}</p>)}</section></main>;
}
