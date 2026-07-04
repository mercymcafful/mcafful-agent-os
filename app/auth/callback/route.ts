import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/today';
  if (code) await supabaseServer().auth.exchangeCodeForSession(code);
  return NextResponse.redirect(`${origin}${next}`);
}
