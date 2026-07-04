# WhatsApp message templates — submit these in Meta Business Manager

Templates are required for any message sent OUTSIDE the 24-hour customer-initiated
window (notifications, follow-ups, marketing). Category matters: "utility" for
transactional, "marketing" for promotional. Approval usually takes minutes to a day.
Variables are numbered {{1}}, {{2}}… in the order your code passes them.

---

## 1. new_lead  (Utility) — pings Mercy when a website lead arrives
Used by `app/api/leads/route.ts`, params: [name, suburb]
```
New valuation lead: {{1}} in {{2}}. Open your Agent OS to call them first.
```

## 2. valuation_followup  (Utility) — sent to a seller lead
params: [name, suburb]
```
Hi {{1}}, it's Mercy from McAfful. Thanks for requesting a valuation for your home in {{2}}. I have a few recent sales nearby to share — when's a good time for a quick call?
```

## 3. viewing_reminder  (Utility) — sent to a buyer
params: [name, address, time]
```
Hi {{1}}, a reminder of your viewing at {{2}} today at {{3}}. Reply here if anything changes — see you there.
```

## 4. seller_feedback  (Utility) — daily mandate feedback
params: [name, listing, views, enquiries]
```
Hi {{1}}, your weekly update on {{2}}: {{3}} views and {{4}} enquiries so far. Full feedback and next steps to follow — reply here with any questions.
```

## 5. new_listing_alert  (Marketing) — matched buyers
params: [suburb, price, beds]
```
New in {{1}}: a {{3}}-bed home listed at R{{2}} that matches your search. Want the details or a viewing? Reply YES and I'll send them.
```

**Notes**
- Marketing templates require the recipient to have opted in (POPIA + Meta policy).
- Meta paces new templates to small batches first; quality rating governs reach.
- First ~1,000 customer-initiated service conversations/month are free.
