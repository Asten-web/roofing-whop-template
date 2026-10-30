import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/config/site";
import { Icon } from "@/components/ui/Icons";

type CompletionState =
  | "checking"
  | "payment-verified"
  | "setup-verified"
  | "pending"
  | "failed"
  | "unverified";

export const Route = createFileRoute("/checkout/complete")({
  component: CheckoutCompletePage,
});

function CheckoutCompletePage() {
  const [state, setState] = useState<CompletionState>("checking");
  const [message, setMessage] = useState(
    "Checking the transaction directly with Whop.",
  );

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const providerStatus = params.get("status")?.toLowerCase();
    const paymentId = params.get("payment");
    const setupIntentId =
      params.get("setup_intent_id") || params.get("setup");

    async function checkPayment() {
      if (!paymentId || providerStatus !== "succeeded") return false;
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "succeeded") {
        if (response.status === 202) {
          if (active) {
            setState("pending");
            setMessage("Whop is still processing the payment. No payment is considered complete yet.");
          }
          return true;
        }
        throw new Error(result.error || "Whop has not verified this payment.");
      }
      if (active) {
        setState("payment-verified");
        setMessage("Whop verified the payment. Keep the receipt and contact the business about scheduling.");
      }
      return true;
    }

    async function checkSetupIntent() {
      if (!setupIntentId || providerStatus !== "succeeded") return false;
      const response = await fetch(
        `/api/setup-intents/${encodeURIComponent(setupIntentId)}`,
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Whop could not verify the setup intent.");
      if (result.status !== "succeeded" || !result.paymentMethodId) {
        if (active) {
          setState("pending");
          setMessage("Whop has not confirmed that the payment method is ready. No future charge is authorized by this page.");
        }
        return true;
      }
      if (active) {
        setState("setup-verified");
        setMessage("Whop verified the saved payment method. This confirmation does not charge the method or replace a written project authorization.");
      }
      return true;
    }

    void (async () => {
      try {
        if (await checkPayment()) return;
        if (await checkSetupIntent()) return;
        if (active) {
          setState(providerStatus === "failed" || providerStatus === "canceled" ? "failed" : "unverified");
          setMessage(
            providerStatus === "failed" || providerStatus === "canceled"
              ? "The payment or setup was not completed. You can return to the website and try again."
              : "No completed payment or setup intent was verified. Check the Whop checkout status before proceeding.",
          );
        }
      } catch (error) {
        if (active) {
          setState("failed");
          setMessage(error instanceof Error ? error.message : "The transaction could not be verified.");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const heading =
    state === "payment-verified"
      ? "Payment verified"
      : state === "setup-verified"
        ? "Payment method verified"
        : state === "checking"
          ? "Checking with Whop"
          : state === "pending"
            ? "Still processing"
            : "No confirmed transaction";

  return (
    <main className="completion-page">
      <div className="completion-card">
        <span className="brand-mark"><Icon name="roof" size={27} /></span>
        <span className="eyebrow">{site.companyName}</span>
        <h1>{heading}</h1>
        <p role="status">{message}</p>
        <a className="button button-dark" href="/">
          Return to the home page <Icon name="arrow" size={16} />
        </a>
      </div>
    </main>
  );
}
