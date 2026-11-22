#!/bin/sh
# Monthly restore drill: proves the newest backup can actually be restored. Add to crontab:
#   40 3 1 * * cd /srv/foundura && ./deploy/restore-drill.sh >> backups/backup.log 2>&1
#
# Restores the newest dump into a scratch copy (never the live database), checks that every table
# is there, the migrations match live, and the main tables have rows. Prints row counts side by
# side, removes the scratch copy, and records the result (alerts if the drill stops passing).
set -eu
cd "$(dirname "$0")/.."
. deploy/lib.sh
SCRATCH=foundura_restore_check

mark_job restore_drill start
fail() { log "restore drill FAILED: $1"; mark_job restore_drill error "$1"; scratch_drop "$SCRATCH"; exit 1; }

LATEST=$(ls -1 "$BACKUP_DIR"/foundura-*.dump 2>/dev/null | sort | tail -1)
[ -n "$LATEST" ] || fail "no backups in $BACKUP_DIR"
AGE_DAYS=$(( ($(date +%s) - $(date -r "$LATEST" +%s)) / 86400 ))
[ "$AGE_DAYS" -le 2 ] || fail "the newest backup, $LATEST, is $AGE_DAYS days old"

scratch_create "$SCRATCH" || fail "could not start a scratch database"
scratch_restore "$SCRATCH" "$DB_BACKUP_DIR/$(basename "$LATEST")" >/dev/null || fail "could not restore $LATEST"

TABLES="select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by 1"
LIVE_TABLES=$(sql "$TABLES")
[ "$(scratch_sql "$SCRATCH" "$TABLES")" = "$LIVE_TABLES" ] || fail "the restored tables don't match the live database"

MIGRATIONS="select count(*) || ':' || coalesce(max(hash), '') from drizzle.__drizzle_migrations"
[ "$(scratch_sql "$SCRATCH" "$MIGRATIONS")" = "$(sql "$MIGRATIONS")" ] || fail "the restored database is at a different migration than live"

printf '%-28s %10s %10s\n' table restored live
for t in $LIVE_TABLES; do
  printf '%-28s %10s %10s\n' "$t" "$(scratch_sql "$SCRATCH" "select count(*) from \"$t\"")" "$(sql "select count(*) from \"$t\"")"
done
for t in schemes users; do
  [ "$(scratch_sql "$SCRATCH" "select count(*) > 0 from $t")" = "t" ] || [ "$(sql "select count(*) = 0 from $t")" = "t" ] || fail "$t is empty in the backup but not in the live database"
done

scratch_drop "$SCRATCH"
mark_job restore_drill ok
log "restore drill passed with $LATEST"
