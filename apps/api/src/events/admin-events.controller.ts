import { Body, Controller, Delete, Get, HttpCode, Inject, NotFoundException, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { eventReviewSchema, eventSourceSchema } from "@foundura/shared";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { Admin, type AdminActor, AdminGuard } from "../admin/admin.guard";
import { AuditService } from "../admin/audit.service";
import { parseBody } from "../common/zod";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { eventSources, events } from "../db/schema";
import { EventSyncService } from "./event-sync.service";

/** Event sources and the review queue for imported events. Editors only. */
@Controller("admin")
@UseGuards(AdminGuard)
export class AdminEventsController {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(EventSyncService) private readonly sync: EventSyncService,
  ) {}

  @Get("event-sources")
  listSources() {
    return this.db.select().from(eventSources).orderBy(asc(eventSources.name));
  }

  @Post("event-sources")
  async addSource(@Admin() actor: AdminActor, @Body() body: unknown) {
    const input = parseBody(eventSourceSchema, body);
    const [row] = await this.db.insert(eventSources).values(input).onConflictDoNothing().returning();
    if (!row) throw new NotFoundException("A source with that address already exists.");
    await this.audit.record(actor, "event_source.add", "event_source", row.id, { name: row.name });
    return row;
  }

  @Patch("event-sources/:id")
  async editSource(@Admin() actor: AdminActor, @Param("id") id: string, @Body() body: unknown) {
    const input = parseBody(eventSourceSchema.partial(), body);
    if (Object.keys(input).length === 0) {
      const [current] = await this.db.select().from(eventSources).where(eq(eventSources.id, id)).limit(1);
      if (!current) throw new NotFoundException();
      return current;
    }
    const [row] = await this.db.update(eventSources).set(input).where(eq(eventSources.id, id)).returning();
    if (!row) throw new NotFoundException();
    await this.audit.record(actor, "event_source.edit", "event_source", id, { name: row.name });
    return row;
  }

  @Delete("event-sources/:id")
  @HttpCode(204)
  async removeSource(@Admin() actor: AdminActor, @Param("id") id: string) {
    const [row] = await this.db.delete(eventSources).where(eq(eventSources.id, id)).returning({ id: eventSources.id, name: eventSources.name });
    if (!row) throw new NotFoundException();
    // Events already imported stay; they just lose their link to the source.
    await this.audit.record(actor, "event_source.remove", "event_source", id, { name: row.name });
  }

  /** Read one source now instead of waiting for the daily run. */
  @Post("event-sources/:id/sync")
  @HttpCode(200)
  async syncNow(@Admin() actor: AdminActor, @Param("id") id: string) {
    const [source] = await this.db.select().from(eventSources).where(eq(eventSources.id, id)).limit(1);
    if (!source) throw new NotFoundException();
    const result = await this.sync.syncSource(source);
    await this.audit.record(actor, "event_source.sync", "event_source", id, { name: source.name });
    return result;
  }

  /** Imported events waiting for an editor: unpublished, or published but not yet confirmed. */
  @Get("events/review")
  reviewQueue() {
    return this.db
      .select({ event: events, sourceName: eventSources.name })
      .from(events)
      .innerJoin(eventSources, eq(events.sourceId, eventSources.id))
      .where(or(eq(events.published, false), and(eq(events.status, "To verify"))))
      .orderBy(desc(events.published), asc(events.startDate))
      .limit(200);
  }

  @Post("events/:id/review")
  @HttpCode(200)
  async review(@Admin() actor: AdminActor, @Param("id") id: string, @Body() body: unknown) {
    const { action } = parseBody(eventReviewSchema, body);
    const set = action === "hide" ? { published: false } : action === "confirm" ? { published: true, status: "Confirmed" } : { published: true };
    const [row] = await this.db.update(events).set(set).where(eq(events.id, id)).returning({ id: events.id, name: events.name });
    if (!row) throw new NotFoundException();
    await this.audit.record(actor, `event.${action}`, "event", id, { name: row.name });
    return { id: row.id, ...set };
  }
}
