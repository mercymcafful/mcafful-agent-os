import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface QualifiedLead {
  lead_type: "seller" | "buyer" | "unknown";
  suburb: string | null;
  temperature: "hot" | "warm" | "cold";
  summary: string;
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

const SYSTEM_PROMPT = `You qualify inbound property leads for a Midrand estate agent whose farming area is: ${FARMING_AREAS.join(
  ", "
)}.

Return ONLY minified JSON (no prose, no code fences) shaped exactly:
{"lead_type":"seller|buyer|unknown","suburb":string|null,"temperature":"hot|warm|cold","summary":"one short line"}

Where hot = ready to act/wants a valuation/ready to list, warm = interested but no urgency, cold = just browsing.`;

function safeDefault(message: string): QualifiedLead {
  return {
    lead_type: "unknown",
    suburb: null,
    temperature: "warm",
    summary: message.slice(0, 120),
  };
}

export async function qualifyLead(message: string): Promise<QualifiedLead> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message }],
    });

    const block = response.content[0];
    if (!block || block.type !== "text") {
      return safeDefault(message);
    }

    const cleaned = block.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const leadType: QualifiedLead["lead_type"] =
      parsed?.lead_type === "seller" || parsed?.lead_type === "buyer"
        ? parsed.lead_type
        : "unknown";

    const temperature: QualifiedLead["temperature"] =
      parsed?.temperature === "hot" || parsed?.temperature === "cold"
        ? parsed.temperature
        : "warm";

    const suburb: string | null =
      typeof parsed?.suburb === "string" ? parsed.suburb : null;

    const summary: string =
      typeof parsed?.summary === "string" && parsed.summary.trim() !== ""
        ? parsed.summary
        : message.slice(0, 120);

    return { lead_type: leadType, suburb, temperature, summary };
  } catch (error) {
    console.error("qualifyLead error:", error);
    return safeDefault(message);
  }
}
