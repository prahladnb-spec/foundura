# Foundura: notes for working in this repo

- Monorepo: pnpm + Turborepo. Build `@foundura/shared` before the apps (`pnpm --filter @foundura/shared build`).
- API: NestJS 11 + Drizzle (not Prisma). Schema in `apps/api/src/db/schema.ts`; after changing it run `pnpm --filter @foundura/api db:generate` and commit the new SQL in `apps/api/drizzle/`.
- Use explicit `@Inject(...)` in Nest constructors; tests run through Vitest with SWC.
- Validate request bodies with the shared zod schemas via `parseBody`.
- Scheme rules are JSON `Condition` trees from `@foundura/shared`. Never add a fact the scan doesn't collect; `test/schemes-seed.test.ts` enforces this. New schemes ship with `last_verified_at = null` until an editor checks the official source.
- Privacy rules: don't store anonymous scan answers, don't expose turnover/funding/shareholding publicly, record consent changes as new ledger rows, and keep `/me/export` and `DELETE /me` complete when adding tables with personal data.
- The platform never handles money.
- Web copy: sentence case, plain words, no all-caps labels. Design tokens live in `apps/web/src/app/globals.css`.
- Tests: `pnpm test` (needs Postgres; e2e uses `TEST_DATABASE_URL`, default `foundura_test`).
