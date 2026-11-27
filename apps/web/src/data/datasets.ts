import "server-only";
import { apiOr } from "@/lib/api";
import type { EventItem, Scheme, StartupPublic } from "@/lib/types";
import { FUNDING, fundingId, GATHERED_ON as FUNDING_GATHERED, CHECKED_ON as FUNDING_CHECKED } from "@/funding/directory";
import { SUPPORT, GATHERED_ON as SUPPORT_GATHERED, CHECKED_ON as SUPPORT_CHECKED } from "@/support/directory";
import { PERKS, GATHERED_ON as PERKS_GATHERED, CHECKED_ON as PERKS_CHECKED } from "@/perks/directory";
import { ROUNDS, GATHERED_ON as ROUNDS_GATHERED, CHECKED_ON as ROUNDS_CHECKED, roundId } from "@/rounds/rounds";

/**
 * Open data at /data: Foundura's public lists as CSV and JSON under CC BY 4.0. Only public
 * information: schemes, the funding, support and perks directories, publicly reported funding rounds,
 * published events, and the
 * startups whose founders chose a public profile: only factual fields (name, place, sector, stage, year,
 * DPIIT), never figures and never text the founders wrote, which isn't ours to license.
 */
export const DATASET_IDS = ["schemes", "funding", "support", "perks", "rounds", "events", "startups"] as const;
export type DatasetId = (typeof DATASET_IDS)[number];
export const LICENCE = { name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" };

type Row = Record<string, string | number | boolean | null>;
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const today = () => new Date().toISOString().slice(0, 10);

/** The rows of a dataset and the date its contents were gathered or last checked. */
export async function loadDataset(id: DatasetId): Promise<{ rows: Row[]; asOf: string; checked: boolean }> {
  switch (id) {
    case "schemes": {
      const list = await apiOr<Scheme[]>("/schemes?lang=en", [], 3600);
      return {
        rows: list.map((s) => ({
          slug: s.slug, name: s.name, issuer: s.issuer, level: s.level, state: s.state, category: s.category, status: s.status,
          summary: s.summary, source_name: s.sourceName, source_url: s.sourceUrl, last_verified: s.lastVerifiedAt, page: `${SITE}/schemes/${s.slug}`,
        })),
        asOf: today(),
        checked: true,
      };
    }
    case "funding":
      return {
        rows: FUNDING.map((e) => ({ id: fundingId(e), name: e.name, kind: e.kind, area: e.geo, based: e.base, stage: e.stage, focus: e.focus, offer: e.offer, status: e.status, url: e.url ?? null, foundura_scheme: e.scheme ?? null })),
        asOf: FUNDING_CHECKED ?? FUNDING_GATHERED,
        checked: !!FUNDING_CHECKED,
      };
    case "support":
      return {
        rows: SUPPORT.map((e) => ({ name: e.name, kind: e.kind, area: e.geo, based: e.base, offer: e.offer, workspace: e.desks ?? null, especially_for: (e.for ?? []).join(" ") || null, url: e.url ?? null })),
        asOf: SUPPORT_CHECKED ?? SUPPORT_GATHERED,
        checked: !!SUPPORT_CHECKED,
      };
    case "perks":
      return {
        rows: PERKS.map((p) => ({ id: p.id, name: p.name, provider: p.by, group: p.group, offer: p.offer, who_can_apply: p.who, url: p.url ?? null, foundura_scheme: p.scheme ?? null })),
        asOf: PERKS_CHECKED ?? PERKS_GATHERED,
        checked: !!PERKS_CHECKED,
      };
    case "rounds":
      return {
        rows: ROUNDS.map((r) => ({ id: roundId(r), date: r.date, company: r.company, what: r.what, sector: r.sector, city: r.city ?? null, state: r.state ?? null, round: r.round, amount_as_reported: r.amount, investors: r.investors.join("; "), source_name: r.source.name, source_url: r.source.url })),
        asOf: ROUNDS_CHECKED ?? ROUNDS_GATHERED,
        checked: !!ROUNDS_CHECKED,
      };
    case "events": {
      const list = await apiOr<EventItem[]>("/events", [], 3600);
      return {
        rows: list.map((e) => ({ slug: e.slug, name: e.name, start: e.startDate, end: e.endDate, city: e.city, country: e.country, scope: e.scope, type: e.type, format: e.format, deadline: e.deadline, source_url: e.sourceUrl })),
        asOf: today(),
        checked: true,
      };
    }
    case "startups": {
      // Not cached: a founder who switches their profile off must leave the file straight away.
      const list = await apiOr<StartupPublic[]>("/startups", [], 0);
      return {
        rows: list.map((s) => ({ name: s.name, state: s.state, city: s.city, sectors: s.sectors.join(";"), stage: s.stage, founded: s.foundedYear, dpiit_recognised: s.dpiitRecognised, page: `${SITE}/startups/${s.slug}` })),
        asOf: today(),
        checked: true,
      };
    }
  }
}

/** CSV with a byte-order mark (so spreadsheets read it as UTF-8); cells that look like formulas are made plain text. */
export function toCsv(rows: Row[]): string {
  if (!rows.length) return "﻿";
  const cols = Object.keys(rows[0]);
  const cell = (v: Row[string]) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\r\n") + "\r\n";
}
