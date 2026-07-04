import { getListings } from '@/lib/queries';
import PostListing from './PostListing';
const rand = (n: number|null) => n ? 'R ' + Number(n).toLocaleString('en-ZA') : '—';

export const dynamic = 'force-dynamic';
export default async function ListingsPage() {
  const listings = await getListings();
  return (
    <div className="view">
      <div className="page-head-row">
        <div><h1 className="page-h">My Listings</h1><p className="page-sub">What&apos;s live on your public site right now.</p></div>
      </div>
      <PostListing />
      <div className="adm-grid">
        {listings.map((l: any) => (
          <div className="adm-card" key={l.id}>
            <div className="adm-b">
              <div className="adm-top"><span className="d-price">{rand(l.price)}</span><span className={`status ${l.status}`}>{l.status.replace('_',' ')}</span></div>
              <div className="adm-title">{l.title}</div>
              <div className="muted">{[l.address, l.suburb].filter(Boolean).join(', ')}</div>
              <div className="adm-stats"><span>{l.views ?? 0} views</span><span>{l.enquiries ?? 0} enquiries</span><span>{l.beds ?? '—'} bd</span></div>
            </div>
          </div>
        ))}
        {listings.length === 0 && <div className="empty">No listings yet — post your first one above.</div>}
      </div>
    </div>
  );
}
