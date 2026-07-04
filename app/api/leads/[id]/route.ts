import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { status, temperature } = await req.json();
  const sb = supabaseServer();
  const patch: Record<string, unknown> = {};
  if (status) patch.status = status;
  if (temperature) patch.temperature = temperature;
  const { error } = await sb.from('leads').update(patch).eq('id', params.id); // RLS scopes to Mercy
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
