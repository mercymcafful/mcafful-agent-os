import { NextResponse } from 'next/server';
import { supabaseAdmin, AGENT_ID } from '@/lib/supabase/admin';
import { qualifyLead } from '@/lib/qualify';
import { sendText } from '@/lib/whatsapp';

// Meta verifies the webhook with a GET challenge.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// Inbound messages arrive here. GBP "message me" enquiries route through WhatsApp,
// so this one webhook captures both Google-profile chats and click-to-WhatsApp.
export async function POST(req: Request) {
  const body = await req.json();
  try {
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];
    if (!msg) return NextResponse.json({ ok: true }); // status update, ignore

    const from = msg.from as string;
    const text = msg.text?.body ?? '';
    const profileName = value?.contacts?.[0]?.profile?.name ?? null;
    const db = supabaseAdmin();

    const q = await qualifyLead(text || 'New WhatsApp enquiry');

    // Upsert the lead (one open lead per phone number).
    const { data: existing } = await db.from('leads').select('id')
      .eq('agent_id', AGENT_ID).eq('phone', from).not('status', 'in', '(lost)').limit(1);

    let leadId = existing?.[0]?.id as string | undefined;
    if (!leadId) {
      const { data } = await db.from('leads').insert({
        agent_id: AGENT_ID, name: profileName, phone: from,
        suburb: q.suburb, source: 'whatsapp', lead_type: q.lead_type,
        temperature: q.temperature, status: 'new', summary: q.summary,
      }).select('id').single();
      leadId = data?.id;
    }

    await db.from('channel_messages').insert({
      agent_id: AGENT_ID, channel: 'whatsapp', direction: 'in',
      wa_from: from, wa_message_id: msg.id, body: text, payload: msg, lead_id: leadId,
    });

    // Auto-reply inside the free 24h service window (concrete task, per Meta 2026 rules).
    await sendText(from,
      'Thanks for reaching out to McAfful — this is Mercy\'s line. I\'ve got your message and will reply personally shortly. Meanwhile, browse current homes at mcafful.co.za.'
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('whatsapp webhook error', e);
    return NextResponse.json({ ok: true }); // always 200 so Meta doesn't retry-storm
  }
}
