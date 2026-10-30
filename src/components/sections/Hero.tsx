import type { CSSProperties } from "react";
import { site } from "@/config/site";
import { Icon } from "@/components/ui/Icons";

export function Hero() {
  return (
    <section
      id="top"
      className="hero section-shell"
      style={{
        "--brand-navy": site.brand.navy,
        "--brand-orange": site.brand.orange,
      } as CSSProperties}
    >
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> LOCAL ROOFING, DONE WITH CARE</div>
        <h1>A stronger roof.<br /><em>A little less worry.</em></h1>
        <p className="hero-lede">From the first missing shingle to a full roof replacement, get clear advice, a written scope, and workmanship built for the weather ahead.</p>
        <div className="hero-actions">
          <a className="button button-accent" href="#estimate">Request an estimate <Icon name="arrow" size={17} /></a>
          <a className="button button-quiet" href={`tel:${site.phoneTel}`}><Icon name="phone" size={17} /> {site.phoneDisplay}</a>
        </div>
        <div className="hero-proof">
          <span className="proof-icon"><Icon name="shield" size={19} /></span>
          <span><strong>Clarity before construction</strong><small>Written scope · Photo documentation · Respectful cleanup</small></span>
        </div>
        {site.demoContent && <p className="demo-label">Demo template content — verify all business details before launch.</p>}
      </div>
      <div
        className={`hero-visual${site.heroImage ? " has-photo" : ""}`}
        aria-label={site.heroImage ? "Residential roofing project" : "Illustration of a well-built residential roof"}
        role="img"
      >
        {site.heroImage && <img className="hero-photo" src={site.heroImage} alt="Residential roof and home exterior" />}
        <div className="visual-sun" />
        <div className="visual-cloud cloud-one" />
        <div className="visual-cloud cloud-two" />
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
  );
}
