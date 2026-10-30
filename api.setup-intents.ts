import { createFileRoute } from "@tanstack/react-router";
import { cleanText, isValidEmail, jsonError, whopApi, whopConfig } from "@/lib/server/whop-api";

export const Route = createFileRoute("/api/setup-intents")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (process.env.APP_URL) {
            const origin = request.headers.get("origin");
            const appOrigin = new URL(process.env.APP_URL).origin;
            if (origin && origin !== appOrigin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
          }
          const body = await request.json().catch(() => null) as Record<string, unknown> | null;
          const confirmationToken = cleanText(body?.confirmationToken, 200);
          const email = cleanText(body?.email, 180).toLowerCase();
          if (!/^ctok_[A-Za-z0-9_-]+$/.test(confirmationToken)) return Response.json({ error: "A valid Whop confirmation token is required." }, { status: 422 });
          if (!isValidEmail(email)) return Response.json({ error: "Enter a valid billing email." }, { status: 422 });
          if (body?.consentForFutureInvoice !== true) return Response.json({ error: "Explicit consent is required to store a payment method for future billing." }, { status: 422 });
          const { accountId } = whopConfig();
          const appUrl = process.env.APP_URL || new URL(request.url).origin;
          const result = await whopApi("/setup_intents", {
            method: "POST",
            idempotencyKey: `roofing-setup-${crypto.randomUUID()}`,
            body: {
              account_id: accountId,
              confirmation_token: confirmationToken,
              email,
              return_url: `${appUrl.replace(/\/$/, "")}/checkout/complete`,
              metadata: {
                purpose: "roofing_final_balance",
                consent_for_future_invoice: true,
                source: "roofing-deposit-followup",
              },
            },
          });
          return Response.json({
            setupIntentId: result.id,
            status: result.status,
            clientSecret: result.client_secret || undefined,
            paymentMethodId: result.payment_method?.id || result.payment_method_id || undefined,
          }, { status: 201 });
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
