import { z } from "zod";

/**
 * Anonymous usage counts. Each is a daily total; nothing about who did it is kept.
 * Browser-sent metrics come through the web server's /api/m beacon; the rest are counted by the API.
 */
export const METRICS = {
  page_view: { label: "Page views", from: "browser" },
  template_download: { label: "Template downloads", from: "browser" },
  calendar_add: { label: "Events added to a calendar", from: "browser" },
  calendar_subscribe: { label: "Calendar subscriptions started", from: "browser" },
  search: { label: "Searches (found something, or nothing)", from: "browser" },
  scan_run: { label: "Scheme Scans run", from: "api" },
  signup: { label: "New accounts", from: "api" },
  intro_request: { label: "Intro requests sent", from: "api" },
  calendar_feed_read: { label: "Calendar feed refreshes", from: "api" },
} as const;
export type Metric = keyof typeof METRICS;
export const BROWSER_METRICS = (Object.keys(METRICS) as Metric[]).filter((m) => METRICS[m].from === "browser");

/** What the web server forwards for a browser-sent count. The key is a page path or a template slug. */
export const metricBeaconSchema = z.object({
  metric: z.enum(BROWSER_METRICS as [Metric, ...Metric[]]),
  key: z
    .string()
    .max(120)
    .regex(/^[a-z0-9/_\-.]*$/, "Keys are paths or slugs")
    .default(""),
});
