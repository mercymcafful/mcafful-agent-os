import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface CMASubject {
  address: string;
  suburb: string;
  beds: number | null;
  baths: number | null;
  garages: number | null;
  erf_size: number | null;
  condition: string;
  notes: string | null;
}

export interface CMAComp {
  address: string;
  suburb: string;
  sold_price: number;
  beds: number | null;
  baths: number | null;
  sold_date: string | null;
  notes: string | null;
}

export interface CMAResult {
  low: number | null;
  recommended: number | null;
  high: number | null;
  rationale: string;
  marketing_note: string | null;
}

const SYSTEM_PROMPT = `You are an experienced Midrand estate agent producing a defensible CMA (Comparative Market Analysis).

Given a subject property and a list of comparable SOLD properties, reason about differences (size, condition, position, beds/baths, recency of sale) and return ONLY minified JSON (no prose, no code fences) shaped exactly:
{"low":number,"recommended":number,"high":number,"rationale":"2-3 short paragraphs explaining the price, referencing the comps","marketing_note":"1-2 lines on how to position/market this home"}

Prices in Rand. Be conservative and honest — priced to sell, not to flatter.`;

function insufficientCompsResult(): CMAResult {
  return {
    low: null,
    recommended: null,
    high: null,
    rationale:
      "Not enough comparable sales data was provided to produce a reliable valuation. Add more comps (ideally 3 or more recent, similar sales) and try again.",
    marketing_note: null,
  };
}

export async function generateCMA(
  subject: CMASubject,
  comps: CMAComp[]
): Promise<CMAResult> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: JSON.stringify({ subject, comps }) }],
    });

    const block = response.content[0];
    if (!block || block.type !== "text") {
      return insufficientCompsResult();
    }

    const cleaned = block.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const low = typeof parsed?.low === "number" ? parsed.low : null;
    const recommended =
      typeof parsed?.recommended === "number" ? parsed.recommended : null;
    const high = typeof parsed?.high === "number" ? parsed.high : null;
    const rationale =
      typeof parsed?.rationale === "string" && parsed.rationale.trim() !== ""
        ? parsed.rationale
        : insufficientCompsResult().rationale;
    const marketing_note =
      typeof parsed?.marketing_note === "string" ? parsed.marketing_note : null;

    return { low, recommended, high, rationale, marketing_note };
  } catch (error) {
    console.error("generateCMA error:", error);
    return insufficientCompsResult();
  }
}

// Placeholder for a future licensed comps source (e.g. Lightstone). Not
// implemented — comps are entered manually by the agent for now, since
// Property24/Private Property/portal data can't be scraped (copyrighted,
// against their terms) and no paid data API is wired up yet. When a
// licensed source is available, this would look up and return CMAComp[]
// for the subject property's area instead of relying on manual entry.
export async function fetchLicensedComps(
  _subject: CMASubject
): Promise<CMAComp[]> {
  throw new Error(
    "fetchLicensedComps is not implemented — no licensed comps source is configured yet."
  );
}
