import { site } from "@/config/site";
import { EstimateForm } from "@/components/forms/EstimateForm";
import { Icon } from "@/components/ui/Icons";

export function EstimateSection() {
  return (
    <section id="estimate" className="estimate-section">
      <div className="section-shell estimate-inner">
        <div className="estimate-copy">
          <span className="eyebrow">LET’S GET A CLEAR PICTURE</span>
          <h2>Tell us what’s<br /><em>going on up there.</em></h2>
          <p>Send the details once. Your request is submitted to Whop as a lead so the team can follow up about the property and next step.</p>
          <div className="estimate-contact">
            <a href={`tel:${site.phoneTel}`}><Icon name="phone" size={19} /><span><small>CALL OUR TEAM</small><strong>{site.phoneDisplay}</strong></span></a>
            <a href={`mailto:${site.email}`}><Icon name="document" size={19} /><span><small>EMAIL</small><strong>{site.email}</strong></span></a>
            <div><Icon name="clock" size={19} /><span><small>HOURS</small><strong>{site.hours}</strong></span></div>
          </div>
          <p className="micro-copy">We’ll use your information to respond to this request. Configure the company’s privacy notice and retention policy before launch.</p>
        </div>
        <div className="estimate-form-wrap">
          <div className="form-heading"><span className="eyebrow">REQUEST AN ESTIMATE</span><h3>Start with the details.</h3><p>Most forms take about two minutes.</p></div>
          <EstimateForm />
        </div>
      </div>
    </section>
  );
}
