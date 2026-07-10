# Smarter WhatsApp Auto-Reply — Design Spec

**Date:** 2026-07-10
**Status:** Approved, ready for implementation plan
**Sub-project:** 1 of 4 in the "more automated" initiative (see roadmap note below)

## Roadmap context

This is the first of four planned automation sub-projects for McAfful Agent OS,
tackled one at a time:

1. **Smarter WhatsApp conversation** (this spec)
2. Proactive outreach & follow-ups
3. Automated daily brief delivered to Mercy
4. Pipeline & deal automation

Sub-project 2 will require Meta-approved WhatsApp message templates (Meta
Cloud API `type: "template"` messages), since proactive/follow-up messages
go out *outside* the 24-hour customer-initiated window where free-form text
(`type: "text"`) is not allowed. Templates must be submitted and approved in
Meta Business Manager before that sub-project can ship. Not needed for this
sub-project — noted here so it isn't lost before we get there.

## Problem

Every inbound WhatsApp message currently gets the exact same canned reply
(`app/api/whatsapp/route.ts`), regardless of what the AI qualification step
(`lib/qualify.ts`) learned about the lead. The qualification data (lead type,
suburb, temperature) is captured but never used to shape the reply the lead
actually receives.

## Goal

Reply to the lead's first inbound message with an answer that actually
addresses what they asked, using real, current listings data, signed as
Mercy Baloyi — one reply, then hand off to Mercy for everything after.

## Scope decisions (from brainstorming)

- **Conversation depth:** one smarter reply only, then hand off. No multi-turn
  AI qualification, no indefinite AI-handled Q&A. Matches existing behavior
  where auto-reply only fires for a lead's first contact (no existing open
  lead for that phone number).
- **Reply content:** answer the exact query only. No bolted-on "next step"
  line, no forced follow-up question. The answer itself carries the
  personalization.
- **Identity:** sign as **Mercy Baloyi** (not "McAfful" or "Mercy McAfful").
  No agency affiliation mentioned, per CLAUDE.md brand rules.
- **Data access:** the AI is given real, current active listings data
  (address/suburb, price, beds/baths, status) so it can answer specific
  factual questions instead of guessing or speaking in generalities.

## Architecture

Replace the current two-step flow (`qualifyLead()` → static canned
`sendText()`) with a single merged Claude Haiku call that both qualifies the
lead and drafts the reply in one pass:

```
Inbound WhatsApp message (app/api/whatsapp/route.ts)
   → fetch active listings (suburb, price, beds/baths, status)
   → qualifyAndReply(message, listings)   [single Claude Haiku call]
        returns { lead_type, suburb, temperature, summary, reply }
   → insert lead row (as today, now including nothing new schema-wise)
   → sendText(phone, reply)
```

This replaces `lib/qualify.ts`'s `qualifyLead()` export with a new function
(same file or renamed) that returns the extra `reply` field alongside the
existing qualification fields. One AI call instead of two keeps latency and
cost down, consistent with using the cheapest viable model tier.

## Prompt behavior

- System prompt includes the full list of current active listings as
  structured context (suburb, price, beds/baths, status only — no internal
  IDs or owner-sensitive fields).
- Explicit instruction: only state facts present in the provided listings
  data. Never invent a price, address, or availability. If the query can't
  be answered from the data provided, answer conversationally and honestly
  (e.g. "I don't have anything active in that suburb right now") rather than
  fabricating.
- If the inbound message isn't about a specific listing (general question,
  or just browsing), answer conversationally — don't force a listing match.
- Reply is signed off as "Mercy Baloyi" — no "McAfful" branding, no agency
  mention.

## Error handling

- If the Claude call fails or returns malformed/unparseable JSON, fall back
  to today's static generic reply. The webhook must still return `200`
  quickly regardless (Meta retry-storms slow/erroring webhooks) — this
  behavior is unchanged.
- If the listings fetch fails, proceed with an empty listings list so the
  reply degrades to conversational-only rather than blocking the whole flow.
- Lead capture (the DB insert) must still happen even if reply generation or
  sending fails — a failed WhatsApp send must never lose a lead.

## Testing

- Unit tests for the merged qualify+reply function, mocking the Claude
  response for: valid JSON with a listing match, valid JSON with no listing
  match (general question), and malformed JSON (triggers fallback).
- Manual end-to-end test via the WhatsApp test number with a real query
  about a live listing, confirming the reply is accurate and signed
  correctly, before this is considered done.

## Out of scope (deliberately deferred)

- Multi-turn AI-handled qualification or open-ended Q&A (considered, not
  chosen — see scope decisions above).
- Proactive/outbound messaging outside the 24-hour window (sub-project 2).
- Changes to the daily brief or pipeline (sub-projects 3 and 4).
