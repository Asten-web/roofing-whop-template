import { createFileRoute } from "@tanstack/react-router";
import {
  assertSameOrigin,
  cleanText,
  enforceRateLimit,
  isValidEmail,
  jsonError,
  requireAdminKey,
  whopApi,
  whopConfig,
} from "@/lib/server/whop-api";

type CreatedInvoice = {
  ok: true;
  invoiceId: string;
  status: string;
  collectionMethod: "send_invoice" | "charge_automatically";
  payOnlineUrl: string | null;
  amountUsd: number;
  lineItemUsd: number;
};

const invoiceRequests = new Map<
  string,
  { createdAt: number; response: Promise<CreatedInvoice> }
>();

function pruneInvoiceRequests(now: number): void {
  for (const [id, request] of invoiceRequests) {
    if (now - request.createdAt > 24 * 60 * 60 * 1000)
      invoiceRequests.delete(id);
    if (invoiceRequests.size <= 2_000) break;
  }
}

export const Route = createFileRoute("/api/invoices")({
  server: {
    handlers: {
      POST: async ({ request }) => {
    try {
      assertSameOrigin(request);
      const limited = enforceRateLimit(request, "invoice-create", 5);
      if (limited) return limited;
      requireAdminKey(request);

      const body = (await request.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      if (!body)
        return Response.json(
          { error: "Invalid request body." },
          { status: 400 },
        );

      const customerName = cleanText(body.customerName, 140);
      const customerEmail = cleanText(body.customerEmail, 180).toLowerCase();
      const description = cleanText(body.description, 500);
      const projectReference = cleanText(body.projectReference, 100);
      const authorizationReference = cleanText(
        body.authorizationReference,
        160,
      );
      const amount = Number(body.amount);
      const requestId = cleanText(body.requestId, 100);
      const collectionMethod = body.collectionMethod;
      const paymentMethodId = cleanText(body.paymentMethodId, 160);
      const paymentTokenId = cleanText(body.paymentTokenId, 200);

      if (!customerName || !isValidEmail(customerEmail) || !description || !projectReference) {
        return Response.json(
          {
            error:
              "Customer name, valid email, project reference, and work description are required.",
          },
          { status: 422 },
        );
      }
      if (!Number.isFinite(amount) || amount < 5 || amount > 100000) {
        return Response.json(
          { error: "Invoice amount must be between $5 and $100,000 USD." },
          { status: 422 },
        );
      }
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          requestId,
        )
      ) {
        return Response.json(
          { error: "A valid invoice request ID is required." },
          { status: 422 },
        );
      }
      if (
        collectionMethod !== "send_invoice" &&
        collectionMethod !== "charge_automatically"
      ) {
        return Response.json(
          { error: "Choose a supported invoice collection method." },
          { status: 422 },
        );
      }
      if (
        collectionMethod === "charge_automatically" &&
        (!/^pmt_[A-Za-z0-9_-]+$/.test(paymentMethodId) ||
          !/^payt_[A-Za-z0-9_-]+$/.test(paymentTokenId) ||
          body.authorizationConfirmed !== true ||
          authorizationReference.length < 3)
      ) {
        return Response.json(
          {
            error:
              "Automatic charging requires supported Whop payment IDs and an operator-confirmed, documented customer authorization reference.",
          },
          { status: 422 },
        );
      }

      const { accountId } = whopConfig();
      const operationKey = `${accountId}:${requestId}`;
      const prior = invoiceRequests.get(operationKey);
      if (prior) return Response.json(await prior.response);

      const now = new Date();
      const dueDate = new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const internalNotes = [
        `Project reference: ${projectReference}`,
        `Request reference: ${requestId}`,
        collectionMethod === "charge_automatically"
          ? `Customer authorization reference: ${authorizationReference}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");
      const invoicePayload: Record<string, unknown> = {
        account_id: accountId,
        collection_method: collectionMethod,
        customer_name: customerName,
        email_address: customerEmail,
        due_date: dueDate,
        line_items: [{ label: description, unit_price: amount, quantity: 1 }],
        charge_buyer_fee: false,
        plan: {
          plan_type: "one_time",
          currency: "USD",
          initial_price: amount,
          description: `Final balance for roofing project ${projectReference}`,
          internal_notes: internalNotes,
          adaptive_pricing_enabled: false,
        },
      };
      if (collectionMethod === "charge_automatically") {
        invoicePayload.payment_method_id = paymentMethodId;
        invoicePayload.payment_token_id = paymentTokenId;
      }

      const operation = (async (): Promise<CreatedInvoice> => {
        const invoice = await whopApi("/invoices", {
          method: "POST",
          idempotencyKey: `roofing-invoice-${requestId}`,
          body: invoicePayload,
        });
        const invoiceId = invoice.id || invoice.invoice?.id;
        if (!invoiceId)
          throw new Error("Whop created an invoice without returning its ID.");
        return {
          ok: true,
          invoiceId,
          status: invoice.status || "created",
          collectionMethod,
          payOnlineUrl:
            invoice.pay_url ||
            invoice.payment_url ||
            invoice.hosted_invoice_url ||
            null,
          amountUsd: amount,
          lineItemUsd: amount,
        };
      })();
      const cacheEntry = { createdAt: Date.now(), response: operation };
      invoiceRequests.set(operationKey, cacheEntry);
      pruneInvoiceRequests(Date.now());

      try {
        return Response.json(await operation, { status: 201 });
      } catch (error) {
        if (invoiceRequests.get(operationKey) === cacheEntry)
          invoiceRequests.delete(operationKey);
        throw error;
      }
    } catch (error) {
      return jsonError(error);
    }
      },
    },
  },
});
