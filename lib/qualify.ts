import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ListingContext {
  suburb: string | null;
  address: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
}

export interface QualifiedReply {
  lead_type: "seller" | "buyer" | "unknown";
  suburb: string | null;
  temperature: "hot" | "warm" | "cold";
  summary: string;
  reply: string;
}

const FARMING_AREAS = [
  "Barbeque Downs",
  "Blue Hills",
  "Carlswald",
  "Noordwyk",
  "Halfway Gardens",
  "Vorna Valley",
  "Summerset",
  "Glen Austin",
  "Beaulieu",
  "Saddlebrook Estate",
  "Bridle Park",
  "Glenferness",
];

export const FALLBACK_REPLY =
  "Thanks for reaching out — this is Mercy Baloyi. I've received your message and will get back to you personally shortly.";

function buildSystemPrompt(listings: ListingContext[]): string {
  return `You are replying on WhatsApp as Mercy Baloyi, an independent estate agent whose farming area is: ${FARMING_AREAS.join(
    ", "
  )}.

Current active listings — the ONLY facts you may use when answering questions about specific properties. Never invent a price, address, suburb, or availability that isn't in this list. If nothing here answers the question, say so honestly rather than guessing:
${JSON.stringify(listings)}

Do two things from the lead's inbound WhatsApp message:
1. Qualify the lead.
2. Write a short WhatsApp reply (2-4 sentences) that directly answers what they asked. Sign off naturally as Mercy Baloyi. Never mention any agency name or affiliation.

Return ONLY minified JSON (no prose, no code fences) shaped exactly:
{"lead_type":"seller|buyer|unknown","suburb":string|null,"temperature":"hot|warm|cold","summary":"one short line","reply":"the WhatsApp reply text"}

Where hot = ready to act/wants a valuation/ready to list, warm = interested but no urgency, cold = just browsing.`;
}

function safeDefault(message: string): QualifiedReply {
  return {
    lead_type: "unknown",
    suburb: null,
    temperature: "warm",
    summary: message.slice(0, 120),
    reply: FALLBACK_REPLY,
  };
}

export async function qualifyAndReply(
  message: string,
  listings: ListingContext[]
): Promise<QualifiedReply> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: buildSystemPrompt(listings),
      messages: [{ role: "user", content: message }],
    });

    const block = response.content[0];
    if (!block || block.type !== "text") {
      return safeDefault(message);
    }

    const cleaned = block.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const leadType: QualifiedReply["lead_type"] =
      parsed?.lead_type === "seller" || parsed?.lead_type === "buyer"
        ? parsed.lead_type
        : "unknown";

    const temperature: QualifiedReply["temperature"] =
      parsed?.temperature === "hot" || parsed?.temperature === "cold"
        ? parsed.temperature
        : "warm";

    const suburb: string | null =
      typeof parsed?.suburb === "string" ? parsed.suburb : null;

    const summary: string =
      typeof parsed?.summary === "string" && parsed.summary.trim() !== ""
        ? parsed.summary
        : message.slice(0, 120);

    const reply: string =
      typeof parsed?.reply === "string" && parsed.reply.trim() !== ""
        ? parsed.reply
        : FALLBACK_REPLY;

    return { lead_type: leadType, suburb, temperature, summary, reply };
  } catch (error) {
    console.error("qualifyAndReply error:", error);
    return safeDefault(message);
  }
}
