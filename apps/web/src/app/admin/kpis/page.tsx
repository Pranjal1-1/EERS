import { DEFAULT_DEPARTMENT_KPI_TEMPLATES } from '@/lib/kpi-templates';

export default function AdminKpisPage() {
  return <main className="shell">
    <header className="topbar"><div><p className="eyebrow">Administration</p><h1>Department KPI templates</h1><p className="muted">Configure measurable targets for each department instead of judging every role by the same criteria.</p></div><span className="status">Admin / HR</span></header>
    {DEFAULT_DEPARTMENT_KPI_TEMPLATES.map((template) => <section className="card" key={template.departmentId}><p className="eyebrow">{template.departmentName}</p><div className="table">{template.kpis.map((kpi) => <div className="table-row" key={kpi.id}><span>{kpi.name}</span><span>Target: {kpi.target}</span><strong>{kpi.weight}%</strong></div>)}</div></section>)}
  </main>;
}
