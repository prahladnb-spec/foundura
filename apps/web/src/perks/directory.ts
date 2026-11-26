/**
 * Startup perks at /perks: free credits, discounts and the benefits that come with DPIIT recognition.
 *
 * Official programmes only, from the companies and government bodies that run them. Foundura has no
 * deal with any of them, earns nothing from sign-ups and doesn't track who applies. Offers change
 * often, so entries name what is offered without amounts. Gathered from public sources on GATHERED_ON;
 * set CHECKED_ON only after an editor has opened every link and confirmed each offer still runs.
 * Entry text is English; other languages show it marked lang="en".
 */

export type PerkGroup = "government" | "cloud" | "tools";

export type Perk = {
  id: string;
  name: string;
  /** Who runs it. */
  by: string;
  group: PerkGroup;
  /** What a startup gets, in a sentence. */
  offer: string;
  /** Who can apply, in a few words. */
  who: string;
  /** Official page. Only add one you know is right. */
  url?: string;
  /** Slug of the matching scheme on Foundura, if there is one. */
  scheme?: string;
};

export const GATHERED_ON = "2026-11-26";
/** Date an editor checked every entry against its official page; null until then. */
export const CHECKED_ON: string | null = null;

export const PERK_GROUPS: PerkGroup[] = ["government", "cloud", "tools"];

