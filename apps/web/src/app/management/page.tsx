import { buildDashboardSummary } from '@/lib/dashboard';

const summary = buildDashboardSummary({
  totalEmployees: 10,
  activeEmployees: 10,
  departments: [
    { name: 'Sales & Presales', employeeCount: 4, averageScore: 89 },
    { name: 'Installation / Engineering & Service', employeeCount: 4, averageScore: 86 },
    { name: 'Payment Follow-up', employeeCount: 2, averageScore: 91 },
  ],
  topCandidates: [
    { employeeId: 'E001', employeeName: 'Candidate A', score: 94.2, rank: 1 },
    { employeeId: 'E002', employeeName: 'Candidate B', score: 91.7, rank: 2 },
    { employeeId: 'E003', employeeName: 'Candidate C', score: 89.4, rank: 3 },
  ],
  pendingApprovals: 2,
  pendingBonuses: 1,
  attendanceScore: 94,
});

export default function ManagementPage() {
  return <main className="shell">
    <header className="topbar"><div><p className="eyebrow">Management</p><h1>Employee performance dashboard</h1><p className="muted">A company-wide view of workforce health, performance rankings and actions awaiting management attention.</p></div><span className="status">Monthly cycle · Review</span></header>
    <section className="grid">
      <article className="card"><p className="muted">Employees</p><strong>{summary.activeEmployees}/{summary.totalEmployees}</strong><p className="muted">active</p></article>
      <article className="card"><p className="muted">Attendance score</p><strong>{summary.attendanceScore}</strong><p className="muted">company average</p></article>
      <article className="card"><p className="muted">Pending approvals</p><strong>{summary.pendingApprovals}</strong><p className="muted">management action</p></article>
      <article className="card"><p className="muted">Pending bonuses</p><strong>{summary.pendingBonuses}</strong><p className="muted">finance action</p></article>
    </section>
    <section className="card"><p className="eyebrow">Departments</p><div className="table">{summary.departments.map((department) => <div className="table-row" key={department.name}><span>{department.name}</span><span>{department.employeeCount} employees</span><strong>{department.averageScore.toFixed(1)}</strong></div>)}</div></section>
    <section className="card"><p className="eyebrow">Top candidates</p><div className="table">{summary.topCandidates.map((candidate) => <div className="table-row" key={candidate.employeeId}><span>#{candidate.rank}</span><span>{candidate.employeeName}</span><strong>{candidate.score.toFixed(2)}</strong></div>)}</div></section>
  </main>;
}
