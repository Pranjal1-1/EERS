import Link from 'next/link';

const departments = [
  { name: 'Sales & Presales', count: 0 },
  { name: 'Installation / Engineering & Service', count: 0 },
  { name: 'Payment Follow-up', count: 0 },
];

export default function EmployeesPage() {
  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">People</p>
          <h1>Employees</h1>
          <p className="muted">Manage employee records, departments, roles and reporting relationships.</p>
        </div>
        <Link className="button" href="/">Dashboard</Link>
      </header>
      <section className="grid">
        {departments.map((department) => (
          <article className="card" key={department.name}>
            <p className="muted">Department</p>
            <h2 className="small-title">{department.name}</h2>
            <strong>{department.count}</strong>
            <p className="muted">employees</p>
          </article>
        ))}
      </section>
      <section className="card">
        <p className="eyebrow">Employee directory</p>
        <h2>Ready for database-backed records</h2>
        <p className="muted">The employee domain model and relational schema are now in place. The next backend step will connect this interface to authenticated CRUD operations.</p>
      </section>
    </main>
  );
}
