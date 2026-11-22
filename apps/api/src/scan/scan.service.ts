import { Inject, Injectable, Optional } from "@nestjs/common";
import { MetricsService } from "../metrics/metrics.service";
import {
  checkEligibility,
  type Condition,
  type EligibilityResult,
  type ScanInput,
  STATUS_RANK,
} from "@foundura/shared";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { schemes, type Scheme } from "../db/schema";
import { todayInIndia } from "../common/zod";
import { localizeLabels, localizeScheme } from "../schemes/localize";
import type { Locale } from "@foundura/shared";

export interface ScanMatch extends EligibilityResult {
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
  > & { contentLang: Locale };
}

export interface ScanResult {
  date: string;
  counts: { eligible: number; maybe: number; notEligible: number };
  matches: ScanMatch[];
}

@Injectable()
export class ScanService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Optional() @Inject(MetricsService) private readonly metrics?: MetricsService,
  ) {}

  /**
   * Evaluate every scheme against the answers. Nothing about an anonymous scan is stored:
   * the answers live only for the length of this request (data minimisation).
   */
  async scan(input: ScanInput, today = todayInIndia(), lang: Locale = "en"): Promise<ScanResult> {
    // A daily total only; the answers themselves are never stored.
    void this.metrics?.bump("scan_run");
    const all = await this.db.select().from(schemes);
    const relevant = all.filter((s) => s.level === "national" || !input.state || s.state === input.state);

    const matches: ScanMatch[] = relevant
      .map((raw) => {
        const r = checkEligibility(raw.rule as Condition, input, today);
        const s = localizeScheme(raw, lang);
        return {
          status: r.status,
          met: localizeLabels(raw, lang, r.met),
          unmet: localizeLabels(raw, lang, r.unmet),
          unknown: localizeLabels(raw, lang, r.unknown),
          scheme: {
            slug: s.slug,
            name: s.name,
            issuer: s.issuer,
            level: s.level,
            state: s.state,
            category: s.category,
            summary: s.summary,
            status: s.status,
            statusNote: s.statusNote,
            sourceUrl: s.sourceUrl,
            sourceName: s.sourceName,
            alsoCheck: s.alsoCheck,
            howToApply: s.howToApply,
            lastVerifiedAt: s.lastVerifiedAt,
            contentLang: s.contentLang,
          },
        };
      })
      .sort(
        (a, b) =>
          STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
          Number(a.scheme.status === "closed") - Number(b.scheme.status === "closed") ||
          a.scheme.name.localeCompare(b.scheme.name),
      );

    return {
      date: today,
      counts: {
        eligible: matches.filter((m) => m.status === "eligible").length,
        maybe: matches.filter((m) => m.status === "maybe").length,
        notEligible: matches.filter((m) => m.status === "not_eligible").length,
      },
      matches,
    };
  }
}
