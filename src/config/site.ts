const env = import.meta.env;

export const site = {
  demoContent: env.VITE_DEMO_CONTENT !== "false",
  companyName: env.VITE_COMPANY_NAME || "Your Roofing Company",
  tagline: "Roofing built for the long haul.",
  logo: env.VITE_COMPANY_LOGO || "/icons/company-logo.svg",
  heroImage: env.VITE_HERO_IMAGE || "/images/hero-roofing.jpg",
  brand: {
    navy: env.VITE_BRAND_NAVY || "#12243a",
    orange: env.VITE_BRAND_ORANGE || "#e8742b",
  },
  phoneDisplay: env.VITE_COMPANY_PHONE_DISPLAY || "(555) 555-0100",
  phoneTel: env.VITE_COMPANY_PHONE_TEL || "+15555550100",
  email: env.VITE_COMPANY_EMAIL || "hello@example.com",
  city: env.VITE_COMPANY_CITY || "Your City",
  state: env.VITE_COMPANY_STATE || "ST",
  serviceArea: env.VITE_SERVICE_AREA || "Your City and nearby communities",
  addressLine: env.VITE_COMPANY_ADDRESS || "Your City, ST",
  licenseLine: env.VITE_LICENSE_LINE || "",
  hours: env.VITE_BUSINESS_HOURS || "Set your business hours",
  whopAccountId: env.VITE_WHOP_ACCOUNT_ID || "",
  sandbox: env.VITE_WHOP_SANDBOX === "true",
  productId: env.VITE_WHOP_LEAD_PRODUCT_ID || "",
  financingCopy:
    "Flexible payment options may appear at checkout for eligible customers and approved merchants. Approval, terms, and available providers vary.",
  services: [
    {
      id: "repair",
      number: "01",
      title: "Roof repair",
      description:
        "Targeted help for leaks, missing shingles, flashing issues, storm damage, and the small problems that should not become big ones.",
      detail: "We document the visible issue, explain repair options, and agree on scope before work begins.",
      icon: "repair",
    },
    {
      id: "replacement",
      number: "02",
      title: "Roof replacement",
      description:
        "A clear replacement plan from tear-off and underlayment to ventilation, finish details, and cleanup.",
      detail: "Material options, written scope, scheduling, and change-order expectations are confirmed up front.",
      icon: "home",
    },
    {
      id: "inspection",
      number: "03",
      title: "Roof inspection",
      description:
        "A practical roof health check for homeowners, buyers, sellers, and anyone planning ahead.",
      detail: "Receive a photo-documented summary with priority items and recommended next steps.",
      icon: "inspect",
    },
  ],
  prices: {
    inspection: 149,
    deposit: 500,
    repair: 299,
  },
  plans: {
    inspection: env.VITE_WHOP_INSPECTION_PLAN_ID || "",
    deposit: env.VITE_WHOP_DEPOSIT_PLAN_ID || "",
    repair: env.VITE_WHOP_REPAIR_PLAN_ID || "",
  },
  reviews: [] as { quote: string; attribution: string; sourceUrl?: string }[],
} as const;

export type RoofingService = (typeof site.services)[number];
export type PlanKey = keyof typeof site.plans;
