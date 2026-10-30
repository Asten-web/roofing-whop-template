const env = import.meta.env;

export const site = {
  // Rebrand from this single file. Replace sample address, contact info, service area, and proof points before using for a real company.
  companyName: env.VITE_COMPANY_NAME || "Summit Ridge Roofing",
  tagline: "Roofing built for the long haul.",
  phoneDisplay: env.VITE_COMPANY_PHONE_DISPLAY || "(303) 555-0188",
  phoneTel: env.VITE_COMPANY_PHONE_TEL || "+13035550188",
  email: env.VITE_COMPANY_EMAIL || "hello@example-roofing.com",
  city: env.VITE_COMPANY_CITY || "Denver",
  state: env.VITE_COMPANY_STATE || "CO",
  serviceArea: env.VITE_SERVICE_AREA || "Denver Metro & the Front Range",
  addressLine: env.VITE_COMPANY_ADDRESS || "Denver, Colorado",
  licenseLine: env.VITE_LICENSE_LINE || "Licensed & insured details should be added here",
  hours: env.VITE_BUSINESS_HOURS || "Mon–Sat · 8:00 AM–6:00 PM",
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
    repair: 399,
  },
  plans: {
    inspection: env.VITE_WHOP_INSPECTION_PLAN_ID || "",
    deposit: env.VITE_WHOP_DEPOSIT_PLAN_ID || "",
    repair: env.VITE_WHOP_REPAIR_PLAN_ID || "",
  },
  // Keep these clearly labelled as examples until replaced with real customer feedback.
  sampleReviews: [
    {
      quote: "The estimate was clear, the photos made the issue easy to understand, and there were no surprises in the scope.",
      attribution: "Example review · replace with verified customer feedback",
    },
    {
      quote: "The crew kept us updated, protected the landscaping, and walked us through the finished work.",
      attribution: "Example review · replace with verified customer feedback",
    },
    {
      quote: "We knew what was urgent and what could wait. That made the decision much less stressful.",
      attribution: "Example review · replace with verified customer feedback",
    },
  ],
} as const;

export type RoofingService = (typeof site.services)[number];
export type PlanKey = keyof typeof site.plans;
