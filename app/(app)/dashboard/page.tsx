import { getMetrics } from '@/lib/queries';
const rand = (n: number) => 'R ' + Math.round(n).toLocaleString('en-ZA');

export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const m = await getMetrics();
  const pct = m.goal ? Math.min(100, Math.round((m.gci / m.goal) * 100)) : 0;
  const f = m.funnel;
  const rows: [string, number][] = [['Inbound leads', f.leads],['Valuations', f.valuations],['Mandates', f.mandates],['OTPs accepted', f.otps],['Registered', f.registered]];
  const max = Math.max(1, ...rows.map(r => r[1]));
  return (
    <div className="view">
      <h1 className="page-h">Performance</h1>
      <p className="page-sub">Your month against the numbers that make a top agent.</p>
      <div className="metrics">
        <div className="metric"><div className="m-lbl">GCI this month</div><div className="m-val">{rand(m.gci)}</div><div className="m-delta">{pct}% to {rand(m.goal)} goal</div><div className="bar"><i style={{ width: pct+'%' }} /></div></div>
        <div className="metric"><div className="m-lbl">Mandates</div><div className="m-val">{m.mandates}</div><div className="m-delta">{m.sole} sole</div></div>
        <div className="metric"><div className="m-lbl">OTPs accepted</div><div className="m-val">{m.otps}</div></div>
        <div className="metric"><div className="m-lbl">Registrations</div><div className="m-val">{m.registrations}</div><div className="m-delta">{rand(m.pipelineValue)} in transfer</div></div>
      </div>
      <div className="panel">
        <h3 style={{ marginTop: 0, fontFamily: 'Fraunces, serif' }}>Conversion funnel</h3>
        {rows.map(([label, n]) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.85rem', fontWeight:600, marginBottom:4 }}><span>{label}</span><span>{n}</span></div>
            <div className="bar"><i style={{ width: Math.round(n/max*100)+'%' }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
