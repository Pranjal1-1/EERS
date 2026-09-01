'use client';

import { useState } from 'react';

type BonusStatus = 'PENDING' | 'APPROVED' | 'PROCESSED' | 'PAID';

const transitions: Record<BonusStatus, BonusStatus[]> = { PENDING: ['APPROVED'], APPROVED: ['PROCESSED'], PROCESSED: ['PAID'], PAID: [] };

export default function RewardsPage() {
  const [amount, setAmount] = useState(10000);
  const [status, setStatus] = useState<BonusStatus>('PENDING');
  const [certificate, setCertificate] = useState('Loading…');
  const [message, setMessage] = useState('');

  function approveBonus() {
    if (!Number.isFinite(amount) || amount < 0) { setMessage('Bonus amount must be a non-negative number'); return; }
    const next = transitions[status][0];
    if (!next) { setMessage(`Invalid bonus transition: ${status}`); return; }
    setStatus(next); setMessage('Bonus approved and ready for processing.');
  }

  return <main className="shell">
    <header className="topbar"><div><p className="eyebrow">Recognition</p><h1>Certificates & bonuses</h1><p className="muted">Manage reward records created after an approved Employee of the Month or Employee of the Year decision.</p></div></header>
    <section className="grid">
      <article className="card"><p className="muted">Certificate</p><strong>{certificate}</strong><p className="muted">Certificate identifier is generated on the server.</p></article>
      <article className="card"><p className="muted">Bonus status</p><strong>{status}</strong><p className="muted">Tracked through a controlled lifecycle.</p></article>
      <article className="card"><p className="muted">Bonus amount</p><strong>₹{amount.toLocaleString('en-IN')}</strong><input aria-label="Bonus amount" type="number" min="0" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></article>
      <article className="card"><p className="muted">Award types</p><strong>EOM + EOY</strong><p className="muted">Both award records use the same auditable reward workflow.</p></article>
    </section>
    <section className="card"><p className="eyebrow">Bonus approval</p><h2>Controlled status transitions</h2><p className="muted">Pending → Approved → Processed → Paid. Invalid jumps are rejected.</p><button className="button" onClick={approveBonus}>Approve bonus</button>{message && <p className="form-message">{message}</p>}</section>
  </main>;
}
