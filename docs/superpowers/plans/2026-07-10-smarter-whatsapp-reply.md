# Smarter WhatsApp Auto-Reply Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the WhatsApp webhook's single generic canned auto-reply with one AI-generated reply that answers the lead's actual question, using real active-listings data, signed as Mercy Baloyi.

**Architecture:** Merge the existing lead-qualification Claude call and a new reply-drafting step into a single Claude Haiku call (`qualifyAndReply`) that returns both the qualification fields and the reply text. The webhook route fetches current active listings first, passes them into that call, and sends whatever `reply` string comes back (falling back to a fixed safe-default reply on any failure).

**Tech Stack:** Next.js 14 (App Router) route handler, `@anthropic-ai/sdk` (Claude Haiku), Supabase (service-role client), Vitest (new — this project has no test runner yet).

## Global Constraints

- Replies are signed as **"Mercy Baloyi"** — never "McAfful", "Mercy McAfful", or any agency name/affiliation.
- The AI must only state facts present in the listings data it's given — never invent a price, address, suburb, or availability.
- One reply, then hand off — no multi-turn AI-handled conversation (existing behavior already limits the auto-reply to a lead's first contact; this is unchanged).
- The webhook must always return `200` quickly regardless of AI/listings success or failure — Meta retry-storms a webhook that errors or is slow.
- Lead capture (the `leads` table insert) must happen even if reply generation or sending fails — a failed WhatsApp send must never lose a lead.
- Use the cheapest viable model tier: `claude-haiku-4-5-20251001` (same model already used in this codebase).

---

## File Structure

- **Create:** `vitest.config.ts` — test runner config (alias `@/*`, node environment).
- **Modify:** `package.json` — add `vitest` devDependency and a `test` script.
- **Modify:** `lib/qualify.ts` — replace `qualifyLead()` with `qualifyAndReply()`, which qualifies and drafts the reply in one Claude call. Adds `ListingContext` input type and a `reply` field on the returned type.
- **Create:** `lib/qualify.test.ts` — unit tests for `qualifyAndReply()` covering a listing-match reply, a no-match conversational reply, and fallback on malformed JSON / a thrown error.
- **Modify:** `app/api/whatsapp/route.ts` — fetch active listings via a new local helper, call `qualifyAndReply()` instead of `qualifyLead()`, and send `qualified.reply` instead of the hardcoded canned string.

---

### Task 1: Add the Vitest test runner

This project has no test runner yet (`npm ls` shows no `jest`/`vitest`). Task 2 needs one to TDD `qualifyAndReply()`, so it's set up here first with a trivial smoke test proving it works end-to-end (including resolving the `@/*` path alias and handling the `server-only` package, which throws if imported un-mocked outside a React Server Component).

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/smoke.test.ts` (deleted at the end of this task once Task 2's real test file exists — it only exists to prove the runner works)
- Modify: `package.json`

**Interfaces:**
- Produces: a working `npm test` command that later tasks' test files rely on.

- [ ] **Step 1: Install Vitest**

Run: `npm install --save-dev vitest@^2`
Expected: `package.json`'s `devDependencies` gains a `vitest` entry; installs without error.

- [ ] **Step 2: Add the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 3: Add the `test` script**

Modify `package.json`'s `"scripts"` block from:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
```

to:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run"
  },
