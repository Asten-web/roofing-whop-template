import { createFileRoute } from "@tanstack/react-router";
import { cleanText, jsonError, whopApi, whopConfig } from "@/lib/server/whop-api";

export const Route = createFileRoute("/api/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => null) as Record<string, unknown> | null;
          const paymentId = cleanText(body?.paymentId, 100);
          if (!/^pay_[A-Za-z0-9_-]+$/.test(paymentId)) return Response.json({ error: "A valid Whop payment ID is required." }, { status: 400 });
          const { accountId } = whopConfig();
          const payment = await whopApi(`/payments/${encodeURIComponent(paymentId)}`);
          const owningAccount = payment.account_id || payment.company_id || payment.account?.id || payment.company?.id;
          if (owningAccount && owningAccount !== accountId) return Response.json({ error: "Payment does not belong to this business account." }, { status: 403 });
          const status = String(payment.status || "unknown").toLowerCase();
          if (status === "succeeded" || status === "paid" || status === "complete" || status === "completed") {
            return Response.json({ status: "succeeded", paymentId });
          }
          if (["pending", "processing", "requires_action", "created"].includes(status)) {
            return Response.json({ status, paymentId, message: "Payment is still processing." }, { status: 202 });
          }
          return Response.json({ error: `Whop payment status is ${status}; it has not been confirmed as successful.`, status, paymentId }, { status: 409 });
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
