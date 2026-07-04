import { NextResponse } from 'next/server';
import { supabaseAdmin, AGENT_ID } from '@/lib/supabase/admin';
import { sendTemplate } from '@/lib/whatsapp';

// Public endpoint. The website valuation form POSTs here.
// Runs with the service role so it can write a lead on Mercy's behalf (no session).
export async function POST(req: Request) {
  const { name, contact, suburb, timeline } = await req.json();
  if (!name || !contact) {
    return NextResponse.json({ error: 'Name and contact are required.' }, { status: 400 });
  }
  const isEmail = String(contact).includes('@');
  const db = supabaseAdmin();

  const { data: lead, error } = await db.from('leads').insert({
    agent_id: AGENT_ID,
    name,
    phone: isEmail ? null : contact,
    email: isEmail ? contact : null,
    suburb: suburb ?? null,
    timeline: timeline ?? null,
    source: 'website_valuation',
    lead_type: 'seller',
    temperature: 'hot',
    status: 'new',
    summary: `Valuation request — ${suburb ?? 'Midrand'}${timeline ? ' · ' + timeline : ''}`,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (process.env.WHATSAPP_NOTIFY_TO) {
    sendTemplate(process.env.WHATSAPP_NOTIFY_TO, 'new_lead', 'en', [name, suburb ?? 'Midrand']).catch(() => {});
  }
  return NextResponse.json({ ok: true, id: lead.id });
}
