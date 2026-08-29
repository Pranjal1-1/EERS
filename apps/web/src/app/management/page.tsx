import Link from 'next/link';
import AttendanceImport from './attendance-import';

export const dynamic = 'force-dynamic';

type Dashboard = {
  cycle: string;
  employees: { total: number; active: number };
  attendanceScore: number;
  departments: Array<{ name: string; employeeCount: number; averageScore: number }>;
  topCandidates: Array<{ employeeId: string; employeeName: string; score: number; rank: number }>;
  pendingApprovals: number;
  pendingBonuses: number;
};

async function getDashboard(cycle: string): Promise<Dashboard> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const response = await fetch(`${base}/api/dashboard/management?cycle=${encodeURIComponent(cycle)}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load live management dashboard');
  const json = await response.json();
  return json.data;
}

export default async function ManagementPage({ searchParams }: { searchParams: Promise<{ cycle?: string }> }) {
  const params = await searchParams;
  const cycle = params.cycle && /^\d{4}-\d{2}$/.test(params.cycle) ? params.cycle : new Date().toISOString().slice(0, 7);
  let dashboard: Dashboard | null = null;
  let error = '';
  try { dashboard = await getDashboard(cycle); } catch (e) { error = e instanceof Error ? e.message : 'Unable to load dashboard'; }
  return <main className="shell">
    <header className="topbar"><div><p className="eyebrow">Management</p><h1>Employee performance dashboard</h1><p className="muted">Live workforce health, performance rankings and management actions.</p></div><form><label className="muted" htmlFor="cycle">Cycle</label><input id="cycle" name="cycle" type="month" defaultValue={cycle} /></form></header>
    {error ? <section className="card"><strong>Dashboard unavailable</strong><p className="muted">{error}</p></section> : dashboard ? <>
      <section className="grid">
        <article className="card"><p className="muted">Employees</p><strong>{dashboard.employees.active}/{dashboard.employees.total}</strong><p className="muted">active</p></article>
        <article className="card"><p className="muted">Attendance score</p><strong>{dashboard.attendanceScore.toFixed(1)}</strong><p className="muted">company average</p></article>
        <article className="card"><p className="muted">Pending approvals</p><strong>{dashboard.pendingApprovals}</strong><p className="muted">management action</p></article>
        <article className="card"><p className="muted">Pending bonuses</p><strong>{dashboard.pendingBonuses}</strong><p className="muted">finance action</p></article>
      </section>
      <AttendanceImport />
      <section className="card"><p className="eyebrow">Departments</p><div className="table">{dashboard.departments.map(d => <div className="table-row" key={d.name}><span>{d.name}</span><span>{d.employeeCount} employees</span><strong>{d.averageScore.toFixed(1)}</strong></div>)}</div></section>
      <section className="card"><p className="eyebrow">Top eligible candidates · {cycle}</p><div className="table">{dashboard.topCandidates.map(c => <Link className="table-row" href={`/performance/employee/${encodeURIComponent(c.employeeId)}?cycle=${encodeURIComponent(cycle)}`} key={c.employeeId}><span>#{c.rank}</span><span>{c.employeeName}</span><strong>{c.score.toFixed(2)}</strong><span>View performance →</span></Link>)}{dashboard.topCandidates.length === 0 && <p className="muted">No finalized eligible candidates yet.</p>}</div></section>
    </> : null}
  </main>;
}
