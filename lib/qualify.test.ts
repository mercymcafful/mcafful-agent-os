import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const { mockCreate } = vi.hoisted(() => {
  const mockCreate = vi.fn();
  return { mockCreate };
});

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate };
  },
}));

import { qualifyAndReply, FALLBACK_REPLY } from "./qualify";

describe("qualifyAndReply", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns the parsed qualification and reply when a listing matches", async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            lead_type: "buyer",
            suburb: "Beaulieu",
            temperature: "hot",
            summary: "Wants the price of the Beaulieu house",
            reply:
              "Hi, the Beaulieu home is listed at R6.2 million. This is Mercy Baloyi, happy to arrange a viewing.",
          }),
        },
      ],
    });

    const result = await qualifyAndReply("What's the price of the Beaulieu house?", [
      { suburb: "Beaulieu", address: "12 Example Road", price: 6200000, beds: 4, baths: 3 },
    ]);

    expect(result).toEqual({
      lead_type: "buyer",
      suburb: "Beaulieu",
      temperature: "hot",
      summary: "Wants the price of the Beaulieu house",
      reply:
        "Hi, the Beaulieu home is listed at R6.2 million. This is Mercy Baloyi, happy to arrange a viewing.",
    });
  });

  it("answers conversationally when no listing matches the query", async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            lead_type: "unknown",
            suburb: null,
            temperature: "cold",
            summary: "Asked if she sells in Ghana",
            reply:
              "Hi, this is Mercy Baloyi. I'm based in Johannesburg and don't have listings in Ghana yet.",
          }),
        },
      ],
    });

    const result = await qualifyAndReply("Do you sell houses in Ghana too?", []);

    expect(result.lead_type).toBe("unknown");
    expect(result.reply).toContain("Mercy Baloyi");
  });

  it("falls back to the safe-default reply on malformed JSON", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "not json at all" }],
    });

    const result = await qualifyAndReply("Hi there", []);

    expect(result).toEqual({
      lead_type: "unknown",
      suburb: null,
      temperature: "warm",
      summary: "Hi there",
      reply: FALLBACK_REPLY,
    });
  });

  it("falls back to the safe-default reply when the Anthropic call throws", async () => {
    mockCreate.mockRejectedValue(new Error("network error"));

    const result = await qualifyAndReply("Hi there", []);

    expect(result.reply).toBe(FALLBACK_REPLY);
  });

  it("falls back to the safe-default reply when the model returns an empty reply field", async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            lead_type: "unknown",
            suburb: null,
            temperature: "warm",
            summary: "Hi there",
            reply: "",
          }),
        },
      ],
    });

    const result = await qualifyAndReply("Hi there", []);

    expect(result.reply).toBe(FALLBACK_REPLY);
  });
});
