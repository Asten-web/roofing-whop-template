import { site } from "@/config/site";
import { Icon } from "@/components/ui/Icons";

export function ServiceArea() {
  return (
    <section className="area-section">
      <div className="section-shell area-inner">
        <div>
          <span className="eyebrow">PROUD TO SERVE OUR NEIGHBORS</span>
          <h2>Local knowledge.<br /><em>Weather-ready work.</em></h2>
          <p>Serving {site.serviceArea}. Share your ZIP code and we’ll confirm whether the property falls within the team’s actual service radius.</p>
          <div className="area-chip"><Icon name="pin" size={18} /> {site.city}, {site.state} & surrounding communities</div>
        </div>
        <div className="area-card">
          <div className="area-card-top"><Icon name="pin" size={24} /><span>OUR SERVICE AREA</span></div>
          <div className="area-map-art">
            <span className="map-ring ring-1" /><span className="map-ring ring-2" /><span className="map-ring ring-3" />
            <span className="map-road road-1" /><span className="map-road road-2" /><span className="map-road road-3" />
            <span className="map-pin"><Icon name="roof" size={19} /></span>
            <span className="map-label">{site.city}</span>
          </div>
          <p>Not sure we cover your address? Send it through the estimate form and we’ll follow up.</p>
          <a className="text-button" href="#estimate">Check my address <Icon name="arrow" size={16} /></a>
        </div>
      </div>
    </section>
  );
}
