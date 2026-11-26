// Foundura data model — Phase 1.
// Personal data is kept to what each feature needs (DPDP Act 2023 / GDPR data minimisation).

import { createId } from "./id";
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const id = () => text("id").primaryKey().$defaultFn(createId);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export interface SchemeTranslation {
  name: string;
  summary: string;
  benefits: string[];
  howToApply: string[];
  alsoCheck: string[];
  statusNote: string | null;
  labels: Record<string, string>;
  sourceHash: string;
  updatedAt: string;
}

// ---------- People, sign-in, consent ----------

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  createdAt: createdAt(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  /** Language for emails: set from the page they sign in on, changeable on the dashboard. */
  locale: text("locale").$type<"en" | "hi">().notNull().default("en"),
  /** Last yearly reminder of the terms and privacy notice (IT Rules 2021 ask for one each year). */
  termsRemindedAt: timestamp("terms_reminded_at", { withTimezone: true }),
});

/** One-time sign-in codes. Only a hash is stored; rows expire after 10 minutes. */
export const otpCodes = pgTable(
  "otp_codes",
  {
    id: id(),
    email: text("email").notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("otp_codes_email_idx").on(t.email)],
);

/** Consent ledger: one row per decision, never edited, so history can be shown on request. */
export const consents = pgTable(
  "consents",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    purpose: text("purpose").notNull(),
    granted: boolean("granted").notNull(),
    noticeVersion: text("notice_version").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("consents_user_purpose_idx").on(t.userId, t.purpose, t.createdAt)],
);

// ---------- Startup profile ("Startup Passport" v1) ----------

