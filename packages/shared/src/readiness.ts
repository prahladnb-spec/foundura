/**
 * Investor Readiness Score: a 0–100 score with a fix-it list.
 *
 * It measures how complete and investor-ready a profile is, not how good the
 * business is. Every point is explained, so a founder always knows what to do next.
 */

export interface ReadinessInput {
  name?: string | null;
  oneLiner?: string | null;
  description?: string | null;
  website?: string | null;
  deckUrl?: string | null;
  entityType?: string | null;
  dpiitRecognised?: boolean | null;
  incorporationDate?: string | null;
  state?: string | null;
  sectors?: string[] | null;
  stage?: string | null;
  raisingInrLakh?: number | null;
  isPublic?: boolean | null;
  /** Documents from INVESTOR_DOCS the founder says are ready. */
  investorDocs?: string[] | null;
  /** Whether the founder has switched on "Show my profile to investors". */
  investorVisibility?: boolean;
}

export interface ReadinessItem {
  key: string;
  label: string;
  points: number;
  earned: number;
  /** What to do to earn the rest; null when complete. */
  fix: string | null;
}

export interface ReadinessResult {
  score: number;
  band: "getting_started" | "almost_ready" | "investor_ready";
  items: ReadinessItem[];
}

const DOCS_WANTED = 8;
const REGISTERED = ["private_limited", "llp", "partnership", "cooperative"];
const filled = (s?: string | null, min = 1) => typeof s === "string" && s.trim().length >= min;

export function readiness(p: ReadinessInput): ReadinessResult {
  const stagePoints = p.stage === "early_revenue" || p.stage === "growth" ? 15 : p.stage === "prototype" ? 8 : 0;

  const items: ReadinessItem[] = [
    {
      key: "entity",
      label: "Registered company, LLP, partnership or cooperative",
      points: 10,
      earned: p.entityType && REGISTERED.includes(p.entityType) ? 10 : 0,
      fix: "Most investors can only invest in a registered entity, usually a private limited company.",
    },
    {
      key: "dpiit",
      label: "DPIIT recognised",
      points: 10,
      earned: p.dpiitRecognised ? 10 : 0,
      fix: "Apply for DPIIT recognition. It is free and unlocks tax and funding benefits investors look for.",
    },
    {
      key: "story",
      label: "One-line pitch and a short description",
      points: 10,
      earned: (filled(p.oneLiner, 10) ? 5 : 0) + (filled(p.description, 120) ? 5 : 0),
      fix: "Add a one-line pitch and a description of at least a few sentences: problem, customer, solution.",
    },
    {
      key: "website",
      label: "Website",
      points: 5,
      earned: filled(p.website) ? 5 : 0,
      fix: "Add your website or a simple landing page.",
    },
    {
      key: "deck",
      label: "Pitch deck link",
      points: 10,
      earned: filled(p.deckUrl) ? 10 : 0,
      fix: "Add a link to your pitch deck. It is shown only to investors you match with.",
    },
    {
      key: "focus",
      label: "Sector and stage",
      points: 10,
      earned: (p.sectors && p.sectors.length > 0 ? 5 : 0) + (p.stage ? 5 : 0),
      fix: "Choose your sectors and stage so investors with the right focus can find you.",
    },
    {
      key: "traction",
      label: "Traction (prototype or revenue)",
      points: 15,
      earned: stagePoints,
      fix:
        stagePoints === 0
          ? "Build a prototype or MVP; early-stage investors rarely back an idea alone."
          : "First revenue earns the remaining points.",
    },
    {
      key: "basics",
      label: "Incorporation date and state",
      points: 5,
      earned: (filled(p.incorporationDate) ? 3 : 0) + (filled(p.state) ? 2 : 0),
      fix: "Add your incorporation date and state.",
    },
    {
      key: "ask",
      label: "Fundraising amount",
      points: 5,
      earned: typeof p.raisingInrLakh === "number" && p.raisingInrLakh > 0 ? 5 : 0,
      fix: "Say how much you are raising, so we can match you with investors whose cheque size fits. It stays private.",
    },
    {
      key: "documents",
      label: "Documents investors ask for",
      points: 10,
      earned: Math.min(10, Math.round((10 * new Set(p.investorDocs ?? []).size) / DOCS_WANTED)),
      fix: "Tick off the documents you have ready under \"Documents investors ask for\". Free templates for each are under Templates.",
    },
    {
      key: "public",
      label: "Public profile",
      points: 5,
      earned: p.isPublic ? 5 : 0,
      fix: "Turn on your public profile (financial figures always stay private).",
    },
    {
      key: "visibility",
      label: "Visible to investors",
      points: 5,
      earned: p.investorVisibility ? 5 : 0,
      fix: "Switch on \"Show my profile to investors\" in Your data and choices.",
    },
  ].map((i) => ({ ...i, fix: i.earned >= i.points ? null : i.fix }));

  const score = items.reduce((s, i) => s + i.earned, 0);
  return {
    score,
    band: score >= 75 ? "investor_ready" : score >= 50 ? "almost_ready" : "getting_started",
    items,
  };
}
