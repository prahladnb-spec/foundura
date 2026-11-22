# Security

What protects Foundura, and how to keep it that way. Last reviewed 22 Nov 2026.

## What the platform holds

Email addresses, startup and investor profiles (including private figures such as turnover and funding sought), consent records, intro requests and messages. It never handles money, card or bank details. Anonymous Scheme Scan answers are not stored, and usage counts are daily totals with nothing that identifies a visitor.

## Who can reach what

- Only Caddy is public. It serves HTTPS, sets HSTS and forwards to the web server. The API is on the internal Docker network.
- The database is DigitalOcean managed Postgres in Bangalore. It accepts connections only from the Droplet (trusted sources), over the private network, and the app and backup tools verify its certificate (`sslmode=verify-full` with the cluster's CA); the API refuses to start in production without that. A DigitalOcean cloud firewall allows only SSH from the operator's address, and 80 and 443.
- The API trusts the last `X-Forwarded-For` entry, which only our web server can set, so rate limits apply per visitor.
- Editors are signed-in accounts whose email is listed in `ADMIN_EMAILS`. The import key (`ADMIN_API_KEY`) is for scripts and is checked with a timing-safe comparison. Every editor action is in the audit log.
- Error reports from the web server need `OPS_REPORT_TOKEN`.

## Sign-in

- Email codes: 6 digits, hashed with HMAC, valid for 10 minutes, 5 wrong tries and the code is void.
- Limits: 5 code requests and 10 attempts a minute per IP, and per email address one code every 30 seconds and 8 an hour (so nobody can flood an inbox). The per-address limit is held in memory, which is fine for the single API process the deploy guide describes; move it to Postgres or Redis before running several.
- Sessions are signed JWTs in an HttpOnly, SameSite=Lax cookie, marked Secure in production.

## Rate limits

| What | Limit |
| --- | --- |
| Default, per visitor | 120 requests a minute |
| Ask for a sign-in code | 5 a minute |
| Enter a sign-in code | 10 a minute |
| Unsubscribe | 20 a minute |
| Usage beacon | 60 a minute |
| Web error reports | 30 a minute |
| Intro requests | up to 10 waiting for a reply at a time, per startup |
| Public reads (content, events, investors, health) | not limited; they're cached and read-only |

Request bodies are capped at 200 KB (2 MB for editor CSV imports).

## Headers

Set in `apps/web/next.config.ts` and checked by `e2e/tests/security.spec.ts`:

- `Content-Security-Policy`: everything from our own origin only (`default-src 'self'`), no plugins, no outside forms, and framing refused (`frame-ancestors 'none'`). Inline scripts are allowed because Next.js adds small ones to statically built pages; nonces would make every page render per request. The scan widget under `/embed` may be framed by any site.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`, and a `Permissions-Policy` that turns off camera, microphone, location, payment, USB and ad topics.
- HSTS comes from Caddy.

If a page needs something from another site (a video, a font, a map), add that host to the policy deliberately; the browser test fails on anything the policy blocks.

## Outside requests

Event sources are fetched with `safeFetchText`: https only, private and internal addresses refused (checked after DNS lookup), at most 3 redirects, 2 MB and 15 seconds.

## Dependencies

- CI runs `pnpm audit --prod --audit-level high` on every push and fails on a known high or critical problem in anything that ships.
- Dependabot opens update pull requests weekly (npm), and monthly for GitHub Actions and Docker base images.
- `pnpm-workspace.yaml` overrides a few packages we don't use directly, to pick up fixes their parents haven't released: `postcss` (in Next.js), `image-size` (in pptxgenjs, not used by our code path), `uuid` (in exceljs), and `esbuild` inside drizzle-kit's loader (development only). Remove an override once the parent ships the fix.
- Zod 4 note: `.partial()` still fills in `.default()` values. Use `patchSchema()` from `@foundura/shared` for PATCH bodies so fields the request didn't mention aren't reset.

## Secrets

Never commit `.env` files. Production settings are listed in `.env.production.example`; the API refuses to start in production with development values (dev sign-in codes, `EVENT_SYNC_ALLOW_PRIVATE`, short secrets).

## Reporting a problem

Email the grievance address on the privacy page. Personal-data breaches must also be reported to the Data Protection Board and to the people affected under the DPDP Rules, and cyber incidents to CERT-In within 6 hours.
