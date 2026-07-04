import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import Nav from './Nav';
import SignOut from './SignOut';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login');

  // make sure Mercy has a profile row (metrics/goal read from it)
  await sb.from('profiles').upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true });
  const { data: profile } = await sb.from('profiles').select('full_name').single();

  return (
    <div className="cockpit">
      <aside className="sidebar">
        <Link href="/today" className="side-brand">McAfful</Link>
        <Nav />
        <div className="side-agent">{profile?.full_name ?? user.email}</div>
        <Link href="/" className="side-foot">← View public site</Link>
        <SignOut />
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
