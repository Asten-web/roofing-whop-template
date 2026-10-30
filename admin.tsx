import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/config/site";
import { Icon } from "@/components/Icons";

export const Route = createFileRoute("/admin")({ component: InvoiceAdminPage });

function InvoiceAdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [description, setDescription] = useState("Final balance for approved roofing project");
  const [amount, setAmount] = useState("2500.00");
  const [collectionMethod, setCollectionMethod] = useState<"send_invoice" | "charge_automatically">("send_invoice");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [paymentTokenId, setPaymentTokenId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Record<string, any> | null>(null);

  async function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setResult(null); setSubmitting(true);
    const operationId = requestId || crypto.randomUUID();
    setRequestId(operationId);
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ requestId: operationId, customerName, customerEmail, description, amount, collectionMethod, paymentMethodId, paymentTokenId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Whop could not create the invoice.");
      setResult(data);
      setRequestId(crypto.randomUUID());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invoice creation failed.");
    } finally { setSubmitting(false); }
  }

  return <main className="admin-page">
    <header className="admin-header"><a className="brand-lockup" href="/"><span className="brand-mark"><Icon name="roof" size={27} /></span><span className="brand-copy"><strong>{site.companyName}</strong><small>INVOICE ADMIN</small></span></a><a className="text-button" href="/">Back to site <Icon name="arrow" size={16} /></a></header>
    <div className="admin-content">
      <div className="admin-eyebrow"><Icon name="shield" size={17} /> RESTRICTED OPERATIONS</div>
      <h1>Create a final-balance invoice.</h1>
      <p className="admin-lede">Create and send a Whop invoice for the remaining balance after the agreed work is complete. This page sends an authenticated server request to Whop; it does not collect card information.</p>
      <div className="admin-warning"><Icon name="shield" size={21} /><div><strong>Use this only for an agreed customer balance.</strong><p>Verify the signed scope, deposit credit, completed work, applicable taxes, invoice amount, and customer authorization before issuing or charging. The default is a manual invoice by email.</p></div></div>
      <form className="admin-form" onSubmit={createInvoice}>
        <label>Admin access key<input type="password" autoComplete="current-password" required minLength={32} value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="Configured by the business owner" /></label>
        <div className="admin-form-grid"><label>Customer name<input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={140} placeholder="Customer full name" /></label><label>Customer email<input type="email" required value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} maxLength={180} placeholder="customer@example.com" /></label></div>
        <label>Invoice line-item description<input required value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} placeholder="Project final balance — roof replacement" /></label>
        <div className="admin-form-grid"><label>Final balance (USD)<input type="number" min="5" max="100000" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} /></label><label>Collection method<select value={collectionMethod} onChange={(e) => setCollectionMethod(e.target.value as "send_invoice" | "charge_automatically")}><option value="send_invoice">Send invoice for manual payment</option><option value="charge_automatically">Charge authorized saved method</option></select></label></div>
        {collectionMethod === "charge_automatically" && <div className="auto-charge-fields"><strong>Required for automatic charge</strong><p>Enter the saved Whop payment method and payment token IDs supplied by the supported billing flow. This option must only be used when authorization expressly covers the amount and timing.</p><label>Payment method ID<input required value={paymentMethodId} onChange={(e) => setPaymentMethodId(e.target.value)} placeholder="pmt_…" /></label><label>Payment token ID<input required value={paymentTokenId} onChange={(e) => setPaymentTokenId(e.target.value)} placeholder="payt_…" /></label></div>}
        <button className="button button-dark full-width" type="submit" disabled={submitting}>{submitting ? "Creating invoice with Whop…" : collectionMethod === "send_invoice" ? "Create and send invoice" : "Create automatic-charge invoice"}<Icon name="arrow" size={17} /></button>
        {error && <p className="form-status error" role="alert">{error}</p>}
      </form>
      {result && <section className="invoice-result" aria-live="polite"><div className="result-check"><Icon name="check" size={20} /></div><h2>Whop returned an invoice.</h2><dl><div><dt>Invoice ID</dt><dd><code>{result.invoiceId || "Not returned"}</code></dd></div><div><dt>Status</dt><dd>{result.status}</dd></div><div><dt>Collection method</dt><dd>{result.collectionMethod === "send_invoice" ? "Email / manual payment" : "Automatic charge"}</dd></div><div><dt>Amount</dt><dd>${Number(result.amountUsd).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</dd></div></dl>{result.payOnlineUrl && <a className="button button-accent full-width" target="_blank" rel="noreferrer" href={result.payOnlineUrl}>Open Whop payment page <Icon name="arrow" size={16} /></a>}<p className="micro-copy">Verify the invoice status and delivery in the Whop dashboard before treating the balance as paid.</p></section>}
      <p className="admin-footnote">Security note: keep the admin key in your password manager, never in source control. This starter does not store it in browser storage. For a real company rollout, put this route behind your own staff authentication/SSO and audit trail.</p>
    </div>
  </main>;
}
