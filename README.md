# Foundura

India's founder launchpad. Phase 1 MVP:

- **Scheme Scan**: answer a few questions and see which central and state government schemes a startup qualifies for, with the exact conditions met, not met, or still to confirm. Anonymous scans are never stored.
- **Startup profile** (Passport v1): sign in with an emailed one-time code, save a profile, re-run the scan any time, and optionally publish a public profile (financial figures always stay private).
- **Events**, **Policy news** and **Founder guides**, fed from the tracker sheets and the daily content engine.
- **Privacy by design** (DPDP Act 2023 / GDPR): consent ledger, self-service data export and account deletion, hashed sign-in codes, minimal data.

Foundura never handles money.

## Stack

| Part | Tech |
| --- | --- |
| Web | Next.js 15 (App Router), React 19, Tailwind CSS 4, Anek Latin + Mukta fonts |
| API | NestJS 11, Drizzle ORM, PostgreSQL 16, zod |
| Shared | `@foundura/shared`: eligibility rules engine, schemas, reference lists |
| Tooling | pnpm workspaces, Turborepo, Vitest, GitHub Actions |

```
apps/api       NestJS API (/v1)
  src/db         Drizzle schema + client
  drizzle/       SQL migrations
  db/seed-data   starter schemes, events, policy news, articles
apps/web       Next.js site
packages/shared  rules engine + schemas used by both
```

## Run it locally

Needs Node 22+, pnpm 10 and PostgreSQL 16 (or Docker).

```bash
pnpm install
docker compose up -d            # or use a local Postgres with user/db "foundura"
cp .env.example apps/api/.env   # edit secrets
cp .env.example apps/web/.env.local
pnpm --filter @foundura/shared build
pnpm db:migrate
pnpm db:seed
pnpm dev                        # API on :4000, web on :3000
```

With `OTP_DELIVERY=dev`, the sign-in code is shown on screen instead of emailed. Production requires `OTP_DELIVERY=email` and a `RESEND_API_KEY`.

## Tests

```bash
createdb -O foundura foundura_test   # once
pnpm test
```

- `packages/shared`: rules engine (three-valued logic, deep-tech extensions, sector matching).
- `apps/api`: scheme catalogue sanity checks, plus end-to-end tests over HTTP against a real database: scan, sign-in with consent, profile, scan from profile, public profile privacy, consent withdrawal, data export, erasure, admin CSV import.

## How schemes work

Each scheme has a JSON rule tree (`all` / `any` / fact conditions with plain-language labels). The engine returns **eligible** only when every condition is met, **maybe** when an answer is missing, and **not eligible** when any condition fails. It never guesses. Conditions the scan can't test go in `alsoCheck`.

**Before launch, an editor must check every scheme against its official source and set `last_verified_at`.** Until then the site tells users to confirm on the official page.

## Importing from the tracker sheets

Download the Events Tracker ("Events" tab) or Policy Newsroom ("Newsroom" tab) as CSV, then:

```bash
curl -X POST http://localhost:4000/v1/admin/import/events \
  -H "x-admin-key: $ADMIN_API_KEY" -H "Content-Type: text/csv" --data-binary @events.csv
curl -X POST http://localhost:4000/v1/admin/import/policy \
  -H "x-admin-key: $ADMIN_API_KEY" -H "Content-Type: text/csv" --data-binary @newsroom.csv
```

Rows are upserted, so re-importing is safe.

## API overview (`/v1`)

| Route | What it does |
| --- | --- |
| `POST /scan` | Anonymous Scheme Scan |
| `GET /schemes`, `/schemes/:slug` | Scheme catalogue |
| `GET /events`, `/policy`, `/articles`, `/articles/:slug` | Content |
| `GET /startups/:slug` | Public startup profile |
| `POST /auth/request-otp`, `/auth/verify-otp` | Sign in |
| `GET /me`, `/me/export`; `DELETE /me` | Account, data export, erasure |
| `POST /me/startups`, `PATCH/DELETE /me/startups/:id`, `GET /me/startups/:id/scan` | Startup profile |
| `GET/POST /me/consents` | Consent ledger |
| `POST /admin/import/events`, `/admin/import/policy` | CSV import (admin key) |

## Next up (from the roadmap)

Verified badges (MCA, GST, DigiLocker, Account Aggregator), investor profiles and matching, Hindi and regional languages, events crawler, WhatsApp alerts, embeddable Scheme Scan widget, MedTech sector hub.
