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

export const Route = createFileRoute("/api/leads")({
  server: {
    handlers: {
      POST: async ({ request }) => {
    try {
      assertSameOrigin(request);
      const limited = enforceRateLimit(request, "leads", 5);
      if (limited) return limited;
      const body = (await request.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      if (!body)
        return Response.json(
          { error: "Invalid request body." },
          { status: 400 },
        );
      if (cleanText(body.website, 300))
        return Response.json(
          { error: "Invalid submission." },
          { status: 422 },
        );

      const name = cleanText(body.name, 120);
      const email = cleanText(body.email, 180).toLowerCase();
      const phone = cleanText(body.phone, 40);
      const address = cleanText(body.address, 240);
      const zip = cleanText(body.zip, 12);
      const service = cleanText(body.service, 100);
      const details = cleanText(body.details, 2000);
      const pageUrl = cleanText(body.pageUrl, 1000);
      if (
        !name ||
        !isValidEmail(email) ||
        !phone ||
        !address ||
        !zip ||
        !service
      ) {
        return Response.json(
          {
            error:
              "Please enter your name, valid email, phone, property address, ZIP code, and service.",
          },
          { status: 422 },
        );
      }
      const { accountId } = whopConfig();
      const leadPayload: Record<string, unknown> = {
        account_id: accountId,
        metadata: {
          contact_name: name,
          email,
          phone,
          property_address: address,
          postal_code: zip,
          requested_service: service,
          project_details: details,
          source: "roofing-website-estimate-form",
          submitted_at: new Date().toISOString(),
        },
      };
      const productId =
        process.env.WHOP_LEAD_PRODUCT_ID ||
        process.env.VITE_WHOP_LEAD_PRODUCT_ID;
      if (productId && productId.startsWith("prod_"))
        leadPayload.product_id = productId;
      if (pageUrl) {
        try {
          const referrer = new URL(pageUrl);
          if (
            referrer.protocol === "https:" ||
            referrer.hostname === "localhost"
          )
            leadPayload.referrer = referrer.toString().slice(0, 1000);
        } catch {
          /* page URL is optional analytics context */
        }
      }
      const response = await whopApi("/leads", {
        method: "POST",
        body: leadPayload,
      });
      const leadId = response.id || response.lead?.id;
      if (!leadId)
        throw new Error("Whop created a lead without returning its identifier.");
      return Response.json(
        {
          ok: true,
          leadId,
          status: response.status || "created",
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
