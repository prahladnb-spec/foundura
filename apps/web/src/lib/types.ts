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
    | "lastVerifiedAt"
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
}

export interface Article extends ArticleSummary {
  body: string;
}

export interface Startup {
  id: string;
  name: string;
  slug: string;
  oneLiner: string | null;
  description: string | null;
  website: string | null;
  isPublic: boolean;
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
}

export interface ConsentState {
  purpose: string;
  label: string;
  description: string;
  required: boolean;
  granted: boolean;
  updatedAt: string | null;
}
