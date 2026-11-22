#!/bin/sh
# Restore a backup into a database.
#
#   ./deploy/restore.sh backups/foundura-2026-11-22.dump                 # into foundura_restore (safe to try)
#   ./deploy/restore.sh backups/foundura-2026-11-22.dump some_db_name
#   ./deploy/restore.sh backups/foundura-2026-11-22.dump foundura --replace-live
#
# Restoring over the live database needs --replace-live. Stop the api and web services first
# (docker compose -f docker-compose.prod.yml stop api web), restore, then start them again.
# To use an off-site copy: rclone copy "$BACKUP_REMOTE/foundura-YYYY-MM-DD.dump" backups/
set -eu
cd "$(dirname "$0")/.."
. deploy/lib.sh

FILE=${1:?usage: restore.sh <backups/foundura-YYYY-MM-DD.dump> [database] [--replace-live]}
TARGET=${2:-foundura_restore}
[ -f "$FILE" ] || { echo "No such file: $FILE"; exit 1; }
case $FILE in "$BACKUP_DIR"/*) ;; *) echo "Put the dump in $BACKUP_DIR first (the database container only sees that folder)."; exit 1 ;; esac
echo "$TARGET" | grep -Eq '^[a-z_][a-z0-9_]*$' || { echo "Database names are lower-case letters, digits and _"; exit 1; }
if [ "$TARGET" = "$DB_NAME" ] && [ "${3:-}" != "--replace-live" ]; then
  echo "That is the live database. Add --replace-live if you really mean to overwrite it."
  exit 1
fi

IN_DB="$DB_BACKUP_DIR/${FILE#"$BACKUP_DIR"/}"
log "restoring $FILE into $TARGET"
if [ "$TARGET" = "$DB_NAME" ]; then
  db pg_restore -U "$DB_USER" -d "$TARGET" --clean --if-exists --no-owner --exit-on-error "$IN_DB"
else
  sql "drop database if exists $TARGET" postgres
  sql "create database $TARGET owner $DB_USER" postgres
  db pg_restore -U "$DB_USER" -d "$TARGET" --no-owner --exit-on-error "$IN_DB"
fi
log "restored into $TARGET"
