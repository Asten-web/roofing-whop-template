import { createFileRoute } from "@tanstack/react-router";
import { jsonError, whopApi } from "@/lib/server/whop-api";

export const Route = createFileRoute("/api/setup-intents/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const id = params.id;
          if (!/^[A-Za-z0-9_-]{4,120}$/.test(id)) return Response.json({ error: "Invalid setup intent ID." }, { status: 400 });
          const result = await whopApi(`/setup_intents/${encodeURIComponent(id)}`);
          return Response.json({
            setupIntentId: result.id,
            status: result.status,
            paymentMethodId: result.payment_method?.id || result.payment_method_id || undefined,
          });
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
