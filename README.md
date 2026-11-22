# Foundura

India's founder launchpad. Phase 1 MVP:

- **Scheme Scan**: answer a few questions and see which central and state government schemes a startup qualifies for, with the exact conditions met, not met, or still to confirm. Anonymous scans are never stored.
- **Startup profile** (Passport v1): sign in with an emailed one-time code, save a profile, re-run the scan any time, and optionally publish a public profile (financial figures always stay private).
- **Investor Connect**: investors list their focus and cheque size; founders get a **Readiness Score** (0–100 with a fix list) and ranked matches with reasons; intro requests open only at readiness ≥ 50 and match ≥ 40, with at most 10 pending; contact emails are revealed only when the investor accepts. Startups are visible to investors only if the founder made the profile public **and** switched on investor visibility.
- **Embeddable Scheme Scan**: partners paste one `<script>` tag (see `/partners`). Only `/embed/*` may be framed; the rest of the site sends `X-Frame-Options: DENY`.
- **Editor console** (`/admin`): check schemes against their official source, edit rules with validation and a plain-language preview, verify or hide investors, write and publish articles with a live preview, import the tracker sheets, and see an audit log of every change.
- **Email notifications**: investors hear about new intro requests and founders hear when one is accepted or declined. Emails carry only names and a link; details stay on Foundura.
- **Weekly scheme alerts**: founders who turn on alerts get one email a week, and only when something is new for them: schemes they now qualify for, changes to their schemes, deadlines in the next two weeks, the week's policy news and new guides. One-click unsubscribe (including mail apps' built-in button) is recorded in the consent ledger.
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

With `OTP_DELIVERY=dev`, the sign-in code is shown on screen instead of emailed.

`pnpm db:seed` only adds items that aren't in the database yet, so it never undoes editors' changes. To reset your local catalogue to the seed files, run `pnpm --filter @foundura/api db:seed -- --overwrite`.

## Deploy

See [DEPLOY.md](DEPLOY.md): Docker images for the API and web, a one-server production stack with automatic HTTPS (Caddy), migrations on every deploy, backups and monitoring. The API refuses to start with unsafe production settings and tells you what to fix.

Before opening to the public, work through [docs/launch-checklist.md](docs/launch-checklist.md) (domain and email, DPDP and CERT-In items, scheme checks, search setup, final walkthrough).

The site publishes `/sitemap.xml`, `/robots.txt`, share images for every page, scheme and guide, and structured data for schemes, guides and confirmed events. `/api/health` checks the web app, API and database together for uptime monitors.

## Tests

```bash
createdb -O foundura foundura_test   # once
pnpm test
```

- `packages/shared`: rules engine (three-valued logic, deep-tech extensions, sector matching).
- `packages/shared`: also readiness scoring and match scoring.
- `apps/api`: scheme catalogue sanity checks, plus end-to-end tests over HTTP against a real database: scan, sign-in with consent, profile, scan from profile, public profile privacy, consent withdrawal, data export, erasure, the editor console (access rules, rule validation, scheme check dates, article publishing, investor review, audit log, notification emails), weekly scheme alerts (opt-in only, once a week, nothing-new skip, updated schemes and deadlines, unsubscribe and export) and the full Investor Connect flow (readiness gate, matching, consent-gated visibility, duplicate and focus checks, accept reveals contacts, export and cascade on erasure).

## How schemes work

Each scheme has a JSON rule tree (`all` / `any` / fact conditions with plain-language labels). The engine returns **eligible** only when every condition is met, **maybe** when an answer is missing, and **not eligible** when any condition fails. It never guesses. Conditions the scan can't test go in `alsoCheck`.

**Before launch, an editor must check every scheme against its official source** in the editor console (`/admin/schemes`). Until a scheme is checked the site tells users to confirm on the official page. Any later edit clears the check date unless the editor ticks “I checked these details against the official source today” in the same save.

## Editor console

Add editor emails to `ADMIN_EMAILS` (comma-separated), then sign in at `/signin` as usual and open `/admin`. Everyone else gets a 403. Scripts, such as the scheduled sheet imports, can use the `x-admin-key` header instead. Every change goes into `audit_log` with the editor's user id (set to null if that account is deleted), never their email.

Rules are validated by `conditionSchema` in `@foundura/shared`, which only accepts facts in `FACT_KEYS` (the answers the Scheme Scan collects). The seed test checks that every seeded scheme passes the same validation.

## Weekly scheme alerts

Set `DIGEST_AUTO_SEND=true` on the API server and it sends on Mondays from 8:00 India time. Editors can preview the email and send it by hand at `/admin/alerts`, and scripts can call `POST /v1/admin/digest/send` with the admin key. Running it twice is safe: each founder gets at most one email per week (`digest_sends` has one row per person per week, claimed before sending). That table keeps only which schemes the email mentioned, so the next one can say what's new; it's included in `/me/export` and deleted with the account.

## Importing from the tracker sheets

Download the Events Tracker ("Events" tab) or Policy Newsroom ("Newsroom" tab) as CSV and upload it at `/admin/imports`, or from a script:

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
| `GET /investors`, `/investors/:slug` | Investor directory (listed investors only) |
| `POST /auth/request-otp`, `/auth/verify-otp` | Sign in |
| `GET /me`, `/me/export`; `DELETE /me` | Account, data export, erasure |
| `POST /me/startups`, `PATCH/DELETE /me/startups/:id`, `GET /me/startups/:id/scan` | Startup profile |
| `GET/POST /me/consents` | Consent ledger |
| `GET /me/startups/:id/readiness`, `/me/startups/:id/investor-matches` | Readiness Score; ranked investors |
| `POST /me/startups/:id/intros`; `GET /me/intros`; `POST /me/intros/:id/respond`, `/withdraw` | Intro requests |
| `GET/POST/PATCH /me/investor`; `GET /me/investor/matches` | Investor profile; consenting startups that fit |
| `GET /admin/overview`, `/admin/audit` | Editor dashboard counts; audit log |
| `GET /admin/schemes`, `/admin/schemes/:slug`; `PUT /admin/schemes/:slug`; `POST /admin/schemes`, `/admin/schemes/:slug/verify`, `/admin/rules/validate` | Scheme review and editing |
| `GET /admin/investors`; `POST /admin/investors/:id/verify`, `/admin/investors/:id/listing` | Investor review |
| `GET/POST /admin/articles`, `GET/PUT /admin/articles/:slug` | Articles and publishing |
| `POST /admin/import/events`, `/admin/import/policy` | CSV import |
| `GET /admin/digest/preview`; `POST /admin/digest/send` | Scheme alerts preview (editor's own profile or a sample) and send |
| `POST /digest/unsubscribe` | One-click unsubscribe from a signed link |

All `/admin` routes need a signed-in editor (`ADMIN_EMAILS`) or the `x-admin-key` header.

## Next up (from the roadmap)

Verified badges (MCA, GST, DigiLocker, Account Aggregator), Hindi and regional languages, events crawler, WhatsApp alerts, MedTech sector hub.
