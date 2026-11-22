# Shared by backup.sh, restore.sh and restore-drill.sh. Sourced, not run.
#
# On the server the database tools run inside the db container (docker-compose.prod.yml), where
# ./backups is mounted at /backups. Set FOUNDURA_LOCAL_DB=1 to run them directly against a local
# Postgres instead (PGHOST, PGPORT, PGUSER, PGPASSWORD as usual); used to test these scripts.

DB_NAME=${DB_NAME:-foundura}
DB_USER=${DB_USER:-foundura}
BACKUP_DIR=${BACKUP_DIR:-./backups}
KEEP_DAYS=${KEEP_DAYS:-14}

if [ "${FOUNDURA_LOCAL_DB:-}" = "1" ]; then
  DB_BACKUP_DIR=$BACKUP_DIR
  db() { "$@"; }
else
  DB_BACKUP_DIR=/backups
  db() { docker compose -f docker-compose.prod.yml --env-file .env.production exec -T db "$@"; }
fi

sql() { PGOPTIONS="-c client_min_messages=warning" db psql -U "$DB_USER" -d "${2:-$DB_NAME}" -v ON_ERROR_STOP=1 -qAt -c "$1"; }

log() { echo "$(date -Iseconds) $*"; }

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
