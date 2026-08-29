'use client';

import { useState } from 'react';
import { createCertificateNumber, transitionBonusStatus, validateBonusAmount, type BonusStatus } from '@/lib/rewards';

export default function RewardsPage() {
  const [amount, setAmount] = useState(10000);
  const [status, setStatus] = useState<BonusStatus>('PENDING');
  const [message, setMessage] = useState('');

  function approveBonus() {
    try { validateBonusAmount(amount); setStatus(transitionBonusStatus(status, 'APPROVED')); setMessage('Bonus approved and ready for processing.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to update bonus'); }
  }

  return <main className="shell">
    <header className="topbar"><div><p className="eyebrow">Recognition</p><h1>Certificates & bonuses</h1><p className="muted">Manage the reward records created after an approved Employee of the Month or Employee of the Year decision.</p></div></header>
    <section className="grid">
      <article className="card"><p className="muted">Certificate</p><strong>{createCertificateNumber('EMPLOYEE_OF_MONTH', new Date().getFullYear())}</strong><p className="muted">Unique certificate identifier</p></article>
      <article className="card"><p className="muted">Bonus status</p><strong>{status}</strong><p className="muted">Tracked through a controlled lifecycle</p></article>
      <article className="card"><p className="muted">Bonus amount</p><strong>₹{amount.toLocaleString('en-IN')}</strong><input aria-label="Bonus amount" type="number" min="0" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></article>
      <article className="card"><p className="muted">Award types</p><strong>EOM + EOY</strong><p className="muted">Both award records use the same auditable reward workflow.</p></article>
    </section>
    <section className="card"><p className="eyebrow">Bonus approval</p><h2>Controlled status transitions</h2><p className="muted">Pending → Approved → Processed → Paid. Invalid jumps are rejected.</p><button className="button" onClick={approveBonus}>Approve bonus</button>{message && <p className="form-message">{message}</p>}</section>
  </main>;
}
