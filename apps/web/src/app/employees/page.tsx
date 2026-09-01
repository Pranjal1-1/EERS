'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type Department = { id: string; name: string };
type Employee = {
  id: string; employeeId: string; firstName: string; lastName: string; email: string;
  departmentId: string | null; designation: string | null; joiningDate: string | null; status: 'ACTIVE' | 'INACTIVE';
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ employeeId: '', firstName: '', lastName: '', email: '', departmentId: '', designation: '', joiningDate: '' });

  async function load() {
    setLoading(true); setError('');
    try {
      const [employeeResponse, departmentResponse] = await Promise.all([fetch('/api/employees'), fetch('/api/departments')]);
      const employeeData = await employeeResponse.json();
      const departmentData = await departmentResponse.json();
      if (!employeeResponse.ok) throw new Error(employeeData.error || 'Unable to load employees');
      if (!departmentResponse.ok) throw new Error(departmentData.error || 'Unable to load departments');
      setEmployees(employeeData.data ?? []);
      setDepartments(departmentData.data ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load data'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const departmentCounts = useMemo(() => departments.map((d) => ({ ...d, count: employees.filter((e) => e.departmentId === d.id).length })), [departments, employees]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(''); setError('');
    try {
      const response = await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        employeeId: form.employeeId, firstName: form.firstName, lastName: form.lastName, email: form.email,
        departmentId: form.departmentId || null, designation: form.designation || null, managerId: null,
        joiningDate: form.joiningDate || null, status: 'ACTIVE'
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to create employee');
      setEmployees((current) => [...current, result.data]);
      setForm({ employeeId: '', firstName: '', lastName: '', email: '', departmentId: '', designation: '', joiningDate: '' });
      setMessage('Employee created successfully.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create employee'); }
    finally { setSaving(false); }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div><p className="eyebrow">People</p><h1>Employees</h1><p className="muted">Manage employee records, departments, roles and reporting relationships.</p></div>
        <Link className="button" href="/">Dashboard</Link>
      </header>

      <section className="grid">
        {departmentCounts.map((department) => <article className="card" key={department.id}><p className="muted">Department</p><h2 className="small-title">{department.name}</h2><strong>{department.count}</strong><p className="muted">employees</p></article>)}
      </section>

      <section className="card">
        <p className="eyebrow">Add employee</p><h2>Create employee record</h2>
        <form onSubmit={submit} className="form">
          <div className="form-grid">
            <label>Employee ID<input required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="EMP-001" /></label>
            <label>Company email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" /></label>
            <label>First name<input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></label>
            <label>Last name<input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></label>
            <label>Department<select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}><option value="">Select department</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
            <label>Designation<input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Sales Executive" /></label>
            <label>Joining date<input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} /></label>
          </div>
          <button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create employee'}</button>
          {message && <p className="form-message">{message}</p>}
          {error && <p className="form-message" role="alert">{error}</p>}
        </form>
      </section>

      <section className="card">
        <p className="eyebrow">Employee directory</p><h2>Current employees</h2>
        {loading ? <p className="muted">Loading employees…</p> : employees.length === 0 ? <p className="muted">No employees yet. Use the form above to create the first record.</p> : (
          <div className="table-wrap"><table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Department</th><th>Designation</th><th>Status</th></tr></thead><tbody>
            {employees.map((employee) => <tr key={employee.id}><td>{employee.employeeId}</td><td>{employee.firstName} {employee.lastName}</td><td>{employee.email}</td><td>{departments.find((d) => d.id === employee.departmentId)?.name ?? '—'}</td><td>{employee.designation ?? '—'}</td><td>{employee.status}</td></tr>)}
          </tbody></table></div>
        )}
      </section>
    </main>
  );
}
