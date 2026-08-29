const metrics = [
  ['Employees', '10'],
  ['Departments', '3'],
  ['Monthly Avg.', '—'],
  ['Attendance', '—'],
];

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">EERS</p>
          <h1>Employee Excellence & Recognition System</h1>
          <p className="muted">Performance, recognition and awards — built around fair, measurable outcomes.</p>
        </div>
        <span className="status">Foundation</span>
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
          <p className="eyebrow">Performance cycle</p>
          <h2>Build the evidence before choosing the winner.</h2>
          <p className="muted">EERS combines configurable KPIs, attendance, manager reviews, project outcomes and client feedback. AI provides analysis; authorized management makes the final decision.</p>
        </div>
        <div className="flow">
          <span>Work data</span><i>→</i><span>Score engine</span><i>→</i><span>AI insight</span><i>→</i><span>Approval</span>
        </div>
      </section>
    </main>
  );
}
