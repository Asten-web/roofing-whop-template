# 3–5 minute Whop Roofing Demo Recording

Record this only after deployment and actual sandbox testing are complete. Keep the Whop-hosted address visible in the browser and do not show secret keys or customers' real personal data.

## Suggested 4-minute run of show

**0:00–0:35 — Live site and responsive design**
- Open the live Whop-hosted site and show the actual `whop.site` or other provisioned Whop URL (do not label it `whop.app` unless Whop provided that exact domain).
- Scroll past the hero, roofing services, sample/verified review section, financing disclaimer, service area, and contact section.
- Use browser responsive mode to show desktop and mobile behavior.

**0:35–1:25 — Whop checkout and plan catalog**
- Open the inspection fee plan and show the Whop-hosted checkout.
- Point out the express checkout element and card checkout fallback, with Whop branding.
- Complete a real sandbox test checkout using a payment method supported by the current Whop sandbox documentation. Show the confirmation state and resulting Whop payment ID/status.
- Optional: after the deposit confirmation, show the opt-in card-on-file setup screen and its `PaymentElement` plus `BrandingElement`; do not claim card storage succeeded until the setup intent is marked successful in Whop.

**1:25–2:10 — Estimate form creates a Whop Lead**
- Fill out the request form using dedicated test details and submit it.
- Show the success response only after the API returns HTTP 201.
- Switch to the Whop dashboard/API and show the matching lead ID and metadata. Hide any personal or sensitive information from the recording.

**2:10–3:15 — Final-balance invoice**
- Navigate to `/admin`, enter the demo admin key without exposing it on-screen, and issue a manual test invoice for a test customer.
- Show the invoice ID/status and then find it in the Whop dashboard. Show the hosted payment link only if it is a sandbox URL.
- If demonstrating automatic charge, use only sandbox IDs, show that the stored payment method and payment token were obtained legitimately, and state the customer authorization/approval step. Manual invoice is the expected default demonstration.

**3:15–4:00 — Pixel events and wrap**
- Open browser DevTools Console and trigger each event with an action: click a service CTA, start a deposit checkout, submit an estimate.
- Show console entries for `service_viewed`, `deposit_started`, and `estimate_requested`, each with its unique event ID. If available, also show the corresponding events in Whop's event tooling.
- Mention page views and Whop checkout events are automatically tracked by Whop on hosted Websites.

## Evidence checklist

- [ ] A live Whop-hosted URL opens from a fresh browser session.
- [ ] A sandbox payment is actually marked successful in Whop (payment ID visible, secrets hidden).
- [ ] A lead is visible in Whop, not just a local form success message.
- [ ] A setup intent is marked successful if card-on-file is shown.
- [ ] A final-balance invoice exists in Whop.
- [ ] All three custom tracking events fire and show distinct IDs.
- [ ] No API key, admin secret, full card data, or real customer personal data is recorded.
