import { z } from "zod";
import { CITIES, CONSENT_PURPOSES, ENTITY_TYPES, INDIAN_STATES, INVESTOR_DOCS, INVESTOR_TYPES, JOURNEY_STAGES, JOURNEY_STEPS, LOOKING_FOR, SECTORS, SHARE_DAYS, STAGES } from "./constants";

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((x) => x.value) as unknown as [T[number]["value"], ...T[number]["value"][]];

export const entityTypeSchema = z.enum(values(ENTITY_TYPES));
export const stageSchema = z.enum(values(STAGES));
export const sectorSchema = z.enum(values(SECTORS));
export const stateSchema = z.enum(values(INDIAN_STATES));
export const consentPurposeSchema = z.enum(values(CONSENT_PURPOSES));

/**
 * Answers for a Scheme Scan. Every field is optional: the engine reports
 * "unknown" for rules that depend on a missing answer instead of guessing.
 */
export const scanInputSchema = z.object({
  entityType: entityTypeSchema.optional(),
  /** ISO date (YYYY-MM-DD) of incorporation or registration. */
  incorporationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional(),
  /** Highest annual turnover in any financial year since incorporation, in ₹ crore. */
  turnoverInrCr: z.number().min(0).max(100000).optional(),
  dpiitRecognised: z.boolean().optional(),
  state: stateSchema.optional(),
  sectors: z.array(sectorSchema).max(5).optional(),
  stage: stageSchema.optional(),
  isDeepTech: z.boolean().optional(),
  /** At least one woman founder holding ≥51% or a woman director, as the scheme defines it. */
  womenLed: z.boolean().optional(),
  /** Monetary support already received under other central/state government schemes, in ₹ lakh. */
  govtSupportReceivedInrLakh: z.number().min(0).max(100000).optional(),
  /** Indian promoters' shareholding, in percent. */
  indianPromoterSharePct: z.number().min(0).max(100).optional(),
});
export type ScanInput = z.infer<typeof scanInputSchema>;

const httpsUrl = z
  .string()
  .url()
  .max(300)
  .refine((u) => /^https?:\/\//i.test(u), "Use a link starting with https://");

/**
 * For PATCH bodies: every field optional and no defaults filled in. (In Zod 4 `.partial()` still
 * applies `.default()` values, which would silently reset fields the request didn't mention.)
 */
export function patchSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  const shape = Object.fromEntries(
    Object.entries(schema.shape).map(([k, v]) => {
      const field = v instanceof z.ZodDefault ? (v.unwrap() as z.ZodType) : (v as z.ZodType);
      return [k, field.optional()];
    }),
  ) as unknown as { [K in keyof T]: z.ZodOptional<T[K] extends z.ZodDefault<infer I> ? I : T[K]> };
  return z.object(shape);
}

export const startupProfileSchema = scanInputSchema.extend({
  name: z.string().min(2).max(120),
  website: httpsUrl.optional().or(z.literal("")),
  oneLiner: z.string().max(200).optional(),
  description: z.string().max(4000).optional(),
  isPublic: z.boolean().default(false),
  /** Product page, demo video or app store link, shown on the public showcase page. */
  productUrl: httpsUrl.optional().or(z.literal("")),
  /** What the startup wants from visitors to its showcase page. */
  lookingFor: z.array(z.enum(values(LOOKING_FOR))).max(LOOKING_FOR.length).optional(),
  /** Which of the documents investors ask for the founder has ready. Private; feeds the readiness score. */
  investorDocs: z.array(z.enum(INVESTOR_DOCS)).max(INVESTOR_DOCS.length).optional(),
  /** Link to a pitch deck the founder hosts (Foundura does not store decks). Shown only to matched investors. */
  deckUrl: httpsUrl.optional().or(z.literal("")),
  /** Amount the startup is raising now, in ₹ lakh. Private; used for matching and shown only in intro requests. */
  raisingInrLakh: z.number().min(0).max(1_000_000).optional(),
  /** One of CITIES, shown on the public page and the city page. Empty string clears it. */
  city: z.enum(values(CITIES)).optional().or(z.literal("")),
});

