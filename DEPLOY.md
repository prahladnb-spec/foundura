# Deploying Foundura

Foundura runs on **one DigitalOcean server in Bengaluru (BLR1)**. The server runs Postgres, the API, the web app and Caddy (HTTPS) in Docker. Everything stays in India, as the privacy page promises.

Three providers, plus your domain registrar:

| Provider | What it does | Rough cost |
| --- | --- | --- |
| DigitalOcean | Server (Basic, 1 vCPU, 2 GB), daily server backups, DNS, uptime check | $12 + $3.60 backups |
| Zoho | Zoho Mail (free plan) for the support@ and grievance@ mailboxes; ZeptoMail for the site's own email (sign-in codes, alerts) | Mail free; ZeptoMail pay per email |
| GitHub | Holds the code; builds the Docker images on every push and publishes them | Free for a public repository |

About **$16 a month plus GST**, plus a few rupees for ZeptoMail credits. Check current prices when you sign up.

The server never builds anything. Building the web app needs more memory than 2 GB, so GitHub builds the images and the server only downloads them. Measured on a warmed server: web about 530 MB, API about 90 MB, Postgres about 100 MB, about 1.2 GB in total with Caddy and the system.

Only Caddy is reachable from the internet. That matters because the API trusts the visitor IP that the web server forwards, which it uses for rate limits.

## 1. DigitalOcean

Create everything in **BLR1**.

1. **Project:** create a project called Foundura, so the resources and the bill sit together.
2. **Droplet:** Droplets → Create.
   - Region BLR1. Image: Ubuntu 24.04 LTS (or the newest LTS offered).
   - Size: Basic, regular, **1 vCPU / 2 GB** ($12).
   - Authentication: **SSH key** only (no password).
   - Turn on **monitoring**.
   - Turn on **backups** and choose **daily** (kept 7 days). Not weekly: weekly backups are kept 4 weeks, longer than the 14 days in which the privacy notice promises deleted accounts leave every backup.
3. **Cloud firewall:** Networking → Firewalls → Create, applied to the Droplet.
   - Inbound: TCP 22 from your own IP address only; TCP 80 and 443 from all; UDP 443 from all (HTTP/3).
   - Outbound: leave the defaults.
4. **DNS:** Networking → Domains → add `foundura.org`. At your registrar, set the domain's nameservers to `ns1.digitalocean.com`, `ns2.digitalocean.com` and `ns3.digitalocean.com`. Then add:
   - an `A` record for `@` pointing at the Droplet (and `AAAA` if it has IPv6)
   - an `A` record for `www`, which Caddy redirects to the bare domain
   - the email records from section 3

## 2. Server setup

SSH in as root, then:

