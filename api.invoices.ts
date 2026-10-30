import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/config/site";
import { cleanText, isValidEmail, jsonError, requireAdminKey, whopApi, whopConfig } from "@/lib/server/whop-api";

export const Route = createFileRoute("/api/invoices")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          requireAdminKey(request);
          const body = await request.json().catch(() => null) as Record<string, unknown> | null;
          if (!body) return Response.json({ error: "Invalid request body." }, { status: 400 });
          const customerName = cleanText(body.customerName, 140);
          const customerEmail = cleanText(body.customerEmail, 180).toLowerCase();
          const description = cleanText(body.description, 500);
          const amount = Number(body.amount);
          const collectionMethod = body.collectionMethod === "charge_automatically" ? "charge_automatically" : "send_invoice";
          const paymentMethodId = cleanText(body.paymentMethodId, 160);
          const paymentTokenId = cleanText(body.paymentTokenId, 200);
          const requestId = cleanText(body.requestId, 100);
          if (!customerName || !isValidEmail(customerEmail) || !description) {
            return Response.json({ error: "Customer name, valid email, and work description are required." }, { status: 422 });
          }
          if (!Number.isFinite(amount) || amount < 5 || amount > 100000) {
            return Response.json({ error: "Invoice amount must be between $5 and $100,000 USD." }, { status: 422 });
          }
          if (collectionMethod === "charge_automatically" && (!/^pmt_[A-Za-z0-9_-]+$/.test(paymentMethodId) || !/^payt_[A-Za-z0-9_-]+$/.test(paymentTokenId))) {
            return Response.json({ error: "Automatic charging requires a stored Whop payment method ID and a valid Whop payment token ID. Use a manual invoice unless both values are available and the customer has authorized the charge." }, { status: 422 });
          }
          const { accountId } = whopConfig();
          const now = new Date();
          const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
          const invoicePayload: Record<string, unknown> = {
            account_id: accountId,
            collection_method: collectionMethod,
            product: {
              title: `${site.companyName} — Project Final Balance`,
            },
            plan: {
              initial_price: amount,
              renewal_price: amount,
              description: `One-time final balance of $${amount.toFixed(2)} USD`,
              unlimited_stock: true,
              adaptive_pricing_enabled: false,
            },
            customer_name: customerName,
            email_address: customerEmail,
            due_date: dueDate,
            line_items: [{ label: description, unit_price: amount, quantity: 1 }],
            charge_buyer_fee: false,
          };
          if (collectionMethod === "charge_automatically") {
            invoicePayload.payment_method_id = paymentMethodId;
            invoicePayload.payment_token_id = paymentTokenId;
          }
          const invoice = await whopApi("/invoices", {
            method: "POST",
            idempotencyKey: `roofing-invoice-${requestId && /^[A-Za-z0-9_-]{8,100}$/.test(requestId) ? requestId : crypto.randomUUID()}` ,
            body: invoicePayload,
          });
          return Response.json({
            ok: true,
            invoiceId: invoice.id || invoice.invoice?.id,
            status: invoice.status || "created",
            collectionMethod,
            payOnlineUrl: invoice.pay_url || invoice.payment_url || invoice.hosted_invoice_url || null,
            amountUsd: amount,
            lineItemUsd: amount,
          }, { status: 201 });
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
