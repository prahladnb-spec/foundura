import { z } from "zod";
import { CONSENT_PURPOSES, ENTITY_TYPES, INDIAN_STATES, SECTORS, STAGES } from "./constants";

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

export const startupProfileSchema = scanInputSchema.extend({
  name: z.string().min(2).max(120),
  website: z.string().url().max(300).optional().or(z.literal("")),
  oneLiner: z.string().max(200).optional(),
  description: z.string().max(4000).optional(),
  isPublic: z.boolean().default(false),
});
export type StartupProfileInput = z.infer<typeof startupProfileSchema>;

export const requestOtpSchema = z.object({ email: z.string().email().max(254) });
export const verifyOtpSchema = z.object({
  email: z.string().email().max(254),
  code: z.string().regex(/^\d{6}$/),
  /** Purposes the person ticked on the sign-in form. "account" is required. */
  consents: z.array(consentPurposeSchema).optional(),
});

export const setConsentSchema = z.object({
  purpose: consentPurposeSchema,
  granted: z.boolean(),
});
