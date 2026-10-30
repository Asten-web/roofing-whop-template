import { site } from "@/config/site";
import { Icon } from "@/components/ui/Icons";

export function Reviews() {
  return (
    <section id="reviews" className="reviews-section section-shell">
      <div className="reviews-title">
        <span className="eyebrow">TRUST IS EARNED ON SITE</span>
        <h2>Roofing should feel<br /><em>refreshingly straightforward.</em></h2>
        <p>Only publish customer feedback that is genuine, permissioned, and linked to its source.</p>
      </div>
      <div className="review-grid">
        {site.reviews.length ? site.reviews.map((review, index) => (
          <blockquote key={`${review.attribution}-${index}`} className="review-card">
            <span className="quote-mark">“</span>
            <p>{review.quote}</p>
            <footer>
              <span className="review-dash" />
              <span>
                {review.attribution}
                {review.sourceUrl && <> · <a href={review.sourceUrl} target="_blank" rel="noreferrer">Source</a></>}
              </span>
            </footer>
          </blockquote>
        )) : (
          <p className="review-card review-empty">Verified, permissioned customer reviews will appear here once configured.</p>
        )}
      </div>
      <div className="trust-footnote">
        <Icon name="shield" size={20} />
        <p><strong>Proof over promises.</strong> Add actual state/local license information, insurance details, workmanship warranty, manufacturer certifications, and a verified review profile. Do not claim credentials the business does not hold.</p>
      </div>
    </section>
  );
}
