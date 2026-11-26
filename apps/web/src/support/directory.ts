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

/**
 * corporate: programmes large companies run for startups (accelerators, challenges, pilots).
 * coworking: workspace schemes that aren't part of a hub or incubator listed here.
 * campus: programmes for students and colleges (innovation councils, hackathons, student policies).
 */
export type SupportKind = "incubator" | "hub" | "mentoring" | "corporate" | "coworking" | "campus";
export const SUPPORT_KINDS: SupportKind[] = ["incubator", "hub", "mentoring", "corporate", "coworking", "campus"];

/** Groups a programme is especially for; drives the women founders and students pages. */
export type SupportFor = "women" | "students" | "global";

export type SupportEntry = {
  name: string;
  kind: SupportKind;
  /** A state code, or "IN" for programmes open across India. */
  geo: StateTile | "IN";
  /** Host institution and city. */
  base: string;
  offer: string;
  url?: string;
  /** What workspace it offers startups (desks, cabins, labs); set means it's listed on /coworking. */
  desks?: string;
  for?: SupportFor[];
};

export const SUPPORT: SupportEntry[] = [
  // ---- Across India ----
  { name: "Startup India", kind: "hub", geo: "IN", base: "DPIIT, New Delhi", offer: "The national portal: DPIIT recognition, the list of recognised incubators, scheme information and a mentorship network.", url: "https://www.startupindia.gov.in" },
  { name: "Atal Innovation Mission incubation centres", kind: "incubator", geo: "IN", base: "NITI Aayog, across India", offer: "Atal Incubation Centres and Established Incubation Centres at universities, institutes and companies in most states.", url: "https://aim.gov.in" },
  { name: "STPI Centres of Entrepreneurship", kind: "incubator", geo: "IN", base: "Software Technology Parks of India, many cities", offer: "Sector-focused incubation centres for technology startups, with space, mentoring and links to industry.", desks: "Plug-and-play office space for technology startups at STPI centres, many of them in smaller cities." },
  { name: "MeitY Startup Hub", kind: "hub", geo: "IN", base: "Ministry of Electronics and IT, New Delhi", offer: "Brings together MeitY's incubators and programmes for technology startups, including SAMRIDH and TIDE 2.0." },
  { name: "NASSCOM 10000 Startups", kind: "mentoring", geo: "IN", base: "NASSCOM, several cities", offer: "Programmes, mentoring and corporate connections for technology startups.", url: "https://10000startups.com" },
  { name: "MAARG, Startup India's mentorship portal", kind: "mentoring", geo: "IN", base: "DPIIT, online", offer: "The government's national mentorship platform. A startup registered on Startup India is matched with mentors by sector, stage and skill, and sets goals with each one. Free.", url: "https://maarg.startupindia.gov.in" },
  { name: "Wadhwani Foundation Liftoff", kind: "mentoring", geo: "IN", base: "Wadhwani Foundation, online and with partner incubators", offer: "Free programmes for early-stage startups, with expert sessions, one-to-one mentoring and help getting ready for investors. No fee and no equity taken.", url: "https://wadhwanifoundation.org" },
  { name: "TiE Women", kind: "mentoring", geo: "IN", base: "TiE chapters in many Indian cities", offer: "TiE's programme for women-led startups: learning sessions, mentoring and a global pitch competition, mostly for startups past the idea stage.", url: "https://women.tie.org", for: ["women"] },
  { name: "Women Entrepreneurship Platform (WEP)", kind: "hub", geo: "IN", base: "NITI Aayog, online, with state chapters", offer: "The national platform for women entrepreneurs: scheme information, programmes run with partner organisations, and state chapters.", url: "https://wep.gov.in", for: ["women"] },
  { name: "Smart India Hackathon", kind: "campus", geo: "IN", base: "Ministry of Education's Innovation Cell and AICTE", offer: "A national hackathon where student teams solve problems set by ministries and companies. Teams enter through their college's internal hackathon.", url: "https://sih.gov.in", for: ["students"] },
  { name: "Institution's Innovation Councils (IIC)", kind: "campus", geo: "IN", base: "Ministry of Education's Innovation Cell, in colleges across India", offer: "Innovation councils of faculty and students in thousands of colleges, running ideation, design-thinking, IP and pre-incubation activities through the year.", for: ["students"] },
  { name: "Atal Tinkering Labs", kind: "campus", geo: "IN", base: "Atal Innovation Mission, in schools across India", offer: "Making and electronics labs in schools, set up with Atal Innovation Mission support, where school students build and test their ideas.", for: ["students"] },
  { name: "Startup India Investor Connect", kind: "hub", geo: "IN", base: "DPIIT and SIDBI, online", offer: "The government's matchmaking platform, launched in 2023 and built with SIDBI: DPIIT-recognised startups are matched with investors and can pitch to several through one application." },
  { name: "BHASKAR (Bharat Startup Knowledge Access Registry)", kind: "hub", geo: "IN", base: "DPIIT, online", offer: "A free registry on the Startup India portal that gives startups, investors, mentors, incubators and government bodies a BHASKAR ID and a profile, so they can find and contact each other." },
  { name: "Startup India international bridges", kind: "hub", geo: "IN", base: "DPIIT, with partner countries", offer: "Startup India's partnerships with around 20 countries, with exchange programmes, mentoring and market access for Indian startups looking abroad.", url: "https://www.startupindia.gov.in/content/sih/en/international.html", for: ["global"] },
  { name: "SCO Startup Forum", kind: "hub", geo: "IN", base: "Shanghai Cooperation Organisation, India chairs its startup working group", offer: "Meetings and programmes for startups from the Shanghai Cooperation Organisation's member countries, a route to markets in Central Asia and beyond.", for: ["global"] },
  { name: "TiE (The Indus Entrepreneurs)", kind: "mentoring", geo: "IN", base: "Chapters in many Indian cities", offer: "A non-profit network of entrepreneurs offering mentoring, events and investor connections.", url: "https://tie.org" },

  // ---- Corporate programmes, open across India ----
  { name: "Google for Startups Accelerator: India", kind: "corporate", geo: "IN", base: "Google, Bengaluru", offer: "A three-month programme for Indian startups building with AI and cloud, with mentoring from Google teams. Applications open once a year." },
  { name: "Qualcomm Design in India Challenge", kind: "corporate", geo: "IN", base: "Qualcomm India, Bengaluru", offer: "A yearly challenge for hardware and deep-tech startups, with cash awards, mentoring, lab access and help with patents." },
  { name: "Cisco LaunchPad", kind: "corporate", geo: "IN", base: "Cisco India, Bengaluru", offer: "An accelerator for enterprise technology startups, with mentoring, Cisco product access and introductions to Cisco customers." },
  { name: "Flipkart Leap", kind: "corporate", geo: "IN", base: "Flipkart, Bengaluru", offer: "Flipkart's startup programmes for commerce and supply-chain technology, with mentoring, pilots and, for some, investment." },
  { name: "JioGenNext", kind: "corporate", geo: "IN", base: "Reliance Jio, Mumbai", offer: "Reliance's accelerator for early-stage startups, with mentoring and access to Reliance businesses for pilots." },
  { name: "HDFC Bank SmartUp", kind: "corporate", geo: "IN", base: "HDFC Bank, Mumbai", offer: "Banking and advisory services for startups, and SmartUp grants for social-impact startups." },
  { name: "Shell E4", kind: "corporate", geo: "IN", base: "Shell, Bengaluru", offer: "An accelerator for energy and clean-technology startups, with technical mentoring and access to Shell's labs and businesses." },
  { name: "BPCL Project Ankur", kind: "corporate", geo: "IN", base: "Bharat Petroleum, Mumbai", offer: "Bharat Petroleum's programme for startups in energy and related fields, with funding and mentoring." },
  { name: "IndianOil Startup Scheme", kind: "corporate", geo: "IN", base: "Indian Oil Corporation, New Delhi", offer: "Funding and mentoring from IndianOil for startups working on energy and related technology." },
  { name: "ONGC Startup Fund", kind: "corporate", geo: "IN", base: "ONGC, New Delhi", offer: "ONGC's fund for startups in energy and oil and gas technology." },

  // ---- States and union territories (alphabetical by state) ----
  { name: "Ratan Tata Innovation Hub", kind: "hub", geo: "AP", base: "Government of Andhra Pradesh, Amaravati", offer: "The state's innovation hub, with spokes in other cities, under the Andhra Pradesh startup policy." },
  { name: "IIT Guwahati Technology Incubation Centre", kind: "incubator", geo: "AS", base: "IIT Guwahati", offer: "Incubation for technology startups from the North East." },
  { name: "IIT Patna Incubation Centre", kind: "incubator", geo: "BR", base: "IIT Patna", offer: "Incubation for electronics, IT and medical-electronics startups." },
  { name: "36Inc", kind: "incubator", geo: "CT", base: "Government of Chhattisgarh, Nava Raipur", offer: "The state-backed incubator for Chhattisgarh startups." },
  { name: "FITT, IIT Delhi", kind: "incubator", geo: "DL", base: "IIT Delhi", offer: "Foundation for Innovation and Technology Transfer: incubation and technology transfer for deep-tech startups." },
  { name: "Center for Incubation and Business Acceleration (CIBA)", kind: "incubator", geo: "GA", base: "Agnel Technical Education Complex, Verna", offer: "Goa's long-running technology incubator, also a DST and AIM partner." },
  { name: "CIIE.CO", kind: "incubator", geo: "GJ", base: "IIM Ahmedabad", offer: "Incubation, accelerator programmes and early-stage funds for Indian startups.", url: "https://ciie.co" },
  { name: "iCreate", kind: "incubator", geo: "GJ", base: "Ahmedabad", offer: "An independent centre backed by the Government of Gujarat for technology and deep-tech startups." },
  { name: "i-Hub Gujarat", kind: "hub", geo: "GJ", base: "Government of Gujarat, Ahmedabad", offer: "The state's student startup and innovation hub.", desks: "Co-working desks for early-stage startups, for up to two years, with meeting rooms and internet. Preference goes to startups backed by a state scheme or an incubator.", for: ["students"] },
  { name: "Student Start-up and Innovation Policy (SSIP 2.0)", kind: "campus", geo: "GJ", base: "Education Department, Government of Gujarat", offer: "Gujarat's student startup policy, running to March 2027: grants for students' proofs of concept and prototypes through their school, college or university, plus help filing IP. Open to students, alumni and dropouts up to 35.", url: "https://ssipgujarat.in", for: ["students"] },
  { name: "Goa co-working subsidy", kind: "coworking", geo: "GA", base: "Goa Start-up Policy 2025", offer: "Repays part of the seat cost for startups certified by the state, at co-working spaces, incubators and accelerators on the state's list.", desks: "Part of the seat cost repaid at listed co-working spaces, incubators and accelerators in Goa, for startups certified by the state." },
  { name: "IIT Mandi Catalyst", kind: "incubator", geo: "HP", base: "IIT Mandi", offer: "Himachal Pradesh's technology business incubator." },
  { name: "JKEDI", kind: "hub", geo: "JK", base: "J&K Entrepreneurship Development Institute, Srinagar and Jammu", offer: "Training, incubation and loan programmes for entrepreneurs in Jammu and Kashmir." },
  { name: "NSRCEL", kind: "incubator", geo: "KA", base: "IIM Bangalore", offer: "Incubation and programmes for early-stage founders, including women founders and social enterprises.", url: "https://www.nsrcel.org" },
  { name: "Society for Innovation and Development (SID)", kind: "incubator", geo: "KA", base: "Indian Institute of Science, Bengaluru", offer: "Incubation for science and engineering startups." },
  { name: "Karnataka Startup Cell and K-tech Innovation Hubs", kind: "hub", geo: "KA", base: "Government of Karnataka, Bengaluru and other cities", offer: "Runs ELEVATE and the state's innovation hubs and incubators." },
  { name: "Kerala Startup Mission", kind: "hub", geo: "KL", base: "Government of Kerala, Kochi and Thiruvananthapuram", offer: "The state's startup agency: incubation, grants, events and the Integrated Startup Complex.", url: "https://startupmission.kerala.gov.in", desks: "Co-working seats, charged per seat, at the Integrated Startup Complex in the Technology Innovation Zone, Kalamassery, Kochi, for startups with a KSUM unique ID." },
  { name: "Innovation and Entrepreneurship Development Centres (IEDC)", kind: "campus", geo: "KL", base: "Kerala Startup Mission, in colleges across Kerala", offer: "Student innovation centres in hundreds of Kerala colleges, polytechnics and universities, where students learn, build prototypes and can move on to KSUM's incubators.", url: "https://iedc.startupmission.in", for: ["students"] },
  { name: "Technopark Technology Business Incubator", kind: "incubator", geo: "KL", base: "Technopark, Thiruvananthapuram", offer: "Incubation for technology startups in Kerala's largest IT park." },
  { name: "SINE, IIT Bombay", kind: "incubator", geo: "MH", base: "IIT Bombay, Mumbai", offer: "Society for Innovation and Entrepreneurship: incubation for technology startups." },
  { name: "Venture Center", kind: "incubator", geo: "MH", base: "CSIR-NCL, Pune", offer: "Incubation for science and engineering startups, with labs and equipment." },
  { name: "Maharashtra State Innovation Society", kind: "hub", geo: "MH", base: "Government of Maharashtra, Mumbai", offer: "Runs the state's startup policy, Startup Week and incubator network." },
  { name: "PRIME Meghalaya", kind: "hub", geo: "ML", base: "Government of Meghalaya, Shillong", offer: "Promotion and Incubation of Market-driven Enterprises: incubation and support across the state." },
  { name: "O-Hub", kind: "hub", geo: "OR", base: "Startup Odisha, Bhubaneswar", offer: "Odisha's startup hub, with space, programmes and the state's startup support.", desks: "Subsidised plug-and-play co-working, cabins and modular manufacturing space in the government-run O-Hub towers." },
  { name: "KIIT Technology Business Incubator", kind: "incubator", geo: "OR", base: "KIIT, Bhubaneswar", offer: "Incubation for technology and biotechnology startups." },
  { name: "Punjab Biotechnology Incubator", kind: "incubator", geo: "PB", base: "Mohali", offer: "Incubation and testing facilities for agri, food and biotech startups." },
  { name: "Bhamashah Techno Hub", kind: "hub", geo: "RJ", base: "iStart Rajasthan, Jaipur", offer: "Rajasthan's startup hub, home of the iStart programme.", desks: "Co-working space for startups registered with iStart, in one of the largest government-owned startup buildings in India." },
  { name: "IIT Madras Incubation Cell", kind: "incubator", geo: "TN", base: "IIT Madras Research Park, Chennai", offer: "Incubation for deep-tech startups, among the largest in India." },
  { name: "StartupTN", kind: "hub", geo: "TN", base: "Government of Tamil Nadu, Chennai", offer: "Tamil Nadu's startup agency: TANSEED grants, regional hubs and programmes.", url: "https://startuptn.in" },
  { name: "T-Hub", kind: "hub", geo: "TG", base: "Hyderabad", offer: "A large innovation hub backed by the Government of Telangana, with programmes for startups and corporate innovation.", url: "https://t-hub.co", desks: "Plug-and-play workspace in the T-Hub building, from a single seat to small teams, with cabins and meeting rooms." },
  { name: "WE Hub", kind: "hub", geo: "TG", base: "Government of Telangana, Hyderabad", offer: "The state-led incubator for women entrepreneurs.", for: ["women"] },
  { name: "CIE, IIIT Hyderabad", kind: "incubator", geo: "TG", base: "IIIT Hyderabad", offer: "Center for Innovation and Entrepreneurship: incubation for technology startups." },
  { name: "SIIC, IIT Kanpur", kind: "incubator", geo: "UP", base: "IIT Kanpur", offer: "Startup Innovation and Incubation Centre for technology startups." },
  { name: "TIDES, IIT Roorkee", kind: "incubator", geo: "UT", base: "IIT Roorkee", offer: "Incubation for technology startups in Uttarakhand." },
  { name: "STEP, IIT Kharagpur", kind: "incubator", geo: "WB", base: "IIT Kharagpur", offer: "Science and Technology Entrepreneurs' Park: incubation for technology startups." },
  { name: "IIM Calcutta Innovation Park", kind: "incubator", geo: "WB", base: "IIM Calcutta, Kolkata", offer: "Incubation and programmes for early-stage startups." },
];
