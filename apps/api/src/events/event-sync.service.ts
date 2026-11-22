import { randomBytes } from "node:crypto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { and, asc, eq } from "drizzle-orm";
import { slugify } from "../common/slug";
import { todayInIndia } from "../common/zod";
import { CONFIG, type AppConfig } from "../config";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { eventSources, events } from "../db/schema";
import { cityAndCountry, type ParsedEvent, parseIcs, parseJsonLdEvents } from "./parse";
import { safeFetchText } from "./safe-fetch";

type Source = typeof eventSources.$inferSelect;
export interface SyncResult {
  found: number;
  added: number;
  updated: number;
  unchanged: number;
  skipped: number;
}

const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
/** How far ahead imported events may be: about 18 months. */
const HORIZON_DAYS = 550;
/** At most this many events are read from one source per run. */
const MAX_PER_SOURCE = 500;

/**
 * Reads events from editors' sources and keeps the events table in step with them. New events from
 * untrusted sources arrive unpublished and "To verify"; trusted sources publish as "Confirmed". When a
 * source changes an event's dates, the event is updated, and an untrusted one goes back to "To verify".
 * Events that disappear from a source are left alone (feeds often drop past or sold-out events).
 */
@Injectable()
export class EventSyncService {
  private readonly log = new Logger(EventSyncService.name);

  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  async syncAll(today = todayInIndia()): Promise<{ sources: number; failed: number }> {
    const list = await this.db.select().from(eventSources).where(eq(eventSources.active, true)).orderBy(asc(eventSources.createdAt));
    let failed = 0;
    for (const s of list) {
      const r = await this.syncSource(s, today);
      if ("error" in r) failed++;
    }
    return { sources: list.length, failed };
  }

  async syncSource(source: Source, today = todayInIndia()): Promise<SyncResult | { error: string }> {
    try {
      const body = await safeFetchText(source.url, { allowPrivate: this.config.EVENT_SYNC_ALLOW_PRIVATE });
      const parsed = (source.kind === "ics" ? parseIcs(body) : parseJsonLdEvents(body, source.url)).slice(0, MAX_PER_SOURCE);
      const r = await this.apply(source, parsed, today);
      const summary = `Found ${r.found}: ${r.added} new, ${r.updated} updated, ${r.unchanged} unchanged${r.skipped ? `, ${r.skipped} past or too far ahead` : ""}.`;
      await this.db.update(eventSources).set({ lastFetchedAt: new Date(), lastResult: summary, lastError: null }).where(eq(eventSources.id, source.id));
      return r;
    } catch (e) {
      const error = (e as Error).message.slice(0, 300);
      this.log.warn(`Event source "${source.name}" failed: ${error}`);
      await this.db.update(eventSources).set({ lastFetchedAt: new Date(), lastError: error }).where(eq(eventSources.id, source.id));
      return { error };
    }
  }

  private async apply(source: Source, parsed: ParsedEvent[], today: string): Promise<SyncResult> {
    const r: SyncResult = { found: parsed.length, added: 0, updated: 0, unchanged: 0, skipped: 0 };
    const earliest = addDays(today, -1);
    const latest = addDays(today, HORIZON_DAYS);
    const scope = source.scope === "India" ? "India" : "Global";
    for (const p of parsed) {
      if ((p.endDate ?? p.startDate) < earliest || p.startDate > latest) {
        r.skipped++;
        continue;
      }
      const { city, country } = cityAndCountry(p.location, scope);
      const fields = {
        name: p.name,
        startDate: p.startDate,
        endDate: p.endDate,
        city,
        country: p.format === "Online" ? "Online" : country,
        format: p.format,
        sourceUrl: p.url ?? source.url,
        sourceName: source.name,
        lastChecked: today,
      };
      const [existing] = await this.db
        .select()
        .from(events)
        .where(and(eq(events.sourceId, source.id), eq(events.externalId, p.externalId)))
        .limit(1);
      if (!existing) {
        await this.db.insert(events).values({
          ...fields,
          slug: `${slugify(p.name).slice(0, 60) || "event"}-${p.startDate.slice(0, 7)}-${randomBytes(2).toString("hex")}`,
          scope,
          type: source.defaultType,
          status: p.cancelled ? "Cancelled" : source.trusted ? "Confirmed" : "To verify",
          published: source.trusted,
          sourceId: source.id,
          externalId: p.externalId,
        });
        r.added++;
        continue;
      }
      const datesChanged = existing.startDate !== fields.startDate || existing.endDate !== fields.endDate;
      const changed = datesChanged || existing.name !== fields.name || existing.city !== fields.city || existing.format !== fields.format || (p.cancelled && existing.status !== "Cancelled");
      if (!changed) {
        await this.db.update(events).set({ lastChecked: today }).where(eq(events.id, existing.id));
        r.unchanged++;
        continue;
      }
      const status = p.cancelled ? "Cancelled" : datesChanged && !source.trusted ? "To verify" : existing.status === "Cancelled" ? "To verify" : existing.status;
      await this.db.update(events).set({ ...fields, status }).where(eq(events.id, existing.id));
      r.updated++;
    }
    return r;
  }
}
