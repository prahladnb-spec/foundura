import type { Sector } from "@foundura/shared";
import type { StateTile } from "../funding/directory";

/**
 * Funding rounds at /rounds: rounds raised by Indian startups, as publicly reported. Companies and
 * investing organisations only, never individual angels. Each entry records what was reported and
 * links to the report; amounts are as reported, in the currency reported.
 *
 * Gathered from public reports on GATHERED_ON and not yet checked by an editor: set CHECKED_ON only
 * after someone has opened every source and, where possible, the company's or investor's own
 * announcement. Corrections come by email ("Report a change"), so the site stores nothing.
 * Entry text is English; other languages show it marked lang="en".
 */
export const GATHERED_ON = "2026-11-27";
export const CHECKED_ON: string | null = null;

export const ROUND_TYPES = ["pre-seed", "seed", "pre-series-a", "series-a", "series-b", "series-c-plus", "debt", "corporate", "undisclosed"] as const;
export type RoundType = (typeof ROUND_TYPES)[number];

export type Round = {
  company: string;
  /** Where the company is based, as reported, and its state tile code when in India. */
  city?: string;
  state?: StateTile;
  sector: Sector;
  /** What the company does, in a few words. */
  what: string;
  round: RoundType;
  /** As reported, e.g. "$14 million" or "₹405 crore". */
  amount: string;
  /** Investing organisations named in the report, leads first. */
  investors: string[];
  /** When the round was reported (YYYY-MM-DD). */
  date: string;
  source: { name: string; url: string };
};

export const ROUNDS: Round[] = [
  { company: "Green Aero", city: "Bengaluru", state: "KA", sector: "defence", what: "Jet engines, military drones and autonomous aircraft", round: "series-a", amount: "$14 million", investors: ["Crane Venture Partners", "3one4 Capital", "Antler Elevate", "pi Ventures"], date: "2026-11-26", source: { name: "Indian Startup Times", url: "https://www.indianstartuptimes.com/news/green-aero-raises-14-million-in-series-a-funding-to-advance-indigenous-jet-engine-technology/" } },
  { company: "Finnable", sector: "fintech", what: "Multi-product lending", round: "series-c-plus", amount: "₹405 crore", investors: ["Bharat Value Fund (Pantomath Group)", "Pratithi Investments", "NKSquared"], date: "2026-11-26", source: { name: "YourStory", url: "https://yourstory.com/2026/11/startup-news-and-updates-daily-roundup-november-26-2026" } },
  { company: "Style Union", sector: "consumer", what: "Value fashion retail", round: "undisclosed", amount: "₹485 crore", investors: ["Venturi Partners", "Elev8 Venture Partners"], date: "2026-11-21", source: { name: "YourStory", url: "https://yourstory.com/2026/11/weekly-funding-roundup-nov-14-20-vc-funding-bounces-back-after-record-low-last-week" } },
  { company: "Recove Ventures", sector: "cleantech", what: "Circular economy", round: "undisclosed", amount: "₹56.25 crore", investors: ["Samara Capital", "Capri Global"], date: "2026-11-21", source: { name: "YourStory", url: "https://yourstory.com/2026/11/weekly-funding-roundup-nov-14-20-vc-funding-bounces-back-after-record-low-last-week" } },
  { company: "Olyv", sector: "fintech", what: "Consumer lending", round: "undisclosed", amount: "$6 million", investors: ["Nippon Life India AIF"], date: "2026-11-21", source: { name: "YourStory", url: "https://yourstory.com/2026/11/weekly-funding-roundup-nov-14-20-vc-funding-bounces-back-after-record-low-last-week" } },
  { company: "Humyn Labs", city: "Bengaluru", state: "KA", sector: "ai_software", what: "Training data for robots and physical AI", round: "series-a", amount: "$47 million ($26 million equity, $21 million venture debt)", investors: ["Accel", "Lighthouse Canton"], date: "2026-11-20", source: { name: "StartupFeed", url: "https://startupfeed.in/indian-startup-funding-16-20-november-2026/" } },
  { company: "Henfruit", sector: "consumer", what: "Branded eggs", round: "series-a", amount: "$15 million", investors: ["Lok Capital", "DSG Consumer Partners", "RPSG Capital Ventures"], date: "2026-11-20", source: { name: "VIE Stories", url: "https://viestories.com/funding-alert/indian-startup-funding-roundup-this-week-nov-16-nov-20-12828352" } },
  { company: "Desible.ai", sector: "ai_software", what: "AI software", round: "undisclosed", amount: "₹32 crore", investors: ["Prime Venture Partners", "Invention Engine"], date: "2026-11-19", source: { name: "Sahyadri Startups", url: "https://sahyadristartups.com/spotlight/indian-startup-funding-weekly-tracker-november-13/" } },
  { company: "JohnAIC", sector: "ai_software", what: "AI computing", round: "pre-seed", amount: "$1.9 million", investors: ["Crane Venture Partners", "Neon Fund"], date: "2026-11-19", source: { name: "Sahyadri Startups", url: "https://sahyadristartups.com/spotlight/indian-startup-funding-weekly-tracker-november-13/" } },
  { company: "Bharat Semi", city: "Delhi", state: "DL", sector: "manufacturing", what: "Semiconductor chips", round: "seed", amount: "$24 million", investors: ["Info Edge", "South Park Commons", "Indus Bridge Ventures"], date: "2026-11-16", source: { name: "StartupTalky", url: "https://startuptalky.com/news/daily-indian-funding-roundup-key-news-16-november-2026/" } },
  { company: "Kutlerri.ai", sector: "ai_software", what: "Restaurant technology", round: "undisclosed", amount: "$4 million", investors: ["Narahari Investments"], date: "2026-11-16", source: { name: "StartupTalky", url: "https://startuptalky.com/news/daily-indian-funding-roundup-key-news-16-november-2026/" } },
  { company: "altM", sector: "manufacturing", what: "Specialty chemicals", round: "series-a", amount: "$10.3 million", investors: ["Rainmatter", "Mela Ventures", "Omnivore", "Theia Ventures"], date: "2026-11-05", source: { name: "StartupTalky", url: "https://startuptalky.com/news/daily-indian-funding-roundup-key-news-5-november-2026/" } },
];

/** Newest first. */
export const roundsByDate = () => [...ROUNDS].sort((a, b) => b.date.localeCompare(a.date) || a.company.localeCompare(b.company));
export const roundId = (r: Round) => `${r.date}-${r.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
