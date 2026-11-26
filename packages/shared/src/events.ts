import { z } from "zod";

export const EVENT_FORMATS = ["In person", "Online", "Hybrid"] as const;
export type EventFormat = (typeof EVENT_FORMATS)[number];

/** The kinds of event the calendar can be filtered by (the `type` an editor gives each event). "Challenge" is an open innovation challenge: problem statements startups answer by a deadline. */
export const EVENT_KINDS = ["Conference", "Summit", "Expo", "Pitch competition", "Challenge", "Award / ranking", "Ecosystem day"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export const EVENT_REGIONS = ["India", "Asia-Pacific", "Middle East and Africa", "Europe", "Americas"] as const;
export type EventRegion = (typeof EVENT_REGIONS)[number];

const REGION_OF: Record<string, EventRegion> = {};
const add = (region: EventRegion, names: string) => names.split("|").forEach((n) => (REGION_OF[n.toLowerCase()] = region));
add("India", "India|IN");
add("Asia-Pacific", "Singapore|Japan|China|Hong Kong|Taiwan|South Korea|Korea|Indonesia|Malaysia|Thailand|Vietnam|Philippines|Australia|New Zealand|Bangladesh|Sri Lanka|Nepal|Pakistan|SG|JP|CN|HK|TW|KR|ID|MY|TH|VN|PH|AU|NZ|BD|LK|NP|PK");
add("Middle East and Africa", "UAE|United Arab Emirates|Saudi Arabia|Qatar|Bahrain|Oman|Kuwait|Israel|Egypt|Kenya|Nigeria|South Africa|Morocco|Rwanda|Ghana|AE|SA|QA|BH|OM|KW|IL|EG|KE|NG|ZA|MA|RW|GH");
add("Europe", "UK|United Kingdom|England|Ireland|France|Germany|Spain|Portugal|Italy|Netherlands|Belgium|Switzerland|Austria|Sweden|Finland|Norway|Denmark|Estonia|Poland|Czech Republic|Greece|Lithuania|Latvia|GB|IE|FR|DE|ES|PT|IT|NL|BE|CH|AT|SE|FI|NO|DK|EE|PL|CZ|GR|LT|LV");
add("Americas", "USA|US|United States|United States of America|Canada|Mexico|Brazil|Argentina|Chile|Colombia|Peru|CA|MX|BR|AR|CL|CO|PE");

/** The region a country belongs to, for the calendar filter. Unknown countries return null. */
export const regionOf = (country: string | null | undefined): EventRegion | null => (country ? (REGION_OF[country.trim().toLowerCase()] ?? null) : null);

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2027-03-15");

/** Filters for the public events list and calendar. */
export const eventQuerySchema = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
  scope: z.enum(["India", "Global"]).optional(),
  region: z.enum(EVENT_REGIONS).optional(),
  format: z.enum(EVENT_FORMATS).optional(),
  type: z.string().max(60).optional(),
});
export type EventQuery = z.infer<typeof eventQuerySchema>;

/** An event source as an editor enters it. */
export const eventSourceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  url: z
    .string()
    .trim()
    .url()
    .refine((u) => u.startsWith("https://"), "Use an https:// address"),
  kind: z.enum(["ics", "page"]),
  scope: z.enum(["India", "Global"]),
  defaultType: z.string().trim().min(2).max(60).default("Conference"),
  trusted: z.boolean().default(false),
  active: z.boolean().default(true),
});
export type EventSourceInput = z.infer<typeof eventSourceSchema>;

/** What an editor does with an imported event: publish it, publish and mark it confirmed, or hide it. */
export const eventReviewSchema = z.object({ action: z.enum(["publish", "confirm", "hide"]) });
