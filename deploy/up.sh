#!/usr/bin/env bash
# Starts or updates Foundura on this server: pulls the images GitHub built, applies migrations, restarts what
# changed, then loads every page once. Run from /srv/foundura for the first start and for every update.
#   ./deploy/up.sh
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env.production ] || { echo "missing .env.production (copy .env.production.example and fill it in)" >&2; exit 1; }

# Postgres on this server unless a managed database is configured.
database_url=$(sed -n 's/^DATABASE_URL=//p' .env.production | tail -1 | sed 's/^"\(.*\)"$/\1/')
files=(-f docker-compose.prod.yml)
[ -z "$database_url" ] && files+=(-f docker-compose.selfdb.yml)
compose=(docker compose "${files[@]}" --env-file .env.production)

"${compose[@]}" pull --quiet
"${compose[@]}" up -d --remove-orphans
# Old images pile up with every update; the disk is small.
docker image prune -f >/dev/null

site=$(sed -n 's/^SITE_URL=//p' .env.production | tail -1 | tr -d '"')
./deploy/warm.sh "$site"
