import Anthropic from '@anthropic-ai/sdk';
import type { LeadType, Temperature } from './types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export interface Qualified {
  lead_type: LeadType;
  suburb: string | null;
  temperature: Temperature;
  summary: string;
}

// Meta's 2026 rules require AI to perform a concrete task (here: classify a lead),
// not open-ended chat. Haiku is fast + cheap for this.
export async function qualifyLead(message: string): Promise<Qualified> {
  const farming = 'Barbeque Downs, Blue Hills, Carlswald, Noordwyk, Halfway Gardens, Vorna Valley, Summerset, Glen Austin, Beaulieu, Saddlebrook Estate, Bridle Park, Glenferness';
  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system:
        `You qualify inbound property leads for a Midrand estate agent whose farming area is: ${farming}. ` +
        `Given a message from a prospect, return ONLY minified JSON, no prose, no code fences, shaped as: ` +
        `{"lead_type":"seller|buyer|unknown","suburb":string|null,"temperature":"hot|warm|cold","summary":"one short line"}. ` +
        `hot = ready to act now / wants a valuation / ready to list; warm = interested, no urgency; cold = just browsing.`,
      messages: [{ role: 'user', content: message }],
    });
    const text = res.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('');
    const json = JSON.parse(text.replace(/```json|```/g, '').trim());
    return {
      lead_type: json.lead_type ?? 'unknown',
      suburb: json.suburb ?? null,
      temperature: json.temperature ?? 'warm',
      summary: json.summary ?? message.slice(0, 120),
    };
  } catch (e) {
    console.error('qualifyLead failed', e);
    return { lead_type: 'unknown', suburb: null, temperature: 'warm', summary: message.slice(0, 120) };
  }
}