```

- [ ] **Step 4: Write a trivial smoke test**

Create `lib/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("vitest setup", () => {
  it("runs a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it to confirm the runner works**

Run: `npm test`
Expected: PASS — 1 test file, 1 test passed.

- [ ] **Step 6: Delete the smoke test**

It's served its purpose; Task 2 adds the real test file.

Run: `rm lib/smoke.test.ts` (or delete the file via your editor)

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "Add Vitest test runner"
```

---

### Task 2: Merge lead qualification and reply drafting into one Claude call

Replaces `qualifyLead()` (qualification only) with `qualifyAndReply()` (qualification + a WhatsApp reply that answers the lead's actual message, grounded in real listings data). Built test-first.

**Files:**
- Modify: `lib/qualify.ts` (currently: `QualifiedLead` interface, `qualifyLead(message)` — see full current content below)
- Create: `lib/qualify.test.ts`

**Interfaces:**
- Produces:
  - `interface ListingContext { suburb: string | null; address: string | null; price: number | null; beds: number | null; baths: number | null; }`
  - `interface QualifiedReply { lead_type: "seller" | "buyer" | "unknown"; suburb: string | null; temperature: "hot" | "warm" | "cold"; summary: string; reply: string; }`
  - `async function qualifyAndReply(message: string, listings: ListingContext[]): Promise<QualifiedReply>`
  - `FALLBACK_REPLY` (exported constant, the safe-default reply text) — Task 3 does not need this directly since `safeDefault()` already embeds it, but it's exported so the value is visible/testable in one place.
- Consumes: nothing from other tasks (this module has no dependency on Task 1 beyond the test runner existing).

- [ ] **Step 1: Write the failing tests**

Create `lib/qualify.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const mockCreate = vi.fn();

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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `lib/qualify.ts` does not export `qualifyAndReply` or `FALLBACK_REPLY` yet.

- [ ] **Step 3: Rewrite `lib/qualify.ts`**

Replace the full contents of `lib/qualify.ts` (currently exporting `QualifiedLead` and `qualifyLead`) with:

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — 5 tests passed in `lib/qualify.test.ts`.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add lib/qualify.ts lib/qualify.test.ts
git commit -m "Merge lead qualification and WhatsApp reply drafting into one Claude call"
```

---

### Task 3: Wire the webhook to fetch listings and send the real reply

**Files:**
- Modify: `app/api/whatsapp/route.ts` (currently imports `qualifyLead` and sends a hardcoded canned `reply` string — see full current content below)

**Interfaces:**
- Consumes: `qualifyAndReply(message: string, listings: ListingContext[]): Promise<QualifiedReply>` and `ListingContext` from `lib/qualify.ts` (Task 2).
- Produces: nothing new consumed by later tasks — this is the last task in this plan.

Current `app/api/whatsapp/route.ts`:

```ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { qualifyLead } from "@/lib/qualify";
import { sendText } from "@/lib/whatsapp";

// Meta calls this to verify the webhook belongs to you before it will
// deliver any messages.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

interface WhatsAppWebhookBody {
  entry?: {
    changes?: {
      value?: {
        messages?: { from?: string; text?: { body?: string } }[];
        contacts?: { profile?: { name?: string } }[];
      };
    }[];
  }[];
}

// Meta delivers inbound messages (and status updates, which we ignore) here.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as WhatsAppWebhookBody | null;

    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message?.from) {
      // No inbound message (e.g. a delivery/read status update) — nothing to do.
      return new Response("OK", { status: 200 });
    }

    const phone = message.from;
    const text = message.text?.body ?? null;
    const profileName = value?.contacts?.[0]?.profile?.name ?? null;

    console.log("WhatsApp inbound:", { phone, text, profileName });

    const { data: existingLead } = await supabaseAdmin
      .from("leads")
      .select("id")
      .eq("contact", phone)
      .neq("status", "lost")
      .limit(1)
      .maybeSingle();

    if (!existingLead) {
      const qualified = text
        ? await qualifyLead(text)
        : {
            lead_type: "unknown" as const,
            suburb: null,
            temperature: "warm" as const,
            summary: "No message text (non-text message type)",
          };

      const { error } = await supabaseAdmin.from("leads").insert({
        agent_id: process.env.AGENT_ID,
        name: profileName,
        contact: phone,
        source: "whatsapp",
        temperature: qualified.temperature,
        status: "new",
        lead_type: qualified.lead_type,
        suburb: qualified.suburb,
        summary: qualified.summary,
      });

      if (error) {
        console.error("WhatsApp webhook: failed to insert lead:", error.message);
      } else {
        const reply =
          "Thanks for reaching out to McAfful — this is Mercy's line. I've got your message and will reply personally shortly. Meanwhile you can browse current homes on the website.";
        await sendText(phone, reply);
      }
    }
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
  }

  // Always 200, quickly — Meta retry-storms a webhook that errors or is slow.
  return new Response("OK", { status: 200 });
}
```

- [ ] **Step 1: Replace the file's contents**

Replace the full contents of `app/api/whatsapp/route.ts` with:

```ts
import { supabaseAdmin } from "@/lib/supabase/admin";
import { qualifyAndReply, FALLBACK_REPLY, type ListingContext } from "@/lib/qualify";
import { sendText } from "@/lib/whatsapp";

// Meta calls this to verify the webhook belongs to you before it will
// deliver any messages.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

