import type { Condition } from "@foundura/shared";

/**
 * Starter scheme catalogue for the Scheme Scan.
 *
 * IMPORTANT: every entry ships with lastVerifiedAt = null, which the app shows
 * as "check the official source". An editor must confirm each rule against the
 * linked official page and set lastVerifiedAt before launch. Scheme rules change
 * often (e.g. the DPIIT startup definition was replaced on 4 Feb 2026).
 */
export interface SchemeSeed {
  slug: string;
  name: string;
  issuer: string;
  level: "national" | "state";
  state?: string;
  category: string;
  summary: string;
  benefits: string[];
  howToApply: string[];
  rule: Condition;
  alsoCheck: string[];
  status: "open" | "rolling" | "closed" | "indirect";
  statusNote?: string;
  sourceUrl: string;
  sourceName: string;
}

const REGISTERED_FORMS = ["private_limited", "llp", "partnership", "cooperative"];

/** DPIIT "Startup" definition (G.S.R. 108(E), 4 Feb 2026), as far as scan answers can test it. */
const dpiitDefinition: Condition = {
  all: [
    {
      fact: "entityType",
      op: "in",
      value: REGISTERED_FORMS,
      label: "Registered as a private limited company, LLP, partnership firm or cooperative society",
    },
    {
      any: [
        { fact: "ageYears", op: "lte", value: 10, label: "Up to 10 years from incorporation" },
        {
          all: [
            { fact: "isDeepTech", op: "isTrue", label: "Deep tech" },
            { fact: "ageYears", op: "lte", value: 20, label: "Up to 20 years" },
          ],
        },
      ],
      label: "Within the age limit: 10 years from incorporation (20 years for Deep Tech startups)",
    },
    {
      any: [
        { fact: "turnoverInrCr", op: "lte", value: 200, label: "Turnover up to ₹200 crore" },
        {
          all: [
            { fact: "isDeepTech", op: "isTrue", label: "Deep tech" },
            { fact: "turnoverInrCr", op: "lte", value: 300, label: "Turnover up to ₹300 crore" },
          ],
        },
      ],
      label: "Turnover within the limit: ₹200 crore in any year (₹300 crore for Deep Tech startups)",
    },
  ],
};

const isDpiit: Condition = {
  fact: "dpiitRecognised",
  op: "isTrue",
  label: "Recognised as a startup by DPIIT",
};

