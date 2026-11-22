#!/bin/sh
# Daily database backup. Add to the server's crontab:
#   15 2 * * * cd /srv/foundura && ./deploy/backup.sh >> backups/backup.log 2>&1
#
# 1. Dumps the database to backups/foundura-YYYY-MM-DD.dump (Postgres custom format).
# 2. Checks the dump can be read back.
# 3. If BACKUP_REMOTE is set (an rclone remote and path, e.g. "foundura-offsite:foundura-backups"),
#    copies it off the server and removes off-site copies older than KEEP_DAYS.
# 4. Removes local dumps older than KEEP_DAYS (14), matching what the privacy notice promises.
# 5. Records the run, so the API emails an alert if backups stop (BACKUP_CHECK=true).
set -eu
cd "$(dirname "$0")/.."
. deploy/lib.sh
[ -f .env.production ] && BACKUP_REMOTE=${BACKUP_REMOTE:-$(sed -n 's/^BACKUP_REMOTE=//p' .env.production | tr -d '"')}

STAMP=$(date +%Y-%m-%d)
NAME=foundura-$STAMP.dump
mkdir -p "$BACKUP_DIR"

mark_job backup start
fail() { log "backup failed: $1"; mark_job backup error "$1"; exit 1; }

db pg_dump -U "$DB_USER" -d "$DB_NAME" --format=custom --file="$DB_BACKUP_DIR/$NAME.partial" || fail "pg_dump failed"
TABLES=$(db pg_restore --list "$DB_BACKUP_DIR/$NAME.partial" | grep -c " TABLE DATA public " || true)
[ "$TABLES" -gt 0 ] || fail "the dump has no table data"
# File changes happen where the dump was written (inside the container on the server), so they work
# whichever user runs this script.
db mv "$DB_BACKUP_DIR/$NAME.partial" "$DB_BACKUP_DIR/$NAME"
log "dumped $NAME ($(du -h "$BACKUP_DIR/$NAME" | cut -f1), $TABLES tables)"

if [ -n "${BACKUP_REMOTE:-}" ]; then
  command -v rclone >/dev/null || fail "BACKUP_REMOTE is set but rclone isn't installed"
  rclone copy "$BACKUP_DIR/$NAME" "$BACKUP_REMOTE" || fail "copy to $BACKUP_REMOTE failed"
  rclone delete "$BACKUP_REMOTE" --min-age "$((KEEP_DAYS + 1))d" --include 'foundura-*.dump' || fail "pruning $BACKUP_REMOTE failed"
  log "copied to $BACKUP_REMOTE"
else
  log "warning: BACKUP_REMOTE isn't set, so this backup exists only on this server"
fi

db find "$DB_BACKUP_DIR" -name 'foundura-*.dump' -mtime +"$KEEP_DAYS" -delete
db find "$DB_BACKUP_DIR" -name 'foundura-*.dump.partial' -mmin +60 -delete
mark_job backup ok
log "backup $NAME done"
