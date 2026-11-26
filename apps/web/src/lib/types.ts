export interface Scheme {
  slug: string;
  name: string;
  issuer: string;
  level: "national" | "state";
  state: string | null;
  category: string;
  summary: string;
  benefits: string[];
  howToApply: string[];
  alsoCheck: string[];
  status: "open" | "rolling" | "closed" | "indirect";
  statusNote: string | null;
  sourceUrl: string;
  sourceName: string;
  lastVerifiedAt: string | null;
  /** Language the text came back in ("en" when no current translation exists). */
  contentLang: "en" | "hi";
}

export type MatchStatus = "eligible" | "maybe" | "not_eligible";

export interface ScanMatch {
  status: MatchStatus;
  met: string[];
  unmet: string[];
  unknown: string[];
  scheme: Pick<
    Scheme,
    | "slug"
    | "name"
    | "issuer"
    | "level"
    | "state"
    | "category"
    | "summary"
    | "status"
    | "statusNote"
    | "sourceUrl"
    | "sourceName"
    | "alsoCheck"
    | "howToApply"
    | "lastVerifiedAt"
    | "contentLang"
  >;
}

export interface ScanResult {
  date: string;
  counts: { eligible: number; maybe: number; notEligible: number };
  matches: ScanMatch[];
}

export interface EventItem {
  slug: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  city: string | null;
  country: string;
  scope: string;
  type: string;
  status: string;
  deadline: string | null;
  bestFor: string | null;
  notes: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  format: "In person" | "Online" | "Hybrid";
  /** Worked out from the country; null for online events and unknown countries. */
  region: string | null;
}

export interface PolicyItem {
  slug: string;
  date: string;
  headline: string;
  country: string;
  level: string;
  instrument: string;
  stage: string;
  impact: "High" | "Medium" | "Low";
  amount: string | null;
  takeaway: string;
  sourceUrl: string;
  sourceName: string;
}

export interface ArticleSummary {
  slug: string;
  title: string;
  theme: string;
  excerpt: string;
  readMinutes: number;
  publishedAt: string | null;
  topic: string;
  authorName: string | null;
}

export interface Article extends ArticleSummary {
  authorRole: string | null;
  authorUrl: string | null;
  body: string;
  focusKeyphrase: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface Startup {
  id: string;
  name: string;
  slug: string;
  oneLiner: string | null;
  description: string | null;
  website: string | null;
  isPublic: boolean;
  productUrl: string | null;
  lookingFor: string[];
  investorDocs: string[];
  showcaseHiddenAt: string | null;
  entityType: string | null;
  incorporationDate: string | null;
  turnoverInrCr: number | null;
  dpiitRecognised: boolean | null;
  state: string | null;
  sectors: string[];
  stage: string | null;
  isDeepTech: boolean | null;
  womenLed: boolean | null;
  govtSupportReceivedInrLakh: number | null;
  indianPromoterSharePct: number | null;
  deckUrl: string | null;
  raisingInrLakh: number | null;
  city: string | null;
  journeyStage: string | null;
  journeyDone: string[];
}

/** What a private profile link shows: settings and dates, never the token. */
export interface ShareState {
  showReadiness: boolean;
  showProgress: boolean;
  createdAt: string;
  expiresAt: string;
}

/** A startup on the public showcase. Never carries financial figures. */
export interface StartupPublic {
  name: string;
  slug: string;
  oneLiner: string | null;
  description: string | null;
  website: string | null;
  productUrl: string | null;
  lookingFor: string[];
  state: string | null;
  city: string | null;
  sectors: string[];
  stage: string | null;
  foundedYear: number | null;
  dpiitRecognised: boolean | null;
  isDeepTech: boolean | null;
  updatedAt: string;
}

export interface InvestorPublic {
  id: string;
  slug: string;
  name: string;
  firm: string | null;
  type: string;
  bio: string | null;
  website: string | null;
  sectors: string[];
  stages: string[];
  states: string[];
  chequeMinInrLakh: number;
  chequeMaxInrLakh: number;
  verified: boolean;
  responseRatePct?: number | null;
}

export interface InvestorOwn extends Omit<InvestorPublic, "verified" | "responseRatePct"> {
  isListed: boolean;
  verifiedAt: string | null;
}

export interface MatchResult {
  score: number;
  reasons: string[];
  gaps: string[];
}

export interface ReadinessItem {
  key: string;
  label: string;
  points: number;
  earned: number;
  fix: string | null;
}

export interface Readiness {
  score: number;
  band: "getting_started" | "almost_ready" | "investor_ready";
  items: ReadinessItem[];
}

export interface StartupPublic {
  name: string;
  slug: string;
  oneLiner: string | null;
  description: string | null;
  website: string | null;
  state: string | null;
  sectors: string[];
  stage: string | null;
  dpiitRecognised: boolean | null;
  isDeepTech: boolean | null;
}

export type IntroStatus = "pending" | "accepted" | "declined" | "withdrawn";

export interface SentIntro {
  id: string;
  status: IntroStatus;
  message: string;
  matchScore: number;
  createdAt: string;
  startupName: string;
  investor: InvestorPublic;
  contactEmail: string | null;
}

export interface ReceivedIntro {
  id: string;
  status: IntroStatus;
  message: string;
  matchScore: number;
  createdAt: string;
  startup: StartupPublic & { deckUrl: string | null; raisingInrLakh: number | null };
  contactEmail: string | null;
}

export interface ConsentState {
  purpose: string;
  label: string;
  description: string;
  required: boolean;
  granted: boolean;
  updatedAt: string | null;
}
