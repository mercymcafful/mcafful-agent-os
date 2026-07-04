'use client';
import { useState } from 'react';

export default function ValuationForm() {
  const [f, setF] = useState({ name: '', contact: '', suburb: '', timeline: 'Just curious about the value' });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    if (!f.name || !f.contact) { setErr('Please add your name and a way to reach you.'); return; }
    setBusy(true); setErr('');
    const res = await fetch('/api/leads', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f),
    });
    setBusy(false);
    if (res.ok) setDone(true); else setErr('Something went wrong — please try again.');
  }

  if (done) return (
    <div className="val-done">
      <p className="serif" style={{ fontSize: '1.35rem' }}>Request received.</p>
      <p>Thanks — I&apos;ll be in touch within 24 hours with your valuation.</p>
    </div>
  );

  return (
    <div className="val-form">
      <h3>Request my free valuation</h3>
      <label>Your name<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Thabo Nkosi" /></label>
      <label>Phone or email<input value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} placeholder="How should I reach you?" /></label>
      <label>Suburb / address<input value={f.suburb} onChange={(e) => setF({ ...f, suburb: e.target.value })} placeholder="e.g. Shetland St, Beaulieu" /></label>
      <label>When are you thinking of selling?
        <select value={f.timeline} onChange={(e) => setF({ ...f, timeline: e.target.value })}>
          <option>Just curious about the value</option>
          <option>Within 3 months</option>
          <option>3–6 months</option>
          <option>Already ready to list</option>
        </select>
      </label>
      {err && <p className="err">{err}</p>}
      <button className="btn-gold" onClick={submit} disabled={busy}>{busy ? 'Sending…' : 'Request my free valuation →'}</button>
    </div>
  );
}
