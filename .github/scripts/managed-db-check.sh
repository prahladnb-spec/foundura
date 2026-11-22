#!/bin/sh
# CI: the DigitalOcean-style setup end to end. A stand-in "managed" Postgres with its own certificate
# authority that only accepts SSL connections; the app connects with sslmode=verify-full and the
# CA file, as on DigitalOcean. Then migrations, a backup and a restore drill run against it.
set -eu
WORK=$(mktemp -d)
HOST=$(hostname -I | awk '{print $1}')   # this machine, as the containers reach it
PORT=25060
PW=$(openssl rand -hex 16)

# Certificate authority and a server certificate for $HOST, like a provider's cluster certificate.
openssl req -x509 -newkey rsa:2048 -nodes -days 2 -subj "/CN=Stand-in managed DB CA" -keyout "$WORK/ca.key" -out "$WORK/ca.crt" 2>/dev/null
openssl req -newkey rsa:2048 -nodes -subj "/CN=$HOST" -keyout "$WORK/server.key" -out "$WORK/server.csr" 2>/dev/null
printf 'subjectAltName=IP:%s\n' "$HOST" > "$WORK/san.ext"
openssl x509 -req -in "$WORK/server.csr" -CA "$WORK/ca.crt" -CAkey "$WORK/ca.key" -CAcreateserial -days 2 -extfile "$WORK/san.ext" -out "$WORK/server.crt" 2>/dev/null
printf 'local all all trust\nhostssl all all all scram-sha-256\n' > "$WORK/pg_hba.conf"

docker run -d --name stand-in-managed-db -p "$PORT:5432" -v "$WORK:/in:ro" \
  -e POSTGRES_USER=foundura -e POSTGRES_PASSWORD="$PW" -e POSTGRES_DB=foundura \
  --entrypoint sh postgres:17-alpine -c '
    mkdir -p /ssl && cp /in/server.crt /in/server.key /in/pg_hba.conf /ssl/ &&
    chown -R postgres /ssl && chmod 600 /ssl/server.key &&
    exec docker-entrypoint.sh postgres -c ssl=on -c ssl_cert_file=/ssl/server.crt -c ssl_key_file=/ssl/server.key -c hba_file=/ssl/pg_hba.conf'
for _ in $(seq 1 60); do
  [ "$(docker logs stand-in-managed-db 2>&1 | grep -c 'ready to accept connections')" -ge 2 ] && break
  sleep 1
done

mkdir -p deploy/certs && cp "$WORK/ca.crt" deploy/certs/db-ca.crt
cp .env.production.example .env.production
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://foundura:$PW@$HOST:$PORT/foundura?sslmode=verify-full\&sslrootcert=/certs/db-ca.crt|" .env.production
compose="docker compose -f docker-compose.prod.yml --env-file .env.production"
$compose config --quiet

echo "--- unencrypted connections are refused"
if docker run --rm postgres:17-alpine psql "postgresql://foundura:$PW@$HOST:$PORT/foundura?sslmode=disable" -c "select 1" >/dev/null 2>&1; then
  echo "the stand-in database accepted a connection without SSL"; exit 1
fi
echo "--- a certificate from another authority is refused"
openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj "/CN=Someone else" -keyout "$WORK/other.key" -out "$WORK/other.crt" 2>/dev/null
if docker run --rm -v "$WORK:/c:ro" postgres:17-alpine psql "postgresql://foundura:$PW@$HOST:$PORT/foundura?sslmode=verify-full&sslrootcert=/c/other.crt" -c "select 1" >/dev/null 2>&1; then
  echo "verify-full accepted a server certificate from the wrong authority"; exit 1
fi

echo "--- migrations over verified SSL (the app's database driver)"
$compose run --rm migrate
echo "--- backup and restore drill (the Postgres tools, verified SSL)"
./deploy/backup.sh
./deploy/restore-drill.sh
test "$(docker run --rm -e DATABASE_URL="$(sed -n 's/^DATABASE_URL=//p' .env.production)" -v "$PWD/deploy/certs:/certs:ro" postgres:17-alpine \
  sh -c 'psql -d "$DATABASE_URL" -Atc "select count(*) from job_runs where name in ('"'backup', 'restore_drill'"') and last_success_at is not null"')" = 2
test -z "$(docker ps -aq --filter name=foundura-restore-check)" || { echo "the drill left its scratch container behind"; exit 1; }

docker rm -f stand-in-managed-db >/dev/null
rm -rf "$WORK" deploy/certs backups .env.production
echo "managed database check passed"
