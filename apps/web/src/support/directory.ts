import type { StateTile } from "../funding/directory";

/**
 * Support for founders beyond money: incubators, government startup hubs and mentoring programmes,
 * by state. Organisations and public programmes only, never individuals. Entry text is English.
 * Shown on the state pages (/states/[code]) and the India-wide list on /states.
 *
 * Gathered from memory of long-running, well-known organisations on GATHERED_ON; like the funding
 * directory, the pages say the list is unchecked until an editor has opened every link and confirmed
 * each entry, then sets CHECKED_ON. Add `url` only for an official site you know is right.
 */
export const GATHERED_ON = "2026-11-26";
export const CHECKED_ON: string | null = null;

export type SupportKind = "incubator" | "hub" | "mentoring";
export const SUPPORT_KINDS: SupportKind[] = ["incubator", "hub", "mentoring"];

export type SupportEntry = {
  name: string;
  kind: SupportKind;
  /** A state code, or "IN" for programmes open across India. */
  geo: StateTile | "IN";
  /** Host institution and city. */
  base: string;
  offer: string;
  url?: string;
};

export const SUPPORT: SupportEntry[] = [
  // ---- Across India ----
  { name: "Startup India", kind: "hub", geo: "IN", base: "DPIIT, New Delhi", offer: "The national portal: DPIIT recognition, the list of recognised incubators, scheme information and a mentorship network.", url: "https://www.startupindia.gov.in" },
  { name: "Atal Innovation Mission incubation centres", kind: "incubator", geo: "IN", base: "NITI Aayog, across India", offer: "Atal Incubation Centres and Established Incubation Centres at universities, institutes and companies in most states.", url: "https://aim.gov.in" },
  { name: "STPI Centres of Entrepreneurship", kind: "incubator", geo: "IN", base: "Software Technology Parks of India, many cities", offer: "Sector-focused incubation centres for technology startups, with space, mentoring and links to industry." },
  { name: "MeitY Startup Hub", kind: "hub", geo: "IN", base: "Ministry of Electronics and IT, New Delhi", offer: "Brings together MeitY's incubators and programmes for technology startups, including SAMRIDH and TIDE 2.0." },
  { name: "NASSCOM 10000 Startups", kind: "mentoring", geo: "IN", base: "NASSCOM, several cities", offer: "Programmes, mentoring and corporate connections for technology startups.", url: "https://10000startups.com" },
  { name: "TiE (The Indus Entrepreneurs)", kind: "mentoring", geo: "IN", base: "Chapters in many Indian cities", offer: "A non-profit network of entrepreneurs offering mentoring, events and investor connections.", url: "https://tie.org" },

  // ---- States and union territories (alphabetical by state) ----
  { name: "Ratan Tata Innovation Hub", kind: "hub", geo: "AP", base: "Government of Andhra Pradesh, Amaravati", offer: "The state's innovation hub, with spokes in other cities, under the Andhra Pradesh startup policy." },
  { name: "IIT Guwahati Technology Incubation Centre", kind: "incubator", geo: "AS", base: "IIT Guwahati", offer: "Incubation for technology startups from the North East." },
  { name: "IIT Patna Incubation Centre", kind: "incubator", geo: "BR", base: "IIT Patna", offer: "Incubation for electronics, IT and medical-electronics startups." },
  { name: "36Inc", kind: "incubator", geo: "CT", base: "Government of Chhattisgarh, Nava Raipur", offer: "The state-backed incubator for Chhattisgarh startups." },
  { name: "FITT, IIT Delhi", kind: "incubator", geo: "DL", base: "IIT Delhi", offer: "Foundation for Innovation and Technology Transfer: incubation and technology transfer for deep-tech startups." },
  { name: "Center for Incubation and Business Acceleration (CIBA)", kind: "incubator", geo: "GA", base: "Agnel Technical Education Complex, Verna", offer: "Goa's long-running technology incubator, also a DST and AIM partner." },
  { name: "CIIE.CO", kind: "incubator", geo: "GJ", base: "IIM Ahmedabad", offer: "Incubation, accelerator programmes and early-stage funds for Indian startups.", url: "https://ciie.co" },
  { name: "iCreate", kind: "incubator", geo: "GJ", base: "Ahmedabad", offer: "An independent centre backed by the Government of Gujarat for technology and deep-tech startups." },
  { name: "i-Hub Gujarat", kind: "hub", geo: "GJ", base: "Government of Gujarat, Ahmedabad", offer: "The state's student startup and innovation hub." },
  { name: "IIT Mandi Catalyst", kind: "incubator", geo: "HP", base: "IIT Mandi", offer: "Himachal Pradesh's technology business incubator." },
  { name: "JKEDI", kind: "hub", geo: "JK", base: "J&K Entrepreneurship Development Institute, Srinagar and Jammu", offer: "Training, incubation and loan programmes for entrepreneurs in Jammu and Kashmir." },
  { name: "NSRCEL", kind: "incubator", geo: "KA", base: "IIM Bangalore", offer: "Incubation and programmes for early-stage founders, including women founders and social enterprises.", url: "https://www.nsrcel.org" },
  { name: "Society for Innovation and Development (SID)", kind: "incubator", geo: "KA", base: "Indian Institute of Science, Bengaluru", offer: "Incubation for science and engineering startups." },
  { name: "Karnataka Startup Cell and K-tech Innovation Hubs", kind: "hub", geo: "KA", base: "Government of Karnataka, Bengaluru and other cities", offer: "Runs ELEVATE and the state's innovation hubs and incubators." },
  { name: "Kerala Startup Mission", kind: "hub", geo: "KL", base: "Government of Kerala, Kochi and Thiruvananthapuram", offer: "The state's startup agency: incubation, grants, events and the Integrated Startup Complex.", url: "https://startupmission.kerala.gov.in" },
  { name: "Technopark Technology Business Incubator", kind: "incubator", geo: "KL", base: "Technopark, Thiruvananthapuram", offer: "Incubation for technology startups in Kerala's largest IT park." },
  { name: "SINE, IIT Bombay", kind: "incubator", geo: "MH", base: "IIT Bombay, Mumbai", offer: "Society for Innovation and Entrepreneurship: incubation for technology startups." },
  { name: "Venture Center", kind: "incubator", geo: "MH", base: "CSIR-NCL, Pune", offer: "Incubation for science and engineering startups, with labs and equipment." },
  { name: "Maharashtra State Innovation Society", kind: "hub", geo: "MH", base: "Government of Maharashtra, Mumbai", offer: "Runs the state's startup policy, Startup Week and incubator network." },
  { name: "PRIME Meghalaya", kind: "hub", geo: "ML", base: "Government of Meghalaya, Shillong", offer: "Promotion and Incubation of Market-driven Enterprises: incubation and support across the state." },
  { name: "O-Hub", kind: "hub", geo: "OR", base: "Startup Odisha, Bhubaneswar", offer: "Odisha's startup hub, with space, programmes and the state's startup support." },
  { name: "KIIT Technology Business Incubator", kind: "incubator", geo: "OR", base: "KIIT, Bhubaneswar", offer: "Incubation for technology and biotechnology startups." },
  { name: "Punjab Biotechnology Incubator", kind: "incubator", geo: "PB", base: "Mohali", offer: "Incubation and testing facilities for agri, food and biotech startups." },
  { name: "Bhamashah Techno Hub", kind: "hub", geo: "RJ", base: "iStart Rajasthan, Jaipur", offer: "Rajasthan's startup hub, home of the iStart programme." },
  { name: "IIT Madras Incubation Cell", kind: "incubator", geo: "TN", base: "IIT Madras Research Park, Chennai", offer: "Incubation for deep-tech startups, among the largest in India." },
  { name: "StartupTN", kind: "hub", geo: "TN", base: "Government of Tamil Nadu, Chennai", offer: "Tamil Nadu's startup agency: TANSEED grants, regional hubs and programmes.", url: "https://startuptn.in" },
  { name: "T-Hub", kind: "hub", geo: "TG", base: "Hyderabad", offer: "A large innovation hub backed by the Government of Telangana, with programmes for startups and corporate innovation.", url: "https://t-hub.co" },
  { name: "WE Hub", kind: "hub", geo: "TG", base: "Government of Telangana, Hyderabad", offer: "The state-led incubator for women entrepreneurs." },
  { name: "CIE, IIIT Hyderabad", kind: "incubator", geo: "TG", base: "IIIT Hyderabad", offer: "Center for Innovation and Entrepreneurship: incubation for technology startups." },
  { name: "SIIC, IIT Kanpur", kind: "incubator", geo: "UP", base: "IIT Kanpur", offer: "Startup Innovation and Incubation Centre for technology startups." },
  { name: "TIDES, IIT Roorkee", kind: "incubator", geo: "UT", base: "IIT Roorkee", offer: "Incubation for technology startups in Uttarakhand." },
  { name: "STEP, IIT Kharagpur", kind: "incubator", geo: "WB", base: "IIT Kharagpur", offer: "Science and Technology Entrepreneurs' Park: incubation for technology startups." },
  { name: "IIM Calcutta Innovation Park", kind: "incubator", geo: "WB", base: "IIM Calcutta, Kolkata", offer: "Incubation and programmes for early-stage startups." },
];
