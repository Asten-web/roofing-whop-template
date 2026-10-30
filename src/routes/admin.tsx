import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/config/site";
import { Brand } from "@/components/layout/Brand";
import { Icon } from "@/components/ui/Icons";

type InvoiceResult = {
  invoiceId: string;
  status: string;
  collectionMethod: "send_invoice" | "charge_automatically";
  payOnlineUrl: string | null;
  amountUsd: number;
};

export const Route = createFileRoute("/admin")({ component: InvoiceAdminPage });

function InvoiceAdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [projectReference, setProjectReference] = useState("");
  const [description, setDescription] = useState("Final balance for approved roofing project");
  const [amount, setAmount] = useState("2500.00");
  const [collectionMethod, setCollectionMethod] = useState<"send_invoice" | "charge_automatically">("send_invoice");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [paymentTokenId, setPaymentTokenId] = useState("");
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false);
  const [authorizationReference, setAuthorizationReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<InvoiceResult | null>(null);

  async function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setSubmitting(true);
    const operationId = requestId || crypto.randomUUID();
    setRequestId(operationId);
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          requestId: operationId,
          customerName,
          customerEmail,
          projectReference,
          description,
          amount,
          collectionMethod,
          paymentMethodId,
          paymentTokenId,
          authorizationConfirmed,
          authorizationReference,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Whop could not create the invoice.");
      setResult(data as InvoiceResult);
      setRequestId(crypto.randomUUID());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Invoice creation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <Brand href="/" />
        <a className="text-button" href="/">Back to site <Icon name="arrow" size={16} /></a>
      </header>
      <div className="admin-content">
        <div className="admin-eyebrow"><Icon name="shield" size={17} /> RESTRICTED OPERATIONS</div>
        <h1>Create a final-balance invoice.</h1>
        <p className="admin-lede">Create a Whop invoice for the remaining balance after the agreed work is complete. The default flow emails the invoice for manual payment; this page does not collect card information.</p>
        <div className="admin-warning">
          <Icon name="shield" size={21} />
          <div>
            <strong>Use this only for an agreed customer balance.</strong>
            <p>Verify the signed scope, deposit credit, completed work, applicable taxes, and final amount before issuing. Use automatic charging only when the stored payment method, payment token, and written customer authorization cover this exact balance and timing.</p>
          </div>
        </div>
        <form className="admin-form" onSubmit={createInvoice}>
          <label>Admin access key<input type="password" autoComplete="current-password" required minLength={32} value={adminKey} onChange={(event) => setAdminKey(event.target.value)} placeholder="Configured by the business owner" /></label>
          <div className="admin-form-grid">
            <label>Customer name<input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} maxLength={140} placeholder="Customer full name" /></label>
            <label>Customer email<input type="email" required value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} maxLength={180} placeholder="customer@example.com" /></label>
          </div>
          <label>Project reference<input required value={projectReference} onChange={(event) => setProjectReference(event.target.value)} maxLength={100} placeholder="Internal job number or contract reference" /></label>
          <label>Invoice line-item description<input required value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} placeholder="Project final balance — roof replacement" /></label>
          <div className="admin-form-grid">
            <label>Final balance (USD)<input type="number" min="5" max="100000" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
            <label>Collection method
              <select value={collectionMethod} onChange={(event) => setCollectionMethod(event.target.value as "send_invoice" | "charge_automatically")}>
                <option value="send_invoice">Send invoice for manual payment</option>
                <option value="charge_automatically">Charge an authorized saved method</option>
              </select>
            </label>
          </div>
          {collectionMethod === "charge_automatically" && (
            <div className="auto-charge-fields">
              <strong>Authorization and Whop payment details required</strong>
              <p>Record the written authorization reference and only use a supported, verified payment method and token that belong to this customer and business account.</p>
              <label>Payment method ID<input required value={paymentMethodId} onChange={(event) => setPaymentMethodId(event.target.value)} placeholder="pmt_…" /></label>
              <label>Payment token ID<input required value={paymentTokenId} onChange={(event) => setPaymentTokenId(event.target.value)} placeholder="payt_…" /></label>
              <label>Authorization record reference<input required value={authorizationReference} onChange={(event) => setAuthorizationReference(event.target.value)} maxLength={160} placeholder="Signed work authorization or invoice consent reference" /></label>
              <label className="consent-check"><input type="checkbox" checked={authorizationConfirmed} onChange={(event) => setAuthorizationConfirmed(event.target.checked)} />I confirm the written customer authorization covers this amount, recipient, and charge timing.</label>
            </div>
          )}
          <button className="button button-dark full-width" type="submit" disabled={submitting}>
            {submitting ? "Creating invoice with Whop…" : collectionMethod === "send_invoice" ? "Create and send invoice" : "Create authorized-charge invoice"}
            <Icon name="arrow" size={17} />
          </button>
          {error && <p className="form-status error" role="alert">{error}</p>}
        </form>
        {result && (
          <section className="invoice-result" aria-live="polite">
            <div className="result-check"><Icon name="check" size={20} /></div>
            <h2>Whop returned an invoice.</h2>
            <dl>
              <div><dt>Invoice ID</dt><dd><code>{result.invoiceId}</code></dd></div>
              <div><dt>Status</dt><dd>{result.status}</dd></div>
              <div><dt>Collection method</dt><dd>{result.collectionMethod === "send_invoice" ? "Email / manual payment" : "Automatic charge"}</dd></div>
              <div><dt>Amount</dt><dd>${Number(result.amountUsd).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</dd></div>
            </dl>
            {result.payOnlineUrl && <a className="button button-accent full-width" target="_blank" rel="noreferrer" href={result.payOnlineUrl}>Open Whop payment page <Icon name="arrow" size={16} /></a>}
            <p className="micro-copy">This only confirms invoice creation. Verify invoice delivery and payment status in Whop before treating the balance as paid.</p>
          </section>
        )}
        <p className="admin-footnote">The admin key is sent to this server endpoint and is not stored in browser storage. This starter does not include staff SSO or a durable audit database; add both before using this route for live financial operations.</p>
      </div>
    </main>
  );
}
