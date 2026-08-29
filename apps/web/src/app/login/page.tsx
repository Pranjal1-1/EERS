'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      setMessage('Enter your company email and password.');
      return;
    }
    setMessage('Authentication API will be connected in the next backend phase.');
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">EERS</p>
        <h1>Welcome back</h1>
        <p className="muted">Sign in with your company account to access employee performance and recognition.</p>
        <form onSubmit={submit} className="form">
          <label>Company email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" /></label>
          <button type="submit">Sign in</button>
          {message && <p className="form-message">{message}</p>}
        </form>
      </section>
    </main>
  );
}
