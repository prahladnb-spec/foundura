# Deploying Foundura

Foundura runs on **DigitalOcean in Bangalore (BLR1)**: one Droplet (server) running the API, the web app and Caddy (HTTPS) in Docker, a **managed PostgreSQL** database, and **Spaces** object storage for off-site backups. Everything stays in India, as the privacy page promises.

Only Caddy is reachable from the internet. That matters because the API trusts the visitor IP that the web server forwards, which it uses for rate limits. The database accepts connections only from the Droplet, over the private network, with verified SSL.

Rough cost: Droplet (2 vCPU, 4 GB) about $24 a month, database (Standard edition, single node) $15, Spaces $5, plus GST. Check current prices when you sign up.

(Prefer Postgres on the same server instead? Leave `DATABASE_URL` empty, set `POSTGRES_PASSWORD`, and add `-f docker-compose.selfdb.yml` after `-f docker-compose.prod.yml` in every compose command. The backup scripts work either way.)

## 1. DigitalOcean resources

Create everything in **BLR1** and in the same VPC network (the region's default VPC is fine).

1. **Project:** create a project called Foundura, so the resources and bill sit together.
2. **Database:** Databases → Create → PostgreSQL.
   - Edition: **Standard** (it gives you a CA certificate to verify the server; Advanced doesn't, and starts at $130 a month).
   - Version: **17** (if you pick a newer one, set `PG_TOOLS_IMAGE` to match, e.g. `postgres:18-alpine`).
   - Plan: the smallest single node is enough to launch. Standard clusters can't grow past 4 GB of RAM or add a standby; if Foundura outgrows that, move to Advanced.
   - Name it `foundura-db`.
3. **Droplet:** Droplets → Create.
   - Region BLR1, same VPC as the database.
   - Image: Ubuntu 24.04 LTS (or the newest LTS offered).
   - Size: 2 vCPU / 4 GB (regular or premium).
   - Authentication: **SSH key** only (no password).
   - Turn on monitoring. Leave DigitalOcean's weekly Droplet backups off: the server holds no data that isn't in the database or the repository.
4. **Cloud firewall:** Networking → Firewalls → Create, applied to the Droplet.
   - Inbound: TCP 22 from your own IP address only; TCP 80 and 443 from all; UDP 443 from all (HTTP/3).
   - Outbound: leave the defaults.
5. **Database access:** on the database's Settings page, under **Trusted sources**, add the Droplet. Nothing else can connect.
6. **Database user and database:** on the database's Users & Databases page, add a user `foundura` and a database `foundura`. The user must own the database, because migrations create tables; you'll do that in section 2.
7. **Spaces bucket** (off-site backups): Spaces Object Storage → Create, region BLR1, name e.g. `foundura-backups`, **file listing restricted**. Then API → Spaces Keys → generate a key limited to that bucket (read and write). Keep the key and secret for section 6.

## 2. Server setup

SSH in as root, then:

1. Install Docker with the Compose plugin ([official instructions for Ubuntu](https://docs.docker.com/engine/install/ubuntu/)), and `apt install rclone`.
2. Turn on automatic security updates: `apt install unattended-upgrades` (on by default in recent Ubuntu; check with `systemctl status unattended-upgrades`).
3. Clone the repository to `/srv/foundura`.
4. On the database's Overview page, click **Download CA certificate** and copy it to the server as `/srv/foundura/deploy/certs/db-ca.crt` (it's public and not a secret, but it's per cluster, so it isn't committed).
5. Make the `foundura` user the owner of its database, connecting as `doadmin` with the private host and password from the database's connection details:
   ```bash
   docker run --rm -it -v /srv/foundura/deploy/certs:/certs:ro postgres:17-alpine psql \
     "postgresql://doadmin:<password>@private-<cluster>.db.ondigitalocean.com:25060/foundura?sslmode=verify-full&sslrootcert=/certs/db-ca.crt" \
     -c "alter database foundura owner to foundura" -c "alter schema public owner to foundura"
   ```
6. Point DNS at the Droplet's IP address:
   - an `A` record for `foundura.org` (and `AAAA` if the Droplet has IPv6)
   - an `A` record for `www.foundura.org`, which Caddy redirects to the bare domain

## 3. Email

Create a [Resend](https://resend.com) account, add your domain and publish the SPF, DKIM and DMARC records it shows you. Wait until the domain shows as verified. Without this, sign-in codes land in spam.

## 4. Settings and first start

```bash
cd /srv/foundura
cp .env.production.example .env.production
openssl rand -base64 48   # run twice: JWT_SECRET, ADMIN_API_KEY
openssl rand -hex 24      # OPS_REPORT_TOKEN
```

Fill in every value. The database address is the **private** (VPC) connection string for the `foundura` user and database, port 25060, with verified SSL:

```
DATABASE_URL=postgresql://foundura:<password>@private-<cluster>.db.ondigitalocean.com:25060/foundura?sslmode=verify-full&sslrootcert=/certs/db-ca.crt
```

The API **refuses to start** with unsafe production settings and lists each problem:

- sign-in codes shown on screen
- placeholder secrets
- an `http://` site address
- localhost in `CORS_ORIGINS`
- a missing email key
- `TRUST_PROXY` set to 0
- a managed database address without `sslmode=verify-full` and the CA certificate

`.env.production` must never be committed; `.gitignore` and `.dockerignore` already exclude it, along with `backups/` and `deploy/certs/`.

Start it:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

What happens:

1. **migrate** applies database migrations, then adds any schemes, events, policy items and guides that aren't in the database yet. It never overwrites changes editors made in the console.
2. **api** starts once migrations finish. It is reachable only on the private network.
3. **web** starts once the API is healthy.
4. **caddy** gets an HTTPS certificate for `SITE_DOMAIN` and serves the site.

Check it:

```bash
curl https://foundura.org/api/health        # {"web":"up","api":"up","db":"up"}
docker compose -f docker-compose.prod.yml logs -f api
```

Then load every page once, so the first visitors don't wait for pages to be generated (about 20 seconds):

```bash
./deploy/warm.sh
```

Then sign in with an address listed in `ADMIN_EMAILS` and open `/admin`.

## 5. Updating

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
./deploy/warm.sh
```

Migrations run on every deploy before the new API starts. Expect a few seconds of downtime while containers restart. `warm.sh` waits for the site to be healthy, loads every page in the sitemap once and lists any page that didn't return 200.

## 6. Backups

Three scripts in `deploy/`, all run from `/srv/foundura` on the server:

- `backup.sh` dumps the database to `backups/foundura-YYYY-MM-DD.dump`, checks the dump can be read back, copies it off the server if `BACKUP_REMOTE` is set, and deletes copies (local and off-site) older than 14 days.
- `restore-drill.sh` restores the newest dump into a scratch database, checks the tables and migrations match the live database, prints row counts side by side, and drops the scratch copy.
- `restore.sh` restores a chosen dump into a scratch copy to look at, or over the live database with `--replace-live`.

With a managed database the Postgres tools run in a short-lived container (`PG_TOOLS_IMAGE`), and scratch copies go into a throwaway Postgres container on the Droplet; nothing is ever restored into the cluster unless you ask for `--replace-live`.

Both scheduled scripts record their runs, and with `BACKUP_CHECK=true` the API emails `OPS_ALERT_EMAIL` if the daily backup hasn't succeeded for 36 hours or the drill for 35 days. CI runs a backup and a drill on every push against both setups: Postgres on the same server, and a stand-in managed database that only accepts verified SSL.

**Crontab:**

```cron
15 2 * * * cd /srv/foundura && ./deploy/backup.sh >> backups/backup.log 2>&1
40 3 1 * * cd /srv/foundura && ./deploy/restore-drill.sh >> backups/backup.log 2>&1
```

**Off-site copies.** A backup on the same server is lost with the server. Copy each dump to the Spaces bucket in Bangalore through [rclone](https://rclone.org):

1. `rclone config` → new remote `spaces`, type **s3**, provider **DigitalOcean**, the bucket key and secret from section 1, endpoint `blr1.digitaloceanspaces.com`.
2. Add a `crypt` remote on top of it, so the copies are encrypted before they leave the server. Keep its password somewhere other than this server (a password manager); without it the copies can't be restored.
   For example a crypt remote `offsite` wrapping `spaces:foundura-backups`.
3. Set `BACKUP_REMOTE=offsite:` in `.env.production` and run `./deploy/backup.sh` once by hand to check.
4. Don't turn on bucket versioning or object lock: deleted copies would be kept, and the privacy notice promises backups roll over within 14 days of someone deleting their account.

**Before launch, run the drill by hand** (`./deploy/restore-drill.sh`) and once restore from an off-site copy:

```bash
rclone copy "$BACKUP_REMOTE/foundura-YYYY-MM-DD.dump" backups/
./deploy/restore.sh backups/foundura-YYYY-MM-DD.dump        # into a scratch copy; it prints how to open it
```

**Point-in-time restore (managed database).** DigitalOcean keeps its own backups of the cluster and can restore it to any moment in the last 7 days, into a **new** cluster. That's the best way to undo a bad change: restore to just before it, download the new cluster's CA certificate over `deploy/certs/db-ca.crt`, change the host in `DATABASE_URL`, add the Droplet to the new cluster's trusted sources, and run the start command again. Our own daily dumps are the second, independent copy (they survive even if the cluster or account is lost).

**If you need to roll back from one of our dumps:** stop the app (`docker compose -f docker-compose.prod.yml stop api web`), run `./deploy/restore.sh backups/foundura-YYYY-MM-DD.dump --replace-live`, then start it again. Everything since that backup is lost, including consent changes and account deletions; redo any deletions recorded in the audit log or support inbox since then.

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
| `DATABASE_URL` | api, backup scripts | Managed database address: private host, port 25060, `?sslmode=verify-full&sslrootcert=/certs/db-ca.crt` |
| `PG_TOOLS_IMAGE` | backup scripts | Postgres tools image for backups; at least the cluster's major version (default `postgres:17-alpine`) |
| `POSTGRES_PASSWORD` | compose (selfdb) | Only when Postgres runs on the same server |
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
