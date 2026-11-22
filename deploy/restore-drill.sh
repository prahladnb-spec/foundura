#!/bin/sh
# Monthly restore drill: proves the newest backup can actually be restored. Add to crontab:
#   40 3 1 * * cd /srv/foundura && ./deploy/restore-drill.sh >> backups/backup.log 2>&1
#
# Restores the newest dump into a scratch database, then checks that every table is there, the
# migrations match the live database, and the main tables have rows. Prints row counts side by
# side, drops the scratch database, and records the result (alerts if the drill stops passing).
set -eu
cd "$(dirname "$0")/.."
. deploy/lib.sh
SCRATCH=foundura_restore_check

mark_job restore_drill start
fail() { log "restore drill FAILED: $1"; mark_job restore_drill error "$1"; sql "drop database if exists $SCRATCH" postgres >/dev/null 2>&1 || true; exit 1; }

LATEST=$(ls -1 "$BACKUP_DIR"/foundura-*.dump 2>/dev/null | sort | tail -1)
[ -n "$LATEST" ] || fail "no backups in $BACKUP_DIR"
AGE_DAYS=$(( ($(date +%s) - $(date -r "$LATEST" +%s)) / 86400 ))
[ "$AGE_DAYS" -le 2 ] || fail "the newest backup, $LATEST, is $AGE_DAYS days old"

./deploy/restore.sh "$LATEST" "$SCRATCH" >/dev/null || fail "could not restore $LATEST"

TABLES="select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by 1"
LIVE_TABLES=$(sql "$TABLES")
[ "$(sql "$TABLES" "$SCRATCH")" = "$LIVE_TABLES" ] || fail "the restored tables don't match the live database"

MIGRATIONS="select count(*) || ':' || coalesce(max(hash), '') from drizzle.__drizzle_migrations"
[ "$(sql "$MIGRATIONS" "$SCRATCH")" = "$(sql "$MIGRATIONS")" ] || fail "the restored database is at a different migration than live"

printf '%-28s %10s %10s\n' table restored live
for t in $LIVE_TABLES; do
  r=$(sql "select count(*) from \"$t\"" "$SCRATCH"); l=$(sql "select count(*) from \"$t\"")
  printf '%-28s %10s %10s\n' "$t" "$r" "$l"
done
for t in schemes users; do
  [ "$(sql "select count(*) > 0 from $t" "$SCRATCH")" = "t" ] || [ "$(sql "select count(*) = 0 from $t")" = "t" ] || fail "$t is empty in the backup but not in the live database"
done

sql "drop database $SCRATCH" postgres
mark_job restore_drill ok
log "restore drill passed with $LATEST"
