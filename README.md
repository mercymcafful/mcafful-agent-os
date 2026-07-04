# McAfful Agent OS — Phase 1 + 2

Runnable foundation for the AI Estate Agent OS: an **embedded CRM**, the **step-by-step
Success Activity engine**, the **website valuation → lead** pipe, and the **WhatsApp
inbound webhook**. Built for Next.js (App Router) + TypeScript + Supabase. Follows
`McAfful-Agent-OS-MASTER-PROMPT.md`.

## What's in here
```
supabase/migrations/0001_init.sql   Full schema + RLS + seeded success-activity playbook
lib/supabase/*                      Auth (RLS) client, browser client, service-role admin
lib/types.ts                        Domain types
lib/whatsapp.ts                     Cloud API send (text + template)
lib/qualify.ts                      AI lead qualifier (Claude Haiku)
lib/success-engine.ts              Generates today's plan from templates + live CRM data
app/api/leads/route.ts              Public valuation form -> lead + WhatsApp notify to Mercy
app/api/whatsapp/route.ts           Webhook: verify (GET) + inbound messages (POST) -> lead
app/api/tasks/route.ts              Toggle a success-plan task complete
app/(app)/today/*                   Cockpit: Today's Success Plan (embedded CRM view)
components/ValuationForm.tsx        Client form for the public /sell page
app/globals.css                     Emerald & Gold tokens + cockpit styling
```

## Setup
1. `npm install`
2. Create a Supabase project. Run `supabase/migrations/0001_init.sql` in the SQL editor.
3. In Supabase Auth, create Mercy's user. Copy her UUID into `AGENT_ID`.
   Then insert her profile row: `insert into profiles (id) values ('<AGENT_ID>');`
4. Copy `.env.example` to `.env.local` and fill in Supabase, WhatsApp, and Anthropic keys.
5. `npm run dev`

## Wire the two inbound channels
**WhatsApp (Cloud API):** create a Meta Business portfolio + WhatsApp Business Account,
add a number, set the webhook URL to `https://your-domain/api/whatsapp` with your
`WHATSAPP_VERIFY_TOKEN`, and subscribe to the `messages` field. Get an approved
`new_lead` template (2 body variables) for the notify ping. Free-form replies work only
inside the 24h customer window; outside it, use templates.

**Google Business Profile:** GBP now routes "message me" enquiries to WhatsApp — so the
webhook above already captures them. For calls, put a tracked/forwarding number on the
profile; for the website button, use a UTM-tagged link to `/sell` so form leads attribute
to `source=google_profile`.

## Design tokens (Emerald & Gold)
`--emerald #134A38 · --emerald-deep #0C2A20 · --gold #D9BE7E · --gold-bright #E4CE97 ·
--ivory #F6F1E7 · --stone #F1EADB`. Display: Fraunces. Body: Manrope. Match
`mcafful-agent-os-demo.html`.


## Phase 3 (shipped in this build)
- `app/(app)/leads` — inbound leads desk with status advance + WhatsApp/Call quick actions.
- `app/(app)/pipeline` — deal kanban (new lead → registered).
- `app/(app)/listings` — listings manager + "Post a listing" (writes to DB, shows on public site).
- `app/(app)/dashboard` — GCI-vs-goal, mandates, OTPs, registrations, conversion funnel.
- `app/(app)/layout.tsx` + `Nav.tsx` — full sidebar cockpit.
- `whatsapp-templates.md` — the 5 templates to submit to Meta.
- `scripts/seed.mjs` — demo data (`npm run seed`) so the cockpit is alive on first run.


## Auth (shipped in this build)
- `middleware.ts` + `lib/supabase/middleware.ts` — refresh the session on every request and redirect unauthenticated visitors away from `/today`, `/dashboard`, `/leads`, `/pipeline`, `/listings`.
- `app/login/page.tsx` — email + password sign-in.
- `app/(app)/layout.tsx` — server-side guard, auto-creates Mercy's `profiles` row, shows her name + Sign out.
- `app/auth/callback/route.ts` — ready if you switch on magic-link / OAuth later.

### One-time auth setup
1. Supabase dashboard → Authentication → Users → **Add user** → give Mercy an email + password (or invite her).
2. Put that same user's UUID in `AGENT_ID` (the public form + WhatsApp webhook write leads to it).
3. Supabase → Authentication → URL Configuration → add your site URL + `…/auth/callback` to redirect URLs.
4. Sign in at `/login`. Public pages (`/`, `/sell`) stay open; the cockpit is protected.

## Still ahead (see master prompt)
- Phase 3: pipeline kanban + suspensive-deadline radar; listings manager -> public grid + auto Google post.
- Phase 4: Lightstone/WinDeed adapter layer (cached, cost-budgeted); predictive seller scoring (POPIA-safe); CMA generator; voice-to-CRM.
- Phase 5: McAfful firm layer (multi-agent), unlocked when ready.

## Compliance notes
Service-role key is server-only. POPIA: capture WhatsApp/marketing opt-in and honour
opt-outs before broadcasting. FICA before transfer. Human-in-the-loop: nothing binding
auto-sends — Mercy approves and signs.
