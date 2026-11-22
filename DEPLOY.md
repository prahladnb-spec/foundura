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

Three scripts in `deploy/`, all run from `/srv/foundura` on the server:

- `backup.sh` dumps the database to `backups/foundura-YYYY-MM-DD.dump`, checks the dump can be read back, copies it off the server if `BACKUP_REMOTE` is set, and deletes copies (local and off-site) older than 14 days.
- `restore-drill.sh` restores the newest dump into a scratch database, checks the tables and migrations match the live database, prints row counts side by side, and drops the scratch copy.
- `restore.sh` restores a chosen dump, into `foundura_restore` by default, or over the live database with `--replace-live`.

Both scheduled scripts record their runs, and with `BACKUP_CHECK=true` the API emails `OPS_ALERT_EMAIL` if the daily backup hasn't succeeded for 36 hours or the drill for 35 days. CI runs a backup and a drill against the production database container on every push.

**Crontab:**

```cron
15 2 * * * cd /srv/foundura && ./deploy/backup.sh >> backups/backup.log 2>&1
40 3 1 * * cd /srv/foundura && ./deploy/restore-drill.sh >> backups/backup.log 2>&1
```

**Off-site copies.** A backup on the same server is lost with the server. Use object storage in an Indian region (for example AWS S3 in Mumbai, `ap-south-1`) through [rclone](https://rclone.org):

1. `sudo apt install rclone`, then `rclone config` to add an S3 remote with a key that can only read and write that one bucket.
2. Add a `crypt` remote on top of it, so the copies are encrypted before they leave the server. Keep its password somewhere other than this server (a password manager); without it the copies can't be restored.
3. Set `BACKUP_REMOTE=<crypt-remote>:` in `.env.production` and run `./deploy/backup.sh` once by hand to check.
4. Don't turn on bucket versioning or object lock: deleted copies would be kept, and the privacy notice promises backups roll over within 14 days of someone deleting their account.

**Before launch, run the drill by hand** (`./deploy/restore-drill.sh`) and once restore from an off-site copy:

```bash
rclone copy "$BACKUP_REMOTE/foundura-YYYY-MM-DD.dump" backups/
./deploy/restore.sh backups/foundura-YYYY-MM-DD.dump        # into foundura_restore; look around with psql
```

**If you need to roll back the live database:** stop the app (`docker compose -f docker-compose.prod.yml stop api web`), run `./deploy/restore.sh backups/foundura-YYYY-MM-DD.dump foundura --replace-live`, then start it again. Everything since that backup is lost, including consent changes and account deletions; redo any deletions recorded in the audit log or support inbox since then.

## 7. Monitoring

- **Uptime:** point an outside uptime monitor at `https://foundura.org/api/health` every 5 minutes (any uptime service with a free tier works), with alerts to your phone. It checks the web app, API and database in one call and returns 503 if any is down. This is the only alert that works when the whole server is down, so don't skip it.
- **Error and job alerts:** set `OPS_ALERT_EMAIL` and `OPS_REPORT_TOKEN`. Then:
  - an unexpected error in the API, or while the web server renders a page, is emailed (the same error at most once every 30 minutes; only the method, path and stack trace, never request bodies or query strings);
  - a scheduled job that fails is emailed (weekly scheme alerts, terms reminders, or every event source failing at once);
  - a job that hasn't succeeded for too long is emailed: weekly alerts after 8 days, terms reminders and the event sync after 2 days, backups after 36 hours and the restore drill after 35 days (with `BACKUP_CHECK=true`). The API checks this hourly.
  - Test it after deploying: `docker compose -f docker-compose.prod.yml exec api node -e "fetch('http://localhost:4000/v1/ops/report',{method:'POST',headers:{'content-type':'application/json','x-ops-token':process.env.OPS_REPORT_TOKEN},body:JSON.stringify({source:'web',message:'Test alert',path:'/test'})}).then(r=>console.log(r.status))"` should print 202 and send an email.
- Container logs: `docker compose -f docker-compose.prod.yml logs --since 1h api web`.
- Access logs (visitor IP, time, request) are written by Caddy to `/data/logs/access.log` in the `caddy_data` volume and kept for 180 days, as the CERT-In directions require and the privacy page states. Read them with `docker compose -f docker-compose.prod.yml exec caddy tail -f /data/logs/access.log`.

## Settings reference

| Setting | Where | What it does |
| --- | --- | --- |
| `SITE_DOMAIN` | compose | Domain Caddy serves and gets a certificate for |
| `OPS_ALERT_EMAIL` | api | Inbox for error and stalled-job alerts |
| `BACKUP_CHECK` | api | `true` to alert when backups or the monthly restore drill stop succeeding |
| `BACKUP_REMOTE` | backup.sh | rclone remote and path for encrypted off-site copies; empty keeps backups on the server only |
| `OPS_REPORT_TOKEN` | api, web | Shared secret for the web server to report its errors |
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
