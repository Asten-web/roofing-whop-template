import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { site, type PlanKey } from "@/config/site";
import { EstimateForm } from "@/components/EstimateForm";
import { WhopCheckout } from "@/components/WhopCheckout";
import { Icon } from "@/components/Icons";
import { trackWhop } from "@/lib/pixel";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const serviceCards = useMemo(() => site.services, []);
  function openCheckout(plan: PlanKey) {
    if (plan === "deposit") trackWhop("deposit_started", { plan: "project_deposit", amount: site.prices.deposit, currency: "USD" });
    else trackWhop("service_viewed", { service: plan, plan, currency: "USD" });
    setSelectedPlan(plan);
  }

  const faqs = [
    { q: "Do I need an inspection before requesting a repair?", a: "Not always. Tell us what you are seeing and we will recommend the right next step. The paid inspection is useful when you want a documented roof condition report or when the problem needs closer review." },
    { q: "How does the project deposit work?", a: "The sample $500 deposit is a starting template price and should only be collected after the scope, total project price, cancellation terms, and deposit credit are stated in a written agreement. Configure the plan to match the real business policy before launch." },
    { q: "Can I pay over time?", a: "Eligible customers may see supported installment or financing methods at Whop checkout, depending on merchant approval, payment method, geography, transaction, and provider terms. Financing is not guaranteed." },
    { q: "Do you work with insurance claims?", a: "We can document visible roof damage and provide a clear scope of work. Coverage decisions belong to your insurer, and a contractor should never promise claim approval." },
  ];

  return (
    <main>
      <div className="announcement"><Icon name="spark" size={15} /> Straight answers. Clear scopes. Roofing that earns its keep. <a href="#estimate">Request an estimate <Icon name="arrow" size={13} /></a></div>
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label={`${site.companyName} home`}>
          <span className="brand-mark"><Icon name="roof" size={28} /></span>
          <span className="brand-copy"><strong>{site.companyName}</strong><small>ROOFING · REPAIR · REPLACEMENT</small></span>
        </a>
        <button className="mobile-menu-toggle" aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMobileMenuOpen((v) => !v)}><Icon name={mobileMenuOpen ? "close" : "menu"} size={23} /></button>
        <nav className={mobileMenuOpen ? "main-nav open" : "main-nav"} aria-label="Main navigation">
          <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="#process" onClick={() => setMobileMenuOpen(false)}>Our process</a>
          <a href="#reviews" onClick={() => setMobileMenuOpen(false)}>Why us</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          <a className="button button-dark nav-cta" href="#estimate" onClick={() => setMobileMenuOpen(false)}>Get an estimate <Icon name="arrow" size={16} /></a>
        </nav>
      </header>

      <section id="top" className="hero section-shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> LOCAL ROOFING, DONE WITH CARE</div>
          <h1>A stronger roof.<br /><em>A little less worry.</em></h1>
          <p className="hero-lede">From the first missing shingle to a full roof replacement, get clear advice, a written scope, and workmanship built for the weather ahead.</p>
          <div className="hero-actions"><a className="button button-accent" href="#estimate">Request an estimate <Icon name="arrow" size={17} /></a><a className="button button-quiet" href={`tel:${site.phoneTel}`}><Icon name="phone" size={17} /> {site.phoneDisplay}</a></div>
          <div className="hero-proof"><span className="proof-icon"><Icon name="shield" size={19} /></span><span><strong>Clarity before construction</strong><small>Written scope · Photo documentation · Respectful cleanup</small></span></div>
        </div>
        <div className="hero-visual" aria-label="Illustration of a well-built residential roof" role="img">
          <div className="visual-sun" /><div className="visual-cloud cloud-one" /><div className="visual-cloud cloud-two" />
          <div className="house-illustration">
            <div className="roof-main"><div className="roof-line roof-line-a" /><div className="roof-line roof-line-b" /><div className="roof-line roof-line-c" /><div className="roof-shingle" /></div>
            <div className="house-gable"><span className="gable-window" /></div>
            <div className="house-body"><div className="window window-left"><i /><i /><i /><i /></div><div className="front-door" /><div className="window window-right"><i /><i /><i /><i /></div></div>
            <div className="porch-roof" /><div className="porch-post post-left" /><div className="porch-post post-right" />
          </div>
          <div className="visual-ground" />
          <div className="visual-note"><span className="note-icon"><Icon name="check" size={17} /></span><span><strong>Good work starts here.</strong><small>Built on honest recommendations.</small></span></div>
          <span className="visual-caption">LOCAL KNOW-HOW. LASTING COVER.</span>
        </div>
      </section>

      <section className="trust-strip" aria-label="Service commitments"><div><Icon name="check" size={18} /><span>Written estimates</span></div><div><Icon name="camera" size={18} /><span>Photo-documented findings</span></div><div><Icon name="clock" size={18} /><span>Clear scheduling</span></div><div><Icon name="shield" size={18} /><span>Respect for your home</span></div></section>

      <section id="services" className="section section-services section-shell">
        <div className="section-heading"><div><span className="eyebrow">WHAT YOUR ROOF NEEDS</span><h2>Fix the problem.<br /><em>Protect what matters.</em></h2></div><p>Practical recommendations, no pressure. We help you understand what is happening above your head and what to do next.</p></div>
        <div className="service-grid">{serviceCards.map((service) => <article className="service-card" key={service.id}>
          <div className="service-topline"><span className="service-number">{service.number}</span><span className="service-icon"><Icon name={service.icon} size={25} /></span></div>
          <h3>{service.title}</h3><p>{service.description}</p><div className="service-detail"><Icon name="check" size={15} />{service.detail}</div>
          <button className="text-button service-action" onClick={() => {
            if (service.id === "replacement") {
              trackWhop("service_viewed", { service: "replacement", action: "request_estimate" });
              document.getElementById("estimate")?.scrollIntoView({ behavior: "smooth" });
            } else {
              openCheckout(service.id === "inspection" ? "inspection" : "repair");
            }
          }}>{service.id === "inspection" ? "Book an inspection" : service.id === "replacement" ? "Discuss replacement" : "View repair checkout"}<Icon name="arrow" size={16} /></button>
        </article>)}</div>
        <p className="service-pricing-note">Template pricing shown below is illustrative. Confirm the real scope, pricing, tax treatment, and service limitations before accepting payment.</p>
      </section>

      <section className="pricing-section"><div className="section-shell pricing-inner"><div className="pricing-intro"><span className="eyebrow">SIMPLE STARTING POINTS</span><h2>Know the next step.<br /><em>Know the cost.</em></h2><p>Transparent starting prices make it easier to move forward. Final repair and replacement pricing depends on site conditions and written scope.</p><a className="text-button light-text" href="#estimate">Ask about your roof <Icon name="arrow" size={16} /></a></div>
        <div className="price-card"><div className="price-card-top"><span className="price-icon"><Icon name="inspect" size={22} /></span><span className="price-tag">ONE-TIME</span></div><h3>Roof inspection</h3><div className="price-value">${site.prices.inspection}<small> USD</small></div><p>Photo-documented roof condition check with prioritized next steps.</p><button className="button button-outline full-width" onClick={() => openCheckout("inspection")}>Book inspection <Icon name="arrow" size={16} /></button><span className="price-micro">One-time payment via Whop</span></div>
        <div className="price-card price-card-featured"><div className="price-card-top"><span className="price-icon"><Icon name="wrench" size={22} /></span><span className="price-tag">FLAT-RATE EXAMPLE</span></div><h3>Standard leak repair</h3><div className="price-value">${site.prices.repair}<small> USD</small></div><p>Defined small-repair visit. Scope limits and exclusions must be confirmed before booking.</p><button className="button button-light full-width" onClick={() => openCheckout("repair")}>Choose repair <Icon name="arrow" size={16} /></button><span className="price-micro">Flat-rate plan · terms apply</span></div>
        <div className="deposit-bar"><div className="deposit-icon"><Icon name="document" size={23} /></div><div><strong>Ready to book an approved project?</strong><p>Use a project deposit to reserve the next step. It should be credited to the written project total.</p></div><div className="deposit-price"><b>${site.prices.deposit}</b><small>project deposit</small></div><button className="button button-dark" onClick={() => openCheckout("deposit")}>Pay deposit <Icon name="arrow" size={16} /></button></div>
      </div></section>

      <section className="financing-section section-shell"><div className="financing-art"><div className="financing-circle"><Icon name="spark" size={38} /></div><div className="finance-lines line-a" /><div className="finance-lines line-b" /><div className="finance-stamp">ROOM TO<br />BREATHE</div></div><div className="financing-copy"><span className="eyebrow">MORE WAYS TO MOVE FORWARD</span><h2>Protect your home.<br /><em>Choose how to pay.</em></h2><p>Whop checkout may present supported buy-now-pay-later or installment options for approved merchants and eligible customers. See the options displayed to you before you confirm payment.</p><small>{site.financingCopy}</small><a className="button button-dark" href="#estimate">Talk through your options <Icon name="arrow" size={16} /></a></div></section>

      <section id="process" className="process-section"><div className="section-shell"><div className="section-heading"><div><span className="eyebrow">FROM QUESTION TO CLEAN FINISH</span><h2>A straightforward process.<br /><em>Every step accounted for.</em></h2></div><p>Good roofing is technical work. Good service means you always know what is happening, why it matters, and what comes next.</p></div><div className="process-grid"><article><span className="process-no">01</span><div className="process-icon"><Icon name="phone" size={22} /></div><h3>Tell us what you see</h3><p>Share the symptoms, property location, and any photos or timing concerns.</p></article><article><span className="process-no">02</span><div className="process-icon"><Icon name="camera" size={22} /></div><h3>Inspect and explain</h3><p>We document the issue and walk you through practical options in plain language.</p></article><article><span className="process-no">03</span><div className="process-icon"><Icon name="document" size={22} /></div><h3>Agree on the scope</h3><p>Approve a written estimate, price, materials, schedule, and relevant terms.</p></article><article><span className="process-no">04</span><div className="process-icon"><Icon name="shield" size={22} /></div><h3>Complete and review</h3><p>Work is completed against the agreed scope, followed by a final walkthrough and invoice.</p></article></div></div></section>

      <section id="reviews" className="reviews-section section-shell"><div className="reviews-title"><span className="eyebrow">TRUST IS EARNED ON SITE</span><h2>Roofing should feel<br /><em>refreshingly straightforward.</em></h2><p>Before launch, replace each sample below with a real, permissioned review and link to its source. Never publish illustrative testimonials as real customer statements.</p></div><div className="review-grid">{site.sampleReviews.map((review, i) => <blockquote key={i} className="review-card"><span className="quote-mark">“</span><p>{review.quote}</p><footer><span className="review-dash" /> <span>{review.attribution}</span></footer></blockquote>)}</div><div className="trust-footnote"><Icon name="shield" size={20} /><p><strong>Proof over promises.</strong> Add your actual state/local license number, insurance information, workmanship warranty, manufacturer certifications, and verified review profile here. Do not claim credentials that the business does not hold.</p></div></section>

      <section className="area-section"><div className="section-shell area-inner"><div><span className="eyebrow">PROUD TO SERVE OUR NEIGHBORS</span><h2>Local knowledge.<br /><em>Weather-ready work.</em></h2><p>Serving {site.serviceArea}. Share your ZIP code and we’ll confirm whether the property falls within the team’s actual service radius.</p><div className="area-chip"><Icon name="pin" size={18} /> {site.city}, {site.state} & surrounding communities</div></div><div className="area-card"><div className="area-card-top"><Icon name="pin" size={24} /><span>OUR SERVICE AREA</span></div><div className="area-map-art"><span className="map-ring ring-1" /><span className="map-ring ring-2" /><span className="map-ring ring-3" /><span className="map-road road-1" /><span className="map-road road-2" /><span className="map-road road-3" /><span className="map-pin"><Icon name="roof" size={19} /></span><span className="map-label">{site.city}</span></div><p>Not sure we cover your address? Send it through the estimate form and we’ll follow up.</p><a className="text-button" href="#estimate">Check my address <Icon name="arrow" size={16} /></a></div></div></section>

      <section className="faq-section section-shell"><div className="faq-heading"><span className="eyebrow">GOOD QUESTIONS, CLEAR ANSWERS</span><h2>Before you book.</h2></div><div className="faq-list">{faqs.map((faq, i) => <div className={`faq-item ${openFaq === i ? "is-open" : ""}`} key={faq.q}><button aria-expanded={openFaq === i} onClick={() => setOpenFaq((v) => v === i ? null : i)}><span>{faq.q}</span><span className="faq-plus">{openFaq === i ? "−" : "+"}</span></button>{openFaq === i && <p>{faq.a}</p>}</div>)}</div></section>

      <section id="estimate" className="estimate-section"><div className="section-shell estimate-inner"><div className="estimate-copy"><span className="eyebrow">LET’S GET A CLEAR PICTURE</span><h2>Tell us what’s<br /><em>going on up there.</em></h2><p>Send the details once. Your request is submitted to Whop as a lead so the team can follow up about the property and next step.</p><div className="estimate-contact"><a href={`tel:${site.phoneTel}`}><Icon name="phone" size={19} /><span><small>CALL OUR TEAM</small><strong>{site.phoneDisplay}</strong></span></a><a href={`mailto:${site.email}`}><Icon name="document" size={19} /><span><small>EMAIL</small><strong>{site.email}</strong></span></a><div><Icon name="clock" size={19} /><span><small>HOURS</small><strong>{site.hours}</strong></span></div></div><p className="micro-copy">We’ll use your information to respond to this request. Configure the company’s privacy notice and retention policy before launch.</p></div><div className="estimate-form-wrap"><div className="form-heading"><span className="eyebrow">REQUEST AN ESTIMATE</span><h3>Start with the details.</h3><p>Most forms take about two minutes.</p></div><EstimateForm /></div></div></section>

      <footer id="contact" className="site-footer"><div className="section-shell footer-main"><a className="brand-lockup footer-brand" href="#top"><span className="brand-mark"><Icon name="roof" size={27} /></span><span className="brand-copy"><strong>{site.companyName}</strong><small>ROOFING · REPAIR · REPLACEMENT</small></span></a><p>Roofing built for the long haul.<br />Serving {site.serviceArea}.</p><div className="footer-contact"><a href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a><a href={`mailto:${site.email}`}>{site.email}</a></div><div className="footer-links"><a href="#services">Services</a><a href="#estimate">Estimate</a><a href="/admin">Invoice admin</a></div></div><div className="section-shell footer-bottom"><span>© {new Date().getFullYear()} {site.companyName}. Template starter; configure company details before launch.</span><span>{site.addressLine} · {site.licenseLine}</span></div></footer>
      {selectedPlan && <WhopCheckout planKey={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </main>
  );
}
