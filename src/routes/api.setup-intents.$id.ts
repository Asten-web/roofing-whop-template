import { createFileRoute } from "@tanstack/react-router";
import {
  enforceRateLimit,
  jsonError,
  whopApi,
  whopConfig,
} from "@/lib/server/whop-api";

export const Route = createFileRoute("/api/setup-intents/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
    try {
      const id = params.id;
      if (!/^[A-Za-z0-9_-]{4,120}$/.test(id))
        return Response.json(
          { error: "Invalid setup intent ID." },
          { status: 400 },
        );
      const limited = enforceRateLimit(request, "setup-intent-status", 30);
      if (limited) return limited;
      const { accountId } = whopConfig();
      const result = await whopApi(`/setup_intents/${encodeURIComponent(id)}`);
      const owningAccount =
        result.account_id ||
        result.company_id ||
        result.account?.id ||
        result.company?.id;
      if (!owningAccount)
        return Response.json(
          { error: "Whop did not return setup-intent account ownership." },
          { status: 502 },
        );
      if (owningAccount !== accountId)
        return Response.json(
          { error: "Setup intent does not belong to this business account." },
          { status: 404 },
        );
      return Response.json({
        setupIntentId: result.id,
        status: result.status,
        paymentMethodId:
          result.payment_method?.id || result.payment_method_id || undefined,
      });
    } catch (error) {
      return jsonError(error);
    }
      },
    },
  },
});
