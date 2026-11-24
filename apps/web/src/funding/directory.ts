/**
 * The funding directory at /funding: venture funds, angel networks, venture debt, government funds,
 * grants, state schemes and accelerators, grouped by where they invest.
 *
 * Entries are organisations and public programmes only, never individual investors. They were
 * gathered from public sources on GATHERED_ON and have not yet been checked by an editor: set
 * CHECKED_ON only after someone has opened every link and confirmed the figures on the official
 * pages. Until then the page says the list is unchecked. Entry text is English; other languages
 * show it marked lang="en".
 */

/** Where an entry invests: an Indian state or UT (site state codes), India-wide, or a region abroad. */
export type FundingGeo =
  | "IN"
  | "US"
  | "EU"
  | "GB"
  | "SG"
  | "IL"
  | "DE"
  | "GL"
  | StateTile;
export type FundingKind = "vc" | "angel" | "debt" | "fund" | "grant" | "state" | "accelerator";
/** open: open now; rolling: apply any time; periodic: calls at set times; announced: not running yet. */
export type FundingStatus = "open" | "rolling" | "periodic" | "announced" | "closed";

export type FundingEntry = {
  name: string;
  kind: FundingKind;
  geo: FundingGeo;
  /** Who runs it, or where it is based. */
  base: string;
  stage: string;
  focus: string;
  /** What it offers, with the facts that matter, in a sentence or two. */
  offer: string;
  status: FundingStatus;
  /** Official site, when known. Entries without one show no link until an editor adds it. */
  url?: string;
  /** Slug of the matching scheme on Foundura, if there is one. */
  scheme?: string;
};

export const GATHERED_ON = "2026-11-24";
/** Date an editor checked every entry against its official source; null until then. */
export const CHECKED_ON: string | null = null;

export const REGIONS = ["IN", "US", "EU", "GB", "SG", "IL", "DE", "GL"] as const;
export type Region = (typeof REGIONS)[number];

/** India as a tile map: [column, row] per state or UT, using the site's state codes. */
export const TILES = {
  JK: [3, 0], LA: [4, 0],
  CH: [1, 1], PB: [2, 1], HP: [3, 1], UT: [4, 1], AR: [9, 1],
  RJ: [1, 2], HR: [2, 2], DL: [3, 2], UP: [4, 2], BR: [5, 2], SK: [6, 2], AS: [8, 2], NL: [9, 2],
  GJ: [1, 3], MP: [2, 3], CT: [3, 3], JH: [4, 3], WB: [5, 3], ML: [7, 3], MN: [9, 3],
  DH: [0, 4], MH: [2, 4], TG: [3, 4], OR: [4, 4], TR: [7, 4], MZ: [8, 4],
  GA: [1, 5], KA: [2, 5], AP: [3, 5], AN: [6, 5],
  LD: [0, 6], KL: [2, 6], TN: [3, 6], PY: [4, 6],
} as const satisfies Record<string, readonly [number, number]>;
export type StateTile = keyof typeof TILES;

export const isState = (g: string): g is StateTile => g in TILES;

