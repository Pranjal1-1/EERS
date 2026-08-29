'use client';

import { useState } from 'react';

export default function AttendanceImport() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function downloadTemplate() {
    const response = await fetch('/api/attendance/template');
    if (!response.ok) { setMessage('Unable to download template.'); return; }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'attendance-template.csv'; link.click(); URL.revokeObjectURL(url);
  }

  async function importAttendance() {
    if (!file) { setMessage('Choose a CSV file first.'); return; }
    setBusy(true); setMessage('Validating and importing…');
    try {
      const form = new FormData(); form.append('file', file);
      const response = await fetch('/api/attendance/import', { method: 'POST', body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Import failed');
      setMessage(`Successfully imported ${payload.imported} attendance record${payload.imported === 1 ? '' : 's'}.`);
      setFile(null);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Import failed'); }
    finally { setBusy(false); }
  }

  return <section className="card" aria-labelledby="attendance-import-title">
    <p className="eyebrow">Attendance</p>
    <h2 id="attendance-import-title">Import monthly attendance</h2>
    <p className="muted">Upload a validated CSV. Imports are transactional: if any row is invalid, no rows are committed.</p>
    <div className="actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
      <button type="button" onClick={downloadTemplate}>Download template</button>
      <label className="button" style={{ cursor: 'pointer' }}>
        Choose CSV
        <input type="file" accept=".csv,text/csv" hidden onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </label>
      <button type="button" onClick={importAttendance} disabled={!file || busy}>{busy ? 'Importing…' : 'Import attendance'}</button>
    </div>
    {file && <p className="muted" role="status">Selected: {file.name}</p>}
    {message && <p role="status">{message}</p>}
  </section>;
}
