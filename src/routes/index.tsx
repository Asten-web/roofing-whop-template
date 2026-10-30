import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { site, type PlanKey } from "@/config/site";
import { WhopCheckout } from "@/components/checkout/WhopCheckout";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EstimateSection } from "@/components/sections/EstimateSection";
import { Financing } from "@/components/sections/Financing";
import { Hero } from "@/components/sections/Hero";
import { Reviews } from "@/components/sections/Reviews";
import { ServiceArea } from "@/components/sections/ServiceArea";
import { Services } from "@/components/sections/Services";
import { Icon } from "@/components/ui/Icons";
import { trackWhop } from "@/lib/pixel";

export const Route = createFileRoute("/")({ component: HomePage });

const faqs = [
  {
    q: "Do I need an inspection before requesting a repair?",
    a: "Not always. Tell us what you are seeing and we will recommend the right next step. The paid inspection is useful when you want a documented roof condition report or when the problem needs closer review.",
  },
  {
    q: "How does the project deposit work?",
    a: "The sample $500 deposit is a starting template price and should only be collected after the scope, total project price, cancellation terms, and deposit credit are stated in a written agreement. Configure the plan to match the real business policy before launch.",
  },
  {
    q: "Can I pay over time?",
    a: "Eligible customers may see supported installment or financing methods at Whop checkout, depending on merchant approval, payment method, geography, transaction, and provider terms. Financing is not guaranteed.",
  },
  {
    q: "Do you work with insurance claims?",
    a: "We can document visible roof damage and provide a clear scope of work. Coverage decisions belong to your insurer, and a contractor should never promise claim approval.",
  },
];

function HomePage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function openCheckout(plan: PlanKey) {
    if (plan === "deposit") {
      trackWhop("deposit_started", {
        plan: "project_deposit",
        amount: site.prices.deposit,
        currency: "USD",
      });
    } else {
      trackWhop("service_viewed", { service: plan, plan, currency: "USD" });
    }
    setSelectedPlan(plan);
  }

  return (
    <main>
      <Navbar />
      <Hero />
      <Services onSelectPlan={openCheckout} />

      <section className="pricing-section">
        <div className="section-shell pricing-inner">
          <div className="pricing-intro">
            <span className="eyebrow">SIMPLE STARTING POINTS</span>
            <h2>Know the next step.<br /><em>Know the cost.</em></h2>
            <p>Transparent starting prices make it easier to move forward. Final repair and replacement pricing depends on site conditions and written scope.</p>
            <a className="text-button light-text" href="#estimate">Ask about your roof <Icon name="arrow" size={16} /></a>
          </div>
          <article className="price-card">
            <div className="price-card-top"><span className="price-icon"><Icon name="inspect" size={22} /></span><span className="price-tag">ONE-TIME</span></div>
            <h3>Roof inspection</h3>
            <div className="price-value">${site.prices.inspection}<small> USD</small></div>
            <p>Photo-documented roof condition check with prioritized next steps.</p>
            <button className="button button-outline full-width" onClick={() => openCheckout("inspection")}>Book inspection <Icon name="arrow" size={16} /></button>
            <span className="price-micro">One-time payment via Whop</span>
          </article>
          <article className="price-card price-card-featured">
            <div className="price-card-top"><span className="price-icon"><Icon name="wrench" size={22} /></span><span className="price-tag">FLAT-RATE EXAMPLE</span></div>
            <h3>Standard leak repair</h3>
            <div className="price-value">${site.prices.repair}<small> USD</small></div>
            <p>Defined small-repair visit. Scope limits and exclusions must be confirmed before booking.</p>
            <button className="button button-light full-width" onClick={() => openCheckout("repair")}>Choose repair <Icon name="arrow" size={16} /></button>
            <span className="price-micro">Flat-rate plan · terms apply</span>
          </article>
          <div className="deposit-bar">
            <div className="deposit-icon"><Icon name="document" size={23} /></div>
            <div><strong>Ready to book an approved project?</strong><p>Use a project deposit to reserve the next step. It should be credited to the written project total.</p></div>
            <div className="deposit-price"><b>${site.prices.deposit}</b><small>project deposit</small></div>
            <button className="button button-dark" onClick={() => openCheckout("deposit")}>Pay deposit <Icon name="arrow" size={16} /></button>
          </div>
        </div>
      </section>

      <Financing />

      <section id="process" className="process-section">
        <div className="section-shell">
          <div className="section-heading">
            <div><span className="eyebrow">FROM QUESTION TO CLEAN FINISH</span><h2>A straightforward process.<br /><em>Every step accounted for.</em></h2></div>
            <p>Good roofing is technical work. Good service means you always know what is happening, why it matters, and what comes next.</p>
          </div>
          <div className="process-grid">
            <article><span className="process-no">01</span><div className="process-icon"><Icon name="phone" size={22} /></div><h3>Tell us what you see</h3><p>Share the symptoms, property location, and any photos or timing concerns.</p></article>
            <article><span className="process-no">02</span><div className="process-icon"><Icon name="camera" size={22} /></div><h3>Inspect and explain</h3><p>We document the issue and walk you through practical options in plain language.</p></article>
            <article><span className="process-no">03</span><div className="process-icon"><Icon name="document" size={22} /></div><h3>Agree on the scope</h3><p>Approve a written estimate, price, materials, schedule, and relevant terms.</p></article>
            <article><span className="process-no">04</span><div className="process-icon"><Icon name="shield" size={22} /></div><h3>Complete and review</h3><p>Work is completed against the agreed scope, followed by a final walkthrough and invoice.</p></article>
          </div>
        </div>
      </section>

      <Reviews />
      <ServiceArea />

      <section className="faq-section section-shell">
        <div className="faq-heading"><span className="eyebrow">GOOD QUESTIONS, CLEAR ANSWERS</span><h2>Before you book.</h2></div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div className={`faq-item ${openFaq === index ? "is-open" : ""}`} key={faq.q}>
              <button
                aria-expanded={openFaq === index}
                onClick={() => setOpenFaq((current) => current === index ? null : index)}
              >
                <span>{faq.q}</span><span className="faq-plus">{openFaq === index ? "−" : "+"}</span>
              </button>
              {openFaq === index && <p>{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <EstimateSection />
      <Footer />
      {selectedPlan && <WhopCheckout planKey={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </main>
  );
}
