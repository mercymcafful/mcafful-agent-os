import { getPipeline } from '@/lib/queries';
const rand = (n: number|null) => n ? 'R ' + Number(n).toLocaleString('en-ZA') : '—';

export const dynamic = 'force-dynamic';
export default async function PipelinePage() {
  const cols = await getPipeline();
  const empty = cols.every(c => c.deals.length === 0);
  return (
    <div className="view">
      <h1 className="page-h">Deal Pipeline</h1>
      <p className="page-sub">From first enquiry to registration — nothing falls through the cracks.</p>
      {empty && <div className="empty">No deals yet. Run <code>npm run seed</code> or convert a lead into a deal.</div>}
      <div className="kanban">
        {cols.map((c) => (
          <div className="col" key={c.stage}>
            <div className="col-h">{c.label}<span className="cnt">{c.deals.length}</span></div>
            {c.deals.map((d: any) => (
              <div className="deal" key={d.id}>
                <div className="d-price">{rand(d.otp_amount ?? d.listings?.price)}</div>
                <div className="d-addr">{d.listings?.address ?? d.listings?.title ?? 'Untitled'}</div>
                <div className="d-meta">{d.listings?.suburb ?? ''}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
