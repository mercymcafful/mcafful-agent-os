import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const b = await req.json();
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { error } = await sb.from('listings').insert({
    agent_id: user.id,
    title: b.title, suburb: b.suburb, address: b.address,
    price: b.price ? Number(b.price) : null,
    beds: b.beds ? Number(b.beds) : null,
    baths: b.baths ? Number(b.baths) : null,
    garages: b.garages ? Number(b.garages) : null,
    status: b.status ?? 'active',
    description: b.description ?? null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
