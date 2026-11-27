import { createHash } from "node:crypto";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { STORY_CONSENT_VERSION, type StoryConfirmation, type StoryInput } from "@foundura/shared";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type { Db } from "../db/client";
import { DB } from "../db/db.module";
import { stories, storyConsents, startups } from "../db/schema";
import { StartupsService } from "../startups/startups.service";

type Story = typeof stories.$inferSelect;

/** Fingerprint of what the founder agreed to publish: the title, their name and role, and the text. */
export const storyHash = (s: Pick<Story, "title" | "body" | "founderName" | "founderRole">) =>
  createHash("sha256").update(JSON.stringify([s.title, s.founderName, s.founderRole ?? "", s.body])).digest("hex");

const EDITABLE = new Set(["draft", "returned", "withdrawn"]);

/** What the founder sees on "My startup". */
const mine = (s: Story) => ({
  id: s.id,
  slug: s.slug,
  title: s.title,
  body: s.body,
  founderName: s.founderName,
  founderRole: s.founderRole,
  lang: s.lang,
  status: s.status,
  editorNote: s.editorNote,
  submittedAt: s.submittedAt,
  publishedAt: s.publishedAt,
  withdrawnAt: s.withdrawnAt,
  updatedAt: s.updatedAt,
});

/**
 * Founder stories. The founder writes and submits; submitting records every confirmation against a
 * fingerprint of the exact text. An editor can publish only while that consent still matches the
 * text, or send the story back with a note. The founder can withdraw at any time, which takes it
 * off the site at once and is recorded in the ledger.
 */
