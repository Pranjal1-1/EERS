import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireUser } from '../../../../lib/api-auth';
import { PERFORMANCE_MANAGERS } from '../../../../lib/authorization';

export const runtime = 'nodejs';

const MAX_ROWS = 10000;
const VALID_STATUS = new Set(['PRESENT','ABSENT','LEAVE','HALF_DAY','P','A','L','HD']);

function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false;
  for (let i=0;i<text.length;i++) { const c=text[i]; if (c==='"') { if (quoted && text[i+1]==='"') { cell+='"'; i++; } else quoted=!quoted; } else if (c===',' && !quoted) { row.push(cell.trim()); cell=''; } else if ((c==='\n' || c==='\r') && !quoted) { if (c==='\r' && text[i+1]==='\n') i++; row.push(cell.trim()); cell=''; if (row.some(Boolean)) rows.push(row); row=[]; } else cell+=c; }
  if (quoted) throw new Error('CSV contains an unterminated quoted field');
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows;
}

export async function POST(request: Request) {
  try { await requireUser(PERFORMANCE_MANAGERS); } catch (error) { if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); throw error; }
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('text/csv') && !contentType.includes('multipart/form-data')) return NextResponse.json({ error: 'Send a CSV file' }, { status: 415 });
  let csv = '';
  try { if (contentType.includes('multipart/form-data')) { const form = await request.formData(); const file = form.get('file'); if (!(file instanceof File)) return NextResponse.json({ error: 'CSV file field is required' }, { status: 422 }); if (file.size > 5_000_000) return NextResponse.json({ error: 'CSV file exceeds 5 MB' }, { status: 413 }); csv = await file.text(); } else csv = await request.text(); } catch { return NextResponse.json({ error: 'Unable to read CSV upload' }, { status: 400 }); }
  let rows: string[][]; try { rows = parseCsv(csv); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid CSV' }, { status: 422 }); }
  if (rows.length < 2) return NextResponse.json({ error: 'CSV must contain a header and at least one data row' }, { status: 422 });
  if (rows.length - 1 > MAX_ROWS) return NextResponse.json({ error: `Maximum ${MAX_ROWS} rows per import` }, { status: 422 });
  const header = rows[0].map(x => x.toLowerCase()); const required = ['employee_code','attendance_date','status'];
  if (!required.every(x => header.includes(x))) return NextResponse.json({ error: 'CSV requires employee_code, attendance_date and status columns' }, { status: 422 });
  const ix = (name: string) => header.indexOf(name); const parsed: Array<[string,string,string,string]> = [];
  for (let i=1;i<rows.length;i++) { const r=rows[i]; const code=r[ix('employee_code')]; const date=r[ix('attendance_date')]; const status=r[ix('status')]?.toUpperCase(); if (!code || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !VALID_STATUS.has(status)) return NextResponse.json({ error: `Invalid row ${i+1}: employee_code, YYYY-MM-DD attendance_date and valid status are required` }, { status: 422 }); parsed.push([code,date,status,r[ix('source')] || 'IMPORT']); }
  const url=process.env.DATABASE_URL?.trim(); if (!url) return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 503 });
  const pool=new Pool({connectionString:url,max:5});
  try { await pool.query('BEGIN'); const results=[]; for (const [code,date,status,source] of parsed) { const q=await pool.query(`INSERT INTO attendance_records (employee_id,attendance_date,status,source) SELECT id,$2,$3,$4 FROM employees WHERE employee_code=$1 AND active=true ON CONFLICT (employee_id,attendance_date) DO UPDATE SET status=EXCLUDED.status,source=EXCLUDED.source RETURNING id,employee_id,attendance_date,status,source`,[code,date,status,source]); if (!q.rows[0]) throw new Error(`Active employee not found for employee_code ${code}`); results.push(q.rows[0]); } await pool.query('COMMIT'); return NextResponse.json({ imported:results.length, data:results }); }
  catch(error) { await pool.query('ROLLBACK'); console.error(error); return NextResponse.json({ error:error instanceof Error ? error.message : 'Attendance import failed; no rows were committed' }, { status:422 }); }
  finally { await pool.end(); }
}
