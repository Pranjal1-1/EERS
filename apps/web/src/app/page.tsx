import Link from 'next/link';

const metrics = [
  ['Employees', '10'],
  ['Departments', '3'],
  ['Monthly Avg.', '—'],
  ['Attendance', '—'],
];

const modules = [
  ['01', 'Employee Directory', 'Manage employee profiles, departments and roles.', '/employees'],
  ['02', 'Attendance', 'Import attendance and maintain an auditable record.', '/attendance'],
  ['03', 'Performance', 'Review KPI, manager, project, client and recognition evidence.', '/performance'],
  ['04', 'Awards', 'Recommend, approve and finalize Employee of the Month and Year.', '/awards'],
  ['05', 'Rewards', 'Manage bonuses and certificate issuance after finalization.', '/rewards'],
  ['06', 'Audit', 'Keep a traceable history of important decisions and changes.', '/admin'],
];

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">EERS · MANAGEMENT CONSOLE</p>
          <h1>Employee Excellence & Recognition System</h1>
          <p className="muted">One place to measure performance, recognize excellence and govern company-wide awards.</p>
        </div>
        <div className="actions">
          <Link className="button" href="/login">Sign in</Link>
          <Link className="button" href="/management">Management</Link>
          <span className="status">V1 · Active</span>
        </div>
      </header>

      <section className="grid">
        {metrics.map(([label, value]) => (
          <article className="card" key={label}>
            <p className="muted">{label}</p>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="card hero">
        <div>
          <p className="eyebrow">Current workflow</p>
          <h2>Evidence first. Recognition second.</h2>
          <p className="muted">EERS combines configurable KPIs, attendance, manager reviews, project outcomes, client feedback and recognition. The system recommends; authorized management makes the final decision.</p>
        </div>
        <div className="flow">
          <span>Work data</span><i>→</i><span>Score engine</span><i>→</i><span>Recommendation</span><i>→</i><span>Approval</span><i>→</i><span>Reward</span>
        </div>
      </section>

      <section className="module-grid">
        {modules.map(([number, title, description, href]) => (
          <Link className="card module" href={href} key={number}>
            <span className="module-number">{number}</span>
            <h3>{title}</h3>
            <p className="muted">{description}</p>
            <span className="module-link">Open module →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
