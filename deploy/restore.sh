#!/bin/sh
# Restore a backup.
#
#   ./deploy/restore.sh backups/foundura-2026-11-22.dump                  # into a scratch copy to look at
#   ./deploy/restore.sh backups/foundura-2026-11-22.dump --replace-live   # over the live database
#
# The scratch copy is a database called foundura_restore (Postgres on this server) or a container
# called foundura-restore (managed database); the script prints how to open it.
#
# Before --replace-live, stop the app (docker compose -f docker-compose.prod.yml stop api web) and
# start it again afterwards. With a managed database, the provider's point-in-time restore is
# usually the better way to roll back (see DEPLOY.md).
# To use an off-site copy first: rclone copy "<BACKUP_REMOTE>/foundura-YYYY-MM-DD.dump" backups/
set -eu
cd "$(dirname "$0")/.."
. deploy/lib.sh

FILE=${1:?usage: restore.sh <backups/foundura-YYYY-MM-DD.dump> [--replace-live]}
[ -f "$FILE" ] || { echo "No such file: $FILE"; exit 1; }
case $FILE in "$BACKUP_DIR"/*) ;; *) echo "Put the dump in $BACKUP_DIR first (the database tools only see that folder)."; exit 1 ;; esac
IN_DB="$DB_BACKUP_DIR/${FILE#"$BACKUP_DIR"/}"

if [ "${2:-}" = "--replace-live" ]; then
  log "restoring $FILE over the live database"
  live pg_restore --clean --if-exists --no-owner --no-acl --exit-on-error "$IN_DB"
  log "restored over the live database"
  exit 0
fi
[ -z "${2:-}" ] || { echo "Unknown option: $2"; exit 1; }

SCRATCH=foundura_restore
log "restoring $FILE into a scratch copy"
scratch_create "$SCRATCH"
scratch_restore "$SCRATCH" "$IN_DB"
log "restored. Open it with:"
case $DB_MODE in
  managed) echo "  docker exec -it $(scratch_container $SCRATCH) psql -U postgres -d $SCRATCH     (remove with: docker rm -f $(scratch_container $SCRATCH))" ;;
  selfdb) echo "  $COMPOSE exec db psql -U $DB_USER -d $SCRATCH     (remove with: drop database $SCRATCH)" ;;
  local) echo "  psql -d $SCRATCH" ;;
esac
