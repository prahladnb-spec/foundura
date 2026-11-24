# Shared by backup.sh, restore.sh and restore-drill.sh. Sourced, not run.
#
# Three ways to reach the database, picked automatically:
#   managed  DATABASE_URL is set in .env.production (a managed cluster, e.g. DigitalOcean). The
#            Postgres tools run in a one-off container (PG_TOOLS_IMAGE) that sees ./backups at
#            /backups and the CA certificate at /certs. Scratch restores go into a throwaway
#            Postgres container on this server, never into the managed cluster.
#   selfdb   No DATABASE_URL: Postgres runs on this server (docker-compose.selfdb.yml) and the
#            tools run inside its container.
#   local    FOUNDURA_LOCAL_DB=1: tools run directly against a local Postgres (PGHOST, PGUSER,
#            PGPASSWORD as usual). Used to test these scripts.

DB_NAME=${DB_NAME:-foundura}
DB_USER=${DB_USER:-foundura}
BACKUP_DIR=${BACKUP_DIR:-./backups}

# A setting from .env.production, unless already set in the environment.
setting() {
  eval "current=\${$1:-}"
  if [ -n "$current" ]; then printf '%s' "$current"; return; fi
  if [ -f .env.production ]; then sed -n "s/^$1=//p" .env.production | tail -1 | sed 's/^"\(.*\)"$/\1/'; fi
}

# Days of dumps to keep. The privacy notice promises deleted data leaves backups within 14 days, so with
# DigitalOcean's daily server backups (kept 7 days, and each holds these dumps too) set KEEP_DAYS=6.
KEEP_DAYS=$(setting KEEP_DAYS); KEEP_DAYS=${KEEP_DAYS:-14}
case "$KEEP_DAYS" in ''|*[!0-9]*) echo "KEEP_DAYS must be a whole number of days" >&2; exit 1 ;; esac

if [ "${FOUNDURA_LOCAL_DB:-}" = "1" ]; then
  DB_MODE=local
else
  DATABASE_URL=$(setting DATABASE_URL)
  if [ -n "$DATABASE_URL" ]; then DB_MODE=managed; else DB_MODE=selfdb; fi
fi
PG_TOOLS_IMAGE=$(setting PG_TOOLS_IMAGE)
PG_TOOLS_IMAGE=${PG_TOOLS_IMAGE:-postgres:17-alpine}
export DATABASE_URL
# Keep notices ("does not exist, skipping") out of the logs.
export PGOPTIONS="-c client_min_messages=warning"

COMPOSE="docker compose -f docker-compose.prod.yml -f docker-compose.selfdb.yml --env-file .env.production"

# Where dumps live as the database tools see them.
case $DB_MODE in
  local) DB_BACKUP_DIR=$BACKUP_DIR ;;
  *) DB_BACKUP_DIR=/backups ;;
esac

# Run a command where the Postgres tools and the backups folder are. File changes happen there too,
# so they work whichever user runs these scripts (dumps written in a container are owned by root).
tools() {
  case $DB_MODE in
    local) "$@" ;;
    selfdb) $COMPOSE exec -T -e "PGOPTIONS=$PGOPTIONS" db "$@" ;;
    managed)
      mkdir -p "$BACKUP_DIR"
      docker run --rm -i -e DATABASE_URL -e PGOPTIONS -v "$(cd "$BACKUP_DIR" && pwd):/backups" -v "$(pwd)/deploy/certs:/certs:ro" "$PG_TOOLS_IMAGE" "$@"
      ;;
  esac
}

# Run a Postgres tool against the live database. The address stays in the environment, out of
# process listings.
live() {
  case $DB_MODE in
    managed) tools sh -c 'exec "$@" -d "$DATABASE_URL"' sh "$@" ;;
    *) tools "$@" -U "$DB_USER" -d "$DB_NAME" ;;
  esac
}

sql() { live psql -v ON_ERROR_STOP=1 -qAt -c "$1"; }

log() { echo "$(date -Iseconds) $*"; }

# A scratch copy of the database to restore into: another database on the same Postgres (local,
# selfdb), or a throwaway container (managed). $1 is its name.
scratch_container() { echo "foundura-$(echo "$1" | tr _ -)"; }

scratch_create() {
  case $DB_MODE in
    managed)
      c=$(scratch_container "$1")
      docker rm -f "$c" >/dev/null 2>&1 || true
      docker run -d --name "$c" -e POSTGRES_PASSWORD=scratch -e POSTGRES_DB="$1" \
        -v "$(cd "$BACKUP_DIR" && pwd):/backups:ro" "$PG_TOOLS_IMAGE" >/dev/null
      # The image's first start runs an init step and restarts the server; wait for the real one.
      for _ in $(seq 1 60); do
        docker exec "$c" psql -U postgres -d "$1" -qAt -c "select 1" >/dev/null 2>&1 && [ "$(docker logs "$c" 2>&1 | grep -c 'ready to accept connections')" -ge 2 ] && return 0
        sleep 1
      done
      echo "The scratch Postgres container didn't start"; return 1
      ;;
    *)
      sql "drop database if exists $1" >/dev/null
      sql "create database $1" >/dev/null
      ;;
  esac
}

scratch_restore() { # $1 name, $2 dump path as the tools see it
  case $DB_MODE in
    managed) docker exec "$(scratch_container "$1")" pg_restore -U postgres -d "$1" --no-owner --no-acl --exit-on-error "$2" ;;
    *) tools pg_restore -U "$DB_USER" -d "$1" --no-owner --no-acl --exit-on-error "$2" ;;
  esac
}

scratch_sql() { # $1 name, $2 query
  case $DB_MODE in
    managed) docker exec "$(scratch_container "$1")" psql -U postgres -d "$1" -v ON_ERROR_STOP=1 -qAt -c "$2" ;;
    *) tools psql -U "$DB_USER" -d "$1" -v ON_ERROR_STOP=1 -qAt -c "$2" ;;
  esac
}

scratch_drop() {
  case $DB_MODE in
    managed) docker rm -f "$(scratch_container "$1")" >/dev/null 2>&1 || true ;;
    *) sql "drop database if exists $1" >/dev/null 2>&1 || true ;;
  esac
}

# Record a run in job_runs, so the API emails an alert if backups stop (BACKUP_CHECK=true).
# Never lets a bookkeeping failure hide the real result.
mark_job() {
  name=$1; state=$2; msg=$(printf '%s' "${3:-}" | tr "'" '"' | cut -c1-500)
  case $state in
    start) q="insert into job_runs (name, last_started_at) values ('$name', now()) on conflict (name) do update set last_started_at = now()" ;;
    ok) q="update job_runs set last_success_at = now() where name = '$name'" ;;
    error) q="update job_runs set last_error_at = now(), last_error = '$msg' where name = '$name'" ;;
  esac
  sql "$q" >/dev/null 2>&1 || log "warning: could not record $name $state in job_runs"
}
