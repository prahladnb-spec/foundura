import { Inject, Injectable } from "@nestjs/common";
import { CONSENT_PURPOSES, type ConsentPurpose, PRIVACY_NOTICE_VERSION } from "@foundura/shared";
import { asc, eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { consents } from "../db/schema";

export interface ConsentState {
  purpose: ConsentPurpose;
  label: string;
  description: string;
  required: boolean;
  granted: boolean;
  updatedAt: string | null;
}

@Injectable()
export class ConsentService {
  constructor(@Inject(DB) private readonly db: Db) {}

  /** Full ledger, oldest first. */
  async history(userId: string) {
    return this.db.select().from(consents).where(eq(consents.userId, userId)).orderBy(asc(consents.createdAt));
  }

  /** Current decision per purpose (latest ledger row wins; no row = not granted). */
  async current(userId: string): Promise<ConsentState[]> {
    const rows = await this.history(userId);
    const latest = new Map<string, (typeof rows)[number]>();
    for (const r of rows) latest.set(r.purpose, r);
    return CONSENT_PURPOSES.map((p) => {
      const r = latest.get(p.value);
      return {
        purpose: p.value,
        label: p.label,
        description: p.description,
        required: p.required,
        granted: r?.granted ?? false,
        updatedAt: r ? r.createdAt.toISOString() : null,
      };
    });
  }

  async isGranted(userId: string, purpose: ConsentPurpose): Promise<boolean> {
    return (await this.current(userId)).find((c) => c.purpose === purpose)?.granted ?? false;
  }

  /** Append a decision to the ledger. */
  async record(userId: string, purpose: ConsentPurpose, granted: boolean, opts: { onlyIfChanged?: boolean } = {}) {
    if (opts.onlyIfChanged && (await this.isGranted(userId, purpose)) === granted) return;
    await this.db.insert(consents).values({ userId, purpose, granted, noticeVersion: PRIVACY_NOTICE_VERSION });
  }
}
