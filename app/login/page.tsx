'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function signIn() {
    setBusy(true); setErr('');
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) setErr(error.message);
    else { router.push('/today'); router.refresh(); }
  }

  return (
    <main className="login-wrap">
      <div className="login-card">
        <div className="login-brand serif">McAfful</div>
        <p className="login-sub">Agent OS — sign in</p>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
        <label>Password<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password"
          onKeyDown={(e) => e.key === 'Enter' && signIn()} /></label>
        {err && <p className="login-err">{err}</p>}
        <button className="btn-gold" style={{ width: '100%' }} onClick={signIn} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="login-note">Create Mercy&apos;s user in Supabase → Authentication first.</p>
      </div>
    </main>
  );
}
