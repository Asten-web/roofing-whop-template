import { useCallback, useRef, useState } from "react";
import { loadWhop } from "@whop/elements";
import {
  BrandingElement,
  Checkout,
  CheckoutElement,
  EmailElement,
  ExpressCheckoutElement,
  PaymentElement,
  Payments,
  WhopElements,
} from "@whop/elements-react";
import { site, type PlanKey } from "@/config/site";
import { trackWhop } from "@/lib/pixel";
import { Icon } from "@/components/Icons";

const planDetails: Record<PlanKey, { title: string; price: number; note: string }> = {
  inspection: { title: "Roof inspection", price: site.prices.inspection, note: "One-time fee · photo-documented inspection" },
  deposit: { title: "Project deposit", price: site.prices.deposit, note: "Applied to your approved project total" },
  repair: { title: "Standard leak repair", price: site.prices.repair, note: "Illustrative flat rate · scope limits apply" },
};

type Props = { planKey: PlanKey; onClose: () => void };
type CheckoutState = "ready" | "verifying" | "paid" | "failed";

export function WhopCheckout({ planKey, onClose }: Props) {
  const planId = site.plans[planKey];
  const details = planDetails[planKey];
  const [state, setState] = useState<CheckoutState>("ready");
  const [paymentId, setPaymentId] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [error, setError] = useState("");
  const [showSaveCard, setShowSaveCard] = useState(false);
  const environment = site.sandbox ? "sandbox" : "production";

  const verify = useCallback(async (id: string) => {
    setState("verifying");
    setPaymentId(id);
    try {
      const response = await fetch("/api/verify", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentId: id }),
      });
      const data = await response.json();
      if (response.status === 202) {
        setState("verifying");
        setError("Whop is still confirming this payment. Keep this window open and check again shortly.");
        return;
      }
      if (!response.ok || data.status !== "succeeded") throw new Error(data.error || "Whop has not confirmed this payment as successful.");
      setState("paid");
      setError("");
    } catch (e) {
      setState("failed");
      setError(e instanceof Error ? e.message : "Could not verify this payment.");
    }
  }, []);

  const ready = Boolean(site.whopAccountId && planId);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <button className="icon-button modal-close" aria-label="Close checkout" onClick={onClose}><Icon name="close" size={21} /></button>
        <div className="checkout-heading">
          <span className="eyebrow">SECURE PAYMENT · POWERED BY WHOP</span>
          <h2 id="checkout-title">{state === "paid" ? "Deposit received" : details.title}</h2>
          <p>{state === "paid" ? "Payment was confirmed by Whop. Next, you can optionally save a payment method for the final project invoice." : details.note}</p>
          <div className="checkout-price">${details.price.toLocaleString("en-US")}<span> USD</span></div>
        </div>
        {state === "paid" ? (
          <div className="checkout-success">
            <div className="success-mark"><Icon name="check" size={28} /></div>
            <h3>Payment verified</h3>
            <p className="muted">Receipt: <code>{paymentId}</code></p>
            <div className="consent-note">Saving a payment method is optional. A separate Whop setup intent verifies and stores the method; it does not charge the card.</div>
            {!showSaveCard ? <button className="button button-dark full-width" onClick={() => setShowSaveCard(true)}>Save card for final invoice <Icon name="arrow" size={18} /></button> : (
              <SavePaymentMethod email={customerEmail} setEmail={setCustomerEmail} onDone={() => setError("Payment method saved. Final balances can now be invoiced by staff in /admin.")} />
            )}
            {error && <p className="form-status success" role="status">{error}</p>}
            <button className="text-button" onClick={onClose}>Return to website</button>
          </div>
        ) : !ready ? (
          <div className="setup-warning">
            <strong>Checkout is not connected yet.</strong>
            <p>Add the Whop account ID and plan ID to the environment file. This template will not simulate a successful charge.</p>
          </div>
        ) : (
          <>
            <p className="checkout-intro">Payment details are collected by Whop. This site never receives or stores card numbers.</p>
            <WhopElements
              elements={loadWhop()}
              environment={environment}
              appearance={{ theme: { appearance: "light", accentColor: "#b8793d" } }}
            >
              <Checkout
                key={planId}
                plan={planId}
                returnUrl={`${typeof window !== "undefined" ? window.location.origin : "https://example.com"}/checkout/complete`}
                fallback={<div className="element-loading">Loading Whop checkout…</div>}
                onComplete={(completion: any) => {
                  if (completion.result === "payment" && completion.paymentId) void verify(completion.paymentId);
                }}
              >
                <ExpressCheckoutElement />
                <CheckoutElement />
              </Checkout>
            </WhopElements>
            {state === "verifying" && <p className="form-status sending" role="status">Confirming payment with Whop…</p>}
            {state === "failed" && <p className="form-status error" role="alert">{error}</p>}
          </>
        )}
        <p className="checkout-footer"><Icon name="shield" size={15} /> Encrypted, PCI-isolated checkout by Whop. Available payment options vary by customer and merchant eligibility.</p>
      </section>
    </div>
  );
}