@Injectable()
export class StoriesService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(StartupsService) private readonly startups: StartupsService,
  ) {}

  private async row(startupId: string) {
    const [s] = await this.db.select().from(stories).where(eq(stories.startupId, startupId)).limit(1);
    return s;
  }

  /** The latest ledger row for a story. */
  private async latestConsent(storyId: string) {
    const [c] = await this.db.select().from(storyConsents).where(eq(storyConsents.storyId, storyId)).orderBy(desc(storyConsents.createdAt)).limit(1);
    return c;
  }

  async get(ownerId: string, startupId: string) {
    await this.startups.getMine(ownerId, startupId);
    const s = await this.row(startupId);
    return { story: s ? mine(s) : null };
  }

  /** Save the text. Only drafts, returned and withdrawn stories can change; a change needs a new submission. */
  async save(ownerId: string, startupId: string, input: StoryInput) {
    const startup = await this.startups.getMine(ownerId, startupId);
    const s = await this.row(startupId);
    if (!s) {
      const [made] = await this.db.insert(stories).values({ startupId, slug: startup.slug, ...input, status: "draft" }).returning();
      return { story: mine(made) };
    }
    if (!EDITABLE.has(s.status)) throw new ConflictException("Withdraw the story before you change it.");
    const [row] = await this.db.update(stories).set({ ...input, status: s.status === "returned" ? "returned" : "draft" }).where(eq(stories.id, s.id)).returning();
    return { story: mine(row) };
  }

  /** Send for review, recording each confirmation against the exact text. */
  async submit(ownerId: string, startupId: string, confirmations: StoryConfirmation[]) {
    await this.startups.getMine(ownerId, startupId);
    const s = await this.row(startupId);
    if (!s) throw new NotFoundException("Save the story first.");
    if (!EDITABLE.has(s.status)) throw new ConflictException("This story is already with the editors or published.");
    await this.db.insert(storyConsents).values({
      storyId: s.id,
      userId: ownerId,
      action: "given",
      confirmations: [...new Set(confirmations)],
      textHash: storyHash(s),
      statementVersion: STORY_CONSENT_VERSION,
    });
    const [row] = await this.db.update(stories).set({ status: "submitted", submittedAt: new Date(), editorNote: null, withdrawnAt: null }).where(eq(stories.id, s.id)).returning();
    return { story: mine(row) };
  }

  /** Take consent back: the story leaves the site at once (or leaves the review queue). */
  async withdraw(ownerId: string, startupId: string) {
    await this.startups.getMine(ownerId, startupId);
    const s = await this.row(startupId);
    if (!s) throw new NotFoundException();
    if (s.status !== "submitted" && s.status !== "published") throw new ConflictException("This story isn't submitted or published.");
    await this.db.insert(storyConsents).values({ storyId: s.id, userId: ownerId, action: "withdrawn", textHash: storyHash(s), statementVersion: STORY_CONSENT_VERSION });
    const [row] = await this.db.update(stories).set({ status: "withdrawn", withdrawnAt: new Date() }).where(eq(stories.id, s.id)).returning();
    return { story: mine(row) };
  }

  /** Delete the story and its consent history. */
  async remove(ownerId: string, startupId: string) {
    await this.startups.getMine(ownerId, startupId);
    await this.db.delete(stories).where(eq(stories.startupId, startupId));
  }

  /** For the data export: each story with its full consent history. */
  async exportFor(startupIds: string[]) {
    if (!startupIds.length) return [];
    const rows = await this.db.select().from(stories).where(inArray(stories.startupId, startupIds));
    return Promise.all(
      rows.map(async (s) => ({
        startupId: s.startupId,
        ...mine(s),
        consentHistory: (await this.db.select().from(storyConsents).where(eq(storyConsents.storyId, s.id)).orderBy(asc(storyConsents.createdAt))).map((c) => ({
          action: c.action,
          confirmations: c.confirmations,
          statementVersion: c.statementVersion,
          textFingerprint: c.textHash,
          at: c.createdAt,
        })),
      })),
    );
  }

  // ----- public -----

  private publicView(s: Story, startup: { name: string; slug: string; isPublic: boolean; showcaseHiddenAt: Date | null }) {
    return {
      slug: s.slug,
      title: s.title,
      body: s.body,
      founderName: s.founderName,
      founderRole: s.founderRole,
      lang: s.lang,
      publishedAt: s.publishedAt,
      startup: { name: startup.name, slug: startup.isPublic && !startup.showcaseHiddenAt ? startup.slug : null },
    };
  }

  private publishedQuery() {
    return this.db
      .select({ s: stories, startup: { name: startups.name, slug: startups.slug, isPublic: startups.isPublic, showcaseHiddenAt: startups.showcaseHiddenAt } })
      .from(stories)
      .innerJoin(startups, eq(startups.id, stories.startupId));
  }

  async listPublished() {
    const rows = await this.publishedQuery().where(eq(stories.status, "published")).orderBy(desc(stories.publishedAt));
    return rows.map((r) => {
      const v = this.publicView(r.s, r.startup);
      return { ...v, body: undefined, excerpt: r.s.body.split(/\n\s*\n/)[0].slice(0, 280) };
    });
  }

  async getPublished(slug: string) {
    const [r] = await this.publishedQuery().where(and(eq(stories.slug, slug), eq(stories.status, "published"))).limit(1);
    if (!r) throw new NotFoundException("No published story here.");
    return this.publicView(r.s, r.startup);
  }

  // ----- editors -----

  async adminList() {
    const rows = await this.db
      .select({ s: stories, startupName: startups.name })
      .from(stories)
      .innerJoin(startups, eq(startups.id, stories.startupId))
      .where(inArray(stories.status, ["submitted", "published", "returned", "withdrawn"]))
      .orderBy(desc(stories.updatedAt));
    return Promise.all(
      rows.map(async (r) => {
        const c = await this.latestConsent(r.s.id);
        return {
          ...mine(r.s),
          startupName: r.startupName,
          consent: c ? { action: c.action, confirmations: c.confirmations, statementVersion: c.statementVersion, at: c.createdAt, matchesText: c.textHash === storyHash(r.s) } : null,
        };
      }),
    );
  }

  /** Publish: only a submitted story whose latest consent is "given" for exactly this text. */
  async publish(id: string) {
    const [s] = await this.db.select().from(stories).where(eq(stories.id, id)).limit(1);
    if (!s) throw new NotFoundException();
    if (s.status !== "submitted") throw new ConflictException("Only a submitted story can be published.");
    const c = await this.latestConsent(s.id);
    if (!c || c.action !== "given" || c.textHash !== storyHash(s)) throw new BadRequestException("The founder's consent doesn't cover this text; send it back.");
    const [row] = await this.db.update(stories).set({ status: "published", publishedAt: s.publishedAt ?? new Date(), editorNote: null }).where(eq(stories.id, id)).returning();
    return mine(row);
  }

  /** Send back to the founder with a note (before publishing), or take a published story down (after a complaint). */
  async sendBack(id: string, note: string) {
    const [s] = await this.db.select().from(stories).where(eq(stories.id, id)).limit(1);
    if (!s) throw new NotFoundException();
    if (s.status !== "submitted" && s.status !== "published") throw new ConflictException("Only a submitted or published story can be sent back.");
    const [row] = await this.db.update(stories).set({ status: "returned", editorNote: note }).where(eq(stories.id, id)).returning();
    return mine(row);
  }
}

