'use client';

import { useMemo, useState } from 'react';
import { calculateOverallPerformance } from '@/lib/performance-cycle';

const demoKpis = [
  { id: 'sales', name: 'Revenue Achievement', target: 100, weight: 60 },
  { id: 'conversion', name: 'Conversion / Follow-up', target: 100, weight: 40 },
];

export default function PerformancePage() {
  const [managerScore, setManagerScore] = useState(90);
  const score = useMemo(() => calculateOverallPerformance({
    kpis: demoKpis,
    kpiActuals: { sales: 92, conversion: 88 },
    attendance: [{ status: 'PRESENT' }, { status: 'PRESENT' }, { status: 'HALF_DAY' }, { status: 'WORK_FROM_HOME' }],
    managerScore,
    projectScore: 90,
    clientScore: 92,
    innovationScore: 85,
    recognitionScore: 80,
  }), [managerScore]);

  return (
    <main className="shell">
      <header className="topbar"><div><p className="eyebrow">Performance</p><h1>Monthly performance cycle</h1><p className="muted">A transparent scoring workspace. Department KPIs can be configured independently while the company-wide model stays consistent.</p></div></header>
      <section className="grid">
        <article className="card"><p className="muted">Overall score</p><strong>{score}</strong></article>
        <article className="card"><p className="muted">KPI weight</p><strong>30%</strong></article>
        <article className="card"><p className="muted">Attendance weight</p><strong>10%</strong></article>
        <article className="card"><p className="muted">Cycle</p><strong>Monthly</strong></article>
      </section>
      <section className="card">
        <p className="eyebrow">Manager review</p><h2>Adjust review input</h2>
        <input aria-label="Manager score" type="range" min="0" max="100" value={managerScore} onChange={(e) => setManagerScore(Number(e.target.value))} style={{ width: '100%' }} />
        <p className="muted">Manager score: <strong>{managerScore}/100</strong>. Final rankings will be generated only after all required evidence is submitted and the cycle enters the approval stage.</p>
      </section>
    </main>
  );
}
