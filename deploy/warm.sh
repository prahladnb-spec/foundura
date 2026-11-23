#!/usr/bin/env bash
# Loads every page in the sitemap once, right after a deploy, so visitors never hit a page while
# it is being generated for the first time (which is slower, and can make the browser briefly
# re-render the page). Safe to run any time; it only reads pages.
#
#   ./deploy/warm.sh                       # uses SITE_URL from .env.production
#   ./deploy/warm.sh https://foundura.org  # or any base URL
set -euo pipefail

base=${1:-}
if [ -z "$base" ] && [ -f .env.production ]; then
  base=$(grep -E '^SITE_URL=' .env.production | tail -1 | cut -d= -f2- | tr -d '"'"'")
fi
base=${base%/}
[ -n "$base" ] || { echo "usage: $0 https://your-site" >&2; exit 2; }

# Wait up to two minutes for the web app, API and database to report healthy.
for _ in $(seq 1 60); do
  curl -fsS "$base/api/health" >/dev/null 2>&1 && break
  sleep 2
done
curl -fsS "$base/api/health" >/dev/null || { echo "site is not healthy at $base/api/health" >&2; exit 1; }

urls=$(curl -fsS "$base/sitemap.xml" | grep -oE '<loc>[^<]+</loc>' | sed -E 's#</?loc>##g; s#^https?://[^/]+##' | sed "s#^#$base#")
total=$(printf '%s\n' "$urls" | grep -c . || true)
start=$(date +%s)
# Two at a time: enough to finish in under a minute, gentle on a small server.
failed=$(printf '%s\n' "$urls" | xargs -n1 -P2 curl -s -o /dev/null -w '%{http_code} %{url_effective}\n' | grep -v '^200 ' || true)

echo "Warmed $total pages in $(( $(date +%s) - start ))s."
if [ -n "$failed" ]; then
  echo "These did not return 200:" >&2
  printf '%s\n' "$failed" >&2
  exit 1
fi
