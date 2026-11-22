import { slugify } from "../src/common/slug";
import { createDb } from "../src/db/client";
import { articles, events, policyItems, schemes } from "../src/db/schema";
import { ARTICLES } from "./seed-data/articles";
import { EVENTS } from "./seed-data/events";
import { POLICY } from "./seed-data/policy";
import { SCHEMES } from "./seed-data/schemes";
import { SCHEMES_HI } from "./seed-data/schemes-hi";
import { sql } from "drizzle-orm";
import { englishFingerprint } from "../src/schemes/localize";

/**
 * Re-runnable. By default only adds items that aren't in the database yet, so editors' changes made
 * in the admin console are never overwritten. `--overwrite` replaces existing rows with the seed
 * files (local development only); an editor's lastVerifiedAt on a scheme is kept either way.
 */
const OVERWRITE = process.argv.includes("--overwrite");

async function main() {
  const { db, pool } = createDb();

  for (const s of SCHEMES) {
    const row = {
      slug: s.slug,
      name: s.name,
      issuer: s.issuer,
      level: s.level,
      state: s.state ?? null,
      category: s.category,
      summary: s.summary,
      benefits: s.benefits,
      howToApply: s.howToApply,
      rule: s.rule,
      alsoCheck: s.alsoCheck,
      status: s.status,
      statusNote: s.statusNote ?? null,
      sourceUrl: s.sourceUrl,
      sourceName: s.sourceName,
    };
    // Hindi draft, stamped with the English it was written for.
    const draft = SCHEMES_HI[s.slug];
    const hi = draft ? { ...draft, sourceHash: englishFingerprint(row), updatedAt: new Date().toISOString() } : null;
    const { slug: _slug, ...update } = row;
    const q = db.insert(schemes).values({ ...row, translations: hi ? { hi } : {} });
    await (OVERWRITE ? q.onConflictDoUpdate({ target: schemes.slug, set: update }) : q.onConflictDoNothing());
    // Existing schemes without Hindi get the draft (never replacing an editor's translation).
    if (hi) {
      await db
        .update(schemes)
        .set({ translations: sql`${schemes.translations} || ${JSON.stringify({ hi })}::jsonb` })
        .where(sql`${schemes.slug} = ${s.slug} and not (${schemes.translations} ? 'hi')`);
    }
  }

  for (const e of EVENTS) {
    const row = {
      slug: slugify(`${e.name} ${e.startDate ?? e.deadline ?? ""}`),
      name: e.name,
      startDate: e.startDate ?? null,
      endDate: e.endDate ?? null,
      city: e.city ?? null,
      country: e.country,
      scope: e.scope,
      type: e.type,
      status: e.status,
      deadline: e.deadline ?? null,
      bestFor: e.bestFor ?? null,
      notes: e.notes ?? null,
      sourceUrl: e.sourceUrl ?? null,
      sourceName: e.sourceName ?? null,
      format: e.format ?? "In person",
      lastChecked: "2026-11-22",
    };
    const { slug: _slug, ...update } = row;
    const q = db.insert(events).values(row);
    await (OVERWRITE ? q.onConflictDoUpdate({ target: events.slug, set: update }) : q.onConflictDoNothing());
  }

  for (const p of POLICY) {
    const row = { slug: slugify(`${p.date} ${p.headline}`), ...p, amount: p.amount ?? null };
    const { slug: _slug, ...update } = row;
    const q = db.insert(policyItems).values(row);
    await (OVERWRITE ? q.onConflictDoUpdate({ target: policyItems.slug, set: update }) : q.onConflictDoNothing());
  }

  for (const a of ARTICLES) {
    const { slug: _slug, ...update } = a;
    const q = db.insert(articles).values(a);
    await (OVERWRITE ? q.onConflictDoUpdate({ target: articles.slug, set: update }) : q.onConflictDoNothing());
  }

  console.log(
    `${OVERWRITE ? "Seeded (overwriting)" : "Seeded (new items only)"}: checked ${SCHEMES.length} schemes, ${EVENTS.length} events, ${POLICY.length} policy items, ${ARTICLES.length} articles.`,
  );
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
