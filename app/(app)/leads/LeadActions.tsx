'use client';
import { useState } from 'react';

const NEXT: Record<string,string> = { new:'contacted', contacted:'appraisal_booked', appraisal_booked:'mandate' };

export default function LeadActions({ id, phone, status }: { id: string; phone: string | null; status: string }) {
  const [s, setS] = useState(status);
  async function advance() {
    const next = NEXT[s]; if (!next) return;
    setS(next);
    await fetch(`/api/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ status: next }) });
  }
  return (
    <div className="lead-actions">
      {phone && <a className="mini gold" href={`https://wa.me/${phone.replace(/\D/g,'')}`} target="_blank">WhatsApp</a>}
      {phone && <a className="mini" href={`tel:${phone}`}>Call</a>}
      <button className="mini outline" onClick={advance}>{s.replace('_',' ')} →</button>
    </div>
  );
}