export const SCHEMES: SchemeSeed[] = [
  {
    slug: "dpiit-startup-recognition",
    name: "DPIIT Startup Recognition",
    issuer: "DPIIT, Ministry of Commerce & Industry",
    level: "national",
    category: "recognition",
    summary:
      "Official recognition as a startup under Startup India. It is the gateway to most central startup benefits. The 2026 rules raised the turnover limit and added a Deep Tech category.",
    benefits: [
      "Unlocks tax, IP, procurement and funding benefits listed on Startup India",
      "Self-certification under certain labour and environmental laws",
      "Eligibility for Seed Fund, Credit Guarantee and Fund of Funds-backed investors",
    ],
    howToApply: [
      "Register on the Startup India portal",
      "Fill the DPIIT recognition form with incorporation details and a short note on your innovation",
      "Upload the certificate of incorporation or registration",
    ],
    rule: dpiitDefinition,
    alsoCheck: [
      "Not formed by splitting up or reconstructing an existing business",
      "Working on innovation, improvement of products/processes/services, or a scalable business model with high potential for jobs or wealth",
    ],
    status: "rolling",
    sourceUrl: "https://www.startupindia.gov.in/content/sih/en/startupgov/startup_recognition_page.html",
    sourceName: "Startup India",
  },
  {
    slug: "dpiit-deep-tech-recognition",
    name: "DPIIT Deep Tech Startup Recognition",
    issuer: "DPIIT, Ministry of Commerce & Industry",
    level: "national",
    category: "recognition",
    summary:
      "A Deep Tech sub-category introduced on 4 February 2026, with a longer 20-year window and a ₹300 crore turnover limit for science- and IP-led ventures.",
    benefits: [
      "Startup status for up to 20 years instead of 10",
      "Higher turnover ceiling of ₹300 crore",
      "Fits the deep-tech focus of Startup India Fund of Funds 2.0",
    ],
    howToApply: [
      "Apply for DPIIT recognition on the Startup India portal and choose the Deep Tech category",
      "Be ready to show R&D spend, IP and the science behind the product",
    ],
    rule: {
      all: [
        { fact: "isDeepTech", op: "isTrue", label: "Builds on new scientific or engineering knowledge (deep tech)" },
        {
          fact: "entityType",
          op: "in",
          value: REGISTERED_FORMS,
          label: "Registered as a private limited company, LLP, partnership firm or cooperative society",
        },
        { fact: "ageYears", op: "lte", value: 20, label: "Up to 20 years from incorporation" },
        { fact: "turnoverInrCr", op: "lte", value: 300, label: "Turnover up to ₹300 crore in any year" },
      ],
    },
    alsoCheck: ["Meets the notification's R&D and fund-utilisation conditions for Deep Tech startups"],
    status: "rolling",
    sourceUrl: "https://www.lkslaw.com/insights/articles/india-s-new-startup-and-deep-tech-startup-framework-why-the-2026-dpiit-notification-matters",
    sourceName: "Lakshmikumaran & Sridharan (summary of G.S.R. 108(E))",
  },
  {
    slug: "income-tax-holiday-80iac",
    name: "Income-tax holiday for eligible startups (Section 80-IAC)",
    issuer: "CBDT / Inter-Ministerial Board, via DPIIT",
    level: "national",
    category: "tax",
    summary:
      "Eligible DPIIT-recognised companies and LLPs can claim a 100% deduction of profits for 3 consecutive years out of their first 10, after approval from the Inter-Ministerial Board.",
    benefits: ["100% profit-linked deduction for any 3 consecutive years in the first 10 years"],
    howToApply: [
      "Get DPIIT recognition first",
      "Apply for the Inter-Ministerial Board certificate through the Startup India portal",
    ],
    rule: {
      all: [
        isDpiit,
        { fact: "entityType", op: "in", value: ["private_limited", "llp"], label: "A private limited company or LLP" },
        { fact: "turnoverInrCr", op: "lte", value: 100, label: "Turnover up to ₹100 crore in the year of claim" },
      ],
    },
    alsoCheck: [
      "Incorporated within the window allowed by the current Income-tax law (check the latest Finance Act and the new Income-tax Act provisions)",
      "Inter-Ministerial Board certificate obtained",
    ],
    status: "rolling",
    statusNote: "Turnover and date conditions are set by tax law and differ from the DPIIT definition. Confirm with a CA.",
    sourceUrl: "https://www.startupindia.gov.in/content/sih/en/startupgov/tax_exemption.html",
    sourceName: "Startup India",
  },
  {
    slug: "startup-india-seed-fund",
    name: "Startup India Seed Fund Scheme (SISFS)",
    issuer: "DPIIT, via selected incubators",
    level: "national",
    category: "grant",
    summary:
      "Early money for proof of concept, prototypes, product trials, market entry and commercialisation, routed through approved incubators.",
    benefits: [
      "Grant for proof of concept, prototype development or product trials",
      "Convertible debentures or debt-linked instruments for market entry and commercialisation",
    ],
    howToApply: ["Apply on the SISFS portal and choose up to three incubators", "Pitch to the incubator's committee"],
    rule: {
      all: [
        isDpiit,
        { fact: "ageYears", op: "lte", value: 2, label: "Incorporated not more than 2 years ago when applying" },
        {
          fact: "govtSupportReceivedInrLakh",
          op: "lte",
          value: 10,
          label: "Has not received more than ₹10 lakh in monetary support under other central or state schemes",
        },
        {
          fact: "indianPromoterSharePct",
          op: "gte",
          value: 51,
          label: "Indian promoters hold at least 51% of the shares",
        },
      ],
    },
    alsoCheck: ["A business idea with market fit, a viable commercialisation plan and scope for scaling"],
    status: "closed",
    statusNote: "The SISFS portal's application window closed on 31 May 2026. Watch the Policy Newsroom for a reopening.",
    sourceUrl: "https://seedfund.startupindia.gov.in/",
    sourceName: "Startup India Seed Fund portal",
  },
  {
    slug: "credit-guarantee-scheme-startups",
    name: "Credit Guarantee Scheme for Startups (CGSS)",
    issuer: "DPIIT; operated by NCGTC",
    level: "national",
    category: "loan",
    summary:
      "A government guarantee on loans from banks, NBFCs and venture-debt funds to recognised startups, so lenders can lend with less or no collateral.",
    benefits: ["Collateral-light loans and venture debt backed by a government guarantee"],
    howToApply: ["Approach a member lending institution (bank, NBFC or SEBI-registered AIF)", "The lender applies for the guarantee"],
    rule: {
      all: [
        isDpiit,
        {
          fact: "stage",
          op: "in",
          value: ["early_revenue", "growth"],
          label: "Has a stable revenue stream (the scheme asks for audited revenue over 12 months)",
        },
      ],
    },
    alsoCheck: ["Not in default to any lender and not classified as a non-performing asset", "Current guarantee ceiling per borrower"],
    status: "rolling",
    sourceUrl: "https://www.ncgtc.in/",
    sourceName: "NCGTC",
  },
  {
    slug: "startup-india-fund-of-funds-2",
    name: "Startup India Fund of Funds 2.0 (indirect)",
    issuer: "DPIIT; operated by SIDBI",
    level: "national",
    category: "fund",
    summary:
      "A ₹10,000 crore fund of funds, notified on 13 April 2026, that invests in SEBI-registered AIFs, which then invest in startups. Focus on deep tech, early growth and tech manufacturing.",
    benefits: ["More venture capital available from FoF-backed funds, especially for deep tech and manufacturing"],
    howToApply: [
      "Startups do not apply to the FoF directly",
      "Pitch to AIFs that have received FoF commitments; ask funds whether they are FoF-backed",
    ],
    rule: {
      all: [
        isDpiit,
        {
          fact: "stage",
          op: "in",
          value: ["prototype", "early_revenue", "growth"],
          label: "Past the idea stage (has a product or prototype)",
        },
      ],
    },
    alsoCheck: ["Each AIF applies its own investment thesis and criteria"],
    status: "indirect",
    sourceUrl: "https://analyticsindiamag.com/ai-news/dpiit-notifies-10000-cr-fund-of-funds-20-with-renewed-focus-on-deeptech-manufacturing/",
    sourceName: "Analytics India Magazine",
  },
  {
    slug: "startup-ipr-fee-benefits",
    name: "Startup IP protection support (patent and trademark fee benefits)",
    issuer: "Office of the Controller General of Patents, Designs & Trade Marks; DPIIT",
    level: "national",
    category: "ipr",
    summary:
      "Recognised startups pay reduced official fees for patents and trademarks, can request expedited patent examination, and can use empanelled facilitators.",
    benefits: [
      "Reduced official fees for patent and trademark filings",
      "Option of expedited examination of patent applications",
      "Help from empanelled IP facilitators under the startup IP scheme",
    ],
    howToApply: ["File with the IP office, selecting the startup category and attaching DPIIT recognition"],
    rule: { all: [isDpiit] },
    alsoCheck: ["Current fee schedule and facilitator arrangements on the IP office website"],
    status: "rolling",
    sourceUrl: "https://ipindia.gov.in/",
    sourceName: "IP India",
  },
  {
    slug: "public-procurement-relaxations",
    name: "Public procurement relaxations and GeM Startup Runway",
    issuer: "Ministry of Finance (GFR) / Government e-Marketplace",
    level: "national",
    category: "procurement",
    summary:
      "Recognised startups can sell to government buyers with relaxed prior-turnover and prior-experience conditions, subject to quality and technical specifications.",
    benefits: [
      "Relaxation of prior turnover and experience criteria in government tenders",
      "Startup Runway on GeM to list innovative products",
    ],
    howToApply: ["Register as a seller on GeM", "Add your DPIIT recognition to the seller profile"],
    rule: { all: [isDpiit] },
    alsoCheck: ["Each tender's technical and quality specifications still apply"],
    status: "rolling",
    sourceUrl: "https://gem.gov.in/",
    sourceName: "Government e-Marketplace",
  },
  {
    slug: "birac-big",
    name: "BIRAC Biotechnology Ignition Grant (BIG)",
    issuer: "BIRAC, Department of Biotechnology",
    level: "national",
    category: "grant",
    summary:
      "Early-stage grant for biotech, medtech and life-science ideas to establish proof of concept, offered through periodic calls.",
    benefits: ["Grant funding for proof of concept, with mentoring through BIG partners"],
    howToApply: ["Apply when a BIG call is open on the BIRAC website", "Submit the proposal through the chosen BIG partner"],
    rule: {
      all: [
        {
          fact: "sectors",
          op: "includesAny",
          value: ["biotech", "medtech", "healthtech"],
          label: "Works in biotech, medtech or another life-science area",
        },
        { fact: "stage", op: "in", value: ["idea", "prototype"], label: "At idea or proof-of-concept stage" },
      ],
    },
    alsoCheck: ["Grant amount, eligible applicant types and call dates in the current call document"],
    status: "open",
    statusNote: "Runs as periodic calls. Check the BIRAC site for the current call.",
    sourceUrl: "https://birac.nic.in/",
    sourceName: "BIRAC",
  },
  {
    slug: "nidhi-prayas",
    name: "NIDHI-PRAYAS prototype support",
    issuer: "Department of Science & Technology, via host incubators",
    level: "national",
    category: "grant",
    summary:
      "Support for innovators and early startups to turn an idea into a working prototype, delivered through DST-backed host incubators.",
    benefits: ["Prototype funding plus access to incubator labs and mentors"],
    howToApply: ["Apply to a PRAYAS host incubator when it opens a call"],
    rule: {
      all: [{ fact: "stage", op: "in", value: ["idea", "prototype"], label: "Has an idea that needs a first prototype" }],
    },
    alsoCheck: ["Grant limits and eligible sectors set by each host incubator's call"],
    status: "open",
    statusNote: "Calls are run by individual host incubators.",
    sourceUrl: "https://nidhi.dst.gov.in/",
    sourceName: "NIDHI (DST)",
  },
  {
    slug: "stand-up-india",
    name: "Stand-Up India loans",
    issuer: "Department of Financial Services; banks; SIDBI",
    level: "national",
    category: "loan",
    summary:
      "Bank loans between ₹10 lakh and ₹1 crore for greenfield enterprises led by women, or by Scheduled Caste or Scheduled Tribe entrepreneurs.",
    benefits: ["Composite bank loan of ₹10 lakh to ₹1 crore for a new enterprise"],
    howToApply: ["Apply through any scheduled commercial bank branch or the Stand-Up Mitra portal"],
    rule: {
      all: [
        {
          fact: "womenLed",
          op: "isTrue",
          label: "Led by a woman entrepreneur (the scheme also covers SC/ST entrepreneurs; Foundura does not ask about caste)",
        },
        { fact: "stage", op: "in", value: ["idea", "prototype"], label: "A new (greenfield) enterprise" },
      ],
    },
    alsoCheck: [
      "For non-individual enterprises, at least 51% held by the woman or SC/ST entrepreneur",
      "Manufacturing, services, trading or agri-allied activity",
    ],
    status: "rolling",
    statusNote: "The Union Cabinet extended the scheme to 31 March 2031 on 11 November 2026.",
    sourceUrl: "https://www.standupmitra.in/",
    sourceName: "Stand-Up Mitra",
  },
  {
    slug: "karnataka-startup-policy-2025-30",
    name: "Karnataka Startup Policy 2025–30",
    issuer: "Government of Karnataka (Karnataka Startup Cell)",
    level: "state",
    state: "KA",
    category: "state_policy",
    summary:
      "Karnataka's five-year startup policy with a ₹518 crore outlay, aiming to support 25,000 startups with a focus on emerging technologies.",
    benefits: ["State grants, incentives and programmes for Karnataka-based startups (see the policy for current schemes)"],
    howToApply: ["Register with the Karnataka Startup Cell", "Apply to individual programmes as they open"],
    rule: {
      all: [
        { fact: "state", op: "eq", value: "KA", label: "Based in Karnataka" },
        {
          fact: "entityType",
          op: "in",
          value: REGISTERED_FORMS,
          label: "Registered as a company, LLP, partnership or cooperative",
        },
      ],
    },
    alsoCheck: ["Each state programme's own criteria (often state registration or DPIIT recognition)"],
    status: "open",
    sourceUrl: "https://analyticsindiamag.com/ai-trends/from-karnataka-to-gujarat-how-states-startup-policies-in-2025-revved-up-innovation",
    sourceName: "Analytics India Magazine",
  },
  {
    slug: "uttar-pradesh-startup-policy-2026",
    name: "Uttar Pradesh Startup Policy 2026",
    issuer: "Government of Uttar Pradesh (UP Startup Mission)",
    level: "state",
    state: "UP",
    category: "state_policy",
    summary:
      "Approved on 6 July 2026 for five years. It raises seed funding and prototype grants, adds deep-tech support and Centres of Excellence, and runs through the new UP Startup Mission portal.",
    benefits: [
      "Higher seed funding and prototype grants than the 2020 policy",
      "Sustenance allowance and interest subsidies (see policy for amounts)",
      "Deep-tech support and Centres of Excellence",
    ],
    howToApply: ["Register on the UP Startup Mission portal", "Apply for the incentive that matches your stage"],
    rule: {
      all: [
        { fact: "state", op: "eq", value: "UP", label: "Based in Uttar Pradesh" },
        {
          fact: "entityType",
          op: "in",
          value: REGISTERED_FORMS,
          label: "Registered as a company, LLP, partnership or cooperative",
        },
      ],
    },
    alsoCheck: ["Recognition requirements and amounts for each incentive in the policy document"],
    status: "open",
    sourceUrl: "https://invest.up.gov.in/policies/uttar-pradesh-startup-policy-2026",
    sourceName: "Invest UP",
  },
  {
    slug: "delhi-startup-incubation-policy-2026",
    name: "Delhi Start-up and Incubation Policy 2026",
    issuer: "Government of NCT of Delhi",
    level: "state",
    state: "DL",
    category: "state_policy",
    summary:
      "Approved on 16 July 2026 with over ₹400 crore over five years. It sets up incubation centres in state universities, colleges and ITIs and gives milestone-based support.",
    benefits: [
      "Incubation in state institutions",
      "Milestone-based financial support and mentoring",
      "Annual Delhi Start-up Youth Festival",
    ],
    howToApply: ["Watch for calls from Delhi government incubators and the policy portal once operational"],
    rule: {
      all: [{ fact: "state", op: "eq", value: "DL", label: "Based in Delhi" }],
    },
    alsoCheck: ["Detailed eligibility in the notified policy and incubator calls"],
    status: "open",
    sourceUrl:
      "https://newsonair.gov.in/delhi-govt-approves-rs-400-crore-start-up-and-incubation-policy-to-promote-innovation-self-employment/",
    sourceName: "News on AIR",
  },
  // ---------- MedTech (researched 22 Nov 2026; verify each against the official source) ----------
  {
    slug: "prip-pharma-medtech",
    name: "PRIP: Promotion of Research and Innovation in Pharma-MedTech",
    issuer: "Department of Pharmaceuticals, Ministry of Chemicals & Fertilizers",
    level: "national",
    category: "grant",
    summary:
      "A ₹5,000 crore research and innovation scheme. The second call has an Early Stage track for startups and MSMEs (technology readiness levels 1 to 3, up to ₹5 crore per project) and a Later Stage track (levels 4 to 6, up to ₹100 crore, with the government paying at most 35%).",
    benefits: [
      "Early Stage: up to ₹5 crore per project to take a technology from TRL 1–3 up to TRL 5",
      "Later Stage: up to ₹100 crore per project for TRL 4–6, co-funded by the applicant",
      "Priority MedTech areas include novel devices, AI and software as a medical device, surgical robotics and new in-vitro diagnostics",
    ],
    howToApply: ["Apply on the PRIP portal of the Department of Pharmaceuticals", "Early Stage applicants follow the call's first-stage process; Later Stage applicants submit the detailed form"],
    rule: {
      all: [
        {
          fact: "sectors",
          op: "includesAny",
          value: ["medtech", "biotech", "healthtech"],
          label: "Works on medical devices, diagnostics or other life-science products",
        },
        {
          fact: "entityType",
          op: "in",
          value: REGISTERED_FORMS,
          label: "Registered as a company, LLP, partnership or cooperative",
        },
      ],
    },
    alsoCheck: [
      "Your project's technology readiness level fits the track you apply to",
      "For Later Stage, you can fund at least 65% of the project cost",
      "Whether the call needs MSME (Udyam) registration or DPIIT recognition for your track",
    ],
    status: "open",
    statusNote: "Second call: the PRIP portal was due to open for applications from mid-September 2026.",
    sourceUrl: "https://newsonair.gov.in/department-of-pharmaceuticals-announces-second-call-for-prip-scheme-applications/",
    sourceName: "News on AIR (Department of Pharmaceuticals announcement)",
  },
  {
    slug: "smdi-clinical-studies-support",
    name: "Medical Device Clinical Studies Support Scheme (SMDI)",
    issuer: "Department of Pharmaceuticals, Ministry of Chemicals & Fertilizers",
    level: "national",
    category: "grant",
    summary:
      "Part of the Scheme for Strengthening of Medical Device Industry. Reimburses up to ₹5 crore of the cost of clinical investigations, clinical performance evaluations, post-market follow-up studies and animal studies for devices made in India.",
    benefits: ["Reimbursement of up to ₹5 crore towards clinical and animal studies for a medical device or IVD"],
    howToApply: ["Apply on the SMDI portal when a call is open", "Keep study protocols, approvals and invoices ready for reimbursement"],
    rule: {
      all: [
        { fact: "sectors", op: "includesAny", value: ["medtech"], label: "Makes medical devices or in-vitro diagnostics" },
        {
          fact: "stage",
          op: "in",
          value: ["prototype", "early_revenue", "growth"],
          label: "Has a device ready for studies (prototype or later)",
        },
        {
          fact: "entityType",
          op: "in",
          value: REGISTERED_FORMS,
          label: "Registered as a company, LLP, partnership or cooperative",
        },
      ],
    },
    alsoCheck: ["The guidelines ask for a manufacturing facility in India", "Support is paid as reimbursement after the study costs are incurred"],
    status: "closed",
    statusNote: "The latest call closed in July 2026. Watch Policy news for the next one.",
    sourceUrl: "https://pharma-dept.gov.in/schemes",
    sourceName: "Department of Pharmaceuticals",
  },
  {
    slug: "pli-medical-devices-2",
    name: "PLI-MD 2.0: Production Linked Incentive for Medical Devices",
    issuer: "Department of Pharmaceuticals, Ministry of Chemicals & Fertilizers",
    level: "national",
    category: "fund",
    summary:
      "Incentives for making medical devices in India, reopened in November 2026 with simpler eligibility: the minimum sales requirement was removed and the minimum investment lowered. Covers consumables, disposables and implants; critical components; and high-end devices.",
    benefits: [
      "Production-linked incentives for domestic manufacturing in four segments",
      "Three years to set up manufacturing after approval",
      "Applications can cover more than one segment",
    ],
    howToApply: ["Apply on the PLI-MD 2.0 portal of the Department of Pharmaceuticals; the window stays open for an extended period"],
    rule: {
      all: [
        { fact: "sectors", op: "includesAny", value: ["medtech", "manufacturing"], label: "Makes medical devices or their components" },
        {
          fact: "stage",
          op: "in",
          value: ["early_revenue", "growth"],
          label: "Selling already and ready to invest in manufacturing",
        },
        {
          fact: "entityType",
          op: "in",
          value: REGISTERED_FORMS,
          label: "Registered as a company, LLP, partnership or cooperative",
        },
      ],
    },
    alsoCheck: ["The current minimum investment and incentive rates in the scheme guidelines", "Your product falls in one of the four eligible segments"],
    status: "rolling",
    statusNote: "Reopened in November 2026 with a continuous application window.",
    sourceUrl: "https://newsonair.gov.in/government-invites-fresh-applications-under-pli-scheme-for-medical-devices/",
    sourceName: "News on AIR (Department of Pharmaceuticals announcement)",
  },
  {
    slug: "maha-medtech-mission",
    name: "MAHA MedTech Mission",
    issuer: "Anusandhan National Research Foundation (ANRF) with ICMR",
    level: "national",
    category: "grant",
    summary:
      "A ₹750 crore, five-year mission funding high-impact medical technology projects with milestone-linked grants of ₹5–25 crore (up to ₹50 crore in exceptional cases). Open to startups and MSMEs as well as academic institutions and hospitals.",
    benefits: [
      "Milestone-linked funding of ₹5–25 crore per project",
      "Links to Patent Mitra, MedTech Mitra and ICMR's clinical trial network",
    ],
    howToApply: ["Watch the ANRF portal for the next call: a concept note first, then a full proposal if shortlisted"],
    rule: {
      all: [
        {
          fact: "sectors",
          op: "includesAny",
          value: ["medtech", "healthtech", "biotech"],
          label: "Works on medical devices, diagnostics or digital health",
        },
        {
          fact: "stage",
          op: "in",
          value: ["prototype", "early_revenue", "growth"],
          label: "Past the idea stage (has a prototype or product)",
        },
      ],
    },
    alsoCheck: [
      "The call asks applicants to show genuine R&D facilities and credentials (for example DSIR recognition)",
      "Your technology is in the mission's priority areas (therapeutics and vaccines were not in the first call)",
    ],
    status: "closed",
    statusNote: "The latest full-proposal window closed on 15 May 2026. Watch Policy news for the next call.",
    sourceUrl: "https://anrfonline.in/ANRF/maha_medTech",
    sourceName: "ANRF",
  },
  // ---- Added 26 Nov 2026 from Startup India's Startup Schemes Playbook (June 2026) and MeitY Startup Hub ----
  {
    slug: "meity-samridh",
    name: "SAMRIDH: MeitY accelerator investment",
    issuer: "MeitY Startup Hub, Ministry of Electronics and IT",
    level: "national",
    category: "fund",
    summary:
      "Acceleration for IT and software product startups through accelerators selected by MeitY, with up to ₹40 lakh of investment per startup matched by private investment.",
    benefits: [
      "Investment of up to ₹40 lakh per startup, matched by private investors",
      "Accelerator support to improve the product and raise further investment",
    ],
    howToApply: ["Pick an accelerator from MeitY Startup Hub's SAMRIDH list", "Apply to that accelerator's cohort when it opens"],
    rule: {
      all: [
        { fact: "sectors", op: "includesAny", value: ["ai_software"], label: "Builds an IT or software product" },
        { fact: "entityType", op: "in", value: ["private_limited", "llp"], label: "Registered as a private limited company or LLP" },
      ],
    },
    alsoCheck: ["The selected accelerator's cohort rules and the private matching investment"],
    status: "rolling",
    statusNote: "Applications go through MeitY's selected accelerators, each with its own cohort dates.",
    sourceUrl: "https://msh.meity.gov.in/schemes/samridh",
    sourceName: "MeitY Startup Hub",
  },
  {
    slug: "meity-genesis",
    name: "GENESIS: Gen-Next Support for Innovative Startups",
    issuer: "MeitY Startup Hub, Ministry of Electronics and IT",
    level: "national",
    category: "grant",
    summary:
      "MeitY's scheme for tech startups in Tier II and III cities and towns, run through about 50 implementing agencies, from early-stage support to larger deep-tech grants.",
    benefits: [
      "Support from about ₹10 lakh for early-stage startups up to ₹1 crore for deep-tech startups",
      "Entrepreneur-in-residence, pilot and matching-investment tracks through the implementing agencies",
    ],
    howToApply: ["Find a GENESIS implementing agency (incubator or accelerator) near you", "Apply in its call for the track that fits your stage"],
    rule: {
      all: [
        isDpiit,
        {
          any: [
            { fact: "sectors", op: "includesAny", value: ["ai_software", "manufacturing"], label: "Works in IT or electronics" },
            { fact: "isDeepTech", op: "isTrue", label: "Deep tech" },
          ],
          label: "Works in electronics, IT or deep tech",
        },
      ],
    },
    alsoCheck: ["Based in, or serving, a Tier II or III city or town", "Indian promoters' shareholding required by the scheme"],
    status: "rolling",
    statusNote: "Calls are run by the implementing agencies, not by MeitY directly.",
    sourceUrl: "https://msh.meity.gov.in/schemes/genesis",
    sourceName: "MeitY Startup Hub",
  },
  {
    slug: "meity-tide-2",
    name: "TIDE 2.0: Technology Incubation and Development of Entrepreneurs",
    issuer: "MeitY Startup Hub, Ministry of Electronics and IT",
    level: "national",
    category: "grant",
    summary:
      "Grants for IT-based startups through MeitY-supported incubators, from proof of concept to product development, in areas such as AI, IoT, blockchain and robotics.",
    benefits: [
      "Up to ₹4 lakh from idea to proof of concept, and up to ₹7 lakh for a prototype",
      "Up to ₹40 lakh for product development and market outreach",
    ],
    howToApply: ["Choose a TIDE 2.0 incubator from MeitY Startup Hub's list", "Apply to that incubator's TIDE call"],
    rule: {
      all: [
        isDpiit,
        { fact: "sectors", op: "includesAny", value: ["ai_software", "manufacturing"], label: "Builds an IT-based product (software or electronics)" },
        { fact: "stage", op: "in", value: ["idea", "prototype", "early_revenue"], label: "Before the growth stage" },
      ],
    },
    alsoCheck: ["The incubator's own selection rules and which support tier you apply for"],
    status: "rolling",
    statusNote: "Calls are run by the TIDE 2.0 incubators.",
    sourceUrl: "https://msh.meity.gov.in/schemes/tide",
    sourceName: "MeitY Startup Hub",
  },
  {
    slug: "stpi-ngis",
    name: "STPI Next Generation Incubation Scheme (NGIS)",
    issuer: "Software Technology Parks of India, MeitY",
    level: "national",
    category: "grant",
    summary:
      "Incubation and seed support for software product startups in STPI's NGIS cities, with labs, testing facilities and mentoring.",
    benefits: [
      "Seed or risk funding of up to ₹25 lakh",
      "Incubation space, labs and testing facilities, mentoring, and internship or challenge grants",
    ],
    howToApply: ["Apply online on the STPI startup portal during an open call"],
    rule: {
      all: [
        { fact: "sectors", op: "includesAny", value: ["ai_software"], label: "Builds a software or tech product" },
        { fact: "stage", op: "in", value: ["idea", "prototype", "early_revenue"], label: "At an early stage" },
      ],
    },
    alsoCheck: ["Located in one of the NGIS cities", "Selected individuals, LLPs and partnerships may need to become a private limited company"],
    status: "rolling",
    statusNote: "Calls open from time to time on the STPI startup portal.",
    sourceUrl: "https://startup.stpi.in/",
    sourceName: "STPI",
  },
  {
    slug: "idex-defence-innovation",
    name: "iDEX: Innovations for Defence Excellence",
    issuer: "Defence Innovation Organisation, Ministry of Defence",
    level: "national",
    category: "grant",
    summary:
      "Grants for startups and MSMEs that solve problem statements set by the armed forces and defence bodies, through open challenges.",
    benefits: ["Grants of ₹1.5 crore up to ₹10 crore depending on the challenge", "Accelerator support through iDEX partner incubators"],
    howToApply: ["Pick a live challenge on the iDEX portal", "Submit a proposal before the challenge deadline"],
    rule: {
      all: [
        { fact: "sectors", op: "includesAny", value: ["defence"], label: "Works on defence or aerospace technology" },
        {
          fact: "entityType",
          op: "in",
          value: ["private_limited", "llp", "partnership", "sole_proprietorship", "not_registered"],
          label: "A startup, company or individual innovator",
        },
      ],
    },
    alsoCheck: ["Each challenge's problem statement, eligibility and grant amount", "DPIIT recognition or registration under the Companies Act for companies"],
    status: "rolling",
    statusNote: "Runs as challenges with their own deadlines.",
    sourceUrl: "https://idex.gov.in/challenges",
    sourceName: "iDEX",
  },
  {
    slug: "idex-aditi",
    name: "ADITI: deep-tech defence grants under iDEX",
    issuer: "Defence Innovation Organisation, Ministry of Defence",
    level: "national",
    category: "grant",
    summary: "Larger iDEX grants for critical and strategic deep-tech defence products, covering up to half of the development budget.",
    benefits: ["Grant of up to 50% of the product development budget, up to ₹25 crore"],
    howToApply: ["Apply to an ADITI challenge on the iDEX portal"],
    rule: {
      all: [
        { fact: "sectors", op: "includesAny", value: ["defence"], label: "Works on defence or aerospace technology" },
        { fact: "isDeepTech", op: "isTrue", label: "Deep tech" },
      ],
    },
    alsoCheck: ["DPIIT recognition, or registration as an Indian company, as the challenge requires"],
    status: "rolling",
    statusNote: "Runs as challenges with their own deadlines.",
    sourceUrl: "https://idex.gov.in/",
    sourceName: "iDEX",
  },
  {
    slug: "drdo-tdf",
    name: "Technology Development Fund (TDF)",
    issuer: "DRDO, Ministry of Defence",
    level: "national",
    category: "grant",
    summary: "DRDO grants for Indian industry, including startups, to build defence technologies, covering most of the project cost.",
    benefits: ["Funding of up to 90% of project cost, for projects of up to ₹10 crore"],
    howToApply: ["Register on the TDF portal", "Respond to a TDF call with a project proposal"],
    rule: {
      all: [
        { fact: "sectors", op: "includesAny", value: ["defence"], label: "Works on defence or aerospace technology" },
        {
          fact: "entityType",
          op: "in",
          value: ["private_limited", "llp", "partnership", "sole_proprietorship"],
          label: "Registered as a company, partnership, LLP or sole proprietorship",
        },
        { fact: "indianPromoterSharePct", op: "gte", value: 50, label: "At least 50% owned by Indian citizens" },
      ],
    },
    alsoCheck: ["DPIIT-recognised startups must be incubated at a central or state-assisted incubator"],
    status: "rolling",
    statusNote: "Calls are published on the TDF portal.",
    sourceUrl: "https://tdf.drdo.gov.in/",
    sourceName: "DRDO TDF",
  },
  {
    slug: "inspace-seed-fund",
    name: "IN-SPACe Seed Fund Scheme",
    issuer: "IN-SPACe, Department of Space",
    level: "national",
    category: "grant",
    summary: "Milestone-based grants for early-stage space-tech startups, with mentoring and training from IN-SPACe.",
    benefits: ["A milestone-based grant of ₹1 crore", "Mentoring, training and networking"],
    howToApply: ["Watch IN-SPACe's announcements of opportunity", "Apply when a call opens"],
    rule: {
      all: [
        isDpiit,
        { fact: "sectors", op: "includesAny", value: ["spacetech"], label: "Works on space technology" },
        { fact: "govtSupportReceivedInrLakh", op: "lte", value: 50, label: "No more than ₹50 lakh received under central or state schemes" },
      ],
    },
    alsoCheck: ["Early-stage status and the documents listed in the call"],
    status: "rolling",
    statusNote: "Opens through IN-SPACe announcements of opportunity.",
    sourceUrl: "https://www.inspace.gov.in/inspace?id=announcement_for_opportunities",
    sourceName: "IN-SPACe",
  },
  {
    slug: "inspace-technology-adoption-fund",
    name: "IN-SPACe Technology Adoption Fund (TAF)",
    issuer: "IN-SPACe, Department of Space",
    level: "national",
    category: "grant",
    summary: "Part-funding to take space technologies from the lab towards a working product, for startups, MSMEs and industry.",
    benefits: ["Up to 60% of project cost for startups and MSMEs, up to ₹25 crore"],
    howToApply: ["Apply on the IN-SPACe Technology Adoption Fund page"],
    rule: {
      all: [
        { fact: "sectors", op: "includesAny", value: ["spacetech"], label: "Works on space technology" },
        { fact: "stage", op: "in", value: ["prototype", "early_revenue", "growth"], label: "Has a working prototype or later" },
      ],
    },
    alsoCheck: ["Technology readiness of the project (the fund targets moving from TRL 3–4 to TRL 8–9)"],
    status: "rolling",
    sourceUrl: "https://www.inspace.gov.in/inspace?id=inspace_taf",
    sourceName: "IN-SPACe",
  },
  {
    slug: "rkvy-agri-innovation",
    name: "Innovation and Agri-Entrepreneurship Programme (RKVY)",
    issuer: "Ministry of Agriculture and Farmers Welfare",
    level: "national",
    category: "grant",
    summary: "Grants for agriculture and allied-sector startups through agribusiness incubators (R-ABIs), at the pre-seed and seed stages.",
    benefits: ["Pre-seed support of up to ₹5 lakh", "Seed-stage support of up to ₹25 lakh"],
    howToApply: ["Apply on the agri-startup portal to an agribusiness incubator's call"],
    rule: {
      all: [
        isDpiit,
        { fact: "sectors", op: "includesAny", value: ["agritech"], label: "Works in agriculture, food or allied sectors" },
        { fact: "stage", op: "in", value: ["idea", "prototype", "early_revenue"], label: "At the pre-seed or seed stage" },
      ],
    },
    alsoCheck: ["The incubator's selection process and the operational guidelines"],
    status: "rolling",
    statusNote: "Calls are run by the agribusiness incubators.",
    sourceUrl: "https://agristartup.gov.in/",
    sourceName: "Agri Startup portal",
  },
  {
    slug: "nidhi-eir",
    name: "NIDHI Entrepreneur in Residence (EIR)",
    issuer: "Department of Science and Technology",
    level: "national",
    category: "grant",
    summary: "A monthly fellowship for graduates who want to build a technology startup, hosted at a DST-supported incubator.",
    benefits: ["₹10,000 to ₹30,000 a month for 12 months, extendable to 18", "Co-working space and mentoring at the host incubator"],
    howToApply: ["Apply to a NIDHI technology business incubator's EIR call"],
    rule: { fact: "stage", op: "in", value: ["idea", "prototype"], label: "At the idea or prototype stage" },
    alsoCheck: ["Education and work-experience rules for the fellow", "Commitment to work full time on the venture"],
    status: "rolling",
    statusNote: "Calls are announced by the host incubators.",
    sourceUrl: "https://nidhi.dst.gov.in/nidhieir/",
    sourceName: "NIDHI, DST",
  },
  {
    slug: "birac-sbiri",
    name: "BIRAC SBIRI: Small Business Innovation Research Initiative",
    issuer: "BIRAC, Department of Biotechnology",
    level: "national",
    category: "grant",
    summary: "BIRAC funding for biotech startups' research projects, alone or with a university or research partner.",
    benefits: ["Full grant-in-aid for projects up to ₹50 lakh; above that, ₹50 lakh plus 70% of the excess"],
    howToApply: ["Apply on BIRAC's site during one of the two calls a year"],
    rule: {
      all: [
        { fact: "sectors", op: "includesAny", value: ["biotech", "medtech", "healthtech", "agritech"], label: "Works in biotech or another life-science area" },
        { fact: "entityType", op: "in", value: ["private_limited", "llp"], label: "Registered as a company or LLP" },
      ],
    },
    alsoCheck: ["The current call document for eligible areas and partner rules"],
    status: "rolling",
    statusNote: "Calls open twice a year.",
    sourceUrl: "https://birac.nic.in/desc_new.php?id=217",
    sourceName: "BIRAC",
  },
  {
    slug: "birac-bipp",
    name: "BIRAC BIPP: Biotechnology Industry Partnership Programme",
    issuer: "BIRAC, Department of Biotechnology",
    level: "national",
    category: "grant",
    summary: "Grants for biotech companies developing products of national importance, alone or in a consortium with research partners.",
    benefits: ["A one-time grant of up to ₹50 lakh for startups without earlier BIRAC grant-in-aid", "Up to 70% of the total budget for startups BIRAC has funded before"],
    howToApply: ["Apply on BIRAC's call page between 1 April and 15 May or 1 September and 15 October"],
    rule: {
      all: [
        { fact: "sectors", op: "includesAny", value: ["biotech", "medtech", "healthtech", "agritech"], label: "Works in biotech or another life-science area" },
        { fact: "entityType", op: "in", value: ["private_limited", "llp"], label: "Registered as a company or LLP" },
      ],
    },
    alsoCheck: ["The call document for priority areas and consortium rules"],
    status: "rolling",
    statusNote: "Calls open twice a year.",
    sourceUrl: "https://birac.nic.in/cfp.php",
    sourceName: "BIRAC",
  },
  {
    slug: "cgtmse",
    name: "CGTMSE collateral-free loans for micro and small enterprises",
    issuer: "Credit Guarantee Fund Trust for Micro and Small Enterprises, Ministry of MSME",
    level: "national",
    category: "loan",
    summary: "A government guarantee that lets registered lenders give micro and small enterprises, including startups, loans without collateral.",
    benefits: ["Collateral-free loans with a guarantee of up to 75% from the trust", "Guarantee cover of up to ₹10 crore per borrower, with better cover for women entrepreneurs"],
    howToApply: ["Apply for a loan at a CGTMSE-registered bank, NBFC or financial institution"],
    rule: {
      all: [
        {
          fact: "entityType",
          op: "in",
          value: ["private_limited", "llp", "partnership", "cooperative", "sole_proprietorship"],
          label: "A registered business",
        },
        { fact: "turnoverInrCr", op: "lte", value: 100, label: "Turnover within the small-enterprise limit (₹100 crore)" },
      ],
    },
    alsoCheck: ["Investment in plant, machinery or equipment within the small-enterprise limit (₹25 crore)", "Udyam registration and the lender's own credit checks"],
    status: "rolling",
    sourceUrl: "https://www.cgtmse.in/",
    sourceName: "CGTMSE",
  },
  {
    slug: "pm-mudra-yojana",
    name: "Pradhan Mantri Mudra Yojana (PMMY)",
    issuer: "Department of Financial Services, Ministry of Finance",
    level: "national",
    category: "loan",
    summary: "Small business loans of up to ₹20 lakh from banks, NBFCs and microfinance lenders, in four tiers from Shishu to Tarun Plus.",
    benefits: ["Shishu up to ₹50,000; Kishor ₹50,000 to ₹5 lakh; Tarun ₹5 to ₹10 lakh; Tarun Plus ₹10 to ₹20 lakh"],
    howToApply: ["Apply at a bank branch, NBFC or microfinance lender, or on the Jan Samarth or Udyamimitra portal"],
    rule: {
      fact: "entityType",
      op: "in",
      value: ["sole_proprietorship", "partnership", "private_limited", "llp", "cooperative", "not_registered"],
      label: "An individual or any form of business",
    },
    alsoCheck: ["The activity is income-generating, in manufacturing, trading or services", "Tarun Plus is for borrowers who repaid an earlier Tarun loan"],
    status: "rolling",
    sourceUrl: "https://www.mudra.org.in/",
    sourceName: "MUDRA",
  },
  {
    slug: "ifsca-fintech-incentive",
    name: "IFSCA Fintech Incentive Scheme",
    issuer: "International Financial Services Centres Authority (GIFT City)",
    level: "national",
    category: "grant",
    summary: "Grants for fintech startups building products for India's international financial services centre, from proof of concept to sandbox testing.",
    benefits: ["Startup grant up to ₹15 lakh, proof-of-concept grant up to ₹50 lakh and sandbox grant up to ₹30 lakh", "Green fintech grant up to ₹75 lakh and accelerator grant up to ₹10 lakh"],
    howToApply: ["Follow the application steps on IFSCA's how-to-apply page"],
    rule: {
      all: [
        { fact: "sectors", op: "includesAny", value: ["fintech"], label: "Works in fintech" },
        { fact: "stage", op: "in", value: ["idea", "prototype", "early_revenue"], label: "Building or testing a first product" },
      ],
    },
    alsoCheck: ["Which grant track fits, and the link to an IFSC unit or GIFT City the scheme requires"],
    status: "rolling",
    sourceUrl: "https://ifsca.gov.in/Pages/Contents/HowToApply",
    sourceName: "IFSCA",
  },
];
