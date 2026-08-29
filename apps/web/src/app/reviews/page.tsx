'use client';

import { useState } from 'react';
import type { ReviewType } from '@/lib/review';

const types: ReviewType[] = ['MANAGER', 'PROJECT', 'CLIENT'];

export default function ReviewsPage() {
  const [type, setType] = useState<ReviewType>('MANAGER');
  const [score, setScore] = useState(90);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  function submit() {
    if (!comment.trim() || comment.trim().length < 10) return setMessage('Add a meaningful comment of at least 10 characters.');
    setMessage(`${type} review ready for submission at ${score}/100.`);
  }

  return <main className="shell">
    <header className="topbar"><div><p className="eyebrow">Performance evidence</p><h1>Manager, project & client reviews</h1><p className="muted">Capture structured qualitative evidence alongside measurable KPIs and attendance.</p></div></header>
    <section className="card"><label>Review type<select value={type} onChange={(e) => setType(e.target.value as ReviewType)}>{types.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Score<input type="number" min="0" max="100" value={score} onChange={(e) => setScore(Number(e.target.value))} /></label><label>Comment<textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Describe evidence supporting this score..." rows={5} /></label><label>Evidence reference (optional)<input placeholder="Project, client feedback, document or ticket reference" /></label><button className="button" onClick={submit}>Prepare submission</button>{message && <p className="form-message">{message}</p>}</section>
    <section className="card"><p className="eyebrow">Workflow</p><p className="muted">Draft → Submitted → Approved. Rejected reviews can be corrected and resubmitted. Every review stores the employee, reviewer, score, comment, evidence reference, status and timestamp.</p></section>
  </main>;
}
