'use client';

import { useState } from 'react';

const columns = ['Employee ID', 'Date', 'Status', 'Check In', 'Check Out'];

export default function AttendancePage() {
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');

  function handleFile(file?: File) {
    if (!file) return;
    const allowed = /\.(xlsx|xls|csv)$/i.test(file.name);
    if (!allowed) return setMessage('Upload an Excel (.xlsx/.xls) or CSV attendance file.');
    setFileName(file.name);
    setMessage('File selected. Mapping and validation will run before import.');
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div><p className="eyebrow">Operations</p><h1>Attendance Import</h1><p className="muted">Bring the company’s existing Excel attendance workflow into EERS without losing validation or auditability.</p></div>
      </header>
      <section className="card">
        <p className="eyebrow">Step 1 · Upload</p>
        <label className="upload"><span>Choose attendance file</span><input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => handleFile(e.target.files?.[0])} /></label>
        {fileName && <p className="muted">Selected: <strong>{fileName}</strong></p>}
        {message && <p className="form-message">{message}</p>}
      </section>
      <section className="card">
        <p className="eyebrow">Step 2 · Expected mapping</p>
        <div className="table"><div className="table-row table-head">{columns.map((c) => <span key={c}>{c}</span>)}</div><div className="table-row">{columns.map((c) => <span key={c}>{c === 'Status' ? 'PRESENT / ABSENT / LEAVE…' : '—'}</span>)}</div></div>
        <p className="muted">Before committing records, EERS will validate employee IDs, dates and statuses, detect duplicate employee/date entries, show a preview, and record the import in the audit trail.</p>
      </section>
    </main>
  );
}
