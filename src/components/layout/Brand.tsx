import { site } from "@/config/site";

type Props = {
  href?: string;
  footer?: boolean;
};

export function Brand({ href = "#top", footer = false }: Props) {
  return (
    <a
      className={`brand-lockup${footer ? " footer-brand" : ""}`}
      href={href}
      aria-label={`${site.companyName} home`}
    >
      <img className="brand-mark" src={site.logo} alt="" />
      <span className="brand-copy">
        <strong>{site.companyName}</strong>
        <small>ROOFING · REPAIR · REPLACEMENT</small>
      </span>
    </a>
  );
}