interface WhatsAppWebhookBody {
  entry?: {
    changes?: {
      value?: {
        messages?: { from?: string; text?: { body?: string } }[];
        contacts?: { profile?: { name?: string } }[];
      };
    }[];
  }[];
}

// The AI reply is grounded only in the agent's current active listings —
// fetched fresh per inbound message so it never quotes a sold/withdrawn
// listing. Falls back to an empty list (conversational-only reply) if the
// fetch fails, rather than blocking the whole webhook.
async function getActiveListingsContext(): Promise<ListingContext[]> {
  const { data, error } = await supabaseAdmin
    .from("listings")
    .select("suburb, address, price, beds, baths")
    .eq("status", "active")
    .eq("agent_id", process.env.AGENT_ID);

  if (error) {
    console.error("WhatsApp webhook: failed to fetch listings:", error.message);
    return [];
  }

  return data ?? [];
}

// Meta delivers inbound messages (and status updates, which we ignore) here.
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as WhatsAppWebhookBody | null;

    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message?.from) {
      // No inbound message (e.g. a delivery/read status update) — nothing to do.
      return new Response("OK", { status: 200 });
    }

    const phone = message.from;
    const text = message.text?.body ?? null;
    const profileName = value?.contacts?.[0]?.profile?.name ?? null;

    console.log("WhatsApp inbound:", { phone, text, profileName });

    const { data: existingLead } = await supabaseAdmin
      .from("leads")
      .select("id")
      .eq("contact", phone)
      .neq("status", "lost")
      .limit(1)
      .maybeSingle();

    if (!existingLead) {
      const qualified = text
        ? await qualifyAndReply(text, await getActiveListingsContext())
        : {
            lead_type: "unknown" as const,
            suburb: null,
            temperature: "warm" as const,
            summary: "No message text (non-text message type)",
            reply: FALLBACK_REPLY,
          };

      const { error } = await supabaseAdmin.from("leads").insert({
        agent_id: process.env.AGENT_ID,
        name: profileName,
        contact: phone,
        source: "whatsapp",
        temperature: qualified.temperature,
        status: "new",
        lead_type: qualified.lead_type,
        suburb: qualified.suburb,
        summary: qualified.summary,
      });

      if (error) {
        console.error("WhatsApp webhook: failed to insert lead:", error.message);
      } else {
        await sendText(phone, qualified.reply);
      }
    }
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
  }

  // Always 200, quickly — Meta retry-storms a webhook that errors or is slow.
  return new Response("OK", { status: 200 });
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS — the `lib/qualify.test.ts` suite from Task 2 still passes unchanged.

- [ ] **Step 4: Commit**

```bash
git add app/api/whatsapp/route.ts
git commit -m "Wire the WhatsApp webhook to the merged qualify-and-reply call"
```

- [ ] **Step 5: Manual end-to-end verification (do this before considering the feature done)**

This webhook only works over a public HTTPS URL, not `localhost` (per `README.md`) — test against the deployed Vercel URL, `https://mcafful-agent-os.vercel.app/api/whatsapp`, after pushing.

1. Confirm `ANTHROPIC_API_KEY`, `WHATSAPP_TOKEN`, and `WHATSAPP_PHONE_NUMBER_ID` are set in Vercel's production environment variables (`DEPLOY.md` flagged these as still-needed as of 2026-07-05 — check Vercel → Project Settings → Environment Variables before testing; add and redeploy if missing).
2. From a phone, send the WhatsApp test/business number a message asking about a real active listing (e.g. "What's the price on [a real active listing's suburb/address]?").
3. Confirm the reply: answers the actual question using the real listing's price/details, is signed as Mercy Baloyi, and never mentions "McAfful" or any agency.
4. Send a second message from the same number — confirm no second auto-reply fires (existing "first contact only" behavior).
5. Send a message from a different number asking something general/unrelated to any listing (e.g. "do you sell in Ghana?") — confirm the reply is honest/conversational rather than inventing a listing match.
6. Check the `leads` table (via `/leads` in the app or Supabase table editor) — confirm both test messages created lead rows with the AI's qualification fields populated.

---

## Deferred to later sub-projects (do not implement here)

- Proactive/outbound messaging outside the 24-hour window, and the Meta-approved WhatsApp templates it requires (sub-project 2).
- Automated daily brief delivery (sub-project 3).
- Pipeline/deal automation (sub-project 4).