export const FUNDING: FundingEntry[] = [
  // ---- India-wide: government funds, grants and programmes ----
  { name: "Startup India Fund of Funds 2.0", kind: "fund", geo: "IN", base: "SIDBI, Mumbai", stage: "All stages", focus: "Deep tech, early stage, tech manufacturing", offer: "₹10,000 crore, notified in April 2026. It invests through SEBI-registered funds (AIFs), not directly: pitch the funds it backs.", status: "open", url: "https://www.startupindia.gov.in", scheme: "startup-india-fund-of-funds-2" },
  { name: "Fund of Funds for Startups (first fund)", kind: "fund", geo: "IN", base: "SIDBI, Mumbai", stage: "All stages", focus: "Any sector", offer: "The full ₹10,000 crore is committed to 145 AIFs, which have invested over ₹25,500 crore in more than 1,370 startups. Approach those funds directly.", status: "rolling", url: "https://www.sidbi.in" },
  { name: "Startup India Seed Fund Scheme (SISFS)", kind: "grant", geo: "IN", base: "DPIIT, through incubators", stage: "Proof of concept to market entry", focus: "Any sector", offer: "Up to ₹20 lakh as a grant and up to ₹50 lakh as debt or convertible debentures. Startup applications closed on 31 May 2026; no new call had been announced by October 2026.", status: "closed", url: "https://seedfund.startupindia.gov.in", scheme: "startup-india-seed-fund" },
  { name: "Credit Guarantee Scheme for Startups (CGSS)", kind: "fund", geo: "IN", base: "NCGTC", stage: "Revenue stage", focus: "DPIIT-recognised startups", offer: "Guarantees collateral-free loans from banks, NBFCs and venture debt funds: 85% of a default on loans up to ₹10 crore, 75% above, with cover capped at ₹20 crore per startup.", status: "rolling", scheme: "credit-guarantee-scheme-startups" },
  { name: "Research, Development and Innovation (RDI) Scheme", kind: "fund", geo: "IN", base: "ANRF and DST, New Delhi", stage: "Technology at TRL 4 and above", focus: "Strategic and sunrise sectors", offer: "₹1 lakh crore over six years as low-interest loans or equity, through second-level fund managers: TDB, BIRAC and 19 managers approved in October 2026. The first loans went out in May 2026.", status: "open", url: "https://dst.gov.in/rdi-scheme/research-development-and-innovation-rdi-cell" },
  { name: "BIRAC Biotechnology Ignition Grant (BIG)", kind: "grant", geo: "IN", base: "BIRAC, through BIG partner incubators", stage: "Idea to proof of concept", focus: "Biotech, medtech, diagnostics, agriculture, clean energy", offer: "Up to ₹50 lakh over 18 months. The 25th call closed on 30 November 2025; none was open in late October 2026.", status: "periodic", url: "https://birac.nic.in/big.php", scheme: "birac-big" },
  { name: "NIDHI Seed Support Program", kind: "grant", geo: "IN", base: "DST, through incubators", stage: "Seed", focus: "Technology", offer: "Seed support of up to ₹1 crore per startup, given through a DST-supported incubator.", status: "rolling" },
  { name: "NIDHI-PRAYAS", kind: "grant", geo: "IN", base: "DST, through PRAYAS centres", stage: "Idea to prototype", focus: "Hardware and deep tech", offer: "Grants to build a first prototype, through DST's PRAYAS centres.", status: "periodic", scheme: "nidhi-prayas" },
  { name: "Technology Development Board (TDB)", kind: "fund", geo: "IN", base: "New Delhi", stage: "Commercialisation", focus: "Home-grown technology", offer: "Loans and equity to bring Indian technology to market; also a fund manager under the RDI Scheme.", status: "rolling", url: "https://tdb.gov.in" },
  { name: "iDEX and ADITI", kind: "grant", geo: "IN", base: "Ministry of Defence", stage: "Prototype", focus: "Defence and dual-use technology", offer: "Grants through defence innovation challenges; each call sets its own amount and problem statements.", status: "periodic", url: "https://idex.gov.in" },
  { name: "IN-SPACe Seed Fund Scheme", kind: "grant", geo: "IN", base: "IN-SPACe, Ahmedabad", stage: "Early stage", focus: "Space technology", offer: "Seed support for space-tech startups.", status: "periodic", url: "https://www.inspace.gov.in" },
  { name: "RKVY-RAFTAAR agri-startup grants", kind: "grant", geo: "IN", base: "Agri-business incubators", stage: "Idea and seed", focus: "Agriculture", offer: "Up to ₹5 lakh at the idea or pre-seed stage and up to ₹25 lakh at the seed stage.", status: "periodic" },
  { name: "MeitY SAMRIDH", kind: "accelerator", geo: "IN", base: "MeitY Startup Hub", stage: "Early stage", focus: "Software products", offer: "Acceleration with matched investment through selected accelerators; ₹93.75 crore reached 241 startups in five years.", status: "periodic" },
  { name: "Google for Startups Accelerator: India", kind: "accelerator", geo: "IN", base: "Bengaluru", stage: "Seed to Series A", focus: "AI and technology", offer: "Equity-free programme with mentoring and cloud credits.", status: "periodic" },

  // ---- India-wide: venture capital ----
  { name: "Peak XV Partners", kind: "vc", geo: "IN", base: "Bengaluru, Delhi NCR", stage: "Seed to growth", focus: "AI, consumer, fintech, SaaS", offer: "Formerly Sequoia India. The most active VC in Q1 2026 with 16 deals; runs Surge for seed-stage founders.", status: "rolling", url: "https://www.peakxv.com" },
  { name: "Accel India", kind: "vc", geo: "IN", base: "Bengaluru", stage: "Pre-seed to Series A", focus: "AI, consumer, fintech, manufacturing", offer: "$650 million Fund VIII for early-stage startups (2025). Runs Atoms for pre-seed founders.", status: "rolling", url: "https://www.accel.com" },
  { name: "Elevation Capital", kind: "vc", geo: "IN", base: "Gurugram, Bengaluru", stage: "Seed to late stage", focus: "Consumer, SaaS, fintech", offer: "Launched a $400 million later-stage fund in August 2025 while still writing early cheques.", status: "rolling", url: "https://elevationcapital.com" },
  { name: "Blume Ventures", kind: "vc", geo: "IN", base: "Mumbai", stage: "Pre-seed to Series A", focus: "Technology", offer: "Often the first institutional investor in a company.", status: "rolling", url: "https://blume.vc" },
  { name: "Nexus Venture Partners", kind: "vc", geo: "IN", base: "Mumbai, Bengaluru", stage: "Seed to Series A", focus: "AI, SaaS, infrastructure, consumer", offer: "Invests in India and the US.", status: "rolling", url: "https://nexusvp.com" },
  { name: "Z47", kind: "vc", geo: "IN", base: "Bengaluru, Mumbai", stage: "Seed to Series A", focus: "Technology", offer: "Formerly Matrix Partners India.", status: "rolling" },
  { name: "Lightspeed India", kind: "vc", geo: "IN", base: "Bengaluru, Delhi NCR", stage: "Seed to growth", focus: "Consumer, SaaS, fintech", offer: "Part of Lightspeed Venture Partners.", status: "rolling", url: "https://lsvp.com" },
  { name: "Bessemer Venture Partners India", kind: "vc", geo: "IN", base: "Bengaluru", stage: "Early stage", focus: "AI, SaaS, fintech, digital health, cybersecurity", offer: "Closed a $350 million second India fund in March 2025.", status: "rolling", url: "https://www.bvp.com/india" },
  { name: "Kalaari Capital", kind: "vc", geo: "IN", base: "Bengaluru", stage: "Seed to Series A", focus: "Technology, consumer", offer: "Early-stage investor with founder programmes, including one for women founders.", status: "rolling" },
  { name: "Chiratae Ventures", kind: "vc", geo: "IN", base: "Bengaluru", stage: "Early stage", focus: "Consumer, health, SaaS", offer: "Early-stage technology investor.", status: "rolling" },
  { name: "Stellaris Venture Partners", kind: "vc", geo: "IN", base: "Bengaluru", stage: "Seed to Series A", focus: "SaaS, AI, consumer", offer: "Early-stage specialist.", status: "rolling" },
  { name: "3one4 Capital", kind: "vc", geo: "IN", base: "Bengaluru", stage: "Pre-seed to Series A", focus: "Technology", offer: "Among the most active VCs in 2025 and early 2026.", status: "rolling" },
  { name: "A91 Partners", kind: "vc", geo: "IN", base: "Mumbai", stage: "Growth", focus: "Consumer, financial services, health, technology", offer: "Growth-stage investor.", status: "rolling" },
  { name: "Fireside Ventures", kind: "vc", geo: "IN", base: "Bengaluru", stage: "Early stage", focus: "Consumer brands", offer: "Backs direct-to-consumer brands.", status: "rolling" },
  { name: "India Quotient", kind: "vc", geo: "IN", base: "Mumbai", stage: "Seed", focus: "Consumer internet for Bharat", offer: "Seed-stage investor.", status: "rolling" },
  { name: "Prime Venture Partners", kind: "vc", geo: "IN", base: "Bengaluru", stage: "Early stage", focus: "Fintech, SaaS", offer: "Early-stage technology investor.", status: "rolling" },
  { name: "Rainmatter", kind: "vc", geo: "IN", base: "Bengaluru", stage: "Seed to Series A", focus: "Fintech, health, climate, media", offer: "Zerodha's investment arm; about 29 rounds in 2025.", status: "rolling" },
  { name: "Antler India", kind: "vc", geo: "IN", base: "Bengaluru, Delhi NCR", stage: "Pre-seed, from day zero", focus: "Any sector", offer: "57 Indian deals in 2025, up from 30 in 2024. A residency for founders, even before they have a co-founder.", status: "periodic" },
  { name: "Titan Capital", kind: "vc", geo: "IN", base: "Delhi NCR", stage: "Seed", focus: "Technology, consumer", offer: "Seed fund of the Snapdeal founders.", status: "rolling" },
  { name: "100X.VC", kind: "vc", geo: "IN", base: "Mumbai", stage: "Pre-seed", focus: "Any sector", offer: "Invests through iSAFE notes, in cohorts.", status: "periodic" },
  { name: "Info Edge Ventures", kind: "vc", geo: "IN", base: "Noida", stage: "Early stage", focus: "Consumer internet, SaaS, AI", offer: "Venture arm of Info Edge.", status: "rolling" },
  { name: "Speciale Invest", kind: "vc", geo: "IN", base: "Chennai", stage: "Seed", focus: "Deep tech", offer: "Seed investor in science and engineering companies.", status: "rolling" },
  { name: "Endiya Partners", kind: "vc", geo: "IN", base: "Hyderabad", stage: "Seed to Series A", focus: "Life sciences, medtech, deep tech", offer: "Early-stage investor with a health and science focus.", status: "rolling" },
  { name: "HealthQuad", kind: "vc", geo: "IN", base: "Mumbai", stage: "Early to growth", focus: "Healthcare", offer: "Healthcare-focused fund.", status: "rolling" },
  { name: "W Health Ventures", kind: "vc", geo: "IN", base: "Mumbai", stage: "Early stage", focus: "Healthcare", offer: "Builds and backs healthcare companies.", status: "rolling" },
  { name: "Ankur Capital", kind: "vc", geo: "IN", base: "Mumbai", stage: "Seed to Series A", focus: "Deep science, agriculture, climate", offer: "Seed investor in science-led companies.", status: "rolling" },
  { name: "Omnivore", kind: "vc", geo: "IN", base: "Mumbai", stage: "Seed to Series A", focus: "Agriculture and food systems, climate", offer: "Agrifood technology fund.", status: "rolling" },
  { name: "Avaana Capital", kind: "vc", geo: "IN", base: "Mumbai", stage: "Early stage", focus: "Climate", offer: "Climate-focused fund.", status: "rolling" },

  // ---- India-wide: venture debt ----
  { name: "Stride Ventures", kind: "debt", geo: "IN", base: "Delhi NCR", stage: "Early to growth", focus: "Any sector", offer: "India's most active startup investor by deal count since 2025: 121 startups that year.", status: "rolling" },
  { name: "Alteria Capital", kind: "debt", geo: "IN", base: "Mumbai", stage: "Early to growth", focus: "Any sector", offer: "76 deals in 2025 and 48 in the first half of 2026.", status: "rolling" },
  { name: "BlackSoil", kind: "debt", geo: "IN", base: "Mumbai", stage: "Growth", focus: "Any sector", offer: "36 investments in Q1 2026.", status: "rolling" },
  { name: "InnoVen Capital", kind: "debt", geo: "IN", base: "Bengaluru", stage: "Early to growth", focus: "Any sector", offer: "Venture debt for VC-backed startups.", status: "rolling" },
  { name: "Trifecta Capital", kind: "debt", geo: "IN", base: "Mumbai", stage: "Growth", focus: "Any sector", offer: "Venture debt and growth equity.", status: "rolling" },

  // ---- India-wide: angel networks ----
  { name: "IAN Group (Indian Angel Network)", kind: "angel", geo: "IN", base: "Delhi NCR", stage: "Seed and early stage", focus: "More than 20 sectors", offer: "One of India's best-known angel groups, now with its own funds beside the network.", status: "rolling", url: "https://iangroup.vc" },
  { name: "Inflection Point Ventures", kind: "angel", geo: "IN", base: "Gurugram", stage: "Seed to early stage", focus: "Consumer, fintech, deep tech", offer: "The busiest firm by deal count in 2025; launched a $110 million fund in GIFT City.", status: "rolling" },
  { name: "LetsVenture", kind: "angel", geo: "IN", base: "Bengaluru", stage: "Seed", focus: "Any sector", offer: "Online platform for angel rounds and syndicates.", status: "rolling" },
  { name: "Venture Catalysts", kind: "angel", geo: "IN", base: "Mumbai", stage: "Seed", focus: "Any sector", offer: "Incubator and angel network in one.", status: "rolling" },
  { name: "WeFounderCircle", kind: "angel", geo: "IN", base: "Pan-India", stage: "Seed", focus: "Any sector", offer: "41 deals in the first half of 2025.", status: "rolling" },
  { name: "ah! Ventures", kind: "angel", geo: "IN", base: "Mumbai", stage: "Seed", focus: "Any sector", offer: "Angel network and fund.", status: "rolling" },

  // ---- States and union territories ----
  { name: "Andhra Pradesh Innovation and Startup Policy 4.0", kind: "state", geo: "AP", base: "Andhra Pradesh Innovation Society", stage: "All stages", focus: "Any sector", offer: "Startup incentives for 2024–29, run by the Andhra Pradesh Innovation Society.", status: "rolling", url: "https://apis.ap.gov.in" },
  { name: "Arunachal Pradesh Startup Policy", kind: "state", geo: "AR", base: "Itanagar", stage: "Idea to scale-up", focus: "Any sector", offer: "Idea support of ₹4–5 lakh, proof of concept up to ₹10 lakh and a scale-up grant up to ₹25 lakh.", status: "rolling" },
  { name: "Assam Startup and Innovation Policy 2025", kind: "state", geo: "AS", base: "Guwahati", stage: "Idea to growth", focus: "Any sector; more for deep tech", offer: "Ideation grant up to ₹10 lakh, prototype grant up to ₹20 lakh (₹40 lakh for deep tech), seed equity up to ₹50 lakh and venture capital up to ₹10 crore.", status: "rolling", url: "https://startup.assam.gov.in" },
  { name: "Bihar Startup Policy 2022", kind: "state", geo: "BR", base: "Bihar Start-up Fund Trust, Patna", stage: "Seed", focus: "Any sector", offer: "Seed money up to ₹10 lakh as a 10-year interest-free loan, a matching loan against angel or AIF money, and up to ₹3 lakh for an accelerator.", status: "rolling" },
  { name: "Chandigarh Startup Policy 2025", kind: "state", geo: "CH", base: "Chandigarh", stage: "Idea to early growth", focus: "Any sector", offer: "Idea grants of ₹1–2 lakh, a seed grant up to ₹7 lakh and an early-growth grant up to ₹12 lakh, with ₹2 lakh more for women-led startups.", status: "rolling" },
  { name: "Chhattisgarh Innovation and Startup Promotion Policy 2025–30", kind: "state", geo: "CT", base: "Raipur", stage: "Early to growth", focus: "Any sector", offer: "Issued in February 2026: a ₹100 crore Startup Capital Fund investing through SEBI-registered AIFs, and a ₹50 crore credit risk fund for bank loans.", status: "rolling" },
  { name: "Delhi Start-up and Incubation Policy 2026", kind: "state", geo: "DL", base: "Government of NCT of Delhi", stage: "Idea to early stage", focus: "Any sector; students", offer: "Approved in July 2026 with over ₹400 crore over five years: incubation in state universities, colleges and ITIs, and milestone-based support. A ₹50 crore Go-Delhi Foundation for labs and government pilots followed in October 2026.", status: "announced", scheme: "delhi-startup-incubation-policy-2026" },
  { name: "Goa Startup Policy 2025", kind: "state", geo: "GA", base: "Panaji", stage: "Seed", focus: "Any sector", offer: "Seed capital grant up to ₹10 lakh for startups with a working product.", status: "rolling" },
  { name: "Gujarat startup assistance", kind: "state", geo: "GJ", base: "Startup Gujarat", stage: "Early stage", focus: "Any sector; SSIP 2.0 for students", offer: "Seed support up to ₹30 lakh and ₹20,000 a month for a year (₹25,000 with a woman co-founder). A June 2026 draft industrial policy would raise these.", status: "rolling", url: "https://startup.gujarat.gov.in" },
  { name: "Haryana State Startup Policy 2022", kind: "state", geo: "HR", base: "Startup Haryana", stage: "Idea to seed", focus: "Any sector; more places in less-developed blocks", offer: "Seed grant up to ₹10 lakh, lease rental help up to ₹5 lakh and 50% of net state GST back for seven years.", status: "rolling" },
  { name: "Himachal Pradesh Chief Minister's Startup Scheme", kind: "state", geo: "HP", base: "Shimla", stage: "Idea to launch", focus: "Innovation projects", offer: "A monthly allowance for a year for approved innovation projects, plus help with marketing and a product launch.", status: "rolling" },
  { name: "Jammu and Kashmir Start-up Policy 2024–27", kind: "state", geo: "JK", base: "JKEDI", stage: "Early stage", focus: "Any sector", offer: "Seed Capital Fund and Youth Startup Loan schemes through StartupJK. The government told the assembly in February 2026 that no seed capital was given in 2023–24 or 2024–25.", status: "rolling" },
  { name: "Jharkhand Startup Policy 2023", kind: "state", geo: "JH", base: "Ranchi", stage: "Idea to seed", focus: "Any sector", offer: "₹15,000 a month per founder (up to three) for 12 months, up to ₹10 lakh for a prototype and a one-time scale-up grant up to ₹10 lakh.", status: "rolling" },
  { name: "ELEVATE (Idea2PoC)", kind: "state", geo: "KA", base: "KITS, Bengaluru", stage: "Idea to scale", focus: "Any sector; Unnati and Minorities tracks", offer: "One-time grant of up to ₹50 lakh. The 2026 call opened on 25 May 2026; ₹287.85 crore has gone to 1,230 startups since 2017.", status: "periodic", url: "https://www.missionstartupkarnataka.org/elevate-karnataka?en" },
  { name: "ELEVATE NxT", kind: "state", geo: "KA", base: "KITS, Bengaluru", stage: "Deep tech", focus: "Deep tech, open to startups from any state", offer: "Milestone-based grant of up to ₹1 crore from a ₹150 crore corpus. The 2026–27 call ran from 13 October to 13 November 2026.", status: "closed", url: "https://www.missionstartupkarnataka.org/elevate-karnataka?en" },
  { name: "Karnataka Government First", kind: "state", geo: "KA", base: "KITS, Bengaluru", stage: "Pilot", focus: "Solutions to government problems", offer: "Up to ₹25 lakh for live pilots with state departments, leading to procurement; about 100 startups over three years.", status: "periodic" },
  { name: "Karnataka Startup Policy 2025–30", kind: "state", geo: "KA", base: "Bengaluru", stage: "All stages", focus: "Any sector; a push beyond Bengaluru", offer: "50% of net state GST back for seven years, 75% of patent costs up to ₹15 lakh a year, and help with international events.", status: "rolling", scheme: "karnataka-startup-policy-2025-30" },
  { name: "Kerala Startup Mission grants", kind: "state", geo: "KL", base: "KSUM, Thiruvananthapuram", stage: "Idea to scale-up", focus: "Technology products", offer: "Idea grant up to ₹3 lakh, productisation up to ₹7 lakh (₹12 lakh where women hold most shares) and scale-up up to ₹15 lakh; seed loans too.", status: "periodic", url: "https://grants.startupmission.in" },
  { name: "Ladakh Startup Policy 2026", kind: "state", geo: "LA", base: "Leh", stage: "Idea to growth", focus: "Any sector", offer: "Expected in November 2026 with ₹100 crore: a founder allowance up to ₹2.5 lakh for women (₹2 lakh for men), seed funding up to ₹5 lakh, a prototype fund up to ₹10 lakh and growth grants up to ₹20 lakh.", status: "announced" },
  { name: "Maharashtra Startup, Entrepreneurship and Innovation Policy 2025", kind: "state", geo: "MH", base: "MSInS, Mumbai", stage: "Idea to seed", focus: "Any sector", offer: "Patent costs back up to ₹5 lakh (₹20 lakh international), quality certification up to ₹5 lakh, seed grants through incubators, and government pilots through Maharashtra Startup Week.", status: "rolling" },
  { name: "PRIME Meghalaya", kind: "state", geo: "ML", base: "Shillong and Tura", stage: "Idea to scale-up", focus: "Agriculture, tourism, forestry, food processing", offer: "Kick-start grant up to ₹10 lakh, InnoVenture grant up to ₹35 lakh, small support grant up to ₹3 lakh and an interest-free scale-up loan up to ₹75 lakh.", status: "rolling" },
  { name: "Manipur Start Up Scheme 2.0", kind: "state", geo: "MN", base: "Imphal", stage: "Idea to revenue", focus: "Any sector", offer: "Seed grant up to ₹3 lakh through an incubator, then bank finance up to ₹100 lakh with a 30% grant.", status: "rolling" },
  { name: "Madhya Pradesh Startup Policy 2025", kind: "state", geo: "MP", base: "Bhopal", stage: "Seed", focus: "Any sector", offer: "Seed grant up to ₹30 lakh through incubators, 15% of money raised up to ₹15 lakh, and ₹10,000 a month for 12 months.", status: "rolling" },
  { name: "Mizoram Entrepreneurship Development Scheme", kind: "state", geo: "MZ", base: "Mizoram Startup Mission", stage: "Early stage", focus: "Any sector", offer: "Seed funding, incubation and training for early-stage startups.", status: "rolling" },
  { name: "Startup Nagaland", kind: "state", geo: "NL", base: "Department of Industries and Commerce", stage: "Early stage", focus: "Any sector", offer: "State startup policy with incubation and support for young founders.", status: "rolling" },
  { name: "Startup Odisha", kind: "state", geo: "OR", base: "Bhubaneswar", stage: "Idea to prototype", focus: "Any sector", offer: "₹20,000 a month for a year (₹22,000 for women, SC, ST and other listed founders) and up to ₹15 lakh for product development and marketing.", status: "rolling" },
  { name: "Punjab startup incentives (IBDP 2026)", kind: "state", geo: "PB", base: "Startup Punjab", stage: "Pre-seed and seed", focus: "Any sector", offer: "Seed grant of ₹5 lakh, up to ₹10 lakh more for 20 startups a year, 25% of lease rent up to ₹5 lakh a year and interest help up to ₹7 lakh a year.", status: "rolling" },
  { name: "Puducherry Innovation and Startup Policy", kind: "state", geo: "PY", base: "Puducherry", stage: "Early stage", focus: "Any sector", offer: "The 2019 policy is still in force, with support for incubation and early-stage startups.", status: "rolling" },
  { name: "iStart Rajasthan", kind: "state", geo: "RJ", base: "Jaipur", stage: "Idea to scale", focus: "Any sector", offer: "Ideation grant of ₹2.4 lakh (₹60,000 more for women-led), viability grant of ₹10–60 lakh by QRate score and up to ₹2 crore to scale.", status: "rolling" },
  { name: "Sikkim Startup Policy 2024", kind: "state", geo: "SK", base: "Gangtok", stage: "Early stage", focus: "Any sector", offer: "State policy run by the Department of Commerce and Industries to support local founders.", status: "rolling" },
  { name: "Telangana Startup Fund", kind: "fund", geo: "TG", base: "Hyderabad", stage: "Early to growth", focus: "Technology, AI", offer: "₹1,000 crore fund of funds announced in December 2025; not launched yet.", status: "announced" },
  { name: "T-Hub, T-Fund and TSIC", kind: "accelerator", geo: "TG", base: "Hyderabad", stage: "Early stage", focus: "Any sector; rural innovation", offer: "The state's innovation hub and innovation cell. T-Fund co-invests beside angels and VCs; incentives include SGST and patent costs back.", status: "periodic" },
  { name: "TANSEED", kind: "state", geo: "TN", base: "StartupTN, Chennai", stage: "Early stage", focus: "More for green tech, rural impact and women-led", offer: "Equity-linked grant of up to ₹15 lakh (₹10 lakh in other sectors) plus a year-long accelerator. The 8th call ran in December 2025.", status: "periodic", url: "https://startuptn.in" },
  { name: "Gramam Thorum Puthozhil", kind: "state", geo: "TN", base: "StartupTN", stage: "Idea", focus: "Village founders", offer: "Equity-free seed grant of ₹1 lakh through TANSEED.", status: "periodic", url: "https://startuptn.in" },
  { name: "Uttar Pradesh Startup Policy 2026", kind: "state", geo: "UP", base: "Lucknow", stage: "Idea to seed", focus: "Any sector", offer: "₹20,000 a month for two years, a prototype grant up to ₹10 lakh, seed capital up to ₹15 lakh, and a ₹1,000 crore UP Startup Fund.", status: "rolling", url: "https://startupmission.up.gov.in/pages/startup-policy", scheme: "uttar-pradesh-startup-policy-2026" },
  { name: "Uttarakhand Startup Policy 2023", kind: "state", geo: "UT", base: "Dehradun", stage: "Idea to seed", focus: "Any sector", offer: "Up to ₹15,000 a month for 12 months (₹20,000 for women, SC, ST and some others), a seed fund up to ₹10 lakh (₹12.5 lakh for those groups) and a ₹200 crore Uttarakhand Venture Fund.", status: "rolling" },

  // ---- City angel networks ----
  { name: "Mumbai Angels", kind: "angel", geo: "MH", base: "Mumbai", stage: "Seed", focus: "Any sector", offer: "One of India's oldest angel networks.", status: "rolling" },
  { name: "The Chennai Angels", kind: "angel", geo: "TN", base: "Chennai", stage: "Seed", focus: "Any sector", offer: "Chennai-based angel network.", status: "rolling" },
  { name: "Hyderabad Angels", kind: "angel", geo: "TG", base: "Hyderabad", stage: "Seed", focus: "Any sector", offer: "Hyderabad-based angel network.", status: "rolling" },
  { name: "Calcutta Angels Network", kind: "angel", geo: "WB", base: "Kolkata", stage: "Seed", focus: "Any sector", offer: "Kolkata-based angel network.", status: "rolling" },
  { name: "Chandigarh Angels Network", kind: "angel", geo: "CH", base: "Chandigarh", stage: "Seed", focus: "Any sector", offer: "Angel network for the Chandigarh region.", status: "rolling" },

  // ---- Abroad ----
  { name: "Y Combinator", kind: "accelerator", geo: "US", base: "San Francisco", stage: "Idea to seed", focus: "Any sector, founders from anywhere", offer: "$500,000: $125,000 for 7% plus $375,000 on an uncapped SAFE. Four batches a year.", status: "periodic", url: "https://www.ycombinator.com/deal" },
  { name: "SBIR and STTR", kind: "grant", geo: "US", base: "US federal agencies", stage: "Research and development", focus: "US-owned small businesses", offer: "Reauthorised on 13 April 2026 until September 2031 after a six-month lapse; agencies are reopening calls one by one.", status: "periodic", url: "https://www.sbir.gov" },
  { name: "EIC Accelerator", kind: "grant", geo: "EU", base: "European Innovation Council", stage: "TRL 6 to scale-up", focus: "Startups and SMEs in the EU and associated countries", offer: "Grant under €2.5 million plus equity of €0.5–10 million. Short proposals any time; the 2026 full-proposal cut-offs ran to 4 November.", status: "open", url: "https://eic.ec.europa.eu" },
  { name: "Innovate UK competitions", kind: "grant", geo: "GB", base: "UKRI", stage: "Research and development", focus: "UK-registered businesses", offer: "Open Smart grants have been paused since January 2025; funding now comes through sector competitions, usually 50–70% of project costs.", status: "periodic", url: "https://apply-for-innovation-funding.service.gov.uk" },
  { name: "Startup SG Founder", kind: "grant", geo: "SG", base: "Enterprise Singapore", stage: "First-time founders", focus: "Singapore citizens and permanent residents", offer: "S$20,000–50,000 with matching capital, plus mentoring through accredited partners.", status: "rolling" },
  { name: "Startup SG Tech", kind: "grant", geo: "SG", base: "Enterprise Singapore", stage: "Proof of concept and value", focus: "Proprietary technology", offer: "Grants to prove and commercialise new technology.", status: "rolling" },
  { name: "Israel Innovation Authority Startup Fund", kind: "grant", geo: "IL", base: "Jerusalem", stage: "Pre-seed to Series A", focus: "Israeli technology companies", offer: "Grant matching 60% of a pre-seed round (up to NIS 2 million) or 50% of a seed round (up to NIS 6 million).", status: "rolling", url: "https://innovationisrael.org.il/en/programs/startup-fund" },
  { name: "Tnufa ideation programme", kind: "grant", geo: "IL", base: "Israel Innovation Authority", stage: "Idea", focus: "Early technology projects", offer: "Grant to build a first prototype and test the market.", status: "rolling", url: "https://innovationisrael.org.il/en/program/ideation-tnufa-incentive-program" },
  { name: "EXIST Business Start-up Grant", kind: "grant", geo: "DE", base: "Germany", stage: "Idea", focus: "University graduates and researchers", offer: "€1,000–3,000 a month per founder plus about €35,000 for costs, for 12 months.", status: "rolling", url: "https://www.exist.de/en" },
  { name: "Techstars", kind: "accelerator", geo: "GL", base: "Programmes worldwide", stage: "Pre-seed and seed", focus: "Any sector", offer: "$220,000: 5% in common stock plus an uncapped SAFE.", status: "periodic", url: "https://www.techstars.com/investment-terms" },
  { name: "500 Global", kind: "accelerator", geo: "GL", base: "San Francisco and 80+ countries", stage: "Seed", focus: "Any sector", offer: "$150,000 for 6%, from which a $37,500 programme fee is taken.", status: "periodic" },
  { name: "Plug and Play", kind: "accelerator", geo: "GL", base: "Silicon Valley and worldwide", stage: "Seed to growth", focus: "Corporate innovation", offer: "Takes no equity; connects startups with more than 550 corporate partners.", status: "periodic" },
];

/** Open now or apply any time. */
export const isOpenNow = (e: FundingEntry) => e.status === "open" || e.status === "rolling";

/** Anchor for an entry on /funding, used by site search. */
export const fundingId = (e: Pick<FundingEntry, "name">) =>
  "f-" + e.name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
