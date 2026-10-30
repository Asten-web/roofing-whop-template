import { createFileRoute } from "@tanstack/react-router";
import {
  assertSameOrigin,
  cleanText,
  enforceRateLimit,
  isValidEmail,
  jsonError,
  whopApi,
  whopConfig,
} from "@/lib/server/whop-api";

export const Route = createFileRoute("/api/setup-intents")({
  server: {
    handlers: {
      POST: async ({ request }) => {
    try {
      assertSameOrigin(request);
      const limited = enforceRateLimit(request, "setup-intents", 5);
      if (limited) return limited;
      const body = (await request.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      const confirmationToken = cleanText(body?.confirmationToken, 200);
      const depositPaymentId = cleanText(body?.depositPaymentId, 100);
      const email = cleanText(body?.email, 180).toLowerCase();
      if (!/^ctok_[A-Za-z0-9_-]+$/.test(confirmationToken))
        return Response.json(
          { error: "A valid Whop confirmation token is required." },
          { status: 422 },
        );
      if (!isValidEmail(email))
        return Response.json(
          { error: "Enter a valid billing email." },
          { status: 422 },
        );
      if (!/^pay_[A-Za-z0-9_-]+$/.test(depositPaymentId))
        return Response.json(
          { error: "A verified deposit payment ID is required." },
          { status: 422 },
        );
      if (body?.consentForFutureInvoice !== true)
        return Response.json(
          {
            error:
              "Explicit consent is required to store a payment method for future billing.",
          },
          { status: 422 },
        );
      const { accountId } = whopConfig();
      const deposit = await whopApi(
        `/payments/${encodeURIComponent(depositPaymentId)}`,
      );
      const depositAccount =
        deposit.account_id ||
        deposit.company_id ||
        deposit.account?.id ||
        deposit.company?.id;
      if (!depositAccount)
        return Response.json(
          { error: "Whop did not return deposit account ownership." },
          { status: 502 },
        );
      if (depositAccount !== accountId)
        return Response.json(
          { error: "Deposit does not belong to this business account." },
          { status: 403 },
        );
      if (!["succeeded", "paid", "complete", "completed"].includes(String(deposit.status).toLowerCase()))
        return Response.json(
          { error: "The original deposit has not been confirmed as successful." },
          { status: 409 },
        );
      const appUrl = process.env.APP_URL || new URL(request.url).origin;
      const result = await whopApi("/setup_intents", {
        method: "POST",
        body: {
          account_id: accountId,
          confirmation_token: confirmationToken,
          email,
          return_url: `${appUrl.replace(/\/$/, "")}/checkout/complete`,
          metadata: {
            purpose: "roofing_final_balance",
            consent_for_future_invoice: true,
            source: "roofing-deposit-followup",
            deposit_payment_id: depositPaymentId,
          },
        },
      });
      if (!result.id)
        throw new Error("Whop created a setup intent without returning its ID.");
      return Response.json(
        {
          setupIntentId: result.id,
          status: result.status,
          clientSecret: result.client_secret || undefined,
          paymentMethodId:
            result.payment_method?.id || result.payment_method_id || undefined,
        },
        { status: 201 },
      );
    } catch (error) {
      return jsonError(error);
    }
      },
    },
  },
});
