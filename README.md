# Foundura

India's founder launchpad. Phase 1 MVP:

- **Scheme Scan**: answer a few questions and see which central and state government schemes a startup qualifies for, with the exact conditions met, not met, or still to confirm. Anonymous scans are never stored.
- **Startup profile** (Passport v1): sign in with an emailed one-time code, save a profile, re-run the scan any time, and optionally publish a public profile (financial figures always stay private).
- **Founder documents** (`/documents`, interface in English and Hindi): 47 documents a startup needs, in six groups: ideas and go-to-market, fundraising and strategy, legal and incorporation, financial, team, customers and compliance, and a MedTech pack. Each has a short guide (when you need it, what to include, points specific to India, common mistakes) and a template built as a real Word, Excel or PowerPoint file. The pitch deck and one-pager also have a filled-in example, and the pitch deck, one-pager and business plan have Hindi versions. A finder asks what you're doing and your stage and lists what to prepare first. Downloads need no sign-up and aren't logged per person. Legal templates say on the page and in the file to have a lawyer review them. Content lives in `apps/web/src/documents/`; files are generated at build time by `/downloads/[file]`.
- **Glossary** (`/glossary`): about 50 funding and legal terms in plain English and Hindi (`apps/web/src/glossary.ts`).
- **Investor documents checklist**: on the dashboard, founders tick which of eight documents investors ask for they have ready. It is private, is in their data export, and counts for 10 of the 100 readiness points.
- **Startup showcase** (`/startups`, in English and Hindi): founders who switch on a public profile get a page with what they make, website and product or demo links, sectors, stage, state, year founded and what they're looking for (pilot customers, customers, partners, distributors, people to hire, mentors). The directory filters by sector, stage, state and what startups are looking for. Each page has a share image and structured data and is in the sitemap. Turnover, funding, the raise, the deck and shareholding never appear. Switching the profile off removes the page at once; editors can hide a listing from `/admin/startups` (audited), and the founder's dashboard says so.
- **Investor Connect**: investors list their focus and cheque size; founders get a **Readiness Score** (0–100 with a fix list) and ranked matches with reasons; intro requests open only at readiness ≥ 50 and match ≥ 40, with at most 10 pending; contact emails are revealed only when the investor accepts. Startups are visible to investors only if the founder made the profile public **and** switched on investor visibility.
- **Embeddable Scheme Scan**: partners paste one `<script>` tag (see `/partners`). Only `/embed/*` may be framed; the rest of the site sends `X-Frame-Options: DENY`.
- **Editor console** (`/admin`): check schemes against their official source, edit rules with validation and a plain-language preview, verify or hide investors, hide startup listings from the showcase, write and publish articles with a live preview, import the tracker sheets, and see an audit log of every change.
- **Email notifications**: investors hear about new intro requests and founders hear when one is accepted or declined. Emails carry only names and a link; details stay on Foundura.
- **MedTech sector guide** (`/sectors/medtech`, in English and Hindi): a regulatory pathway finder (what you're doing now plus the device's risk class gives the CDSCO steps, forms and who decides), MedTech funding from the scheme catalogue, help desks (ICMR MedTech Mitra, CDSCO's startup desk, Patent Mitra, BIRAC), MedTech investors and health events, with sources and a last-checked date. Content lives in `apps/web/src/sectors/medtech.ts`.
- **Weekly scheme alerts**: founders who turn on alerts get one email a week, and only when something is new for them: schemes they now qualify for, changes to their schemes, deadlines in the next two weeks, the week's policy news and new guides. One-click unsubscribe (including mail apps' built-in button) is recorded in the consent ledger.
- **Events**, **Policy news** and **Founder guides**, fed from the tracker sheets and the daily content engine.
- **Terms of use and grievance officer**: `/terms` and `/privacy` read the company and grievance officer details from settings, so they can change without a release. New accounts confirm they're 18+ and accept the terms. Every account holder gets a yearly reminder of both documents, as the IT Rules 2021 require.
- **English and Hindi**: English at the plain URLs, Hindi under `/hi/...`, with a switch in the header. Emails come in each person's chosen language. The privacy notice and terms are fully translated, as the DPDP Act expects notices to be offered in Indian languages. Schemes have Hindi text (name, summary, benefits, how to apply, checks and every condition shown in scan results), edited in the scheme editor's Hindi section. Events, policy items and guides stay in English for now (Hindi pages say so). The investor dashboard and editor console are English-only.
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

## Languages

Interface text lives in `apps/web/src/i18n/en.ts` and `hi.ts`. `hi.ts` is typed against `en.ts`, so a missing Hindi string fails the build. Use `<Link>` from `@/components/locale-link` (it adds `/hi` on Hindi pages), `useT()` in client components and `getDict(lang)` in server components. `src/middleware.ts` serves English from the plain URLs, redirects `/en/...` to them, and keeps the editor console English-only. Partners can show the embedded scan in Hindi with `data-lang="hi"`.

Scheme translations live in `schemes.translations.hi`, stamped with a fingerprint of the English they were written from. If an editor later changes the English (text or condition labels), the Hindi is marked out of date in the console and Hindi readers see the current English until the Hindi is updated, so nobody reads stale eligibility rules. `GET /v1/schemes?lang=hi`, `GET /v1/schemes/:slug?lang=hi` and `POST /v1/scan?lang=hi` return Hindi where it's current, with `contentLang` saying which language came back. The seed ships Hindi drafts for all 14 schemes and only adds them where a scheme has none.

Editor saves clear the web app's cached public pages (`revalidateTag("content")` in the admin proxy), so changes show at once instead of within 5 minutes.