export const PERKS: Perk[] = [
  // ----- With DPIIT recognition -----
  {
    id: "tax-holiday",
    name: "Income tax holiday (Section 80-IAC)",
    by: "Inter-Ministerial Board, DPIIT",
    group: "government",
    offer: "No income tax on profits for 3 consecutive years out of the first 10, once the board certifies the startup.",
    who: "DPIIT-recognised private limited companies and LLPs that apply for the certificate",
    url: "https://www.startupindia.gov.in",
    scheme: "income-tax-holiday-80iac",
  },
  {
    id: "ipr-rebate",
    name: "Patent and trademark fee rebates",
    by: "Office of the Controller General of Patents, Designs and Trade Marks",
    group: "government",
    offer: "80% off patent filing fees and 50% off trademark filing fees, faster patent examination, and free help from facilitators listed by the government.",
    who: "DPIIT-recognised startups",
    url: "https://ipindia.gov.in",
    scheme: "startup-ipr-fee-benefits",
  },
  {
    id: "procurement",
    name: "Selling to government without prior turnover",
    by: "Department of Expenditure and GeM",
    group: "government",
    offer: "Relaxed prior-experience and turnover conditions and exemption from earnest money deposits in many central government tenders, plus a startup section on GeM.",
    who: "DPIIT-recognised startups that meet the quality and technical conditions",
    url: "https://gem.gov.in",
    scheme: "public-procurement-relaxations",
  },
  {
    id: "credit-guarantee",
    name: "Collateral-free loans (CGSS)",
    by: "NCGTC, Department for Promotion of Industry and Internal Trade",
    group: "government",
    offer: "A government guarantee that lets banks and other lenders give loans to startups without asking for collateral.",
    who: "DPIIT-recognised startups borrowing from member lenders",
    url: "https://www.ncgtc.in",
    scheme: "credit-guarantee-scheme-startups",
  },
  {
    id: "self-certification",
    name: "Self-certify labour and environment rules",
    by: "Department for Promotion of Industry and Internal Trade",
    group: "government",
    offer: "Recognised startups can self-certify compliance with listed labour and environmental laws online, with no labour inspections for a period after recognition unless there's a credible complaint. India's new labour codes replaced many older labour laws, so check the current list on Startup India.",
    who: "DPIIT-recognised startups",
    url: "https://www.startupindia.gov.in",
  },
  {
    id: "winding-up",
    name: "Faster closure if things don't work out",
    by: "Insolvency and Bankruptcy Board of India",
    group: "government",
    offer: "A fast-track process to wind up a startup company, so founders can close cleanly and start again.",
    who: "Startups with simple debt structures that meet the size conditions",
    url: "https://ibbi.gov.in",
  },
  {
    id: "meity-hub",
    name: "MeitY Startup Hub programmes",
    by: "Ministry of Electronics and Information Technology",
    group: "government",
    offer: "Access to government-backed incubators, accelerator calls, cloud and testing facilities for tech startups.",
    who: "Technology startups, through the hub's programmes and partner incubators",
    url: "https://meitystartuphub.in",
  },

  // ----- Cloud and AI credits -----
  {
    id: "aws-activate",
    name: "AWS Activate",
    by: "Amazon Web Services",
    group: "cloud",
    offer: "Cloud credits, technical support and training. More credits come through partner incubators, accelerators and funds.",
    who: "Self-funded and investor-backed startups; check the stage and age limits",
    url: "https://aws.amazon.com/activate/",
  },
  {
    id: "google-cloud",
    name: "Google for Startups Cloud Program",
    by: "Google",
    group: "cloud",
    offer: "Google Cloud and Firebase credits, with higher amounts for AI-first startups, plus technical training.",
    who: "Early-stage startups; some tiers need funding from an investor",
    url: "https://cloud.google.com/startup",
  },
  {
    id: "microsoft",
    name: "Microsoft for Startups",
    by: "Microsoft",
    group: "cloud",
    offer: "Azure credits that grow as the startup grows, plus discounted developer tools and AI services.",
    who: "Software startups of any stage, including self-funded ones",
    url: "https://www.microsoft.com/en-us/startups",
  },
  {
    id: "nvidia-inception",
    name: "NVIDIA Inception",
    by: "NVIDIA",
    group: "cloud",
    offer: "Free membership with GPU cloud and hardware discounts, training and introductions to investors.",
    who: "Startups building with AI, data science or graphics",
    url: "https://www.nvidia.com/en-us/startups/",
  },
  {
    id: "cloudflare",
    name: "Cloudflare for Startups",
    by: "Cloudflare",
    group: "cloud",
    offer: "Credits for Cloudflare's hosting, security and developer platform.",
    who: "Startups backed by a partner accelerator or investor",
    url: "https://www.cloudflare.com/forstartups/",
  },
  {
    id: "digitalocean",
    name: "DigitalOcean Hatch",
    by: "DigitalOcean",
    group: "cloud",
    offer: "Cloud hosting credits and support for a year.",
    who: "Startups working with a partner incubator, accelerator or fund",
    url: "https://www.digitalocean.com/hatch",
  },
  {
    id: "mongodb",
    name: "MongoDB for Startups",
    by: "MongoDB",
    group: "cloud",
    offer: "Credits for the MongoDB Atlas database and technical advice.",
    who: "Early-stage startups, often through partner programmes",
    url: "https://www.mongodb.com/startups",
  },

  // ----- Software for your team -----
  {
    id: "zoho",
    name: "Zoho for Startups",
    by: "Zoho",
    group: "tools",
    offer: "Free or discounted Zoho apps for email, accounting, CRM and more for the first year.",
    who: "Early-stage startups; partner incubators can get longer offers",
    url: "https://www.zoho.com/startups/",
  },
  {
    id: "freshworks",
    name: "Freshworks for Startups",
    by: "Freshworks",
    group: "tools",
    offer: "Free credits for Freshworks customer support, sales and IT software.",
    who: "Startups that joined through a partner incubator, accelerator or fund",
    url: "https://www.freshworks.com/startups/",
  },
  {
    id: "github",
    name: "GitHub for Startups",
    by: "GitHub",
    group: "tools",
    offer: "GitHub Enterprise seats free for the first year, then discounted.",
    who: "Startups backed by a partner investor or accelerator",
    url: "https://github.com/enterprise/startups",
  },
  {
    id: "atlassian",
    name: "Atlassian for Startups",
    by: "Atlassian",
    group: "tools",
    offer: "Free cloud plans of Jira, Confluence and other Atlassian tools for a year.",
    who: "Young startups that meet the funding and age limits",
    url: "https://www.atlassian.com/software/startups",
  },
  {
    id: "notion",
    name: "Notion for Startups",
    by: "Notion",
    group: "tools",
    offer: "Months of Notion's paid plan free, including its AI features.",
    who: "Early-stage startups, often through partner programmes",
    url: "https://www.notion.com/startups",
  },
  {
    id: "hubspot",
    name: "HubSpot for Startups",
    by: "HubSpot",
    group: "tools",
    offer: "Large discounts on HubSpot's marketing, sales and customer service software.",
    who: "Startups that joined through a partner incubator, accelerator or fund",
    url: "https://www.hubspot.com/startups",
  },
];
