# Deploying Foundura

Foundura runs as four containers on one server: Postgres, the API, the web app and Caddy (HTTPS). Only Caddy is reachable from the internet. That matters because the API trusts the visitor IP that the web server forwards, which it uses for rate limits.

A 2 vCPU / 4 GB server is enough to launch. Pick an **Indian region** (for example AWS Mumbai or Hyderabad, Azure Central India, DigitalOcean Bangalore), because the privacy page promises account data is stored in India.

## 1. One-time server setup

1. Install Docker with the Compose plugin.
2. Point DNS at the server:
   - an `A` record for `foundura.org` (and `AAAA` if the server has IPv6)
   - an `A` record for `www.foundura.org`, which Caddy redirects to the bare domain
3. Open ports 80 and 443 only.
4. Clone the repo, for example to `/srv/foundura`.

## 2. Email

Create a [Resend](https://resend.com) account, add your domain and publish the SPF, DKIM and DMARC records it shows you. Wait until the domain shows as verified. Without this, sign-in codes land in spam.

## 3. Settings

```bash
cp .env.production.example .env.production
openssl rand -base64 48   # run three times: JWT_SECRET, ADMIN_API_KEY, POSTGRES_PASSWORD
```

Fill in every value. The API **refuses to start** with unsafe production settings and lists each problem:

- sign-in codes shown on screen
- placeholder secrets
- an `http://` site address
- localhost in `CORS_ORIGINS`
- a missing email key
- `TRUST_PROXY` set to 0

`.env.production` must never be committed; `.gitignore` and `.dockerignore` already exclude it.

## 4. Start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

What happens:

1. **db** starts and waits until healthy.
2. **migrate** applies database migrations, then adds any schemes, events, policy items and guides that aren't in the database yet. It never overwrites changes editors made in the console.
3. **api** starts once migrations finish. It is reachable only on the private network.
4. **web** starts once the API is healthy.
5. **caddy** gets an HTTPS certificate for `SITE_DOMAIN` and serves the site.

Check it:

```bash
curl https://foundura.org/api/health        # {"web":"up","api":"up","db":"up"}
docker compose -f docker-compose.prod.yml logs -f api
```

## 5. Updating

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Migrations run on every deploy before the new API starts. Expect a few seconds of downtime while containers restart.

## 6. Backups

Add the backup script to the server's crontab:

```cron
15 2 * * * cd /srv/foundura && ./deploy/backup.sh >> backups/backup.log 2>&1
```

It keeps 14 daily dumps in `./backups`. Also copy that folder to object storage in an Indian region, and **test a restore** before launch:

```bash
docker compose -f docker-compose.prod.yml exec -T db pg_restore -U foundura -d foundura --clean /backups/foundura-YYYY-MM-DD.dump
```

## 7. Monitoring

- Point an uptime monitor at `https://foundura.org/api/health`. It checks the web app, API and database in one call and returns 503 if any is down.
- Container logs: `docker compose -f docker-compose.prod.yml logs --since 1h api web`.
- Access logs (visitor IP, time, request) are written by Caddy to `/data/logs/access.log` in the `caddy_data` volume and kept for 180 days, as the CERT-In directions require and the privacy page states. Read them with `docker compose -f docker-compose.prod.yml exec caddy tail -f /data/logs/access.log`.
- Offsite backup copies should also be deleted after 14 days; the privacy page tells users backups roll over within 14 days of erasure.

## Settings reference

| Setting | Where | What it does |
| --- | --- | --- |
| `SITE_DOMAIN` | compose | Domain Caddy serves and gets a certificate for |
| `ACME_EMAIL` | compose | Contact for certificate expiry notices |
| `POSTGRES_PASSWORD` | compose | Database password |
| `SITE_URL`, `CORS_ORIGINS` | API | Public address, used in emails and CORS |
| `JWT_SECRET` | API | Signs sessions and unsubscribe links. Changing it signs everyone out |
| `ADMIN_API_KEY` | API | For scripts calling `/v1/admin/*` |
| `ADMIN_EMAILS` | API | Editors who can open `/admin` |
| `OTP_DELIVERY`, `RESEND_API_KEY`, `OTP_FROM_EMAIL` | API | Email delivery |
| `SCHEDULED_EMAILS` | API | Weekly scheme alerts (Mondays 8:00 India time) and yearly terms reminders |
| `LEGAL_ENTITY_NAME`, `LEGAL_ADDRESS`, `LEGAL_JURISDICTION_CITY`, `GRIEVANCE_OFFICER_NAME`, `GRIEVANCE_EMAIL`, `SUPPORT_EMAIL` | web | Shown on `/privacy` and `/terms`; read at request time, so a restart is enough to change them |
| `TRUST_PROXY` | API | Set to 1 by compose: the web server is the one proxy in front of the API |
| `NEXT_PUBLIC_SITE_URL` | web (build) | Baked into links, the sitemap and share images. Rebuild the web image if the domain changes |

## Running without Docker

Any host that runs Node 22 and Postgres 16 works:

1. Run `pnpm install && pnpm --filter @foundura/shared build && pnpm build`.
2. Run `pnpm --filter @foundura/api db:migrate:prod` and `db:seed:prod`.
3. Start the API with `node apps/api/dist/src/main.js`.
4. Start the web app with `node apps/web/.next/standalone/apps/web/server.js`, after copying `.next/static` and `public` next to it.

Keep the API private, and set `TRUST_PROXY` to the number of proxies in front of it.
