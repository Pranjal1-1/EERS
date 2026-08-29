'use client';

import { useState } from 'react';
import { DEFAULT_PERFORMANCE_CONFIG, validatePerformanceConfig, type PerformanceConfig } from '@/lib/config';

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<PerformanceConfig>(DEFAULT_PERFORMANCE_CONFIG);
  const [message, setMessage] = useState('');
  function save() {
    try { validatePerformanceConfig(config); setMessage('Configuration validated. Persistence will be connected to the admin API.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Invalid configuration'); }
  }
  return <main className="shell">
    <header className="topbar"><div><p className="eyebrow">Administration</p><h1>Performance settings</h1><p className="muted">Configure the scoring and eligibility rules without changing application code.</p></div><span className="status">Admin / HR</span></header>
    <section className="card"><p className="eyebrow">Component weights</p><div className="grid">{Object.entries(config.componentWeights).map(([key, value]) => <label key={key}>{key}<input type="number" min="0" max="100" value={value} onChange={(e) => setConfig({ ...config, componentWeights: { ...config.componentWeights, [key]: Number(e.target.value) } })} /></label>)}</div><p className="muted">Total must equal 100%.</p></section>
    <section className="card"><p className="eyebrow">Eligibility</p><div className="grid"><label>Minimum annual finalized months<input type="number" min="1" max="12" value={config.minimumAnnualMonths} onChange={(e) => setConfig({ ...config, minimumAnnualMonths: Number(e.target.value) })} /></label><label>Minimum attendance score<input type="number" min="0" max="100" value={config.minimumAttendanceScore} onChange={(e) => setConfig({ ...config, minimumAttendanceScore: Number(e.target.value) })} /></label><label>Minimum overall score<input type="number" min="0" max="100" value={config.minimumOverallScore} onChange={(e) => setConfig({ ...config, minimumOverallScore: Number(e.target.value) })} /></label></div><button className="button" onClick={save}>Validate & save</button>{message && <p className="form-message">{message}</p>}</section>
  </main>;
}
