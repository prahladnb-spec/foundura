#!/bin/sh
# Daily database backup, run from the server's crontab, for example:
#   15 2 * * * cd /srv/foundura && ./deploy/backup.sh >> backups/backup.log 2>&1
# Keeps 14 days locally. Copy the backups folder off the server too (object storage in an Indian region).
set -eu
STAMP=$(date +%Y-%m-%d)
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T db \
  pg_dump -U foundura -d foundura --format=custom --file=/backups/foundura-$STAMP.dump
find ./backups -name 'foundura-*.dump' -mtime +14 -delete
echo "$(date -Iseconds) backup foundura-$STAMP.dump done"
