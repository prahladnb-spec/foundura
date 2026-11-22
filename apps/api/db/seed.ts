import { slugify } from "../src/common/slug";
import { createDb } from "../src/db/client";
import { articles, events, policyItems, schemes } from "../src/db/schema";
import { ARTICLES } from "./seed-data/articles";
import { EVENTS } from "./seed-data/events";
import { POLICY } from "./seed-data/policy";
import { SCHEMES } from "./seed-data/schemes";

/** Re-runnable: upserts by slug. An editor's lastVerifiedAt on a scheme is preserved. */
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
    const { slug: _slug, ...update } = row;
    await db.insert(schemes).values(row).onConflictDoUpdate({ target: schemes.slug, set: update });
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
      lastChecked: "2026-11-22",
    };
    const { slug: _slug, ...update } = row;
    await db.insert(events).values(row).onConflictDoUpdate({ target: events.slug, set: update });
  }

  for (const p of POLICY) {
    const row = { slug: slugify(`${p.date} ${p.headline}`), ...p, amount: p.amount ?? null };
    const { slug: _slug, ...update } = row;
    await db.insert(policyItems).values(row).onConflictDoUpdate({ target: policyItems.slug, set: update });
  }

  for (const a of ARTICLES) {
    const { slug: _slug, ...update } = a;
    await db.insert(articles).values(a).onConflictDoUpdate({ target: articles.slug, set: update });
  }

  console.log(
    `Seeded ${SCHEMES.length} schemes, ${EVENTS.length} events, ${POLICY.length} policy items, ${ARTICLES.length} articles.`,
  );
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
