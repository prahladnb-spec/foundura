import { Inject, Injectable } from "@nestjs/common";
import { desc } from "drizzle-orm";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { auditLog } from "../db/schema";
import type { AdminActor } from "./admin.guard";

@Injectable()
export class AuditService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async record(actor: AdminActor, action: string, targetType: string, targetId: string, detail?: Record<string, unknown>) {
    await this.db.insert(auditLog).values({
      actorId: actor.actorId,
      actorLabel: actor.label,
      action,
      targetType,
      targetId,
      detail: detail ?? null,
    });
  }

  recent(limit = 100) {
    return this.db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
  }
}
