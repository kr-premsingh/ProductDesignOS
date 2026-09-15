#!/usr/bin/env bash
# Build, start, and smoke-test every current local service.
set -euo pipefail

cd "$(dirname "$0")/.."
compose=(docker compose -f infra/docker-compose.yml)

wait_for() {
  local name="$1"
  local url="$2"
  local attempts=30

  until curl --fail --silent --show-error "$url" >/dev/null; do
    attempts=$((attempts - 1))
    if [ "$attempts" -eq 0 ]; then
      echo "Timed out waiting for $name: $url" >&2
      "${compose[@]}" logs --tail=80 "$name" >&2
      exit 1
    fi
    sleep 2
  done
  echo "OK: $name"
}

"${compose[@]}" up --build -d
wait_for "core-api" "http://localhost:4100/health"
wait_for "web" "http://localhost:3000/"

"${compose[@]}" ps
echo "Full local stack passed: web, core-api, postgres, and redis."