Emails follow each person's language (`users.locale`). It's set from the page they sign in on, can be changed under "Email language" on the dashboard, and is used for sign-in codes, intro notifications, weekly scheme alerts and the yearly terms reminder; links in those emails go to pages in the same language. Email wording lives in `apps/api/src/mail/templates.ts`. Editors can preview the weekly alert in either language at `/admin/alerts`.

To add another language: add it to `LANGS` in `i18n/config.ts`, create its dictionary typed as `Dict`, translate the privacy notice and terms components, and extend the middleware and `next.config.ts` framing rule.

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

### Browser tests

Playwright drives the built site in Chromium, the way a person would. Each run starts the API and web app on their own ports (4100 and 3100) against a fresh `foundura_e2e` database, so dev data is never touched.

```bash
pnpm build
pnpm --filter @foundura/e2e exec playwright install chromium   # once
pnpm e2e
```

Set `E2E_DATABASE_URL` to use another database (its name must contain `e2e` or `test`, because the run empties it), or `CHROME_PATH` to use an installed Chrome. When a test fails, `pnpm --filter @foundura/e2e report` opens the report with a trace of every step.

They cover the founder journey (scan, sign-in, profile, consents, export, deletion, sign-out), Investor Connect across three browsers (investor, editor, founder), the editor console (access, rule checks, Hindi going out of date, publishing, CSV import, audit log, weekly alerts and unsubscribe), Hindi (language switch, scan, dashboard, email language, and a check for untranslated English on every Hindi page), the startup showcase (public page, filters, Hindi, sitemap, editor hide, switching off), founder documents (finder, guides, every file downloads as a valid Office file, Hindi), the embed widget on a partner site and framing protection, the MedTech guide, and the sitemap, robots, share images and health check. GitHub runs them on every push and keeps the report when they fail.

## How schemes work

Each scheme has a JSON rule tree (`all` / `any` / fact conditions with plain-language labels). The engine returns **eligible** only when every condition is met, **maybe** when an answer is missing, and **not eligible** when any condition fails. It never guesses. Conditions the scan can't test go in `alsoCheck`.

**Before launch, an editor must check every scheme against its official source** in the editor console (`/admin/schemes`). Until a scheme is checked the site tells users to confirm on the official page. Any later edit clears the check date unless the editor ticks “I checked these details against the official source today” in the same save.

## Editor console

Add editor emails to `ADMIN_EMAILS` (comma-separated), then sign in at `/signin` as usual and open `/admin`. Everyone else gets a 403. Scripts, such as the scheduled sheet imports, can use the `x-admin-key` header instead. Every change goes into `audit_log` with the editor's user id (set to null if that account is deleted), never their email.

Rules are validated by `conditionSchema` in `@foundura/shared`, which only accepts facts in `FACT_KEYS` (the answers the Scheme Scan collects). The seed test checks that every seeded scheme passes the same validation.

## Weekly scheme alerts

Set `SCHEDULED_EMAILS=true` on the API server and it sends on Mondays from 8:00 India time (the same setting sends the yearly terms reminder, checked daily from 10:00). Editors can preview the email and send it by hand at `/admin/alerts`, and scripts can call `POST /v1/admin/digest/send` with the admin key. Running it twice is safe: each founder gets at most one email per week (`digest_sends` has one row per person per week, claimed before sending). That table keeps only which schemes the email mentioned, so the next one can say what's new; it's included in `/me/export` and deleted with the account.

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
| `GET /startups`, `/startups/:slug` | Startup showcase (public profiles not hidden by an editor); filters: `sector`, `stage`, `state`, `lookingFor` |
| `GET /investors`, `/investors/:slug` | Investor directory (listed investors only) |
| `POST /auth/request-otp`, `/auth/verify-otp` | Sign in |
| `GET /me`, `/me/export`; `DELETE /me` | Account, data export, erasure |
| `PATCH /me/locale` | Email language (`en` or `hi`) |
| `POST /me/startups`, `PATCH/DELETE /me/startups/:id`, `GET /me/startups/:id/scan` | Startup profile |
| `GET/POST /me/consents` | Consent ledger |
| `GET /me/startups/:id/readiness`, `/me/startups/:id/investor-matches` | Readiness Score; ranked investors |
| `POST /me/startups/:id/intros`; `GET /me/intros`; `POST /me/intros/:id/respond`, `/withdraw` | Intro requests |
| `GET/POST/PATCH /me/investor`; `GET /me/investor/matches` | Investor profile; consenting startups that fit |
| `GET /admin/overview`, `/admin/audit` | Editor dashboard counts; audit log |
| `GET /admin/schemes`, `/admin/schemes/:slug`; `PUT /admin/schemes/:slug`; `POST /admin/schemes`, `/admin/schemes/:slug/verify`, `/admin/rules/validate` | Scheme review and editing |
| `PUT /admin/schemes/:slug/translations/hi` | Save a scheme's Hindi (must translate every visible condition) |
| `GET /admin/investors`; `POST /admin/investors/:id/verify`, `/admin/investors/:id/listing` | Investor review |
| `GET /admin/startups`; `POST /admin/startups/:id/showcase` | Showcase moderation (hide or show a listing) |
| `GET/POST /admin/articles`, `GET/PUT /admin/articles/:slug` | Articles and publishing |
| `POST /admin/import/events`, `/admin/import/policy` | CSV import |
| `GET /admin/digest/preview`; `POST /admin/digest/send` | Scheme alerts preview (editor's own profile or a sample) and send |
| `POST /digest/unsubscribe` | One-click unsubscribe from a signed link |

All `/admin` routes need a signed-in editor (`ADMIN_EMAILS`) or the `x-admin-key` header.

## Next up (from the roadmap)

Verified badges (MCA, GST, DigiLocker, Account Aggregator), product images on showcase pages (needs upload storage and moderation), regional languages, events crawler, WhatsApp alerts.
