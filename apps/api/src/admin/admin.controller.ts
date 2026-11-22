import { timingSafeEqual } from "node:crypto";
import {
  BadRequestException,
  Body,
  type CanActivate,
  Controller,
  type ExecutionContext,
  HttpCode,
  Inject,
  Injectable,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { parse } from "csv-parse/sync";
import type { Request } from "express";
import { slugify } from "../common/slug";
import { CONFIG, type AppConfig } from "../config";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { events, policyItems } from "../db/schema";

@Injectable()
class AdminKeyGuard implements CanActivate {
  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}
  canActivate(ctx: ExecutionContext): boolean {
    const given = Buffer.from(String(ctx.switchToHttp().getRequest<Request>().headers["x-admin-key"] ?? ""));
    const expected = Buffer.from(this.config.ADMIN_API_KEY);
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw new UnauthorizedException();
    return true;
  }
}

/** Accepts dd/mm/yyyy (en-IN sheet export) or yyyy-mm-dd. */
export function toIsoDate(v: string | undefined): string | null {
  const s = (v ?? "").trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  throw new BadRequestException(`Unrecognised date "${s}". Use YYYY-MM-DD or DD/MM/YYYY.`);
}

/** "[Name](https://…)" or a bare URL → { name, url }. */
export function parseSource(v: string | undefined): { name: string | null; url: string | null } {
  const s = (v ?? "").trim();
  const md = s.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
  if (md) return { name: md[1], url: md[2] };
  if (/^https?:\/\//.test(s)) return { name: new URL(s).hostname, url: s };
  return { name: s || null, url: null };
}

function rows(csv: unknown): Record<string, string>[] {
  if (typeof csv !== "string" || !csv.trim()) throw new BadRequestException("Send the CSV as text/csv in the body.");
  return parse(csv, { columns: true, skip_empty_lines: true, trim: true, bom: true });
}

/**
 * CSV imports from the tracker sheets (Events Tracker → "Events", Policy Newsroom → "Newsroom").
 * Download each sheet as CSV and POST it here with the x-admin-key header. Rows are upserted by slug.
 */
@Controller("admin/import")
@UseGuards(AdminKeyGuard)
export class AdminController {
  constructor(@Inject(DB) private readonly db: Db) {}

  @Post("events")
  @HttpCode(200)
  async importEvents(@Body() csv: unknown) {
    let n = 0;
    for (const r of rows(csv)) {
      if (!r["Event"]) continue;
      const src = parseSource(r["Source"]);
      const start = toIsoDate(r["Start"]);
      const deadline = toIsoDate(r["Key deadline"]);
      const row = {
        slug: slugify(`${r["Event"]} ${start ?? deadline ?? ""}`),
        name: r["Event"],
        startDate: start,
        endDate: toIsoDate(r["End"]),
        city: r["City / venue"] || null,
        country: r["Country"] || "—",
        scope: r["Scope"] || "India",
        type: r["Type"] || "Other",
        status: r["Status"] || "To verify",
        deadline,
        bestFor: r["Best for"] || null,
        notes: r["Cost & notes"] || null,
        sourceUrl: src.url,
        sourceName: src.name,
        lastChecked: toIsoDate(r["Last checked"]),
      };
      const { slug: _s, ...set } = row;
      await this.db.insert(events).values(row).onConflictDoUpdate({ target: events.slug, set });
      n++;
    }
    return { imported: n };
  }

  @Post("policy")
  @HttpCode(200)
  async importPolicy(@Body() csv: unknown) {
    let n = 0;
    for (const r of rows(csv)) {
      if (!r["Headline"]) continue;
      const src = parseSource(r["Source"]);
      if (!src.url) throw new BadRequestException(`Row "${r["Headline"]}" has no source link.`);
      const date = toIsoDate(r["Date"]);
      if (!date) throw new BadRequestException(`Row "${r["Headline"]}" has no date.`);
      const row = {
        slug: slugify(`${date} ${r["Headline"]}`),
        date,
        headline: r["Headline"],
        country: r["Country / bloc"] || "—",
        level: r["Level"] || "National",
        instrument: r["Instrument"] || "Programme",
        stage: r["Policy stage"] || "Live",
        impact: r["Impact"] || "Medium",
        amount: r["Amount"] || null,
        takeaway: r["What it means for founders"] || "",
        sourceUrl: src.url,
        sourceName: src.name ?? "Source",
      };
      const { slug: _s, ...set } = row;
      await this.db.insert(policyItems).values(row).onConflictDoUpdate({ target: policyItems.slug, set });
      n++;
    }
    return { imported: n };
  }
}
