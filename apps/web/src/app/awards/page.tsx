'use client';

import { useMemo } from 'react';
import { recommendWinner, rankCandidates, type Candidate } from '@/lib/award-ranking';

const candidates: Candidate[] = [
  { employeeId: 'E001', employeeName: 'Candidate A', score: 94.2, eligible: true },
  { employeeId: 'E002', employeeName: 'Candidate B', score: 91.7, eligible: true },
  { employeeId: 'E003', employeeName: 'Candidate C', score: 89.4, eligible: true },
];

export default function AwardsPage() {
  const ranked = useMemo(() => rankCandidates(candidates), []);
  const winner = useMemo(() => recommendWinner(candidates), []);
  return (
    <main className="shell">
      <header className="topbar"><div><p className="eyebrow">Recognition</p><h1>Employee of the Month</h1><p className="muted">Evidence-based recommendation for management approval. The system recommends; authorized management makes the final award decision.</p></div></header>
      <section className="card hero"><div><p className="eyebrow">Recommendation</p><h2>{winner ? winner.employeeName : 'No eligible candidate'}</h2><p className="muted">{winner ? `Score ${winner.score.toFixed(2)} · Rank #${winner.rank}` : 'Complete the performance cycle to generate a recommendation.'}</p></div><div className="status">Pending approval</div></section>
      <section className="card"><p className="eyebrow">Ranking</p><div className="table">{ranked.map((candidate) => <div className="table-row" key={candidate.employeeId}><span>#{candidate.rank}</span><span>{candidate.employeeName}</span><strong>{candidate.score.toFixed(2)}</strong></div>)}</div></section>
    </main>
  );
}
