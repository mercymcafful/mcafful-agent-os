'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostListing() {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title:'', suburb:'', address:'', price:'', beds:'', baths:'', garages:'' });
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function save() {
    setBusy(true);
    const res = await fetch('/api/listings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(f) });
    setBusy(false);
    if (res.ok) { setOpen(false); setF({ title:'', suburb:'', address:'', price:'', beds:'', baths:'', garages:'' }); router.refresh(); }
  }
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  if (!open) return <button className="btn-gold" style={{ marginBottom: 18 }} onClick={() => setOpen(true)}>+ Post a listing</button>;
  return (
    <div className="post-form">
      <input placeholder="Title (e.g. 4-bed family home)" value={f.title} onChange={set('title')} />
      <div className="row3">
        <input placeholder="Suburb" value={f.suburb} onChange={set('suburb')} />
        <input placeholder="Address" value={f.address} onChange={set('address')} />
        <input placeholder="Price (R)" value={f.price} onChange={set('price')} />
      </div>
      <div className="row3">
        <input placeholder="Beds" value={f.beds} onChange={set('beds')} />
        <input placeholder="Baths" value={f.baths} onChange={set('baths')} />
        <input placeholder="Garages" value={f.garages} onChange={set('garages')} />
      </div>
      <div className="post-actions">
        <button className="btn-gold" onClick={save} disabled={busy || !f.title}>{busy ? 'Posting…' : 'Publish to site'}</button>
        <button className="mini outline" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}
