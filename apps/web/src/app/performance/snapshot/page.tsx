import { buildPerformanceSnapshot } from '@/lib/performance-engine';

const snapshot = buildPerformanceSnapshot({
  employeeId: 'E001', cycle: '2026-08',
  kpis: [{ id: 'revenue', name: 'Revenue', target: 100, weight: 60 }, { id: 'conversion', name: 'Conversion', target: 100, weight: 40 }],
  kpiActuals: { revenue: 94, conversion: 90 },
  attendance: [{ status: 'PRESENT' }, { status: 'PRESENT' }, { status: 'WORK_FROM_HOME' }],
  managerScore: 90, projectScore: 92, clientScore: 88, innovationScore: 85, recognitionScore: 80,
});

export default function PerformanceSnapshotPage() {
  return <main className="shell"><header className="topbar"><div><p className="eyebrow">Calculation snapshot</p><h1>Employee performance breakdown</h1><p className="muted">Every monthly recommendation can be explained through the component scores that produced it.</p></div></header><section className="card hero"><div><p className="muted">Overall score</p><strong>{snapshot.overallScore.toFixed(2)}</strong></div><span className="status">{snapshot.eligible ? 'Eligible' : 'Not eligible'}</span></section><section className="card"><p className="eyebrow">Score components</p><div className="table">{Object.entries(snapshot.components).map(([name, score]) => <div className="table-row" key={name}><span>{name}</span><strong>{score.toFixed(2)}</strong></div>)}</div><p className="muted">Cycle: {snapshot.cycle} · Generated: {new Date(snapshot.generatedAt).toLocaleString()}</p></section></main>;
}