export const startups = pgTable(
  "startups",
  {
    id: id(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    oneLiner: text("one_liner"),
    description: text("description"),
    website: text("website"),
    isPublic: boolean("is_public").notNull().default(false),
    /** Product page, demo video or app store link for the public showcase page. */
    productUrl: text("product_url"),
    /** What the startup is looking for (LOOKING_FOR values), shown on the showcase page. */
    lookingFor: text("looking_for").array().notNull().default([]),
    /** Documents from INVESTOR_DOCS the founder says are ready. Private. */
    investorDocs: text("investor_docs").array().notNull().default([]),
    /** Set when an editor hides the startup from the public showcase; the founder's setting is kept. */
    showcaseHiddenAt: timestamp("showcase_hidden_at", { withTimezone: true }),
    entityType: text("entity_type"),
    incorporationDate: date("incorporation_date"),
    turnoverInrCr: doublePrecision("turnover_inr_cr"),
    dpiitRecognised: boolean("dpiit_recognised"),
    state: text("state"),
    sectors: text("sectors").array().notNull().default([]),
    stage: text("stage"),
    isDeepTech: boolean("is_deep_tech"),
    womenLed: boolean("women_led"),
    govtSupportReceivedInrLakh: doublePrecision("govt_support_received_inr_lakh"),
    indianPromoterSharePct: doublePrecision("indian_promoter_share_pct"),
    /** Founder-hosted deck link; shown only to matched investors. */
    deckUrl: text("deck_url"),
    /** Amount being raised now (₹ lakh). Private: matching and intro requests only. */
    raisingInrLakh: doublePrecision("raising_inr_lakh"),
    /** Progress tracker: the founder's stage of the 8 (JOURNEY) and the steps they've ticked off. Private. */
    journeyStage: text("journey_stage"),
    journeyDone: text("journey_done").array().notNull().default([]),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("startups_owner_idx").on(t.ownerId)],
);

// ---------- Investors and intros ----------

export const investors = pgTable(
  "investors",
  {
    id: id(),
    ownerId: text("owner_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    firm: text("firm"),
    type: text("type").notNull(),
    bio: text("bio"),
    website: text("website"),
    sectors: text("sectors").array().notNull().default([]),
    stages: text("stages").array().notNull().default([]),
    /** Empty = all India. */
    states: text("states").array().notNull().default([]),
    chequeMinInrLakh: doublePrecision("cheque_min_inr_lakh").notNull(),
    chequeMaxInrLakh: doublePrecision("cheque_max_inr_lakh").notNull(),
    isListed: boolean("is_listed").notNull().default(true),
    /** Set by Foundura staff after checking identity and track record. */
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("investors_listed_idx").on(t.isListed)],
);

/**
 * A founder's request for an introduction to an investor. Contact details are
 * revealed to both sides only after the investor accepts. No money changes hands here.
 */
export const introRequests = pgTable(
  "intro_requests",
  {
    id: id(),
    startupId: text("startup_id")
      .notNull()
      .references(() => startups.id, { onDelete: "cascade" }),
    investorId: text("investor_id")
      .notNull()
      .references(() => investors.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    matchScore: integer("match_score").notNull(),
    status: text("status").notNull().default("pending"), // pending | accepted | declined | withdrawn
    createdAt: createdAt(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (t) => [
    index("intros_startup_idx").on(t.startupId, t.status),
    index("intros_investor_idx").on(t.investorId, t.status),
  ],
);

// ---------- Schemes ----------

export const schemes = pgTable("schemes", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  issuer: text("issuer").notNull(),
  level: text("level").notNull(), // national | state
  state: text("state"),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
  benefits: text("benefits").array().notNull().default([]),
  howToApply: text("how_to_apply").array().notNull().default([]),
  /** Eligibility rule tree (Condition in @foundura/shared). Decides eligibility deterministically. */
  rule: jsonb("rule").notNull(),
  /** Conditions the scan cannot check; shown as "also check". */
  alsoCheck: text("also_check").array().notNull().default([]),
  status: text("status").notNull().default("open"), // open | rolling | closed | indirect
  statusNote: text("status_note"),
  sourceUrl: text("source_url").notNull(),
  sourceName: text("source_name").notNull(),
  /** Editor sign-off date. Null = still needs a check against the official source. */
  lastVerifiedAt: date("last_verified_at"),
  /**
   * Other-language versions, e.g. { hi: {...} }. Each records a fingerprint of the English it was
   * written from; if the English changes, the translation is out of date and English is shown.
   */
  translations: jsonb("translations").$type<Partial<Record<"hi", SchemeTranslation>>>().notNull().default({}),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ---------- Events and policy news ----------

/**
 * Places the daily sync reads events from: an iCalendar (.ics) feed, or a web page that publishes
 * schema.org Event data. Added by editors. Events from sources that aren't trusted wait for review.
 */
/**
 * Anonymous usage counts: one row per day, metric and key (a page path or a template), holding a total.
 * No visitor, user, IP address or cookie is ever linked to a count.
 */
export const dailyCounts = pgTable(
  "daily_counts",
  {
    day: date("day").notNull(),
    metric: text("metric").notNull(),
    key: text("key").notNull().default(""),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.day, t.metric, t.key] })],
);

/** When each scheduled job last ran, succeeded and failed, so a stalled job can be noticed. */
export const jobRuns = pgTable("job_runs", {
  name: text("name").primaryKey(),
  lastStartedAt: timestamp("last_started_at", { withTimezone: true }),
  lastSuccessAt: timestamp("last_success_at", { withTimezone: true }),
  lastErrorAt: timestamp("last_error_at", { withTimezone: true }),
  lastError: text("last_error"),
});

export const eventSources = pgTable("event_sources", {
  id: id(),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  kind: text("kind").notNull(), // ics | page
  scope: text("scope").notNull(), // India | Global
  defaultType: text("default_type").notNull().default("Conference"),
  /** Trusted sources publish straight away as "Confirmed"; others wait for an editor. */
  trusted: boolean("trusted").notNull().default(false),
  active: boolean("active").notNull().default(true),
  lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
  lastResult: text("last_result"),
  lastError: text("last_error"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const events = pgTable(
  "events",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    city: text("city"),
    country: text("country").notNull(),
    scope: text("scope").notNull(), // India | Global
    type: text("type").notNull(),
    status: text("status").notNull(),
    deadline: date("deadline"),
    bestFor: text("best_for"),
    notes: text("notes"),
    sourceUrl: text("source_url"),
    sourceName: text("source_name"),
    lastChecked: date("last_checked"),
    /** In person | Online | Hybrid */
    format: text("format").notNull().default("In person"),
    /** Shown on the site. Events from untrusted sources start unpublished until an editor approves them. */
    published: boolean("published").notNull().default(true),
    sourceId: text("source_id").references(() => eventSources.id, { onDelete: "set null" }),
    /** The event's id in its source (iCalendar UID or page URL), to update instead of duplicating. */
    externalId: text("external_id"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("events_start_idx").on(t.startDate), uniqueIndex("events_source_external_idx").on(t.sourceId, t.externalId)],
);

export const policyItems = pgTable(
  "policy_items",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    date: date("date").notNull(),
    headline: text("headline").notNull(),
    country: text("country").notNull(),
    level: text("level").notNull(),
    instrument: text("instrument").notNull(),
    stage: text("stage").notNull(),
    impact: text("impact").notNull(), // High | Medium | Low
    amount: text("amount"),
    takeaway: text("takeaway").notNull(),
    sourceUrl: text("source_url").notNull(),
    sourceName: text("source_name").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("policy_date_idx").on(t.date)],
);

// ---------- Articles ----------

export const articles = pgTable("articles", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  theme: text("theme").notNull(),
  excerpt: text("excerpt").notNull(),
  /** Search details: the phrase to rank for, the title and description shown in results, and keywords. */
  focusKeyphrase: text("focus_keyphrase").notNull().default(""),
  seoTitle: text("seo_title").notNull().default(""),
  metaDescription: text("meta_description").notNull().default(""),
  keywords: jsonb("keywords").$type<string[]>().notNull().default([]),
  /** Markdown body */
  body: text("body").notNull(),
  readMinutes: integer("read_minutes").notNull(),
  publishedAt: date("published_at"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ---------- Weekly scheme alerts ----------

/**
 * One row per founder per week the digest went out. Keeps only what the next digest needs to
 * say "new for you": scheme slugs and statuses, not the email body. Cascades on erasure.
 */
export const digestSends = pgTable(
  "digest_sends",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weekOf: date("week_of").notNull(), // Monday, India time
    schemes: jsonb("schemes").$type<{ slug: string; status: "eligible" | "maybe" }[]>().notNull(),
    sentAt: createdAt(),
  },
  (t) => [uniqueIndex("digest_user_week_idx").on(t.userId, t.weekOf)],
);

// ---------- Weekly email for people without an account ----------

/**
 * Anyone can ask for the weekly email with just an address. Double opt-in: a row is "pending" until
 * the link in the confirmation email is used, and pending rows are deleted after 7 days. Unsubscribing
 * deletes the row, so only current subscribers are kept. Holds the address, language and dates only.
 */
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: id(),
  email: text("email").notNull().unique(),
  locale: text("locale").$type<"en" | "hi">().notNull().default("en"),
  createdAt: createdAt(),
  /** When the last confirmation email went out, so repeated sign-ups don't flood someone's inbox. */
  confirmSentAt: timestamp("confirm_sent_at", { withTimezone: true }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  /** The privacy notice version shown when they confirmed. */
  noticeVersion: text("notice_version"),
  /** Monday of the last week the email went out (India time), so each week sends at most once. */
  lastSentWeek: date("last_sent_week"),
});

// ---------- Private profile links ----------

/**
 * A private link a founder makes to show their profile to one incubator or investor. Only a SHA-256
 * hash of the token is stored, so the link can't be rebuilt from the database. One link per startup:
 * making a new one replaces the old. Expired rows are deleted when links are made or opened.
 */
export const profileShares = pgTable("profile_shares", {
  id: id(),
  startupId: text("startup_id")
    .notNull()
    .unique()
    .references(() => startups.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  showReadiness: boolean("show_readiness").notNull().default(false),
  showProgress: boolean("show_progress").notNull().default(false),
  createdAt: createdAt(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// ---------- Admin audit log ----------

/** Every admin change, for accountability. Actor is nulled (not deleted) if the admin account is erased. */
export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    actorLabel: text("actor_label").notNull(), // "admin" or "api-key"; no email stored
    action: text("action").notNull(), // e.g. scheme.verify, investor.verify, article.publish
    targetType: text("target_type").notNull(),
    targetId: text("target_id").notNull(),
    detail: jsonb("detail"),
    createdAt: createdAt(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

export type Scheme = typeof schemes.$inferSelect;
export type Startup = typeof startups.$inferSelect;
export type EventRow = typeof events.$inferSelect;
export type PolicyItem = typeof policyItems.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Investor = typeof investors.$inferSelect;
export type IntroRequest = typeof introRequests.$inferSelect;
