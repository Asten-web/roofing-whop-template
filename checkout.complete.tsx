import { createFileRoute } from "@tanstack/react-router";
import { site } from "@/config/site";
import { Icon } from "@/components/Icons";

export const Route = createFileRoute("/checkout/complete")({ component: CheckoutCompletePage });
function CheckoutCompletePage() {
  return <main className="completion-page"><div className="completion-card"><span className="brand-mark"><Icon name="roof" size={27} /></span><span className="eyebrow">{site.companyName}</span><h1>Thanks. Let’s keep things moving.</h1><p>Whop has returned you to the roofing website. The team should verify your payment or setup-intent status in Whop before scheduling work or using a saved payment method.</p><a className="button button-dark" href="/">Return to the home page <Icon name="arrow" size={16} /></a></div></main>;
}
