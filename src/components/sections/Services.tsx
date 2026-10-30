import { site, type PlanKey } from "@/config/site";
import { trackWhop } from "@/lib/pixel";
import { Icon } from "@/components/ui/Icons";

type Props = { onSelectPlan: (plan: PlanKey) => void };

export function Services({ onSelectPlan }: Props) {
  return (
    <>
      <section className="trust-strip" aria-label="Service commitments">
        <div><Icon name="check" size={18} /><span>Written estimates</span></div>
        <div><Icon name="camera" size={18} /><span>Photo-documented findings</span></div>
        <div><Icon name="clock" size={18} /><span>Clear scheduling</span></div>
        <div><Icon name="shield" size={18} /><span>Respect for your home</span></div>
      </section>

      <section id="services" className="section section-services section-shell">
        <div className="section-heading">
          <div><span className="eyebrow">WHAT YOUR ROOF NEEDS</span><h2>Fix the problem.<br /><em>Protect what matters.</em></h2></div>
          <p>Practical recommendations, no pressure. We help you understand what is happening above your head and what to do next.</p>
        </div>
        <div className="service-grid">
          {site.services.map((service) => (
            <article className="service-card" key={service.id}>
              <div className="service-topline"><span className="service-number">{service.number}</span><span className="service-icon"><Icon name={service.icon} size={25} /></span></div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="service-detail"><Icon name="check" size={15} />{service.detail}</div>
              <button
                className="text-button service-action"
                onClick={() => {
                  if (service.id === "replacement") {
                    trackWhop("service_viewed", { service: "replacement", action: "request_estimate" });
                    document.getElementById("estimate")?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    onSelectPlan(service.id === "inspection" ? "inspection" : "repair");
                  }
                }}
              >
                {service.id === "inspection" ? "Book an inspection" : service.id === "replacement" ? "Discuss replacement" : "View repair checkout"}
                <Icon name="arrow" size={16} />
              </button>
            </article>
          ))}
        </div>
        <p className="service-pricing-note">Template pricing shown below is illustrative. Confirm the real scope, pricing, tax treatment, and service limitations before accepting payment.</p>
      </section>
    </>
  );
}