1. Install Docker with the Compose plugin ([official instructions for Ubuntu](https://docs.docker.com/engine/install/ubuntu/)).
2. Turn on automatic security updates: `apt install unattended-upgrades` (on by default in recent Ubuntu; check with `systemctl status unattended-upgrades`).
3. Add 2 GB of swap, so a busy moment slows the server down instead of stopping a container:
   ```bash
   fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
   echo '/swapfile none swap sw 0 0' >> /etc/fstab
   echo 'vm.swappiness=10' > /etc/sysctl.d/99-swap.conf && sysctl --system
   ```
4. Clone the repository to `/srv/foundura`.

## 3. Email (Zoho)

Two Zoho services, both on Zoho's **India** data centre. Sign up at **zoho.in**, not zoho.com, so the account and its data stay in India.

**Mailboxes (Zoho Mail, free plan).** Add `foundura.org`, verify it with the TXT record Zoho shows, and create `support@foundura.org` and `grievance@foundura.org` (or one mailbox with the other as an alias). Publish the MX, SPF and DKIM records Zoho shows in DigitalOcean DNS. The free plan works in the browser and the Zoho Mail phone app; it doesn't connect to other mail apps.

**The site's own email (ZeptoMail).** ZeptoMail sends sign-in codes, intro updates, alerts and the weekly scheme emails.

1. Open ZeptoMail from the same Zoho account, add `foundura.org` as a sending domain and publish the DKIM and bounce (CNAME) records it shows. Wait until the domain shows as verified. Without this, sign-in codes land in spam.
2. Create a Mail Agent and copy its **Send Mail token**. It goes into `ZEPTOMAIL_TOKEN` in section 4.
3. ZeptoMail is for transactional email. The weekly scheme alerts are sent only to people who asked for them and carry an unsubscribe link, but ask Zoho support to confirm they're fine on ZeptoMail before you turn on `SCHEDULED_EMAILS`.
4. Add a DMARC record: a `TXT` record for `_dmarc` with `v=DMARC1; p=quarantine; rua=mailto:support@foundura.org`.

Keep only **one** SPF record on the root domain. If Zoho Mail and ZeptoMail both show one, merge them into a single `v=spf1 … ~all` record.

## 4. Settings and first start

```bash
cd /srv/foundura
cp .env.production.example .env.production
chmod 600 .env.production
openssl rand -base64 48   # run twice: JWT_SECRET, ADMIN_API_KEY
openssl rand -hex 24      # run twice: OPS_REPORT_TOKEN, POSTGRES_PASSWORD
```

Fill in every value in `.env.production`. Leave `DATABASE_URL` empty: Postgres runs on this server. Put values with spaces, commas or `#` in double quotes, for example:

```
LEGAL_ADDRESS="#29, Bheema Samudra Road, Davalagiri Extension 2nd Stage, Chitradurga 577501, Karnataka"
```

The API **refuses to start** with unsafe production settings and lists each problem:

- sign-in codes shown on screen
- placeholder secrets
- an `http://` site address
- localhost in `CORS_ORIGINS`
- a missing `ZEPTOMAIL_TOKEN`
- `TRUST_PROXY` set to 0
- a managed database address without `sslmode=verify-full` and the CA certificate

`.env.production` must never be committed; `.gitignore` and `.dockerignore` already exclude it, along with `backups/` and `deploy/certs/`.

**Make the images downloadable.** The first push to `main` after this setup publishes two images on GitHub: `foundura-api` and `foundura-web` (on GitHub, your profile → Packages). New packages start private. Open each one → Package settings → Change visibility → **Public**. They hold only the public code, never settings or secrets. (To keep them private instead, run `docker login ghcr.io` on the server with a GitHub token that can read packages.)

Start it:

```bash
./deploy/up.sh
```

What happens:

1. Docker downloads the newest images GitHub built.
2. **db** (Postgres) starts. Its data lives in a Docker volume on the server.
3. **migrate** applies database migrations, then adds any schemes, events, policy items and guides that aren't in the database yet. It never overwrites changes editors made in the console.
4. **api** starts once migrations finish. It is reachable only on the private network.
5. **web** starts once the API is healthy.
6. **caddy** gets an HTTPS certificate for `SITE_DOMAIN` and serves the site.
7. `warm.sh` loads every page once, so the first visitors don't wait for pages to be generated, and lists any page that didn't return 200.

Check it:

```bash
curl https://foundura.org/api/health        # {"web":"up","api":"up","db":"up"}
docker compose -f docker-compose.prod.yml -f docker-compose.selfdb.yml logs -f api
```

Then sign in with an address listed in `ADMIN_EMAILS` and open `/admin`.

## 5. Updating

Push to `main`. When CI is green (it publishes the images only after every test passes), on the server:

```bash
cd /srv/foundura
git pull            # scripts and compose files
./deploy/up.sh      # new images, migrations, restart, warm
```

Migrations run on every update before the new API starts. Expect a few seconds of downtime while containers restart.

**Rolling back.** Every image is also published under the first 12 characters of its commit. To go back to an earlier release, set `FOUNDURA_TAG=<12 characters>` in `.env.production` and run `./deploy/up.sh`; remove the line to follow `main` again. A rollback doesn't undo database migrations, so roll back only to a release after the last migration, or restore a backup (section 6).

## 6. Backups

Two layers:

- **DigitalOcean daily backups** copy the whole server, kept for 7 days and stored apart from it. They protect against losing the server.
- **Our own daily database dumps** on the server. They're quicker to restore from, they let you restore just the database, and the restore drill proves they work.

Three scripts in `deploy/`, all run from `/srv/foundura`:

- `backup.sh` dumps the database to `backups/foundura-YYYY-MM-DD.dump`, checks the dump can be read back, and deletes dumps older than `KEEP_DAYS` (6 with daily server backups, so the oldest copy of any deleted account is gone within 14 days). If `BACKUP_REMOTE` is set it also copies each dump elsewhere with rclone; that's optional.
- `restore-drill.sh` restores the newest dump into a scratch database, checks the tables and migrations match the live database, prints row counts side by side, and drops the scratch copy.
- `restore.sh` restores a chosen dump into a scratch copy to look at, or over the live database with `--replace-live`.

Both scheduled scripts record their runs, and with `BACKUP_CHECK=true` the API emails `OPS_ALERT_EMAIL` if the daily backup hasn't succeeded for 36 hours or the drill for 35 days. CI runs a backup and a drill on every push.

**Crontab** (`crontab -e` as root):

```cron
15 2 * * * cd /srv/foundura && ./deploy/backup.sh >> backups/backup.log 2>&1
40 3 1 * * cd /srv/foundura && ./deploy/restore-drill.sh >> backups/backup.log 2>&1
```

The dump runs at 02:15 server time. DigitalOcean takes its backup in a window it chooses, so each server backup holds the dumps of the days before it.

**Before launch, run the drill by hand** (`./deploy/restore-drill.sh`) and check the log says it passed.

**If you need to roll back the database from one of our dumps:** stop the app (`docker compose -f docker-compose.prod.yml -f docker-compose.selfdb.yml --env-file .env.production stop api web`), run `./deploy/restore.sh backups/foundura-YYYY-MM-DD.dump --replace-live`, then `./deploy/up.sh`. Everything since that dump is lost, including consent changes and account deletions; redo any deletions recorded in the audit log or support inbox since then.

**If the server is lost:** in DigitalOcean, restore the newest backup to a new Droplet (Backups → Restore), point the DNS `A` records at it if its IP address changed, and run `./deploy/up.sh`.

## 7. Monitoring

- **Uptime:** Monitoring → Uptime → create a check on `https://foundura.org/api/health`, with alerts to your email (and the DigitalOcean phone app). It checks the web app, API and database in one call and returns 503 if any is down. This is the only alert that works when the whole server is down, so don't skip it.
- **Server:** with monitoring on, add DigitalOcean resource alerts for memory above 90% and disk above 80% for 10 minutes.
- **Error and job alerts:** set `OPS_ALERT_EMAIL` and `OPS_REPORT_TOKEN`. Then:
  - an unexpected error in the API, or while the web server renders a page, is emailed (the same error at most once every 30 minutes; only the method, path and stack trace, never request bodies or query strings);
  - a scheduled job that fails is emailed (weekly scheme alerts, terms reminders, or every event source failing at once);
  - a job that hasn't succeeded for too long is emailed: weekly alerts after 8 days, terms reminders and the event sync after 2 days, backups after 36 hours and the restore drill after 35 days (with `BACKUP_CHECK=true`). The API checks this hourly.
  - Test it after deploying: `docker compose -f docker-compose.prod.yml -f docker-compose.selfdb.yml exec api node -e "fetch('http://localhost:4000/v1/ops/report',{method:'POST',headers:{'content-type':'application/json','x-ops-token':process.env.OPS_REPORT_TOKEN},body:JSON.stringify({source:'web',message:'Test alert',path:'/test'})}).then(r=>console.log(r.status))"` should print 202 and send an email.
- Container logs: `docker compose -f docker-compose.prod.yml -f docker-compose.selfdb.yml logs --since 1h api web`.
- Access logs (visitor IP, time, request) are written by Caddy to `/data/logs/access.log` in the `caddy_data` volume and kept for 180 days, as the CERT-In directions require and the privacy page states. Read them with `docker compose -f docker-compose.prod.yml exec caddy tail -f /data/logs/access.log`.

## Settings reference

| Setting | Where | What it does |
| --- | --- | --- |
| `SITE_DOMAIN` | compose | Domain Caddy serves and gets a certificate for |
| `ACME_EMAIL` | compose | Contact for certificate expiry notices |
| `FOUNDURA_TAG` | compose | Image version to run; empty follows `main` (`latest`), or the first 12 characters of a commit |
| `POSTGRES_PASSWORD` | compose | Password of the database on this server |
| `DATABASE_URL` | api, backup scripts | Empty: Postgres on this server. Set only for a managed database (see the end of this guide) |
| `PG_TOOLS_IMAGE` | backup scripts | Postgres tools image, managed database only; at least the cluster's major version |
| `KEEP_DAYS` | backup.sh | Days of dumps kept; 6 with DigitalOcean's daily backups |
| `BACKUP_REMOTE` | backup.sh | Optional rclone remote for extra copies; empty is fine |
| `BACKUP_CHECK` | api | `true` to alert when backups or the monthly restore drill stop succeeding |
| `OPS_ALERT_EMAIL` | api | Inbox for error and stalled-job alerts |
| `OPS_REPORT_TOKEN` | api, web | Shared secret for the web server to report its errors |
| `SITE_URL`, `CORS_ORIGINS` | API | Public address, used in emails and CORS |
| `JWT_SECRET` | API | Signs sessions and unsubscribe links. Changing it signs everyone out |
| `ADMIN_API_KEY` | API | For scripts calling `/v1/admin/*` |
| `ADMIN_EMAILS` | API | Editors who can open `/admin` |
| `OTP_DELIVERY`, `ZEPTOMAIL_TOKEN`, `OTP_FROM_EMAIL` | API | Email delivery through ZeptoMail. `OTP_FROM_EMAIL` like `"Foundura <login@foundura.org>"`, on the verified domain |
| `ZEPTOMAIL_API_URL` | API | Defaults to ZeptoMail's India address; leave it |
| `SCHEDULED_EMAILS` | API | Weekly scheme alerts (Mondays 8:00 India time) and yearly terms reminders |
| `LEGAL_ENTITY_NAME`, `LEGAL_ADDRESS`, `LEGAL_JURISDICTION_CITY`, `GRIEVANCE_OFFICER_NAME`, `GRIEVANCE_EMAIL`, `SUPPORT_EMAIL` | web | Shown on `/privacy` and `/terms`; read at request time, so a restart is enough to change them |
| `TRUST_PROXY` | API | Set to 1 by compose: the web server is the one proxy in front of the API |
| `NEXT_PUBLIC_SITE_URL` | web (build) | Baked into links, the sitemap and share images. CI builds for `https://foundura.org`; another domain needs its own build (`docker-compose.build.yml`) |

## Later: a managed database

If Foundura outgrows one server, move the database to DigitalOcean's managed PostgreSQL ($15 a month and up). The scripts support it already; `up.sh` and the backup scripts switch over as soon as `DATABASE_URL` is set.

1. Databases → Create → PostgreSQL, in BLR1 and the Droplet's VPC.
   - Edition: **Standard** (it gives you a CA certificate to verify the server; Advanced doesn't).
   - Version: **17** (if you pick a newer one, set `PG_TOOLS_IMAGE` to match, e.g. `postgres:18-alpine`).
   - Under **Trusted sources**, add the Droplet. Nothing else can connect.
   - On Users & Databases, add a user `foundura` and a database `foundura`.
2. Download the cluster's CA certificate to `/srv/foundura/deploy/certs/db-ca.crt`.
3. Make `foundura` the owner of its database, connecting as `doadmin`:
   ```bash
   docker run --rm -it -v /srv/foundura/deploy/certs:/certs:ro postgres:17-alpine psql \
     "postgresql://doadmin:<password>@private-<cluster>.db.ondigitalocean.com:25060/foundura?sslmode=verify-full&sslrootcert=/certs/db-ca.crt" \
     -c "alter database foundura owner to foundura" -c "alter schema public owner to foundura"
   ```
4. Take a fresh dump (`./deploy/backup.sh`), stop the app, set `DATABASE_URL` to the **private** connection string with verified SSL:
   ```
   DATABASE_URL=postgresql://foundura:<password>@private-<cluster>.db.ondigitalocean.com:25060/foundura?sslmode=verify-full&sslrootcert=/certs/db-ca.crt
   ```
   then restore the dump with `./deploy/restore.sh backups/foundura-YYYY-MM-DD.dump --replace-live` and run `./deploy/up.sh`.

DigitalOcean then also keeps its own backups of the cluster and can restore it to any moment in the last 7 days, into a new cluster. CI tests this setup on every push with a stand-in database that only accepts verified SSL.

## Running without Docker

Any host that runs Node 22 and Postgres 16 works:

1. Run `pnpm install && pnpm --filter @foundura/shared build && pnpm build`.
2. Run `pnpm --filter @foundura/api db:migrate:prod` and `db:seed:prod`.
3. Start the API with `node apps/api/dist/src/main.js`.
4. Start the web app with `node apps/web/.next/standalone/apps/web/server.js`, after copying `.next/static` and `public` next to it.

Keep the API private, and set `TRUST_PROXY` to the number of proxies in front of it.
