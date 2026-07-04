// WhatsApp Business Cloud API (Meta). Cloud API is the only supported route since
// the On-Premises API was deprecated (Oct 2025). Free-form replies are only allowed
// inside the 24h customer-initiated window; outside it you must use an approved template.
const BASE = 'https://graph.facebook.com/v21.0';

export async function sendText(to: string, body: string) {
  const res = await fetch(`${BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  });
  if (!res.ok) console.error('WhatsApp sendText failed', await res.text());
  return res.ok;
}

// Outbound notification/marketing outside the 24h window needs an approved template.
export async function sendTemplate(to: string, template: string, lang = 'en', params: string[] = []) {
  const res = await fetch(`${BASE}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: template,
        language: { code: lang },
        components: params.length
          ? [{ type: 'body', parameters: params.map((t) => ({ type: 'text', text: t })) }]
          : undefined,
      },
    }),
  });
  if (!res.ok) console.error('WhatsApp sendTemplate failed', await res.text());
  return res.ok;
}