/** A separate, explicit save-card step after the deposit. It creates a setup intent and does not charge. */
function SavePaymentMethod({ email, setEmail, onDone }: { email: string; setEmail: (v: string) => void; onDone: () => void }) {
  const paymentsRef = useRef<any>(null);
  const [complete, setComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  async function save() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage("Enter the billing email used for your Whop checkout."); return; }
    if (!consent) { setMessage("Please confirm consent to store this payment method for the final project invoice."); return; }
    setSaving(true); setMessage("");
    try {
      const tokenResult = await paymentsRef.current.createConfirmationToken();
      const response = await fetch("/api/setup-intents", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationToken: tokenResult.confirmationToken, email, consentForFutureInvoice: consent }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Whop could not create the setup intent.");
      let status = data.status;
      if (data.clientSecret && typeof paymentsRef.current.handleNextAction === "function") {
        await paymentsRef.current.handleNextAction({ clientSecret: data.clientSecret });
      }
      for (let i = 0; i < 8 && status !== "succeeded"; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const check = await fetch(`/api/setup-intents/${encodeURIComponent(data.setupIntentId)}`);
        if (!check.ok) break;
        const current = await check.json();
        status = current.status;
      }
      if (status !== "succeeded") throw new Error("Whop has not marked the setup intent as succeeded yet. Please retry or use a manual invoice.");
      setMessage("Payment method saved with Whop for future invoicing. No charge was made in this step.");
      onDone();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save the payment method.");
    } finally { setSaving(false); }
  }

  if (!site.whopAccountId) return <p className="form-status error">Whop account ID is not configured.</p>;

  return (
    <div className="save-card-panel">
      <label>Billing email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
      <WhopElements elements={loadWhop()} environment={site.sandbox ? "sandbox" : "production"} appearance={{ theme: { appearance: "light", accentColor: "#b8793d" } }}>
        <Payments accountId={site.whopAccountId} amount={1} currency="usd" ref={(handle: any) => { paymentsRef.current = handle; }}>
          <EmailElement />
          <PaymentElement onChange={(p: any) => setComplete(Boolean(p.complete))} />
          <BrandingElement />
        </Payments>
      </WhopElements>
      <label className="consent-check"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />I authorize {site.companyName} to securely store this payment method with Whop and use it for the final balance of the project after I receive the final invoice and agreed terms.</label>
      <button type="button" className="button button-dark full-width" disabled={saving || !complete} onClick={save}>{saving ? "Saving with Whop…" : "Save payment method"}</button>
      {message && <p className="form-status" role="status">{message}</p>}
      <p className="micro-copy">This step creates a setup intent only. Future charges should be separately described in the signed estimate/work authorization and invoice.</p>
    </div>
  );
}