/** Filters for the public startup directory. */
export const startupDirectoryQuerySchema = z.object({
  sector: sectorSchema.optional(),
  stage: stageSchema.optional(),
  state: stateSchema.optional(),
  lookingFor: z.enum(values(LOOKING_FOR)).optional(),
  city: z.enum(values(CITIES)).optional(),
});
export type StartupDirectoryQuery = z.infer<typeof startupDirectoryQuerySchema>;

export const investorTypeSchema = z.enum(values(INVESTOR_TYPES));

export const investorProfileSchema = z
  .object({
    name: z.string().min(2).max(120),
    firm: z.string().max(120).optional(),
    type: investorTypeSchema,
    bio: z.string().max(1500).optional(),
    website: httpsUrl.optional().or(z.literal("")),
    sectors: z.array(sectorSchema).min(1).max(8),
    stages: z.array(stageSchema).min(1).max(4),
    /** Empty = invests across India. */
    states: z.array(stateSchema).max(36).default([]),
    chequeMinInrLakh: z.number().min(0).max(1_000_000),
    chequeMaxInrLakh: z.number().min(0).max(1_000_000),
    /** Listed in the public investor directory. */
    isListed: z.boolean().default(true),
  })
  .refine((v) => v.chequeMaxInrLakh >= v.chequeMinInrLakh, {
    message: "Maximum cheque must be at least the minimum",
    path: ["chequeMaxInrLakh"],
  });
export type InvestorProfileInput = z.infer<typeof investorProfileSchema>;

export const introRequestSchema = z.object({
  investorId: z.string().min(1).max(64),
  message: z.string().min(40, "Write at least a couple of sentences").max(800),
});

export const introResponseSchema = z.object({ accept: z.boolean() });
export type StartupProfileInput = z.infer<typeof startupProfileSchema>;

/** Languages Foundura speaks: the site and the emails it sends. */
export const LOCALES = ["en", "hi"] as const;
export type Locale = (typeof LOCALES)[number];
export const localeSchema = z.enum(LOCALES);

/** `locale` is the language of the page the person signed in from; emails follow it. */
export const requestOtpSchema = z.object({ email: z.string().email().max(254), locale: localeSchema.optional() });
export const verifyOtpSchema = z.object({
  email: z.string().email().max(254),
  code: z.string().regex(/^\d{6}$/),
  locale: localeSchema.optional(),
  /** Purposes the person ticked on the sign-in form. "account" is required. */
  consents: z.array(consentPurposeSchema).optional(),
});

export const setLocaleSchema = z.object({ locale: localeSchema });

export const setConsentSchema = z.object({
  purpose: consentPurposeSchema,
  granted: z.boolean(),
});

/** One-click unsubscribe link parameters (user id and HMAC token). */
/** Weekly email for people without an account. */
export const newsletterSubscribeSchema = z.object({ email: z.string().email().max(254), locale: localeSchema.optional() });
/** The links in newsletter emails: subscriber id and a signed token. */
export const newsletterLinkSchema = z.object({
  s: z.string().min(1).max(64),
  t: z.string().min(20).max(100),
});

export const unsubscribeSchema = z.object({
  u: z.string().min(1).max(64),
  t: z.string().min(20).max(100),
});

/** The progress tracker on "My startup": the founder's stage and the steps they've ticked off. */
export const journeySchema = z.object({
  stage: z.enum(JOURNEY_STAGES as [string, ...string[]]).nullable(),
  done: z.array(z.enum(JOURNEY_STEPS as [string, ...string[]])).max(JOURNEY_STEPS.length),
});
export type JourneyInput = z.infer<typeof journeySchema>;

/** A private link to a startup profile: what it includes and how long it works. */
export const shareLinkSchema = z.object({
  showReadiness: z.boolean(),
  showProgress: z.boolean(),
  days: z.union(SHARE_DAYS.map((d) => z.literal(d)) as [z.ZodLiteral<7>, z.ZodLiteral<30>, z.ZodLiteral<90>]),
});
export type ShareLinkInput = z.infer<typeof shareLinkSchema>;

/** Token in a private profile link: 32 random bytes, base64url. */
export const shareTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
