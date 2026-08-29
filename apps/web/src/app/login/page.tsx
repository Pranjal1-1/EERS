'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(''); setBusy(true);
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error || 'Unable to sign in.'); return; }
      router.replace('/'); router.refresh();
    } catch { setMessage('Unable to reach the authentication service.'); }
    finally { setBusy(false); }
  }

  return (
    <main className="auth-shell"><section className="auth-card">
      <p className="eyebrow">EERS</p><h1>Welcome back</h1>
      <p className="muted">Sign in with your company account to access employee performance and recognition.</p>
      <form onSubmit={submit} className="form">
        <label>Company email<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" /></label>
        <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" /></label>
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        {message && <p className="form-message" role="alert">{message}</p>}
      </form>
    </section></main>
  );
}
