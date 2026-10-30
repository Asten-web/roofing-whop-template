import { site } from "@/config/site";
import { Icon } from "@/components/ui/Icons";
import { Brand } from "@/components/layout/Brand";

export function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div className="section-shell footer-main">
        <Brand footer />
        <p>Roofing built for the long haul.<br />Serving {site.serviceArea}.</p>
        <div className="footer-contact">
          <a href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
        <div className="footer-links">
          <a href="#services">Services</a>
          <a href="#estimate">Estimate</a>
          <a href="/admin">Invoice admin</a>
        </div>
      </div>
      <div className="section-shell footer-bottom">
        <span>© {new Date().getFullYear()} {site.companyName}. Template starter; configure company details before launch.</span>
        <span>
          {site.addressLine}
          {site.licenseLine ? ` · ${site.licenseLine}` : ""}
        </span>
      </div>
    </footer>
  );
}
