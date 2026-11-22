import { z } from "zod";
import { CONSENT_PURPOSES, ENTITY_TYPES, INDIAN_STATES, INVESTOR_TYPES, SECTORS, STAGES } from "./constants";

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

export const startupProfileSchema = scanInputSchema.extend({
  name: z.string().min(2).max(120),
  website: httpsUrl.optional().or(z.literal("")),
  oneLiner: z.string().max(200).optional(),
  description: z.string().max(4000).optional(),
  isPublic: z.boolean().default(false),
  /** Link to a pitch deck the founder hosts (Foundura does not store decks). Shown only to matched investors. */
  deckUrl: httpsUrl.optional().or(z.literal("")),
  /** Amount the startup is raising now, in ₹ lakh. Private; used for matching and shown only in intro requests. */
  raisingInrLakh: z.number().min(0).max(1_000_000).optional(),
});

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
export const unsubscribeSchema = z.object({
  u: z.string().min(1).max(64),
  t: z.string().min(20).max(100),
});
