import { site } from "@/config/site";
import { Icon } from "@/components/ui/Icons";

export function Financing() {
  return (
    <section className="financing-section section-shell">
      <div className="financing-art">
        <div className="financing-circle"><Icon name="spark" size={38} /></div>
        <div className="finance-lines line-a" />
        <div className="finance-lines line-b" />
        <div className="finance-stamp">ROOM TO<br />BREATHE</div>
      </div>
      <div className="financing-copy">
        <span className="eyebrow">MORE WAYS TO MOVE FORWARD</span>
        <h2>Protect your home.<br /><em>Choose how to pay.</em></h2>
        <p>Whop checkout may present supported buy-now-pay-later or installment options for approved merchants and eligible customers. See the options displayed to you before you confirm payment.</p>
        <small>{site.financingCopy}</small>
        <a className="button button-dark" href="#estimate">Talk through your options <Icon name="arrow" size={16} /></a>
      </div>
    </section>
  );
}
