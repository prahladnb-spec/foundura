/** Reference lists shared by the API and the web app. */

export const ENTITY_TYPES = [
  { value: "private_limited", label: "Private Limited Company" },
  { value: "llp", label: "Limited Liability Partnership (LLP)" },
  { value: "partnership", label: "Registered Partnership Firm" },
  { value: "cooperative", label: "Cooperative / Multi-State Cooperative Society" },
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "not_registered", label: "Not registered yet" },
] as const;
export type EntityType = (typeof ENTITY_TYPES)[number]["value"];

export const STAGES = [
  { value: "idea", label: "Idea" },
  { value: "prototype", label: "Prototype / MVP" },
  { value: "early_revenue", label: "Early revenue" },
  { value: "growth", label: "Growth" },
] as const;
export type Stage = (typeof STAGES)[number]["value"];

/**
 * Documents investors usually ask for. Founders tick the ones they have ready on their dashboard;
 * each value is also the slug of the template at /documents.
 */
export const INVESTOR_DOCS = [
  "pitch-deck",
  "financial-model",
  "cap-table",
  "founders-agreement",
  "ip-assignment",
  "incorporation-checklist",
  "financial-records-checklist",
  "data-room-checklist",
] as const;
export type InvestorDoc = (typeof INVESTOR_DOCS)[number];

/** What a startup is looking for, shown on its public showcase page. Never money amounts. */
export const LOOKING_FOR = [
  { value: "pilots", label: "Pilot customers" },
  { value: "customers", label: "Customers" },
  { value: "partners", label: "Partners" },
  { value: "distributors", label: "Distributors" },
  { value: "hiring", label: "People to hire" },
  { value: "mentors", label: "Mentors" },
] as const;
export type LookingFor = (typeof LOOKING_FOR)[number]["value"];

export const SECTORS = [
  { value: "medtech", label: "MedTech / Medical devices" },
  { value: "healthtech", label: "HealthTech" },
  { value: "biotech", label: "Biotech / Life sciences" },
  { value: "agritech", label: "AgriTech / Food" },
  { value: "fintech", label: "FinTech" },
  { value: "edtech", label: "EdTech" },
  { value: "cleantech", label: "CleanTech / Climate / Energy" },
  { value: "manufacturing", label: "Manufacturing / Hardware" },
  { value: "ai_software", label: "AI / SaaS / Software" },
  { value: "spacetech", label: "SpaceTech" },
  { value: "defence", label: "Defence / Aerospace" },
  { value: "mobility", label: "Mobility / EV / Logistics" },
  { value: "consumer", label: "Consumer / D2C / Retail" },
  { value: "social_impact", label: "Social impact" },
  { value: "other", label: "Other" },
] as const;
export type Sector = (typeof SECTORS)[number]["value"];

/** Indian states and union territories (ISO 3166-2:IN subdivision codes). */
export const INDIAN_STATES = [
  { value: "AN", label: "Andaman and Nicobar Islands" },
  { value: "AP", label: "Andhra Pradesh" },
  { value: "AR", label: "Arunachal Pradesh" },
  { value: "AS", label: "Assam" },
  { value: "BR", label: "Bihar" },
  { value: "CH", label: "Chandigarh" },
  { value: "CT", label: "Chhattisgarh" },
  { value: "DH", label: "Dadra and Nagar Haveli and Daman and Diu" },
  { value: "DL", label: "Delhi" },
  { value: "GA", label: "Goa" },
  { value: "GJ", label: "Gujarat" },
  { value: "HR", label: "Haryana" },
  { value: "HP", label: "Himachal Pradesh" },
  { value: "JK", label: "Jammu and Kashmir" },
  { value: "JH", label: "Jharkhand" },
  { value: "KA", label: "Karnataka" },
  { value: "KL", label: "Kerala" },
  { value: "LA", label: "Ladakh" },
  { value: "LD", label: "Lakshadweep" },
  { value: "MP", label: "Madhya Pradesh" },
  { value: "MH", label: "Maharashtra" },
  { value: "MN", label: "Manipur" },
  { value: "ML", label: "Meghalaya" },
  { value: "MZ", label: "Mizoram" },
  { value: "NL", label: "Nagaland" },
  { value: "OR", label: "Odisha" },
  { value: "PY", label: "Puducherry" },
  { value: "PB", label: "Punjab" },
  { value: "RJ", label: "Rajasthan" },
  { value: "SK", label: "Sikkim" },
  { value: "TN", label: "Tamil Nadu" },
  { value: "TG", label: "Telangana" },
  { value: "TR", label: "Tripura" },
  { value: "UP", label: "Uttar Pradesh" },
  { value: "UT", label: "Uttarakhand" },
  { value: "WB", label: "West Bengal" },
] as const;
export type StateCode = (typeof INDIAN_STATES)[number]["value"];

export const INVESTOR_TYPES = [
  { value: "angel", label: "Angel investor" },
  { value: "angel_network", label: "Angel network or syndicate" },
  { value: "vc", label: "Venture capital fund" },
  { value: "micro_vc", label: "Micro VC / early-stage fund" },
  { value: "cvc", label: "Corporate venture arm" },
  { value: "family_office", label: "Family office" },
  { value: "accelerator", label: "Accelerator or incubator fund" },
] as const;
export type InvestorType = (typeof INVESTOR_TYPES)[number]["value"];

/** Founder must reach this readiness score before requesting intros (no-spam rule). */
export const MIN_READINESS_FOR_INTRO = 50;
/** Founder–investor match must reach this score before an intro can be requested. */
export const MIN_MATCH_FOR_INTRO = 40;
/** Open (pending) intro requests allowed per startup at one time. */
export const MAX_PENDING_INTROS = 10;

export const CONSENT_PURPOSES = [
  {
    value: "account",
    label: "Run my account",
    description: "Store my email and profile so I can sign in and use Foundura. I'm 18 or older and agree to the terms of use.",
    required: true,
  },
  {
    value: "scheme_alerts",
    label: "Scheme and deadline alerts",
    description: "A weekly email with schemes that match my startup, upcoming deadlines and the week's policy news. Unsubscribe any time.",
    required: false,
  },
  {
    value: "investor_visibility",
    label: "Show my profile to investors",
    description: "Let verified investors see my public startup profile and request an intro.",
    required: false,
  },
] as const;
export type ConsentPurpose = (typeof CONSENT_PURPOSES)[number]["value"];

/** Version of the privacy notice the consent texts above belong to. Bump when they change. */
export const PRIVACY_NOTICE_VERSION = "2026-11-22";
