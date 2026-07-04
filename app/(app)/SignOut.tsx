'use client';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function SignOut() {
  const router = useRouter();
  return (
    <button className="side-foot" style={{ textAlign: 'left', background: 'none', border: 0, cursor: 'pointer' }}
      onClick={async () => { await supabaseBrowser().auth.signOut(); router.push('/login'); router.refresh(); }}>
      Sign out
    </button>
  );
}
