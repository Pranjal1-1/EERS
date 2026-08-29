import { DEFAULT_DEPARTMENT_KPI_TEMPLATES } from '@/lib/kpi-templates';

export default function KpiAssignmentsPage() {
  return <main className="shell">
    <header className="topbar"><div><p className="eyebrow">Administration</p><h1>Employee KPI assignments</h1><p className="muted">Assign a department template to an employee, then record monthly actuals against the configured targets.</p></div><span className="status">Admin / HR</span></header>
    <section className="card"><p className="eyebrow">Assignment workflow</p><div className="table"><div className="table-row table-head"><span>Employee</span><span>Department template</span><span>Cycle</span></div><div className="table-row"><span>Select employee</span><span>{DEFAULT_DEPARTMENT_KPI_TEMPLATES[0].departmentName}</span><span>Monthly</span></div></div><p className="muted">An employee should have one active department KPI template per performance cycle. Historical assignments remain immutable when a department or template changes.</p></section>
  </main>;
}
