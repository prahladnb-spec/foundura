/** Starter policy news, taken from the Startup Policy Newsroom sheet (checked 22 Nov 2026). */
export interface PolicySeed {
  date: string;
  headline: string;
  country: string;
  level: string;
  instrument: string;
  stage: string;
  impact: "High" | "Medium" | "Low";
  amount?: string;
  takeaway: string;
  sourceUrl: string;
  sourceName: string;
}

export const POLICY: PolicySeed[] = [
  { date: "2026-10-27", headline: "DPIIT: 2.5 lakh recognised startups; 47,957 compliance requirements changed", country: "India", level: "National", instrument: "Data / report", stage: "Live", impact: "Medium", takeaway: "Proof of scale for pitches; more approvals now run through the National Single Window System.", sourceUrl: "https://www.policyedge.in/p/dpiit-reports-25-lakh-recognised-startups-as-business-approvals-move-online", sourceName: "The Policy Edge" },
  { date: "2026-10-18", headline: "Delhi Cabinet sets up Go-Delhi Foundation for startups and MSMEs", country: "India — Delhi", level: "State", instrument: "Programme", stage: "Approved", impact: "Medium", amount: "₹50 crore initial outlay", takeaway: "New support vehicle for Delhi founders and young innovators; watch for application rules.", sourceUrl: "https://www.goodreturns.in/news/delhi-startup-boost-go-delhi-foundation-gets-rs-50-crore-outlay-check-benefits-for-startups-and-m-1542461.html", sourceName: "Goodreturns" },
  { date: "2026-08-29", headline: "UP launches Startup Mission portal; ₹3.42 crore incentives to 107 startups", country: "India — Uttar Pradesh", level: "State", instrument: "Programme", stage: "Open for applications", impact: "Medium", amount: "₹3.42 crore disbursed", takeaway: "UP startups can now apply for state incentives through one portal.", sourceUrl: "https://india.entrepreneur.com/business-news/up-startup-mission-portal-and-startup-policy-2026-launched", sourceName: "Entrepreneur India" },
  { date: "2026-07-16", headline: "Delhi approves Start-up and Incubation Policy", country: "India — Delhi", level: "State", instrument: "Strategy / policy", stage: "Approved", impact: "High", amount: "₹400 crore over 5 years", takeaway: "Incubation centres in state universities, colleges and ITIs; milestone-based support; annual Delhi Start-up Youth Festival.", sourceUrl: "https://newsonair.gov.in/delhi-govt-approves-rs-400-crore-start-up-and-incubation-policy-to-promote-innovation-self-employment/", sourceName: "News on AIR" },
  { date: "2026-07-06", headline: "Uttar Pradesh Startup Policy 2026 approved, with a new state startup fund", country: "India — Uttar Pradesh", level: "State", instrument: "Strategy / policy", stage: "Approved", impact: "High", amount: "₹1,000 crore fund (reported)", takeaway: "Seed funding and prototype grants doubled; deep-tech support and Centres of Excellence; valid 5 years.", sourceUrl: "https://invest.up.gov.in/policies/uttar-pradesh-startup-policy-2026", sourceName: "Invest UP" },
  { date: "2026-05-31", headline: "Startup India Seed Fund Scheme portal window closed", country: "India", level: "National", instrument: "Grant", stage: "Closed", impact: "High", takeaway: "No new SISFS applications on the portal for now; watch for a reopening or successor scheme.", sourceUrl: "https://www.gktoday.in/indian-innovation-and-startup-schemes/", sourceName: "GKToday" },
  { date: "2026-04-16", headline: "UK launches Sovereign AI, a state-backed fund for UK AI startups", country: "United Kingdom", level: "National", instrument: "Fund", stage: "Live", impact: "Medium", amount: "£500m", takeaway: "Equity plus compute access and fast-track visas; relevant to Indian AI founders considering a UK base.", sourceUrl: "https://www.telecomtv.com/content/digital-platforms-services/uk-government-unveils-500m-sovereign-ai-fund-55313/amp/", sourceName: "TelecomTV" },
  { date: "2026-04-13", headline: "Startup India Fund of Funds 2.0 notified; SIDBI to run it", country: "India", level: "National", instrument: "Fund", stage: "Live", impact: "High", amount: "₹10,000 crore", takeaway: "More money into SEBI Cat I/II AIFs, focused on deep tech, early growth and tech manufacturing.", sourceUrl: "https://analyticsindiamag.com/ai-news/dpiit-notifies-10000-cr-fund-of-funds-20-with-renewed-focus-on-deeptech-manufacturing/", sourceName: "Analytics India Magazine" },
  { date: "2026-03-18", headline: "EU proposes “EU Inc.”, an optional EU-wide company form (28th regime)", country: "European Union", level: "Regional bloc", instrument: "Regulation", stage: "Proposed", impact: "Medium", takeaway: "One digital company form across 27 states with EU-wide employee stock options; Commission wants agreement by end-2026.", sourceUrl: "https://commission.europa.eu/news-and-media/news/eu-inc-making-business-easier-european-union-2026-03-18_en", sourceName: "European Commission" },
  { date: "2026-02-04", headline: "India replaces 2019 startup definition; new Deep Tech category", country: "India", level: "National", instrument: "Regulation", stage: "Live", impact: "High", takeaway: "Turnover cap ₹200 crore; Deep Tech startups recognised up to 20 years and ₹300 crore; cooperatives now eligible.", sourceUrl: "https://www.lkslaw.com/insights/articles/india-s-new-startup-and-deep-tech-startup-framework-why-the-2026-dpiit-notification-matters", sourceName: "Lakshmikumaran & Sridharan" },
];
