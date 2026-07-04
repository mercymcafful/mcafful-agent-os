# McAfful — Agent OS

Clean Next.js 14 (App Router) + TypeScript skeleton for the McAfful Agent OS, built up feature by feature from here.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## WhatsApp setup

The `/api/whatsapp` webhook turns inbound WhatsApp messages into leads. It needs
a Meta Business app with the WhatsApp product added.

1. In the Meta Developer dashboard, create (or open) your WhatsApp app, then go
   to **WhatsApp → Configuration**.
2. Set the **Callback URL** to `https://<your-deployed-domain>/api/whatsapp`
   and the **Verify Token** to whatever you put in `WHATSAPP_VERIFY_TOKEN`.
3. Click **Verify and save** — Meta sends a GET request to confirm the token
   matches before it will save.
4. Under **Webhook fields**, subscribe to **messages**.

This webhook must be reachable over public HTTPS — it will not verify against
`localhost`. Test it on a deployed URL (Vercel is the easy path for a Next.js
app) or through a tunnel like ngrok.
