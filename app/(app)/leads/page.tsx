import { getLeads } from '@/lib/queries';
import LeadActions from './LeadActions';

export const dynamic = 'force-dynamic';
const SRC: Record<string,string> = {
  website_valuation:'Website', whatsapp:'WhatsApp', google_call:'Google call',
  google_profile:'Google profile', property24:'Property24', private_property:'Private Property',
  referral:'Referral', other:'Other',
};

export default async function LeadsPage() {
  const leads = await getLeads();
  return (
    <div className="view">
      <h1 className="page-h">Inbound Leads</h1>
      <p className="page-sub">Every valuation request, WhatsApp and Google enquiry lands here — inbound prospecting, working while you sleep.</p>

      {leads.length === 0 && <div className="empty">No leads yet. Submit the valuation form on your public site (or run <code>npm run seed</code>) to see them flow in.</div>}

      {leads.map((l: any) => (
        <div className="lead-row" key={l.id}>
          <div className="lead-name">{l.name ?? 'Unknown'}<small>{l.phone ?? l.email ?? '—'}</small></div>
          <div className="lead-cell">{l.suburb ?? '—'}</div>
          <div className="lead-cell muted">{SRC[l.source] ?? l.source} · {l.lead_type}</div>
          <span className={`temp ${l.temperature}`}>{l.temperature.toUpperCase()}</span>
          <LeadActions id={l.id} phone={l.phone} status={l.status} />
        </div>
      ))}
    </div>
  );
}
