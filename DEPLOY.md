# Deploying McAfful Agent OS

## Current status: already live

This app is deployed and connected for continuous deployment:

- **GitHub:** https://github.com/mercymcafful/mcafful-agent-os (branch `main`)
- **Vercel project:** `mercymcaffuls-projects/mcafful-agent-os`
- **Production URL:** https://mcafful-agent-os.vercel.app
- Every push to `main` automatically triggers a new production deploy.

## Environment variables

### Public (safe — visible to anyone visiting the site)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Secret (server-only — never exposed to the browser)
- `SUPABASE_SERVICE_ROLE_KEY`
- `AGENT_ID`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `ANTHROPIC_API_KEY`

**Already set in Vercel:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `AGENT_ID`, `WHATSAPP_VERIFY_TOKEN`.

**Still needed:** `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `ANTHROPIC_API_KEY` —
send these over and they'll be added and redeployed.

## If you ever need to redeploy from scratch (new repo, new Vercel project, etc.)

1. Push this repo to GitHub.
2. Go to vercel.com → **New Project** → import the GitHub repo. Vercel
   auto-detects the Next.js framework preset — no config needed.
3. In **Project Settings → Environment Variables**, add every variable listed
   above.
4. Click **Deploy**. Note the production URL Vercel gives you.

## Steps only you can do — not done yet, need your action

1. **Supabase → Authentication → URL Configuration**
   - Set **Site URL** to `https://mcafful-agent-os.vercel.app`.
   - This app currently signs in with email/password only — there's no
     magic-link or OAuth callback route yet, so adding
     `https://mcafful-agent-os.vercel.app/auth/callback` as a redirect URL
     isn't required right now. Add it later if a passwordless/OAuth login is
     ever built.

2. **Meta → WhatsApp → Configuration**
   - Callback URL: `https://mcafful-agent-os.vercel.app/api/whatsapp`
   - Verify Token: `mcafful-de7377756d0e6e2d0dd7dbbc` (already set in Vercel —
     just needs to match here)
   - Subscribe to the **messages** field
   - Click **Verify and save**
