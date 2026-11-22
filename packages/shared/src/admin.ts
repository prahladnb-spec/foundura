import { z } from "zod";
import type { Condition, FactKey } from "./eligibility";

/** Every fact a scheme rule may test. Must match what the Scheme Scan collects. */
export const FACT_KEYS = [
  "entityType",
  "incorporationDate",
  "turnoverInrCr",
  "dpiitRecognised",
  "state",
  "sectors",
  "stage",
  "isDeepTech",
  "womenLed",
  "govtSupportReceivedInrLakh",
  "indianPromoterSharePct",
  "ageYears",
] as const satisfies readonly FactKey[];

const OPERATORS = ["eq", "neq", "in", "nin", "gt", "gte", "lt", "lte", "isTrue", "isFalse", "includesAny"] as const;
const NUMERIC_OPS = ["gt", "gte", "lt", "lte"];
const BOOL_OPS = ["isTrue", "isFalse"];
const LIST_OPS = ["in", "nin", "includesAny"];

const scalar = z.union([z.string(), z.number(), z.boolean()]);

const factCondition = z
  .object({
    fact: z.enum(FACT_KEYS, {
      error: (iss) => `"${String(iss.input)}" isn't an answer the Scheme Scan collects`,
    }),
    op: z.enum(OPERATORS),
    value: z.union([scalar, z.array(z.union([z.string(), z.number()])).min(1)]).optional(),
    label: z.string().min(3).max(240),
  })
  .strict()
  .superRefine((c, ctx) => {
    if (BOOL_OPS.includes(c.op)) {
      if (c.value !== undefined) ctx.addIssue({ code: "custom", message: `"${c.op}" takes no value`, path: ["value"] });
      return;
    }
    if (c.value === undefined) ctx.addIssue({ code: "custom", message: `"${c.op}" needs a value`, path: ["value"] });
    else if (NUMERIC_OPS.includes(c.op) && typeof c.value !== "number")
      ctx.addIssue({ code: "custom", message: `"${c.op}" needs a number`, path: ["value"] });
    else if (LIST_OPS.includes(c.op) && !Array.isArray(c.value))
      ctx.addIssue({ code: "custom", message: `"${c.op}" needs a list`, path: ["value"] });
  });

const allCondition = z.object({ all: z.array(z.lazy(() => conditionSchema)).min(1), label: z.string().max(240).optional() }).strict();
const anyCondition = z.object({ any: z.array(z.lazy(() => conditionSchema)).min(1), label: z.string().max(240).optional() }).strict();

/**
 * Recursive validator for scheme rule trees edited by admins. Dispatches on the node's key
 * ("fact", "all" or "any") so errors point at the exact field instead of a vague union error.
 */
export const conditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.any().superRefine((v, ctx) => {
    const node = v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
    const schema = node ? ("fact" in node ? factCondition : "all" in node ? allCondition : "any" in node ? anyCondition : null) : null;
    if (!schema) {
      ctx.addIssue({ code: "custom", message: 'Each condition needs a "fact", or an "all" or "any" list' });
      return;
    }
    const r = schema.safeParse(v);
    if (!r.success) for (const i of r.error.issues) ctx.addIssue({ code: "custom", message: i.message, path: i.path });
  }),
) as unknown as z.ZodType<Condition>;

const lines = z.array(z.string().min(2).max(500)).max(20);

export const schemeEditSchema = z.object({
  name: z.string().min(3).max(200),
  issuer: z.string().min(2).max(200),
  summary: z.string().min(20).max(1200),
  benefits: lines,
  howToApply: lines,
  alsoCheck: lines,
  status: z.enum(["open", "rolling", "closed", "indirect"]),
  statusNote: z.string().max(500).nullable(),
  sourceUrl: z.string().url().refine((u) => u.startsWith("https://"), "Use an https:// link"),
  sourceName: z.string().min(2).max(200),
  rule: conditionSchema,
});
export type SchemeEditInput = z.infer<typeof schemeEditSchema>;

export const articleSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only")
    .max(100),
  theme: z.string().min(2).max(60),
  excerpt: z.string().min(20).max(300),
  body: z.string().min(200).max(60000),
  /** ISO date to publish on; null keeps it as a draft. */
  publishedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
});
export type ArticleInput = z.infer<typeof articleSchema>;

export const ARTICLE_THEMES = [
  "Motivation Monday",
  "Idea Tuesday",
  "Build Wednesday",
  "Funding Thursday",
  "Growth Friday",
  "Scale Saturday",
  "Sunday Founder's Weekly",
] as const;

/** Reading time at ~200 words per minute, at least 1. */
export function readMinutes(markdown: string): number {
  return Math.max(1, Math.round(markdown.split(/\s+/).filter(Boolean).length / 200));
}

/**
 * The condition labels a person can see in scan results, in order: fact labels and labelled groups
 * (a labelled group reports as one line, so its children are not shown). These are what a
 * translation must cover.
 */
export function visibleConditionLabels(c: Condition): string[] {
  const out: string[] = [];
  const walk = (n: Condition) => {
    if ("fact" in n) out.push(n.label);
    else if (n.label) out.push(n.label);
    else ("all" in n ? n.all : n.any).forEach(walk);
  };
  walk(c);
  return [...new Set(out)];
}

const tLines = z.array(z.string().min(2).max(500)).max(20);

/** A scheme's text in another language. `labels` maps each visible English condition label to its translation. */
export const schemeTranslationSchema = z.object({
  name: z.string().min(3).max(200),
  summary: z.string().min(10).max(1200),
  benefits: tLines,
  howToApply: tLines,
  alsoCheck: tLines,
  statusNote: z.string().max(500).nullable(),
  labels: z.record(z.string().min(1).max(240), z.string().min(1).max(240)),
});
export type SchemeTranslationInput = z.infer<typeof schemeTranslationSchema>;
